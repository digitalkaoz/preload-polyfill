import { polyfill, observeMutations } from "./observe";
import { invokePreloads } from "./invoke";

/**
 * entrypoint, also binds DOMContentLoaded to the invocation of preloaded scripts
 */
const preloadPolyfill = () => {
  try {
    if (!document.createElement("link").relList.supports("preload")) {
      throw Error;
    }
    observeMutations('link[rel="preload"]', true);
  } catch (error) {
    console.warn("invoking preload-polyfill");
    polyfill('link[rel="preload"],link[rel="nomodule"]');
  }

  document.addEventListener("DOMContentLoaded", invokePreloads);
};

export default preloadPolyfill();
