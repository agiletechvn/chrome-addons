// JavaScript Document
/*
 * PROXY
 */
var $proxy = {
	cache	: [],
	
	get		: function(url, cache){
		cache	= cache || false;
		ajax({
			url			: url,
			callback	: function(data, err, xhr){
				if(!err){
					var temp 	= [];
					if(!data.trim() || data.match(/\<(html|head|meta|body)/i) !== null){
						return false;
					}
					
					var temp 	= data.split(/\n/);
					$proxy.cache = [];
					temp.forEach(function(item){
					   var value = item.trim();
					   if(value){
						   $proxy.cache.push(value);
					   }
					});
					
					if(cache){
						if($ls.has('proxy')){
							$ls.remove('proxy');
						}
						
						if($proxy.cache.length > 0){
							$ls.set('proxy', $proxy.cache);
						}
					}
				}
			}	
		});
	},
	
	remove		: function(fn){
		var config = {
            mode: "direct"
        };
		
		chrome.proxy.settings.set({value: config, scope: 'regular'}, function(){
			if(fn && (typeof fn === 'function' || typeof window[fn] === 'function')){
				fn.apply(this, arguments);	
			}	
		});
	},
	
	next	: function(){
		var proxy = $proxy.cache.shift();
        $proxy.cache.push(proxy);
        return proxy;	
	},
	
	current	: function(){
		return $proxy.cache[0];
	},
	
	change	: function(proxy, fn, condition){
		condition = condition || "host == 'facebook.com'";
        var config = {
            mode: "pac_script",
            pacScript: {
                data: "function FindProxyForURL(url, host) {\n" +
                        "  if (" + condition + ")\n" +
                        "    return 'PROXY " + proxy + "';\n" +
                        "  return 'DIRECT';\n" +
                        "}"
            }
        };
          
        chrome.proxy.settings.set({value: config, scope: 'regular'}, function(){
			if(fn && (typeof fn === 'function' || typeof window[fn] === 'function')){
				fn.apply(this, arguments);	
			}	
		});
	},
	
	changeAuto	: function(callback){
		this.change(this.next(), callback)
	}
};


// JavaScript Document
// check browser for remove cookie domain
// support chrome

window.$cookie = function(name, value, expires, path){
	// get cookie
	if(arguments.length == 1){
		name 	= name + "=";
		var ca	= document.cookie.split(';');
		for(var i=0; i<ca.length; i++){
			var c = ca[i].trim();
			if(c.indexOf(name) == 0){
				return c.substring(name.length, c.length);
			}
		}
	}
	// set cookie
	else if(arguments.length > 1){
		if(typeof expires === 'undefined'){
			expires = 365;
		}		
		expires	= expires*24*60*60*1000;
		
		if(typeof path === 'undefined'){
			path = '/';	
		}
		
		document.cookie = name + '=' + value + ';' + ' expires=' + expires + ';' + ' path=' + path + ';';
	}
}

// delete cookie
$cookie.remove = function(name){
	document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';	
}

// check browser
$cookie.browser	= function(){
	var m = navigator.userAgent.match(/(chrome|firefox)\/([\S]+)/i);
	if(m == null){
		return null;
	}else{
		return m[1].toLowerCase();	
	}
}

