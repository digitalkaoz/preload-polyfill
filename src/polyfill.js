import { polyfill } from "./observe";
import { invokePreloads } from "./invoke";

const preloadPolyfill = () => {
  // check if preload should be loaded
  try {
    if (!document.createElement("link").relList.supports("preload")) {
      throw Error;
    }
  } catch (error) {
    console.warn("invoking preload-polyfill");
    polyfill();
  }

  document.addEventListener("DOMContentLoaded", invokePreloads);
};

export default preloadPolyfill();
