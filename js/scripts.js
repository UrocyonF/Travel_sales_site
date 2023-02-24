"use strict";

//token API mapbox
const token = "pk.eyJ1IjoidXJvY3lvbiIsImEiOiJjbDhhb2YxaGwwY2tiM3hsZjdsbTZ2ODB5In0.lZICazlJKYPKC-UwgmYVsg";


/*####### global #######*/
// event afficher le menu seulement si on descend dans la page
window.addEventListener("scroll", function () {
    if (window.scrollY >= 470) {
        SideMenu.style.display = "block";
    } else if (window.scrollY < 470) {
        SideMenu.style.display = "none";
    }
});


// permet d'adapter le lien vers les fichier json en fonction de la page actuelle
let pagetojslink = "";
let pagetopagelink = "pages/";
if (!window.location.href.includes('index.html')) {
    pagetojslink = "../";
    pagetopagelink = "";
}


// permet de récupérer les données du fichier headerfooter.json pour l'affichage des headers, footers et menu sur le côté
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


// création de la classe des voyages en vente
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


// permet la récupération des données du fichier data.json
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


// fonction pour créer les class Produit à partir du fichier data.json
function creategroupeTrips(tripsdata) {
    for (let trip of tripsdata) {
        var newTrip = new Produit(trip.destination, trip.pays, trip.minprix,
            trip.description, trip.explication, trip.modalite, trip.images,
            trip.moyenDeTransport, trip.hotel, trip.transportSurPlace, trip.restaurant);
        groupetrips.push(newTrip);
    }
}


// fonction pour modifier la page demandé avec les templates
function creatTemplate(page) {
    var template = document.getElementById("Template" + page + "Trip");

    // parcours de la liste des class Produit et copiant le template pour chaques voyages
    for (const e of groupetrips) {
        var clone = document.importNode(template.content, true);

        // pour chaque classe, on modifie les valeurs des éléments du template en fonction de la page
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

        // on remplace le contenu du template par le nouveau contenu
        clone.firstElementChild.innerHTML = newContent;
        document.getElementById(templateParent).appendChild(clone);
    }

    // met à jour les templates (en cas de changement de la page par modification des filtres/options)
    if (page == 'Index') changePageAccueil()
    else if (page == 'Perso') changePagePerso()
}


// fonction pour calculer le prix du voyage en fonction de la destination, des options choisis et du nombre de jours
function calculPrix(destination, indmoTransport, indHotel, indosTransport, indRestauration, nbJour) {
    var prix = 0;

    // calcul du prix en fonction des options choisies
    for (let i in groupetrips) {
        if (destination == groupetrips[i]._destination) {
            prix += groupetrips[i]._moyenDeTransport[indmoTransport][1];
            prix += groupetrips[i]._hotel[indHotel][1] * (nbJour - 1);
            prix += groupetrips[i]._transportSurPlace[indosTransport][1];
            prix += groupetrips[i]._restaurant[indRestauration][1] * (nbJour * 2);
        }
    }

    // affichage du prix si on est sur la page de personnalisation
    if (window.location.href.includes('personnalisation.html')) {
        document.getElementById("TripPrice").innerHTML = "Prix prévisionnel: " + prix + " €";
    }
    else return prix;
}



/*####### page d'accueil #######*/
// fonction qui gère le bouton play/pause du player vidéo de la page d'accueil
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


