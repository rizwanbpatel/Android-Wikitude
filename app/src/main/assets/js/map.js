var map = L
		.map(
				"map",
				{
					key : "b5w0ip0dC0PPuyZ75hbmUPBcQK7IhO0V",
					 source: ["raster","vector"],
					 basePath: "https://api.tomtom.com/maps-sdk-js",
					glyphsUrl : "https://api.tomtom.com/maps-sdk-js/glyphs/v1/{fontstack}/{range}.pbf",
					spriteUrl : "https://api.tomtom.com/maps-sdk-js/sprites/v1/sprite",
				}, 10);



var displayMap = function () {
    map.setView([World.currentLon, World.currentLon],15);
   $("#panel-map").panel("open", 123);
}

