function getTabBrowser(doc)
{
	var tabbrowser = document.getElementsByTagName('tabbrowser')[0];
	if(tabbrowser == null)
		return;
	
	// find my tab
	var tabContainer = tabbrowser.tabContainer;
	for(var tabIndex = 0; tabIndex < tabContainer.childNodes.length; tabIndex++)
	{
		var tab = tabContainer.childNodes[tabIndex];
		var browser = tabbrowser.getBrowserForTab(tab);
		if(browser.contentDocument == doc)
		{
			return browser;
		}
	}
	return null;
}

function modifyPage(doc)
{
	if(this.features.enabled == false)
		return;
	if(/search_id=active\?days=\d+/.test(doc.location.href) == false)
		return;
	
	var browser = getTabBrowser(doc);
	if(browser == null)
		return;
	var newUrl = doc.location.href.replace(/search_id=active\?days=/, 'search_id=active&days=');
	browser.loadURI(newUrl);
}

this.features.addFeature("enabled",  OLBY.getString('plugin.fix-new.desc'));
