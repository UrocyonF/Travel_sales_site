/*
    Copyright (c) 2023, UrocyonF
    All rights reserved.
    
    This source code is licensed under the BSD-style license found in the
    LICENSE file in the root directory of this source tree. 

    Author: UrocyonF
    Date: 2022 - 2023
*/
"use strict";

/*####### Global #######*/
// event display the menu only if you go down the page
window.addEventListener("scroll", function () {
    if (window.scrollY >= 470) {
        SideMenu.style.display = "block";
    } else if (window.scrollY < 470) {
        SideMenu.style.display = "none";
    }
});


// allows you to adapt the link to the json files depending on the current page
let pagetojslink = "";
let pagetopagelink = "pages/";
if (!window.location.href.includes('index.html')) {
    pagetojslink = "../";
    pagetopagelink = "";
}


// allows you to retrieve data from the headerfooter.json file for displaying headers, footers and menu on the side
fetch(pagetojslink + "js/headerfooter.json")
    .then(function (response) {
        return response.json()
    })
    .then(function (data) {
        let tripsdata = {}
        tripsdata = data;
        document.getElementById("Header").innerHTML = tripsdata["data"]["header"]
            .replace(/{{pageoutlink}}/g, pagetojslink)
            .replace(/{{pageinlink}}/g, pagetopagelink);
        document.getElementById("Footer").innerHTML = tripsdata["data"]["footer"];
        document.getElementById("SideMenu").innerHTML = tripsdata["data"]["sidemenu"]
            .replace(/{{pageoutlink}}/g, pagetojslink)
            .replace(/{{pageinlink}}/g, pagetopagelink);
    })


// creation of the sales travel class
class Produit {
    constructor(destination, pays, minprix, description, explication, modalite, images, moyenDeTransport, hotel, transportSurPlace, restaurant) {
        this._destination = destination;
        this._pays = pays;
        this._minprix = minprix;
        this._description = description;
        this._explication = explication;
        this._modalite = modalite;
        this._images = images;
        this._moyenDeTransport = moyenDeTransport;
        this._hotel = hotel;
        this._transportSurPlace = transportSurPlace;
        this._restaurant = restaurant;
    }
}


// allows data recovery from data.json file
var groupetrips = [];
fetch(pagetojslink + "js/data.json")
    .then(function (response) {
        return response.json()
    })
    .then(function (data) {
        let tripsdata = {}
        tripsdata = data;
        creategroupeTrips(tripsdata['data']);
        if (window.location.href.includes('payment.html')) {
            creatPaymentTemplate();
        }
    })


// function to create Product classes from the data.json file
function creategroupeTrips(tripsdata) {
    for (let trip of tripsdata) {
        var newTrip = new Produit(trip.destination, trip.pays, trip.minprix,
            trip.description, trip.explication, trip.modalite, trip.images,
            trip.moyenDeTransport, trip.hotel, trip.transportSurPlace, trip.restaurant);
        groupetrips.push(newTrip);
    }
}


// function to modify the requested page with the templates
function creatTemplate(page) {
    var template = document.getElementById("Template" + page + "Trip");

    // browsing the list of Product classes and copying the template for each trip
    for (const e of groupetrips) {
        var clone = document.importNode(template.content, true);

        // for each class, we modify the values of the template elements depending on the page
        var newContent = clone.firstElementChild.innerHTML
            .replace(/{{destination}}/g, e._destination)
            .replace(/{{description}}/g, e._description)
        if (page == 'Index') {
            var newContent = newContent
                .replace(/{{image}}/g, e._images[0])
                .replace(/{{prix}}/g, e._minprix);
            var templateParent = 'Trips';
        }
        else if (page == 'Perso') {
            var newContent = newContent
                .replace(/{{image1}}/g, e._images[1])
                .replace(/{{image2}}/g, e._images[2])
                .replace(/{{image3}}/g, e._images[3])
                .replace(/{{explication}}/g, e._explication)
                .replace(/{{modalite}}/g, e._modalite);
            var templateParent = 'TripOverview';
        }

        // we replace the content of the template with the new content
        clone.firstElementChild.innerHTML = newContent;
        document.getElementById(templateParent).appendChild(clone);
    }

    // updates the templates (if the page changes by modifying filters/options)
    if (page == 'Index') changePageAccueil()
    else if (page == 'Perso') changePagePerso()
}


