import { load, onload } from "./loaders";
import { getPreloads, skipNonMatchingModules } from "./dom";
const processed = [];

/**
 * sort like the preload scanner would do it (font > css > js > rest)
 */
const prioritize = (a, b) => {
  const aNumeric =
    a.getAttribute("as") === "font" || a.hasAttribute("critical")
      ? 0
      : a.getAttribute("as") === "style" ? 1 : 2;
  const bNumeric =
    b.getAttribute("as") === "font" || b.hasAttribute("critical")
      ? 0
      : b.getAttribute("as") === "style" ? 1 : 2;

  if (aNumeric < bNumeric) return -1;
  if (aNumeric > bNumeric) return 1;

  return 0;
};

/**
 * filters all [rel="preload"] from actual mutations and invokes "preloadLinkByElement"
 */
const preloadLinkByMutation = (mutations, selector, eventOnly = false) =>
  mutations
    .reduce(
      (nodes, mutation) => nodes.concat.apply(nodes, mutation.addedNodes),
      []
    )
    .reduce(
      (nodes, node) =>
        nodes.concat.apply(
          nodes,
          (node.matches && node.matches(selector) && [node]) ||
            (node.querySelectorAll && node.querySelectorAll(selector)) ||
            []
        ),
      []
    )
    .sort(prioritize)
    .forEach(element => preloadLinkByElement(element, eventOnly));

/**
 * do the background fetching for a [rel="preload"]
 */
const preloadLinkByElement = (element, eventOnly = false) => {
  if (processed.indexOf(element.href) !== -1) {
    return;
  }

  if (skipNonMatchingModules(element)) {
    return;
  }

  console.log(`loading "${element.href}"`);

  if (eventOnly) {
    element.onload = () => onload(null, element, eventOnly);
    //element.addEventListener("load", event => onload(event, element, eventOnly));
  } else {
    load(element);
  }
  processed.push(element.href);
};

/**
 * watch for preload elements to come after loading this script
 */
export const observeMutations = (
  selector = 'link[rel="preload"]',
  eventOnly = false
) => {
  // preload link[rel="preload"] by mutation
  if (window.MutationObserver) {
    new MutationObserver(mutations =>
      preloadLinkByMutation(mutations, selector, eventOnly)
    ).observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  } else {
    const searchInterval = setInterval(() => {
      if (document.readyState == "complete") {
        clearInterval(searchInterval);
        scanPreloads(selector, eventOnly);
      }
    }, 20);
  }
};

/**
 * scan and preload resources
 */
export const scanPreloads = (
  selector = 'link[rel="preload"]',
  eventOnly = false
) => {
  // preload link[rel="preload"] by selector
  getPreloads(selector)
    .sort(prioritize)
    .forEach(element => preloadLinkByElement(element, eventOnly));
};

export const polyfill = selector => {
  scanPreloads(selector);
  observeMutations(selector);
};
