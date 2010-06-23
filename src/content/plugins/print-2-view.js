function modifyPage(doc)
{
	if(this.features.enabled == false)
		return;

	if(doc.oz_data.printview != null)
	{
		var topicSpan = doc.execXPathOne("/html/body/span[@class='Topic']");
		if(topicSpan == null)
			return;

		var a = doc.createElement("a");
		a.textContent = topicSpan.textContent;
		a.className = topicSpan.className;
		a.href = doc.oz_data.printview.full_href;
		topicSpan.parentNode.replaceChild(a, topicSpan);
	}
}

this.features.addFeature("enabled",  OLBY.getString('print-2-view-desc'));
