function modifyPage(doc)
{
	if(this.features.enabled == false)
		return;
		
	var autologin = doc.oz_data.autologin;
	if(autologin == null)
		return;

	var br = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefBranch)
		.getBranch("extensions.phpBBx-helper.autologin.");

	autologin.usr.value = br.getComplexValue("username", Components.interfaces.nsISupportsString).data;
	autologin.pwd.value = br.getComplexValue("password", Components.interfaces.nsISupportsString).data;
	autologin.btn.click();
}

// 'name', 'desc', 'defvaleu', 'visible'
this.features.addFeature("enabled",  OLBY.getString('autologin-desc'), false, false);
this.prefpage = 'options.xul';
this.prefpage_name = 'Autologin';