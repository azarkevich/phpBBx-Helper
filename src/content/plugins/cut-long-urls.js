function modifyPage(doc, expanded)
{
	if(this.features.enabled == false)
		return;

	var long_urls = doc.execXPath("//a[string-length(text()) > 100 and count(child::*) = 0]");
	long_urls.forEach(
		function(u)
		{
			var t = u.textContent;
			u.textContent = t.substr(0, 20) + " ... " + t.substr(t.length - 20);
		}
	);
}

function modifyExpandedPage(doc)
{
	modifyPage(doc, true);
}

this.features.addFeature("enabled",  OLBY.getString('cut-long-urls.desc'));
