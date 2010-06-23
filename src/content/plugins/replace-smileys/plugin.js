this.smileysReplacement = {
	 ":D":     "ura1.gif"
	,":?":     "icon_confused.gif"
	,":roll:": "icon_rolleyes.gif"
	,":(": "icon_frown.gif"
	,":)": "icon_smile.gif"
	,";)": "icon_wink.gif"
	,":o": "icon_eek.gif"
	,":shock:": "wow.gif"
	,"8-)": "icon_cool.gif"
	,":lol:": "icon_lol.gif"
	,":x": "molotok.gif"
	,":P": "icon_razz.gif"
	,":oops:": "shuffle.gif"
	,":cry:": "weep.gif"
	,":geek:": "znaika.gif"
	,":mrgreen:": "icon_biggrin.gif"
	,":evil:": "icon_evil.gif"
	,":twisted:": "icon_roof.gif"
}

function modifyPage(doc)
{
	var imgs = doc.execXPath("//div[@class='content' or @id='smiley-box']//img[starts-with(@src, './images/smilies/') and not(@zb_smile_replaced)]");
	for(var j in imgs)
	{
		var img = imgs[j];
		var smiley = img.getAttribute('alt');
		var newSrc = this.smileysReplacement[smiley];
		if(newSrc != null)
		{
			var newURI = this.base_url + "smileys/" + newSrc;
			img.setAttribute('src', newURI);
			img.setAttribute('height', null);
			img.setAttribute('width', null);
			
			img.setAttribute('zb_smile_replaced', '');
		}
	}
}

this.modifyExpandedPage = this.modifyPage

this.features.addFeature("enabled",  OLBY.getString("replace-smileys-desc"));
