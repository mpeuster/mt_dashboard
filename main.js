
var UE_MODEL = {};
var UE_LIST = [];
var AP_MODEL = {};
var AP_LIST = [];
var CONNECTED = false;
var FETCHING_ENABLED = true;
var UPDATE_ENABLED = true;
var SELECTED_UE = null;
var API_HOST = null;

//-------- general helper
// Disable function
jQuery.fn.extend({
    disable: function(state) {
        return this.each(function() {
            this.disabled = state;
        });
    }
});

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

//---- View

function updateViewUeDropdown()
{
	$("#ue_dropdown_list").empty();
	$.each(getUeList(), function(i, ue) {
    	$("#ue_dropdown_list").append('<li><a href="#" id="ue_dropdown_item_' + i + '">' + ue.device_id + '</a></li>');
    	$('#ue_dropdown_item_' + i).click(eventUeSelected(ue.uri));
    	
    	// use first UE as default selection
    	if(!isUeRegistered(SELECTED_UE) && i === 0 && CONNECTED)
    	{
    		eventUeSelected(ue.uri)();
    	}
	});
}

function updateViewUeMonitor()
{
	// empty fields
	$("#ue_data_name").empty();
	$("#ue_data_lsid").empty();
	$("#ue_data_position").empty();
	$("#ue_data_display_state").empty();
	$("#ue_data_active_app").empty();
	$("#ue_data_mac").empty();
	$("#ue_data_last_update").empty();

	// get UE
	ue = getUe(SELECTED_UE);
	
	if(ue)
	{
		// fill view with data
		$("#ue_data_name").append(ue.device_id);
		$("#ue_data_lsid").append(ue.location_service_id);
		$("#ue_data_position").append(ue.position_x.toFixed(2) + " / " + ue.position_y.toFixed(2));
		$("#ue_data_display_state").append(ue.display_state ? "On" : "Off");
		$("#ue_data_active_app").append(ue.active_application_package.split(".").pop().charAt(0).toUpperCase() + ue.active_application_package.split(".").pop().substring(1));
		$("#ue_data_mac").append(ue.wifi_mac);
		$("#ue_data_last_update").append(new Date(ue.updated_at).toLocaleTimeString());
	}
	else
	{
		// clear
		$("#ue_data_name").append("-");
		$("#ue_data_lsid").append("-");
		$("#ue_data_position").append("-");
		$("#ue_data_display_state").append("-");
		$("#ue_data_active_app").append("-");
		$("#ue_data_mac").append("-");
		$("#ue_data_last_update").append("-");
	}
}

function updateViewUeTable()
{
	// clear
	$("#table_ue_overview").empty();
	// headline
	$("#table_ue_overview").append('<tr><th>Name</th><th>Assignment</th><th></th></tr>');
	// content
	$.each(getUeList(), function(i, ue) {
		var line_str = '<tr class="clickable_row" id="row_ue_overview_' + i +'">';
		line_str +=	'<td>' + ue.device_id + '</td>';
		//line_str +=	'<td><code><small>' + ue.uri + '</small></code></td>';
		line_str +=	'<td><small>' + ue.assigned_accesspoint + '</small></td>';
		line_str +=	'<td class="text-right">';
		line_str +=	'<button type="button" class="btn btn-xs btn-default" id="button_ue_overview_change_' + i + '">Change Location</button>&nbsp';
		line_str +=	'<button type="button" class="btn btn-xs btn-danger" id="button_ue_overview_remove_' + i + '">Remove &nbsp;<span class="glyphicon glyphicon-remove-circle"></span></button>';
		line_str +=	'</td>';
		line_str +=	'</tr>' ;
		$("#table_ue_overview").append(line_str);
		// add row events
		$('#row_ue_overview_' + i).click(eventUeSelected(ue.uri));
		$('#button_ue_overview_change_' + i).click(eventUeChangeLocation(ue.uri));
		$('#button_ue_overview_remove_' + i).click(eventUeRemove(ue.uri));
	});
}