// function to calculate the price of the trip based on the destination, the options chosen and the number of days
function calculPrix(destination, indmoTransport, indHotel, indosTransport, indRestauration, nbJour) {
    var prix = 0;

    // calculation of the price based on the options chosen
    for (let i in groupetrips) {
        if (destination == groupetrips[i]._destination) {
            prix += groupetrips[i]._moyenDeTransport[indmoTransport][1];
            prix += groupetrips[i]._hotel[indHotel][1] * (nbJour - 1);
            prix += groupetrips[i]._transportSurPlace[indosTransport][1];
            prix += groupetrips[i]._restaurant[indRestauration][1] * (nbJour * 2);
        }
    }

    // display of the price if you are on the personalization page
    if (window.location.href.includes('personnalisation.html')) {
        document.getElementById("TripPrice").innerHTML = "Prix prévisionnel: " + prix + " €";
    }
    else return prix;
}



/*####### Home page #######*/
// function which manages the play/pause button of the video player on the home page
function playAndPause() {
    var video = document.getElementById("BackgroundVideo");
    var btn = document.getElementById("BtnVideo");
    if (video.paused) {
        video.play();
        btn.innerHTML = "Vidéo Pause";
    } else {
        video.pause();
        btn.innerHTML = "Vidéo Play";
    }
}


// function to modify the home page according to the chosen filters
function changePageAccueil() {
    // retrieving filter values
    var filtreprix = document.getElementById("FilPrice").value;
    var filtredestination = document.getElementById("FilDestination").value;

    // displaying home page variables
    document.getElementById("FilPrixOut").innerHTML = "Prix: " + filtreprix + "€";
    document.getElementById("FilDestOut").innerHTML = "Destination: " + filtredestination;

    // checking filters to display trips with the template
    var trips = document.getElementsByClassName("column");
    for (let i in groupetrips) {
        if (filtreprix >= groupetrips[i]._minprix && (filtredestination == "toutes" || filtredestination == groupetrips[i]._pays)) {
            trips[i].style.display = "block";
        }
        else {
            trips[i].style.display = "none";
        }
    }
}



/*####### Personalization page #######*/
// function to modify the personalization page according to the chosen trip
function changePagePerso() {
    // recovery of the chosen trip and templates
    let destination = new URLSearchParams(window.location.search).get("trip");
    var desti = "";
    var trips = document.getElementsByClassName("overview");

    // display of the necessary template (or no template)
    document.getElementById("NoTrip").style.display = "none";
    for (let i in groupetrips) {
        if (destination == groupetrips[i]._destination) {
            trips[i].style.display = "block";
            desti = destination;
        }
        else {
            trips[i].style.display = "none";
        }
    }
    if (desti == "") {
        document.getElementById("NoTrip").style.display = "block";
        document.getElementById("BtnPanier").style.display = "none";
    }

    // check if there are already options chosen in the sessionStorage (for this trip)
    var destiOption = JSON.parse(sessionStorage.getItem("currentDestiOption"));
    if (destiOption != null) {
        for (let i in destiOption) {
            if (destiOption[i].destination == desti) {
                // modifies according to the options chosen in the sessionStorage
                document.getElementById("MeansOfTransport").selectedIndex = destiOption[i].meansOfTransport;
                document.getElementById("Hotel").selectedIndex = destiOption[i].hotel;
                document.getElementById("OnSiteTransportation").selectedIndex = destiOption[i].onSiteTransportation;
                document.getElementById("Restauration").selectedIndex = destiOption[i].restauration;
            }
        };
    }

    // call of the function to create the map according to the chosen trip (in the iframe)
    if (desti != "") {
        document.getElementById("MapFrame").contentWindow.setupMap(desti);
    }

    // call the page modification functions according to the options
    creatCanvas(desti);
    getOptions();
}


