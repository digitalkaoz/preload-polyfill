console.log("nomodule");

window.criticalFunction = function() {
    console.log('i should be executed first');
}