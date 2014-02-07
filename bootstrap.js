const {interfaces: Ci,	utils: Cu} = Components;
Cu.import('resource://gre/modules/Services.jsm');

var observer = {
    httpModify: {
        observe: function(aSubject, aTopic, aData) {
            //aSubject is i dont know what, but aSubject.documentElement is what we are after
            Cu.reportError('incoming observe httpModify - aSubject: "'+aSubject+'" | aTopic: "'+aTopic+'" | aData: "'+aData+'"');
			
            /*start - do not edit here*/
            var oHttp = aSubject.QueryInterface(Components.interfaces.nsIHttpChannel); //i used nsIHttpChannel but i guess you can use nsIChannel, im not sure why though
			try {
				var interfaceRequestor = oHttp.notificationCallbacks.QueryInterface(Components.interfaces.nsIInterfaceRequestor);
				//var DOMWindow = interfaceRequestor.getInterface(Components.interfaces.nsIDOMWindow); //not to be done anymore because: https://developer.mozilla.org/en-US/docs/Updating_extensions_for_Firefox_3.5#Getting_a_load_context_from_a_request //instead do the loadContext stuff below
				var loadContext;
				try {
					loadContext = interfaceRequestor.getInterface(Components.interfaces.nsILoadContext);
				} catch (ex) {
					try {
						loadContext = aSubject.loadGroup.notificationCallbacks.getInterface(Components.interfaces.nsILoadContext);
						//in ff26 aSubject.loadGroup.notificationCallbacks was null for me, i couldnt find a situation where it wasnt null, but whenever this was null, and i knew a loadContext is supposed to be there, i found that "interfaceRequestor.getInterface(Components.interfaces.nsILoadContext);" worked fine, so im thinking in ff26 it doesnt use aSubject.loadGroup.notificationCallbacks anymore, but im not sure
					} catch (ex2) {
						loadContext = null;
						//this is a problem i dont know why it would get here
					}
				}
				/*end do not edit here*/
				/*start - do all your edits below here*/
			} catch (ex0) {
				
			}
            var url = oHttp.URI.spec; //can get url without needing loadContext
			
            if (loadContext) {
				//todo: cDump(loadCotext,'loadContext',1); //find how i can get contentWindow so i cant test it agaisnt .frameElement
                var contentWindow = loadContext.associatedWindow; //this is the contentWindow of the document or the frameElement
				var contentDocument = contentWindow.document;
				//var contentContentDocument = contentWindow.contentDocument; //for testing purposes
				
				for (var o in observer) {
					//observer[o].unregister();
				}
				
					//Cu.reportError(contentDocument.location);
					//cDump(contentContentDocument,'contentContentDocument',0,3);
					//cDump(contentWindow,'contentWindow',1,0);
					//cDump(contentDocument,'contentDocument',1,0);
					//cDump(loadContext,'loadContext',1,0);
				/*
				if (contentWindow.frameElement) {
					//its a frame
					Cu.reportError('isItFrame=true');
				} else {
					Cu.reportError('isItFrame=false');
				}
				
				
				var browser = loadContext.chromeEventHandler; //this is the browser within the tab //this is where the example in the previous section ends
                //with load context we can go further and get a bunch of other useful stuff
                var aDOMWindow = browser.ownerDocument.defaultView; //this is the firefox window holding this tab
                var gBrowser = aDOMWindow.gBrowser //this is the gBrowser object of the firefox window this tab is in

				for (var t = 0; t < gBrowser.tabs.length && gBrowser.tabs[t].linkedBrowser != browser; t++);
				var aTab = gBrowser.tabs[t]; Cu.reportError('t=' + t); //this is the clickable tab xul element, the one found in the tab strip of the firefox window, aTab.linkedBrowser is same as browser var above

				aTab.style.backgroundColor = 'blue';
				aTab.style.fontColor = 'red';
				*/
                //end getting other useful stuff
            } else {
                Cu.reportError('EXCEPTION: Load Context Not Found!!');
            }
			
			var testThese = {
				'vals': {},
				'loadContext.associatedWindow': {},
				'loadContext.topWindow': {},
				'loadContext.topFrameElement': {},
				'loadContext.associatedWindow.frameElement': {},
				'loadContext.associatedWindow.frameElement.contentWindow': {},
				'loadContext.associatedWindow.document': {},
				'loadContext.associatedWindow.document.documentElement': {},
				/* 'loadContext.chromeEventHandler': {},
				'loadContext.chromeEventHandler.ownerDocument.defaultView': {},
				'loadContext.chromeEventHandler.ownerDocument.defaultView.gBrowser': {},
				'loadContext.chromeEventHandler.ownerDocument.defaultView.gBrowser.contentWindow': {} */
			}
			for (var n in testThese) {
				for (var n2 in testThese) {
					if (n2 == n) { continue; }
					if (n2 == 'vals') {
						try {
							testThese.vals[n] = eval(n);
						} catch (ex) {
							testThese.vals[n] = 'EX: ' + ex;
						}
						continue;
					}
					var evalThis = n + ' == ' + n2
					try {
						testThese[n][n2] = eval(evalThis);
					} catch (ex) {
						testThese[n][n2] = 'EX: ' + ex;
					}
				}
			}
			
			testThese.vals['oHttp'] = oHttp;
			testThese.vals['interfaceRequestor(oHttp.notificationCallbacks)'] = interfaceRequestor;
			testThese.vals['loadContext'] = loadContext;
			testThese.vals['oHttp.name'] = oHttp.name;
			
			//i want deep on these:
			testThese['oHttp'] = oHttp;
			testThese['interfaceRequestor(oHttp.notificationCallbacks)'] = interfaceRequestor;
			testThese['loadContext'] = loadContext;
			testThese['oHttp.URI'] = oHttp.URI;
			
			var httpFlags = {
				LOAD_REQUESTMASK: 65535,
				LOAD_NORMAL: 0,
				LOAD_BACKGROUND: 1,
				INHIBIT_PIPELINE: 64,
				INHIBIT_CACHING: 128,
				INHIBIT_PERSISTENT_CACHING: 256,
				LOAD_BYPASS_CACHE: 512,
				LOAD_FROM_CACHE: 1024,
				VALIDATE_ALWAYS: 2048,
				VALIDATE_NEVER: 4096,
				VALIDATE_ONCE_PER_SESSION: 8192,
				LOAD_ANONYMOUS: 16384,
				LOAD_FRESH_CONNECTION: 32768,
				LOAD_DOCUMENT_URI: 65536,
				LOAD_RETARGETED_DOCUMENT_URI: 131072,
				LOAD_REPLACE: 262144,
				LOAD_INITIAL_DOCUMENT_URI: 524288,
				LOAD_TARGETED: 1048576,
				LOAD_CALL_CONTENT_SNIFFERS: 2097152,
				LOAD_CLASSIFY_URI: 4194304,
				LOAD_TREAT_APPLICATION_OCTET_STREAM_AS_UNKNOWN: 8388608,
				LOAD_EXPLICIT_CREDENTIALS: 16777216,
				DISPOSITION_INLINE: 0,
				DISPOSITION_ATTACHMENT: 1,
			};
			var hasFlags = []; // if has LOAD_DOCUMENT_URI it usually also has LOAD_INITIAL_DOCUMENT_URI if its yop window, but on vie source we just see LOAD_DOCUMENT_URI. If frame we just see LOAD_DOCUMENT_URI. js css files  etc (i think just some imgs fire http modify, not sure, maybe all but not if cached) come in with LOAD_CLASSIFY_URI or no flags (0) 
			//note however, that if there is a redirect, you will get the LOAD_DOC_URI and the LOAD_INIT_DOC_URI on initial and then on consequent redirects until final redirect. All redirects have LOAD_REPLACE flag tho
			//note: i think all imgs throw http-on-modify but cahced images dont. images can also have LOAD_REPLACE flag
			/*
			nly time i saw flag == 0 is for favicon and:
			oHttp.name=http://stats.g.doubleclick.net/__utm.gif?utmwv=5.4.7dc&utms=2&utmn=1676837371&utmhn=www.w3schools.com&utmcs=windows-1252&utmsr=1280x1024&utmvp=1280x930&utmsc=24-bit&utmul=en-us&utmje=0&utmfl=12.0%20r0&utmdt=Tryit%20Editor%20v1.8&utmhid=421453928&utmr=-&utmp=%2Fjs%2Ftryit.asp%3Ffilename%3Dtryjs_myfirst&utmht=1391732799038&utmac=UA-3855518-1&utmcc=__utma%3D119627022.1168943572.1391716829.1391726523.1391732238.5%3B%2B__utmz%3D119627022.1391716904.2.2.utmcsr%3Dbing%7Cutmccn%3D(organic)%7Cutmcmd%3Dorganic%7Cutmctr%3Dw3schools%2520javascript%3B&utmu=q~
			*/
			/*
				//for github after LOAD_DOCUMENT_URI, it the does: 
				"LOAD_REQUESTMASK | 
				LOAD_BACKGROUND | 
				INHIBIT_PIPELINE | 
				LOAD_EXPLICIT_CREDENTIALS | 
				DISPOSITION_ATTACHMENT"
				//so tested on w3schools, if flags come out to be this above, then it is an ajax request, can have INHIBIT_CACHING flag
			*/
			/*
			notes start for http-on-examine-response
			if redirecting, do not get the initial redirects, only get the final redirect with LOAD_REPLACE and LOAD_DOCUMENT_URI and LOAD_INITIAL_DOCUMENT_URI
			*/
			for (var f in httpFlags) {
				if (oHttp.loadFlags & httpFlags[f]) {
					hasFlags.push(f);
				}
			}
			testThese.vals['oHttp hasFlags'] = hasFlags.join(' | ');	
			testThese.vals['oHttp.loadFlags'] = oHttp.loadFlags;	
			testThese['loadContext.associatedWindow'] = loadContext.associatedWindow;
			cDump(testThese,'testThese',2,false);
			
        },
        register: function() {
            Services.obs.addObserver(observer.httpModify, 'http-on-examine-response', false);
        },
        unregister: function() {
            Services.obs.removeObserver(observer.httpModify, 'http-on-examine-response');
        }
    }
};

