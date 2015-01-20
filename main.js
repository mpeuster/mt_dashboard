

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
		if(ue.active_application_package===null)
		{
			$("#ue_data_active_app").append("null");
		}
		else
		{
			$("#ue_data_active_app").append(ue.active_application_package.split(".").pop().charAt(0).toUpperCase() + ue.active_application_package.split(".").pop().substring(1));
		}
		$("#ue_data_mac").append('<code>' + ue.wifi_mac + '</code>');
		$("#ue_data_last_update").append(ue.updated_at);

		// update plots
		updateViewUeMonitorPlots(ue);
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

function updateViewSystemMonitor()
{
	// empty fields
	$("#selected_algorithm_name").empty();
	
	if(CONNECTED)
	{
		// fill view with data
		$("#selected_algorithm_name").append(ALGO_SELECTED);
	}
	else
	{
		// clear
		$("#selected_algorithm_name").append("-");
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
		line_str +=	'<td><code><small>' + ue.assigned_accesspoint + '</small></code></td>';
		line_str +=	'<td class="text-right">';
		line_str +=	'<button type="button" class="btn btn-xs btn-default" id="button_ue_overview_change_' + i + '">Change Location</button>&nbsp';
		line_str +=	'<button type="button" class="btn btn-xs btn-danger" id="button_ue_overview_remove_' + i + '">Remove &nbsp;<span class="glyphicon glyphicon-remove-circle"></span></button>';
		line_str +=	'</td>';
		line_str +=	'</tr>' ;
		$("#table_ue_overview").append(line_str);
		// add row events
		$('#row_ue_overview_' + i).click(eventUeSelected(ue.uri));
		$('#button_ue_overview_change_' + i).click(eventChangeLocation(ue.location_service_id));
		$('#button_ue_overview_remove_' + i).click(eventUeRemove(ue.uri));
	});
}

function updateViewApTable()
{
	// clear
	$("#table_ap_overview").empty();
	// headline
	$("#table_ap_overview").append('<tr><th>Name</th><th>BSSID</th><th>SSID</th><th>Power State</th><th> </th></tr>');
	// content
	$.each(getApList(), function(i, ap) {
		var line_str = '<tr>';
		line_str +=	'<td>' + ap.device_id + '</td>';
		//line_str +=	'<td><code><small>' + ap.uri + '</small></code></td>';
		line_str +=	'<td><code>' + ap.bssid + '</code></td>';
		line_str +=	'<td>' + ap.ssid + '</td>';
		line_str +=	'<td>' + (ap.power_state ? 'radio_on' : 'radio_off') + '</td>';
		line_str +=	'<td class="text-right">';
		line_str +=	'<button type="button" class="btn btn-xs btn-default" id="button_ap_overview_change_' + i + '">Change Location</button>&nbsp';
		line_str +=	'</td>';
		line_str +=	'</tr>' ;
		$("#table_ap_overview").append(line_str);
		$('#button_ap_overview_change_' + i).click(eventChangeLocation(ap.location_service_id));
	});
}

function updateViewAlgoDropdown()
{
	$("#algorithm_dropdown_list").empty();
	$.each(ALGO_LIST, function(i, algo) {
    	$("#algorithm_dropdown_list").append('<li><a href="#" id="algo_dropdown_item_' + i + '">' + algo + '</a></li>');
    	$('#algo_dropdown_item_' + i).click(eventAlgoSelected(algo));
	});
}

function updateView()
{
	updateViewUeDropdown();
	updateViewUeMonitor();

	updateViewUeTable();
	updateViewApTable();

	updateViewAlgoDropdown();
	updateViewSystemMonitor();

	live_map_paint();

	pm_update_gauge();

	if(UPDATE_ENABLED)
		setTimeout(updateView, SETTING_UPDATE_INTERVAL);
}

