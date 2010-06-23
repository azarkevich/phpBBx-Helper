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

function modifyPage(doc)
{
	if(doc.oz_data.posts == null || this.features.enabled == false)
		return;

	doc.oz_data.posts.forEach(function(node) {this.handleNode(node)}, this);
}

this.modifyExpandedPage = this.modifyPage;

this.features.addFeature("enabled",  OLBY.getString("fix-smileys-desc"));
