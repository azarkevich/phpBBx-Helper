function onliner_by_utils_install(doc)
{
	doc.execXPath = function (xpath, ctx, nsResolver)
	{
		var d = this;
		if(d.wrappedJSObject != null)
			d = d.wrappedJSObject;

		if(ctx == null)
			ctx = d;

		var xs = d.evaluate(
			xpath,
			ctx,
			nsResolver,
			XPathResult.ANY_TYPE,
			null);

		var ret = Array();
		var x = xs.iterateNext();
		while(x != null)
		{
			ret.push(x);
			x = xs.iterateNext();
		}
		return ret;
	};
	
	doc.execXPathOne = function (xpath, ctx, nsResolver)
	{
		var d = this;
		if(d.wrappedJSObject != null)
			d = d.wrappedJSObject;
		var res = d.execXPath(xpath, ctx, nsResolver);
		if(res.length != 1)
			return null;
		return res[0];
	}
	
	doc.addEventListener("OnGetClipboardText", phpBBx_onGetClipboardText, false);
}

function phpBBx_onGetClipboardText(e)
{
	var clip = Components.classes["@mozilla.org/widget/clipboard;1"]
		.getService(Components.interfaces.nsIClipboard);

	var trans = Components.classes["@mozilla.org/widget/transferable;1"].  
		createInstance(Components.interfaces.nsITransferable);  
	trans.addDataFlavor("text/unicode");  
	
	clip.getData(trans, clip.kGlobalClipboard);  
	var str = new Object();  
	var strLength = new Object();  
	trans.getTransferData("text/unicode", str, strLength);
	
	var dataHolder = e.target.getElementById('phpBBx_clipboard');
	if(dataHolder == null)
	{
		dataHolder = e.target.createElement('OLBYClipboard');
		dataHolder.id = 'phpBBx_clipboard';
		e.target.documentElement.appendChild(dataHolder);
	}
	
	dataHolder.textContent = "";

	if (str)
	{
		str = str.value.QueryInterface(Components.interfaces.nsISupportsString);
		dataHolder.textContent = str.data.substring(0, strLength.value / 2);
	}
}

function phpBBx_install_script(doc, funct)
{
	var body = doc.execXPathOne("/html/body");
	if(body == null)
		return;
	var script = doc.createElement("script");
	script.type = "text/javascript";
	script.language = "javascript";
	script.text = funct.toString();
	body.appendChild(script);
}