// information about server communication. This sample webservice is provided by Wikitude and returns random dummy places near given location
var ServerInformation = {

    POIDATA_SERVER: "https://api.tomtom.com/search/2/nearbySearch/.json",
    POIDATA_SERVER_ARG_LAT: "lat",
    POIDATA_SERVER_ARG_LON: "lon",
    POIDATA_SERVER_ARG_NR_POIS: "nrPois",
    POIDATA_SERVER_ARG_RADIUS: "radius"
};

// implementation of AR-Experience (aka "World")
var World = {

    currentLat: 0,
    currentLon: 0,
    currentAlt: 0,
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

    // called to inject new POI data
    loadPoisFromJsonData: function loadPoisFromJsonDataFn(poiData) {


        World.angleDict.push({
                "st_ang": 0,
                "end_ang": 20, "altitude": 0
            }, {
                "st_ang": 21,
                "end_ang": 40, "altitude": 500
            }, {
                "st_ang": 41,
                "end_ang": 60, "altitude": 500
            }, {
                "st_ang": 61,
                "end_ang": 80, "altitude": 500
            },
            {
                "st_ang": 81,
                "end_ang": 100, "altitude": 500
            }, {
                "st_ang": 101,
                "end_ang": 120, "altitude": 500
            }, {
                "st_ang": 121,
                "end_ang": 140, "altitude": 500
            }, {
                "st_ang": 141,
                "end_ang": 160, "altitude": 500
            }, {
                "st_ang": 161,
                "end_ang": 180, "altitude": 500
            }, {
                "st_ang": 181,
                "end_ang": 200, "altitude": 500
            }, {
                "st_ang": 201,
                "end_ang": 220, "altitude": 500
            }, {
                "st_ang": 221,
                "end_ang": 240, "altitude": 500
            }, {
                "st_ang": 241,
                "end_ang": 260, "altitude": 500
            }, {
                "st_ang": 261,
                "end_ang": 280, "altitude": 500
            }, {
                "st_ang": 281,
                "end_ang": 300, "altitude": 500
            }, {
                "st_ang": 301,
                "end_ang": 320, "altitude": 500
            }, {
                "st_ang": 321,
                "end_ang": 240, "altitude": 500
            }, {
                "st_ang": 341,
                "end_ang": 360, "altitude": 500
            }
        );

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

        // loop through POI-information and create an AR.GeoObject (=Marker) per POI
        /*for (var currentPlaceNr = 0; currentPlaceNr < poiData.length; currentPlaceNr++) {
            var singlePoi = {
                "id": poiData[currentPlaceNr].id,
                "latitude": parseFloat(poiData[currentPlaceNr].latitude),
                "longitude": parseFloat(poiData[currentPlaceNr].longitude),
                "altitude": parseFloat(poiData[currentPlaceNr].altitude),
                "title": poiData[currentPlaceNr].name,
                "description": poiData[currentPlaceNr].description
            };

            World.markerList.push(new Marker(singlePoi));
        }*/


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

        World.updateStatusMessage(World.markerList.length + ' places loaded');
    },

    getAltitudeFromData: function getAltitudeFromData(angleDeg) {
        var alti = 0;
        for (var i = 0; i < World.angleDict.length; i++) {
            if (angleDeg >= World.angleDict[i].st_ang && angleDeg <= World.angleDict[i].end_ang) {
                World.angleDict[i].altitude = World.angleDict[i].altitude + 10;
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

        var themeToUse = isWarning ? "e" : "c";
        var iconToUse = isWarning ? "alert" : "info";

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

    /*
        POIs usually have a name and sometimes a quite long description.
        Depending on your content type you may e.g. display a marker with its name and cropped description but allow the user to get more information after selecting it.
    */

    // fired when user pressed maker in cam
    onMarkerSelected: function onMarkerSelectedFn(marker) {
        World.currentMarker = marker;

        /*
            In this sample a POI detail panel appears when pressing a cam-marker (the blue box with title & description),
            compare index.html in the sample's directory.
        */
        // update panel values
        $("#poi-detail-title").html(marker.poiData.title);
        $("#poi-detail-description").html(marker.poiData.description);
        $("#poi-detail-category").html(marker.poiData.category);
        // $("#poi-altitude").html(marker.poiData.altitude);


        // It's ok for AR.Location subclass objects to return a distance of `undefined`. In case such a distance was calculated when all distances were queried in `updateDistanceToUserValues`, we recalculate this specific distance before we update the UI.
        if (undefined == marker.distanceToUser) {
            marker.distanceToUser = marker.markerObject.locations[0].distanceToUser();
        }

        // distance and altitude are measured in meters by the SDK. You may convert them to miles / feet if required.
        var distanceToUserValue = (marker.distanceToUser > 999) ? ((marker.distanceToUser / 1000).toFixed(2) + " km") : (Math.round(marker.distanceToUser) + " m");

        // $("#poi-detail-distance").html(distanceToUserValue);

        // show panel
        $("#panel-poidetail").panel("open", 123);

        $(".ui-panel-dismiss").unbind("mousedown");

        // deselect AR-marker when user exits detail screen div.
        $("#panel-poidetail").on("panelbeforeclose", function (event, ui) {
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

        // return maximum distance times some factor >1.0 so ther is some room left and small movements of user don't cause places far away to disappear.
        return maxDistanceMeters * 1.1;
    },

    /*
        JQuery provides a number of tools to load data from a remote origin.
        It is highly recommended to use the JSON format for POI information. Requesting and parsing is done in a few lines of code.
        Use e.g. 'AR.context.onLocationChanged = World.locationChanged;' to define the method invoked on location updates.
        In this sample POI information is requested after the very first location update.

        This sample uses a test-service of Wikitude which randomly delivers geo-location data around the passed latitude/longitude user location.
        You have to update 'ServerInformation' data to use your own own server. Also ensure the JSON format is same as in previous sample's 'myJsonData.js'-file.
    */

    // request POI data
    requestDataFromServer: function requestDataFromServerFn(lat, lon) {

        // set helper var to avoid requesting places while loading
        World.isRequestingData = true;
        World.updateStatusMessage('Requesting places from web-service');

        // server-url to JSON content provider
        var serverUrl = ServerInformation.POIDATA_SERVER + "?key=PQoRU6eDPhcI7zJI1faRAGH5NG0BJUOi&" + ServerInformation.POIDATA_SERVER_ARG_LAT + "=" + lat + "&" + ServerInformation.POIDATA_SERVER_ARG_RADIUS + "=200" + "&" + ServerInformation.POIDATA_SERVER_ARG_LON + "=" + lon + "&limit=25&language=en-GB";

        var jqxhr = $.getJSON(serverUrl, function (data) {
            World.loadPoisFromJsonData(data);
        })
            .error(function (err) {
                World.updateStatusMessage("Invalid web-service response.", true);
                World.isRequestingData = false;
            })
            .complete(function () {
                World.isRequestingData = false;
            });
    },

    // helper to sort places by distance
    sortByDistanceSorting: function (a, b) {
        return a.distanceToUser - b.distanceToUser;
    },

    // helper to sort places by distance, descending
    sortByDistanceSortingDescending: function (a, b) {
        return b.distanceToUser - a.distanceToUser;
    }
};

/* forward locationChanges to custom function */
AR.context.onLocationChanged = World.locationChanged;

/* forward clicks in empty area to World */
AR.context.onScreenClick = World.onScreenClick;