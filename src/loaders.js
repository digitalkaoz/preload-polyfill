const checkEs6 = () => {
  //TODO is there someting without eval?
  try {
    eval("var foo = (x)=>x+1");
  } catch (e) {
    return false;
  }
  return true;
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

/*
	https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content

    audio: Audio file.
    document: An HTML document intended to be embedded inside a <frame> or <iframe>.
    embed: A resource to be embedded inside an <embed> element.
    fetch: Resource to be accessed by a fetch or XHR request, such as an ArrayBuffer or JSON file.
    image: Image file.
    object: A resource to be embedded inside an <embed> element.
    track: WebVTT file.
    video: Video file.
*/

export const typeMap = {
  // forward [rel="preload"][as="script"] load event
  script(element, iframeDocument) {
    loadWithIframe(element, iframeDocument);
  },
  // forward [rel="preload"][as="worker"] load event
  worker(element, iframeDocument) {
    loadWithIframe(element, iframeDocument);
  },
  // forward [rel="preload"][as="style"] load event
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
