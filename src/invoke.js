import { processScript, getPreloads } from "./dom";
import { ES6 } from "./loaders";

const criticalSort = (a, b) => {
  const aVal = a.hasAttribute("critical") ? 0 : 1;
  const bVal = b.hasAttribute("critical") ? 0 : 1;

  if (aVal < bVal) return -1;
  if (aVal > bVal) return 1;

  return 0;
};

const removeLink = (link, preloads) => {
  preloads.splice(preloads.indexOf(link), 1);
};

const processLink = (link, polyfilled, preloads) => {
  processScript(link, polyfilled);
  removeLink(link, preloads);
  console.log(`processed preload "${link.href}"`);
};

const invokeLinkResources = (preloads, polyfilled) => {
  // async scripts
  preloads.filter(link => link.hasAttribute("async")).forEach(link => {
    if (
      (link.hasAttribute("nomodule") && ES6) ||
      (link.getAttribute("type") === "module" && !ES6)
    ) {
      removeLink(link, preloads);
    } else if (!polyfilled || link.hasAttribute("preloaded")) {
      processLink(link, polyfilled, preloads);
    }
  });

  // sync scripts
  preloads.filter(link => !link.hasAttribute("async")).some(link => {
    //kick out modules or nomodules
    if (
      (link.hasAttribute("nomodule") && ES6) ||
      (link.hasAttribute("type") &&
        link.getAttribute("type") === "module" &&
        !ES6)
    ) {
      removeLink(link, preloads);
    } else if (!polyfilled || link.hasAttribute("preloaded")) {
      processLink(link, polyfilled, preloads);
    } else {
      return true;
    }
  });
};

export const invokePreloads = polyfilled => {
  let interval;

  const processLinks = () => {
    const preloads = getPreloads(
      "link[rel='preload'][as='script'],link[rel='preload'][as='worker']"
    );
    const criticals = preloads
      .filter(link => link.hasAttribute("critical"))
      .sort(criticalSort);
    const noncriticals = preloads
      .filter(link => criticals.indexOf(link) === -1)
      .sort(criticalSort);

    console.log(
      "check for invokable preload invocations",
      criticals,
      noncriticals
    );
    // first comes the criticals
    if (criticals) {
      invokeLinkResources(criticals, polyfilled);
    }

    //all other resources
    if (criticals.length === 0) {
      invokeLinkResources(noncriticals, polyfilled);
    }

    //if all resources are processed, remove interval, otherwise check again in X ms
    if (criticals.length === 0 && noncriticals.length === 0) {
      clearInterval(interval);
      console.log("invoked all preloads");
    }
  };

  // check every X ms if all preloaded resources are fetched
  interval = setInterval(processLinks, 50);
};