// function to retrieve the chosen options and display them on the map (by calling the functions for displaying points on the map)
function getOptions() {
    // recovery of chosen options
    var indmoTransport = document.getElementById("MeansOfTransport").value;
    var indHotel = document.getElementById("Hotel").value;
    var indosTransport = document.getElementById("OnSiteTransportation").value;
    var indRestauration = document.getElementById("Restauration").value;

    // call the travel price calculation function
    var destination = new URLSearchParams(window.location.search).get("trip");
    calculPrix(destination, indmoTransport, indHotel, indosTransport, indRestauration, 3);

    // displays of the chosen options in the canvas
    modifCanvas(indmoTransport, indHotel, indosTransport, indRestauration);

    // display of chosen options on the map
    var childWindow = document.getElementById("MapFrame").contentWindow;
    childWindow.postMessage([indmoTransport, indHotel, indRestauration]);

    // saving changes in sessionStorage
    var destiOption = JSON.parse(sessionStorage.getItem("currentDestiOption"));

    // if there are no options chosen for this trip yet
    if (destiOption == null) {
        var ldestiOption = [{
            destination: destination,
            meansOfTransport: indmoTransport,
            hotel: indHotel,
            onSiteTransportation: indosTransport,
            restauration: indRestauration
        }];
    }

    // if there are already options chosen for this trip
    else {
        var ldestiOption = destiOption;
        var trouve = false;

        // if there is already a trip with the same name registered
        for (let i in ldestiOption) {
            if (ldestiOption[i].destination == destination) {
                ldestiOption[i].meansOfTransport = indmoTransport;
                ldestiOption[i].hotel = indHotel;
                ldestiOption[i].onSiteTransportation = indosTransport;
                ldestiOption[i].restauration = indRestauration;
                trouve = true;
            }
        }

        // if there is no trip with the same name registered yet
        if (!trouve) {
            ldestiOption.push({
                destination: destination,
                meansOfTransport: indmoTransport,
                hotel: indHotel,
                onSiteTransportation: indosTransport,
                restauration: indRestauration
            });
        }
    }

    // saving the chosen options in the sessionStorage
    sessionStorage.setItem("currentDestiOption", JSON.stringify(ldestiOption));
}


// function to create the canvas (with image and static text)
function creatCanvas(destination) {
    // canvas recovery
    const canvasS = document.getElementById("statCanvasCarte");

    if (canvasS.getContext) {
        const ctxS = canvasS.getContext("2d");

        // creating the background image
        let img = new Image();
        img.addEventListener('load', function () {
            ctxS.drawImage(img, 0, 0, canvasS.width, canvasS.height);

            // creating static text
            ctxS.font = '30px Verdana';
            ctxS.fillStyle = 'Black';
            ctxS.fillText('Voyage de rêve', 130, 40);

            ctxS.font = '10px Verdana';
            ctxS.fillText('Destination:', 263, 83);

            ctxS.font = '25px Verdana';
            ctxS.fillText(destination, 263, 110);

            ctxS.font = '8px Verdana';
            ctxS.fillText('Moyen de transport:', 10, 134);

            ctxS.fillText('Hôtel:', 10, 176);

            ctxS.fillText('Transport sur place:', 10, 218);

            ctxS.fillText('Restaurant:', 10, 260);
        }, false);
        img.src = '../images-videos/cartevoyage.png';
    }
}


