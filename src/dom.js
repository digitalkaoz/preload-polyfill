const processed = [];

export const processScript = link => {
  if (processed.indexOf(link.href) !== -1) {
    return;
  }

  const script = document.createElement("script");

  script.async = false;
  script.setAttribute("src", link.href);
  link.insertAdjacentElement("afterend", script);
  processed.push(link.href);

  return script;
};

const convertToStylesheet = link => {
  if (processed.indexOf(link.href) !== -1) {
    return;
  }

  if (link.hasAttribute("as")) {
    if (link.getAttribute("rel") === "preload") {
      link.setAttribute("rel", "stylesheet");
      link.setAttribute("type", "text/css");
    }

    link.removeAttribute("as");
    link.setAttribute("media", "all");

    processed.push(link.href);
  }
};

export const processCss = link => {
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(() => convertToStylesheet(link));
  } else {
    convertToStylesheet(link);
  }

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
    (element.hasAttribute("nomodule") || element.hasAttribute("module"))
  ) {
    //check for type="module" / nomodule (load es6 or es5) depending on browser capabilties
    const nm = element.hasAttribute("nomodule");
    const m = element.hasAttribute("module");

    if ((m && !ES6) || (nm && ES6)) {
      return true;
    }
  }

  return false;
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
