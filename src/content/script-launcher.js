OLBY = new Object();

OLBY.getString = function(name)
{
	if(this.pluginsStringBundle == null)
	{
		this.pluginsStringBundle = Components.classes["@mozilla.org/intl/stringbundle;1"]
			.getService(Components.interfaces.nsIStringBundleService)
			.createBundle("chrome://phpBBx-helper/locale/plugins.properties");
	}
	return this.pluginsStringBundle.GetStringFromName(name);
}

function phpBBx_loadDependencies()
{
	var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
		   .getService(Components.interfaces.mozIJSSubScriptLoader);

	loader.loadSubScript('chrome://phpBBx-helper/content/utils.js');
	loader.loadSubScript('chrome://phpBBx-helper/content/page_parser.js');
	loader.loadSubScript('chrome://phpBBx-helper/content/plugins-manager.js');

	OLBY.Plugins = phpBBx_loadPlugins();
}

function phpBBx_OnContentLoad(e)
{
	try
	{
		if(phpBBx_isAddinEnabled() == false)
			return;

		if(e.target == null || e.target.location == null)
			return;

		var doc = e.target.wrappedJSObject;
		if(doc == null)
			return;
		
		var href = doc.location.href;

		var force = phpBBx_getForce();
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

		doc.phpBBx_site = force.site;
			
		if(phpBBx_reloadEachTime)
		{
			phpBBx_loadDependencies();
		}
		
		phpBBx_utils_install(doc);
		
		doc.oz_data = new phpBBx_PageParser(doc, force.page);
		
		doc.addEventListener("phpBBx_PageExpanded", 
			function(e)
			{
				doc.oz_data = new phpBBx_PageParser(doc, force.page);
				
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

function phpBBx_getForce()
{
	if(phpBBx_prefBranch.getBoolPref("force") == false)
		return null;
	
	var force = new Object();
	force.site = phpBBx_prefBranch.getCharPref("force.site");
	force.page = phpBBx_prefBranch.getCharPref("force.page");
	return force;
}

function phpBBx_isAddinEnabled()
{
	if(phpBBx_prefBranch.prefHasUserValue("enabled") == false) 
		return true;
	return phpBBx_prefBranch.getBoolPref("enabled");
}

function phpBBx_enableAddin(enable)
{
	phpBBx_prefBranch.setBoolPref("enabled", enable);
}

function phpBBx_OnLoad()
{
	var appcontent = window.document.getElementById("appcontent");
	if (appcontent && appcontent.phpBBx_helper_done == null)
	{
		appcontent.phpBBx_helper_done = true;
		appcontent.addEventListener("DOMContentLoaded", phpBBx_OnContentLoad, false);
	}
}

function phpBBx_OnUnload()
{
	//remove now unnecessary listeners
	var	appcontent = window.document.getElementById("appcontent");
	appcontent.removeEventListener("DOMContentLoaded", phpBBx_OnContentLoad, false);

	window.removeEventListener('load', phpBBx_OnLoad, false);
	window.removeEventListener('unload', phpBBx_OnUnload, false);
}

window.addEventListener('load', phpBBx_OnLoad, false);
window.addEventListener('unload', phpBBx_OnUnload, false);

phpBBx_prefBranch = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.phpBBx-helper.");
phpBBx_prefBranch.QueryInterface(Components.interfaces.nsIPrefBranchInternal);

phpBBx_reloadEachTime = false;
if(phpBBx_prefBranch.prefHasUserValue("ReloadEachTime"))
	phpBBx_reloadEachTime = phpBBx_prefBranch.getBoolPref("ReloadEachTime");

phpBBx_loadDependencies();
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