import { processScript, processCss, getPreloads } from "./dom";

const invokeLinkResources = (preloads, delayExcecution = false) => {
  const removeLink = link => {
    console.log(`processed preload "${link.href}"`);
    preloads.splice(preloads.indexOf(link), 1);
  };

  const constAsyncOrExecutable = (link, index, list) =>
    window.LOADED_ITEMS.indexOf(list[index].href) ||
    (index === 0 || window.LOADED_ITEMS.indexOf(list[index - 1].href) !== -1) ||
    link.hasAttribute("async");

  preloads
    .filter(link => link.as === "style")
    .filter(constAsyncOrExecutable)
    .forEach(link => {
      if (window.LOADED_ITEMS.indexOf(link.href) !== -1) {
        processCss(link);
        removeLink(link);
      }
    });

  preloads
    .filter(link => link.as === "script")
    .filter(constAsyncOrExecutable)
    .sort((a, b) => {
      const aVal = a.hasAttribute("critical") ? 0 : 1;
      const bVal = b.hasAttribute("critical") ? 0 : 1;

      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;

      return 0;
    })
    .forEach(link => {
      if (window.LOADED_ITEMS.indexOf(link.href) !== -1) {
        processScript(link);
        removeLink(link);
      }
    });
};

const invoke = () => {
  const preloads = getPreloads();
  const criticals = preloads.filter(link => link.hasAttribute("critical"));
  const noncriticals = preloads.filter(link => criticals.indexOf(link) === -1);

  const processLinks = () => {
    if (criticals) {
      invokeLinkResources(criticals);
    }

    if (criticals.length === 0) {
      invokeLinkResources(noncriticals, true);
    }

    if (noncriticals.length === 0) {
      clearInterval(interval);
    }
  };

  // check every X ms if all preloaded resources are fetched
  const interval = setInterval(processLinks, 50);
};

document.addEventListener("DOMContentLoaded", invoke);
