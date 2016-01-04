/*  Global Variables to be used both by initAutoComplete and ViewModel methods.
 *  On hind sight, should have made marker a property of the place object, so did not 
 *  have to have the index variable
*/
var markers= [];
var places = [{name:"la Madeleine Country French Café",latitude:32.9738945, longitude:-96.7738446,index:0},
              {name:"Cicis Pizza",latitude:32.9746776, longitude:-96.7427846,index:1},
              {name:"Domino's Pizza",latitude:32.969106, longitude:-96.7557451,index:2},
              {name:"Chili's Grill & Bar",latitude:32.9815511, longitude:-96.741432,index:3},
              {name:"Chick-fil-A",latitude:33.0003246, longitude:-96.7530694,index:4},
              {name:"Great Wall",latitude:32.9842148,longitude:-96.7388313,index:5},
              {name:"Geisha Steak & Sushi",latitude:32.9919723,longitude:-96.805805,index:6},
              {name:"Steve Fields Steak & Lobster Lounge",latitude:32.9928362,longitude:-96.8190229,index:7},
              {name:"Rafain Brazilian Steakhouse",latitude:32.9954394,longitude:-96.8613685,index:8},
              {name:"Ali Baba Mediterranean Grill",latitude:32.9842148,longitude:-96.7388313,index:9},
              {name:"Dimassi's Mediterranean",latitude:32.9842148,longitude:-96.7388313,index:10}];
var map;
var infowindow;
var initHtml = '<div id="content">'+
               '<div id="siteNotice">'+
               '<h3 id="firstHeading"></h3>'+
               '</div>'+
               '<div id="bodyContent">'+
               '<h5 id="address">Loading data.....</h5>'+
               '<h5 id="phone"></h5>'+
               '<a id="url" href="" target="_blank"></a>' +
               '</div>';

/* Had defined globally to get infoWindow DOM elements only once as per review feedback.
 * Please see the comments in getLocationData
 *  
*/
var $infoWindowContent;
var $infoWindowAddress;
var $infoWindowRating;
var $infoWindowPhone;
var $infoWindowBodyC;
var $infoWindowUrl;
/*  Left in place - Please see the comments in getLocationData
var infoWindowIdDefined=false; */

/*Method to clear existing Markers */
function clearMarkers(){
  markers.forEach(function(marker){
    marker.setMap(null);
  });
  markers= [];
}

/* changeColor method changes the color and animation of the marker element that is passed in 
 *  based on the value of marker clicked.
 *  Input: marker
 *  Changes color to Green when marker is clicked, does a bounce animation for 5 secs
 *  Changes color to red on initialization and when infoWindow is closed
*/  

function changeColor(marker) {
  if(marker.clicked===true){
    map.panTo(marker.getPosition());
    marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){marker.setAnimation(null);},2000);
  }
  else{
    marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
    if(marker.getAnimation()!== null){
      marker.setAnimation(null);
    }
  }
}

/*  opens an infoWindow when a marker is clicked ,displays more information about the point.
 *  Initalizes to place name as title and "loading data...." for slower n/w, until the actual API call
 *  is successful.
 *  calls getLocationData, which does an API call to foursquare data.
*/
function openInfoWindow(place,marker,infowindow){
  koViewModelInstance.listViewVisible(false);
  //cacheing Location data, based on the first review feedback
  //If not cached getLocationData from API.
  if(typeof marker.infoWindowHtml === "undefined")
  {
    console.log("going to getLocationData for this marker");
    var htmlString=initHtml;
    infowindow.setContent(htmlString);
    map.panTo(marker.getPosition());
    infowindow.open(map,marker);
    getLocationData(marker);
  }
  else{
    console.log("getting cached data for marker");
    infowindow.setContent(marker.infoWindowHtml);
    map.panTo(marker.getPosition());
    infowindow.open(map,marker);
  }//changed based on review,formulate the htmlstring only once,store as a constant(initHtml).
}

