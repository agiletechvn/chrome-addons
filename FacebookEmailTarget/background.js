if (!chrome.runtime) {
  // Chrome 20-21
  chrome.runtime = chrome.extension;
} else if(!chrome.runtime.onMessage) {
  // Chrome 22-25
  chrome.runtime.onMessage = chrome.extension.onMessage;
  chrome.runtime.sendMessage = chrome.extension.sendMessage;
  //chrome.runtime.onConnect = chrome.extension.onConnect;
  //chrome.runtime.connect = chrome.extension.connect;
}


var manifest = chrome.runtime.getManifest();
var version = manifest.version;

var previousVersion = localStorage['version'];

if (!previousVersion) {
    //chrome.tabs.create({url: "redirect.html"});
    localStorage['version'] = version;
}

var checkForValidUrl = function (tabId, changeInfo, tab) {
    var urlMatchesFacebook = /https?:\/\/www\.facebook\.com\/.*/.test(tab.url);
    if(urlMatchesFacebook) {
        chrome.pageAction.show(tabId);
    } else {
        chrome.pageAction.hide(tabId);
    }
};

// BACKGROUND SCRIPT CODE
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.method == "getLocalStorage")
    sendResponse({data: localStorage[request.key]}); // decodeURIComponent
  else if (request.method == "setLocalStorage")
	sendResponse({data: localStorage[request.key]=request.value});
  //else
  //  sendResponse({}); // send empty response
});