// cookie domain
$cookie.domain = {
	get	: function(option, callback){
		if(typeof option !== 'object'){
			option = {};
		}
		
		if(typeof callback === 'function'){
			
		}else if(typeof window[callback] === 'function'){
			callback = window[callback];
		}else{
			callback = null;	
		}
		
		switch($cookie.browser()){
			case 'chrome':
				chrome.cookies.getAll(option, function(cookies){
					if(typeof callback === 'function'){
						callback(cookies);	
					}
				});
				break;
		}
	},
	
	set	: function(cookie, ret){
		ret					= ret || true;
		newCookie 			= {};
		newCookie.url 		= "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path;
		newCookie.name 		= cookie.name;
		newCookie.value 	= cookie.value;
		newCookie.path 		= cookie.path;
		newCookie.storeId 	= cookie.storeId;
		
		if(!cookie.hostOnly){
			newCookie.domain = cookie.domain;
		}
		
		if(!cookie.session){
			var expirationDate = new Date(cookie.expirationDate).getTime() / 1000.0;	
			//var expirationDate = (expiration != null) ? parseFloat(expiration) / 1000.0 : new Date().getTime() / 1000.0;			
			newCookie.expirationDate = expirationDate;
		}
		
		newCookie.secure = cookie.secure;
		newCookie.httpOnly = cookie.httpOnly;
		
		if(!ret){
			return newCookie;	
		}
		
		switch($cookie.browser()){
			case 'chrome':
				chrome.cookies.set(newCookie, function(){});
				break;
		}
	},
	
	remove	: function(cookie){
		var url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path;
	
		switch($cookie.browser()){
			case 'chrome':
				chrome.cookies.remove({"url": url, "name": cookie.name});
				break;
		}
	},
	
	change	: function(callback, params){
		params 	= typeof params === 'object' ? params : {};
		if(typeof callback === 'function'){
		}else if(typeof window[callback] === 'function'){
			callback = window[callback];
		}
		
		if(typeof callback !== 'function'){
			return false;
		}
		
		switch($cookie.browser()){
			case 'chrome':
				chrome.cookies.onChanged.addListener(function(info){
					if(params.domain && params.domain == info.cookie.domain){
						chrome.cookies.getAll(params, function(cookies){
							callback(cookies, info);
						});	
					}
				});
				break;
		}
	}
};

/*
 * LOCAL STORAGE
 * no need to store in sync mode
 */
window.$ls = {
    set : function(name, value){
        localStorage.setItem(name, typeof value == 'object' || typeof value == 'function' ? JSON.stringify(value) : value);
    },
	
    has : function(name){
        return localStorage.getItem(name) != null;
    },
	
    get : function(name){		
		if(this.has(name)){
			return JSON.parse(localStorage.getItem(name));
		}else{
			return null;	
		}
    },
	
    remove : function(name){
        localStorage.removeItem(name);
    }
};

/*
 * MESSAGE BACKGROUND
 */	
var Message = function(name){
	this.name = name;
	this.port = chrome.runtime.connect({name : name});		
	return this;
}

Message.DEFAULTS = {
	name	: null,
	port	: null
};

Message.prototype.send = function(params, callback){
	this.port.postMessage(params || {});
	if(callback && typeof callback === 'function'){					
		this.port.onMessage.addListener(callback);
	}
	
	return this;
}

/*
 * GET EXTENSION VERSION
 */
function get_version(){
	return chrome.app.getDetails().version;	
}

/* 
 * GET EXTENSION DIR
 */
function get_root_dir(){
	return chrome.extension.getURL('manifest.json').replace(/manifest\.json/i, '');	
}

/*
 * GET EXTESION ID
 */
function get_ext_id(){
	return get_root_dir().replace(/[^\/].*\/\/([a-z]+)(\/?)/i, '$1');	
}

/*
 * CREATE TAB
 */
function create_tab(url, async, callback){
	url 	= url.toLowerCase();
	if(typeof async === 'undefined'){
		async = false;	
	}else{
		if(typeof async === 'string'){
			async = new RegExp(async, 'i');
		}
	}
	
	chrome.windows.getAll({"populate": true}, function(windows){
		var existing_tab = null;
		for(var i in windows){
			var tabs = windows[i].tabs;
			for(var j in tabs){
				var tab = tabs[j];
				if(async === false || typeof async == 'object'){
					if((tab.url.toLowerCase() === url) || tab.url.match(async) !== null){
						existing_tab = tab;
						break;
					}
				}									
			}
		}
		
		if(existing_tab){
			chrome.tabs.update(existing_tab.id, {"selected": true}, callback);
		}else{
			chrome.tabs.create({"url": url, "selected": true}, callback);
		}
	});
}

/*
 * EXCUTE SCRIPT
 */
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

if(!Function.prototype.bind){ // check if native implementation available
	Function.prototype.bind = function(){ 
		var fn 		= this, 
			args 	= Array.prototype.slice.call(arguments),
			object 	= args.shift(); 
			
		return function(){ 
			return fn.apply(object, args.concat(Array.prototype.slice.call(arguments))); 
		};
	};
}