// fonction pour modifier la page d'accueil selon les filtres choisis
function changePageAccueil() {
    // récupération des valeurs du filtre
    var filtreprix = document.getElementById("FilPrice").value;
    var filtredestination = document.getElementById("FilDestination").value;

    // affichage des variables de la page d'accueil
    document.getElementById("FilPrixOut").innerHTML = "Prix: " + filtreprix + "€";
    document.getElementById("FilDestOut").innerHTML = "Destination: " + filtredestination;

    // vérification des filtres pour afficher les voyages avec le template
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



/*####### page de personalisation #######*/
// fonction pour modifier la page de personnalisation selon le voyage choisi
function changePagePerso() {
    // récupération du voyage choisi et des templates
    let destination = new URLSearchParams(window.location.search).get("trip");
    var desti = "";
    var trips = document.getElementsByClassName("overview");

    // affichage du template nécessaire (ou d'aucun template)
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

    // vérifier s'il y a déjà des options choisies dans le sessionStorage (pour ce voyage)
    var destiOption = JSON.parse(sessionStorage.getItem("currentDestiOption"));
    if (destiOption != null) {
        for (let i in destiOption) {
            if (destiOption[i].destination == desti) {
                // modifie selon les options choisies dans le sessionlStorage
                document.getElementById("MeansOfTransport").selectedIndex = destiOption[i].meansOfTransport;
                document.getElementById("Hotel").selectedIndex = destiOption[i].hotel;
                document.getElementById("OnSiteTransportation").selectedIndex = destiOption[i].onSiteTransportation;
                document.getElementById("Restauration").selectedIndex = destiOption[i].restauration;
            }
        };
    }

    // appel de la fonction pour la création de la carte selon le voyage choisi (dans l'iframe)
    if (desti != "") {
        document.getElementById("MapFrame").contentWindow.setupMap(desti);
    }

    // appel des fonction de modification de la page selon les options
    creatCanvas(desti);
    getOptions();
}


// fonction pour récupérer les options choisies et les afficher sur la carte (en appelant les fonction d'affichage des points sur la map)
function getOptions() {
    // récupération des options choisies
    var indmoTransport = document.getElementById("MeansOfTransport").value;
    var indHotel = document.getElementById("Hotel").value;
    var indosTransport = document.getElementById("OnSiteTransportation").value;
    var indRestauration = document.getElementById("Restauration").value;

    // appel la fonction de calcul du prix du voyage
    var destination = new URLSearchParams(window.location.search).get("trip");
    calculPrix(destination, indmoTransport, indHotel, indosTransport, indRestauration, 3);

    // affichages des options choisies dans le canvas
    modifCanvas(indmoTransport, indHotel, indosTransport, indRestauration);

    // affichage des options choisies sur la carte
    var childWindow = document.getElementById("MapFrame").contentWindow;
    childWindow.postMessage([indmoTransport, indHotel, indRestauration]);

    // enregistrement des changement dans le sessionStorage
    var destiOption = JSON.parse(sessionStorage.getItem("currentDestiOption"));

    // s'il n'y a pas encore d'options choisies pour ce voyage
    if (destiOption == null) {
        var ldestiOption = [{
            destination: destination,
            meansOfTransport: indmoTransport,
            hotel: indHotel,
            onSiteTransportation: indosTransport,
            restauration: indRestauration
        }];
    }

    // s'il y a déjà des options choisies pour ce voyage
    else {
        var ldestiOption = destiOption;
        var trouve = false;

        // s'il y a déjà un voyage qui porte le même nom d'enregisté
        for (let i in ldestiOption) {
            if (ldestiOption[i].destination == destination) {
                ldestiOption[i].meansOfTransport = indmoTransport;
                ldestiOption[i].hotel = indHotel;
                ldestiOption[i].onSiteTransportation = indosTransport;
                ldestiOption[i].restauration = indRestauration;
                trouve = true;
            }
        }

        // s'il n'y a pas encore de voyage qui porte le même nom d'enregisté
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

    // enregistrement des options choisies dans le sessionStorage
    sessionStorage.setItem("currentDestiOption", JSON.stringify(ldestiOption));
}


// fonction pour créer le canvas (avec l'image et le texte statique)
function creatCanvas(destination) {
    // récupération du canvas
    const canvasS = document.getElementById("statCanvasCarte");

    if (canvasS.getContext) {
        const ctxS = canvasS.getContext("2d");

        // création de l'image de fond
        let img = new Image();
        img.addEventListener('load', function () {
            ctxS.drawImage(img, 0, 0, canvasS.width, canvasS.height);

            // création du texte statique
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


// fonction pour modifier le canvas selon les choix de l'utilisateur
function modifCanvas(indmoTransport, indHotel, indosTransport, indRestauration) {
    // récupération du canvas et du voyage choisi
    let destination = new URLSearchParams(window.location.search).get("trip");
    const canvasD = document.getElementById("dynaCanvasCarte");

    if (canvasD.getContext) {
        for (let i in groupetrips) {

            // boucle pour trouver le voyage choisi
            if (destination == groupetrips[i]._destination) {
                const ctxD = canvasD.getContext("2d");
                ctxD.clearRect(0, 0, canvasD.width, canvasD.height);

                // texte dynamique selon les choix de l'utilisateur et le voyage choisi
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


// function pour reset les selects (inputs des options)
function reset() {
    document.getElementById("MeansOfTransport").value = "0";
    document.getElementById("Hotel").value = "0";
    document.getElementById("OnSiteTransportation").value = "0";
    document.getElementById("Restauration").value = "0";

    getOptions()
}


// fonction pour enregistrer les options choisies dans le sessionStorage
function tripValide() {
    // récupération des valeurs des selects
    var indmoTransport = document.getElementById("MeansOfTransport").value;
    var indHotel = document.getElementById("Hotel").value;
    var indosTransport = document.getElementById("OnSiteTransportation").value;
    var indRestauration = document.getElementById("Restauration").value;

    // récupération du voyage choisi
    var destination = new URLSearchParams(window.location.search).get("trip");

    // récupération de la liste des voyages déjà choisies
    var choixVoyages = JSON.parse(sessionStorage.getItem("panier"));

    // s'il n'y a pas encore de voyage sélectionné
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

    // enregistrement des options choisies dans le sessionStorage
    sessionStorage.setItem("panier", JSON.stringify(choixVoyages));

    // redirection vers la page de paiement
    window.location.href = 'payment.html';
}



/*####### page de panier #######*/
// fonction qui vérifie si l'input est un string
function isString(x) {
    return typeof x === "string" || x instanceof String;
}


//fonction pour supprimer tous les - puis inverser un objet de type string (dans une date)
function inverseString(chaine) {
    chaine.replaceAll('-', '');
    return (chaine.slice(8, 10) + '/' + chaine.slice(5, 7) + '/' + chaine.slice(0, 4));
}


// fonction pour vérifier que les infos entrées dans la page de payement sont valides
function validateForm() {
    // Déclaration des variables qui seront utilisées pour les tests dans le formulaire 
    var nom = document.getElementById("Surname").value;
    var prenom = document.getElementById("Name").value;
    var email = document.getElementById("Email").value;
    var numero = document.getElementById("PhoneNumber").value;
    var dateD = document.getElementById("StartTrip").value;
    var dateF = document.getElementById("EndTrip").value;

    // inverse et retire les "-" de la date pour pouvoir l'afficher dans le formulaire
    var x = inverseString(dateD);
    var y = inverseString(dateF);
    document.getElementById("RecapDate").innerHTML = "Votre voyage est prévu du " + x + " au " + y;

    // tests pour vérifier que le formulaire est rempli correctement
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

    // génère une erreur si le formulaire n'est pas rempli correctement
    catch (erreur) {
        alert(erreur)
    }
}


// liste comptenant tous les objets de la classe Panier
let groupePanier = [];

// fonction pour créer la liste avec les objets de la classe Panier à partir du sessionStorage
function creategroupePanier() {
    var panierdata = JSON.parse(sessionStorage.getItem("panier"));
    if (panierdata != null) {
        for (let item of panierdata) {
            var newPanier = new Panier(item.destination, parseInt(item.meansOfTransport), parseInt(item.hotel), parseInt(item.onSiteTransportation), parseInt(item.restauration), parseInt(item.quantite));
            groupePanier.push(newPanier);
        }
    }
}


// création de la classe Panier
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


// fonction pour modifier la page payment avec les templates créés
function creatPaymentTemplate() {
    creategroupePanier();
    var template = document.getElementById("TemplatePaymentTrip");

    // parcours de la liste des class Panier et copiant le template pour chaques voyages
    for (let i in groupePanier) {
        var clone = document.importNode(template.content, true);

        // pour chaque classe, on modifie les valeurs des éléments du template
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

        // on remplace le contenu du template par le nouveau contenu
        clone.firstElementChild.innerHTML = newContent;
        document.getElementById("Summary").appendChild(clone);
    }

    changePaymentTemplate();
}


// fonction pour modifier la page de paiement selon les voyages choisi
function changePaymentTemplate() {
    // on déclare nos variables 
    var produit = document.getElementsByClassName("panierTemplate");
    var panier = JSON.parse(sessionStorage.getItem("panier"));
    var basketEmpty = true;

    // permet d'afficher ou de cacher le div qui s'affiche si on a un panier vide et d'afficher un template par voyage 
    document.getElementById("NoBasket").style.display = "none";
    for (var i in panier) {
        if (panier[i].destination != "none") {
            produit[i].style.display = "block";
            basketEmpty = false;
        } else {
            panier[i].style.display = "none";
        }
    }

    // affichage que si le panier est vide
    if (basketEmpty == true) {
        document.getElementById("NoBasket").style.display = "block";
    }
}


// liste comptenant les indices des voyages supprimés (pour le suivi des indices)
let listIndSuppr = [];

// fonction pour calculer le nombre d'indice dans la liste qui sont inférieur à l'indice passé en paramètre
function calculIndPrecedent(indiceVoyage) {
    var nbIndPrecedentSuppr = 0;
    for (var ind in listIndSuppr) {
        if (listIndSuppr[ind] < indiceVoyage) nbIndPrecedentSuppr++;
    }
    return nbIndPrecedentSuppr;
}


// fonction pour retirer une quantité de voyage
function BtnMoins(indiceVoyagePanier) {
    // calcul de l'indice du voyage dans le panier (réel avec les supprissions précédentes)
    var newIndiceVoyagePanier = indiceVoyagePanier - calculIndPrecedent(indiceVoyagePanier);

    // déclaration des variables
    var panier = JSON.parse(sessionStorage.getItem("panier"));
    panier[newIndiceVoyagePanier].quantite--;

    // vérifier si la quantité est à 0, si oui, supprimer le voyage du panier
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

    // sauvegarde du panier dans le sessionStorage
    sessionStorage.setItem("panier", JSON.stringify(panier));

    // met à jour le prix total
    dateChange();
}


// Fonction pour ajouter une quantité de voyage
function BtnPlus(indiceVoyagePanier) {
    // calcul de l'indice du voyage dans le panier (réel avec les supprissions précédentes)
    var newIndiceVoyagePanier = indiceVoyagePanier - calculIndPrecedent(indiceVoyagePanier);

    // récupération du panier dans le sessionStorage
    var panier = JSON.parse(sessionStorage.getItem("panier"));

    // ajout d'une quantité
    panier[newIndiceVoyagePanier].quantite++;
    groupePanier[newIndiceVoyagePanier]._quantite++;
    sessionStorage.setItem("panier", JSON.stringify(panier));

    // changement dans l'affichage de la page
    document.getElementsByClassName("panierTemplate")[indiceVoyagePanier].getElementsByClassName("quantite")[0].innerHTML = panier[newIndiceVoyagePanier].quantite;

    // met à jour le prix total
    dateChange();
}


// fonction qui affiche dans le formulaire la date de début et la date de fin du voyage 
function dateChange(){
    // récupération de la date de début et de fin du voyage sous forme brute
    var strD = document.getElementById("StartTrip").value;
    var strF = document.getElementById("EndTrip").value;

    // transformation de la date de début et de fin du voyage sous forme de date js
    const dateD = new Date(strD);
    const dateF = new Date(strF);

    // calcul du nombre de jour entre la date de début et de fin du voyage si la date de début et de fin sont valide
    if (parseInt(strF.slice(0,4)) > parseInt(strD.slice(0,4))
            || parseInt(strF.slice(5,7)) > parseInt(strD.slice(5,7)) 
            || parseInt(strF.slice(8,10)) > parseInt(strD.slice(8,10))) {

        // calcul du nombre de jours du voyage 
        var Diff_temps = dateF.getTime() - dateD.getTime(); 
        var Diff_jours = Diff_temps / (1000 * 3600 * 24);
        
        // appel de la fonction pour calculer le prix total en fonction du nombre de jours 
        calculPrixTotal(Diff_jours);
    }
}


// fonction qui permet d'avoir le géocodage du lieu de départ
async function adresseMag(){
    mapboxgl.accessToken = token;
    const coordDepApi = await fetch("https://api.mapbox.com/geocoding/v5/mapbox.places/200%20Quai%20Charles%20de%20Gaulle%2069006%20Lyon%20France.json?access_token="+mapbox.accessToken)
    const coordDepJson = await coordDepApi.json() // conversion en fichier json
    const coordDep = coordDepJson.features[0].center // récupération des coordonnées du lieu de départ
    return coordDep 
}


// fonction qui permet de faire le géocodage du lieu d'arrivé que l'utilisateur à saisi
async function adresseUti(){
    // récupération de l'adresse de l'utilisateur
    var rueArr = document.getElementById("Street").value
    var rueArrTab = rueArr.split(" ")
    var adresseArr = ""

    // création de l'adresse de l'utilisateur pour l'api dans le bon format (service de géocodage)
    for (i of rueArrTab){
        adresseArr += i+"%20"
    }

    // appel de l'api pour avoir les coordonnées du lieu d'arrivé et mise au bon format
    var codePostArr = document.getElementById("Zipcode").value
    var villeArr = document.getElementById("Town").value
    adresseArr += codePostArr+"%20"+villeArr

    // appel de l'api pour avoir les coordonnées du lieu d'arrivé et mise au bon format
    var coordArrApi = await fetch("https://api.mapbox.com/geocoding/v5/mapbox.places/"+ adresseArr +".json?access_token="+mapbox.accessToken)
    var coordArrJson = await coordArrApi.json() // convertion du fichier en json
    var adresseArrFin = coordArrJson.features[0].center

    return adresseArrFin 
}


// fonction qui permet d'avoir la distance qui sépare les deux adresses en paramètres
async function distanceDepArr(){
    // récupération des addresses de départ et d'arrivé
    const adresseDep = await adresseMag()
    const adresseArr = await adresseUti()

    // appel de l'api pour avoir la distance entre les deux adresses
    var distApi = await fetch("https://api.mapbox.com/directions/v5/mapbox/driving/" + adresseDep[0] + "," + adresseDep[1] + ";" + adresseArr[0] + "," + adresseArr[1] + ".json?access_token=" + mapbox.accessToken)
    const distJson = await distApi.json()
    const distanceFin = distJson.routes[0].distance

    return distanceFin
}


// fonction qui récupère la distance entre l'entreprise et le client et qui calcule le prix à ajouter en fonction de la distance et/ou si le client veut se faire livrer en moins de 72h
async function distancePrix(){
    // récupération de la distance entre l'entreprise et le client
    const distance = await  distanceDepArr()

    // ajout du prix en fonction de la distance (formule du cahier des charges)
    var surplus = Math.round(5 + 0.07 * distance/1000)

    // test de si la date saisie est inférieure à 72h et ajout de 8€ si c'est le cas
    if (Date.parse(document.getElementById("StartTrip").value) <= Date.now()+3*86400000){
        surplus += 8
    }

    return surplus
}


// fonction calculant le prix total en fonction du nombre de jours et du nombre de voyages 
function calculPrixTotal(diffJours) {
    // initialisation de notre variable 
    var prixTotal = 0;

    // boucle pour calculer le prix total 
    for (var i in groupePanier) {
        var prix = calculPrix(groupePanier[i]._destination, groupePanier[i]._indmoTransport, groupePanier[i]._indHotel, groupePanier[i]._indosTransport, groupePanier[i]._indRestauration, diffJours) * groupePanier[i]._quantite;
        if (groupePanier[i]._quantite >= 10) prix *= 0.90;
        prixTotal += prix;
        document.getElementsByClassName("panierTemplate")[parseInt(i) + calculIndPrecedent(i + 1)].getElementsByClassName("price")[0].innerHTML = "Prix total: " + prix + " €";
    }

    // calcul du prix total selon la distance et le temps de livraison
    //prixTotal += distancePrix()

    // changement du prix total affiché
    document.getElementById("TotPrice").innerHTML = "Prix total: " + prixTotal + " €";
}



/*####### page de aboutus #######*/
// fonction pour afficher la map sur la page aboutus 
function mapload() {
    mapboxgl.accessToken = token;


    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [4.848075, 45.782155],
        zoom: 15
    });

    const marker = new mapboxgl.Marker({ color: "rgba(0,0,0,.4)" })
        .setLngLat([4.848075, 45.782155])
        .addTo(map);
}