/*  The Main function that instantiates a  map object, createsMarker and displays on the screen
*/
function initialize(){
  map = new google.maps.Map(document.getElementById('map'), {
    // center's the map around Middletown,NJ.
    center: {lat:32.9842148, lng:-96.7388313},
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  infowindow = new google.maps.InfoWindow();

  /* Create necessary Markers, register the eventListeners on Marker click and infoWindow close */

  function createMarkers(bounds){
    //for each place get the icon, name and location
    places.forEach(function(place){
      console.log("place name "+place.name);
      /*  As per my review feedback, there is a simpler way to create Markers.
      * Not sure how else it could be simplified.  Yes I had dynamic searchBox.getPlaces()
      * before, not sure what is redundant, would love to know.
      */
      var icon = {
        url : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        size: new google.maps.Size(71,71),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };
      // create new Marker based on the location data
      var marker = new google.maps.Marker({
        map  : map,
        icon : icon,
        title : place.name,
        draggable: true,
        animation : google.maps.Animation.DROP,
        position : new google.maps.LatLng(place.latitude, place.longitude)
      });

      markers.push(marker);

     /*  Registers Listeners for maker click, calls changeColor and openInfoWindow,
      *  which changes the color of the marker to green,adds animation and opens an InfoWindow
      *  Also addressing closure problem with EventListeners, with an outer and return functions.
      */
      marker.addListener('click',(function(marker,place,infowindow)
      {
        return function(){
          marker.clicked = true;
          changeColor(marker);
          openInfoWindow(place,marker,infowindow);
        }
      })(marker,place,infowindow));

     /*  Registers eventListener on close of the infoWindow
      *  This event listener would reset the marker color to red if infoWindow is closed
      */
      infowindow.addListener('closeclick',(function(marker){
        return function(){
         marker.clicked = false;
         changeColor(marker);
        };
      })(marker));

    });//each place

  }//createMarkers

   //make it responsive.
    google.maps.event.addDomListener(window, "resize", function()
    {
      var center = map.getCenter();
      google.maps.event.trigger(map, "resize");
      map.setCenter(center); 
      //resized open infoWindow- else will be the same size
      infowindow.open(map);
    });
    clearMarkers();
    var bounds = new google.maps.LatLngBounds();
    createMarkers(bounds);
}//initialize function end

/* KO viewModel 
*/
var ViewModel = function(){
  koViewModelInstance = this;
  var self = this;
  self.places=ko.observableArray(places);
  self.markers=ko.observableArray(markers);
  self.filterList=ko.observableArray();
  self.filter=ko.observable("");
  self.listViewVisible=ko.observable(true);

  //opensMarker when a list view item is clicked
  self.openMarker = function(place){
    var marker = markers[place.index];
    marker.clicked=true;
    changeColor(marker);
    openInfoWindow(place,marker,infowindow);
  };

  /*  filterMarkers is called on click(focus) inside the input textArea, to display all the locations.
   *  It is also called when a filter is entered in the text area.
   *  This method calls getFilterList , which creates a List of places matching the filter.
  */

  self.filterMarkers = function(){
    self.listViewVisible(true);
    self.filterList.removeAll();
    self.getFilterList();

  };

  /*  A utility function that returns all places if filter is null
   *  Returns the list of places that matches the filter.
   *  Makes use of the ko.utility.arrayFilter method.
   */
  self.filteredItems = function(){
    if(!self.filter){
      console.log("filteredItems in filter not true=" +self.filter);
      return self.places();
    }
    else{
      console.log("filteredItems in filter true=" +self.places());
      return ko.utils.arrayFilter(self.places(), function(place) {
        return place.name.toLowerCase().indexOf(self.filter().toLowerCase()) >=0;
      });
    }
  };

 /*  Makes Marker visible for all places in the input param filterdPlaces.
  */

  self.showMarkers = function(filteredPlaces){
    filteredPlaces.forEach(function(filteredPlace){
      markers[filteredPlace.index].setMap(map);
    });
  };

  self.highlightMarker = function (place){
    var marker = markers[place.index];
    marker.clicked = true;
    changeColor(marker);
  };

  self.disableHighlighMarker = function(place){
    var marker = markers[place.index];
    marker.clicked = false;
    changeColor(marker); 
  };

  /*  Makes all the Markers invisible.
  */
  self.hideAllMarkers = function(){
    markers.forEach(function(marker){
      marker.setMap(null);
    });
  };

  /*  getFilterList returns all the places in the List if the filter is null and shows all markers
   *  When filter is not null, hides all markers, calls filteredItems method, shows all marker in the
   *  filteredList, which is displayed in the LI element below the searchBox.
  */
  self.getFilterList = function(){
    console.log("filter="+self.filter());
    var filter = self.filter().toLowerCase();

    if (filter === null) {
        self.showMarkers(self.places());
        self.filterList(self.places());
    } 
    else {
      self.hideAllMarkers();
      var filteredPlaces = [];
      filteredPlaces = self.filteredItems(filter);
      console.log("FilteredPlaces array=" + JSON.stringify(filteredPlaces));
      if (filteredPlaces.length === 0){
        //need to implement the add button to add data
        //not sure of the api for getting latitude/longitude,so to-do for now
      }
      self.showMarkers(filteredPlaces);
      self.filterList(filteredPlaces);
    }
  };

};//ViewModel end

/*  getLocationData, takes an input as marker, does a venue search on foursquare API, displays the
 *  data in the infoWindow on success.
 *  The url that is displayed is clickable , which opens a separate window/tab to the restaurant in focus.
 *  On error, displays "Content could not be loaded"
*/
var getLocationData=function(marker){
  /*  As per the review feedback I was asked to not  define the infowindow ids over and over again.
   *  So I went about defining a flag and when its false(initially) to get the DOM Elements.
   *  On that I observed a behaviour of stale ids.The very first time, I opened an infoWindow, since my
   *  infoWindowIdDefined == false, I would be gettign the DOM elements and everything is good. But
   *  on subsequent request to getLocationData, I would have references to old elements and the infoWindow
   *  On the screen would have prev values or initialized value(if I setContent of the infoWindow to an initHtml)
   *  I have left the commented code in for you to verify and prove that I need to get the infoWindow elements
   *  everytime a new Marker is clicked upon. 
  */
    //defining infoWindowIds once, based on the first review feedback
    //if (infoWindowIdDefined === false) {
    $infoWindowContent = $('#content');
    $infoWindowAddress=$('#address');
    $infoWindowRating=$('#rating');
    $infoWindowPhone=$('#phone');
    $infoWindowBodyC=$('#bodyContent');
    $infoWindowUrl=$('#url');
    //infoWindowIdDefined=true;
  //} 

  var $infoWindowHeading = $('#firstHeading');
  $infoWindowHeading.text(marker.title);

  var lat= marker.position.lat();
  var long = marker.position.lng();

  /* client_id and client_secret received on registering at foursquare */
  var CLIENT_ID = '1UCDCI3H3VERD2IRAYHFV3YBISAYU3LLF1NDIWM5SFOZTAOO';
  var CLIENT_SECRET = 'L4M0PBEUW4JL4FJH2OGZEC3Q13Q0TDWOFR21MPVSJ3EHUABQ';

  // Using the venue's search api from foursquare.
  var API_ENDPOINT = 'https://api.foursquare.com/v2/venues/search' +
    '?client_id=' + CLIENT_ID +
    '&client_secret=' +CLIENT_SECRET +
    '&v=20130815' +
    '&ll=' +lat + ',' + long +
    '&query=' +'\'' +marker.title + '\'&limit=1';
    
  // Use jQuery to make an AJAX request to Foursquare and update infoWindow values.
  //Changed from deprecated default success and error (jquery1.4) to done/fail as per review feedback
  $.getJSON(API_ENDPOINT,
    {format:"json"})
      .done(function(result) {
          var venue = result.response.venues[0];
          console.log("venue=" +JSON.stringify(venue));
          var venuePhone = venue.contact.formattedPhone;
          var venueAddress = venue.location.formattedAddress;
          var venueUrl=venue.url;
          console.log("venue.url=" +venueUrl);
          
          if (venuePhone)
            $infoWindowPhone.text('Phone: ' +venuePhone);
          else
              $infoWindowPhone.text('Phone number not found');

          if (venueAddress) 
              $infoWindowAddress.text('Address: ' +venueAddress);
        else
              $infoWindowAddress.text('Address not found');

          if (venueUrl) {
            //console.log( "before,infoWindowUrl=" +$infoWindowUrl.html());
              $infoWindowUrl.text(venueUrl);
              $infoWindowUrl.attr('href',venueUrl);
              //console.log( "after,infoWindowUrl=" +$infoWindowUrl.html());
          }   
        else
              $infoWindowUrl.replaceWith('<h5>URL not found</h5>');

          //cache'ing Marker data, as per review feedback, so as to not retrieve api data for the same marker.
          marker.infoWindowHtml=$infoWindowContent.html();
      }).fail(function(jqxhr, textStatus, error){
        //on error case
        console.log("Request Failed: " + textStatus + ' , ' + error);
        $infoWindowAddress.replaceWith('<h5>Content could not be loaded</h5>');
      });
    //click on the url in the infoWindow, opens a new page/tab with restaurant info.
  $("#url").click(function() {
    var target=$(this).parent().find("a");
      window.open(target.attr('href'));
  }); 

};

ko.applyBindings(new ViewModel());