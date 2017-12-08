import { processScript, getPreloads, skipNonMatchingModules } from "./dom";

const processLink = link => {
  processScript(link);
  console.log(`processed preload "${link.href}"`);
};

const invokeLinkResources = preloads => {
  while (preloads.length > 0 && preloads[0].hasAttribute("preloaded")) {
    processLink(preloads.shift());
  }
};

export const invokePreloads = () => {
  if (performance.now) {
    console.log(performance.now());
  }

  let interval;

  const preloads = getPreloads(
    "link[rel='nomodule'],link[rel='preload'][as='script'],link[rel='preload'][as='worker']"
  );

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

  const processLinks = () => {
    console.log(
      "check for invokable preload invocations",
      criticals,
      noncriticals
    );

    // first comes the criticals
    if (criticals) {
      invokeLinkResources(criticals);
    }

    // all other resources
    if (criticals.length === 0) {
      invokeLinkResources(noncriticals);
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
