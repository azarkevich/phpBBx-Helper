function phpBBx_PageParser(doc, page)
{
	if(page == null)
		page = doc.location.href.replace(/[^:]*:\/\/[^\/]*\//, '');
	
	// login page?
	var usr = doc.execXPathOne("//form[contains(@action, 'login.php')]//input[@name='username']");
	var pwd = doc.execXPathOne("//form[contains(@action, 'login.php')]//input[@name='password']");
	var btn = doc.execXPathOne("//form[contains(@action, 'login.php')]//input[@type='submit']");
		
	if(usr != null || pwd != null || btn != null)
	{
		this.autologin = new Object();
		this.autologin.usr = usr;
		this.autologin.pwd = pwd;
		this.autologin.btn = btn;
	}
	
	if(/viewtopic\.php/.test(page))
	{
		phpBBx_parse_viewtopic_page(doc, this);
	}
	
	if(/memberlist\.php/.test(page))
	{
		this.memberlist = new Object();
		this.pager = phpBBx_parse_pager(doc, this);
		if(this.pager != null)
			this.pager.page_size = 25;
	}

	if(/viewforum\.php/.test(page))
	{
		var re = /viewforum.php\?f=(\d+)/;
		var res = re.exec(doc.location.href);
		if(res != null)
			this.page_id = doc.phpBBx_site + '-' + res[1];
		phpBBx_parse_viewforum_page(doc, this);
	}

	if(/posting\.php/.test(page) || /privmsg\.php/.test(page) || /ucp\.php/.test(page))
	{
		phpBBx_parse_posting_page(doc, this);
	}

	if(/search\.php/.test(page))
	{
		this.page_id = doc.phpBBx_site + '-search';

		this.posts = doc.execXPath("//span[@class='postbody']");
		phpBBx_parse_pens(doc, this);

		this.pager = phpBBx_parse_pager(doc, this);
		if(this.pager != null)
			this.pager.page_size = 20;
	}
	
	if(/printview\.php/.test(page))
	{
		this.printview = new Object();
		this.printview.full_href = doc.location.href.replace(/printview\.php/, 'viewtopic.php')
	}

	if(/profile\.onliner\.by/.test(doc.location.href))
	{
		this.profile = new Object();
		this.profile.search_me = doc.execXPathOne("//div[@class='genmed']");
	}

	//new
	if(doc.phpBBx_site == "olby")
		this.unread_links = doc.execXPath("//span[@class='nav']/a[contains(@href, 'view=newest')]");
	else
		this.unread_links = doc.execXPath("//a[contains(@href, 'view=unread#unread')]");
}

function phpBBx_parse_pens(doc, data)
{
	data.pens = doc.execXPath("//img[contains(@src, 'pen_yellow.gif') or contains(@src, 'pen_red.gif') or contains(@src, 'pen_black.gif')]/ancestor::table");
}

function phpBBx_parse_posting_page(doc, data)
{
	data.posting = new Object();

	phpBBx_parse_reply(doc, data);

	data.posts = doc.execXPath("//span[@class='postbody']");
}

function phpBBx_parse_viewtopic_page(doc, data)
{
	data.viewtopic = new Object();

	data.pager = phpBBx_parse_pager(doc, data);
	if(data.pager != null)
		data.pager.page_size = 20;
	
	phpBBx_parse_reply(doc, data);
	
	data.posts = doc.execXPath("//span[starts-with(@id, 'postid_')]");
	
	phpBBx_parse_pens(doc, data);
}

function phpBBx_parse_reply(doc, data)
{
	var textarea = doc.execXPathOne("//textarea[@id='message' or @id='input']");
	if(textarea != null)
	{
		data.reply = new Object();

		data.reply.textarea = textarea;
		
		data.reply.quickReply = textarea.id == 'input';

		data.reply.submit = doc.execXPathOne("//input[@type='submit' and @name='post']");
		data.reply.bold = doc.execXPathOne("//input[@type='button' and @name='addbbcode0']");
		data.reply.italic = doc.execXPathOne("//input[@type='button' and @name='addbbcode2']");
		data.reply.img = doc.execXPathOne("//input[@type='button' and @name='addbbcode14']");
		data.reply.url = doc.execXPathOne("//input[@type='button' and @name='addbbcode16']");
		data.reply.quote = doc.execXPathOne("//input[@type='button' and @name='addbbcode6']");
	}
}

function phpBBx_parse_viewforum_page(doc, data)
{
	data.viewforum = new Object();

	data.pager = phpBBx_parse_pager(doc, data);
	if(data.pager != null)
		data.pager.page_size = 50;
}

function phpBBx_parse_pager(doc, data)
{
	var cur = null;
	if(doc.phpBBx_site == "olby")
	{
		// find current and last page
		cur = doc.execXPath("//span[@class='snh_pagination']/a[@class='active']");
		if(cur.length == 0)
		{
			cur = doc.execXPath("//span[@class='snh_pagination']/select/option[@selected]");
		}
	}
	else
	{
		// find current and last page
		if(data.memberlist != null)
			cur = doc.execXPath("//li[contains(@class, 'pagination')]/span/strong");
		else
			cur = doc.execXPath("//div[@class='pagination']/span/strong");
	}	

	if(cur == null || cur.length == 0)
		return null;
		
	var pager = new Object();

	pager.cur_page = Number(cur[0].textContent);

	if(doc.phpBBx_site == "olby")
	{
		pager.panels = doc.execXPath("//span[@class='snh_pagination']");
	}
	else
	{
		if(data.memberlist != null)
			pager.panels = doc.execXPath("//li[contains(@class, 'pagination')]/span");
		else
			pager.panels = doc.execXPath("//div[@class='pagination']/span");
	}	

	pager.max_page = pager.cur_page;

	var allPages = null;

	if(doc.phpBBx_site == "olby")
	{
		// calc last page & href template
		allPages = doc.execXPath("//span[@class='snh_pagination']/a[starts-with(@href, 'viewtopic.php?') or starts-with(@href, 'viewforum.php?') or starts-with(@href, 'search.php?')]");
	}
	else
	{
		// calc last page & href template
		if(data.memberlist != null)
			allPages = doc.execXPath("//li[contains(@class, 'pagination')]/span/a[starts-with(@href, './memberlist.php?')]");
		else
			allPages = doc.execXPath("//div[@class='pagination']/span/a[starts-with(@href, './viewtopic.php?') or starts-with(@href, './viewforum.php?') or starts-with(@href, './search.php?')]");
	}

	allPages.forEach(function(a) {
		var page = Number(a.textContent);
		if(page > pager.max_page)
			pager.max_page = page;
		if(pager.href_template == null)
			pager.href_template = a.href;
	});
	
	if(doc.phpBBx_site == "zeby" && /&start=\d+/.test(pager.href_template) == false)
		pager.href_template += "&start=0";

	return pager;
}