// function to modify the canvas according to the user's choices
function modifCanvas(indmoTransport, indHotel, indosTransport, indRestauration) {
    // recovery of the canvas and the chosen trip
    let destination = new URLSearchParams(window.location.search).get("trip");
    const canvasD = document.getElementById("dynaCanvasCarte");

    if (canvasD.getContext) {
        for (let i in groupetrips) {

            // loop to find the chosen trip
            if (destination == groupetrips[i]._destination) {
                const ctxD = canvasD.getContext("2d");
                ctxD.clearRect(0, 0, canvasD.width, canvasD.height);

                // dynamic text according to the user's choices and the chosen trip
                ctxD.font = '11px Verdana';
                ctxD.fillStyle = 'Black';
                ctxD.fillText(groupetrips[i]._moyenDeTransport[indmoTransport][0], 9, 151);

                ctxD.fillText(groupetrips[i]._hotel[indHotel][0], 9, 193);

                ctxD.fillText(groupetrips[i]._transportSurPlace[indosTransport][0], 9, 235);

                ctxD.fillText(groupetrips[i]._restaurant[indRestauration][0], 9, 277);
            }
        }
    }
}


// function to reset the selects (option inputs)
function reset() {
    document.getElementById("MeansOfTransport").value = "0";
    document.getElementById("Hotel").value = "0";
    document.getElementById("OnSiteTransportation").value = "0";
    document.getElementById("Restauration").value = "0";

    getOptions()
}


// function to save the chosen options in the sessionStorage
function tripValide() {
    // retrieving select values
    var indmoTransport = document.getElementById("MeansOfTransport").value;
    var indHotel = document.getElementById("Hotel").value;
    var indosTransport = document.getElementById("OnSiteTransportation").value;
    var indRestauration = document.getElementById("Restauration").value;

    // recovery of the chosen trip
    var destination = new URLSearchParams(window.location.search).get("trip");

    // recovery of the list of trips already chosen
    var choixVoyages = JSON.parse(sessionStorage.getItem("panier"));

    // if there is no trip selected yet
    if (choixVoyages == null) {
        var choixVoyages = [{
            destination: destination,
            meansOfTransport: indmoTransport,
            hotel: indHotel,
            onSiteTransportation: indosTransport,
            restauration: indRestauration,
            quantite: 1
        }];
    }

    // s'il y a déjà des voyages sélectionnés (enregistrement dans le sessionStorage)
    else {
        choixVoyages.push({
            destination: destination,
            meansOfTransport: indmoTransport,
            hotel: indHotel,
            onSiteTransportation: indosTransport,
            restauration: indRestauration,
            quantite: 1
        });
    };

    // saving the chosen options in the sessionStorage
    sessionStorage.setItem("panier", JSON.stringify(choixVoyages));

    // redirect to payment page
    window.location.href = 'payment.html';
}



/*####### Shopping cart page #######*/
// function that checks if the input is a string
function isString(x) {
    return typeof x === "string" || x instanceof String;
}


// function to remove all - then reverse an object of type string (into a date)
function inverseString(chaine) {
    chaine.replaceAll('-', '');
    return (chaine.slice(8, 10) + '/' + chaine.slice(5, 7) + '/' + chaine.slice(0, 4));
}


