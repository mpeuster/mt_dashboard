
var LMAP;
var ELEMENTS = [];
var PAPERPADDING = 20; // padding of drawing area
var GRIDSIZE = 10;
var APSIZE = 100;
var UESIZE = 100;
var RENDER_TEXT = true;
var RENDER_CONNECTION_CIRCLE = true;

var GLOBAL_MAP_WIDTH = 1200;
var GLOBAL_MAP_HEIGHT = 1000;

var LIVEMAP_SELECTED_BG = null;

//---- Helper

/**
 * Uses .postion_x and .position_y of the 
 * objects to compute their distance. 
 */
function distance(o1, o2)
{
	var x = Math.abs(o1.position_x - o2.position_x);
	var y = Math.abs(o1.position_y - o2.position_y);
	return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}

function calc_scale_factor(base_width, base_height, width, height)
{
	sx = base_width / width;
	sy = base_height / height;
	return Math.min(sx, sy);
}
//----

function draw_grid()
{
	WIDTH = $("#map-area").width();
	HEIGHT = $("#map-area").height();

	// vertical
    for(var x = 0; x < WIDTH; x+= GRIDSIZE)
    {
    	var vpath = "M " + x + " 0 l 0 " + HEIGHT + " z";
    	var vline = LMAP.path(vpath);

    	vline.attr ("stroke", "#EEE");

    	if(x % (GRIDSIZE*10) === 0)
    	{
    		vline.attr("stroke-width", 0.8);
    	}
    	else
    	{
    		vline.attr("stroke-width", 0.3);
    	}

    }

    // horizontal
    for(var y = 0; y < HEIGHT; y+= GRIDSIZE)
    {
    	var hpath = "M 0 " + y + " l " + WIDTH + " 0 z";
    	var hline = LMAP.path(hpath);

    	hline.attr("stroke", "#EEE");
    	if(y % (GRIDSIZE*10) === 0)
    	{
    		hline.attr("stroke-width", 0.8);
    	}
    	else
    	{
    		hline.attr("stroke-width", 0.3);
    	}
    }
}


function draw_map() 
{
	var selected_map = LIVEMAP_SELECTED_BG;
	
	if (selected_map === null)
		return;

	if (selected_map === "None")
		return;

	var imgsrc = "images/maps/" + MAP_DEFINITIONS[selected_map].file;
	var sf = calc_scale_factor(GLOBAL_MAP_WIDTH, GLOBAL_MAP_HEIGHT, MAP_DEFINITIONS[selected_map].width, MAP_DEFINITIONS[selected_map].height);
	var x = 0;
	var y = 0;
	var width = MAP_DEFINITIONS[selected_map].width * sf;
	var height = MAP_DEFINITIONS[selected_map].height * sf;

	var img = LMAP.image(imgsrc, x, y, width, height);
	ELEMENTS.push(img);
}

function draw_accesspoint(ap)
{
	var imgsrc = "images/ap_normal.png";
	if(!ap.power_state)
		imgsrc = "images/ap_red.png";
	var img = LMAP.image(imgsrc, ap.position_x - (APSIZE/2), ap.position_y - (APSIZE/2), APSIZE, APSIZE);
	// add tooltip
	img.attr("title", "" + ap.device_id + "\nX:" + ap.position_x + " Y:" + ap.position_y);

	ELEMENTS.push(img);
	if(RENDER_TEXT) 
	{
		// add text
		var text = LMAP.text(ap.position_x, ap.position_y + (APSIZE/2) + 10, ap.device_id);
		text.attr("font-size", 24);
		text.attr("", "");
		text.attr("", "");
		ELEMENTS.push(text);
	}
}

function draw_accesspoints()
{
	$.each(getApList(), function(i, ap) {
		draw_accesspoint(ap);
	});
}

function draw_ue(ue)
{
	var img = LMAP.image("images/ue_normal.png", ue.position_x - (UESIZE/2), ue.position_y - (UESIZE/2), UESIZE, UESIZE);
	
	// add tooltip
	img.attr("title", "" + ue.device_id + "\nX:" + ue.position_x.toFixed(2) + " Y:" + ue.position_y.toFixed(2));
	ELEMENTS.push(img);
	if(RENDER_TEXT) 
	{
		// add text
		var text = LMAP.text(ue.position_x, ue.position_y + (UESIZE/2) + 20, ue.device_id);
		text.attr("font-size", 24);
		text.attr("", "");
		text.attr("", "");
		ELEMENTS.push(text);
	}
}

function draw_ues()
{
	$.each(getUeList(), function(i, ue) {
		draw_ue(ue);
	});
}

function draw_connection(ue, ap)
{
	if(RENDER_CONNECTION_CIRCLE)
	{
		// optional circle
		var circle = LMAP.circle(ap.position_x, ap.position_y, distance(ue, ap));
		circle.attr("stroke", "#333");
	   	//circle.attr("stroke-width", 2.0);
	   	circle.attr("fill", "#66FF66");
	   	circle.attr("stroke-opacity", 0.6);
	   	circle.attr("opacity", 0.3);
		ELEMENTS.push(circle);
	}

	// line
	var connpath = "M " + ue.position_x + " " + ue.position_y + " L " + ap.position_x + " " + ap.position_y + " z";
   	var connline = LMAP.path(connpath);
   	connline.attr("stroke", "#F00");
   	connline.attr("stroke-width", 3.0);
   	connline.attr("stroke-opacity", 0.6);
   	//connline.attr("stroke-dasharray", "-");
   	connline.attr("stroke-linecap", "round");
	ELEMENTS.push(connline);
}

function draw_connections()
{
	$.each(getUeList(), function(i, ue) {
		// draw connection if needed
		if(ue.assigned_accesspoint)
		{
			var ap = getAp(ue.assigned_accesspoint);
			if(ap)
				draw_connection(ue, ap);
		}
	});
}


function apply_world_transformation()
{
	// fixed map size:
	max_x =  GLOBAL_MAP_WIDTH;
	min_x =  0;
	max_y =  GLOBAL_MAP_HEIGHT;
	min_y =  0;
	// automatic map size:
	/*
	max_x =  Math.max.apply(Math, getGenericValueList("position_x"));
	min_x =  Math.min.apply(Math, getGenericValueList("position_x"));
	max_y =  Math.max.apply(Math, getGenericValueList("position_y"));
	min_y =  Math.min.apply(Math, getGenericValueList("position_y"));
	*/

	paper_width = $("#map-area").width();
	paper_height = $("#map-area").height();

	// calculate translation
	var d_x = -(min_x) + PAPERPADDING;
	var d_y = -(min_y) + PAPERPADDING;

	// calculate scaling
	var s_x = paper_width / ((max_x - min_x) + PAPERPADDING * 2);
	var s_y = paper_height / ((max_y - min_y) + PAPERPADDING * 2);

	$.each(ELEMENTS, function(i, e) {
		e.transform("s" + Math.min(s_x, s_y) + ", " + Math.min(s_x, s_y) + ",0,0" );
		e.transform("...t" + d_x + "," + d_y);
	});

}


function live_map_init()
{
	LMAP = Raphael("map-area", "100%", "100%");
	console.log("Live-Map initialized.");

}


function live_map_paint() 
{
	LMAP.clear();
	ELEMENTS = [];

	draw_grid();
	draw_map();
	draw_connections();
	draw_accesspoints();
	draw_ues();

	apply_world_transformation();



	//LMAP.renderfix();
	
	
}