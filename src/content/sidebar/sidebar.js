OLBY.Sidebar = new Object();

OLBY.Sidebar.toggleSidebar = function()
{
	var splitter = document.getElementById('olby-sidebar-splitter');
	var sidebar = document.getElementById('olby-sidebar');
	
	var hide = !sidebar.hidden;

	
	var pref = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.onliner-by-helper.sidebar.");

	if(hide)
	{
		// save height
		pref.setIntPref('height', sidebar.boxObject.height);
	}
	else
	{
		if(pref.prefHasUserValue("height"))
			sidebar.height = pref.getIntPref('height');
		else
			sidebar.height = 300;
	}

	sidebar.hidden = hide;
	splitter.hidden = hide;
}

function olby_tab_selected()
{
	var tabbrowser = document.getElementsByTagName('tabbrowser')[0];
	var doc = tabbrowser.selectedBrowser.contentDocument;

	if(doc.wrappedJSObject != null)
		doc = doc.wrappedJSObject;

	var enable = (doc.oz_data != null);
	
	var sidebar = document.getElementById('olby-sidebar');
	sidebar.enable = enable;
}

var tabbrowser = document.getElementsByTagName('tabbrowser')[0];
if(tabbrowser != null)
{
	tabbrowser.tabContainer.addEventListener('select', olby_tab_selected, false);
}