// function to check that the information entered in the payment page is valid
function validateForm() {
    // Declaration of variables that will be used for tests in the form
    var nom = document.getElementById("Surname").value;
    var prenom = document.getElementById("Name").value;
    var email = document.getElementById("Email").value;
    var numero = document.getElementById("PhoneNumber").value;
    var dateD = document.getElementById("StartTrip").value;
    var dateF = document.getElementById("EndTrip").value;

    // reverse and remove the "-" from the date to be able to display it in the form
    var x = inverseString(dateD);
    var y = inverseString(dateF);
    document.getElementById("RecapDate").innerHTML = "Votre voyage est prévu du " + x + " au " + y;

    // tests to verify that the form is completed correctly
    try {
        if (nom == "") throw "Le nom doit être rempli";
        else if (isString(nom) == false || nom == "")
            throw "Le nom est invalide";
        else if (isString(prenom) == false || prenom == "")
            throw "Le prénom doit être une chaine de caractère";
        else if (email == "" || email.search("@") == -1 && email.indexOf(".", parseInt(email.search("@"))))
            throw "L'email est invalide";
        else if (numero == "" || (numero.length) != 10 || typeof (parseInt(numero)) == "NaN")
            throw "Numéro de téléphone invalide";
        else if (document.getElementById("DeliveryAdress").value == "")
            throw "L'adresse est invalide";
        else if (document.getElementById("Town").value == "")
            throw "Veuillez remplir votre ville";
        else if (document.getElementById("Street").value == "")
            throw "Veuillez renseigner votre rue";
        else if (document.getElementById("Zipcode").value == "")
            throw "Veuillez remplir votre code postal";
        else if (parseInt(dateF.slice(0, 4)) < parseInt(dateD.slice(0, 4))
            || parseInt(dateF.slice(5, 7)) < parseInt(dateD.slice(5, 7))
            || parseInt(dateF.slice(8, 10)) < parseInt(dateD.slice(8, 10)))
            throw "Date de voyage invalide";
        else throw "Votre commande est validée"
    }

    // generates an error if the form is not filled correctly
    catch (erreur) {
        alert(erreur)
    }
}


// list containing all objects of the Shopping cart class
let groupePanier = [];

// function to create list with objects of Shopping cart class from sessionStorage
function creategroupePanier() {
    var panierdata = JSON.parse(sessionStorage.getItem("panier"));
    if (panierdata != null) {
        for (let item of panierdata) {
            var newPanier = new Panier(item.destination, parseInt(item.meansOfTransport), parseInt(item.hotel), parseInt(item.onSiteTransportation), parseInt(item.restauration), parseInt(item.quantite));
            groupePanier.push(newPanier);
        }
    }
}


// creating the Shopping cart class
class Panier {
    constructor(destination, indmoTransport, indHotel, indosTransport, indRestauration, quantite) {
        this._destination = destination;
        this._indmoTransport = indmoTransport;
        this._indHotel = indHotel;
        this._indosTransport = indosTransport;
        this._indRestauration = indRestauration;
        this._quantite = quantite;
    }
}


// function to modify the payment page with the created templates
function creatPaymentTemplate() {
    creategroupePanier();
    var template = document.getElementById("TemplatePaymentTrip");

    // browsing the list of Shopping cart classes and copying the template for each trip
    for (let i in groupePanier) {
        var clone = document.importNode(template.content, true);

        // for each class, we modify the values of the template elements
        for (let k in groupetrips) {
            if (groupetrips[k]._destination == groupePanier[i]._destination) {
                var newContent = clone.firstElementChild.innerHTML
                    .replace(/{{destination}}/g, groupePanier[i]._destination)
                    .replace(/{{meansOfTransport}}/g, groupetrips[k]._moyenDeTransport[groupePanier[i]._indmoTransport][0])
                    .replace(/{{hotel}}/g, groupetrips[k]._hotel[groupePanier[i]._indHotel][0])
                    .replace(/{{onSiteTransportation}}/g, groupetrips[k]._transportSurPlace[groupePanier[i]._indosTransport][0])
                    .replace(/{{restauration}}/g, groupetrips[k]._restaurant[groupePanier[i]._indRestauration][0])
                    .replace(/{{quantite}}/g, groupePanier[i]._quantite)
                    .replace(/{{indice}}/g, i);
            }
        }

        // we replace the content of the template with the new content
        clone.firstElementChild.innerHTML = newContent;
        document.getElementById("Summary").appendChild(clone);
    }

    changePaymentTemplate();
}


