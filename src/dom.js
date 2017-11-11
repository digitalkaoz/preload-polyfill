export const processScript = link => {
  const script = document.createElement("script");

  if (!link.hasAttribute("async") || link.hasAttribute("critical")) {
    script.async = false;
  } else {
    script.async = link.hasAttribute("async");
  }

  // if we didnt need to polyfill, we must decide late if we should set module/nomodule on scripts
  /*if (!polyfilled) {
    if (link.hasAttribute("type")) {
      script.type = link.getAttribute("type");
    } else if (link.hasAttribute("nomodule")) {
      script.setAttribute("nomodule", "nomodule");
    }
  }*/

  script.src = link.href;
  link.insertAdjacentElement("afterend", script);

  return script;
};

export const processCss = link => {
  link.removeAttribute("as");
  link.setAttribute("type", "text/css");
  link.setAttribute("rel", "stylesheet");

  return link;
};

export const getPreloads = selector => {
  const resources = [];
  return toArray(document.querySelectorAll(selector)).filter(v => {
    if (resources.indexOf(v.href) === -1) {
      resources.push(v.href);
      return true;
    }
    return false;
  });
};

const toArray = nodeList => {
  return Array.prototype.slice.call(nodeList);
};
