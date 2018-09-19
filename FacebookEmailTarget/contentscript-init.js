
// inject javascript, may be based on specific url
function executeScripts(tabId, injectDetailsArray){
    function createCallback(tabId, injectDetails, innerCallback){
        return function(){
            chrome.tabs.executeScript(tabId, injectDetails, innerCallback);
        };
    }

    var callback = null;

    for(var i = injectDetailsArray.length - 1; i >= 0; --i){
        callback = createCallback(tabId, injectDetailsArray[i], callback);
	}

    if(callback !== null){
        callback();   // execute outermost function
	}
}




