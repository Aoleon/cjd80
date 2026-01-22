(function() {
  if (document.getElementById("cockpit-headup-loaded")) return;
  
  const marker = document.createElement("div");
  marker.id = "cockpit-headup-loaded";
  marker.style.display = "none";
  document.body.appendChild(marker);

  if (!document.getElementById("cockpit-headup-root")) {
    const cockpitRoot = document.createElement("div");
    cockpitRoot.id = "cockpit-headup-root";
    cockpitRoot.style.cssText = "position: fixed; z-index: 999998; pointer-events: none;";
    document.body.appendChild(cockpitRoot);
  }

  const cacheBuster = Date.now();
  
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/cockpit-headup/assets/index-B49Ypddk.css?v=" + cacheBuster;
  document.head.appendChild(link);

  const script = document.createElement("script");
  script.type = "module";
  script.src = "/cockpit-headup/assets/index-C5fLLyeD.js?v=" + cacheBuster;
  document.body.appendChild(script);
})();
