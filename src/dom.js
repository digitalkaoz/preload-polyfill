export const createIframe = () => {
  const iframe = document.createElement("iframe");

  iframe.style.cssText = "display:none";
  //iframe.sandbox = "allow-top-navigation allow-same-origin";
  iframe.setAttribute("role", "presentation");
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

export const processScript = link => {
  const script = document.createElement("script");

  if (link.hasAttribute("async")) {
    script.async = false;
  } else {
    script.async = link.hasAttribute("async");
  }
  script.src = link.href;

  link.parentNode.insertBefore(script, link);

  return script;
};

export const processCss = link => {
  link.rel = "stylesheet";
  link.onload = null;

  return link;
};

export const getPreloads = () => {
  const resources = [];
  return toArray(
    document.querySelectorAll(
      "link[rel='preload'][as='script'],link[rel='preload'][as='style']"
    )
  ).filter(v => {
    if (resources.indexOf(v.href) === -1) {
      resources.push(v.href);
      return true;
    }
    return false;
  });
};

const toArray = nodeList => {
  return Array.prototype.slice.call(nodeList);
};
