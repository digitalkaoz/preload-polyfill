export const processScript = link => {
  const script = document.createElement("script");

  if (!link.hasAttribute("async")) {
    script.async = false;
  } else {
    script.async = link.hasAttribute("async");
  }

  if (!window.PRELOAD_USED) {
    if (link.hasAttribute("type")) {
      script.type = link.getAttribute("type");
    }
    if (link.hasAttribute("nomodule")) {
      script.setAttribute("nomodule", "nomodule");
    }
  }

  script.src = link.href;

  link.rel = "none";
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
