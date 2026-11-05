#!/usr/bin/env python3
"""Validate the static site structure before deployment."""
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
        self.h1_count = 0
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "h1":
            self.h1_count += 1
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
    if candidate.is_dir() or str(raw_path).endswith("/"):
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
    sitemap = ROOT / "sitemap.xml"
    if not sitemap.is_file():
        fail("sitemap.xml is missing")
    else:
        tree = ET.parse(sitemap)
        urls = [node.text.strip() for node in tree.findall(".//{*}loc") if node.text]
        if not urls:
            fail("sitemap.xml contains no URLs")
        for url in urls:
            parsed = urlparse(url)
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
            canonical = [x for x in content.splitlines() if 'rel="canonical"' in x]
            if len(canonical) != 1 or url not in canonical[0]:
                fail(f"{page_path.relative_to(ROOT)} must have one canonical matching {url}")
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
            if "action=" in content and 'action="mailto:' in content:
                WARNINGS.append(f"Email-app-only form found in {page_path.relative_to(ROOT)}")

    if not (ROOT / "wrangler.toml").is_file():
        fail("wrangler.toml is missing")
    if not (ROOT / "_redirects").is_file():
        fail("Cloudflare _redirects file is missing")
    if not (ROOT / "404.html").is_file():
        fail("Custom 404.html is missing")

    for warning in WARNINGS:
        print(f"WARNING: {warning}")
    if ERRORS:
        for error in ERRORS:
            print(f"ERROR: {error}")
        print(f"Validation failed: {len(ERRORS)} error(s), {len(WARNINGS)} warning(s).")
        return 1
    print(f"Validation passed: sitemap pages and local references are present. {len(WARNINGS)} warning(s).")
    return 0

if __name__ == "__main__":
    sys.exit(main())
