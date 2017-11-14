import { processScript, getPreloads, skipNonMatchingModules } from "./dom";

const removeLink = (link, preloads) => {
  preloads.splice(preloads.indexOf(link), 1);
};

const processLink = (link, preloads) => {
  processScript(link);
  removeLink(link, preloads);
  console.log(`processed preload "${link.href}"`);
};

const invokeLinkResources = preloads => {
  // async scripts
  preloads.filter(link => link.hasAttribute("async")).forEach(link => {
    if (link.hasAttribute("preloaded")) {
      processLink(link, preloads);
    }
  });

  // sync scripts
  preloads.filter(link => !link.hasAttribute("async")).some(link => {
    //kick out modules or nomodules
    if (link.hasAttribute("preloaded")) {
      processLink(link, preloads);
    } else {
      return true;
    }
  });
};

export const invokePreloads = () => {
  if (performance.now) {
    console.log(performance.now());
  }

  let interval;

  const preloads = getPreloads(
    "link[rel='preload'][as='script'],link[rel='preload'][as='worker']"
  );

  const criticals = preloads.filter(
    link => link.hasAttribute("critical") && !skipNonMatchingModules(link)
  );
  const noncriticals = preloads.filter(
    link => criticals.indexOf(link) === -1 && !skipNonMatchingModules(link)
  );

  const processLinks = () => {
    console.log(
      "check for invokable preload invocations",
      criticals,
      noncriticals
    );
    // first comes the criticals
    if (criticals) {
      invokeLinkResources(criticals);
    }

    //all other resources
    if (criticals.length === 0) {
      invokeLinkResources(noncriticals);
    }

    //if all resources are processed, remove interval, otherwise check again in X ms
    if (criticals.length === 0 && noncriticals.length === 0) {
      clearInterval(interval);
      console.log("invoked all preloads");
      if (performance.now) {
        console.log(performance.now());
      }
    }
  };

  // check every X ms if all preloaded resources are fetched
  interval = setInterval(processLinks, 50);

  // kill the listening 10s after window.load
  window.addEventListener("load", () => {
    setTimeout(() => {
      if (interval) {
        clearInterval(interval);

        if (criticals.length || noncriticals.length) {
          console.error("could not invoke all preloads!");
        } else {
          console.log("invoked all preloads");
        }
      }
    }, 10000);
  });
};
