function modifyPage(doc)
{
	if(this.features.enabled == false)
		return;

	if(doc.oz_data.profile != null && doc.oz_data.profile.search_me != null)
	{
		doc.oz_data.profile.search_me.appendChild(doc.createElement('br'));
		var a = doc.createElement('A');
		a.href = 'http://forum.onliner.by/search.php?search_id=egosearch';
		a.textContent = OLBY.getString('search_me.link');
		doc.oz_data.profile.search_me.appendChild(a);
	}
}

this.features.addFeature("enabled",  OLBY.getString('search_me.desc'));
