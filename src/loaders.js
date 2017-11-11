import { processCss } from "./dom";

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

export const ES6 = checkEs6();

const setLoad = element => {
  element.setAttribute("preloaded", "loaded");
  element.removeEventListener("load", setLoad);
};

/**
 * called when a preload is loaded
 */
const onload = (event, element) => {
  //immediate invoke css
  if (element.getAttribute("as") === "style") {
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(() => processCss(element));
    } else {
      processCss(element);
    }
  }

  element.setAttribute("preloaded", true);
  element.dispatchEvent(new CustomEvent("load", event));
  console.log(`preloaded "${element.href}"`);
};

/**
 * load preload with non-blocking xhr
 */
const loadWithXhr = element => {
  if (
    element.getAttribute("as") === "script" ||
    element.getAttribute("as") === "worker"
  ) {
    //check for type="module" / nomodule (load es6 or es5) depending on browser capabilties
    const nm = element.hasAttribute("nomodule");
    const m =
      element.hasAttribute("type") && element.getAttribute("type") === "module";

    if ((m && !ES6) || (nm && ES6)) {
      return;
    }
  }

  const request = new XMLHttpRequest();

  request.addEventListener("load", event => onload(event, element));
  request.open("GET", element.href, true);
  request.setRequestHeader(
    "Accept",
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
  );
  request.send();
};

const loadWithIframe = element => {
  if (
    element.getAttribute("as") === "script" ||
    element.getAttribute("as") === "worker"
  ) {
    //check for type="module" / nomodule (load es6 or es5) depending on browser capabilties
    const nm = element.hasAttribute("nomodule");
    const m =
      element.hasAttribute("type") && element.getAttribute("type") === "module";

    if ((m && !ES6) || (nm && ES6)) {
      return;
    }
  }

  const preload = document.createElement("iframe");
  preload.addEventListener("load", event => onload(event, element));
  preload.src = element.href;
};

export const load = loadWithXhr;
