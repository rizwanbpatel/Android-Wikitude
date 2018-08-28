// information about server communication. This sample webservice is provided by Wikitude and returns random dummy places near given location
var ServerInformation = {
	//POIDATA_SERVER: "https://api.tomtom.com/search/2/nearbySearch/",
        POIDATA_SERVER: "https://api.tomtom.com/search/2/categorySearch/",
        POIDATA_SERVER_ARG_LAT: "lat",
        POIDATA_SERVER_ARG_LON: "lon",
        POIDATA_SERVER_ARG_NR_POIS: "nrPois",
        POIDATA_SERVER_ARG_RADIUS: "radius",
        POIDATA_CATEGORY: "",
        POIDATA_EXT: ".json",
        POI_RADIUS_VALUE: "52500",
        POIDATA_NEARBY_SEARCH: "https://api.tomtom.com/search/2/nearbySearch/",
};

// implementation of AR-Experience (aka "World")
var World = {

    currentLat: 0,
    currentLon: 0,
    currentAlt: 0,
	//  user's latest known location, accessible via userLocation.latitude, userLocation.longitude, userLocation.altitude
	userLocation: null,

	// you may request new data from server periodically, however: in this sample data is only requested once
	isRequestingData: false,

	// true once data was fetched
	initiallyLoadedData: false,

	// different POI-Marker assets
	markerDrawable_idle: null,
	markerDrawable_selected: null,
	markerDrawable_directionIndicator: null,

	// list of AR.GeoObjects that are currently shown in the scene / World
	markerList: [],

    angleDict: [],
	// The last selected marker
	currentMarker: null,

	locationUpdateCounter: 0,
	updatePlacemarkDistancesEveryXLocationUpdates: 10,

	routeOnMapView : null,

	routingLineString : null,

	clearARViewMarkers: function clearARViewMarkersFn(){

            if(World.markerList.length != 0){
                for (var i = 0; i < World.markerList.length; i++){
                    var markerElement = World.markerList[i];
                    markerElement.markerObject.enabled = false;
                    //markerElement.markerObject.remove();
                }

            }
    },


	// called to inject new POI data
	loadPoisFromJsonData: function loadPoisFromJsonDataFn(poiData) {

	    // empty list of visible markers
        World.clearARViewMarkers();
       // World.routeOnMapView.addTo(map);

        World.angleDict.push({
                "st_ang": 0,
                "end_ang": 20, "altitude": 525
            }, {
                "st_ang": 21,
                "end_ang": 40, "altitude": 525
            }, {
                "st_ang": 41,
                "end_ang": 60, "altitude": 525
            }, {
                "st_ang": 61,
                "end_ang": 80, "altitude": 525
            },
            {
                "st_ang": 81,
                "end_ang": 100, "altitude": 525
            }, {
                "st_ang": 101,
                "end_ang": 120, "altitude": 525
            }, {
                "st_ang": 121,
                "end_ang": 140, "altitude": 525
            }, {
                "st_ang": 141,
                "end_ang": 160, "altitude": 525
            }, {
                "st_ang": 161,
                "end_ang": 180, "altitude": 525
            }, {
                "st_ang": 181,
                "end_ang": 200, "altitude": 525
            }, {
                "st_ang": 201,
                "end_ang": 220, "altitude": 525
            }, {
                "st_ang": 221,
                "end_ang": 240, "altitude": 525
            }, {
                "st_ang": 241,
                "end_ang": 260, "altitude": 525
            }, {
                "st_ang": 261,
                "end_ang": 280, "altitude": 525
            }, {
                "st_ang": 281,
                "end_ang": 300, "altitude": 525
            }, {
                "st_ang": 301,
                "end_ang": 320, "altitude": 525
            }, {
                "st_ang": 321,
                "end_ang": 240, "altitude": 525
            }, {
                "st_ang": 341,
                "end_ang": 360, "altitude": 525
            }
        );

		// show radar & set click-listener
		PoiRadar.show();
		$('#radarContainer').unbind('click');
		$("#radarContainer").click(PoiRadar.clickedRadar);

		// empty list of visible markers
		World.markerList = [];

        resultList = poiData.results;
        // start loading marker assets
        World.markerDrawable_idle = new AR.ImageResource("assets/marker_idle.png");
        World.markerDrawable_selected = new AR.ImageResource("assets/marker_selected.png");
        World.markerDrawable_directionIndicator = new AR.ImageResource("assets/indi.png");
        World.bank = new AR.ImageResource("assets/logos/bank.png");
        World.hotel = new AR.ImageResource("assets/hotel1.png");
        World.cafe = new AR.ImageResource("assets/logos/cafe.png");
        World.doctor = new AR.ImageResource("assets/logos/doctor.png");
        World.petrol = new AR.ImageResource("assets/logos/petrol.png");
        World.post_office = new AR.ImageResource("assets/logos/post_poffice.png");
        World.residential = new AR.ImageResource("assets/logos/residential.png");
        World.school = new AR.ImageResource("assets/logos/school.png");
        World.temple = new AR.ImageResource("assets/logos/temple.png");
        World.gov = new AR.ImageResource("assets/logos/museum.png");
        World.default = new AR.ImageResource("assets/default.png");
        World.airport = new AR.ImageResource("assets/logos/airport.png");
        World.startNav = new AR.ImageResource("assets/up.png")

		// loop through POI-information and create an AR.GeoObject (=Marker) per POI
	        for (var i = 0; i < resultList.length; i++) {
                itPoi = resultList[i];
                var singlePoi = {
                    "id": itPoi.id,
                    "latitude": parseFloat(itPoi.position.lat),
                    "longitude": parseFloat(itPoi.position.lon),
                    "altitude": parseFloat(0.0),
                    "title": itPoi.poi.name,
                    "description": itPoi.address.freeformAddress,
                    "category": itPoi.poi.classifications[0].code
                };
                var angleDeg = Math.abs(Math.atan2(World.currentLon - itPoi.position.lon, World.currentLat - itPoi.position.lat) * 180 / Math.PI);
                singlePoi.altitude = World.getAltitudeFromData(angleDeg);
                World.markerList.push(new Marker(singlePoi));
            }

		// updates distance information of all placemarks
		World.updateDistanceToUserValues();

		//World.updateStatusMessage(World.markerList.length + ' places loaded');

		// set distance slider to 100%
		$("#panel-distance-range").val(100);
		$("#panel-distance-range").slider("refresh");
	},

    getAltitudeFromData: function getAltitudeFromData(angleDeg) {
        var alti = 0;
        for (var i = 0; i < World.angleDict.length; i++) {
            if (angleDeg >= World.angleDict[i].st_ang && angleDeg <= World.angleDict[i].end_ang) {
                World.angleDict[i].altitude = World.currentAlt + 10;
                alti = World.angleDict[i].altitude;
                break;
            }
        }
        return alti;
    },

	// sets/updates distances of all makers so they are available way faster than calling (time-consuming) distanceToUser() method all the time
	updateDistanceToUserValues: function updateDistanceToUserValuesFn() {
		for (var i = 0; i < World.markerList.length; i++) {
			World.markerList[i].distanceToUser = World.markerList[i].markerObject.locations[0].distanceToUser();
		}
	},

	// updates status message shown in small "i"-button aligned bottom center
	updateStatusMessage: function updateStatusMessageFn(message, isWarning) {

		var themeToUse = isWarning ? "e" : "e";
		var iconToUse = isWarning ? "home" : "refresh";

		$("#status-message").html(message);
		$("#popupInfoButton").buttonMarkup({
			theme: themeToUse
		});
		$("#popupInfoButton").buttonMarkup({
			icon: iconToUse
		});
	},

	// location updates, fired every time you call architectView.setLocation() in native environment
	locationChanged: function locationChangedFn(lat, lon, alt, acc) {

		// store user's current location in World.userLocation, so you always know where user is
		World.userLocation = {
			'latitude': lat,
			'longitude': lon,
			'altitude': alt,
			'accuracy': acc
		};


		// request data if not already present
		if (!World.initiallyLoadedData) {
			World.requestDataFromServer(lat, lon);
			World.initiallyLoadedData = true;
		} else if (World.locationUpdateCounter === 0) {
			// update placemark distance information frequently, you max also update distances only every 10m with some more effort
			World.updateDistanceToUserValues();
		}
        World.currentLat = lat;
        World.currentLon = lon;
        World.currentAlt = alt;
		// helper used to update placemark information every now and then (e.g. every 10 location upadtes fired)
		World.locationUpdateCounter = (++World.locationUpdateCounter % World.updatePlacemarkDistancesEveryXLocationUpdates);
	},

    loadHotels: function loadHotelsFn() {
        ServerInformation.POIDATA_CATEGORY = "hotel";
        ServerInformation.POI_RADIUS_VALUE = "525";
        World.isNearbySearchEnable = false;
        World.requestDataFromServer(World.currentLat, World.currentLon);
    },

    loadAirports: function loadAirportFn() {
        ServerInformation.POIDATA_CATEGORY = "airport";
        ServerInformation.POI_RADIUS_VALUE = "10000";
        World.isNearbySearchEnable = false;
        World.requestDataFromServer(World.currentLat, World.currentLon);
    },

    loadAllNearBy: function loadAllNearByFn(){
        ServerInformation.POIDATA_CATEGORY = "";
        ServerInformation.POI_RADIUS_VALUE = "600";
        World.isNearbySearchEnable = true;
        World.requestDataFromServer(World.currentLat, World.currentLon);
    },

    addMarkers: function (feature) {
        var startPoint, endPoint;
        if (feature.geometry.type === 'MultiLineString') {
            startPoint = feature.geometry.coordinates[0][0].reverse(); //get first point from first line
            endPoint = feature.geometry.coordinates.slice(-1)[0].slice(-1)[0].reverse(); //get last point from last line
        } else {
            startPoint = feature.geometry.coordinates[0].reverse();
            endPoint = feature.geometry.coordinates.slice(-1)[0].reverse();
        }
       // tomtom.L.marker(startPoint, {icon: startIcon}).addTo(map);
       // tomtom.L.marker(endPoint, {icon: endIcon}).addTo(map);
    },

    onRouteSelected : function(){
       var marker = World.currentMarker;
       var lat = marker.markerObject.locations[0].latitude;
       var lon = marker.markerObject.locations[0].longitude;
       var jsonArray = [];
       var jsonObj= [];
       var routeString = '' + lat + ',' + lon + ':' + World.currentLat+ ',' + World.currentLon + '';
       var routeUrl = "https://api.tomtom.com/routing/1/calculateRoute/" + routeString + "?key=b5w0ip0dC0PPuyZ75hbmUPBcQK7IhO0V";
       $.ajax({
        type:"GET",
        url : routeUrl,
        dataType : "xml",
        success: function(data){
          $(data).find("point").each(function(){
                var latitude = $(this).attr('latitude');
                var longitude = $(this).attr('longitude');
                jsonArray.push({"lat": latitude, "lon":longitude});
          });
//          alert(JSON.stringify(jsonArray[0].lat));
          World.routingLineString = jsonArray;
          $("#panel-poidetail").popup("close");

//           alert("closed");

          var markerLocation = new AR.GeoLocation(jsonArray[0].lat, jsonArray[0].lon);
          var startNav = new AR.ImageDrawable(World.startNav, 2.5, {
              zOrder: 0,
              opacity: 1.0
          });

          // create GeoObject
          var markerObject = new AR.GeoObject(markerLocation, {
              drawables: {
                  cam: [startNav]
              }
          });


        },
        error: function(){
            alert("failed");
        }
       });

    },
    startRoute : function(){


    },
    stopRoute : function(){
        World.routingLineString = null;
    },
	// fired when user pressed maker in cam
	onMarkerSelected: function onMarkerSelectedFn(marker) {



		World.currentMarker = marker;
        var lat = marker.markerObject.locations[0].latitude;
        var lon = marker.markerObject.locations[0].longitude;
        map.invalidateSize();
        map.setView(new L.LatLng(lat,lon), 15);
        var routeString = '' + lat + ',' + lon + ':' + World.currentLat+ ',' + World.currentLon + '';
        if(World.routeOnMapView == null){
            World.routeOnMapView = (tomtom.routeOnMap()).addTo(map);
        }
        World.routeOnMapView.clear();
        if(markerAdded ){
            map.removeLayer(startMarker);
            map.removeLayer(endMarker);
        }
        endMarker = L.marker([lat,lon],{icon:endIcon}).addTo(map);
        startMarker = L.marker([World.currentLat,World.currentLon],{icon:startIcon}).addTo(map);
        markerAdded = true;
        World.routeOnMapView.createRoute(routeString);
        World.routeOnMapView.fitMapBoundsToRoute();



		// update panel values
		$("#poi-detail-title").html(marker.poiData.title);
		//$("#poi-detail-description").html(marker.poiData.description);
		$("#poi-detail-category").html(marker.poiData.category);

		/* It's ok for AR.Location subclass objects to return a distance of `undefined`. In case such a distance was calculated when all distances were queried in `updateDistanceToUserValues`, we recalcualte this specific distance before we update the UI. */
		if( undefined == marker.distanceToUser ) {
			marker.distanceToUser = marker.markerObject.locations[0].distanceToUser();
		}
		var distanceToUserValue = (marker.distanceToUser > 999) ? ((marker.distanceToUser / 1000).toFixed(2) + " km") : (Math.round(marker.distanceToUser) + " m");

		$("#poi-detail-distance").html(distanceToUserValue);




		// show panel
		$("#panel-poidetail").popup("open", 123);
		
		$( ".ui-panel-dismiss" ).unbind("mousedown");

		$("#panel-poidetail").on("popupafterclose", function(event, ui) {
			World.currentMarker.setDeselected(World.currentMarker);
		});
	},

	// screen was clicked but no geo-object was hit
	onScreenClick: function onScreenClickFn() {
		// you may handle clicks on empty AR space too
	},

	// returns distance in meters of placemark with maxdistance * 1.1
	getMaxDistance: function getMaxDistanceFn() {

		// sort places by distance so the first entry is the one with the maximum distance
		World.markerList.sort(World.sortByDistanceSortingDescending);

		// use distanceToUser to get max-distance
		var maxDistanceMeters = World.markerList[0].distanceToUser;

		// return maximum distance times some factor >1.0 so ther is some room left and small movements of user don't cause places far away to disappear
		return maxDistanceMeters * 1.1;
	},

	// udpates values show in "range panel"
	updateRangeValues: function updateRangeValuesFn() {

		// get current slider value (0..100);
		var slider_value = $("#panel-distance-range").val();

		// max range relative to the maximum distance of all visible places
		var maxRangeMeters = Math.round(World.getMaxDistance() * (slider_value / 100));

		// range in meters including metric m/km
		var maxRangeValue = (maxRangeMeters > 999) ? ((maxRangeMeters / 1000).toFixed(2) + " km") : (Math.round(maxRangeMeters) + " m");

		// number of places within max-range
		var placesInRange = World.getNumberOfVisiblePlacesInRange(maxRangeMeters);

		// update UI labels accordingly
		$("#panel-distance-value").html(maxRangeValue);
		$("#panel-distance-places").html((placesInRange != 1) ? (placesInRange + " Places") : (placesInRange + " Place"));

		// update culling distance, so only places within given range are rendered
		AR.context.scene.cullingDistance = Math.max(maxRangeMeters, 1);

		// update radar's maxDistance so radius of radar is updated too
		PoiRadar.setMaxDistance(Math.max(maxRangeMeters, 1));
	},

	// returns number of places with same or lower distance than given range
	getNumberOfVisiblePlacesInRange: function getNumberOfVisiblePlacesInRangeFn(maxRangeMeters) {

		// sort markers by distance
		World.markerList.sort(World.sortByDistanceSorting);

		// loop through list and stop once a placemark is out of range ( -> very basic implementation )
		for (var i = 0; i < World.markerList.length; i++) {
			if (World.markerList[i].distanceToUser > maxRangeMeters) {
				return i;
			}
		};

		// in case no placemark is out of range -> all are visible
		return World.markerList.length;
	},

	handlePanelMovements: function handlePanelMovementsFn() {

		$("#panel-distance").on("panelclose", function(event, ui) {
			$("#radarContainer").addClass("radarContainer_left");
			$("#radarContainer").removeClass("radarContainer_right");
			PoiRadar.updatePosition();
		});

		$("#panel-distance").on("panelopen", function(event, ui) {
			$("#radarContainer").removeClass("radarContainer_left");
			$("#radarContainer").addClass("radarContainer_right");
			PoiRadar.updatePosition();
		});
	},

	// display range slider
	showRange: function showRangeFn() {
		if (World.markerList.length > 0) {

			// update labels on every range movement
			$('#panel-distance-range').change(function() {
				World.updateRangeValues();
			});

			World.updateRangeValues();
			World.handlePanelMovements();

			// open panel
			$("#panel-distance").trigger("updatelayout");
			$("#panel-distance").panel("open", 1234);
		} else {

			// no places are visible, because the are not loaded yet
			World.updateStatusMessage('No places available yet', true);
		}
	},

	// request POI data
	requestDataFromServer: function requestDataFromServerFn(lat, lon) {

	 // set helper var to avoid requesting places while loading
            World.isRequestingData = true;
            World.updateStatusMessage('Requesting places from web-service');

            var serverUrl =ServerInformation.POIDATA_SERVER + ServerInformation.POIDATA_CATEGORY + ServerInformation.POIDATA_EXT + "?key=PQoRU6eDPhcI7zJI1faRAGH5NG0BJUOk&" + ServerInformation.POIDATA_SERVER_ARG_LAT + "=" + lat + "&" + ServerInformation.POIDATA_SERVER_ARG_RADIUS + "=" + ServerInformation.POI_RADIUS_VALUE + "&" + ServerInformation.POIDATA_SERVER_ARG_LON + "=" + lon + "&limit=25&language=en-GB";;
            // server-url to JSON content provider
            if(World.isNearbySearchEnable){
                 serverUrl = ServerInformation.POIDATA_NEARBY_SEARCH + ServerInformation.POIDATA_CATEGORY + ServerInformation.POIDATA_EXT + "?key=PQoRU6eDPhcI7zJI1faRAGH5NG0BJUOk&" + ServerInformation.POIDATA_SERVER_ARG_LAT + "=" + lat + "&" + ServerInformation.POIDATA_SERVER_ARG_RADIUS + "=" + ServerInformation.POI_RADIUS_VALUE + "&" + ServerInformation.POIDATA_SERVER_ARG_LON + "=" + lon + "&limit=35&language=en-GB";
                var jqxhr = $.getJSON(serverUrl, function (data) {
                    World.loadPoisFromJsonData(data);
                })
                    .error(function (err) {
                        World.updateStatusMessage("", true);
                        World.isRequestingData = false;
                    })
                    .complete(function () {
                        World.isRequestingData = false;
                    });
            }else {
                 serverUrl = ServerInformation.POIDATA_SERVER + ServerInformation.POIDATA_CATEGORY + ServerInformation.POIDATA_EXT + "?key=PQoRU6eDPhcI7zJI1faRAGH5NG0BJUOi&" + ServerInformation.POIDATA_SERVER_ARG_LAT + "=" + lat + "&" + ServerInformation.POIDATA_SERVER_ARG_RADIUS + "=" + ServerInformation.POI_RADIUS_VALUE + "&" + ServerInformation.POIDATA_SERVER_ARG_LON + "=" + lon + "&limit=25&language=en-GB";
                var jqxhr = $.getJSON(serverUrl, function (data) {
                    World.loadPoisFromJsonData(data);
                })
                    .error(function (err) {
                        World.updateStatusMessage("", true);
                        World.isRequestingData = false;
                    })
                    .complete(function () {
                        World.isRequestingData = false;
                    });
            }
	},

	// helper to sort places by distance
	sortByDistanceSorting: function(a, b) {
		return a.distanceToUser - b.distanceToUser;
	},

	// helper to sort places by distance, descending
	sortByDistanceSortingDescending: function(a, b) {
		return b.distanceToUser - a.distanceToUser;
	}

};


/* forward locationChanges to custom function */
AR.context.onLocationChanged = World.locationChanged;

/* forward clicks in empty area to World */
AR.context.onScreenClick = World.onScreenClick;