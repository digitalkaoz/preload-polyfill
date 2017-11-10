import { createIframe } from "./dom";
import { typeMap } from "./loaders";

const selector = 'link[rel="preload"]';
const processed = [];

/**
 * sort like the preload scanner would do it (font > css > js > rest)
 */
const prioritize = (a, b) => {
  const aNumeric = a.as === "font" ? 0 : a.as === "style" ? 1 : 2;
  const bNumeric = b.as === "font" ? 0 : b.as === "style" ? 1 : 2;

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
    .forEach(element => preloadLinkByElement(element, iframeDocument));

/**
 * do the background fetching for a [rel="preload"]
 */
const preloadLinkByElement = (element, iframeDocument) => {
  if (processed.indexOf(element.href) !== -1) {
    return;
  }

  console.log(`loading "${element.href}"`);

  const as = element.getAttribute("as");

  if (typeMap[as]) {
    typeMap[as](element, iframeDocument);
    processed.push(element.href);
  } else {
    console.error(`dont know how to preload "${as}" yet`);
  }
};

/**
 * watch for preload elements to come after loading this script
 */
const observeMutations = iframeDocument => {
  // preload link[rel="preload"] by mutation
  if (window.MutationObserver) {
    new MutationObserver(mutations =>
      preloadLinkByMutation(mutations, iframeDocument)
    ).observe(document.documentElement, {
      childList: true,
      subtree: true
    });
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
const scanPreloads = iframeDocument => {
  // preload link[rel="preload"] by selector
  Array.prototype.slice
    .call(document.querySelectorAll(selector), 0)
    .sort(prioritize)
    .forEach(element => {
      preloadLinkByElement(element, iframeDocument);
    });
};

export const polyfill = () => {
  window.LOADED_ITEMS = [];

  const { iframeDocument, iframeWindow } = createIframe();

  const invoke = () => {
    scanPreloads(iframeDocument);
    observeMutations(iframeDocument);
  };

  if (
    iframeDocument.readyState === "interactive" ||
    iframeDocument.readyState === "complete"
  ) {
    // ie + safari
    invoke();
  } else {
    // ff
    iframeWindow.addEventListener("load", invoke);
  }
};