// function to modify the payment page according to the chosen trips
function changePaymentTemplate() {
    // we declare our variables
    var produit = document.getElementsByClassName("panierTemplate");
    var panier = JSON.parse(sessionStorage.getItem("panier"));
    var basketEmpty = true;

    // allows you to show or hide the div that is displayed if you have an empty basket and to display one template per trip
    document.getElementById("NoBasket").style.display = "none";
    for (var i in panier) {
        if (panier[i].destination != "none") {
            produit[i].style.display = "block";
            basketEmpty = false;
        } else {
            panier[i].style.display = "none";
        }
    }

    // display only if the basket is empty
    if (basketEmpty == true) {
        document.getElementById("NoBasket").style.display = "block";
    }
}


// list counting the indices of deleted trips (for tracking indices)
let listIndSuppr = [];

// function to calculate the number of indices in the list which are less than the index passed as a parameter
function calculIndPrecedent(indiceVoyage) {
    var nbIndPrecedentSuppr = 0;
    for (var ind in listIndSuppr) {
        if (listIndSuppr[ind] < indiceVoyage) nbIndPrecedentSuppr++;
    }
    return nbIndPrecedentSuppr;
}


// function to withdraw a travel quantity
function BtnMoins(indiceVoyagePanier) {
    // calculation of the travel index in the basket (real with previous deletions)
    var newIndiceVoyagePanier = indiceVoyagePanier - calculIndPrecedent(indiceVoyagePanier);

    // variable declaration
    var panier = JSON.parse(sessionStorage.getItem("panier"));
    panier[newIndiceVoyagePanier].quantite--;

    // check if the quantity is 0, if yes, delete the trip from the basket
    if (panier[newIndiceVoyagePanier].quantite == 0) {
        panier.splice(newIndiceVoyagePanier, 1);
        groupePanier.splice(newIndiceVoyagePanier, 1);
        document.getElementsByClassName("panierTemplate")[indiceVoyagePanier].style.display = "none";
        listIndSuppr.push(indiceVoyagePanier);
    }
    else {
        groupePanier[newIndiceVoyagePanier]._quantite--;
        document.getElementsByClassName("panierTemplate")[indiceVoyagePanier].getElementsByClassName("quantite")[0].innerHTML = panier[newIndiceVoyagePanier].quantite;
    }

    // saving the basket in the sessionStorage
    sessionStorage.setItem("panier", JSON.stringify(panier));

    // updates the total price
    dateChange();
}


// Function to add travel quantity
function BtnPlus(indiceVoyagePanier) {
    // calculation of the travel index in the basket (real with previous deletions)
    var newIndiceVoyagePanier = indiceVoyagePanier - calculIndPrecedent(indiceVoyagePanier);

    // retrieving the cart in the sessionStorage
    var panier = JSON.parse(sessionStorage.getItem("panier"));

    // adding a quantity
    panier[newIndiceVoyagePanier].quantite++;
    groupePanier[newIndiceVoyagePanier]._quantite++;
    sessionStorage.setItem("panier", JSON.stringify(panier));

    // change in page display
    document.getElementsByClassName("panierTemplate")[indiceVoyagePanier].getElementsByClassName("quantite")[0].innerHTML = panier[newIndiceVoyagePanier].quantite;

    // updates the total price
    dateChange();
}


// function which displays in the form the start date and the end date of the trip
function dateChange(){
    // retrieving the start and end date of the trip in raw form
    var strD = document.getElementById("StartTrip").value;
    var strF = document.getElementById("EndTrip").value;

    //transforming the start and end date of the trip into js date form
    const dateD = new Date(strD);
    const dateF = new Date(strF);

    // calculation of the number of days between the start and end dates of the trip if the start and end dates are valid
    if (parseInt(strF.slice(0,4)) > parseInt(strD.slice(0,4))
            || parseInt(strF.slice(5,7)) > parseInt(strD.slice(5,7)) 
            || parseInt(strF.slice(8,10)) > parseInt(strD.slice(8,10))) {

        // calculation of the number of days of the trip 
        var Diff_temps = dateF.getTime() - dateD.getTime(); 
        var Diff_jours = Diff_temps / (1000 * 3600 * 24);
        
        // call function to calculate total price based on number of days
        calculPrixTotal(Diff_jours);
    }
}


