function phpBBx_buildOptions()
{
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]  
		.getService(Components.interfaces.nsIWindowMediator); 

	var enumerator = wm.getEnumerator("navigator:browser");
	
	while(enumerator.hasMoreElements())
	{
		var win = enumerator.getNext();
		if(win.OLBY != null)
		{
			oz_olby = win.OLBY;
			break;
		}
	} 

	oz_preferences = document.getElementById('preferences-plugins');
	oz_prefwindow = document.getElementById('phpBBx-prefwindow-options');
	oz_prefpane = document.getElementById('plugins-holder');
	
	oz_olby.Plugins.forEach(
		function(plugin)
		{
			var gb = document.createElement('groupbox');
			var settCount = 0;
			plugin.features.array.forEach(
				function(feature)
				{
					if(feature.visible)
					{
						add_plugin_feature(plugin, feature, gb);
						settCount++;
					}
				}
			);
			
			if(settCount > 0)
			{
				var caption = document.createElement('caption');
				caption.setAttribute('label', plugin.name);
				gb.appendChild(caption);
				oz_prefpane.appendChild(gb);
			}
		}
	);
}

function add_plugin_feature(plugin, feature, gb)
{
	var br = plugin.pref_branch;
	if(br.prefHasUserValue(feature.name) == false)
	{
		br.setBoolPref(feature.name, feature.default_value);
	}

	var preference = window.document.createElement('preference');
	preference.id = feature.branch;
	preference.setAttribute('name', feature.branch);
	preference.setAttribute('type', 'bool');
	oz_preferences.appendChild(preference);

	var check = window.document.createElement('checkbox');
	check.setAttribute('label', feature.description);
	check.setAttribute('preference', preference.id);
	gb.appendChild(check);
}

phpBBx_buildOptions();