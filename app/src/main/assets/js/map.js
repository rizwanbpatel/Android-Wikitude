var map = L
		.map(
				"map",
				{
					key : "b5w0ip0dC0PPuyZ75hbmUPBcQK7IhO0V",
					 source: ["raster", "vector"],
					glyphsUrl : "https://api.tomtom.com/maps-sdk-js/glyphs/v1/{fontstack}/{range}.pbf",
					spriteUrl : "https://api.tomtom.com/maps-sdk-js/sprites/v1/sprite"
				}, 18);

map.locate({setView: true, maxZoom: 15});