function cDump(obj, title, deep, outputTarget) {
	//Services jsm must be imported
	//set deep to 1 to make it deep but initialize deeps div at none.
	//se deep to 2 to initialize at block
	//outputTarget == 0 then new tab, if set outputTarget to false then will do 0 but will load tab in background, if set to 0 or leave undefined it will load tab in foreground
	//outputTarget == 1 then reportError (cannot do deep in this outputTarget)
	//outputTarget == 2 then new window (not yet setup)
	//outputTarget == 3 then Services.console.logStringMessage
	//outputTarget == 'string', file at that path (not set up yet)
	var outputTargetsDisableDeep = [1,3];
    var tstr = '';
    var bstr = '';
    if (deep && outputTargetsDisableDeep.indexOf(outputTarget) == -1) {
        bstr = '<a href="javascript:void(0)" onclick="var subdivs = document.querySelectorAll(\'div > div\'); for(var i=0;i<subdivs.length;i++) { subdivs[i].style.display = subdivs[i].style.display==\'block\'?\'none\':\'block\'; }">Toggle All</a>\n\n';
    }
    var fstr = '';
    for (var b in obj) {
        try{
            bstr += b+'='+obj[b]+'\n';
            if (deep && outputTargetsDisableDeep.indexOf(outputTarget) == -1) {
                bstr += '<div style="margin-left:35px;color:gray;cursor:pointer;border:1px solid blue;" onclick="this.childNodes[1].style.display=this.childNodes[1].style.display==\'block\'?\'none\':\'block\';this.scrollIntoView(true);">click to toggle<div style="display:' + (deep==2 ? 'block' : 'none') + ';">';
                for (var c in obj[b]) {
                    try {
                        bstr += '\t\t\t' + c+'='+obj[b][c]+'\n';
                    } catch(e0) {
                        bstr += '\t\t\t' + c+'=e0=deep_fstr='+e0+'\n';
                    }	
                }
                bstr += '</div></div>'
            }
        } catch (e) {
                fstr = b+'='+e+'\n';
        }
    }
    if (deep && outputTargetsDisableDeep.indexOf(outputTarget) == -1) {
        bstr = bstr.replace(/<div[^>]*?>click to toggle<div[^>]*?><\/div><\/div>/g,'');
    }
    tstr += '<b>BSTR::</b>\n' + bstr;
    tstr += '\n<b>FSTR::</b>\n' + fstr;
    
	if (!outputTarget) {
		var cWin = Services.wm.getMostRecentWindow('navigator:browser');
		
		var onloadFunc = function() {
			//cWin.gBrowser.selectedTab = cWin.gBrowser.tabContainer.childNodes[cWin.gBrowser.tabContainer.childNodes.length-1];
			newTabBrowser.removeEventListener('load', onloadFunc, true);
			if (title) { newTabBrowser.contentDocument.title = title; }
			newTabBrowser.contentDocument.body.innerHTML = tstr.replace(/\n/g,'<br>')
		};
		
		var newTabBrowser = cWin.gBrowser.getBrowserForTab(cWin.gBrowser.loadOneTab('about:blank',{inBackground:outputTarget===false?true:false}));
		newTabBrowser.addEventListener('load', onloadFunc, true);
	} else if (outputTarget == 1) {
		tstr = 'CDUMP OF "' + title + '">>>\n\n' + tstr + ' "\n\nEND: CDUMP OF "' + title + '" ^^^';
		Cu.reportError(tstr);
	} else if (outputTarget == 2) {
		//to new window
	} else if (outputTarget == 3) {
		tstr = 'CDUMP OF "' + title + '">>>\n\n' + tstr + ' "\n\nEND: CDUMP OF "' + title + '" ^^^';
		Services.console.logStringMessage(tstr);
	}

}

function startup(aData, aReason) {
	for (var o in observer) {
		observer[o].register();
	}
}

function shutdown(aData, aReason) {
	if (aReason == APP_SHUTDOWN) return;
	for (var o in observer) {
		observer[o].unregister();
	}
}

function install() {}

function uninstall() {}