// installable scripts
function phpBBx_create_append_pages_dialog()
{
	var dialog = document.createElement('div');

	dialog.id = 'phpBBx_append_pages_dialog';
	dialog.style.position = 'fixed';
	dialog.style.backgroundColor = 'yellow';
	dialog.style.borderStyle = 'solid';
	dialog.style.borderWidth = '1px';
	dialog.style.padding = '5px';
	dialog.style.margin = '5px';
	dialog.style.display = 'none';

	var text = document.createElement('span');
	text.style.fontSize = '18pt';
	text.textContent = "Wait appending pages!";
	dialog.appendChild(text);

	dialog.appendChild(document.createElement('br'));
	
	var progressDiv = document.createElement('div');
	dialog.appendChild(progressDiv);
	progressDiv.style.textAlign = 'center';
	progressDiv.style.width = "100%";
	progressDiv.textContent = "0";
	dialog.setProgressPage = function(page, total)
	{
		progressDiv.textContent = "Loading " + page + " / " + total;
	};

	dialog.showDialog = function(show)
	{
		if(this.state == show)
			return;
			
		if(show == false)
		{
			dialog.style.display = 'none';
			return;
		}
		dialog.style.display = 'block';
		dialog.style.top = (window.innerHeight - dialog.offsetHeight) / 2 + "px";
		dialog.style.left = (window.innerWidth - dialog.offsetWidth) / 2 + "px";
		
		this.state = show;
	};

	dialog.state = false;

    document.body.appendChild(dialog);
	window.phpBBx_append_pages_dialog = dialog;
}

function phpBBx_open_all_next()
{
	var pager = document.oz_data.pager;
	if(pager == null)
		return;

	var currPage = pager.cur_page;
	var lastPage = pager.max_page;
	var pagesCount = lastPage - currPage;
	if(pagesCount > 10 && window.confirm('Open ' + pagesCount + ' pages?') == false)
		return;

	for(var i=currPage + 1;i<lastPage + 1;i++)
	{
		var href = pager.href_template.replace(/&start=\d+/, "&start=" + (i - 1) * pager.page_size);
		window.open(href, '_blank');
	}
}

function phpBBx_updated_topic_sel_unsel(btn)
{
	var mode = btn.getAttribute('mode');
	var checks = document.execXPath('//input[@open_all_check]');
	var f = null;
	if(mode == 'select-all')
	{
		f = function(c)
		{
			c.checked = true;
		};
		btn.setAttribute('mode', 'select-prev');
		btn.value = btn.getAttribute('select-prev');
	}
	else if(mode == 'unselect-all')
	{
		f = function(c)
		{
			c.checked = false;
		};
		btn.setAttribute('mode', 'select-all');
		btn.value = btn.getAttribute('select-all');
	}
	else if(mode == 'select-prev')
	{
		f = function(c)
		{
			c.checked = c.was;
		};
		btn.setAttribute('mode', 'unselect-all');
		btn.value = btn.getAttribute('unselect-all');
	}
	if(f != null)
		checks.forEach(f);
	
	phpBBx_updated_topic_check_changed(false);
}

function phpBBx_updated_topic_check_changed(initiated_by_check)
{
	var checkedCount = 0;
	document.execXPath('//input[@open_all_check]')
	.forEach(
		function(c)
		{
			if(c.checked)
				checkedCount++;
			if(initiated_by_check)
				c.was = c.checked;
		}
	);

	[document.getElementById("phpBBx_open_all_updated_topics"), document.getElementById("phpBBx_open_all_updated_pages")]
	.forEach(
		function(l)
		{
			if(l == null)
				return;
			var textTemplate = l.getAttribute('textTemplate');
			l.textContent = '[' + textTemplate + ' (' + checkedCount + ')]';
		}
	);
	
	var btnSelUnsel = document.getElementById("phpBBx_open_all_sel_btn");
		
	var span = document.getElementById("phpBBx_open_all_updated_span");
	if(checkedCount == 0)
	{
		span.setAttribute('style', 'display: none');
		if(initiated_by_check)
		{
			btnSelUnsel.setAttribute('mode', 'select-all');
			btnSelUnsel.value = btnSelUnsel.getAttribute('select-all');
		}
	}
	else
	{
		span.setAttribute('style', '');
		if(initiated_by_check)
		{
			btnSelUnsel.setAttribute('mode', 'unselect-all');
			btnSelUnsel.value = btnSelUnsel.getAttribute('unselect-all');
		}
	}
}

