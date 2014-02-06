const {interfaces: Ci,	utils: Cu} = Components;
Cu.import('resource://gre/modules/Services.jsm');
const ignoreFrames = true;

function addDiv(theDoc) {
	//Cu.reportError('addDiv');
	if (!theDoc) { Cu.reportError('no doc!'); return; }//document not provided, it is undefined likely
	if (!theDoc instanceof Ci.nsIDOMHTMLDocument) { Cu.reportError('not html doc'); return; }//not html document, so its likely an xul document
	if(!(theDoc.location  && theDoc.location.host.indexOf('github.com') > -1)) {Cu.reportError('location not match host:' + theDoc.location.host); return;}
	Cu.reportError('addDiv match - theDoc.location = "' + theDoc.location + '" | theDoc.location.host = "' + theDoc.location.host + '"');
	
	if (!theDoc.querySelector) {
		Cu.reportError('querySelector is not in theDoc');
		theDoc = theDoc.document; //no idea but this is the magic fix for when document-element-inserted calls add div
	}
	removeDiv(theDoc);
	
	return;
	var script = theDoc.createElement('script');
	script.setAttribute('src', chromePath + 'inject.js');
	script.setAttribute('id', 'ghForkable_inject');
	theDoc.documentElement.appendChild(script);
}

function removeDiv(theDoc, skipChecks) {
	Cu.reportError('removeDiv');
	if (!skipChecks) {
		if (!theDoc) { Cu.reportError('no doc!'); return; }//document not provided, it is undefined likely
		if (!theDoc instanceof Ci.nsIDOMHTMLDocument) { Cu.reportError('not html doc'); return; }//not html document, so its likely an xul document
		if(!(theDoc.location  && theDoc.location.host.indexOf('github.com') > -1)) {Cu.reportError('location not match host:' + theDoc.location.host); return;}
		Cu.reportError('removeDiv match - theDoc.location = "' + theDoc.location + '" | theDoc.location.host = "' + theDoc.location.host + '"');
	}
	//cDump(theDoc, 'theDoc', 1);
	if (!theDoc.querySelector) {
		Cu.reportError('querySelector is not in theDoc');
		theDoc = theDoc.document; //no idea but this is the magic fix for when document-element-inserted calls add div
	}
	
	return;
	
	var alreadyThere = theDoc.querySelector('#ghForkable_inject');
	if (alreadyThere) {
		alreadyThere.parentNode.removeChild(alreadyThere);
	}
	
	var forkBtn = theDoc.querySelector('.ghForkable_fork'); //do this check because if script there, it doesnt necessarily have the btn, cuz script checks whether to add btn or not
	if (forkBtn) {
		forkBtn.parentNode.removeChild(forkBtn);
	}
}

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
				'loadContext.chromeEventHandler': {},
				'loadContext.chromeEventHandler.ownerDocument.defaultView': {},
				'loadContext.chromeEventHandler.ownerDocument.defaultView.gBrowser': {},
				'loadContext.chromeEventHandler.ownerDocument.defaultView.gBrowser.contentWindow': {}
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
			
			//cDump(testThese,'testThese',1);
			try {
				cDump(loadContext.associatedWindow,'loadContext.associatedWindow',1);
			} catch(ignore) {}
			
        },
        register: function() {
            Services.obs.addObserver(observer.httpModify, 'http-on-modify-request', false);
        },
        unregister: function() {
            Services.obs.removeObserver(observer.httpModify, 'http-on-modify-request');
        }
    }
};

function loadIntoWindow (aDOMWindow, aXULWindow) {
	if (!aDOMWindow) {
		return;
	}
	if (aDOMWindow.gBrowser) {
		if (aDOMWindow.gBrowser.tabContainer) {
			//has tabContainer
			//start - go through all tabs in this window we just added to
			var tabs = aDOMWindow.gBrowser.tabContainer.childNodes;
			for (var i = 0; i < tabs.length; i++) {
				Cu.reportError('DOING tab: ' + i);
				var tabBrowser = tabs[i].linkedBrowser;
				var win = tabBrowser.contentWindow;
				loadIntoContentWindowAndItsFrames(win);
			}
			//end - go through all tabs in this window we just added to
		} else {
			//does not have tabContainer
			var win = aDOMWindow.gBrowser.contentWindow;
			loadIntoContentWindowAndItsFrames(win);
		}
	} else {
		//window does not have gBrowser
		//Cu.reportError('not a match its just doing non-gBrowser-ed window');
		loadIntoContentWindowAndItsFrames(aDOMWindow);
	}
}

