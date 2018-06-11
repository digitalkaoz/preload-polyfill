import { setLoaded, processCss } from "./dom";

window.invokePreload = window.invokePreload || {};

invokePreload.onLoad = setLoaded;
invokePreload.onScriptLoad = setLoaded;
invokePreload.onScriptError = link => setLoaded(link, true);
invokePreload.onStyleLoad = processCss;
