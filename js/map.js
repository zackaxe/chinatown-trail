'use strict';

// Global Variables: 

// Google Map
var map;
// Array of MarkerObjects
var markers = [];
// Current active marker id
var activeMarkerId;
// Current row in markers array of the activeMarkerid
var activeMarkerRow;
// Only one infoWindow at a time
var infoWindow;
// Current id, like in database
var idCounter = 0;
// saves the dragStart y position value.
var mouseYonDragStart;

// Marker object constructor
function MarkerObject(id, title, marker) {
    this.id = id;
    this.title = title;
    this.marker = marker;
}

// Initializes map that points to 'Lodz' city
// Adds event to searchBox.
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        // Lodz
        center: { lat: 1.283896, lng: 103.843464 },
        zoom: 16,
        mapTypeId: 'roadmap'
    });

    infoWindow = new google.maps.InfoWindow({
        content: '',
    });

    // Create the search box
    var input = document.getElementById('searchBox');
    var searchBox = new google.maps.places.SearchBox(input);

    var searchMarkers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function () {
        var places = searchBox.getPlaces();
        if (places.length == 0) {
            return;
        }

        // Clear out the old markers.
        searchMarkers.forEach(function (marker) {
            marker.setMap(null);
        });
        searchMarkers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();

        places.forEach(function (place) {
            if (!place.geometry) {
                alert("Returned place contains no geometry");
                return;
            }

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });

    //retrievePlans();

    //////////////Chinatown Location Markers/////////////////
    var locations = [
        ['Chinatown Station (Go to Exit A)', 1.283896, 103.843464, 1],
        ['Tai Chong Kok 大中国 (Chinese Mooncakes & Pastries)', 1.281954, 103.843934, 2],
        ['Tea Chapter (Traditional Chinese Tea)', 1.280205, 103.843553, 3]
    ];

    var num_markers = locations.length;
    for (var i = 0; i < num_markers; i++) {  
        markers[i] = new google.maps.Marker({
            position: {lat:locations[i][1], lng:locations[i][2]},
            map: map,
            html: locations[i][0],
            id: i,
        });

        google.maps.event.addListener(markers[i], 'click', function(){
            var infowindow = new google.maps.InfoWindow({
                id: this.id,
                content:this.html,
                position:this.getPosition()
            });
            google.maps.event.addListenerOnce(infowindow, 'closeclick', function(){
                markers[this.id].setVisible(true);
            });
            this.setVisible(false);
            infowindow.open(map);
        });
    }

    google.maps.event.addDomListener(window, 'load', initMap);

    //////////////Chinatown Location Markers/////////////////
}

// Adds click event to map so that only a single custom marker can be added after clicking on 'Add custom maker' button.
function addMarker() {
    map.addListener('click', function (event) {
        placeMarker(event.latLng);
        addMarkerToPlan();
    });
}

// Places marker on the map. Removes the map click event.
function placeMarker(location, markerTitle) {

    var marker = new google.maps.Marker({
        position: location,
        map: map
    });

    infoWindow.close();

    google.maps.event.addListener(marker, 'click', function () {
        setActiveMarkerId(marker);
        setActiveMarkerRow(activeMarkerId);

        contentSetter();

        infoWindow.open(map, this);
    });

    var title = markerTitle == undefined ? "TITLE" : markerTitle;

    markers.push(new MarkerObject(idCounter, title, marker));
    activeMarkerId = idCounter;
    setActiveMarkerRow(activeMarkerId);
    idCounter++;

    // Removes the click event
    google.maps.event.clearListeners(map, 'click');
}

// Sets the content of infowindow.
function contentSetter() {
    return (function () {
        infoWindow.setContent(
            '<p class="marker-title infWin" contenteditable onblur="saveTitle(event)"> ' + markers[activeMarkerRow].title + ' </p>' +
            '<p class="infWin">Position: ' + markers[activeMarkerRow].marker.getPosition() + '</p>' +
            '<button class="btn btn-danger btn-sm" style="float:right" onclick="clearMarker()">Remove me</button>');
    })();
}


// ============= Ids finders  ============== //

// Marker's id property is used to create the id of list element ('li + activeMarkerId').
// It is being used to know the order of places which the user can change by moving the draggable elements.

// Sets the current activeMarkerId.
function setActiveMarkerId(marker) {
    var markerRow = findIndexByKeyValue(markers, "marker", marker);
    activeMarkerId = markers[markerRow].id;
}

// Sets the value of the row in markers array that contains the active marker.
function setActiveMarkerRow(markerId) {
    activeMarkerRow = findIndexByKeyValue(markers, "id", markerId);
}

// Helper function to find the active MarkerObject.
function findIndexByKeyValue(arraytosearch, key, valuetosearch) {
    // Can be more if there are multiple markers in the exact same place
    for (var i = 0; i < arraytosearch.length; i++) {
        if (arraytosearch[i][key] == valuetosearch) {
            return i;
        }
    }
    return null;
}


