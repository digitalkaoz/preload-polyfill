import { polyfill, observeMutations } from "./observe";
import { invokePreloads } from "./invoke";

//Custom Event Polyfill
(() => {
  if (typeof window.CustomEvent === "function") return false;

  CustomEvent = (event, params) => {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent("CustomEvent");
    evt.initCustomEvent(
      event,
      params.bubbles,
      params.cancelable,
      params.detail
    );
    return evt;
  };

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
})();

const preloadPolyfill = () => {
  // check if preload should be loaded
  let polyfilled = false;

  try {
    if (!document.createElement("link").relList.supports("preload")) {
      throw Error;
    }
    observeMutations('link[rel="preload"][as="style"]');
  } catch (error) {
    console.log(error);
    console.warn("invoking preload-polyfill");
    polyfilled = true;
    polyfill('link[rel="preload"]');
  }

  document.addEventListener("DOMContentLoaded", () =>
    invokePreloads(polyfilled)
  );
};

export default preloadPolyfill();
