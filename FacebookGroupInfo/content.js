/* Inform the backgrund page that 
 * this tab should have a page-action */
chrome.runtime.sendMessage({
    from: "content",
    subject: "showPageAction"
});


/* Listen for message from the popup */

/* Listen for message from the popup */
chrome.runtime.onMessage.addListener(function(msg, sender, response) {
	
    /* First, validate the message's structure */
    if (msg.from && (msg.from === "popup")
            && msg.subject && (msg.subject === "DOMReady")) {
        //console.log('body' + location.href + ':'+);
        // don't trust document ready :D, just when we get title, things ready
        var ret = msg.data;  
        var titleEl = getEl(ret.title);
    	response(titleEl.length || $.isReady);
    	//response($('body').size());
    }
    
});


// we can use if else from msg, because it run parallel, must check msg in one condition
chrome.runtime.onMessage.addListener(function(msg, sender, response) {
	
    /* First, validate the message's structure */
    if (msg.from && (msg.from === "popup")
            && msg.subject && (msg.subject === "DOMInfo")) {
    		
    		var ret = msg.data;  
    		
    		// user can upload file into this popup ?
    		
    		var imgEl = getEl(ret.img),contentClone = getEl(ret.content).clone(),contentHtml, imgSrc='';
    		var titleEl = getEl(ret.title), descriptionEl = getEl(ret.description), categoryEl = getEl(ret.category);
    		var fileExt = [
    		           	"png", 
    		        	"jpg", 
    		        	"gif", 
    		        	"ico", 
    		        	"jpeg",
    		        	"flv", 
    		        	"avi", 
    		        	"wmv", 
    		        	"mp4",
    		        	"wav", 
    		        	"mp3",
    		        	"bin", 
    		        	"zip", 
    		        	"dat", 
    		        	"7z", 
    		        	"rar", 
    		        	"tar", 
    		        	"gz"
    		        	];
    		
    		
    		//imgEl.remove();  
    		
    		// try to find image
    		if(imgEl.size() && !imgEl.is('img')){
    			imgEl = imgEl.find('img');    		
    		}
    		
    		/*contentClone.append('<a href="http://vnexpress.net">Just for test link</a>')
    					.append('<a href="http://vnexpress.net/file.jpg">Just for test file</a>');*/
    		
    		// remove javascript and tag link
    		contentClone.find('script').remove().end()
    			.find('a').each(function(){
    				var el = $(this);
    				var tmp = (el.attr('href')||'').split(".");
    		        var extension = tmp[tmp.length - 1];
    		        if(extension && fileExt.indexOf(extension.toLowerCase()) == -1){
    		        	el.contents().unwrap();
    		        }    		        
    			});
    		
    		// remove image
    		if(imgEl.size()){
    			imgSrc = imgEl[0].src;//.split('?')[0];
    			/*contentClone.find('img').each(function(){
    				// absolute image
    				var currentSrc = this.src;//.split('?')[0];
    				if(currentSrc == imgSrc){
    					// find parent that content text describe
    					var parent = $(this).parent(), temp;
    					while(true){
    						var text = $.trim(parent.text());
    						if(text){
    							if(text.length < 200){
    								parent.remove();    	
    							}
    							break;
    						}
    						temp = parent;    						
    						parent = parent.parent();
    						temp.remove();
    						if(!parent.size()){
    							break;
    						}
    					}
    				}
    			});*/
    			//console.log(imgEl.attr('src'),contentClone.find('img').attr('src'));
    			//var imgHtml = $('<div>').append(imgEl.clone()).html();
    			// delete first image that exist, or all image ?
    			//contentClone.find('img[src=' + imgEl.attr('src') + ']').remove();
    		}
    		
    		// clean html here
    		contentHtml = $.trim(contentClone.html());
    		

    		
    		//console.log(imgEl);    		
    		var tagEl = getEl(ret.tag), tagText = replaceTag(tagEl);
			/*if(tagText){    				
				tagText = replaceTag(tagText);
			}*/
    		
    		var categoryText = $.trim((categoryEl.text()||'').replace(/(?:trang\s+chủ|home)[^\w]+/ig,''));
                
                categoryText = categoryText.split(/^[\s>+;,\/\\]+/i).pop();
        
    		var domInfo = {
	            title: $.trim(titleEl.text()),
	            tag: tagText,
	            description: $.trim(descriptionEl.text()),
	            category: categoryText,
				content: contentHtml,
				img: imgSrc,				
				url: location.href,
				source: ret.domain,
				tabid: msg.tabid
	        };   
    		response(domInfo);    	            		
        
    }
});