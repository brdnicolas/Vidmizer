# Vidimizer
Le but de ce projet est de pouvoir intéragir avec les APIs de Azure dans un contexte
de recherche de reconnaissance faciale. Afin d'accéder à notre application, veuillez
renseigner dans le .env les endpoints et clefs API des Apis. Notre application requiert au minimum les
informations des API qui sont suivies d'un [X] dans cette liste:
- Face API (pour la reconnaissance des visages) [X]
- Computer Vision API (pour avoir des informations sur les images) [X]
- Content Moderator API (pour pouvoir estimer le taux familly friendly )

Notre application est disponible en ligne du 12/06 au 24/06 à l'addresse : `http://20.43.59.16/`.
À noter qu'elle tourne sur une VM d'Azure, avec Apache2 pour le front et Pm2 pour le back.
 
## Setup le Front
- Dans le root:`cd front`
- `npm i`
- `npm start`
- Le navigateur s'ouvre pour montrer le résultat de notre app au port 3000


## Setup le Back
- Dans le root: `cd back`
- `source env/bin/activate` (pour mac et linux)
- `pip3 install -r requirements.txt`
- `python3 app.py` 
- Le terminal actuel est utilisé pour host l'api, au port 5000


### Versions utilisées pour le projet
- Python : 3.7.4
- Node : 13.5.0
- Npm : 6.13.4
- Pm2 : 4.4.0

