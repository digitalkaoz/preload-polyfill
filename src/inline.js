window.invokePreload = window.invokePreload || {};

invokePreload.onLoad = function(link) {
  link.setAttribute("preloaded", "true");
  link.removeAttribute("onload");
};

invokePreload.onScriptLoad = function(link, error) {
  link.setAttribute("preloaded", !!error ? "error" : "true");
  link.removeAttribute("onload");
  link.removeAttribute("onerror");
};

invokePreload.onScriptError = function(link) {
  invokePreload.onScriptLoad(link, true);
};

invokePreload.onStyleLoad = function(link) {
  if (
    [].map
      .call(document.styleSheets, function(stylesheet) {
        return stylesheet.href;
      })
      .indexOf(link.href) === -1
  ) {
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");
    link.setAttribute("media", "all");
    link.setAttribute("preloaded", "true");
    link.removeAttribute("as");
  }

  link.removeAttribute("onload");
};