function unloadFromWindow(aDOMWindow, aXULWindow) {
	if (!aDOMWindow) {
		return;
	}
	if (aDOMWindow.gBrowser) {
		if (aDOMWindow.gBrowser.tabContainer) {
			//has tabContainer
			//start - go through all tabs in this window we just added to
			var tabs = aDOMWindow.gBrowser.tabContainer.childNodes;
			for (var i = 0; i < tabs.length; i++) {
				Cu.reportError('DOING tab: ' + i);
				var tabBrowser = tabs[i].linkedBrowser;
				var win = tabBrowser.contentWindow;
				unloadFromContentWindowAndItsFrames(win);
			}
			//end - go through all tabs in this window we just added to
		} else {
			//does not have tabContainer
			var win = aDOMWindow.gBrowser.contentWindow;
			unloadFromContentWindowAndItsFrames(win);
		}
	} else {
		//window does not have gBrowser
		Cu.reportError('match in non-gBrowser-ed window');
		unloadFromContentWindowAndItsFrames(aDOMWindow);
	}
}

function loadIntoContentWindowAndItsFrames(theWin) {
	var frames = theWin.frames;
	var winArr = [theWin];
	for (var j = 0; j < frames.length; j++) {
		winArr.push(frames[j].window);
	}
	Cu.reportError('# of frames in tab: ' + frames.length);
	for (var j = 0; j < winArr.length; j++) {
		if (j == 0) {
			Cu.reportError('**checking win: ' + j + ' location = ' + winArr[j].document.location);
		} else {
			Cu.reportError('**checking frame win: ' + j + ' location = ' + winArr[j].document.location);
		}
		var doc = winArr[j].document;
		//START - edit below here
		addDiv(doc);
		if (ignoreFrames) {
			break; //uncomment this line if you don't want to add to frames
		}
		//END - edit above here
	}
}

function unloadFromContentWindowAndItsFrames(theWin) {
	var frames = theWin.frames;
	var winArr = [theWin];
	for (var j = 0; j < frames.length; j++) {
		winArr.push(frames[j].window);
	}
	Cu.reportError('# of frames in tab: ' + frames.length);
	for (var j = 0; j < winArr.length; j++) {
		if (j == 0) {
			Cu.reportError('**checking win: ' + j + ' location = ' + winArr[j].document.location);
		} else {
			Cu.reportError('**checking frame win: ' + j + ' location = ' + winArr[j].document.location);
		}
		var doc = winArr[j].document;
		//START - edit below here
		removeDiv(doc);
		if (ignoreFrames) {
			break; //uncomment this line if you don't want to add to frames
		}
		//END - edit above here
	}
}

function cDump(obj, title, deep, outputTarget) {
	//Services jsm must be imported
	//outputTarget == 0 then new tab
	//outputTarget == 1 then reportError (cannot do deep in this outputTarget)
	//outputTarget == 2 then new window (not yet setup)
	//outputTarget == 3 then Services.console.logStringMessage
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
                bstr += '<div style="margin-left:35px;color:gray;cursor:pointer;border:1px solid blue;" onclick="this.childNodes[1].style.display=this.childNodes[1].style.display==\'block\'?\'none\':\'block\';this.scrollIntoView(true);">click to toggle<div style="display:none;">';
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
			cWin.gBrowser.selectedTab = cWin.gBrowser.tabContainer.childNodes[cWin.gBrowser.tabContainer.childNodes.length-1];
			newTabBrowser.removeEventListener('load', onloadFunc, true);
			if (title) { newTabBrowser.contentDocument.title = title; }
			newTabBrowser.contentDocument.body.innerHTML = tstr.replace(/\n/g,'<br>')
		};
		
		var newTabBrowser = cWin.gBrowser.getBrowserForTab(cWin.gBrowser.addTab('about:blank'));
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
	let XULWindows = Services.wm.getXULWindowEnumerator(null);
	while (XULWindows.hasMoreElements()) {
		let aXULWindow = XULWindows.getNext();
		let aDOMWindow = aXULWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
		loadIntoWindow(aDOMWindow, aXULWindow);
	}
	
	for (var o in observer) {
		observer[o].register();
	}
}

function shutdown(aData, aReason) {
	if (aReason == APP_SHUTDOWN) return;
	for (var o in observer) {
		observer[o].unregister();
	}
	
	let XULWindows = Services.wm.getXULWindowEnumerator(null);
	while (XULWindows.hasMoreElements()) {
		let aXULWindow = XULWindows.getNext();
		let aDOMWindow = aXULWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
		unloadFromWindow(aDOMWindow, aXULWindow);
	}
}

function install() {}

function uninstall() {}