console.log("bar");

document.getElementById("img").setAttribute("src", "/example/img_fjords.jpg");
window.log("whoohoo it works");

window.log("testing layer");

window.setTimeout(function() {
    var fragment = '<div id="layer"><link rel="preload" as="style" href="layer.css" onload="invokePreload.onStyleLoad(this)"/><link rel="preload" as="script" href="layer.js" onload="invokePreload.onScriptLoad(this)" onerror="invokePreload.onScriptError(this)"/></div>';
    document.body.insertAdjacentHTML( 'beforeend',  fragment);

    preload_polyfill_invoke(document.getElementById("layer"));
}, 2000);
