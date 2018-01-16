import { load } from "./loaders";
import { getPreloads, skipNonMatchingModules } from "./dom";
const processed = [];

/**
 * filters all [rel="preload"] from actual mutations and invokes "preloadLinkByElement"
 */
const preloadLinkByMutation = mutations => {
  for (let i = 0, len = mutations.length; i < len; i++) {
    let addedNodes = mutations[i].addedNodes;

    for (let j = 0, len = addedNodes.length; j < len; j++) {
      let element = addedNodes[j];

      if (
        element.nodeName === "LINK" &&
        element.hasAttribute("rel") &&
        (element.getAttribute("rel") === "preload" ||
          element.getAttribute("rel") === "nomodule")
      ) {
        preloadLinkByElement(element);
      }
    }
  }
};

/**
 * do the background fetching for a [rel="preload"]
 */
const preloadLinkByElement = element => {
  if (processed.indexOf(element.href) !== -1) {
    return;
  }

  if (skipNonMatchingModules(element)) {
    return;
  }

  console.log(`loading "${element.href}"`);

  load(element);

  processed.push(element.href);
};

/**
 * watch for preload elements to come after loading this script
 */
const observeMutations = (selector = 'link[rel="preload"]') => {
  // preload link[rel="preload"] by mutation
  if (window.MutationObserver) {
    let observer = new MutationObserver(mutations =>
      preloadLinkByMutation(mutations)
    ).observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    document.addEventListener("DOMContentLoaded", () => {
      observer.disconnect();
    });
  } else {
    const searchInterval = setInterval(() => {
      if (document.readyState == "complete") {
        clearInterval(searchInterval);
        scanPreloads(selector);
      }
    }, 50);
  }
};

/**
 * scan and preload resources
 */
export const scanPreloads = (selector = 'link[rel="preload"]') => {
  // preload link[rel="preload"] by selector
  const preloads = getPreloads(selector);

  let link;

  while ((link = preloads.shift()) !== undefined) {
    preloadLinkByElement(link);
  }
};

export const polyfill = selector => {
  scanPreloads(selector);
  observeMutations(selector);
};
