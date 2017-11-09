import { polyfill } from "./observe";

const preloadPolyfill = () => {
  // check if preload should be loaded
  try {
    if (!document.createElement("link").relList.supports("preload")) {
      throw Error;
    }
  } catch (error) {
    console.log("using preload-polyfill");
    polyfill();
  }
};

export default preloadPolyfill();
