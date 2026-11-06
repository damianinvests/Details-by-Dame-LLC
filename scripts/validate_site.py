#!/usr/bin/env python3
"""Validate the static site structure, SEO basics, media markup, and redirects."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SITE_HOSTS = {"detailsbydame.com", "www.detailsbydame.com"}
ERRORS = []
WARNINGS = []


class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []
        self.images = []
        self.h1_count = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "h1":
            self.h1_count += 1
        if tag == "img":
            self.images.append(attrs)
        for attr in ("href", "src", "poster"):
            value = attrs.get(attr)
            if value:
                self.refs.append(value)
        srcset = attrs.get("srcset", "")
        for candidate in srcset.split(","):
            value = candidate.strip().split(" ")[0] if candidate.strip() else ""
            if value:
                self.refs.append(value)


def resolve_local_reference(source_file: Path, value: str):
    value = value.strip()
    if not value or value.startswith(("#", "data:", "mailto:", "tel:", "javascript:")):
        return None
    parsed = urlparse(value)
    if parsed.scheme and parsed.hostname not in SITE_HOSTS:
        return None
    if parsed.hostname and parsed.hostname not in SITE_HOSTS:
        return None
    raw_path = parsed.path
    if not raw_path:
        return None
    if raw_path.startswith("/"):
        candidate = ROOT / raw_path.lstrip("/")
    else:
        candidate = source_file.parent / raw_path
    candidate = candidate.resolve()
    try:
        candidate.relative_to(ROOT.resolve())
    except ValueError:
        return None
    if candidate.is_dir() or raw_path.endswith("/"):
        candidate = candidate / "index.html"
    elif not candidate.suffix:
        if candidate.with_suffix(".html").is_file():
            candidate = candidate.with_suffix(".html")
        elif (candidate / "index.html").is_file():
            candidate = candidate / "index.html"
    return candidate


def fail(message):
    ERRORS.append(message)


def main():
    urls = []
    sitemap = ROOT / "sitemap.xml"
    if not sitemap.is_file():
        fail("sitemap.xml is missing")
    else:
        tree = ET.parse(sitemap)
        urls = [node.text.strip() for node in tree.findall(".//{*}loc") if node.text]
        if not urls:
            fail("sitemap.xml contains no URLs")
        sitemap_paths = set()
        for url in urls:
            parsed = urlparse(url)
            sitemap_paths.add(parsed.path)
            if parsed.hostname != "detailsbydame.com" or parsed.scheme != "https":
                fail(f"Non-canonical sitemap URL: {url}")
            page_path = ROOT / parsed.path.lstrip("/")
            if not parsed.path or parsed.path.endswith("/"):
                page_path = page_path / "index.html"
            elif not page_path.suffix:
                page_path = page_path.with_suffix(".html")
            if not page_path.is_file():
                fail(f"Sitemap URL has no matching file: {url}")
                continue
            content = page_path.read_text(encoding="utf-8")
            parser = References()
            parser.feed(content)
            if parser.h1_count != 1:
                fail(f"{page_path.relative_to(ROOT)} should have exactly one H1 (found {parser.h1_count})")
            canonical = [line for line in content.splitlines() if 'rel="canonical"' in line]
            if len(canonical) != 1 or url not in canonical[0]:
                fail(f"{page_path.relative_to(ROOT)} must have one canonical matching {url}")
            if "<title>" not in content.lower() or 'name="description"' not in content.lower():
                fail(f"{page_path.relative_to(ROOT)} is missing a title or meta description")
            for image in parser.images:
                if "alt" not in image:
                    fail(f"{page_path.relative_to(ROOT)} has an image without an alt attribute")
                image_src = image.get("src", "")
                if not image_src.endswith("details-logo.png") and (not image.get("width") or not image.get("height")):
                    fail(f"{page_path.relative_to(ROOT)} has a content image without width/height: {image_src}")
            for ref in parser.refs:
                target = resolve_local_reference(page_path, ref)
                if target is not None and not target.is_file():
                    fail(f"Broken local reference in {page_path.relative_to(ROOT)}: {ref}")
            if "3232 Albin Ln" in content:
                fail(f"Private street address found in {page_path.relative_to(ROOT)}")
            if "68 reviews" in content or "58 reviews" in content:
                WARNINGS.append(f"Hard-coded review count found in {page_path.relative_to(ROOT)}")
            if "wp-content/uploads" in content:
                WARNINGS.append(f"Legacy WordPress media URL found in {page_path.relative_to(ROOT)}")
            if 'action="mailto:' in content:
                WARNINGS.append(f"Email-app-only form found in {page_path.relative_to(ROOT)}")

        for url in urls:
            path = urlparse(url).path
            if path.startswith("/category/") or path.startswith("/tag/") or path.startswith("/car-detailing-") or path == "/faq/":
                fail(f"Non-canonical archive or retired URL found in sitemap.xml: {url}")

    if not (ROOT / "wrangler.toml").is_file():
        fail("wrangler.toml is missing")
    if not (ROOT / "_redirects").is_file():
        fail("Cloudflare _redirects file is missing")
    if not (ROOT / "404.html").is_file():
        fail("Custom 404.html is missing")

    robots = ROOT / "robots.txt"
    if robots.is_file() and "Sitemap: https://detailsbydame.com/sitemap.xml" not in robots.read_text(encoding="utf-8"):
        fail("robots.txt must reference the canonical production sitemap")

    headers = ROOT / "_headers"
    worker = ROOT / "worker.js"
    if headers.is_file() and "X-Robots-Tag" in headers.read_text(encoding="utf-8"):
        fail("_headers must not apply a global robots directive; preview noindex is host-aware in worker.js")
    if worker.is_file():
        worker_text = worker.read_text(encoding="utf-8")
        if 'url.hostname.endsWith(".workers.dev")' not in worker_text or "noindex, nofollow" not in worker_text:
            fail("worker.js must scope noindex to the temporary workers.dev preview host")

    for legacy_path in ("car-detailing-orlando/index.html", "car-detailing-union-park-fl/index.html"):
        if (ROOT / legacy_path).is_file():
            fail(f"Retired car-detailing route still has a page file despite its 301 redirect: {legacy_path}")

    redirect_file = ROOT / "_redirects"
    if redirect_file.is_file():
        for line in redirect_file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            parts = line.split()
            if len(parts) < 3:
                fail(f"Malformed redirect rule: {line}")
                continue
            source, destination, status = parts[:3]
            if status != "301":
                fail(f"Legacy path redirect should use 301: {line}")
            if source in sitemap_paths if sitemap.is_file() else False:
                fail(f"Redirect source must not also be in sitemap.xml: {source}")
            if destination.startswith("/"):
                target = ROOT / destination.lstrip("/")
                if destination.endswith("/") or not target.suffix:
                    target = target / "index.html"
                if not target.is_file():
                    fail(f"Redirect destination has no matching file: {destination}")

    for warning in WARNINGS:
        print(f"WARNING: {warning}")
    if ERRORS:
        for error in ERRORS:
            print(f"ERROR: {error}")
        print(f"Validation failed: {len(ERRORS)} error(s), {len(WARNINGS)} warning(s).")
        return 1
    print(f"Validation passed: {len(urls)} sitemap pages and local references are present. {len(WARNINGS)} warning(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
