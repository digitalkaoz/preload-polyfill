import { loadWithXhr } from "./loaders";

const selector = 'link[rel="preload"]';
const processed = [];

/**
 * sort like the preload scanner would do it (font > css > js > rest)
 */
const prioritize = (a, b) => {
  const aNumeric =
    a.getAttribute("as") === "font"
      ? 0
      : a.getAttribute("as") === "style" ? 1 : 2;
  const bNumeric =
    b.getAttribute("as") === "font"
      ? 0
      : b.getAttribute("as") === "style" ? 1 : 2;

  if (aNumeric < bNumeric) return -1;
  if (aNumeric > bNumeric) return 1;

  return 0;
};

/**
 * filters all [rel="preload"] from actual mutations and invokes "preloadLinkByElement"
 */
const preloadLinkByMutation = (mutations, iframeDocument) =>
  mutations
    .reduce(
      (nodes, mutation) => nodes.concat.apply(nodes, mutation.addedNodes),
      []
    )
    .reduce(
      (nodes, node) =>
        nodes.concat.apply(
          nodes,
          (node.matches && node.matches(selector) && node) ||
            (node.querySelectorAll && node.querySelectorAll(selector)) ||
            []
        ),
      []
    )
    .sort(prioritize)
    .forEach(preloadLinkByElement);

/**
 * do the background fetching for a [rel="preload"]
 */
const preloadLinkByElement = element => {
  if (processed.indexOf(element.href) !== -1) {
    return;
  }

  console.log(`loading "${element.href}"`);

  loadWithXhr(element);
  processed.push(element.href);
};

/**
 * watch for preload elements to come after loading this script
 */
const observeMutations = () => {
  // preload link[rel="preload"] by mutation
  if (window.MutationObserver) {
    new MutationObserver(preloadLinkByMutation).observe(
      document.documentElement,
      {
        childList: true,
        subtree: true
      }
    );
  } else {
    const searchIntervall = setInterval(function() {
      if (document.readyState == "complete") {
        clearInterval(searchIntervall);
        scanPreloads();
      }
    }, 20);
  }
};

/**
 * scan and preload resources
 */
const scanPreloads = () => {
  // preload link[rel="preload"] by selector
  Array.prototype.slice
    .call(document.querySelectorAll(selector), 0)
    .sort(prioritize)
    .forEach(preloadLinkByElement);
};

export const polyfill = () => {
  window.LOADED_ITEMS = [];

  scanPreloads();
  observeMutations();
};
