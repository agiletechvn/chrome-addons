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

/**
 * Possible parameters for request:
 *  action: "xhttp" for a cross-origin HTTP request
 *  method: Default "GET"
 *  url   : required, but not validated
 *  data  : data to send in a POST request
 *
 * The callback function is called upon completion of the request */

/**/
chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    if (request.action == "xhttp") {
        var xhttp = new XMLHttpRequest();
        var method = request.method ? request.method.toUpperCase() : 'GET';

        xhttp.onload = function() {
            callback(xhttp.responseText);
        };
        xhttp.onerror = function() {
            // Do whatever you want on error. Don't forget to invoke the
            // callback to clean up the communication port.
            callback();
        };
        xhttp.open(method, request.url, true);
        if (method == 'POST') {
            xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        xhttp.send(request.data);
        return true; // prevents the callback from being called too early on return
    }
});

/**/


