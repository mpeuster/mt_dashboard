var power_gauge = null;
var power_gauge_curr_max = 0;
var POWER_SLEEP = 2.0;
var POWER_NOLOAD = 4.0;
var POWER_FULLLOAD = 11.0;
// number of bytes per second on full load (rx + tx)
// TODO: not sure which value is best to use here, e.g.: 54000000 = 54Mbits
var AP_MAX_BYTES_PER_SECOND = 2000000 / 8;

function pm_calc_max_power()
{
	return Math.max(pm_count_all_aps() * POWER_FULLLOAD * 1.1, 40);
}

function pm_calc_current_power()
{
	var total_power = 0;
	$.each(getApList(), function(i, ap) {
    	total_power += pm_calc_current_power_of_ap(ap);
	});
	return total_power;
}

function pm_calc_current_power_of_ap(ap)
{
	// AP is sleeping
	if(ap.power_state < 1)
		return POWER_SLEEP;

	// AP is active: interpolate between NO and FULL load
	var total_bytes_per_second = ap.rx_bytes_per_second + ap.tx_bytes_per_second;
	return POWER_NOLOAD	+ (POWER_FULLLOAD - POWER_NOLOAD) * Math.min(1.0, (total_bytes_per_second / AP_MAX_BYTES_PER_SECOND));

}

function pm_count_all_aps()
{
	return getApValueList("power_state").length;
}

function pm_count_active_aps()
{
	count = 0;
	$.each(getApValueList("power_state"), function(i, ps) {
    	if(ps > 0)
    	{
    		count++;
    	}
	});
	return count;
}

function pm_draw_gauge()
{
	if(power_gauge_curr_max != pm_calc_max_power())
	{
		power_gauge = new Gauge({
		renderTo  : 'power_gauge',
		width     : 240,
		height    : 240,
		maxValue   : pm_calc_max_power(),
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
			to    : pm_calc_max_power() * 0.6,
			color : 'PaleGreen'
		}, {
			from  : pm_calc_max_power() * 0.6,
			to    : pm_calc_max_power() * 0.8,
			color : 'Khaki'
		}, {
			from  : pm_calc_max_power() * 0.8,
			to    : pm_calc_max_power(),
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
	power_gauge_curr_max = pm_calc_max_power();	
}

function pm_update_gauge()
{
	pm_draw_gauge();
	power_gauge.setValue(pm_calc_current_power());
}


