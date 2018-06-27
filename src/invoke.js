import {
  processScript,
  getPreloads,
  skipNonMatchingModules,
  processCss
} from "./dom";

let setNonCriticalAsync = true;

const processLink = (link, isAsync, resolve) => {
  if (link.getAttribute("preloaded") === "true") {
    processScript(link, isAsync, resolve);
  } else if (link.getAttribute("preloaded") === "error") {
    resolve();
  } else {
    setTimeout(() => {
      processLink(link, isAsync, resolve);
    }, 10);
  }
};

const invokeCriticalLinkResources = preloads => {
  const promises = [];

  while (preloads.length) {
    promises.push(
      new Promise(resolve => {
        processLink(preloads.shift(), false, resolve);
      })
    );
  }

  return Promise.all(promises);
};

const invokeNonCriticalLinkResources = preloads => {
  const promises = [];

  while (preloads.length) {
    promises.push(
      new Promise(resolve => {
        processLink(preloads.shift(), setNonCriticalAsync, resolve);
      })
    );
  }

  return Promise.all(promises);
};

const perfLog = () => {
  if (window.performance && window.performance.now) {
    console.log(window.performance.now());
  }
};
const invokePreloads = () => {
  perfLog();
  const preloads = getPreloads("link[rel='preload'][as='script']");

  let preload,
    criticals = [],
    noncriticals = [];

  while ((preload = preloads.shift()) !== undefined) {
    if (!skipNonMatchingModules(preload)) {
      if (preload.hasAttribute("critical")) {
        criticals.push(preload);
      } else {
        noncriticals.push(preload);
      }
    }
  }

  setNonCriticalAsync = criticals.length === 0;

  console.log(
    "check for invokable preload invocations",
    criticals,
    noncriticals
  );

  // first comes the criticals
  invokeCriticalLinkResources(criticals)
    .then(() => invokeNonCriticalLinkResources(noncriticals))
    .then(() => {
      document.dispatchEvent(new CustomEvent("AllScriptsExecuted"));
      perfLog();
    });
};

document.addEventListener("DOMContentLoaded", invokePreloads);

export default element => {
  let preload;
  const preloads = getPreloads("link[rel='preload']", element);

  while ((preload = preloads.shift()) !== undefined) {
    if (preload.getAttribute("as") === "script") {
      if (!skipNonMatchingModules(preload)) {
        processScript(preload, false);
      }
    } else if (preload.getAttribute("as") === "style") {
      processCss(preload);
    } else {
      console.error("unprocessable preload found", preload);
    }
  }
};
