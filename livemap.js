
var LMAP;


function live_map_init()
{
	LMAP = Raphael("map-area", "100%", "100%");
	console.log("Live-Map initialized.");

}


function live_map_paint() 
{
	// Creates canvas 320 × 200 at 10, 50
	

	// Creates circle at x = 50, y = 40, with radius 10
	var circle = LMAP.circle(50, 40, 10);
	// Sets the fill attribute of the circle to red (#f00)
	circle.attr("fill", "#f00");

	// Sets the stroke attribute of the circle to white
	circle.attr("stroke", "#fff");
}