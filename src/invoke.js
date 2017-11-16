import { processScript, getPreloads, skipNonMatchingModules } from "./dom";

const removeLink = (index, preloads) => {
  // For not affecting array iteration set element to null to filter them later on.
  preloads[index] = null;
};

const processLink = (link, index, preloads) => {
  processScript(link);
  removeLink(index, preloads);
  console.log(`processed preload "${link.href}"`);
};

const invokeLinkResources = preloads => {
  preloads.some((link, index) => {
    if (link.hasAttribute("preloaded")) {
      processLink(link, index, preloads);
    } else {
      return true;
    }
  });
};

export const invokePreloads = () => {
  if (performance.now) {
    console.log(performance.now());
  }

  let interval;

  const preloads = getPreloads(
    "link[rel='preload'][as='script'],link[rel='preload'][as='worker']"
  );

  let criticals = preloads.filter(
    link => link.hasAttribute("critical") && !skipNonMatchingModules(link)
  );
  let noncriticals = preloads.filter(
    link => criticals.indexOf(link) === -1 && !skipNonMatchingModules(link)
  );

  const processLinks = () => {
    console.log(
      "check for invokable preload invocations",
      criticals,
      noncriticals
    );

    // first comes the criticals
    if (criticals) {
      invokeLinkResources(criticals);
      criticals = criticals.filter(link => link);
    }

    // all other resources
    if (criticals.length === 0) {
      invokeLinkResources(noncriticals);
      noncriticals = noncriticals.filter(link => link);
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
