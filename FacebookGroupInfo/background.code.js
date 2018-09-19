
// just bind click one time
// remember that we can't call function that is binded to event, we just inject new code 
if( $('body').attr('sik-click') == undefined ){
	
	chrome.storage.sync.set({
			activeSelector: {},		
			backgroundDone: true,
			currentSelector: null,
		}, function(){
		//console.log(selector);
	
		var prevEl = null;
		var prevBg = null;
		var prevBd = null;				
	
		//disable other action
		$('body').off().mousedown(function(e){
			
			// process for right click only
			if (e.which !== 3 || e.target.tagName in ['HTML','BODY']){
				return true;
			}
			
			var el =  $(e.target);
			//rebind
			//if(!prevEl || (prevEl[0] != el[0])){
		
			
				if(prevEl){
					prevEl.css('background', prevBg);
					if(prevEl.is('img'))
						prevEl.css('border', prevBd);
				}
				
				
				prevEl = el;
				
				//console.log(prevEl);
				
				prevBg = prevEl.css('background');
				prevBd = prevEl.css('border');
				prevEl.css('background', 'red');
				if(prevEl.is('img'))
					prevEl.css('border', '1px solid red');
				
				chrome.storage.sync.get({
					currentSelector: null,
					activeSelector:{}
				}, function(localItems){
						
					
					chrome.storage.sync.get({
						sikRecord: false,
						selector: {}
					  }, function(items) {
						 
						  // although we mark as sik-record on body, it just help us to debug quikly
						  
						// if record then save selector  
						if(items.sikRecord){
							var newSelector = {};
							newSelector[localItems.currentSelector] = getSelector(prevEl);
							
							var selector = $.extend(items.selector, newSelector);
							
							chrome.storage.sync.set({selector: selector}, function(){
								//console.log(selector);
							});
						
						} 
						// else just save current content, and when load page, get current content to bind
						// after that, delete current content, and just bind only one time
						//else {
							var currentContent = null;// = prevEl.is('img') ? prevEl.is('img')[0].src : prevEl.html()
							switch(localItems.currentSelector){
								case 'img':
									var tempEl = prevEl;
									if(!prevEl.is('img')){
										tempEl = prevEl.find('img');
									}
									if(tempEl.size()){
										currentContent = tempEl[0].src;
									}
									break;
								
								case 'content':
									currentContent = $.trim(prevEl.html());
									break;
									
								case 'tag':
									/*var tagText = $.trim(prevEl.text());
					    			if(tagText){    				
					    				currentContent = replaceTag(tagText);
					    			}*/
									currentContent = replaceTag(prevEl);
						    		break;
									
								default:
									currentContent = $.trim(prevEl.text());
									break;
									
							}
							
							var activeSelector = localItems.activeSelector;
							activeSelector[localItems.currentSelector] = currentContent;
							chrome.storage.sync.set({activeSelector: activeSelector}, function(){
								//console.log(selector);
							});
							
							// override activeSelector
							/*chrome.storage.sync.set({currentContent: currentContent}, function(){
								//console.log(selector);
							});*/
						//}
					
					});
				
				});
				
				e.preventDefault();
				e.stopPropagation();
				return false;
				
			//}
			
		}).attr('sik-click', 'true').attr('oncontextmenu','return false;');;
		
	});


	

} else {
	// mark up ready
	chrome.storage.sync.set({	
		backgroundDone: true
	});
}