// function which allows you to have the geocoding of the place of departure
async function adresseMag(){
    // token for mapbox API
    fetch(pagetojslink + "js/token.json")
    .then(function (response) {
        return response.json()
    })
    .then(function (data) {
        mapboxgl.accessToken = data.token;

        // call the API to have the coordinates of the place of departure and put in the correct format
        const coordDepApi = fetch("https://api.mapbox.com/geocoding/v5/mapbox.places/200%20Quai%20Charles%20de%20Gaulle%2069006%20Lyon%20France.json?access_token="+mapbox.accessToken)
        const coordDepJson = coordDepApi.json() // conversion to json file
        const coordDep = coordDepJson.features[0].center // recovery of coordinates of the place of departure
        return coordDep 
    })
}


// function which allows geocoding of the place of arrival that the user has entered
async function adresseUti(){
    // retrieving user address
    var rueArr = document.getElementById("Street").value
    var rueArrTab = rueArr.split(" ")
    var adresseArr = ""

    // creating the user address for the api in the correct format (geocoding service)
    for (i of rueArrTab){
        adresseArr += i+"%20"
    }

    // call the API to have the coordinates of the place of arrival and put in the correct format
    var codePostArr = document.getElementById("Zipcode").value
    var villeArr = document.getElementById("Town").value
    adresseArr += codePostArr+"%20"+villeArr

    var coordArrApi = await fetch("https://api.mapbox.com/geocoding/v5/mapbox.places/"+ adresseArr +".json?access_token="+mapbox.accessToken)
    var coordArrJson = await coordArrApi.json() // conversion to json file
    var adresseArrFin = coordArrJson.features[0].center

    return adresseArrFin 
}


// function which allows you to have the distance which separates the two addresses as parameters
async function distanceDepArr(){
    // recovery of departure and arrival addresses
    const adresseDep = await adresseMag()
    const adresseArr = await adresseUti()

    // API call to get the distance between the two addresses
    var distApi = await fetch("https://api.mapbox.com/directions/v5/mapbox/driving/" + adresseDep[0] + "," + adresseDep[1] + ";" + adresseArr[0] + "," + adresseArr[1] + ".json?access_token=" + mapbox.accessToken)
    const distJson = await distApi.json()
    const distanceFin = distJson.routes[0].distance

    return distanceFin
}


// function which retrieves the distance between the company and the customer and which calculates the price to add depending on the distance and/or if the customer wants to have it delivered in less than 72 hours
async function distancePrix(){
    // recovery of the distance between the company and the customer
    const distance = await  distanceDepArr()

    // addition of the price depending on the distance (formula in the specifications)
    var surplus = Math.round(5 + 0.07 * distance/1000)

    // test if the date entered is less than 72 hours and addition of 8€ if this is the case
    if (Date.parse(document.getElementById("StartTrip").value) <= Date.now()+3*86400000){
        surplus += 8
    }

    return surplus
}


// function calculating the total price based on the number of days and number of trips
function calculPrixTotal(diffJours) {
    // initialization of our variable
    var prixTotal = 0;

    // loop to calculate total price 
    for (var i in groupePanier) {
        var prix = calculPrix(groupePanier[i]._destination, groupePanier[i]._indmoTransport, groupePanier[i]._indHotel, groupePanier[i]._indosTransport, groupePanier[i]._indRestauration, diffJours) * groupePanier[i]._quantite;
        if (groupePanier[i]._quantite >= 10) prix *= 0.90;
        prixTotal += prix;
        document.getElementsByClassName("panierTemplate")[parseInt(i) + calculIndPrecedent(i + 1)].getElementsByClassName("price")[0].innerHTML = "Prix total: " + prix + " €";
    }

    // change in total price displayed
    document.getElementById("TotPrice").innerHTML = "Prix total: " + prixTotal + " €";
}
