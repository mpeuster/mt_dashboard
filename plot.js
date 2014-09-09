

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
		if(to_negative)
			data[i] = -data[i];
		res.push([i, data[i]]);
	}
	return res;
}

function updateViewUeMonitorPlots(ue)
{
	// plot layout
	var flotOptions = {
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
		}
	};

	// data setup mobile
	var plot_data_mobile = [
	{
		id: "rx",
		label: "RX",
		data: getUePlotData(ue, "rx_mobile_bytes_per_second", false)
	},
	{
		id: "tx",
		label: "TX",
		data: getUePlotData(ue, "tx_mobile_bytes_per_second", true)
	}
	];

	// data setup wifi
	var plot_data_wifi = [
	{
		id: "rx",
		label: "RX",
		data: getUePlotData(ue, "rx_wifi_bytes_per_second", false)
	},
	{
		id: "tx",
		label: "TX",
		data: getUePlotData(ue, "tx_wifi_bytes_per_second", true)
	}
	];

	$.plot($("#plot-monitor-mobile"), plot_data_mobile, flotOptions);
	$.plot($("#plot-monitor-wifi"), plot_data_wifi, flotOptions);
}