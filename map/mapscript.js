
//token API mapbox
const token = "pk.eyJ1IjoidXJvY3lvbiIsImEiOiJjbDhhb2YxaGwwY2tiM3hsZjdsbTZ2ODB5In0.lZICazlJKYPKC-UwgmYVsg";
mapboxgl.accessToken = token;


// définition des coordonnées de centrage de la map en fonction de la destination
const coocenter = {
    "Milan":[9.187818, 45.464761], 
    "Barcelone": [2.167095, 41.388582], 
    "Naples":[14.251233, 40.837213]
};

// définition des liens vers les données de chaque voyage
const datalink = [
    "./mapmilandata.json", 
    "./mapbarcelonedata.json", 
    "./mapnaplesdata.json"
];

// définition liens et noms des images pour les points
const images = [
    {url:'airport.png', id:'avion'},
    {url:'rail.png', id:'train'},
    {url:'bus.png', id:'bus'},
    {url:'lodging.png', id:'hotel'},
    {url:'restaurant.png', id:'restaurant'},
];


// fonction pour créer la carte et ses composantes
function setupMap(desti) {
    // création de la carte
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: coocenter[desti],
        zoom: 11,
        interactive: true
    });

    // fonction qui gère l'ajout des points et leur gestion
    function addPoints() {
        // récuperation des données (depuis leur json) et appel de la fonction pour ajouter les points, selon le voyage
        const name = desti.replace(/^./, desti[0].toLowerCase());
        for (let i = 0; i < 3; i++) {
            if (datalink[i].includes(name)) dlink=datalink[i];
        }
        
        fetch(dlink)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            // appel de la fonction qui va modifiéer l'opacité des points selon le choix de l'utilisateur
            data = setOpacity(data);

            // appel de la fonction pour ajouter les points
            setupPoints(map, data);

            // ajout des layers avec l'évenement à appeler à chaque changement (street <-> satellite)
            const inputs = document.getElementById('menu').getElementsByTagName('input');
            for (const input of inputs) {
                input.onclick = (layer) => {
                    const layerId = layer.target.id;
                    map.setStyle('mapbox://styles/mapbox/'+layerId);
                    setupPoints(map, data);
                };
            }

            // création de l'évenement attendant une message de la page parente pour changer la l'opacité des points
            window.addEventListener("message", (e) => {
                mapdata = setOpacity(data);
                map.getSource('places').setData(mapdata.data);
            });
        })
    }

    // appel de la fonction précédement créée
    addPoints()

    // ajout de la barre de navigation
    map.addControl(
        new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl
        })
    );

    // ajout de la barre de zoom
    var nav = new mapboxgl.NavigationControl();
    map.addControl(nav);
}


// fonction pour modifier l'opacité des points dans le geojson
function setOpacity(mapdata) {
    // récupère les valeurs (indices donné par les selects) des choix de l'utilisateur
    var indmoTransport = parent.document.getElementById("MeansOfTransport").value;
    var indHotel = parent.document.getElementById("Hotel").value;
    var indRestauration = parent.document.getElementById("Restauration").value;

    // changement de l'oppacité selon les choix de l'utilisateur
    for (let i = 0; i < mapdata.data.features.length; i++) {
        var linkprop = mapdata.data.features[i].properties;

        // si le point doit être affiché passe l'opacité à 1 sinon 0.4 (transparent)
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


// fonction pour ajouter les points sur la carte
function setupPoints(map, mapdata) {
    // création des variables qui gère le passage sur les points et la liste des images
    let isHover = null;

    // ajoute une fois les points au style de la carte actuel
    map.once('data', () => {

        // chargement des images pour les points
        Promise.all(
            images.map(img => new Promise((resolve, reject) => {
                map.loadImage('icon/'+img.url, function (error, res) {
                    map.addImage(img.id, res)
                    resolve();
                })
            })) 
        ).then(/* passe à la suite */)

        // ajout des points récupérés dans le fichier geojson
        map.addSource('places', mapdata);

        // ajout des markers
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

        // ajout des popups et des interactions
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

        // vérification de si le curseur est sur un point
        map.on('mousemove', 'places', function(e) {
            if (e.features[0]) {
                mouseover(e.features[0]);
            } else {
                mouseout();
            }
        });

        // changement des points et du curseur quand on est plus sur un point
        map.on('mouseout', 'places', function(e) {
            mouseout();
        });

        // fonction pour changer le curseur et l'opacité des points comme prévisé plus haut
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

        // fonction pour remettre le curseur normal et l'opacité des points à 1
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