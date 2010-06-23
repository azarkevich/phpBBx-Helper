OLBY = new Object();

OLBY.getString = function(name)
{
	if(this.pluginsStringBundle == null)
	{
		this.pluginsStringBundle = Components.classes["@mozilla.org/intl/stringbundle;1"]
			.getService(Components.interfaces.nsIStringBundleService)
			.createBundle("chrome://onliner-by-helper/locale/plugins.properties");
	}
	return this.pluginsStringBundle.GetStringFromName(name);
}

function olby_loadDependencies()
{
	var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
		   .getService(Components.interfaces.mozIJSSubScriptLoader);

	loader.loadSubScript('chrome://onliner-by-helper/content/utils.js');
	loader.loadSubScript('chrome://onliner-by-helper/content/page_parser.js');
	loader.loadSubScript('chrome://onliner-by-helper/content/plugins-manager.js');

	OLBY.Plugins = olby_loadPlugins();
}

function olby_OnContentLoad(e)
{
	try
	{
		if(olby_isAddinEnabled() == false)
			return;

		if(e.target == null || e.target.location == null)
			return;

		var doc = e.target.wrappedJSObject;
		if(doc == null)
			return;
		
		var href = doc.location.href;

		var force = olby_getForce();
		if(force == null)
		{
			var onliner = false;
			var zelenybor = false;
			onliner = /(forum|baraholka)\.onliner\.by/.test(href);	// %%CHECK.ONLINER%%
			zelenybor = /forum\.zelenybor\.(by|com)/.test(href); // %%CHECK.ZELENYBOR%%
			
			if (onliner == false && zelenybor == false)
				return;

			force = new Object();
			force.site = onliner ? "olby" : "zeby";
		}

		doc.olby_site = force.site;
			
		if(olby_reloadEachTime)
		{
			olby_loadDependencies();
		}
		
		onliner_by_utils_install(doc);
		
		doc.oz_data = new OLBY_PageParser(doc, force.page);
		
		doc.addEventListener("Olby_PageExpanded", 
			function(e)
			{
				doc.oz_data = new OLBY_PageParser(doc, force.page);
				
				OLBY.Plugins.forEach(
					function(plugin)
					{
						if(plugin.modifyExpandedPage != null)
							plugin.modifyExpandedPage(doc);
					}
				);
			},
		false);

		OLBY.Plugins.forEach(
			function(plugin)
			{
				plugin.modifyPage(doc);
			}
		);

		OLBY.Plugins.forEach(
			function(plugin)
			{
				if(plugin.runPage != null)
					plugin.runPage(doc)
			}
		);
	}
	catch(e)
	{
		alert(e + '\n' + e.fileName + ':' + e.lineNumber + '\n\nStack:\n' + e.stack);
	};
}

function olby_getForce()
{
	if(olby_prefBranch.getBoolPref("force") == false)
		return null;
	
	var force = new Object();
	force.site = olby_prefBranch.getCharPref("force.site");
	force.page = olby_prefBranch.getCharPref("force.page");
	return force;
}

function olby_isAddinEnabled()
{
	if(olby_prefBranch.prefHasUserValue("enabled") == false) 
		return true;
	return olby_prefBranch.getBoolPref("enabled");
}

function olby_enableAddin(enable)
{
	olby_prefBranch.setBoolPref("enabled", enable);
}

function olby_OnLoad()
{
	var	appcontent = window.document.getElementById("appcontent");
	if (appcontent && appcontent.onliner_by_helper_done == null)
	{
		appcontent.onliner_by_helper_done = true;
		appcontent.addEventListener("DOMContentLoaded", olby_OnContentLoad, false);
	}
}

function olby_OnUnload()
{
	//remove now unnecessary listeners
	var	appcontent = window.document.getElementById("appcontent");
	appcontent.removeEventListener("DOMContentLoaded", olby_OnContentLoad, false);

	window.removeEventListener('load', olby_OnLoad, false);
	window.removeEventListener('unload', olby_OnUnload, false);
}

window.addEventListener('load', olby_OnLoad, false);
window.addEventListener('unload', olby_OnUnload, false);

olby_prefBranch = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.onliner-by-helper.");
olby_prefBranch.QueryInterface(Components.interfaces.nsIPrefBranchInternal);

olby_reloadEachTime = false;
if(olby_prefBranch.prefHasUserValue("ReloadEachTime"))
	olby_reloadEachTime = olby_prefBranch.getBoolPref("ReloadEachTime");

olby_loadDependencies();
/*
var cacheService = Components.classes["@mozilla.org/network/cache-service;1"]
	.getService(Components.interfaces.nsICacheService);

var cacheVisitor =
{
	visitDevice: function(deviceId, di)
	{
		alert(di.description);
		return true;
	},
	
	visitEntry: function(deviceId, entryInfo)
	{
		return true;
	}
 };	

cacheService.visitEntries(cacheVisitor);
*/