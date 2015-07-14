var map;
var service;
var infowindow;
var autocomplete, 
    service, 
    controlList, 
    messageDiv;



var markers = [];
var	stores  = [];

function initialize(){
	var madison = new google.maps.LatLng(43.0667, -89.4000);
	var mapOption = {
		center : madison,
		zoom : 12,
		mapTypeControl: false,
   		panControl: false,
    	zoomControl: false,
    	streetViewControl: false
	};

	var autocompleteOptions = {
		types: ['(cities)']
	};

	map = new google.maps.Map(document.getElementById('map-canvas'), mapOption);

	infowindow = new google.maps.InfoWindow({
		content : document.getElementById('info-content')}); 
	document.getElementById('info-content').style.display = 'none';

	//Map Controls
	var input = document.getElementById('autocomplete');
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

	// Create the autocomplete object and associate it with the UI input control.
    // Restrict the search to the default country, and to place type "cities".

  	autocomplete = new google.maps.places.Autocomplete(input,autocompleteOptions);
  	service = new google.maps.places.PlacesService(map);

  	var request = {
  		location : madison,
  		radius : 2500,
  		types : ['store']
  	};
  	service.nearbySearch(request, callback);
  	google.maps.event.addListener(autocomplete,'place_changed',onPlaceChanged);


	// Create the DIV to hold the control and call the 
  	// ListControl() constructor passing in this DIV.
  	var listControlDiv = document.createElement('div');
  	var listControl = new ListControl(listControlDiv, map);
  	map.controls[google.maps.ControlPosition.LEFT_TOP].push(listControlDiv);

  	// Create the 'Find a store near you!' message div and 
    // push it onto the map canvas as a map control
    messageDiv = document.createElement('div');
    messageDiv1 = buildMessageDiv(messageDiv);
   // map.controls[google.maps.ControlPosition.Top_CENTER].push(messageDiv);


}	

// When the user selects a city, perform a nearbySearch() 
function onPlaceChanged(){
	var place = autocomplete.getPlace();
	if (place.geometry) {
		//
		map.panTo(place.geometry.location);
		map.setZoom(12);
		service.nearbySearch(request, callback);
		messageDiv.style.fontSize = "14px";
		messageDiv.innerHTML = '<h1>Here is 20 Hotles in the city. Click to see details</h1>';
	} 
	else{
		document.getElementById('autocomplete').placeholder = "Enter city name, then select store from list";
	}
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
  	stores = results; // load the results in stores array
    for (var i = 0; i < results.length; i++) {
      markers[i]=createMarker(results[i]);
    }
  }
}

function buildListView() {
  controlList.innerHTML = '';
  for (var i = 0; i < stores.length; i++) {
    if (stores[i]) {
      clickableLink(i);
    }
  }
}

function clickableLink(i){
	var li = document.createElement('li');
  li.onclick = function() {
    google.maps.event.trigger(markers[i], 'click');
  };
  li.innerHTML = stores[i].name;
  li.style.padding = '15px';
  li.style.cursor = 'pointer';
  li.setAttribute("id", gyms[i].name); 

  // Grab and display simplified address (aka 'vicinity')
  var vicinityDiv = document.createElement('div');
  vicinityDiv.className = 'list-view-small';
  vicinityDiv.innerHTML = gyms[i].vicinity;
  li.appendChild(vicinityDiv); 

  // Grab and display open_now info
  var isOpenDiv = document.createElement('div');
  isOpenDiv.className = 'list-view-small';
  if (gyms[i].opening_hours) {
    if (gyms[i].opening_hours.open_now) {
      isOpenDiv.innerHTML = 'OPEN right now'; 
    } else {
      isOpenDiv.innerHTML = 'CLOSED right now';
    }
  }
  li.appendChild(isOpenDiv); 

  controlList.appendChild(li);


}

function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

    google.maps.event.addListener(marker, 'click', showInfoWindow);

  return marker;
}

function clearMarkers() {
  for (var i = 0; i < markers.length; i++) {
    if (markers[i]) {
      markers[i].setMap(null);
    }
  }
  markers = [];
}


