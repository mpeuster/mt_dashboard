
var UE_MODEL = {};
var UE_LIST = [];
var AP_MODEL = {};
var AP_LIST = [];
var CONNECTED = false;
var FETCHING_ENABLED = true;
var UPDATE_ENABLED = true;
var SELECTED_UE = null;
var API_HOST = null;

//---- Model

function getUe(url)
{
	if(url in UE_MODEL)
		return UE_MODEL[url][UE_MODEL[url].length - 1];
	return null;
}

function getUeList()
{
	if(CONNECTED)
		return UE_LIST.map(getUe);
	return [];
}

function getUeValueList(field)
{
	res = [];
	$.each(getUeList(), function(i, ue) {
		res.push(ue[field]);
	});
	return res;
}

function isUeRegistered(uri)
{
	found = false;
	$.each(UE_LIST, function(i, luri) {
		//console.warn(":.:" + luri + "===" + uri)
		if(luri===uri)
			found = true;
	});
	return found;
}

function getAp(url)
{
	if(url in AP_MODEL)
		return AP_MODEL[url][AP_MODEL[url].length - 1];
	return null;
}

function getApList()
{
	if(CONNECTED)
		return AP_LIST.map(getAp);
	return [];
}

function getApValueList(field)
{
	res = [];
	$.each(getApList(), function(i, ap) {
		res.push(ap[field]);
	});
	return res;
}

function getGenericValueList(field)
{
	return getUeValueList(field).concat(getApValueList(field));
}