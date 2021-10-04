
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var TectonicPlatesGeoJSON = "GeoJSON/PB2002_boundaries.json";


// Perform a GET request to the query URL
d3.json(queryUrl, function(earthquake_data) {
  // Once we get a response, send the data.features object to the createFeatures function
  d3.json(TectonicPlatesGeoJSON,function(tectonicplates_data){
    createFeatures(earthquake_data.features,tectonicplates_data.features);
  });
  
});

function createFeatures(earthquakeData,tectonicplatesData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h2>" + feature.properties.title +
      "</h2><hr><h3>Time:" + new Date(feature.properties.time) +"</a></h3><h3>"+`Mag: ${feature.properties.mag}`+"</h3><h3>"+`Type: ${feature.properties.type}`+"</h3><h4>"+`Rms: ${feature.properties.rms}`+"</h4>");
      
     }
    
   
  // Create Earthquakes and TetonicPlates GeoJSON layers containing the features 
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    
    pointToLayer: function (feature, latlng) {
      return L.circle(latlng, {
      stroke: false,
      fillOpacity: 0.75,
      color: "black",
      fillColor: getColor(feature.properties.mag),
      radius: feature.properties.mag*15000
      });
    }
  })
  
  var tectonicplates = L.geoJSON(tectonicplatesData, {
      pointToLayer: function (feature, latlng) {
			return L.marker(latlng);
    }
  });

 // Create Map
  createMap(earthquakes,tectonicplates);
}

// Legend Color
function getColor(d){
    return d > 5 ? '#333300' :
           d > 4  ? '#866600' :
           d > 3  ? '#999900' :
           d > 2  ? '#CCCC00' :
           d > 1   ? '#FFFF00' :
           d > 0   ? '#FFFF66' :
                     '#FFFFCC';

}

function createMap(earthquakes,tectonicplates) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets-satellite",
    accessToken: API_KEY
  });

  var outdoormap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });


  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Satellite Map": satellitemap,
    "Outdoor":outdoormap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    TectonicPlates: tectonicplates
  };

  
  var myMap = L.map("map", {
    center: [
      42.1888, -120.3458
    ],
    zoom: 4,
    layers: [satellitemap, earthquakes,tectonicplates]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  addLegend(myMap);
}

//Add Legend

function addLegend(map){


var legend = L.control({position: 'bottomright'});

    legend.onAdd = function () {

    var div = L.DomUtil.create('div', 'info legend');
    var level = [0, 1, 2, 3, 4, 5];
    var divItem =[];
    
    for (var i = 0; i < level.length; i++) {
      divItem.push("<i style=background:"+getColor(level[i] + 1)+"></i>" + level[i] + (level[i + 1] ? " - " + level[i + 1]:"+"));
    }
    div.innerHTML = divItem.join('<br>');
    return div;
  };

  legend.addTo(map);
}