function ListControl(controlDiv, map) {

  var madison = new google.maps.LatLng(43.0667, -89.4000);

  // Set CSS styles for the DIV containing the control
  // Setting padding to 5 px will offset the control
  // from the edge of the map.
  controlDiv.style.padding = '10px';
  controlDiv.style.opacity = '0.6';

  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = 'white';
  controlUI.style.borderStyle = 'solid';
  controlUI.style.borderWidth = '1px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'List of gyms returned by search';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  controlList = document.createElement('ul');
  controlList.style.listStyleType = 'none'; 
  controlList.style.maxHeight = '500px';
  controlList.style.maxWidth = '300px';
  controlList.style.overflowY = 'auto';
  controlList.style.overflowX = 'hidden';
  controlList.style.fontFamily = 'Arial,sans-serif';
  controlList.style.fontSize = '16px';
  controlList.style.padding = '0px';
  controlList.style.margin = '0px';
  controlUI.appendChild(controlList);
}

function buildMessageDiv(messageDiv) {
  messageDiv.innerHTML = '<h1>Find a hotes near you!</h1>';
  messageDiv.style.textAlign = 'center';
  messageDiv.style.fontSize = '20px';
  messageDiv.style.visibility = 'visible';
  return messageDiv;

}
// Get the place details for a store. Show the information in an info window,
// anchored on the marker for the store that the user selected.
function showInfoWindow() {
  var marker = this;
  service.getDetails({placeId: marker.placeResult.place_id},
    function(place, status) {
      if (status != google.maps.places.PlacesServiceStatus.OK) {
        return;
      } 
      if (anyInfoWindowSeenAlready === false) {  
        document.getElementById('info-content').style.display = 'initial';
      }
      infoWindow.open(map, marker);
      buildIWContent(place);
      anyInfoWindowSeenAlready = true;
    });
}

// Load the place information into the HTML elements used by the info window.
function buildIWContent(place) {
  document.getElementById('iw-icon').innerHTML = '<img class="hotelIcon" ' +
      'src="' + place.icon + '"/>';
  document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url +
      '">' + place.name + '</a></b>';
  document.getElementById('iw-address').textContent = place.vicinity;

  if (place.formatted_phone_number) {
    document.getElementById('iw-phone-row').style.display = '';
    document.getElementById('iw-phone').textContent =
        place.formatted_phone_number;
  } else {
    document.getElementById('iw-phone-row').style.display = 'none';
  }

  // Assign a five-star rating to the hotel, using a black star ('&#10029;')
  // to indicate the rating the hotel has earned, and a white star ('&#10025;')
  // for the rating points not achieved.
  if (place.rating) {
    var ratingHtml = '';
    for (var i = 0; i < 5; i++) {
      if (place.rating < (i + 0.5)) {
        ratingHtml += '&#10025;';
      } else {
        ratingHtml += '&#10029;';
      }
    document.getElementById('iw-rating-row').style.display = '';
    document.getElementById('iw-rating').innerHTML = ratingHtml;
    }
  } else {
    document.getElementById('iw-rating-row').style.display = 'none';
  }

  // The regexp isolates the first part of the URL (domain plus subdomain)
  // to give a short URL for displaying in the info window.
  if (place.website) {
    var fullUrl = place.website;
    var website = hostnameRegexp.exec(place.website);
    if (website == null) {
      website = 'http://' + place.website + '/';
      fullUrl = website;
    }
    document.getElementById('iw-website-row').style.display = '';
    document.getElementById('iw-website').textContent = website;
  } else {
    document.getElementById('iw-website-row').style.display = 'none';
  }

  // Handle click event for photos link that's in the infoWindow
  var reviewsSection = document.getElementById('iw-reviews');

  // Display first 50 characters of Google 
  // places reviews of the particular stores
  var reviews = place.reviews; 
  var reviewSnippet = ''; 
  var reviewSnippetsHTML = ''; 
  for (var i = 0; i < 1; i++) {
    for (var j = 0; j < 50; j++) {
      reviewSnippet = reviewSnippet + reviews[i].text[j];
    }
    reviewSnippetsHTML += reviewSnippet; 
    reviewSnippet = ''; 
  }
  reviewsSection.innerHTML = '<a href="' + place.url +
      '">' + reviewSnippetsHTML + '...' + '</a>'; 
}

window.addEventListener('load', initialize);



	 