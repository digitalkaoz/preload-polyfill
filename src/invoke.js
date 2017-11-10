import { processScript, processCss, getPreloads } from "./dom";
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

  const processLink = (link, invoke) => {
    if (!window.PRELOAD_USED || window.LOADED_ITEMS.indexOf(link.href) !== -1) {
      invoke(link);
      removeLink(link);
    }
  };

  // styles
  preloads
    .filter(link => link.as === "style")
    .forEach(link => processLink(link, processCss));

  // async scripts
  preloads
    .filter(link => link.as === "script")
    .filter(link => link.hasAttribute("async"))
    .sort(criticalSort)
    .forEach(link => processLink(link, processScript));

  // sync scripts
  preloads
    .filter(link => link.as === "script")
    .filter(link => !link.hasAttribute("async"))
    .sort(criticalSort)
    .some(link => {
      if (link.hasAttribute("nomodule") && ES6) {
        removeLink(link);
        return false;
      }
      if (window.PRELOAD_USED && !window.LOADED_ITEMS.indexOf(link.href)) {
        return true;
      }
      processLink(link, processScript);
    });
};

export const invokePreloads = () => {
  const preloads = getPreloads();
  const criticals = preloads.filter(link => link.hasAttribute("critical"));
  const noncriticals = preloads.filter(link => criticals.indexOf(link) === -1);

  const processLinks = () => {
    // first comes the criticals
    if (criticals) {
      invokeLinkResources(criticals);
    }

    //all other resources
    if (criticals.length === 0) {
      invokeLinkResources(noncriticals);
    }

    //if all resources are processed, remove interval, otherwise check again in X ms
    if (noncriticals.length === 0) {
      clearInterval(interval);
      console.log("invoked all preloads");
    }
  };

  // check every X ms if all preloaded resources are fetched
  const interval = setInterval(processLinks, 50);
};
