const invoke = () => {
  var processed = [];

  var invokeScript = function(link) {
    if (processed.indexOf(link.href) !== -1) {
      return;
    }

    var script = document.createElement("script");
    script.async = link.hasAttribute("async");
    script.src = link.href;

    link.parentNode.insertBefore(script, link);

    processed.push(link.href);
  };

  var invokeStyle = function(link) {
    if (processed.indexOf(link.href) !== -1) {
      return;
    }

    link.rel = "stylesheet";
    link.onload = null;

    processed.push(link.href);
  };

  var invokeScripts = function() {
    document
      .querySelectorAll("link[rel='preload'][as='script']")
      .forEach(invokeScript.bind(this));
  };

  var invokeStyles = function() {
    document
      .querySelectorAll("link[rel='preload'][as='style']")
      .forEach(invokeStyle.bind(this));
  };

  invokeScripts();
  invokeStyles();
};

/*document.addEventListener("DOMContentLoaded", () => {
  const preloads = document.querySelectorAll("link[rel='preload']");
  // check every 50ms if all preloaded resources are fetched
  const interval = setInterval(() => {
    //filter unique urls    
    let links = [];
    preloads.forEach((el) => links.push(el.href));
    links = links.filter((v,i,a) => a.indexOf(v) === i);

    if(links.length === window.LOADED_ITEMS.length) {
      clearInterval(interval);
      invoke();        
    }
  }, 50);
});*/

window.addEventListener("load", invoke);
