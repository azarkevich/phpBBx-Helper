function FaqManager()
{
	// RDF utilities
	this.service = Components.classes["@mozilla.org/rdf/rdf-service;1"]
		.getService(Components.interfaces.nsIRDFService);

	// init info & score file name
	var file = Components.classes["@mozilla.org/file/directory_service;1"]
		.getService(Components.interfaces.nsIProperties)
		.get("ProfLD", Components.interfaces.nsIFile);

	file.append("onliner-info.rdf");

	var url = 'file:///' + escape(file.path);
	this.DataSource = this.service.GetDataSourceBlocking(url);
	this.DataSource.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
	this.faqResource = this.service.GetResource("http://azarkevich.blogspot.com/phpBBx-helper/faq");
			
	this.setFaqInfo = function(faqNum, faqText)
	{
		var prop = this.service.GetResource("http://azarkevich.blogspot.com/phpBBx-helper/faq#" + faqNum);

		// find old and replace with new:
		var oldTarget = this.DataSource.GetTarget(this.faqResource, prop, true);
		if(oldTarget == null)
			this.DataSource.Assert(this.faqResource, prop, this.service.GetLiteral(faqText), true);
		else
			this.DataSource.Change(this.faqResource, prop, oldTarget, this.service.GetLiteral(faqText));
	}

	this.getFaqInfo = function(faqNum, faqText)
	{
		var prop = this.service.GetResource("http://azarkevich.blogspot.com/phpBBx-helper/faq#" + faqNum);
		var val = this.DataSource.GetTarget(this.faqResource, prop, true);
		if(val == null)
			return "";
		val.QueryInterface(Components.interfaces.nsIRDFLiteral);
		return val.Value;
	}
}

function getFaqInfo(ruleName)
{
	var ret = "";
	while(true)
	{
		if(/_\d+/.test(ruleName) == false)
			break;
		var rv = this.faq_manager.getFaqInfo(ruleName);
		if(rv != "")
			ret = rv + "\n" + ret;
		var x = /(rule_.*)_\d+/.exec(ruleName);
		if(x == null)
			break;
		ruleName = x[1];
	}
	return ret;
}

function modifyTextNode(doc, node)
{
	var text = node.textContent;

	var re = /[123](\.\d{1,2}){1,2}/g;
	if(re.test(text) == false)
		return;

	var parentNode = node.parentNode;
	parentNode.removeChild(node);
		
	var replaceInd = new Array();
	var replaceStr = new Array();
	
	var res;
	re.lastIndex = 0;
	while((res = re.exec(text)) != null)
	{
		replaceInd.push(re.lastIndex - res[0].length);
		replaceStr.push(res[0]);
	}

	// build new node list
	var currentIndex = 0;
	for(var i=0;i<replaceInd.length;i++)
	{
		// add #text from old
		if(replaceInd[i] > currentIndex)
		{
			var el = doc.createTextNode('#text');
			el.textContent = text.substr(currentIndex, replaceInd[i] - currentIndex);
			parentNode.appendChild(el);
		}

		var el = doc.createElement('a');
		el.innerHTML = replaceStr[i];
		el.setAttribute("href", "./faq.php?sazarkevich_highlight=" + replaceStr[i]);
		el.title = this.getFaqInfo("rule_" + replaceStr[i].replace(/\./g, "_"));
		parentNode.appendChild(el);
		
		currentIndex = replaceInd[i] + replaceStr[i].length;
	}

	// add tail
	if(currentIndex < text.length)
	{
		var el = doc.createTextNode('#text');
		el.textContent = text.substr(currentIndex);
		parentNode.appendChild(el);
	}
}

function genRuleNames(doc, prefix, listItems)
{
	if(listItems == null || listItems.length == 0)
		return;
	
	for(var i=0;i<listItems.length;i++)
	{
		var listItem = listItems[i];
		
		var rule = prefix + (i + 1);
		listItem.setAttribute("rule", rule);

		this.genRuleNames(doc, rule + ".", doc.execXPath("li", listItem));
		this.genRuleNames(doc, rule + ".", doc.execXPath("ol/li", listItem));
		
		// some time ol element not in li, but instead after correspond li element
		var buggyOL = doc.execXPath("ol[position() > 0]", listItem);
		if(buggyOL != null)
		{
			buggyOL.forEach(
				function(ol)
				{
					// get nearest previous li item
					var li = doc.execXPathOne("preceding-sibling::li[1]", ol);
					
					if(li == null)
						return;

					this.genRuleNames(doc, li.getAttribute('rule') + ".", doc.execXPath("li", ol));
				},
				this
			);
		}
	}
}

function modifyFaq(doc)
{
	// add to each rule its name
	var rootListItems = doc.execXPath("//table[@class='forumline'][2]//span[@class='postbody'][2]/div/ol");
	this.genRuleNames(doc, "", rootListItems);

	// store rule info
	var rules = doc.execXPath("//*[@rule]");
	rules.forEach(
		function(r)
		{
			var ruleName = "rule_" + r.getAttribute('rule').replace(/\./g, "_");
			var ruleText = doc.execXPathOne('text()[1]', r);
			this.faq_manager.setFaqInfo(ruleName, ruleText.nodeValue);
		},
		this
	);

	this.faq_manager.DataSource.Flush();

	// hilight item if need
	var hi = /faq.php\?sazarkevich_highlight=([0-9.]+)/.exec(doc.location.href);
	if(hi != null)
	{
		var items = doc.execXPath('//*[@rule = "' + hi[1] + '"]');
		items.forEach(
			function(item)
			{
				item.setAttribute("style", "background: lightgreen");
				item.scrollIntoView(true);
			}
		);
	}
}

function modifyPage(doc)
{
	if(this.features.enabled == false)
		return;
		
	if(/faq.php/.test(doc.location.href))
	{
		this.modifyFaq(doc);
	}
	else
	{
		if(doc.oz_data.pens != null)
		{
			doc.oz_data.pens.forEach(function(node) {
				var tn = doc.execXPath("//td[@class='gensmall' and not(@olby_pan_explained)]/text()", node);
				tn.forEach(function(t) { this.modifyTextNode(doc, t)}, this);
				tn.forEach(function(t) { if(t.parentNode != null) t.parentNode.setAttribute('olby_pan_explained', '') })
			}, this);
		}
	}
}

this.modifyExpandedPage = this.modifyPage;

this.features.addFeature("enabled",  OLBY.getString("explain-card-info-desc"));

this.faq_manager = new FaqManager();
