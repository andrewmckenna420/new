// variables
var testVar;
var ciqData = { db: {}, editData: {} };

// indexof, searching for 1st element of array of arrays
Array.prototype.indexOf0 = 
  function(a){for(i=0;i<this.length;i++)if(a==this[i][0])return i;return -1;};

// helper functions to send CSRF with all ajax requests
function csrfSafeMethod(method) {
	// these HTTP methods do not require CSRF protection
	return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

// verify login form is complete - return false if not
function check_login(){
	$('#login_error').hide();
	var email = $('#email_in').val();
	var password = $('#password_in').val();
	if (!email){
		$('#email_in').focus();
		return false;
	}
	if (!password){
		$('#password_in').focus();
		return false;
	}
	if ($('#remem_email').prop('checked')){
		$.cookie('email_login', email, { expires: 365, path: '/' } );
	} else {
		$.removeCookie('email_login', { path: '/' });
	}
}

function inputLine(name, input, endDiv){
	var html = "<div class='form-group'>";
	html += "<label class='col-sm-3 control-label'>"+name+"</label>";
	html += "<div class='col-sm-6'>";
	html += input;
	html += "</div>";
	html += "</div>";
	if (endDiv){
		html += "<div id='" + endDiv + "' style='clear:both;'></div>";
	}
	return html;
}

function makeSelectInput(dataType, name, data){
	var html = "<select id=" + dataType + "-" + name + " class='form-control select-input'><option value=-2> -- </option>";
	for (var i=0; i < data.length; i++){
		d = data[i];
		html += "<option value='" + d[0] + "'>" + d[1] + "</option>"
	}
	html += "</select>";
	return html;
}

function makeTextInput(dataType, name, placeholder, inType){
	inType = inType || "text";
	var html = '<input type="'+inType+'" id="'+dataType + '-' + name + '"class="form-control text-input" placeholder="'+placeholder+'">';
	return html;
}

function questionEditDataComplete(editData){
	editQuestionPreview(editData);
	if (editData.qtext && editData.cat >= -1 && editData.qtype >= -1) {
		if (editData.qtype == 1) { // scale
			if (editData.qopts.scaleText > 0)
				return true;
			else if (editData.qopts.scaleText == -1 &&
					editData.qopts.scaleTextLeft && editData.qopts.scaleTextRight)
				return true;
		} else if (editData.qtype == 2) { // true / false
			return true;
		}
	}
	return false;
}

function nameFromId(list, oid){
	for (var i=0; i< list.length; i++){
		if (list[i][0] == oid) return list[i][1];
	}
	return "Not Set";
}

// used in question preview
function genQuestion(qid, qtext, qtype, qopts) {
	var html = "";
	html += "<div id='question-"+qid+"' class='question-container'>";
	html += "<div class='question-text'>";
	html += qtext || "NOT SET";
	html += "</div>";
	if (qtype == 1) { //scale
		html += genQuestionScale(qid, qopts);
	} else if (qtype == 2) { // true / false
		html += genQuestionTF(qid);
	}
	html += "</div>";
	return html;

}

function scaleInput(){
	var html = "";
	var html_end = "";
	for (var i=0; i< 5; i++){
		html += "<div class='scale-select-square-cont pull-left'>";
		html_end += "<div class='scale-select-square'></div></div>";
		
	}
	return html + html_end;
}

// format for true / false questions
function genQuestionTF(qid){
	var html = "";
	var radioName = "question-tf-" + qid;
	html += "<div class='question-tf btn-group' data-toggle='buttons'>";
	html += '<label class="btn btn-default"> <input type="radio" name="'+radioName+'" value="1">True</label>';
	html += '<label class="btn btn-default"> <input type="radio" name="'+radioName+'" value="0">False</label>';
	html += "</div>";

	return html;
}

// format for scale questions
function genQuestionScale(qid, qopts) {
	var lText = "NOT SET";
	var rText = "NOT SET";
	// determine the text on each side of the scale
	if (qopts.scaleText > 0){
		var name = nameFromId(scaleText, qopts.scaleText);
//		console.log('name is ' + name);
		var lr = name.split(' / ');
		lText = lr[0];
		rText = lr[1];
	} else if (qopts.scaleText == -1) {
		lText = qopts.scaleTextLeft || lText;
		rText = qopts.scaleTextRight || rText;
	}
	var html = "";
	html += "<div class='question-scale'>";
	html += "<div class='scale-text'>";
	html += lText;
	html += "</div>";
	html += "<div class='scale-select'>";
	html += scaleInput();
	html += "</div>";
	html += "<div class='scale-text'>";
	html += rText;
	html += "</div>";
	html += "</div>";
	return html;
}

// load a question in the edit area
function loadEditQuestion(q){
	var attrs = ['qtext', 'qtype', 'cat'];
	for (var i=0; i< attrs.length; i++){
		var attr = attrs[i];
		var val = q[attr];
		var el = $('#' + attr);
		el.val(val);
		el.trigger('change');
	}
	var qoptsAttrs = Object.keys(q.qopts).sort();
	for (var i=0; i<qoptsAttrs.length; i++){
		var k = qoptsAttrs[i];
		var el = $('#qopts-' + k);
		el.val(q.qopts[k]);
		el.trigger('change');
	}
}

function scaleSelectSquareMO(sq){
	el = $(sq).parent();
	el.addClass('highlight');
	el.on('mouseout', function(){ $(this).removeClass('highlight') });
}

function editQuestionPreview(q){
	console.log("PREV: " + JSON.stringify(q));
	var catName = nameFromId(cats, q.cat);
	var html = "";
	html += "<div id='question-preview-area'>";
	html += "<h1>Question Preview</h1>";
	html += "<div class='category-label'>Category: " + catName + "</div>";

	html += genQuestion('preview', q.qtext, q.qtype, q.qopts );
	html += "</div>";
	$('#question-edit-preview').html(html);
//	fillScaleInput();
}

function buttonWorks(name, bool){
	var val = bool ? false : "disabled";
	$('#' + name).prop('disabled', val);
}

function showAlert(type, area, msg) { // use danger, error, or success
	if (type == 'error') type = 'danger';
	var html = "";
	html += '<div class="alert alert-'+type+'"><a class="close" data-dismiss="alert">×</a>';
	html += msg;
	html += '<div>';
	$('#' + area).html(html);

}

var ajaxError;
function submitAjaxSave(cmd, data, dataType){
	console.log('submit ajax save: ' + cmd + ', dataType: ' + dataType);
	var alertArea = dataType + "-edit-alert-area";
	var successFun = function(returnData){ saveSuccess( dataType, returnData ) };
	submitAjax("saveData", data, successFun, "Save failed!!", alertArea);
}

function submitAjax(cmd, data, successFun, failText, alertArea){
	console.log('submit ajax: ' + cmd);
	var submit_data = {
		cmd: cmd,
		data: JSON.stringify(data)
	}
	$.ajax({
		type: "POST",
		url: ciqData.ajaxUrl || "submit_ajax",
		data: submit_data
	}).done(function (msg) {
		if (msg.code == 'OK'){
			successFun(msg.data);
		} else {
			console.log("CMD FAILED");
			showAlert("danger", alertArea, failText + "<br>" + JSON.stringify(msg.code));
		}
	})
	.fail(function(jqXHR, textStatus, errorThrown){
		showAlert("danger", alertArea, "Server error!!");
		console.log("Server error on: " + cmd);
		console.log(jqXHR.responseText.substring(0,200));
	})
}

function surveyEditForm(s){
	var dataType = "survey";
	s = s || { id: 0, qids: [], options: {}};
	var inputs = [
		["Survey Name", makeTextInput(dataType, "name", "enter name")],
		["Question Count", staticInput("survey-edit-question-count", 0)],
		];
	var addHtml = "";
	addHtml += "<div id='edit-survey-select-questions-by-cat'></div>";
	editDataForm(dataType, s, inputs, addHtml);
	fillEditSurveyQuestions();
}

function questionEditForm(q){
	var dataType = "question";
	q = q || { id : 0, qopts: {} };
	var inputs = [
		["Question Text", makeTextInput(dataType, "qtext", "enter text")],
		["Category", makeSelectInput(dataType, "cat", cats)],
		["Question Type", makeSelectInput(dataType, "qtype", qtypes), "question-details-area"],
		];
	var addHtml = "<div id='question-edit-preview'></div>";
	editDataForm(dataType, q, inputs, addHtml);

}

function staticInput(dataAreaId, initialValue){
	var html = "";
	html += '<p id="'+dataAreaId+'" class="form-control-static">' + initialValue + '</p>';
	return html;
}

function setInputState(el, state){
	var validStates = ['error', 'warning', 'success'];
	var fgEl = $(el).parents('.form-group').first();
	validStates.map( function(x) { fgEl.removeClass('has-' + x); } );
	if (validStates.indexOf(state) < 0){
		console.log("Bad state give to function.");
		return;
	}
	var addClass = 'has-' + state;
	fgEl.addClass(addClass);
}

function camelCase(input) { 
	return input.replace(/-(.)/g, function(match, group1) {
		return group1.toUpperCase();
	});
}

function selectChanged(el){
	console.log('SOME select changed');
	var el = $(el);
	var ident = el.prop('id');
	var spl = ident.split('-');
	var dataType = spl[0];
	var base = ciqData.editData[dataType];
	for (var i=1; i<spl.length - 1; i++){
		base = base[spl[i]];
	}
	var name = spl[spl.length - 1];
	var val = el.val();
	base[name] = val;
	console.log("data update: " + dataType + ": " + JSON.stringify(ciqData.editData[dataType]));
	switch (ident) {
		case "question-qtype":
			questionQtypeChanged(val);
			break;
		case "question-qopts-scaleText":
			questionQoptsScaleTextChanged(val);
			break;
	}
	editDataChanged(dataType);
}

function questionQoptsScaleTextChanged(val){
	if (val == -1){
		var dataType = "question";
		var html = "";
		html = inputLine("Left Text", makeTextInput(dataType, "qopts-scaleTextLeft", "enter left text"));
		html += inputLine("Right Text", makeTextInput(dataType, "qopts-scaleTextRight", "enter right text"));
		$('#scale-text-options-div').html(html);
	} else {
		$('#scale-text-options-div').html("");
	}

}

function questionQtypeChanged(val){
	$('#question-details-area').hide();
	if (val == 1) { // scale
		if (!$('#scaleText').length) {
			var html = inputLine("Extemes Text", makeSelectInput("question", "qopts-scaleText", scaleText), "scale-text-options-div");
			$('#question-details-area').html(html);
		}
		$('#question-details-area').show();
	}
}

function textInputChanged(el){
	el = $(el);
	var ident = el.prop('id');
	var spl = ident.split('-');
	var dataType = spl[0];
	var base = ciqData.editData[dataType];
	for (var i=1; i<spl.length - 1; i++){
		base = base[spl[i]];
	}
	var name = spl[spl.length - 1];
	var val = el.val();
	base[name] = val;
	editDataChanged(dataType);
}

function surveyEditDataComplete(editData){
	if (editData.name)
		return true;
	return false;
}

function customerEditDataComplete(editData){
	if (editData.name && editData.email) {
		if (editData['password']){
			if (editData.password == editData.password2)
				return true;
		} else if (editData.id)
			return true;
	}
	return false;
}

function editDataChanged(dataType){
	var data = ciqData.editData[dataType];
	var testFun = dataType + "EditDataComplete";
	var dataComplete = window[testFun](data);
	buttonWorks(dataType + "-save-button", dataComplete);
}

function fmtSurvey(num, t) {
	var html = "";
	html += "<div id='list-survey-" + t.id + "' class='list-item clr'>";
	html += "<div class='list-summary pull-left'>";
	html += "<div class='category-label'>Name: " + t.name + "</div>";;
	html += "<div class='category-label'>Question Count: " + t.qids.length + "</div>";;
	html += "</div>";
	html += "<div class='list-actions pull-right'>";
	html += "<button type='button' class='btn btn-primary' onclick='editListData(this)'>Edit</button>";
	html += "<button type='button' class='btn btn-primary' onclick='surveyPreview(this)'>Preview</button>";
	html += "<button type='button' class='btn btn-primary' onclick='surveyDelete(this)' disabled='disabled'>Delete</button>";
	html += "</div>";
	html += "</div>";
	return html;
}

function fmtQuestion(num, q){
	var html = "";
	html += "<div id='list-question-"+q.id+"' class='list-item clr'>";
	html += "<div class='category-label'>Category: " + nameFromId(cats, q.cat) + "</div>";;
	html += "<div class='list-num'>" + num + "</div>";
	html += "<div class='list-cb'><input type=checkbox value='"+q.id+"'></div>";
	html += "<div class='question-text'>" + q.qtext + "</div>";
	html += "<div class='question-input'>";
	if (q.qtype == 1) { //scale
		html += genQuestionScale(q.id, q.qopts);
	} else if (q.qtype == 2) { // true / false
		html += genQuestionTF(q.id);
	}
	html += "</div>";
	html += "<div class='list-actions pull-left'><button type='button' class='btn btn-primary' onclick='editListData(this)'>Edit</button></div>";
	html += "</div>";
	return html;
}

function surveyIdFromEl(el){
	// get an question id from any element in a list
	var tid = parseInt($(el).parents('.list-item').first().prop('id').replace('list-survey-', ''));
	return tid;
}

function dataFromId(dataType, did){
	var data = ciqData.db[dataType];
	for (var i=0; i<data.length; i++){
		if (did == data[i].id)
			return data[i];
	}
	return null;
}

function loadData(dataType){
	console.log("load data: " + dataType);
	var successFun = function(returnData) { dataLoaded( dataType, returnData ); };
	submitAjax("loadData", {dataType: dataType}, successFun, "Load failed!!", dataType + "-data-alert-area");
}

function dataLoaded(dataType, data){
//	console.log("DATA LOADED: " + dataType + "\n" + JSON.stringify(data));

	for (var dataName in data){
		ciqData.db[dataName] = data[dataName];
		if (dataName == "question")
			sortQuestionsByCat();
	}

	listShow(dataType);
}

function listShow(dataType){
	var listFunction = dataType + "ListShow";
	window[listFunction]();
}

function surveyListShow(){
	var surveys = ciqData.db.survey;
	var html = "";
	for (var i=0; i< surveys.length; i++){
		var t = surveys[i];
		html += fmtSurvey(i + 1, t);
	}
	$('#survey-list').html(html);
}

function questionListShow(){
	var questions = ciqData.db.question;
	var html = "";
	for (var i=0; i< questions.length; i++){
		var q = questions[i];
		html += fmtQuestion(i + 1, q);
	}
	$('#question-list').html(html);

}

function fmtCustomer(c){
	var html = "";
	html += "<div id='list-customer-" + c.id + "' class='list-item clr'>";
	html += "<div class='pull-left'>" + c.name + " ("+c.email+")</div>";

	html += "<div class='list-actions pull-right'>";
	html += "<button type='button' class='btn btn-primary' onclick='editListData(this)'>Edit</button>";
	html += "<button type='button' class='btn btn-primary' onclick='deleteListData(this)' disabled='disabled'>Delete</button>";
	html += "</div>";

	html += "</div>"; // list-item
	return html;
}

function customerListShow(){
	var customers = ciqData.db.customer;
	console.log("LIST CUSTMER: " + JSON.stringify(customers));

	var html = "";
	for (var i=0; i<customers.length; i++){
		var c = customers[i];
		html += fmtCustomer(c);

	}
	$("#customer-list").html(html);
}

function sortQuestionsByCat(){
	ciqData.questionsByCat = {};
	questionIdsByCat = {};
	for (var i=0; i<ciqData.db.question.length; i++){
		var q = ciqData.db.question[i];
		if (!ciqData.questionsByCat[q.cat]) ciqData.questionsByCat[q.cat] = [];
		if (!questionIdsByCat[q.cat]) questionIdsByCat[q.cat] = [];
		ciqData.questionsByCat[q.cat].push(q);
		questionIdsByCat[q.cat].push(q.id);
	}
//	console.log('sqbc: ' + JSON.stringify(ciqData.questionsByCat));
}

function surveyPreview(el){
	var tid = surveyIdFromEl(el);
	var t = dataFromId("survey", tid);
	var html = "";
	html += "<div id='survey-preview' class='survey-preview'>";
	html += "<a onclick='$(\".survey-preview\").remove();'>CLOSE</a>";
	html += "<div class='area-label'>" + t.name + "</div>";
	var catOrder = t.options.catOrder;
	for (var i=0; i<cats.length;i++){
		var catId = cats[i][0];
		if (catOrder.indexOf(catId) < 0)
			catOrder.push(catId);
	}
	var questionNum = 0;
	for (var i=0; i<catOrder.length; i++){
		var catId = catOrder[i];
		var catQuestions = [];
		// get all qids in cat
		for (var j=0; j<t.qids.length; j++){
			var qid = t.qids[j];
			var q = dataFromId("question",qid);
			console.log("THIS Q IS " + q);
			if (!q) continue;
			if (q.cat == catId)
				catQuestions.push(q);
		}
		if (catQuestions.length == 0) continue;
		html += "<div class='area-label'>Category: " + nameFromId(cats, catId) + "</div>";
		for (var j=0; j < catQuestions.length; j++){
			var q = catQuestions[j];
			html += "<div class='survey-preview-question'>"
			html += genQuestion(q.id, q.qtext, q.qtype, q.qopts);
			html += "</div>"; // survey-preview-question
		}
	}

	html += "</div>"; // survey-preview
//	console.log("HTML IS " + html);
	$('body').append(html);
}

function fillEditSurveyQuestions(){
	var dataType = "survey";
	var html = "<ul class='cat-list sortable-list'>";
	var catOrder = ciqData.editData[dataType].options.catOrder || [];
	// make sure that all cats are represented
	for (var i=0; i<cats.length;i++){
		var catId = cats[i][0];
		if (catOrder.indexOf(catId) < 0)
			catOrder.push(catId);
	}
	var qOrder = ciqData.editData[dataType].options.qOrder || [];
	for (var i=0; i<catOrder.length; i++){
		var catId = catOrder[i];
		var catName = nameFromId(cats, catId);
		var catq = ciqData.questionsByCat[catId];
		if (!catq) continue;
		html += "<div id='cat-section-" + catId + "' class='edit-survey-cat'>";
		html += "<div class='category-label'>Category: " + catName + "</div>";

		html += "<div class='category-question-select-area'>";
		html += "<span class=''>Select Question</span>";
		html += "<select class='form-control category-question-select'><option value=''> -- Select Question --</option>";
		var alreadyInCat = [];
		var alreadyInCat2 = [];
		for (var j=0; j < catq.length; j++){
			var q = catq[j];
			var qid = q.id;
			var qtext = q.qtext;
			var qtypeName = nameFromId(qtypes, q.qtype);
			var qlabel =qtext + " ("+qtypeName+")";
			if (ciqData.editData[dataType].qids.indexOf(qid) < 0){
				html += "<option value='"+qid+"'>" + qlabel + "</option>";
			} else {
				alreadyInCat.push([qid, qlabel]);
			}
		}
		html += "</select>";
		html += "</div>"; // category-question-select
		if (alreadyInCat.length){
			var qInOrder = [];
			var qEnd = [];
			for (var k=0; k<qOrder.length; k++){
				var qid = qOrder[k];
				var io = alreadyInCat.indexOf0(qid);
				if (io >= 0)
					qInOrder.push(alreadyInCat[io]);
			}
			for (var k=0; k<alreadyInCat.length; k++){
				var aic = alreadyInCat[k];
				if (qInOrder.indexOf0(aic[0]) < 0)
					qInOrder.push(aic);
			}
			html += "<div class='questions-in-survey'>";
			html += "<div class='area-label'>Questions in Category</div>";
			html += "<ul class='question-list sortable-list'>"
			for (var k=0; k<qInOrder.length; k++){
				var qid = qInOrder[k][0];
				var qlabel = qInOrder[k][1];
				html += "<li id='question-in-survey-" + qid + "' class='question-in-survey'>";
				html += qlabel;
				html += " <a class='delete-item'>x</a>";
				html += "</li>"; // question-in-survey
			}
			html += "</ul>";
			html += "</div>"; // questions-in-survey
		}
//		console.log('cat: ' + catName + ' in: ' + JSON.stringify(alreadyInCat));
		html += "</div>"; // edit-survey-cat


	}
	html += "</ul>";
	$('#edit-survey-select-questions-by-cat').html(html);
	var q_count = ciqData.editData[dataType].qids.length;
	$('.sortable-list').sortable({
		update: function(){ console.log("order changed"); orderChanged(this) }
		});
	$('#survey-edit-question-count').html(q_count);
}

function addQuestionToSurvey(sel){
	dataType = "survey";
	var qid = parseInt($(sel).val());
	console.log('add q: ' + qid);
	ciqData.editData[dataType].qids.push(qid);
	fillEditSurveyQuestions();
	orderChanged();
}

function deleteQuestionFromSurvey(el){
	var dataType = "survey";
	el = $(el);
	var qid = parseInt(el.parents('.question-in-survey').first().prop('id').replace('question-in-survey-', ''));
	console.log('del id:' + el.parents('.question-in-survey').first().prop('id'));
	var io = ciqData.editData[dataType].qids.indexOf(qid);
	if (io < 0) {
		showAlert('danger', 'survey-edit-area', 'Cannot find question to delete!');
		return;
	}
	ciqData.editData[dataType].qids.splice(io, 1);
	showAlert('success', 'survey-edit-alert-area', 'Deleted');
	fillEditSurveyQuestions();
}

function orderChanged(el){
	el = $(el);
	var catSects = $('.edit-survey-cat');
	var catIds = [];
	for (var i=0;i<catSects.length;i++){
		var catId = parseInt($(catSects[i]).prop('id').replace('cat-section-', ''));
		catIds.push(catId);
	}

	var questionItems = $('.question-in-survey');
	var qids = [];
	for (var i=0; i<questionItems.length; i++){
		var qid = parseInt($(questionItems[i]).prop('id').replace('question-in-survey-', ''));
		qids.push(qid);
	}

	ciqData.editData["survey"].options.catOrder = catIds;
	ciqData.editData["survey"].options.qOrder = qids;
	console.log('Cat order: ' + JSON.stringify(catIds));
	console.log('q order: ' + JSON.stringify(qids));
}

function editDataForm(dataType, editData, inputs, addHtml){
	console.log('edit form ' + dataType);
	ciqData.editData[dataType] = editData;
	var html = "";
	html += "<form class='form-horizontal' role='form'>";
	for (var i=0; i<inputs.length; i++){
		var input = inputs[i];
		html += inputLine(input[0], input[1], input[2] || "");
	}
	html += "</form>";
	html += "<button id='" + dataType + "-save-button' type='button' class='btn btn-primary' onclick='saveData(\""+dataType+"\")' disabled='disabled'>"+ (editData ? "Save Edit" : "Create New") +"</button>&nbsp;";
	html += "<button type='button' class='btn btn-primary' onclick='cancelEdit(\"" + dataType + "\")'>Cancel</button>";

	html += "<div id='" + dataType + "-edit-alert-area'></div>";
	html += addHtml || "";

	$("#" + dataType + "-new-button").hide();
	$("#" + dataType + "-edit-form").html(html);
}

function customerEditForm(c){
	var dataType = "customer";
	c = c || { id: 0 };
	var inputs = [
			["Company Name", makeTextInput(dataType,"name", "enter name")],
			["Email", makeTextInput(dataType,"email", "enter email", "email")],
			["Password", makeTextInput(dataType,"password", "enter password", "password")],
			["Password Again", makeTextInput(dataType,"password2", "enter password again", "password")]
		];
	editDataForm(dataType, c, inputs);
}

function cancelEdit(dataType){
	ciqData.editData[dataType] = null;
	$("#" + dataType + "-new-button").show();
	$("#" + dataType + "-edit-form").html("");
//	$("#" + dataType + "-edit-preview").html("");
	
}

function saveData(dataType){
	$("#" + dataType +"-edit-alert-area").html("");
	var submitData = {
		dataType: dataType,
		saveData: ciqData.editData[dataType]
	};
	submitAjaxSave('saveData', submitData, dataType);
}

function saveSuccess(dataType, savedData){
	console.log(dataType + ' save success:' + JSON.stringify(savedData));
	cancelEdit(dataType);
	ciqData.db[dataType].unshift(savedData);
	listShow(dataType);
}

function saveFail(dataType, errorCode){
	showAlert("danger", dataType + "-edit-alert-area", "Save failed!!<br>" + JSON.stringify(errorCode));
}

function editListData(el){
	// divId in form of list-[dataType]-[dataId]
	var divId = $(el).parents('.list-item').first().prop('id');
	console.log("divid is " + divId);
	var spl = divId.split('-');
	var dataType = spl[1];
	var did = spl[2];
	var d = dataFromId(dataType, did);
	if (!d) return;
	console.log('D IS ' + JSON.stringify(d));
	var formFun = dataType + "EditForm";
	window[formFun](d);

	for (var k in d){
		if (k == "qopts") continue;
		var elId = dataType + '-' + k;
		console.log("k: " + k + " elid: " + elId);
		$('#' + elId).val(d[k]).trigger('change');
	}
	if ("qopts" in d){
		var keys = Object.keys(d.qopts).sort();
		for (var i=0; i<keys.length; i++){
			var k = keys[i];
			var elId = dataType + '-qopts-' + k;
		console.log("k: " + k + " elid: " + elId);
			$('#' + elId).val(d.qopts[k]).trigger('change');
		}
	}
	$('html, body').animate({
		scrollTop: $(".edit-data-area").offset().top - 55
	}, 500);
}

function userAddedSuccess(data){
	if (data.code == "OK"){
		// clear form
		// add user to list
		// alert success

	}

}