// ============= Button functions ============== //

// Adds list item to the Draggable List with the chosen place.
function addMarkerToPlan() {

    var list = document.getElementById("plan-places");
    var listItem = document.createElement("li");
    listItem.id = "li" + activeMarkerId;
    listItem.className = "li-plan clearfix"
    listItem.draggable = true;
    listItem.ondragover = allowDrop;
    listItem.ondrop = drop;
    listItem.ondragstart = drag;
    var button = createPlaceButton();
    var spanTitle = document.createElement("span");
    spanTitle.innerHTML = markers[activeMarkerRow].title;

    listItem.appendChild(button);
    listItem.appendChild(spanTitle);
    list.appendChild(listItem);
}

function createPlaceButton() {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-info btn-plan";
    button.innerHTML = '&#10159; Show';

    // Centers map on click
    button.addEventListener('click', (function (id) {
        return function () {
            activeMarkerId = id;
            centerPlace(id);
        };
    })(activeMarkerId));

    return button;
}

// Saves the title provided by the user.
function saveTitle(e) {
    markers[activeMarkerRow].title = e.target.innerHTML;
    var liSpanTitle = document.getElementById("li" + activeMarkerId).children;
    liSpanTitle[1].innerHTML = e.target.innerHTML;
}

function deletePlaceButton(markerId) {
    var listAnchor = document.getElementById("plan-places");
    var placeButton = document.getElementById("li" + markerId);
    listAnchor.removeChild(placeButton);
}

// Deletes the active marker or all of them.
function clearMarker(wipeAll) {
    if (wipeAll != undefined) {
        markers.forEach(function (val, ind, arr) {
            val.marker.setMap(null);
            deletePlaceButton(val.id);
        });
        idCounter = 0;
        markers.splice(0);
    } else {
        markers[activeMarkerRow].marker.setMap(null);
        markers.splice(activeMarkerRow, 1);
        deletePlaceButton(activeMarkerId);
    }
}

function returnMarkerTitle() {
    var markerTextbox = document.getElementById("activeMarkerText");
    return markerTextbox.innerHTML;
}

// Centers the map on the marker after clicking on the list.
function centerPlace(markerId) {
    activeMarkerId = markerId;
    setActiveMarkerRow(markerId);
    map.setCenter(markers[activeMarkerRow].marker.getPosition());
    /*map.setZoom(map.getZoom() + 10);*/
    contentSetter();

    infoWindow.open(map, markers[activeMarkerRow].marker);
}

// ============= Drag and Drop functions ============== //

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    mouseYonDragStart = ev.clientY;
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var elementToInsert = document.getElementById(data);
    var placeToInsert = document.getElementById(ev.target.id) || document.getElementById(ev.target.parentElement.id);
    var placesList = document.getElementById('plan-places');

    if (mouseYonDragStart < ev.clientY) {
        placesList.insertBefore(elementToInsert, placeToInsert.nextSibling);
    } else {
        placesList.insertBefore(elementToInsert, placeToInsert);
    }
}

// ============= Saving to localStorage ============== //

// Since it is impossible to store marker object, it has to be changed to store the Lat and Lng of marker, by creating new object.
function createPlanArray() {

    var sortedArrayOfPlaces = [];

    // Get all the li elements, their position is based on li id
    var liElements = document.getElementsByClassName("li-plan");

    for (var i = 0; i < liElements.length; i++) {
        var markerId = liElements[i].id.slice(2);
        var markerRow = findIndexByKeyValue(markers, "id", markerId);
        var newMarkerObject = {
            title: markers[markerRow].title,
            markerLatLng: markers[markerRow].marker.getPosition()
        };
        sortedArrayOfPlaces.push(newMarkerObject);
    }
    return sortedArrayOfPlaces;
}

function setPlan() {
    infoWindow.close();
    var planName = document.getElementById("planName").value;
    if (planName == "") {
        alert("Missing name?");
        return;
    }
    StorageObject.setPlan(planName, createPlanArray());
    retrievePlans();
}

// Get the plans names from localStorage
function retrievePlans() {
    var plansList = StorageObject.getPlansNames();
    if (plansList == 0) {
        return;
    } else {
        var listAnchor = document.getElementById("planSelect");
        for (var i = 0; i < plansList.length; i++) {
            var opt = document.createElement("option");
            opt.text = plansList[i].substring(15);
            listAnchor.appendChild(opt);
        }
        var loadButton = document.getElementById("loadButton");
        loadButton.disabled = false;
    }
}

// Load the plan to the list.
function loadPlan() {
    clearMarker('all');

    var planName = "MyRoutePlanner_" + document.getElementById("planSelect").value;
    var plan = StorageObject.getPlan(planName);
    if (plan) {
        plan.forEach(function (val, ind, arr) {
            placeMarker(val.markerLatLng, val.title);
            addMarkerToPlan(val.markerLatLng);
        });
        centerPlace(0);
    } else {
        alert("Could not load the plan.")
    }
}