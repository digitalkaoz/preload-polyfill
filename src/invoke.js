import { processScript, getPreloads } from "./dom";
import { ES6 } from "./loaders";

const criticalSort = (a, b) => {
  const aVal = a.hasAttribute("critical") ? 0 : 1;
  const bVal = b.hasAttribute("critical") ? 0 : 1;

  if (aVal < bVal) return -1;
  if (aVal > bVal) return 1;

  return 0;
};

const invokeLinkResources = (preloads, polyfilled) => {
  const removeLink = link => {
    console.log(`processed preload "${link.href}"`);
    preloads.splice(preloads.indexOf(link), 1);
  };

  const processLink = link => {
    processScript(link, polyfilled);
    removeLink(link);
  };

  // async scripts
  preloads.filter(link => link.hasAttribute("async")).forEach(link => {
    if (link.hasAttribute("nomodule") && ES6) {
      removeLink(link);
      return false;
    }

    if (!polyfilled || (polyfilled && link.hasAttribute("loaded"))) {
      processLink(link);
    }
  });

  // sync scripts
  preloads.filter(link => !link.hasAttribute("async")).some(link => {
    if (link.hasAttribute("nomodule") && ES6) {
      removeLink(link);
      return false;
    }
    if (polyfilled && !link.hasAttribute("loaded")) {
      return true;
    }

    processLink(link);
  });
};

export const invokePreloads = polyfilled => {
  const preloads = getPreloads(
    "link[rel='preload'][as='script'],link[rel='preload'][as='worker']"
  );
  const criticals = preloads
    .filter(link => link.hasAttribute("critical"))
    .sort(criticalSort);
  const noncriticals = preloads
    .filter(link => criticals.indexOf(link) === -1)
    .sort(criticalSort);

  const processLinks = () => {
    console.log("check for invokable preload invokations");
    // first comes the criticals
    if (criticals) {
      invokeLinkResources(criticals, polyfilled);
    }

    //all other resources
    if (criticals.length === 0) {
      invokeLinkResources(noncriticals, polyfilled);
    }

    //if all resources are processed, remove interval, otherwise check again in X ms
    if (criticals.length === 0 && noncriticals.length === 0) {
      clearInterval(interval);
      console.log("invoked all preloads");
    }
  };

  // check every X ms if all preloaded resources are fetched
  const interval = setInterval(processLinks, 50);
};
