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
    var state={target:0,current:0,raf:0,seeking:false,ready:false};
    var start=parseFloat(video.getAttribute("data-start")||"0");
    var requestedEnd=parseFloat(video.getAttribute("data-end")||"0");
    function clamp(n){return Math.max(0,Math.min(1,n));}
    function visible(){
      var route=stage.closest(".route-view");
      return !route||!route.hidden;
    }
    function getProgress(){
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
        if(!state.seeking&&video.readyState>=2&&Math.abs(video.currentTime-time)>0.045){
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
    video.addEventListener("loadedmetadata",update);
    video.addEventListener("loadeddata",function(){
      state.ready=true;
      if(!reduced)stage.classList.add("stage-ready");
      update();
    });
    video.addEventListener("seeked",function(){state.seeking=false;});
    video.addEventListener("play",function(){video.pause();});
    video.pause();
    update();
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
      var data=new FormData(form);
      var lines=[
        "Quote request from Details by Dame website preview",
        "",
        "Name: "+(data.get("name")||""),
        "Email: "+(data.get("email")||""),
        "Phone: "+(data.get("phone")||""),
        "Service: "+(data.get("service")||""),
        "Vehicle: "+(data.get("vehicle")||""),
        "",
        "Vehicle condition / goals:",
        (data.get("details")||"")
      ];
      var subject=encodeURIComponent("Vehicle detailing quote request");
      var body=encodeURIComponent(lines.join("\n"));
      var status=form.querySelector(".form-status");
      if(status)status.textContent="Opening your email app with the quote details…";
      window.location.href="mailto:detailsbydame@gmail.com?subject="+subject+"&body="+body;
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