/*
 * RELOAD ALL TAB
 */
function get_all_tab(callback){
	chrome.windows.getAll({populate: true}, function(windows){		
		var _tabs = [];
		for(var i in windows){
			var tabs = windows[i].tabs;
			for(var j in tabs){
				_tabs.push(tabs[j]);
			}
		}
		
		if(typeof callback === 'function'){
		}else if(typeof window[callback] === 'function'){
			callback = window[callback];
		}else{
			callback = null;	
		}
		
		if(typeof callback === 'function'){
			callback(_tabs);
		}
	});	
}

/*
 * SET TAB ACTIVE
 */
function set_active_tab(id){
	update_tab(id, {selected: true});
}

/*
 * UPDATE TAB
 */
function update_tab(id, option, callback){
	option = option || {};	
	chrome.tabs.update(id, option, callback);
}

/*
 * RELOAD TAB
 */
function reload_tab(id){
	chrome.tabs.reload(id);
}


// JavaScript Document
window.$facebook = {
	webUrl			: 'https://www.facebook.com/',
	
	loginUrl		: function(){
		return this.webUrl + 'login.php';	
	},
	
	settingUrl		: function(){
		return this.webUrl + 'settings';
	},
	
	graphUrl		: function(){
		return this.webUrl.replace(/www/i, 'graph');	
	},
	
	searchUrl		: function(){
		return this.webUrl + 'search/';	
	},
	
	ajaxUrl			: function(){
		return this.webUrl + 'ajax/';
	},
	
	ajaxSearch	: function(q){
		if(typeof q === 'undefined'){
			q = '';	
		}
		
		if(q.trim().length > 0){
			q += '/';	
			return this.ajaxUrl() + q + 'search.php';
		}else{
			return null;	
		}		
	},
	
	isUrl			: function(url){
		var matches = url.match(/(http|https):\/\/((.*?)\.)?facebook\.com(.*)?/i);
		return matches == null ? false : matches;
	},
	
	isLogged		: function(){
		return $cookie('fb.uid') > 0 ? true : false;
	},
	
	getAjaxData		: function(url, timeout, async){
		var matches	= null;
		var result	= '';
		
		if(typeof timeout == 'boolean'){
			result = url;
		}else{
			$.ajax({
				url			: url,
				type		: 'GET', 
				dataType	: 'html', 
				async		: typeof async === 'undefined' ? false : async,
				timeout		: typeof timeout === 'undefined' ? 3000 : timeout,
				success		: function(ret){
					result = ret;
				}
			});
		}
		
		matches = result.match(/"entries":(\[{(.*?)}\])/i);
		
		if(matches !== null){
			return $.parseJSON(matches[1].replace(/([^\\]|^)\\x/g, '$1\\u00'));
		}else{
			return [];	
		}
		
		return data;
	},
        
        getHtml : function(html){
            var codeContent = $.map(html.match(/<code[^>]*>\s*<!--(.*?)(?=-->\s*<\/code>)/g),
                                function(item) {
                                    return item.replace(/^<code[^>]*>\s*<!--/, '');
                                }).join();
                                return codeContent;
        },   
	
	languages 		: {
		"so_SO" : "Af-Soomaali",
		"af_ZA" : "Afrikaans",
		"ay_BO" : "Aymar aru",
		"az_AZ" : "Azərbaycan dili",
		"id_ID" : "Bahasa Indonesia",
		"ms_MY" : "Bahasa Melayu",
		"jv_ID" : "Basa Jawa",
		"cx_PH" : "Bisaya",
		"bs_BA" : "Bosanski",
		"ca_ES" : "Català",
		"cs_CZ" : "Čeština",
		"ck_US" : "Cherokee",
		"cy_GB" : "Cymraeg",
		"da_DK" : "Dansk",
		"se_NO" : "Davvisámegiella",
		"de_DE" : "Deutsch",
		"et_EE" : "Eesti",
		"en_IN" : "English (India)",
		"en_PI" : "English (Pirate)",
		"en_GB" : "English (UK)",
		"en_UD" : "English (Upside Down)",
		"en_US" : "English (US)",
		"es_LA" : "Español",
		"es_CL" : "Español (Chile)",
		"es_CO" : "Español (Colombia)",
		"es_ES" : "Español (España)",
		"es_MX" : "Español (México)",
		"es_VE" : "Español (Venezuela)",
		"eo_EO" : "Esperanto",
		"eu_ES" : "Euskara",
		"tl_PH" : "Filipino",
		"fo_FO" : "Føroyskt",
		"fr_CA" : "Français (Canada)",
		"fr_FR" : "Français (France)",
		"fy_NL" : "Frysk",
		"ga_IE" : "Gaeilge",
		"gl_ES" : "Galego",
		"gn_PY" : "Guarani",
		"hr_HR" : "Hrvatski",
		"xh_ZA" : "isiXhosa",
		"zu_ZA" : "isiZulu",
		"is_IS" : "Íslenska",
		"it_IT" : "Italiano",
		"sw_KE" : "Kiswahili",
		"ku_TR" : "Kurdî",
		"lv_LV" : "Latviešu",
		"fb_LT" : "Leet Speak",
		"lt_LT" : "Lietuvių",
		"li_NL" : "Limburgs",
		"la_VA" : "lingua latina",
		"hu_HU" : "Magyar",
		"mg_MG" : "Malagasy",
		"mt_MT" : "Malti",
		"nl_NL" : "Nederlands",
		"nl_BE" : "Nederlands (België)",
		"nb_NO" : "Norsk (bokmål)",
		"nn_NO" : "Norsk (nynorsk)",
		"uz_UZ" : "O'zbek",
		"pl_PL" : "Polski",
		"pt_BR" : "Português (Brasil)",
		"pt_PT" : "Português (Portugal)",
		"qu_PE" : "Qhichwa",
		"ro_RO" : "Română",
		"rm_CH" : "Rumantsch",
		"sq_AL" : "Shqip",
		"sk_SK" : "Slovenčina",
		"sl_SI" : "Slovenščina",
		"fi_FI" : "Suomi",
		"sv_SE" : "Svenska",
		"vi_VN" : "Tiếng Việt",
		"tl_ST" : "tlhIngan-Hol",
		"tr_TR" : "Türkçe",
		"el_GR" : "Ελληνικά",
		"gx_GR" : "Ἑλληνική ἀρχαία",
		"be_BY" : "Беларуская",
		"bg_BG" : "Български",
		"kk_KZ" : "Қазақша",
		"mk_MK" : "Македонски",
		"mn_MN" : "Монгол",
		"ru_RU" : "Русский",
		"sr_RS" : "Српски",
		"tt_RU" : "Татарча",
		"tg_TJ" : "тоҷикӣ",
		"uk_UA" : "Українська",
		"ka_GE" : "ქართული",
		"hy_AM" : "Հայերեն",
		"yi_DE" : "ייִדיש",
		"he_IL" : "עברית",
		"ur_PK" : "اردو",
		"ar_AR" : "العربية",
		"ps_AF" : "پښتو",
		"fa_IR" : "فارسی",
		"sy_SY" : "ܐܪܡܝܐ",
		"ne_NP" : "नेपाली",
		"mr_IN" : "मराठी",
		"sa_IN" : "संस्कृतम्",
		"hi_IN" : "हिन्दी",
		"bn_IN" : "বাংলা",
		"pa_IN" : "ਪੰਜਾਬੀ",
		"gu_IN" : "ગુજરાતી",
		"or_IN" : "ଓଡ଼ିଆ",
		"ta_IN" : "தமிழ்",
		"te_IN" : "తెలుగు",
		"kn_IN" : "ಕನ್ನಡ",
		"ml_IN" : "മലയാളം",
		"si_LK" : "සිංහල",
		"th_TH" : "ภาษาไทย",
		"km_KH" : "ភាសាខ្មែរ",
		"ko_KR" : "한국어",
		"zh_TW" : "中文(台灣)",
		"zh_CN" : "中文(简体)",
		"zh_HK" : "中文(香港)",
		"ja_JP" : "日本語"
	}
};