function phpBBx_open_selected_topics(rec)
{
	// notify extension about open pages (for save checks)
	var event = document.createEvent("UIEvents");
	event.initEvent("phpBBx_OnBeforeOpenSelectedTopics", true, false);
	document.dispatchEvent(event);

	var checks = document.execXPath('//input[@open_all_check]');
	checks.forEach(
		function(c)
		{
			if(c.checked == false)
				return;
			
			var href = c.getAttribute('href');
			var topic_id = c.getAttribute('topic_id');
			
			if(rec)
				window.open(href, "sazarkevich-append-all-pages-from-this " + topic_id);
			else
				window.open(href);
		}
	);
	
	// close window
	if(window.phpBBx_close_window_after_open_selected_topics != null)
	{
		var event = document.createEvent("UIEvents");
		event.initEvent("phpBBx_CloseWindow", true, false);
		document.dispatchEvent(event);
	}
}

function phpBBx_on_open_all_pages(e, plugin)
{
	var doc = e.target.wrappedJSObject;
	var checks = doc.execXPath('//input[@open_all_check]');
	var save = new Array();
	
	var page_id = doc.oz_data.page_id;

	if(plugin.pref_branch.prefHasUserValue('unselect-prev-' + page_id))
	{
		save = plugin.pref_branch.getCharPref('unselect-prev-' + page_id).split(',');
	}
	
	checks.forEach(
		function(c)
		{
			var topicId = c.id.replace(/[^0-9]*/, '');
			var index = save.indexOf(topicId);
			if(c.checked && index != -1)
			{
				// remove from array
				delete save[index];
			}
			else if(c.checked==false && index == -1)
			{
				// add to array
				save.push(topicId);
			}
		}
	);
	
	plugin.pref_branch.setCharPref('unselect-prev-' + page_id, save.join());
}

function phpBBx_append_viewtopic_page(page, div, host, before)
{
	// page divider
	var pageX = document.createElement('H2');
	pageX.textContent = 'VVV page ' + page + ' VVV';
	pageX.setAttribute('align', 'center');
	pageX.width = '100%';
	pageX.id = "loaded_page_" + page;
	host.insertBefore(pageX, before);
	
	if(document.phpBBx_site == 'olby')
	{
		var firstPosts = document.execXPath("//table[@class='forumline']//tr[td[@class='bodyline']]", div);
		firstPosts.forEach(
			function(fp)
			{
				fp.parentNode.removeChild(fp);
			}
		);

		var src = document.execXPathOne("//table[@class='forumline'][1]", div);
		host.insertBefore(src, before);
	}
	else
	{
		pageX.className = 'headerbar';

		var srcs = document.execXPath("//div[starts-with(@id, 'p')][div/div/@class = 'postbody']", div);
		srcs.forEach(
			function(src)
			{
				host.insertBefore(src, before);
			}
		);
	}	
}

function phpBBx_append_memberlist_page(page, div, host, before)
{
	var trs = document.execXPath("id('memberlist')/tbody/tr", div);
	if(trs.length != 0)
	{
		var tr = trs[0];
		tr.id = "loaded_page_" + page;
	}
	trs.forEach(
		function(el)
		{
			host.insertBefore(el, before);
		}
	);
}

