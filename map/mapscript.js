/*
    Copyright (c) 2023, UrocyonF
    All rights reserved.
    
    This source code is licensed under the BSD-style license found in the
    LICENSE file in the root directory of this source tree. 

    Author: UrocyonF
    Date: 2022 - 2023
*/

// definition of the centering coordinates of the map according to the destination
const coocenter = {
    "Milan":[9.187818, 45.464761], 
    "Barcelone": [2.167095, 41.388582], 
    "Naples":[14.251233, 40.837213]
};

// definition of links to the data of each trip
const datalink = [
    "./mapmilandata.json", 
    "./mapbarcelonedata.json", 
    "./mapnaplesdata.json"
];

// definition of links and image names for points
const images = [
    {url:'airport.png', id:'avion'},
    {url:'rail.png', id:'train'},
    {url:'bus.png', id:'bus'},
    {url:'lodging.png', id:'hotel'},
    {url:'restaurant.png', id:'restaurant'},
];


// function to create the map and its components
function setupMap(desti) {

    // creation of the map
    fetch('../js/token.json')
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        mapboxgl.accessToken = data.token;
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/satellite-v9',
            center: coocenter[desti],
            zoom: 11,
            interactive: true
        });

        // function which manages the addition of points and their management
        function addPoints() {
            // retrieving the data (from their json) and calling the function to add the points, according to the trip
            const name = desti.replace(/^./, desti[0].toLowerCase());
            for (let i = 0; i < 3; i++) {
                if (datalink[i].includes(name)) dlink=datalink[i];
            }

            fetch(dlink)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                // call of the function which will modify the opacity of the points according to the user's choice
                data = setOpacity(data);

                // call the function to add the points
                setupPoints(map, data);

                // add layers with the event to call on each change (street <-> satellite)
                const inputs = document.getElementById('menu').getElementsByTagName('input');
                for (const input of inputs) {
                    input.onclick = (layer) => {
                        const layerId = layer.target.id;
                        map.setStyle('mapbox://styles/mapbox/'+layerId);
                        setupPoints(map, data);
                    };
                }

                // creation of the event waiting for a message from the parent page to change the opacity of the points
                window.addEventListener("message", (e) => {
                    mapdata = setOpacity(data);
                    map.getSource('places').setData(mapdata.data);
                });
            })
        }

        // call of the previously created function
        addPoints()

        // adding the navigation bar
        map.addControl(
            new MapboxGeocoder({
                accessToken: mapboxgl.accessToken,
                mapboxgl: mapboxgl
            })
        );

        // added zoom bar
        var nav = new mapboxgl.NavigationControl();
        map.addControl(nav);
    })
}


// function to change opacity of points in geojson
function setOpacity(mapdata) {
    // retrieves the values (indexes given by the selects) of the user's choices
    var indmoTransport = parent.document.getElementById("MeansOfTransport").value;
    var indHotel = parent.document.getElementById("Hotel").value;
    var indRestauration = parent.document.getElementById("Restauration").value;

    // changement de l'oppacité selon les choix de l'utilisateur
    for (let i = 0; i < mapdata.data.features.length; i++) {
        var linkprop = mapdata.data.features[i].properties;

        // if the point must be displayed, set the opacity to 1 otherwise 0.4 (transparent)
        if (linkprop.type == "moTransport" && linkprop.indice == indmoTransport
            || linkprop.type == "hotel" && linkprop.indice == indHotel
            || linkprop.type == "restauration" && linkprop.indice >= indRestauration) 
        {
            linkprop.opacity = 1;
        } else {
            linkprop.opacity = 0.4;
        }
    }

    return mapdata;
}


// function to add points on the map
function setupPoints(map, mapdata) {
    // creation of variables which manages the passage over the points and the list of images
    let isHover = null;

    // adds points to current map style once
    map.once('data', () => {

        // loading images for points
        Promise.all(
            images.map(img => new Promise((resolve, reject) => {
                map.loadImage('icon/'+img.url, function (error, res) {
                    map.addImage(img.id, res)
                    resolve();
                })
            })) 
        ).then(
            // do nothing
        )

        // adding the points retrieved to the geojson file
        map.addSource('places', mapdata);

        // adding markers
        map.addLayer({
            'id': 'places',
            'type': 'symbol',
            'source': 'places',
            'layout': {
                'icon-padding' : 2,
                'icon-image': ['get', 'symbol'],
                'icon-size' : 0.05,
                'icon-allow-overlap': true,
            },
            'paint': {
                'icon-opacity': ['case',['boolean', ['feature-state', 'hover'], false], 0.6, ['get', 'opacity']]
            }
        });

        // adding popups and interactions
        map.on('click', 'places', (e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            const description = e.features[0].properties.description;
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(map);
        });

        // checking if the cursor is on a point
        map.on('mousemove', 'places', function(e) {
            if (e.features[0]) {
                mouseover(e.features[0]);
            } else {
                mouseout();
            }
        });

        // change of points and cursor when we are no longer on a point
        map.on('mouseout', 'places', function(e) {
            mouseout();
        });

        // function to change the cursor and the opacity of the points as mentioned above
        function mouseover(feature) {
            isHover = feature;
            map.getCanvasContainer().style.cursor = 'pointer';
            map.setFeatureState({
                source: 'places',
                id: isHover.id
            }, {
                hover: true
            });
        }

        // function to reset the normal slider and point opacity to 1
        function mouseout() {
            if (!isHover) return;
            map.getCanvasContainer().style.cursor = 'default';
            map.setFeatureState({
                source: 'places',
                id: isHover.id
            }, {
                hover: false
            });
            isHover = null;
        }
    });
}
