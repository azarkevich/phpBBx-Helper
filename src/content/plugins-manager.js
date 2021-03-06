function phpBBx_loadPlugins()
{
	var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
		.getService(Components.interfaces.mozIJSSubScriptLoader);

	var base_uri = 'chrome://phpBBx-helper/content/plugins/';
	
	var array = phpBBx_getPluginUrls();
	var plugins = new Array();
	for(var i=0;i<array.length;i++)
	{
		var file = array[i];

		var plugin = new Object();

		plugin.name = file.replace(/\.js$/, '').replace(/^([^\/]*\/)*/, '');
		
		plugin.pref_branch_name = "extensions.phpBBx-helper." + plugin.name + ".";
		plugin.pref_branch = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch(plugin.pref_branch_name);

		plugin.features = new Object();
		plugin.features.plugin = plugin;
		plugin.features.array = new Array();
		plugin.features.addFeature = function(id, desc, def, vis)
		{
			var f = {
				name : id,
				description : desc,
				branch : plugin.pref_branch_name + id,
				default_value: (def == null ? true : def),
				visible: (vis == null ? true : vis)
			}
			this.array.push(f);
			this.__defineGetter__(
				id,
				function()
				{
					var br = this.plugin.pref_branch;
					if(br.prefHasUserValue(id) == false)
					{
						return f.default_value;
					}
					return this.plugin.pref_branch.getBoolPref(id);
				}
			);
		}
		plugin.base_url = base_uri;
		plugin.url = file;
		loader.loadSubScript(plugin.url, plugin);
		plugins.push(plugin);
	}
	return plugins;
}
