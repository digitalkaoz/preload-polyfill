//document.addEventListener("DOMContentLoaded", function(){
//  console.log("dom-content-loaded");

// DOMContentLoaded is too early (not all resources may be loaded at this point) for preload polyfill (but works perfect in chrome)
// can we look at all readystates of all preloads until we invoke the scripts?
window.addEventListener("load", function(){
  console.log("load");
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

  var invokeScripts = function() {
    document
      .querySelectorAll("[as='script']")
      .forEach(invokeScript.bind(this));
  };

  invokeScripts();
});
