const selector = 'link[rel="preload"]';

/*
 * create holding iframe for all resources except js
 */
const createIframe = () => {
  const iframe = document.createElement("iframe");

  iframe.style.cssText = "display:none";
  //iframe.sandbox = "allow-top-navigation allow-same-origin";
  iframe.setAttribute('role', 'presentation');
  iframe.tabIndex = -1;
  //iframe.allowTransparency = true;
  iframe.src = "javascript:false"; // eslint-disable-line no-script-url

  document.head.appendChild(iframe);

  const iframeWindow = iframe.contentWindow;
  const iframeDocument = iframe.contentDocument
    ? iframe.contentDocument
    : iframe.contentWindow ? iframe.contentWindow.document : iframe.document;

  iframeDocument.write();
  iframeDocument.close();

  return {
    iframeDocument,
    iframeWindow
  };
};

/**
 * watch for preload elements to come after loading this script
 * 
 * TODO https://github.com/aFarkas/link-preload/blob/master/src/core.js#L155 (make MutationObserver optional)
 */
const observeMutations = iframeDocument => {
  // preload link[rel="preload"] by mutations
  const preloadLinkByMutation = mutations =>
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
      .forEach(element => {
        preloadLinkByElement(element, iframeDocument);
      });

  // observe mutations
  new MutationObserver(preloadLinkByMutation).observe(
    document.documentElement,
    {
      childList: true,
      subtree: true
    }
  );
};

/**
 * scan and preload resources
 */
scanPreloads = iframeDocument => {
  // preload link[rel="preload"] by selector
  Array.prototype.forEach.call(
    document.documentElement.querySelectorAll(selector),
    element => {
      preloadLinkByElement(element, iframeDocument);
    }
  );
};

/**
 * js.onload wont work in iframes, therefore we create a whole new iframe for this script
 */
const loadJs = element => {
  const onload = event => {
    preload.removeEventListener("load", onload);
    document.head.removeChild(preload);
    element.dispatchEvent(new CustomEvent("load", event));
  };

  const preload = document.createElement("iframe");
  preload.addEventListener("load", onload);
  preload.charset = 'utf-8';
  preload.src = element.href;

  document.head.appendChild(preload);
};

/**
 * load css inside preload iframe
 */
const loadCss = (element, iframeDocument) => {
  const onload = event => {
    preload.removeEventListener("load", onload);
    iframeDocument.head.removeChild(preload);
    element.dispatchEvent(new CustomEvent("load", event));
  };

  const preload = iframeDocument.createElement("link");

  preload.addEventListener("load", onload);
  preload.href = element.href;
  preload.media = "none";
  preload.rel = "stylesheet";

  iframeDocument.head.appendChild(preload);
};

const typeMap = {
  // forward [rel="preload"][as="script"] load event
  script(element, iframeDocument) {
    loadJs(element, iframeDocument);
  },
  // forward [rel="preload"][as="style"] load event
  style(element, iframeDocument) {
    loadCss(element, iframeDocument);
  }
};

const processed = [];

const preloadLinkByElement = (element, iframeDocument) => {
  if (processed.indexOf(element.href) !== -1) {
    return;
  }

  const as = element.getAttribute("as");

  if (typeMap[as]) {
    typeMap[as](element, iframeDocument);
    processed.push(element.href);
  }
};

//TODO all other preloadable ressources
/*
	https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content

    audio: Audio file.
    document: An HTML document intended to be embedded inside a <frame> or <iframe>.
    embed: A resource to be embedded inside an <embed> element.
    fetch: Resource to be accessed by a fetch or XHR request, such as an ArrayBuffer or JSON file.
    font: Font file.
    image: Image file.
    object: A resource to be embedded inside an <embed> element.
    script: JavaScript file.
    style: Stylesheet.
    track: WebVTT file.
    worker: A JavaScript web worker or shared worker.
    video: Video file.
*/
const polyfill = () => {
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

// check if preload should be loaded
try {
  if (!document.createElement("link").relList.supports("preload")) {
    throw Error;
  }
} catch (error) {
  console.log('using preload-polyfill');
  polyfill();
}
