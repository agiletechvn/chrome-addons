chrome.pageAction.onClicked.addListener(function (tab) {
    chrome.tabs.create({
        url: chrome.extension.getURL('recursive/app.htm?url=' + encodeURI(tab.url))
    }, function (tab) {
    });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    var url = tab.url;
    if(url.indexOf("https://www.facebook.com") == -1) {
       // chrome.pageAction.show(tabId);
    } else {
        chrome.pageAction.show(tabId);
    }
});


chrome.runtime.onMessage.addListener(function(msg, sender) {
    /* First, validate the message's structure */
    if (msg.from && (msg.from === "content")
            && msg.subject && (msg.subject = "showPageAction")) {
        /* Enable the page-action for the requesting tab */
        if(tab.href.indexOf('facebook') !== -1)
            chrome.pageAction.hide(sender.tab.id);
       // else  chrome.pageAction.hide(sender.tab.id);
        
        /*
    	chrome.tabs.executeScript(
			sender.tab.id, {file:"jquery.min.js"}
		);
    	
    	chrome.tabs.executeScript(
			sender.tab.id, {file:"background.code.js"}
		);*/
    }
});





