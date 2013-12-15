// get path to this script, to link to json data files
var ___thisPath = document.getElementsByTagName('script')[document.getElementsByTagName('script').length - 1].src.split('?')[0].split('/').slice(0, -1).join('/') + '/';

$(function () {
    "use strict";

    $.widget("capesean.mapper", {
        // default options
        options: {
            fillColor: "#eee",
            fillOpacity: 0.5,
            strokeColor: "#000",
            strokeWeight: 1,
            strokeOpacity: 0.7,
            data: [],
            dataType: "",
            province: "",
            allowAllWards: false,
            drawAll: false
        },

        // init variables
        _minLat: null,
        _maxLat: null,
        _minLng: null,
        _maxLng: null,

        // load data
        _getData: function () {

            var url;
            switch (this.options.dataType) {
                case "provinces":
                    url = "provinces.js";
                    break;
                case "districts":
                    url = "districts.js";
                    break;
                case "municipalities":
                    url = "municipalities.js";
                    break;
                case "wards":
                    // province filter not supplied
                    if (!this.options.province)
                        // error if not specifically requesting full wards file
                        if (!this.options.allowAllWards)
                            throw ("Error: Ward dataType requires either the province filter or the allowAllWards option enabled");
                        else
                            url = "wards.js";
                    else {
                        switch (this.options.province) {
                            case "Eastern Cape": url = "wards-ec.js"; break;
                            case "Free State": url = "wards-fs.js"; break;
                            case "Gauteng": url = "wards-gt.js"; break;
                            case "KwaZulu-Natal": url = "wards-kzn.js"; break;
                            case "Limpopo": url = "wards-lp.js"; break;
                            case "Mpumalanga": url = "wards-mp.js"; break;
                            case "North West": url = "wards-nw.js"; break;
                            case "Northern Cape": url = "wards-nc.js"; break;
                            case "Western Cape": url = "wards-wc.js"; break;
                            default:
                                throw ("Error: Invalid province filter: " + this.options.province);
                        }
                    }
                    break;
                default:
                    throw ("Error: Not Implemented dataType option in _getData: " + this.options.dataType);
            }

            var json = null;
            $.ajax({
                'async': false,
                'global': false,
                'url': ___thisPath + url,
                'dataType': "json",
                'success': function (data) {
                    json = data;
                }
            });
            return json;

        },

        // get bound limits by looping through all points
        _getBounds: function (data) {

            for (var e = 0; e < data.length; e++) { //entity
                for (var sh = 0; sh < data[e].shapes.length; sh++) { //shape
                    var coords = data[e].shapes[sh].coords;
                    for (var c = 0; c < coords.length; c++) { // coord
                        var coord = coords[c];
                        if (this._minLat === null || coord.lat < this._minLat) this._minLat = coord.lat;
                        if (this._maxLat === null || coord.lat > this._maxLat) this._maxLat = coord.lat;
                        if (this._minLng === null || coord.lng < this._minLng) this._minLng = coord.lng;
                        if (this._maxLng === null || coord.lng > this._maxLng) this._maxLng = coord.lng;
                    }
                }
            }

        },

        // shifts elements in an array
        _moveArrayElement: function (arr, oldIndex, newIndex) {

            if (newIndex >= arr.length) newIndex = arr.length;
            arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);

        },

        // prepares the list - filtering, ordering, etc
        _prepareList: function (data) {

            // check if no data was supplied as an option
            if (!this.options.data || this.options.data.length == 0) return;

            // for each item in the full list
            for (var m = data.length - 1; m >= 0; m--) {

                var item = data[m];

                // try get it from the options list
                var option = $.grep(this.options.data, function (e) { return e.id == item.id; })[0];

                if (!option) {
                    // wasn't supplied, so remove from the list (unless drawAll == true)
                    if (!this.options.drawAll)
                        data.splice(m, 1);
                } else {
                    // was supplied, so move to end of array (so the lines are drawn on top / last) 
                    this._moveArrayElement(data, m, data.length);
                    // copy the styles & other properties, eg html info window
                    $.extend(item, option);
                }
            }
        },

        // the constructor
        _create: function () {

            // can only handle these data entities:
            if (['provinces', 'districts', 'municipalities', 'wards'].indexOf(this.options.dataType) < 0) {
                alert("Invalid dataType option");
                return false;
            }

            // load the data
            var data = this._getData();

            // prepare the list
            this._prepareList(data);

            // find the min/max coords
            this._getBounds(data);

            // setup map
            var mapOptions = { zoom: 0, center: new google.maps.LatLng(0, 0), mapTypeId: google.maps.MapTypeId.TERRAIN };
            var map = new google.maps.Map(this.element[0], mapOptions),
                bounds = new google.maps.LatLngBounds();

            // setup a global infoWindow
            var infoWindow = new google.maps.InfoWindow();

            // drawing.... for each item
            for (var m = 0; m < data.length; m++) {
                var item = data[m];

                // for each shape
                for (var sh = 0; sh < item.shapes.length; sh++) {
                    var coords = item.shapes[sh].coords,
                        polygon,
                        paths = [];

                    // foreach point/coord
                    for (var c = 0; c < coords.length; c++) {
                        var latLng = new google.maps.LatLng(coords[c].lat, coords[c].lng);
                        paths.push(latLng);
                        bounds.extend(latLng);
                    }

                    // setup the polygon
                    polygon = new google.maps.Polygon({
                        paths: paths,
                        strokeColor: item.strokeColor || this.options.strokeColor,
                        strokeOpacity: item.strokeOpacity || this.options.strokeOpacity,
                        strokeWeight: item.strokeWeight || this.options.strokeWeight,
                        fillColor: item.fillColor || this.options.fillColor,
                        fillOpacity: item.fillOpacity || this.options.fillOpacity,
                        html: item.html,
                        // include these properties so the click event handler can access them
                        dataType: this.options.dataType,
                        id: item.id
                    });

                    // set on map
                    polygon.setMap(map);

                    // if there's html for a popup, add the listener
                    if (polygon.html) {
                        google.maps.event.addListener(polygon, 'click', function (event) {
                            infoWindow.setContent(this.html);
                            infoWindow.setPosition(event.latLng);
                            infoWindow.open(map);
                        });
                    }

                    // if there's a click event handler, add the listener
                    if (this.options.click) {
                        google.maps.event.addListener(polygon, 'click', this.options.click); // function(event)
                    }
                }
            }

            // zoom to fit the bounds
            map.fitBounds(bounds);
        }
    });
});


