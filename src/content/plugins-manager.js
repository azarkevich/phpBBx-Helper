function phpBBx_getContentDir()
{
	var il = Components.classes["@mozilla.org/extensions/manager;1"]
			   .getService(Components.interfaces.nsIExtensionManager)
			   .getInstallLocation("phpBBx-helper@sergey.azarkevich");
	var dir = il.location;
	dir.append("phpBBx-helper@sergey.azarkevich");
	if(dir.isFile())
	{
		// open an input stream from file
		var istream = Components.classes["@mozilla.org/network/file-input-stream;1"]
			.createInstance(Components.interfaces.nsIFileInputStream);
		istream.init(dir, 0x01, 0444, 0);
		istream.QueryInterface(Components.interfaces.nsILineInputStream);

		// read lines into array
		var line = {}, lines = [], hasmore;
		do {
		  hasmore = istream.readLine(line);
		  lines.push(line.value); 
		} while(hasmore);

		istream.close();

		// do something with read data
		dir = Components.classes["@mozilla.org/file/local;1"].
			createInstance(Components.interfaces.nsILocalFile);
		dir.initWithPath(lines[0]);
	}

	dir.append("content");
	
	return dir;
}

function phpBBx_getPlugins()
{
	var dir = phpBBx_getContentDir();

	dir.append("plugins");
	
	var entries = dir.directoryEntries;
	var array = [];
	while(entries.hasMoreElements())
	{
	  var entry = entries.getNext();
	  entry.QueryInterface(Components.interfaces.nsIFile);
	  array.push(entry);
	}
	
	return array;
}

function phpBBx_loadPlugins()
{
	var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
		.getService(Components.interfaces.mozIJSSubScriptLoader);

	var array = phpBBx_getPlugins();
	var plugins = new Array();
	for(var i=0;i<array.length;i++)
	{
		var file = array[i];
		if(file.leafName == ".svn")
			continue;

		var plugin = new Object();

		plugin.name = file.leafName.replace(/\.js$/, '');

		var base_uri = 'chrome://phpBBx-helper/content/plugins/';
		
		if(file.isDirectory())
		{
			base_uri += file.leafName + "/";
			file.append("plugin.js")
		}

		if(file.isFile() == false)
			continue;

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
		plugin.url = base_uri + file.leafName;
		loader.loadSubScript(plugin.url, plugin);
		if(plugin.prefpage != null)
			plugin.prefpage = base_uri + plugin.prefpage;
		plugins.push(plugin);
	}
	return plugins;
}
