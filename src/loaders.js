import { processCss, createIframe, checkForESCapabilities } from "./dom";

let iframeDocument, iframeWindow;

const setLoaded = element => {
  element.setAttribute("preloaded", true);
  element.removeEventListener("load", onload);
  console.log(`preloaded "${element.href}"`);
};

/**
 * called when a preload is loaded
 */
export const onload = (event, element, eventOnly = false) => {
  //immediate invoke css
  if (element.getAttribute("as") === "style") {
    processCss(element);
    setLoaded(element);

    return;
  }

  setLoaded(element);

  if (!eventOnly) {
    element.dispatchEvent(new CustomEvent("load", event));
  }
};

/**
 * load preload with non-blocking xhr
 */
const loadAsXhr = element => {
  const request = new XMLHttpRequest();

  request.addEventListener("load", event => onload(event, element));
  request.open("GET", element.href, true);
  request.setRequestHeader(
    "Accept",
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
  );
  request.send();
};

const loadImage = element => {
  const img = new Image();
  img.onload = event => onload(event, element);
  img.src = element.href;
};

const loadStyle = element => {
  element.addEventListener("load", event => onload(event, element, true));

  element.media = "none";
  element.type = "text/css";
  element.rel = "stylesheet";
};

const loadFont = element => {
  if (!document.fonts) {
    return loadAsXhr(element);
  }

  //TODO adding ttf ... to fontfaceset
  if (!element.hasAttribute("name")) {
    console.warn(
      "Webfonts can only be preloaded through FontFace if you set a 'name=FontName' property on the link"
    );
    return loadAsXhr(element);
  }

  var f = new FontFace(element.getAttribute("name"), `url(${element.href})`);

  f
    .load(element.href)
    .then(loadedFace => {
      document.fonts.add(loadedFace);
      onload(null, element);
    })
    .catch(e => console.error);
};

const loadScript = element => {
  if (checkForESCapabilities(element)) {
    return;
  }

  return loadAsXhr(element);
};

export const load = element => {
  switch (element.getAttribute("as")) {
    case "script":
      loadScript(element);
      break;
    case "image":
      loadImage(element);
      break;
    case "style":
      loadStyle(element);
      break;
    case "font":
      loadFont(element);
      break;
    default:
      loadAsXhr(element);
  }
};
