# Projet TLW site de vente

Pour lancer le serveur, le faire depuis le fichier ``index.html``

Pour faire fonctionner les carte (utilisant l'API mapbox), merci de mettre une clé d'API dans les fichiers suivant:
- ``map/mapscript.js``, ligne 1, const token
- ``js/script.js``, ligne 1, const token


## Objectif

Réaliser un site de vente de voyage à deux (pour de courts séjours / lune de miel).
Avec:

- possibilité de choisir un voyage (affichage dans des templates)
- possibilité de filtrer le voyage

- possibilité de personnalisation du voyage (avec plusieurs options)
- affichage de celui-ci en direct, selon les options, sur une carte (dans un iframe - API mapbox)
- affichage d'une carte personnalisé selon les options (canvas)
- enregistrement des voyages déjà personnalisé en direct pour pouvoir revenir sur la page avec la personnalisation
- calcul en direct du prix du voyage selon les options

- possibilité de remplir un formulaire et de vérifier la validité de celui-ci
- calcul du prix total en direct avec gestion de la quantité, des options, du nombre de jour et de la distance pour envoyer la carte voyage

+ site responsive
+ toutes les images/vidéos sont libre de droit


## Plan des fichiers et de leur comptenu

- index.html -> page d'accueil


- dossier pages:
    - aboutus.html -> page about us et contact
    - payment.html -> page de paiement du produit personnalisé (avec la livraison...)
    - personalisation.html -> page de personnalisation du produit sélectionné


- doosier map :
    - mapmain.html -> page d'affichage de la map
    - mapstyle.css -> feuille de style de la map
    - mapscript.js -> script de la map
    - mapbarcelonedata.json -> données de la map (les points pour Barcelone)
    - mapmilandata.json -> données de la map (les points pour Milan)
    - mapnaplesdata.json -> données de la map (les points pour Naples)
    - dossier icons:
        - airport.png -> icon d'aéroport
        - bus.png -> icon de bus
        - lodging.png -> icon d'hôtel
        - rail.png -> icon de train
        - restaurant.png -> icon de restaurant


- dossier js:
    - scripts.js -> scripts de toutes les pages
    - datas.json -> données sur les voyages enregistré en un endroit
    - headerfooter.json -> donnée html pour les header et footer de chaque page


- dossier css:
    - stylesheet -> feuille de style de toutes les pages


- dossier images-videos:
    - brandIcon.png -> icon de la marque
    - brandVideo.mp4 -> vidéo de fond de la page d'accueil
    - background.jpg -> image de fond des pages (photo de la mer)
    - cartevoyage.png -> image de la carte utilisé pour le canvas
    - max.png -> image d'illustration
    - val.png -> image d'illustration
    - icons:
        - car.jpg -> icon de voiture utilisé dans la page de personnalisation
        - hotel.jpg -> icon d'hotel utilisé dans la page de personnalisation
        - plane.jpg -> icon d'avion utilisé dans la page de personnalisation
        - restaurant.jpg -> icon de restaurant utilisé dans la page de personnalisation
    - barcelone:
        - barim1.jpg -> première image pour la page de personnalisation
        - barim2.jpg -> deuxième image pour la page de personnalisation
        - barim3.jpg -> troisième image pour la page de personnalisation
        - barmain.jpg -> image pour la page d'accueil
    - milan:
        - milim1.jpg -> première image pour la page de personnalisation
        - milim2.jpg -> deuxième image pour la page de personnalisation
        - milim3.jpg -> troisième image pour la page de personnalisation
        - milmain.jpg -> image pour la page d'accueil
    - naples:
        - napim1.jpg -> première image pour la page de personnalisation
        - napim2.jpg -> deuxième image pour la page de personnalisation
        - napim3.jpg -> troisième image pour la page de personnalisation
        - napmain.jpg -> image pour la page d'accueil