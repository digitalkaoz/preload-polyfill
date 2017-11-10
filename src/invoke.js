import { processScript, getPreloads } from "./dom";
import { ES6 } from "./loaders";

const criticalSort = (a, b) => {
  const aVal = a.hasAttribute("critical") ? 0 : 1;
  const bVal = b.hasAttribute("critical") ? 0 : 1;

  if (aVal < bVal) return -1;
  if (aVal > bVal) return 1;

  return 0;
};

const invokeLinkResources = preloads => {
  const removeLink = link => {
    console.log(`processed preload "${link.href}"`);
    preloads.splice(preloads.indexOf(link), 1);
  };

  const processLink = link => {
    if (
      !window.PRELOAD_USED ||
      (window.LOADED_ITEMS && window.LOADED_ITEMS.indexOf(link.href) !== -1)
    ) {
      processScript(link);
      removeLink(link);
    }
  };

  // async scripts
  preloads
    .filter(link => link.getAttribute("as") === "script")
    .filter(link => link.hasAttribute("async"))
    .sort(criticalSort)
    .forEach(processLink);

  // sync scripts
  preloads
    .filter(link => link.getAttribute("as") === "script")
    .filter(link => !link.hasAttribute("async"))
    .sort(criticalSort)
    .some(link => {
      if (link.hasAttribute("nomodule") && ES6) {
        removeLink(link);
        return false;
      }
      if (
        window.PRELOAD_USED &&
        window.LOADED_ITEMS.indexOf(link.href) === -1
      ) {
        return true;
      }
      processLink(link);
    });
};

export const invokePreloads = () => {
  const preloads = getPreloads(
    "link[rel='preload'][as='script'],link[rel='preload'][as='worker']"
  );
  const criticals = preloads.filter(link => link.hasAttribute("critical"));
  const noncriticals = preloads.filter(link => criticals.indexOf(link) === -1);

  let inProgress = false;

  const processLinks = () => {
    console.log("check for invokable preload invokations");
    if (inProgress === true) {
      return;
    }
    inProgress = true;
    // first comes the criticals
    if (criticals) {
      invokeLinkResources(criticals);
    }

    //all other resources
    if (criticals.length === 0) {
      invokeLinkResources(noncriticals);
    }

    //if all resources are processed, remove interval, otherwise check again in X ms
    if (criticals.length === 0 && noncriticals.length === 0) {
      clearInterval(interval);
      console.log("invoked all preloads");
    }
    inProgress = false;
  };

  // check every X ms if all preloaded resources are fetched
  const interval = setInterval(processLinks, 50);
};
