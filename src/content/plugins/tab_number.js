function modifyPage(doc)
{
	if(this.features.enabled == false)
		return;
		
	var unread_links = doc.oz_data.unread_links;
	if(unread_links == null || unread_links.length == 0)
		return;
	
	var title = doc.execXPathOne('/html/head/title');
	if(title == null)
		return;

	title.textContent = "[" + unread_links.length + "] " + title.textContent;
}

this.features.addFeature("enabled",  OLBY.getString('tab-number-desc'));
