function onKeyPress(e)
{
	var doc = this;
	if(doc.wrappedJSObject != null)
		doc = doc.wrappedJSObject;
	
	e = e || window.event;
	if(e.ctrlKey)
	{
		if(e.keyCode == 37 || e.keyCode == 39)
		{
			if(e.target.tagName == "INPUT" || e.target.tagName == "TEXTAREA")
				return;
			
			var pager = doc.oz_data.pager;
			if(pager == null)
				return;
				
			var navPage = pager.cur_page;
			if(e.keyCode == 37)
			{
				navPage--;
				if(navPage < 1)
					return;
			}
			if(e.keyCode == 39)
			{
				navPage++;
				if(navPage > pager.max_page)
					return;
			}
			var navHref = pager.href_template.replace(/&start=(\d+)/, "&start=" + (navPage - 1) * pager.page_size);
			doc.defaultView.open(navHref, "_self");
		}

		var prevDefault = false;
		if(e.target.tagName == "TEXTAREA" && doc.oz_data.reply != null)
		{
			// submit
			if(e.keyCode == 13 && doc.oz_data.reply.submit != null)
			{
				doc.oz_data.reply.submit.click();
				prevDefault = true;
			}

			// Quote
			if(e.which == 113 && doc.oz_data.reply.quote != null)
			{
				doc.oz_data.reply.quote.click();
				prevDefault = true;
			}
			
			// Bold
			if(e.which == 98 && doc.oz_data.reply.bold != null)
			{
				doc.oz_data.reply.bold.click();
				prevDefault = true;
			}

			// URL
			if(e.which == 117 && doc.oz_data.reply.url != null)
			{
				doc.oz_data.reply.url.click();
				prevDefault = true;
			}

			// Italic
			if(e.which == 105 && doc.oz_data.reply.italic != null)
			{
				doc.oz_data.reply.italic.click();
				prevDefault = true;
			}
		}

		if(prevDefault && e.preventDefault)
			e.preventDefault();
	}
}

function modifyPage(doc)
{
	if(this.features.enabled == false)
		return;

	doc.addEventListener("keypress", this.onKeyPress, false);
}

this.features.addFeature("enabled",  OLBY.getString('add-shortcuts-desc'));