function phpBBx_append_all_next(pageToLoad, host, before)
{
	var pager = document.oz_data.pager;
	if(pager == null)
		return;
	
	if(pageToLoad == null)
	{
		pageToLoad = pager.cur_page + 1;
		
		var an = document.execXPath("//a[@append_all_next_a]");
		an.forEach(
			function(a)
			{
				a.parentNode.removeChild(a);
			}
		);
	}
	
	if(pageToLoad > pager.max_page)
	{
		// host != null only if at least one page appended
		if(host != null)
		{
			// notify about all pages added
			var event = document.createEvent("UIEvents");
			event.initEvent("phpBBx_PageExpanded", true, false);
			document.dispatchEvent(event);
		}

		if(window.phpBBx_append_pages_dialog != null)
			window.phpBBx_append_pages_dialog.showDialog(false);

		return;
	}
	
	if(host == null)
	{
		if(document.phpBBx_site == 'olby')
		{
			var t = document.execXPathOne("//table[@class='forumline'][1]");
			host = t.parentNode;
			before = t.nextSibling;
		}
		else
		{
			if(document.oz_data.viewtopic != null)
			{
				var lastDiv = document.execXPathOne("//div[starts-with(@id, 'p')][div/div/@class = 'postbody'][last()]");
				host = lastDiv.parentNode;
				before = lastDiv.nextSibling.nextSibling;
			}
			else if(document.oz_data.memberlist != null)
			{
				host = document.execXPathOne("id('memberlist')/tbody");
				before = null;
			}
		}
	}
	
	if(window.phpBBx_append_pages_dialog != null)
	{
		window.phpBBx_append_pages_dialog.showDialog(true);
		window.phpBBx_append_pages_dialog.setProgressPage(pageToLoad, pager.max_page);
	}
		
	var from_post = (pageToLoad - 1) * pager.page_size;
	var href = pager.href_template.replace(/&start=\d+/, "&start=" + from_post);
	var httpRequest = new XMLHttpRequest();
	httpRequest.open('GET', href, true);
	httpRequest.onreadystatechange = function()
	{
		try {
			// только при состоянии "complete"
			if (httpRequest.readyState == 4 && httpRequest.status == 200)
			{
				var html = httpRequest.responseText;

				html = html.replace(/^(.|\n)*<body>/, '');
				html = html.replace(/<\/body>(.|\n)*$/, '');
				var div = document.createElement('div');
				div.innerHTML = html;

				if(document.oz_data.viewtopic != null)
					phpBBx_append_viewtopic_page(pageToLoad, div, host, before);
				else if(document.oz_data.memberlist != null)
					phpBBx_append_memberlist_page(pageToLoad, div, host, before);
				
				// modify links to appended pages
				var as = document.execXPath("//a[contains(@href, 'start=" + from_post + "')]");
				as.forEach(
					function(a)
					{
						if(document.phpBBx_site == 'olby')
						{
							a.className = 'active';
						}
						if(window.phpBBx_replace_appended_links != null)
							a.href = "#loaded_page_" + pageToLoad;
					}
				);

				phpBBx_append_all_next(pageToLoad + 1, host, before, false);
			}
			else if(httpRequest.readyState == 4 && httpRequest.status != 200)
			{
				throw 'some error';
			}
		}
		catch(e)
		{
			// on error - close progress dialog and exit
			if(window.phpBBx_append_pages_dialog != null)
				window.phpBBx_append_pages_dialog.showDialog(false);
		}
	}
	httpRequest.send(null);
}

// extension functions
function add_AllNext_buttons(doc)
{
	var pager = doc.oz_data.pager;
	if(pager == null || pager.cur_page == pager.max_page)
		return;

	// generate script for open
	var linkPanels = pager.panels;
	for(var i=0;i<linkPanels.length;i++)
	{
		var linkPanel = linkPanels[i];

		var nextPageButton = null;
		if(doc.phpBBx_site == "olby")
			nextPageButton = doc.execXPathOne("a[last()]", linkPanel);
		
		// add 'open all next' button
		if(this.features.enable_OpenAllNext)
		{
			var a = doc.createElement("a");
			a.textContent = OLBY.getString("oap.all_next");
			a.href = "javascript:phpBBx_open_all_next()";
			linkPanel.insertBefore(a, nextPageButton);
		}

		// add 'append all next'
		if(this.features.enableAppendAllNext && (doc.oz_data.viewtopic != null || doc.oz_data.memberlist != null))
		{
			var a = doc.createElement("a");
			a.setAttribute('append_all_next_a', '');
			a.textContent = OLBY.getString("append_all_next");
			a.href = "javascript:phpBBx_append_all_next()";
			linkPanel.insertBefore(a, nextPageButton);
		}
	}
}

