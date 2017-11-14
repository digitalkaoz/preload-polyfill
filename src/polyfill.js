import { polyfill, observeMutations } from "./observe";
import { invokePreloads } from "./invoke";

/**
 * entrypoint, also binds DOMContentLoaded to the invocation of preloaded scripts
 */
const preloadPolyfill = () => {
  // check if preload should be loaded
  let polyfilled = false;

  try {
    if (!document.createElement("link").relList.supports("preload")) {
      throw Error;
    }
    observeMutations('link[rel="preload"]', true);
  } catch (error) {
    console.warn("invoking preload-polyfill");
    polyfilled = true;
    polyfill('link[rel="preload"]');
  }

  document.addEventListener("DOMContentLoaded", invokePreloads);
};

export default preloadPolyfill();
