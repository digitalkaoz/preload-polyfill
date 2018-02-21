export const processScript = (link, isAsync) => {
  const script = document.createElement("script");

  script.setAttribute("src", link.href);
  script.async = isAsync;
  link.insertAdjacentElement("afterend", script);

  return script;
};

const activateStylesheet = link => {
  link.removeAttribute("as");
  link.setAttribute("media", "all");
};

export const processCss = link => {
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(() => activateStylesheet(link));
  } else {
    activateStylesheet(link);
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

export const getPreloads = selector => {
  const preloads = document.querySelectorAll(selector);

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