function handleWindowName(doc)
{
	if(/sazarkevich-open-all-pages-from-this/.test(doc.defaultView.name))
	{
		phpBBx_install_script(doc, "phpBBx_open_all_next();");
	}
	if(/sazarkevich-append-all-pages-from-this/.test(doc.defaultView.name))
	{
		phpBBx_install_script(doc, "phpBBx_append_all_next();");
	}
	doc.defaultView.name = "";
}

function modifyTopicsList(doc)
{
	var unread_links = doc.oz_data.unread_links;
	if(unread_links.length == 0)
		return;

	if(this.features.enable_OpenAllNewTopics == false && this.features.enable_OpenAllNewPages == false && this.features.enableSelectButton == false)
		return;

	var title = null;
	if(doc.phpBBx_site == "zeby")
		title = doc.execXPathOne("id('page-body')/h2");
	else
		title = doc.execXPathOne("//div[@class='snhead']//h1[@class='snh_h1']");
	
	if(title == null)
		return;

	var place = title.parentNode;
	var before = title.nextSibling;

	var h2 = doc.createElement("h2");
	place.insertBefore(h2, before);

	if(this.features.enableSelectButton)
	{
		// span for select/unselect all
		var span = doc.createElement("span");
		h2.appendChild(span);
		span.appendChild(doc.createTextNode(" "));

		var btn = doc.createElement('input');
		span.appendChild(btn);
		btn.id = 'phpBBx_open_all_sel_btn';
		btn.setAttribute('type', 'button');
		btn.setAttribute('onclick', 'javascript:phpBBx_updated_topic_sel_unsel(this)');
		btn.setAttribute('select-all', OLBY.getString('select-all'));
		btn.setAttribute('select-prev', OLBY.getString('select-prev'));
		btn.setAttribute('unselect-all', OLBY.getString('unselect-all'));
		btn.setAttribute('mode', 'unselect-all');
		btn.value = btn.getAttribute('unselect-all');
	}

	//span for hold 'open all' links
	var span = doc.createElement("span");
	h2.appendChild(span);
	span.id = 'phpBBx_open_all_updated_span';

	// create link to 'updated topics'
	if(this.features.enable_OpenAllNewTopics)
	{
		var aUpdatedTopics = doc.createElement('input');
		aUpdatedTopics.id = 'phpBBx_open_all_updated_topics';
		aUpdatedTopics.setAttribute('type', 'button');
		aUpdatedTopics.setAttribute('onclick', 'phpBBx_open_selected_topics(false)');
		aUpdatedTopics.setAttribute('textTemplate', OLBY.getString('all_updated_topics'));
		aUpdatedTopics.setAttribute('value', '[' + OLBY.getString('all_updated_topics') + ' (' + unread_links.length + ')]');
		span.appendChild(doc.createTextNode(" "));
		span.appendChild(aUpdatedTopics);
	}

	// create link to 'updated pages'
	if(this.features.enable_OpenAllNewPages)
	{
		var aUpdatedPages = doc.createElement('input');
		aUpdatedPages.id = 'phpBBx_open_all_updated_pages';
		aUpdatedPages.setAttribute('type', 'button');
		aUpdatedPages.setAttribute('onclick', 'javascript:phpBBx_open_selected_topics(true)');
		aUpdatedPages.setAttribute('textTemplate', OLBY.getString('all_update_pages'));
		aUpdatedPages.setAttribute('value', '[' + OLBY.getString("all_update_pages")  + ' (' + unread_links.length + ')]');
		span.appendChild(doc.createTextNode(" "));
		span.appendChild(aUpdatedPages);
	}
	
	place.insertBefore(doc.createElement("br"), before);
}

