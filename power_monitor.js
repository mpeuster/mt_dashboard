var power_gauge = null;

function pm_draw_gauge()
{
	power_gauge = new Gauge({
	renderTo  : 'power_gauge',
	width     : 240,
	height    : 240,
	maxValue   : 1000,
	glow      : false,
	units     : 'Watt',
	title     : 'Small Cell Power',
	strokeTicks : false,
	colors : {
		plate : 'white',
		title : 'darkgray',
		units : 'lightgray',
		majorTicks : 'darkgray',
		minorTicks : 'lightgray',
		numbers : 'darkgray'
	},
	highlights : [{
		from  : 0,
		to    : 600,
		color : 'PaleGreen'
	}, {
		from  : 600,
		to    : 800,
		color : 'Khaki'
	}, {
		from  : 800,
		to    : 1000,
		color : 'LightSalmon'
	}],
	
	animation : {
		delay : 10,
		duration: 400,
		fn : 'bounce'
	}
	});


	power_gauge.draw();

}

function pm_update_gauge()
{
	power_gauge.setValue( Math.random() * 1000);
}


