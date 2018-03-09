import { processCss } from "./dom";

const setLoaded = (element, error = false) => {
  element.setAttribute("preloaded", error ? "error" : true);
  element.removeEventListener("load", onLoad);
  element.removeAttribute("onload");
  element.onload = null;
  console.log(
    `${error ? "error when preloading" : "successfully preloaded"} "${
      element.href
    }"`
  );
};

/**
 * called when a preload is loaded
 */
const onLoad = (event, element) => {
  //immediate invoke css
  if (element.getAttribute("as") === "style") {
    setLoaded(element);
    processCss(element);

    return;
  }

  setLoaded(element);

  element.dispatchEvent(new CustomEvent("load", event));
};

const onError = (event, element) => {
  setLoaded(element, true);
};

const loadWithFetch = element => {
  const options = {
    method: "GET",
    mode: "cors",
    cache: "force-cache"
  };

  fetch(element.href, options)
    .then(response => {
      if (response.ok) {
        onLoad(null, element);
      } else {
        onError(null, element);
      }
    })
    .catch(() => onError(null, element));
};

/**
 * load preload with non-blocking xhr
 */
const loadWithXhr = element => {
  if (window.fetch) {
    return loadWithFetch(element);
  }

  const request = new XMLHttpRequest();

  request.addEventListener("load", event => {
    if (request.status >= 200 && request.status < 300) {
      onLoad(event, element);
    } else {
      onError(event, element);
    }
  });
  request.open("GET", element.href, true);
  request.send();
};

const loadImage = element => {
  const img = new Image();

  img.onload = event => onLoad(event, element);
  img.onerror = event => onError(event, element);
  img.src = element.href;
};

const loadStyle = element => {
  element.onload = event => onLoad(event, element);
  element.onerror = event => onError(event, element);

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

  var f = new FontFace(
    element.getAttribute("name"), 
    `url(${element.href})`,
    {
      weight: element.getAttribute("weight") || "normal"
    });

  f
    .load(element.href)
    .then(loadedFace => {
      document.fonts.add(loadedFace);
      onload(null, element);
    })
    .catch(console.error);
};

const loadScript = element => {
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
