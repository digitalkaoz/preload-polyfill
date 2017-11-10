const checkEs6 = () => {
  try {
    new Function("(a = 0) => a");
    return true;
  } catch (e) {
    return false;
  }
};

const ES6 = checkEs6();

const onload = (event, doc, preload, element) => {
  if (preload) {
    preload.removeEventListener("load", onload);
  }
  if (doc) {
    doc.head.removeChild(preload);
  }
  window.LOADED_ITEMS.push(element.href);
  console.log(`preloaded "${element.href}"`);

  element.dispatchEvent(new CustomEvent("load", event));
};

export const typeMap = {
  // forward [rel="preload"][as="script"]
  script(element, iframeDocument) {
    loadWithIframe(element, iframeDocument);
  },
  // forward [rel="preload"][as="worker"]
  worker(element, iframeDocument) {
    loadWithIframe(element, iframeDocument);
  },
  // forward [rel="preload"][as="audio"]
  audio(element, iframeDocument) {
    loadWithXhr(element, iframeDocument);
  },
  // forward [rel="preload"][as="embed"]
  embed(element, iframeDocument) {
    loadWithXhr(element, iframeDocument);
  },
  // forward [rel="preload"][as="video"]
  video(element, iframeDocument) {
    loadWithXhr(element, iframeDocument);
  },
  // forward [rel="preload"][as="track"]
  track(element, iframeDocument) {
    loadWithXhr(element, iframeDocument);
  },
  // forward [rel="preload"][as="fetch"]
  fetch(element, iframeDocument) {
    loadWithXhr(element, iframeDocument);
  },
  // forward [rel="preload"][as="document"]
  document(element, iframeDocument) {
    loadWithXhr(element, iframeDocument);
  },
  // forward [rel="preload"][as="image"]
  image(element, iframeDocument) {
    loadWithXhr(element, iframeDocument);
  },
  // forward [rel="preload"][as="object"]
  object(element, iframeDocument) {
    loadWithXhr(element, iframeDocument);
  },
  // forward [rel="preload"][as="style"]
  style(element, iframeDocument) {
    loadWithinIframe(element, iframeDocument);
  },
  font(element, iframeDocument) {
    loadWithXhr(element, iframeDocument);
  }
};

export const loadWithIframe = (element, iframeDocument) => {
  // only load module if es6 is available
  const nm = element.hasAttribute("nomodule");
  const m =
    element.hasAttribute("type") && element.getAttribute("type") === "module";

  if ((m && !ES6) || (nm && ES6)) {
    element.rel = "none";

    return;
  }

  const preload = document.createElement("iframe");

  preload.addEventListener("load", event =>
    onload(event, document, preload, element)
  );
  preload.content = "text/javascript;charset=UTF-8";
  preload.src = element.href;

  document.head.appendChild(preload);
};

export const loadWithXhr = (element, iframeDocument) => {
  const request = new XMLHttpRequest();

  request.addEventListener("load", event => onload(event, null, null, element));
  request.open("GET", element.href, true);
  request.send(null);
};

export const loadWithinIframe = (element, iframeDocument) => {
  const preload = iframeDocument.createElement("link");

  preload.addEventListener("load", event =>
    onload(event, iframeDocument, preload, element)
  );
  preload.href = element.href;
  preload.media = "none";
  preload.rel = "stylesheet";

  iframeDocument.head.appendChild(preload);
};
