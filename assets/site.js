(function(){
  var menuButton=document.querySelector(".mobile-menu");
  var nav=document.querySelector(".site-nav");
  if(menuButton&&nav){
    menuButton.addEventListener("click",function(){
      var open=nav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded",open?"true":"false");
      menuButton.textContent=open?"×":"☰";
    });
  }

  var reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var stages=[].slice.call(document.querySelectorAll(".scroll-stage"));
  stages.forEach(function(stage){
    var video=stage.querySelector("video[data-scroll-video]");
    if(!video)return;
    if(reduced){
      stage.classList.add("stage-static","stage-ready");
      video.pause();
      video.removeAttribute("src");
      video.removeAttribute("data-mobile-src");
      video.load();
      return;
    }
    var state={target:0,current:0,raf:0,seeking:false,activated:false};
    var mobileQuery=window.matchMedia?window.matchMedia("(max-width:700px)"):null;
    var desktopSource=video.getAttribute("src")||"";
    var mobileSource=video.getAttribute("data-mobile-src");
    function syncSource(){
      if(!state.activated)return;
      var useMobile=!!(mobileQuery&&mobileQuery.matches&&mobileSource);
      var nextSource=useMobile?mobileSource:desktopSource;
      video.preload="auto";
      if(nextSource&&video.getAttribute("src")!==nextSource){
        state.seeking=false;
        video.setAttribute("src",nextSource);
        video.load();
      }
    }
    function activateVideo(){
      if(state.activated)return;
      state.activated=true;
      syncSource();
      video.pause();
    }
    var start=parseFloat(video.getAttribute("data-start")||"0");
    var requestedEnd=parseFloat(video.getAttribute("data-end")||"0");
    function clamp(n){return Math.max(0,Math.min(1,n));}
    function visible(){
      var route=stage.closest(".route-view");
      return !route||!route.hidden;
    }
    function getProgress(){
      if(stage.classList.contains("home-film")){
        var pageRange=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
        return clamp(window.scrollY/pageRange);
      }
      var rect=stage.getBoundingClientRect();
      var range=Math.max(1,stage.offsetHeight-window.innerHeight);
      return clamp(-rect.top/range);
    }
    function render(){
      state.raf=0;
      if(!visible())return;
      state.current+=(state.target-state.current)*0.16;
      if(video.readyState>=1){
        var end=requestedEnd>0?Math.min(requestedEnd,video.duration||requestedEnd):(video.duration||0);
        var time=start+Math.max(0,end-start)*state.current;
        if(!video.paused)video.pause();
        if(!state.seeking&&video.readyState>=2&&Math.abs(video.currentTime-time)>0.04){
          state.seeking=true;
          try{video.currentTime=time;}catch(e){state.seeking=false;}
        }
      }
      if(Math.abs(state.current-state.target)>0.001){
        state.raf=requestAnimationFrame(render);
      }
    }
    function update(){
      if(!visible()||reduced)return;
      state.target=getProgress();
      if(!state.raf)state.raf=requestAnimationFrame(render);
    }
    video.addEventListener("loadedmetadata",function(){
      video.pause();
      state.target=getProgress();
      state.current=state.target;
      var duration=video.duration||requestedEnd||start;
      var end=requestedEnd>0?Math.min(requestedEnd,duration):duration;
      var initial=start+Math.max(0,end-start)*state.target;
      try{video.currentTime=initial;}catch(e){}
      update();
    });
    video.addEventListener("loadeddata",function(){
      stage.classList.add("stage-ready");
      update();
    });
    video.addEventListener("seeked",function(){
      state.seeking=false;
      if(reduced||document.hidden||!visible())return;
      var end=requestedEnd>0?Math.min(requestedEnd,video.duration||requestedEnd):(video.duration||0);
      var desired=start+Math.max(0,end-start)*state.target;
      // A scroll update may arrive while the previous seek is decoding. Always
      // compare the decoded frame with the latest target, not only RAF progress.
      if(Math.abs(video.currentTime-desired)>0.04||Math.abs(state.current-state.target)>0.001){
        if(!state.raf)state.raf=requestAnimationFrame(render);
      }
    });
    video.addEventListener("error",function(){
      stage.classList.add("stage-video-error");
      stage.classList.remove("stage-ready");
    });
    video.addEventListener("play",function(){video.pause();});
    if(mobileQuery){
      var mediaChange=function(){syncSource();update();};
      if(mobileQuery.addEventListener)mobileQuery.addEventListener("change",mediaChange);
      else if(mobileQuery.addListener)mobileQuery.addListener(mediaChange);
    }
    // Do not fetch video bytes until the stage is near the viewport.
    // Mobile devices select their much smaller dedicated source before loading.
    video.pause();
    video.preload="none";
    video.removeAttribute("src");
    video.load();
    if("IntersectionObserver"in window){
      var videoObserver=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            activateVideo();
            videoObserver.disconnect();
            update();
          }
        });
      },{rootMargin:"500px 0px"});
      videoObserver.observe(stage);
    }else{
      activateVideo();
    }
    stage._scrubUpdate=update;
  });

  var scrollQueued=false;
  function updateStages(){
    if(scrollQueued)return;
    scrollQueued=true;
    requestAnimationFrame(function(){
      scrollQueued=false;
      stages.forEach(function(stage){if(stage._scrubUpdate)stage._scrubUpdate();});
    });
  }
  window.addEventListener("scroll",updateStages,{passive:true});
  window.addEventListener("resize",updateStages,{passive:true});
  document.addEventListener("visibilitychange",function(){
    if(document.hidden)document.querySelectorAll("video").forEach(function(video){video.pause();});
  });

  var revealNodes=[].slice.call(document.querySelectorAll(".reveal"));
  if("IntersectionObserver"in window&&!reduced){
    document.documentElement.classList.add("js");
    var observer=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){entry.target.classList.add("in-view");observer.unobserve(entry.target);}
      });
    },{threshold:0.15});
    revealNodes.forEach(function(node){observer.observe(node);});
  }else{
    revealNodes.forEach(function(node){node.classList.add("in-view");});
  }

  var forms=[].slice.call(document.querySelectorAll(".quote-form"));
  forms.forEach(function(form){
    form.addEventListener("submit",function(event){
      event.preventDefault();
      var status=form.querySelector(".form-status");
      var submitButton=form.querySelector('button[type="submit"]');
      if(submitButton)submitButton.disabled=true;
      if(status)status.textContent="Sending your quote request…";
      fetch("https://formsubmit.co/ajax/detailsbydame@gmail.com",{
        method:"POST",
        headers:{"Content-Type":"application/json","Accept":"application/json"},
        body:JSON.stringify(Object.fromEntries(new FormData(form).entries()))
      }).then(function(response){
        if(!response.ok)throw new Error("The form service returned an error.");
        return response.json();
      }).then(function(result){
        if(result.success===true||result.success==="true"){
          form.reset();
          if(status)status.textContent="Thanks — your quote request was sent. Details by Dame will be in touch.";
        }else{
          throw new Error("The form service did not confirm the submission.");
        }
      }).catch(function(){
        if(status)status.textContent="We couldn't send the form just now. Please call or text (321) 419-5434, or email detailsbydame@gmail.com.";
      }).finally(function(){
        if(submitButton)submitButton.disabled=false;
      });
    });
  });

  if(document.body.dataset.standalone==="true"){
    var views=[].slice.call(document.querySelectorAll(".route-view"));
    function currentRoute(){
      var value=window.location.hash.replace(/^#/,"");
      if(!value)return "/";
      var hashAt=value.indexOf("#");
      if(hashAt>=0)value=value.substring(0,hashAt);
      return value.charAt(0)==="/" ? value : "/"+value;
    }
    function showRoute(route,anchor){
      var found=false;
      views.forEach(function(view){
        var active=view.getAttribute("data-view")===route;
        view.hidden=!active;
        if(active)found=true;
      });
      if(!found)route="/";
      views.forEach(function(view){view.hidden=view.getAttribute("data-view")!==route;});
      document.querySelectorAll("[data-route-nav]").forEach(function(link){
        link.classList.toggle("active",link.getAttribute("data-route-nav")===route);
      });
      if(anchor){
        requestAnimationFrame(function(){
          var target=document.getElementById(anchor);
          if(target)target.scrollIntoView({behavior:reduced?"auto":"smooth",block:"start"});
          updateStages();
        });
      }else{
        window.scrollTo({top:0,behavior:"auto"});
        updateStages();
      }
    }
    document.addEventListener("click",function(event){
      var link=event.target.closest("[data-route]");
      if(!link)return;
      if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      event.preventDefault();
      var route=link.getAttribute("data-route")||"/";
      var href=link.getAttribute("href")||"";
      var anchor=href.indexOf("#")>=0?href.substring(href.indexOf("#")+1):"";
      window.location.hash=route;
      showRoute(route,anchor);
      if(nav)nav.classList.remove("is-open");
      if(menuButton){menuButton.setAttribute("aria-expanded","false");menuButton.textContent="☰";}
    });
    window.addEventListener("hashchange",function(){showRoute(currentRoute());});
    showRoute(currentRoute());
  }
})();
