import { polyfill, observeMutations } from "./observe";
import { invokePreloads } from "./invoke";

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

window.PRELOAD_USED = false;

const preloadPolyfill = () => {
  // check if preload should be loaded
  try {
    if (!document.createElement("link").relList.supports("preload")) {
      throw Error;
    }
    observeMutations('link[rel="preload"][as="style"]');
  } catch (error) {
    console.warn("invoking preload-polyfill");
    window.PRELOAD_USED = true;
    polyfill();
  }

  document.addEventListener("DOMContentLoaded", invokePreloads);
};

export default preloadPolyfill();
