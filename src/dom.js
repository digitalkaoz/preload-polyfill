export const processScript = (link, isAsync, resolve) => {
  const script = document.createElement("script");

  script.async = isAsync;
  script.onload = resolve;
  script.onerror = resolve;
  script.setAttribute("src", link.href);

  if (link.integrity) {
    script.integrity = link.integrity;
  }

  // if the preload resource has a crossorigin attribute, the generated script should have one aswell, otherwise we get a different resource
  // see https://bugs.chromium.org/p/chromium/issues/detail?id=678429
  if (link.hasAttribute("crossorigin")) {
    script.setAttribute("crossorigin", link.getAttribute("crossorigin"));
  }

  if (link.insertAdjacentElement) {
    link.insertAdjacentElement("afterend", script);
  } else {
    link.parentNode.appendChild(script);
  }

  return script;
};

const activateStylesheet = link => {
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("type", "text/css");
  link.setAttribute("media", "all");
  link.setAttribute("preloaded", "true");
  link.removeAttribute("as");
};

export const setLoaded = (element, error = false) => {
  element.setAttribute("preloaded", !!error ? "error" : "true");
  element.removeEventListener("load", window.invokePreload.onLoad);
  element.removeAttribute("onload");
  element.removeAttribute("onerror");
  element.onload = null;
  console.log(
    `${error ? "error when preloading" : "successfully preloaded"} "${
      element.href
    }"`
  );
};

export const processCss = link => {
  if (
    [].map
      .call(document.styleSheets, function(stylesheet) {
        return stylesheet.media.mediaText === "all" ? stylesheet.href : null;
      })
      .indexOf(link.href) === -1
  ) {
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(() => activateStylesheet(link));
    } else {
      activateStylesheet(link);
    }
  }

  link.removeAttribute("onload");

  return link;
};

const checkEs6 = () => {
  try {
    new Function("(a = 0) => a");
    console.log("ES6 capable browser");
    return true;
  } catch (e) {
    console.log("ES5 capable browser");
    return false;
  }
};

const ES6 = checkEs6();

/**
 * this skips type="module" for browsers that dont understand es6
 * and skips nomodule for browsers that understand es6
 */
export const skipNonMatchingModules = element => {
  if (
    (element.getAttribute("as") === "script" ||
      element.getAttribute("as") === "worker") &&
    (element.getAttribute("rel") === "nomodule" ||
      element.hasAttribute("module"))
  ) {
    //check for type="module" / nomodule (load es6 or es5) depending on browser capabilties
    const nm = element.getAttribute("rel") === "nomodule";
    const m = element.hasAttribute("module");

    if ((m && !ES6) || (nm && ES6)) {
      return true;
    }
  }

  return false;
};

export const getPreloads = (selector, element = document) => {
  const preloads = element.querySelectorAll(selector);

  let uniquePreloads = [],
    seenUrls = [];

  for (let i = 0, len = preloads.length; i < len; ++i) {
    let preload = preloads[i];

    if (seenUrls.indexOf(preload.href) === -1) {
      seenUrls.push(preload.href);
      uniquePreloads.push(preload);
    }
  }

  return uniquePreloads;
};
