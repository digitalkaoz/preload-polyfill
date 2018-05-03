import { polyfill } from "./observe";

/**
 * entrypoint, also binds DOMContentLoaded to the invocation of preloaded scripts
 */
const preloadPolyfill = () => {
  try {
    if (!document.createElement("link").relList.supports("preload")) {
      throw Error;
    }
  } catch (error) {
    console.warn("invoking preload-polyfill");
    polyfill('link[rel="preload"]');
  }
};

export default preloadPolyfill();
