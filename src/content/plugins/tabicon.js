function olby_set_tab_icon(doc, newUrl)
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
			tabbrowser.setIcon(tab, newUrl);
		}
	}
}

function modifyPage(doc, expanded)
{
	if(this.features.enabled == false)
		return;

	var pager = doc.oz_data.pager;
	if(pager == null || pager.cur_page == null || (pager.cur_page == pager.max_page && expanded == null))
		return;

	var site = doc.olby_site;
	if(expanded == null)
	{
		olby_set_tab_icon(doc, 'chrome://onliner-by-helper/skin/' + site + '/icon-fwd.png');
	}
	else
	{
		olby_set_tab_icon(doc, 'chrome://onliner-by-helper/skin/' + site + '/icon-all.png');
	}
}

function modifyExpandedPage(doc)
{
	modifyPage(doc, true);
}

this.features.addFeature("enabled",  OLBY.getString('modify-fav-icon'));
