import { processScript, getPreloads, skipNonMatchingModules } from "./dom";

let setNonCriticalAsync = true;

const processLink = (link, isAsync) => {
  if (link.getAttribute("preloaded") === "true") {
    processScript(link, isAsync);
    console.log(`processed preload "${link.href}"`);
  } else {
    console.log(`no processing for preload "${link.href}"`);
  }
};

const invokeCriticalLinkResources = preloads => {
  while (preloads.length > 0 && preloads[0].hasAttribute("preloaded")) {
    processLink(preloads.shift(), false);
  }
};

const invokeNonCriticalLinkResources = preloads => {
  for (let i = 0, len = preloads.length; i < len; ++i) {
    const preload = preloads[i];

    if (preload.hasAttribute("preloaded")) {
      processLink(preloads.splice(i, 1)[0], setNonCriticalAsync);
      len--;
      i--;
    }
  }
};

export const invokePreloads = () => {
  if (performance.now) {
    console.log(performance.now());
  }

  let interval;

  const preloads = getPreloads("link[rel='preload'][as='script']");

  let preload,
    criticals = [],
    noncriticals = [];

  while ((preload = preloads.shift()) !== undefined) {
    if (!skipNonMatchingModules(preload)) {
      if (preload.hasAttribute("critical")) {
        criticals.push(preload);
      } else {
        noncriticals.push(preload);
      }
    }
  }

  setNonCriticalAsync = criticals.length === 0;

  const processLinks = () => {
    console.log(
      "check for invokable preload invocations",
      criticals,
      noncriticals
    );

    // first comes the criticals
    if (criticals.length > 0) {
      invokeCriticalLinkResources(criticals);
    } else {
      // all other resources
      invokeNonCriticalLinkResources(noncriticals);
    }

    // if all resources are processed, remove interval, otherwise check again in X ms
    if (criticals.length === 0 && noncriticals.length === 0) {
      clearInterval(interval);
      console.log("invoked all preloads");
      if (performance.now) {
        console.log(performance.now());
      }
    }
  };

  // check every X ms if all preloaded resources are fetched
  interval = setInterval(processLinks, 50);

  // kill the listening 10s after window.load
  window.addEventListener("load", () => {
    setTimeout(() => {
      if (interval) {
        clearInterval(interval);

        if (criticals.length || noncriticals.length) {
          console.error("could not invoke all preloads!");
        }
      }
    }, 10000);
  });
};
