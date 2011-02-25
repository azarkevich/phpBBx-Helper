function handleNode(node)
{
	if(node.hasChildNodes)
	{
		for(var i=0;i<node.childNodes.length;i++)
		{
			this.handleNode(node.childNodes[i]);
		}
	}

	if(node.nodeName == '#text')
	{
		node.textContent = node.textContent.replace(/\){3,}/g, ':)');
	}
}

function phpBBx_toggle_display(id)
{
	var el = document.getElementById(id);
	if(el.style.display == "none")
		el.style.display = "block";
	else
		el.style.display = "none";
}

function modifyPage(doc)
{
	if(this.features.enabled == false)
		return;
	
	phpBBx_install_script(doc, this.phpBBx_toggle_display); 
	
	var br = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefBranch)
		.getBranch("extensions.phpBBx-helper.ignore-users.");

	var users = [];
	if(br.prefHasUserValue("users"))
	{
		users = br.getComplexValue("users", Components.interfaces.nsISupportsString).data.split(";");
	}

	if(users.length == 0)
		return;

	// generate XPath condition
	var user_cond = "";
	users.forEach(
		function(u)
		{
			if(user_cond.length != 0)
				user_cond += " or ";
			
			user_cond += "text()=\"" + u + "\"";
		}
	)
	
	var cond = "//table[@class='forumline']//a[@class='name'][" + user_cond + "]/parent::*/parent::*/td[last()]//index/span[@class='postbody' and not (@zb_done)]";
	var ignored_texts = doc.execXPath(cond);
	ignored_texts.forEach(
		function(it)
		{
			it.style.display = 'none';
			it.setAttribute('zb_done', 'done');

			var onoff = doc.createElement('span');
			onoff.innerHTML = "<small><font color='red'>Ignored. Click to show.</font></small>";
			onoff.style.border = 'thin dashed';
			onoff.style.padding = '2px';
			onoff.style.cursor = 'pointer';
			onoff.setAttribute("onclick", "phpBBx_toggle_display('" + it.id + "')");

			it.parentNode.insertBefore(onoff, it);
		}
	);
}

this.modifyExpandedPage = this.modifyPage;

// 'name', 'desc', 'defvaleu', 'visible'
this.features.addFeature("enabled",  OLBY.getString('ignore-users')); //, true, false);
