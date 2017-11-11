console.log("foo.js");
if (window.criticalFunction) {
    console.log(window.criticalFunction);
} else {
    throw new Error("critical wasnt loaded");
}

window.log = function(msg){
    console.log(msg);
}