function updateViewApTable()
{
	// clear
	$("#table_ap_overview").empty();
	// headline
	$("#table_ap_overview").append('<tr><th>Name</th><th>BSSID</th><th>SSID</th><th>Power State</th></tr>');
	// content
	$.each(getApList(), function(i, ap) {
		var line_str = '<tr>';
		line_str +=	'<td>' + ap.device_id + '</td>';
		//line_str +=	'<td><code><small>' + ap.uri + '</small></code></td>';
		line_str +=	'<td><code>' + ap.bssid + '</code></td>';
		line_str +=	'<td>' + ap.ssid + '</td>';
		line_str +=	'<td>' + (ap.power_state ? 'radio_on' : 'radio_off') + '</td>';
		line_str +=	'</tr>' ;
		$("#table_ap_overview").append(line_str);
	});
}

function updateView()
{
	updateViewUeDropdown();
	updateViewUeMonitor();

	updateViewUeTable();
	updateViewApTable();

	if(UPDATE_ENABLED)
		setTimeout(updateView, 1000);
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

function addApDataToModel(ap_data)
{
	// if we have first occurrence of this AP: create a new Array for its history
	if(!(ap_data.uri in AP_MODEL))
		AP_MODEL[ap_data.uri] = [];

	// append the UE dataset to the history array of this UE
	AP_MODEL[ap_data.uri].push(ap_data);

	// if array get to big, remove the first element
	if(AP_MODEL[ap_data.uri].length > 180)
		AP_MODEL[ap_data.uri].shift(); // remove first element
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
	console.debug("fetchApData: " + Date.now());
	// fetch all UE information from backend
	$.getJSON(API_HOST + '/api/accesspoint', function(ap_list) {
			AP_LIST = ap_list;
			$.each(ap_list, function(i, ap_url) {			
				$.getJSON(API_HOST + ap_url, function(ap_data) {			
					addApDataToModel(ap_data);
				});
			});
		});
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


function eventDisconnectClick()
{
	CONNECTED = false;
	console.log("Disconnecting...");
	// disable data fetching
	FETCHING_ENABLED = false;
	// disable vie updating
	setTimeout(function(){
		// disable after some time, to give UI time to clear itself
		UPDATE_ENABLED = false;
		console.log("Stopped UI updates.");
	}, 3000);
	SELECTED_UE = null;
	// disable button
	$('#btn_connect').disable(false);
	$('#text_api_host').disable(false);
	$('#btn_disconnect').disable(true);
}

function eventConnectClick()
{
	// set host address
	API_HOST = "http://" + $("#text_api_host").val();
	console.log("Connecting to: " + API_HOST + "...");
	// kick off data fetching
	FETCHING_ENABLED = true;
	fetchData();
	// kick off view updating
	UPDATE_ENABLED = true;
	updateView();
	// disable button
	$('#btn_connect').disable(true);
	$('#text_api_host').disable(true);
	$('#btn_disconnect').disable(false);

	CONNECTED = true;
}

function eventUeSelected(uri)
{
	// function generator:
	return function() {
		SELECTED_UE = uri;
		console.log("Selected UE: " + uri);
	};
}

function eventUeRemove(uri)
{
	// function generator:
	return function() {
		console.log("Remove UE: " + uri);
		$.ajax({
			url: API_HOST + uri,
			type: 'DELETE',
			success: function(result) {
        		console.log("Removed UE: " + uri);
    		}
		});
	};
}

function eventUeChangeLocation(uri)
{
	// function generator:
	return function() {
		alert("Not implemented.");
		console.log("Change UE location: " + uri);
	};
}



$(document).ready(function(){
	console.info("document ready");
	
	//fetchData();
	//updateView();

	// dynamic UI setup
	$('#btn_disconnect').disable(true);
	
	// register UI events
	$('#btn_connect').click(eventConnectClick);
	$('#btn_disconnect').click(eventDisconnectClick);


	//TODO Romove
	eventConnectClick(); // autoconnect for dev


});

