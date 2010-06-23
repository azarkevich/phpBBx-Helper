function cutQuote()
{
	var textarea = document.forms[form_name].elements[text_name];
	var caretPos = getCaretPosition(textarea).start;
	textarea.focus();

	var beforeCaret = textarea.value.slice(0, caretPos);

	var re = /\[(\/?)quote(="[^"]*")?\]/g;

	var quoteNames = new Array();

	var res;
	re.lastIndex = 0;
	while ((res = re.exec(beforeCaret)) != null) {
		if (res[1] == "/")
			quoteNames.pop();
		else {
			if (res[2] != null)
				quoteNames.push(res[2].replace(/^="/, "").replace(/"$/, ""));
			else
				quoteNames.push(null);
		}
	}

	var before = "";
	var after = "";
	for (var i = 0; i < quoteNames.length; i++) {
		before += "[/quote]";
		if (quoteNames[i] == null) {
			after += "[quote]";
		}
		else {
			after += '[quote="' + quoteNames[i] + '"]';
		}
	}

	var newCaretPos = caretPos + before.length + 1;

	insert_text(before + "\n\n" + after);

	textarea.selectionStart = newCaretPos;
	textarea.selectionEnd = newCaretPos;

	textarea.focus();
}

function moder()
{
	var btn = document.getElementById('moder-btn');
	var font_size = btn.getAttribute('font-size');
	
	var textarea = document.forms[form_name].elements[text_name];
	textarea.focus();

	var selStart = getCaretPosition(textarea).start;
	var selEnd = getCaretPosition(textarea).end;
	
	if(selStart == selEnd)
	{
		selStart = 0;
		selEnd = textarea.value.length;
	}

	var before = textarea.value.slice(0, selStart);
	var after = textarea.value.slice(selEnd);
	var text = textarea.value.slice(selStart, selEnd);
	text = "[color=#FF0000][size=" + font_size + "]" + text + "[/size][/color]";	// size=9
	
	textarea.value = before + text + after;

	textarea.selectionStart = selStart;
	textarea.selectionEnd = selStart + text.length;

	textarea.focus();
}

function clearQuote()
{
	var textarea = document.forms[form_name].elements[text_name];

	var text = textarea.value;

	var root = new Object();
	root.openerLength = 0;
	root.closerLength = 0;
	root.start = 0;
	root.end = text.length;
	root.childs = new Array();
	root.parentQuote = null;
	
	var currentQuote = root;

	var re = /\[(\/)?quote(="[^"]*")?\]/gm;
	re.lastIndex = 0;

	var res;
	while ((res = re.exec(text)) != null)
	{
		if (res[1] != '/')
		{
			var newQuote = new Object();
			newQuote.start = res.index;
			newQuote.parentQuote = currentQuote;
			newQuote.childs = new Array();
			newQuote.openerLength = res[0].length;
			
			currentQuote.childs.push(newQuote);
			currentQuote = newQuote;
		}
		else
		{
			if(currentQuote.parentQuote != null)
			{
				currentQuote.end = res.index + res[0].length;
				currentQuote.closerLength = res[0].length;
				currentQuote = currentQuote.parentQuote;
			}
		}
	}
	
	// remove all of second level
	var removeAreas = new Array();
	var originalCaretPos = getCaretPosition(textarea);
	var caretPos = getCaretPosition(textarea);
	if(caretPos.start == caretPos.end)
	{
		caretPos.start = 0;
		caretPos.end = text.length;
	}
	
	for(var i=0;i<root.childs.length;i++)
	{
		var level1 = root.childs[i];
		for(var j=0;j<level1.childs.length;j++)
		{
			var level2 = level1.childs[j];
			if(level2.start > caretPos.end)
				continue;
			if(level2.end < caretPos.start)
				continue;
			var area = new Object();
			area.start = level2.start;
			area.end = level2.end;
			
			if(area.start < caretPos.start)
				area.start = caretPos.start;

			if(area.end > caretPos.end)
				area.end = caretPos.end;
				
			if(area.start >= area.end)
				continue;

			removeAreas.push(area);
		}
	}
	
	// remove areas from text (from backward)
	removeAreas.reverse();
	removeAreas.forEach(
		function(area)
		{
			text = text.slice(0, area.start) + text.slice(area.end, text.length);

			//alert("area: " + area.start + " " + area.end + ", caret:" + originalCaretPos.start + " " + originalCaretPos.end);
			if(originalCaretPos.start > area.end)
			{
				//alert(1);
				originalCaretPos.start -= (area.end - area.start);
			}
			else if(originalCaretPos.start > area.start)
			{
				//alert(2);
				originalCaretPos.start = area.start;
			}
			if(originalCaretPos.end > area.end)
			{
				//alert(3);
				originalCaretPos.end -= (area.end - area.start);
			}
			else if(originalCaretPos.end > area.start)
			{
				//alert(4);
				originalCaretPos.end = area.start;
			}
		},
	this);
	
	textarea.value = text;
	textarea.selectionStart = originalCaretPos.start;
	textarea.selectionEnd = originalCaretPos.end;
	textarea.focus();
}

function phpBBx_UrlQuote()
{
	var event = document.createEvent("UIEvents");
	event.initEvent("OnGetClipboardText", true, false);
	document.dispatchEvent(event);
	
	var urlText = null;
	var clip = document.getElementById('phpBBx_clipboard');
	if(clip != null)
	{
		if(/^[^:]+:\/\//.test(clip.textContent))
		{
			urlText = clip.textContent;
		}
	}
	
	var textarea = document.forms[form_name].elements[text_name];
	var caretPos = getCaretPosition(textarea);

	textarea.focus();

	var selText = textarea.value.slice(caretPos.start, caretPos.end);
	
	textarea.selectionStart = caretPos.start;
	textarea.selectionEnd = caretPos.start;

	insert_text("[url=]");

	textarea.selectionStart = caretPos.end + 6;
	textarea.selectionEnd = caretPos.end + 6;

	insert_text("[/url]");
	
	textarea.selectionStart = caretPos.start + 5;
	textarea.selectionEnd = caretPos.start + 5;
	if(urlText != null)
	{
		insert_text(urlText);
		textarea.selectionStart = caretPos.start + 5;
		textarea.selectionEnd = caretPos.start + 5 + urlText.length;
	}
}

function modifyReplyPage(doc)
{
	this.createQuoteButtons(doc);

	if(doc.phpBBx_site == "olby")
	{
		var breakQuoteTd = doc.createElement('TD');
		breakQuoteTd.appendChild(doc.oz_data.reply.breakQuote);

		var stripIntQuoteTd = doc.createElement('TD');
		stripIntQuoteTd.appendChild(doc.oz_data.reply.stripIntQuotes);

		var urlTd = doc.oz_data.reply.url.parentNode.parentNode;
		var tr = urlTd.parentNode;
		var lastTd = urlTd.nextSibling;

		tr.insertBefore(breakQuoteTd, lastTd);
		tr.insertBefore(stripIntQuoteTd, lastTd);

		if(this.features.moderBtn)
		{
			var moderBtnTd = doc.createElement('TD');
			moderBtnTd.appendChild(doc.oz_data.reply.moderBtn);
			tr.insertBefore(moderBtnTd, lastTd);
		}

		// modify colspan
		var table = tr.parentNode.parentNode;
		var spannedTds = doc.execXPath("tbody/tr/td[@colspan]", table);

		for (var i = 0; i < spannedTds.length; i++) {
			var span = Number(spannedTds[i].getAttribute('colspan'));
			spannedTds[i].setAttribute('colspan', span + 2)
		}
		
		// add apply for color btn
		var selects = doc.execXPath("//span[@class='genmed']/select");
		for(var i=0;i<selects.length;i++)
		{
			select = selects[i];

			var apply = doc.createElement('INPUT');
			apply.type = 'button';
			apply.setAttribute('value', 'Apply');
			apply.setAttribute('onclick', select.getAttribute('onchange'));

			select.parentNode.insertBefore(apply, select.nextSibling);
		}
	}
	else if(doc.phpBBx_site == "zeby")
	{
		var url = doc.oz_data.reply.url;
		
		url.parentNode.appendChild(doc.oz_data.reply.breakQuote);
		url.parentNode.appendChild(doc.createTextNode(' '));
		url.parentNode.appendChild(doc.oz_data.reply.stripIntQuotes);
		if(this.features.moderBtn)
		{
			url.parentNode.appendChild(doc.createTextNode(' '));
			url.parentNode.appendChild(doc.oz_data.reply.moderBtn);
		}
	}
}

function modifyQuickReply(doc)
{
	this.createQuoteButtons(doc);

	if(doc.phpBBx_site == "olby")
	{
		var breakQuoteTd = doc.createElement('TD');
		breakQuoteTd.appendChild(doc.oz_data.reply.breakQuote);

		var stripIntQuoteTd = doc.createElement('TD');
		stripIntQuoteTd.appendChild(doc.oz_data.reply.stripIntQuotes);
		
		var td = doc.oz_data.reply.quote.parentNode;
		var tr = td.parentNode;
		tr.insertBefore(breakQuoteTd, td.nextSibling);
		tr.insertBefore(stripIntQuoteTd, td.nextSibling);
		
		if(this.features.moderBtn)
		{
			var moderBtnTd = doc.createElement('TD');
			moderBtnTd.appendChild(doc.oz_data.reply.moderBtn);
			tr.insertBefore(moderBtnTd, td.nextSibling);
		}
	}
}

function createQuoteButtons(doc)
{
	var reply = doc.oz_data.reply;

	reply.breakQuote = doc.createElement('INPUT');
	reply.breakQuote.type = 'button';
	reply.breakQuote.setAttribute('value', 'Quote 8<');
	reply.breakQuote.setAttribute('onclick', this.cutQuote.toString().replace("function cutQuote()", ""));

	reply.stripIntQuotes = doc.createElement('INPUT');
	reply.stripIntQuotes.type = 'button';
	reply.stripIntQuotes.setAttribute('value', 'QClear');
	reply.stripIntQuotes.setAttribute('onclick', this.clearQuote.toString().replace("function clearQuote()", ""));
	
	reply.moderBtn = doc.createElement('INPUT');
	reply.moderBtn.type = 'button';
	reply.moderBtn.setAttribute('value', 'Moder');

	reply.moderBtn.setAttribute('onclick', this.moder.toString().replace("function moder()", ""));
	reply.moderBtn.id = 'moder-btn';
	if(doc.phpBBx_site == "olby")
	{
		reply.moderBtn.setAttribute('font-size', '9');
	}
	else if(doc.phpBBx_site == "zeby")
	{
		reply.moderBtn.setAttribute('font-size', '85');
	}

	if(doc.phpBBx_site == "olby")
	{
		reply.breakQuote.className = 'button';
		reply.stripIntQuotes.className = 'button';
		reply.moderBtn.className = 'button';
	}
	else if(doc.phpBBx_site == "zeby")
	{
		reply.breakQuote.className = 'button2';
		reply.stripIntQuotes.className = 'button2';
		reply.moderBtn.className = 'button2';
	}
}

function modifyPage(doc)
{
	if(this.features.enabled == false)
		return;
		
	if(doc.oz_data.reply != null && doc.oz_data.reply.url != null)
	{
		phpBBx_install_script(doc, this.phpBBx_UrlQuote);
		doc.oz_data.reply.url.setAttribute('onclick', 'phpBBx_UrlQuote()');
	}

	if(doc.oz_data.reply != null)
	{
		if(doc.oz_data.reply.quickReply)
		{
			this.modifyQuickReply(doc);
		}
		else
		{
			this.modifyReplyPage(doc);
		}
	}
}

this.features.addFeature("enabled",  OLBY.getString('posting-desc'));
this.features.addFeature("moderBtn",  OLBY.getString('posting-admin-btn'), false);
