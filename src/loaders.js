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

const onload = (event, element) => {
  if (window.LOADED_ITEMS) {
    window.LOADED_ITEMS.push(element.href);
  }
  console.log(`preloaded "${element.href}"`);

  if (element.getAttribute("as") === "style") {
    element.addEventListener("load", () => processCss(element));
  }

  element.dispatchEvent(new CustomEvent("load", event));
};

export const loadWithXhr = element => {
  const request = new XMLHttpRequest();

  if (
    element.getAttribute("as") === "script" ||
    element.getAttribute("as") === "worker"
  ) {
    const nm = element.hasAttribute("nomodule");
    const m =
      element.hasAttribute("type") && element.getAttribute("type") === "module";

    if ((m && !ES6) || (nm && ES6)) {
      element.rel = "none";

      return;
    }
  }

  request.addEventListener("load", event => onload(event, element));
  request.open("GET", element.href, true);
  request.send(null);
};