function addUeDataToModel(ue_data)
{
	// if we have first occurrence of this UE: create a new Array for its history
	if(!(ue_data.uri in UE_MODEL))
		UE_MODEL[ue_data.uri] = [];

	// append the UE dataset to the history array of this UE
	UE_MODEL[ue_data.uri].push(ue_data);

	// if array get to big, remove the first element
	if(UE_MODEL[ue_data.uri].length > MAX_HISTORY)
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
	if(AP_MODEL[ap_data.uri].length > MAX_HISTORY)
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

function fetchAlgoData()
{
	console.debug("fetchAlgoData: " + Date.now());
	// fetch all Algo information from backend
	$.getJSON(API_HOST + '/api/algorithm', function(algo_list) {
			ALGO_LIST = algo_list;
		});
	// fetch all Algo information from backend
	$.getJSON(API_HOST + '/api/algorithm/selected', function(algo_sel) {
			ALGO_SELECTED = algo_sel["selected"];
		});
}


function fetchData()
{
	// UE data
	fetchUeData();
	// AP data
	fetchApData();
	// Algo data
	fetchAlgoData();
	// set timeout for next fetch operation
	if(FETCHING_ENABLED)
		setTimeout(fetchData, SETTING_FETCH_INTERVAL);
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
	// reset model
	UE_MODEL = {};
	UE_LIST = [];
	AP_MODEL = {};
	AP_LIST = [];
	SELECTED_UE = null;
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

function eventAlgoSelected(algo)
{
	// function generator:
	return function() {
		console.log("Changing selected algorithm to: " + algo);
		var d = {"selected": algo};
		// perform request
		$.ajax({
			url: API_HOST + "/api/algorithm/selected",
			type: 'PUT',
			contentType: 'application/json',
			dataType: 'json',
			data: JSON.stringify(d),
			success: function(result) {
        		console.log("Algorithm changed.");
    		}
		});
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

function eventChangeLocation(location_service_id)
{
	// function generator:
	return function() {
		// get location inputs	
		bootbox.prompt("Change location (X.XX, Y.YY):", function(result) {                
			if (result !== null) {                                             
				var loc = result.split(",");
				if (loc.length > 1)
				{
					console.log("Change location: " + location_service_id);
					var d = {
							    "location_service_id": location_service_id,
							    "position_x": loc[0],
							    "position_y": loc[1]
							};
					// perform request
					$.ajax({
						url: API_HOST + "/api/location",
						type: 'POST',
						contentType: 'application/json',
    					dataType: 'json',
    					data: JSON.stringify(d),
						success: function(result) {
			        		console.log("Changed location: " + location_service_id);
			    		}
					});
				}   
				else
				{
					bootbox.alert("Bad format. Check your inputs.");
				}      
			}
		});
	};
}

function resizeLiveMap()
{
	// set live map height
	$('#map-area').css({'height':($(window).height() - 180)+'px'});
}

function settingFetchIntervalChange()
{
	var v = parseInt($('#setting_fetch_interval').val());
	if(v >= 1000)
	{
		console.log("Change fetch interval: " + v);
		SETTING_FETCH_INTERVAL = v;
	}
}

function settingUpdateIntervalChange()
{
	var v = parseInt($('#setting_update_interval').val());
	if(v >= 1000)
	{
		console.log("Change update interval: " + v);
		SETTING_UPDATE_INTERVAL = v;
	}
}

var ERROR_ALERT = false;
function errorAjaxConnection()
{
	// only do once
	if(!ERROR_ALERT)
	{
		ERROR_ALERT = true;
		// disconnect
		eventDisconnectClick();
		// show message
		bootbox.alert("ERROR!\nAPI request failed for: " + API_HOST + "\n\n. Please check the backend connection.", function() {
	  		// callback
	  		ERROR_ALERT = false;
		});
	}
}


function eventLiveMapBackgroundSelected(key)
{
	// function generator:
	return function() {
		LIVEMAP_SELECTED_BG = key;
    	console.log("Selected livemap background: " + key);
	};
}


function setupLiveMapBackgroundDropdown()
{
	$("#dropdownLMBackgroundMenu").empty();
	for(var key in MAP_DEFINITIONS){
    	$("#dropdownLMBackgroundMenu").append('<li><a href="#" id="dropdownLMBackgroundMenu_' + key + '">' + key + '</a></li>');
    	$('#dropdownLMBackgroundMenu_' + key).click(eventLiveMapBackgroundSelected(key));
    	
    	// use first BG entry that is not none as default
    	if(LIVEMAP_SELECTED_BG === null && key !== "None")
    	{
    		LIVEMAP_SELECTED_BG = key;
    		console.log("Selected livemap background: " + key);
    	}
	}
}


function setupAutocompletion()
{
	var candiates = [{ id: 1, name: '127.0.0.1:6680'}, { id: 2, name: 'fg-cn-pgsp-kvm.cs.upb.de:6680'}, { id: 3, name: 'localhost:6680'}];
	$('#text_api_host').typeahead({
    	source: candiates
	});
}

$(document).ready(function(){
	console.info("document ready");
	resizeLiveMap();

	// init live map
	live_map_init();
	live_map_paint();

	// dynamic UI setup
	$('#btn_disconnect').disable(true);
	setupAutocompletion();
	setupLiveMapBackgroundDropdown();
	
	// register UI events
	$('#btn_connect').click(eventConnectClick);
	$('#btn_disconnect').click(eventDisconnectClick);
	$('#setting_fetch_interval').on('input', settingFetchIntervalChange);
	$('#setting_update_interval').on('input', settingUpdateIntervalChange);

	// setup global connection error handling
	$.ajaxSetup({
      "error": errorAjaxConnection
	});

	// init and draw power meter
	pm_update_gauge();
});

$( window ).resize(function() {
	resizeLiveMap();
});