function modifyUnreadLinks(doc)
{
	var unread_links = doc.oz_data.unread_links;
	if(unread_links == null)
		return;

	var save = new Array();
	if(this.pref_branch.prefHasUserValue('unselect-prev-' + doc.oz_data.page_id))
	{
		save = this.pref_branch.getCharPref('unselect-prev-' + doc.oz_data.page_id);
		save = save.split(',');
	}

	for(var i=0;i<unread_links.length;i++)
	{
		var newRef = unread_links[i];

		var topicId = /t=(\d+)/.exec(newRef.href)[1];

		if(this.features.enable_OpenNewAll)
		{
			var a = doc.createElement('a');
			a.className = "orange";
			a.href = newRef.href;
			a.textContent = OLBY.getString('fwd.fwd');
			a.target = "sazarkevich-append-all-pages-from-this " + topicId;

			newRef.parentNode.insertBefore(a, newRef.nextSibling);
		}

		var openAllPagesCheck = doc.createElement('input');
		openAllPagesCheck.id = 'open_all_check_' + topicId;
		openAllPagesCheck.setAttribute('href', newRef.href);
		openAllPagesCheck.setAttribute('topic_id', topicId);
		openAllPagesCheck.setAttribute('open_all_check', '');
		openAllPagesCheck.setAttribute('type', 'checkbox');
		openAllPagesCheck.setAttribute('onchange', 'phpBBx_updated_topic_check_changed(true)');
		openAllPagesCheck.defaultChecked = (save.indexOf(topicId) == -1 || this.features.saveLastSelection == false);
		openAllPagesCheck.was = openAllPagesCheck.defaultChecked;
		newRef.parentNode.insertBefore(openAllPagesCheck, newRef.nextSibling);

		if(this.features.enableOpenCheck == false)
			openAllPagesCheck.setAttribute('style', 'display: none');
	}
}

function modifyPage(doc)
{
	phpBBx_install_script(doc, phpBBx_updated_topic_check_changed);
	phpBBx_install_script(doc, phpBBx_open_selected_topics);
	phpBBx_install_script(doc, phpBBx_updated_topic_sel_unsel);
	phpBBx_install_script(doc, phpBBx_append_all_next);
	phpBBx_install_script(doc, phpBBx_open_all_next);
	phpBBx_install_script(doc, phpBBx_create_append_pages_dialog);
	phpBBx_install_script(doc, phpBBx_append_viewtopic_page);
	phpBBx_install_script(doc, phpBBx_append_memberlist_page);
	
	this.modifyTopicsList(doc);
	this.modifyUnreadLinks(doc);
	this.add_AllNext_buttons(doc);
	
	var plugin = this;
	doc.addEventListener("phpBBx_OnBeforeOpenSelectedTopics", function(e) { phpBBx_on_open_all_pages(e, plugin) }, false);
	
	doc.addEventListener("phpBBx_CloseWindow", function() { this.defaultView.close() }, false);

	if(this.features.enableReplaceAppendedLinks)
		phpBBx_install_script(doc, "window.phpBBx_replace_appended_links = 0");
		
	if(this.features.enableCloseWindowAfterOpenSelTopics)
		phpBBx_install_script(doc, "phpBBx_close_window_after_open_selected_topics = 0");
}

function runPage(doc)
{
	phpBBx_install_script(doc, 'phpBBx_create_append_pages_dialog()');

	this.handleWindowName(doc);

	phpBBx_install_script(doc, 'phpBBx_updated_topic_check_changed(false)');
}

this.features.addFeature("enable_OpenAllNewTopics",  OLBY.getString("oap.enable_OpenAllNewTopics"));
this.features.addFeature("enable_OpenAllNewPages",  OLBY.getString("oap.enable_OpenAllNewPages"));
this.features.addFeature("enable_OpenAllNext",  OLBY.getString("oap.enable_OpenAllNext"));
this.features.addFeature("enable_OpenNewAll",  OLBY.getString("oap.enable_OpenNewAll"));
this.features.addFeature("enableOpenCheck",  OLBY.getString('enableOpenCheck'));
this.features.addFeature("enableSelectButton",  OLBY.getString('enableSelectButton'));
this.features.addFeature("saveLastSelection",  OLBY.getString('saveLastSelection'));
this.features.addFeature("enableAppendAllNext",  OLBY.getString('enableAppendAllNext'));
this.features.addFeature("enableReplaceAppendedLinks",  OLBY.getString('oap.enableReplaceAppendedLinks'));
this.features.addFeature("enableCloseWindowAfterOpenSelTopics",  OLBY.getString('oap.enableCloseWindowAfterOpenSelTopics'));
