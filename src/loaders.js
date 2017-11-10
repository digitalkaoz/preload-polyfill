import { processCss } from "./dom";

const checkEs6 = () => {
  try {
    new Function("(a = 0) => a");
    return true;
  } catch (e) {
    return false;
  }
};

export const ES6 = checkEs6();

/**
 * called when a preload is loaded
 */
const onload = (event, element) => {
  element.setAttribute("loaded", true);

  element.dispatchEvent(new CustomEvent(event.type, event));
  console.log(`preloaded "${element.href}"`);

  //immediate invoke css
  if (element.getAttribute("as") === "style") {
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(() => processCss(element));
    } else {
      processCss(element);
    }
  }
};

/**
 * load preload with non-blocking xhr
 */
export const loadWithXhr = element => {
  const request = new XMLHttpRequest();

  if (
    element.getAttribute("as") === "script" ||
    element.getAttribute("as") === "worker"
  ) {
    //check for type="module" / nomodule (load es6 or es5) depending on browser capabilties
    const nm = element.hasAttribute("nomodule");
    const m =
      element.hasAttribute("type") && element.getAttribute("type") === "module";

    if ((m && !ES6) || (nm && ES6)) {
      element.rel = "none";

      return;
    }
  }

  request.addEventListener("loadend", event => onload(event, element));
  request.open("GET", element.href, true);
  request.send();
};
