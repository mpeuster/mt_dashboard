

function prepend_array(a, val, size)
{
	for(var i = 0; i < size; i++)
	{
		a.unshift(val);
	}
	return a;
}


function updateViewUeMonitorPlots(ue)
{

	var data = getUeHistoricalValues(ue.uri, "rx_mobile_bytes_per_second");
	data = prepend_array(data, 0, MAX_HISTORY);

			// Zip the generated y values with the x values

	var res = [];
	for (var i = 0; i < data.length; ++i) {
			res.push([i, data[i]]);
	}

	var data2 = getUeHistoricalValues(ue.uri, "tx_mobile_bytes_per_second");
	data2 = prepend_array(data2, 0, MAX_HISTORY);
	
	var res2 = [];
	for (i = 0; i < data2.length; ++i) {
			res2.push([i, -data2[i]]); // set second bar to negative values
	}


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
	    //show or hide legend
	    //labelFormatter: null or (fn: string, series object -> string)
	    //formatting your legend label by using custom functions
	    //labelBoxBorderColor: color
	    //label border color
	    //noColumns: number
	    //number of legend columns
	    position: "sw",	    //legend position (north east, north west, south east, south west)
	    //margin: number of pixels or [x margin, y margin]
	    //backgroundColor: null or color
	    //backgroundOpacity: number between 0 and 1
	    //container: null or jQuery object/DOM element/jQuery expression        
		},
	xaxis: {
		show: false,
		},
	yaxis: {
		show: true,
		position: "right",
	}
	};


	var plot_data = [
       {
           id: "rx",
           label: "RX",
           data: res
       },
       {
           id: "tx",
           label: "TX",
           data: res2
       }
   ];

	$.plot($("#plot-monitor-mobile"), plot_data, flotOptions);
}