
var UE_MODEL = {};
var UE_LIST = [];
var FETCHING_ENABLED = true;
var UPDATE_ENABLED = true;
var API_HOST = 'http://127.0.0.1:6680';

//-------- general helper
// Disable function
jQuery.fn.extend({
    disable: function(state) {
        return this.each(function() {
            this.disabled = state;
        });
    }
});
//----

function getUe(url)
{
	if(url in UE_MODEL)
		return UE_MODEL[url][UE_MODEL[url].length - 1];
	return undefined;
}

function getUeList()
{
	return UE_LIST.map(getUe);
}


function updateViewUeDropdown()
{
	$("#ue_dropdown_list").empty();
	$.each(getUeList(), function(i, ue) {
    	$("#ue_dropdown_list").append('<li><a href="#">' + ue.device_id + '</a></li>');
	});
}

function updateView()
{

	updateViewUeDropdown();

	if(UPDATE_ENABLED)
		setTimeout(updateView, 2000);
}

function addUeDataToModel(ue_data)
{
	// if we have first occurrence of this UE: create a new Array for its history
	if(!(ue_data.uri in UE_MODEL))
		UE_MODEL[ue_data.uri] = [];

	// append the UE dataset to the history array of this UE
	UE_MODEL[ue_data.uri].push(ue_data);

	// if array get to big, remove the first element
	if(UE_MODEL[ue_data.uri].length > 180)
		UE_MODEL[ue_data.uri].shift(); // remove first element
}


function fetchUeData()
{
	console.debug("fetchUeData: " + Date.now());
	// fetch all UE information from backend
	$.getJSON(API_HOST + '/api/ue', function(ue_list) {
			UE_LIST = ue_list;
			$.each(ue_list, function(i, ue_url) {			
				$.getJSON(API_HOST + ue_url, function(ue_data) {			
					addUeDataToModel(ue_data);
				});
			});
		});
}


function fetchApData()
{

}


function fetchData()
{
	// UE data
	fetchUeData();
	// AP data
	fetchApData();
	// set timeout for next fetch operation
	if(FETCHING_ENABLED)
		setTimeout(fetchData, 2000);
}


function eventDisconnect()
{
	// disable data fetching
	FETCHING_ENABLED = false;
	// disable vie updating
	UPDATE_ENABLED = false;
	// disable button
	$('#btn_connect').disable(false);
	$('#btn_disconnect').disable(true);
	// TODO clear views
}

function eventConnect()
{
	// kick off data fetching
	FETCHING_ENABLED = true;
	fetchData();
	// kick off view updating
	UPDATE_ENABLED = true;
	updateView();
	// disable button
	$('#btn_connect').disable(true);
	$('#btn_disconnect').disable(false);
}

$(document).ready(function(){
	console.info("document ready");
	
	//fetchData();
	//updateView();

	// dynamic UI setup
	$('#btn_disconnect').disable(true);
	
	// register UI events
	$('#btn_connect').click(eventConnect);
	$('#btn_disconnect').click(eventDisconnect);


});

