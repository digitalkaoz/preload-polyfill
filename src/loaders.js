import { processCss, skipNonMatchingModules } from "./dom";

const setLoaded = element => {
  element.setAttribute("preloaded", true);
  element.removeEventListener("load", onload);
  console.log(`preloaded "${element.href}"`);
};

/**
 * called when a preload is loaded
 */
const onload = (event, element) => {
  //immediate invoke css
  if (element.getAttribute("as") === "style") {
    processCss(element);
    setLoaded(element);

    return;
  }

  setLoaded(element);

  element.dispatchEvent(new CustomEvent("load", event));
};

const loadWithFetch = element => {
  const options = {
    method: "GET",
    mode: "cors",
    cache: "force-cache"
  };

  fetch(element.href, options)
    .then(() => onload(null, element))
    .catch(() => onload(null, element));
};

/**
 * load preload with non-blocking xhr
 */
const loadWithXhr = element => {
  if (window.fetch) {
    return loadWithFetch(element);
  }

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
  element.addEventListener("load", event => onload(event, element));

  element.media = "none";
  element.type = "text/css";
  element.rel = "stylesheet";
};

const loadFont = element => {
  if (!document.fonts) {
    return loadWithXhr(element);
  }

  //TODO adding ttf ... to fontfaceset
  if (!element.hasAttribute("name")) {
    console.warn(
      "Webfonts can only be preloaded through FontFace if you set a 'name=FontName' property on the link"
    );
    return loadWithXhr(element);
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
  if (skipNonMatchingModules(element)) {
    return;
  }

  if (element.getAttribute("rel") === "nomodule") {
    element.setAttribute("rel", "preload");
  }

  return loadWithXhr(element);
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
      loadWithXhr(element);
  }
};
