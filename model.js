
var UE_MODEL = {};
var UE_LIST = [];
var AP_MODEL = {};
var AP_LIST = [];
var MAX_HISTORY = 60;
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

function getUeHistoricalValues(url, field)
{
	if(url in UE_MODEL)
		return UE_MODEL[url].map(function(o) {return o[field];});
	return [];
}

function getUeList()
{
	if(CONNECTED)
		return UE_LIST.map(getUe);
	return [];
}

function getUeValueList(field)
{
	return getUeList().map(function(o) {return o[field];});
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
	return getApList().map(function(o) {return o[field];});
}

function getGenericValueList(field)
{
	return getUeValueList(field).concat(getApValueList(field));
}