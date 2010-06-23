function modifyPage(doc)
{
	if(doc.oz_data.viewtopic != null)
	{
		modifyViewtopicPage(doc);
	}
}

this.modifyExpandedPage = this.modifyPage;

function createHomeImage(doc, dlProfile)
{
	var from = doc.execXPathOne("dd/strong[text()='" + OLBY.getString("address") + ":']/following-sibling::text()", dlProfile);
	if(from == null)
		return;

	var re = /.*(\d+).*(\d+)/;
	if(re.test(from.textContent) == false)
		return;

	return this.createHomeImageFromAddr(doc, from.textContent);
}

function createHomeImageFromAddr(doc, text)
{
	var href = text.replace(/.*(\d+).*(\d+)/, this.base_url + "/images/$1-$2.png");
	var img = doc.createElement('img');
	img.setAttribute('src', href);
	return img;
}

function modifyViewtopicPage(doc)
{
	var avatars = doc.execXPath("//dl[starts-with(@id, 'profile')]/dt/a[contains(@href, 'viewprofile') and not(@zb_home_done)]");
	var noavatars = doc.execXPath("//dl[starts-with(@id, 'profile')]/dt[count(a)=1]/a[not(@zb_home_done)]");

	for(var i=0;i<avatars.length;i++)
	{
		var av = avatars[i];
		var img = createHomeImage(doc, av.parentNode.parentNode);

		if(img == null)
			continue;
		img.setAttribute('style', 'margin-left: 5px');
		av.parentNode.insertBefore(img, av.nextSibling);
		av.setAttribute('zb_home_done', '');
	}

	for(var i=0;i<noavatars.length;i++)
	{
		var nav = noavatars[i];
		var img = createHomeImage(doc, nav.parentNode.parentNode);
		if(img == null)
			continue;
		
		nav.parentNode.insertBefore(img, nav);

		nav.parentNode.insertBefore(doc.createElement('br'), nav);
		nav.setAttribute('zb_home_done', '');
	}
}

this.features.addFeature("enabled",  OLBY.getString("zb-home-desc"), true, false);

this.prefpage = 'options.xul';
this.prefpage_name = 'ZB Home Images';

var dir = olby_getContentDir();
dir.append("plugins");
dir.append("zb-home");
dir.append("images");

if(dir.exists() == false)
{
	dir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0666);
}

this.images_dir = dir.clone();

var files = dir.directoryEntries;
var array = [];
while(files.hasMoreElements())
{
  var entry = files.getNext();
  entry.QueryInterface(Components.interfaces.nsIFile);
  array.push(entry);
}

// sort files.
this.images = [];
this.version = null;

array.forEach(
	function(e)
	{
		if(/\.png$/.test(e.leafName))
		{
			this.images.push(e.leafName);
		}
		else if(/\.ver$/.test(e.leafName))
		{
			this.version = Number(e.leafName.replace(/\.ver$/, ''));
		}
	},
	this
);

if(this.version == null)
{
	var verFile = dir.clone();
	verFile.append('0.ver');
	verFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
	
	this.varsion = 0;
}
