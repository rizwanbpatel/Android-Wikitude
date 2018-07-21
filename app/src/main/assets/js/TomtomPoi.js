var getPoiAroundMe = function () {
    $("button").click(function () {
        $.ajax({
            url: "https://api.tomtom.com/search/2/search/hotel.json?key=PQoRU6eDPhcI7zJI1faRAGH5NG0BJUOi&typeahead=true&limit=25&lat=18.55071&lon=73.88842&language=en-GB",
            success: function (result) {
                $("#div1").html(result);
            }
        });
    });

}