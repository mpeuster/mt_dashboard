

function prepend_array(a, val, size)
{
	for(var i = a.length; i < size; i++)
	{
		a.unshift(val);
	}
	return a;
}


function getUePlotData(ue, field, to_negative)
{
	// get data
	var data = getUeHistoricalValues(ue.uri, field);
	// pad data
	data = prepend_array(data, 0, MAX_HISTORY);
	// zip
	var res = [];
	for (var i = 0; i < data.length; ++i) {
		if(data[i] < 0) // no negative values
			data[i] = 0;
		if(to_negative) // to display two plots in one graph
			data[i] = -data[i];
		// to Mbp/s
		data[i] = data[i] * 8; // byte to bit
		data[i] = data[i] / 1000000; // to Mbps
		res.push([i, data[i]]);
	}
	return res;
}

function getAvg(data)
{
	sum = 0;
	for (var i = 0; i < data.length; ++i) {
		sum += data[i][1];
	}
	return sum / data.length;
}

function getMax(data, is_negative)
{
	max = 0;
	negative_max = 0;
	for (var i = 0; i < data.length; ++i) {
		if (data[i][1] > max)
			max = data[i][1];
		if (data[i][1] < negative_max)
			negative_max = data[i][1];
	}
	if(is_negative)
		return negative_max;
	return max;
}


function updateViewUeMonitorPlots(ue)
{
	// receive data
	var data_mobile_rx = getUePlotData(ue, "rx_mobile_bytes_per_second", false);
	var data_mobile_tx = getUePlotData(ue, "tx_mobile_bytes_per_second", true);
	var data_wifi_rx = getUePlotData(ue, "rx_wifi_bytes_per_second", false);
	var data_wifi_tx = getUePlotData(ue, "tx_wifi_bytes_per_second", true);
	
	var mobile_max = Math.max(getMax(data_mobile_rx, false), -getMax(data_mobile_tx, true));
	var mobile_y = Math.max(0.1, mobile_max * 1.2); // use n * avg as Y scale (should help against outliers)
	var wifi_max = Math.max(getMax(data_wifi_rx, false), -getMax(data_wifi_tx, true));
	var wifi_y = Math.max(10, wifi_max * 1.2); // use n * avg as Y scale (should help against outliers)

	// plot layout
	var flotOptionsMobile = {
		grid: {
			show: true,
			color: "#BBB",
			borderWidth: 1,
			borderColor: "#AAA",
			margin: 8,
			hoverable: false,
			autoHighlight: false
		},
		series: {
			lines: {
				show: true,
				lineWidth: 1,
				fill: true,
				fillColor: { colors: [{ opacity: 0.7 }, { opacity: 0.1}] },
			},
			clickable: true,
			hoverable: true,
			shadowSize: 1
		},
		colors: ["#5CE65C","#FF7070"],
		legend: {
			show: true, 
			position: "sw"
		},
		xaxis: {
			show: false,
		},
		yaxis: {
			show: true,
			position: "right",
			min: -mobile_y,
			max: mobile_y,
		}
	};

	var flotOptionsWifi = {
		grid: {
			show: true,
			color: "#BBB",
			borderWidth: 1,
			borderColor: "#AAA",
			margin: 8,
			hoverable: false,
			autoHighlight: false
		},
		series: {
			lines: {
				show: true,
				lineWidth: 1,
				fill: true,
				fillColor: { colors: [{ opacity: 0.7 }, { opacity: 0.1}] },
			},
			clickable: true,
			hoverable: true,
			shadowSize: 1
		},
		colors: ["#5CE65C","#FF7070"],
		legend: {
			show: true, 
			position: "sw"
		},
		xaxis: {
			show: false,
		},
		yaxis: {
			show: true,
			position: "right",
			min: -wifi_y,
			max: wifi_y,
		}
	};

	// data setup mobile
	var plot_data_mobile = [
	{
		id: "rx",
		label: "RX",
		data: data_mobile_rx
	},
	{
		id: "tx",
		label: "TX",
		data: data_mobile_tx
	}
	];

	// data setup wifi
	var plot_data_wifi = [
	{
		id: "rx",
		label: "RX",
		data: data_wifi_rx
	},
	{
		id: "tx",
		label: "TX",
		data: data_wifi_tx
	}
	];

	$.plot($("#plot-monitor-mobile"), plot_data_mobile, flotOptionsMobile);
	$.plot($("#plot-monitor-wifi"), plot_data_wifi, flotOptionsWifi);
}