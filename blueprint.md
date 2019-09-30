FORMAT: 1A


# Visualit API

Cette documentation décrit les fonctionnalités proposées par l'API de Visualit, à savoir la gestion des lits dans un hôpital, et de tous les acteurs qui peuvent influer sur le statut des lits.
Ceci est donc destiné à un public ayant des notions technique en informatique/programmation.
Si ce n'est pas ce que vous cherchez, vous pouvez accéder à la description de visualit, ou au site web.

Afin de faciliter les tests de mises en place de clients utilisant cette API, une version factice de cette API est disponible.


# Data Structures

## Status (enum)
+ Free (string)
+ Busy (string)
+ Leaving (string)


# Services [/services]

Il s'agit ici d'un service d'un point de vue hospitalier, et absolument pas informatique. Autrement dit ce sont les différentes zones ou catégories des lits et/ou de soins que les patients vont recevoir.

Dans le logiciel, un service est un objet composé de:

+ un id
+ un nom

Chaque lit est lié à un service, et les services sont utiles notamment pour triés les lits lors de l'assignation d'un lit à un patient.


## Liste des services [GET]

Cette action renvoit la liste des services de l'hôpital, sous forme de tableau.

+ Response 200 (application/json)

        {
            "services": [
                {
                    "name": "Cardiologie",
                    "id": 1
                },
                {
                    "name": "Urgences",
                    "id": 2
                },
                {
                    "name": "Radiologie",
                    "id": 4
                },
                {
                    "name": "Pédiatrie",
                    "id": 7
                },
                {
                    "name": "Maternité",
                    "id": 8
                }
            ]
        }


# Lits [/beds]

Insérer une description ici.


## Liste des lits [GET]

+ Request chambres à nettoyer par service (application/json)

    + Attributes
        + services_id: 1 (array[number], optional)
        + status (array[Status], optional)
        + toClean: true (boolean, optional)

+ Response 200 (application/json)

        {
            "beds": [
                {
                    "bed_id": 1,
                    "service_id": 1,
                    "status": "Free",
                    "to_clean": true
                    "display_name": "Chambre 402",
                },
                {
                    "bed_id": 1053,
                    "service_id": 1,
                    "status": "Leaving",
                    "to_clean": true
                    "display_name": "Chambre 322",
                },
                {
                    "bed_id": 321,
                    "service_id": 1,
                    "status": "Busy",
                    "to_clean": true
                    "display_name": "Chambre 107",
                }
            ]
        }

+ Request chambres libres par service (application/json)

    + Attributes
        + services_id: 7, 8 (array[number], optional)
        + status: Free (array[Status], optional)
        + toClean (boolean, optional)

+ Response 200 (application/json)

        {
            "beds": [
                {
                    "bed_id": 7,
                    "service_id": 7,
                    "status": "Free",
                    "to_clean": true
                    "display_name": "Chambre 402",
                },
                {
                    "bed_id": 1053,
                    "service_id": 7,
                    "status": "Leaving",
                    "to_clean": false
                    "display_name": "Chambre 32",
                },
                {
                    "bed_id": 321,
                    "service_id": 7,
                    "status": "Busy",
                    "to_clean": false
                    "display_name": "Chambre 109",
                },
                {
                    "bed_id": 321,
                    "service_id": 8,
                    "status": "Busy",
                    "to_clean": false
                    "display_name": "Chambre 203",
                },
                {
                    "bed_id": 321,
                    "service_id": 8,
                    "status": "Busy",
                    "to_clean": true
                    "display_name": "Chambre 315",
                }
            ]
        }

+ Request Invalid (application/json)

    Exemple de requete invalide, avec un des statut ne correspondant pas à un statut connu.

    + Attributes
        + services_id: 1 (array[number], optional)
        + status: InvalidString, Busy, Leaving (array[Status], optional)
        + to_clean: true (boolean, optional)

+ Response 400 (application/json)

        {
            "error": "The field x does not meet the requirement y"
        }

## Informations d'un lit [GET /beds/{bed_id}]

+ Parameters

    + bed_id: 1 (number, required) - l'id du lit en question

+ Request valide (application/json)

+ Response 200 (application/json)

    + Attributes
        + service_id: 1 (number)
        + status: Free (Status)
        + to_clean: false (boolean)
        + display_name: `Chambre 420` (string)

+ Request id du lit invalide

+ Response 404

## Modification de l'état d'un lit [POST /beds/{bed_id}/status]

+ Parameters

    + bed_id: 1 (number, required) - l'id du lit en question

+ Request état libre (application/json)

    + Attributes
        + status: Free (Status)

+ Response 204

        {}

## Modification de la propreté d'un lit [POST /beds/{bed_id}/clean]

+ Parameters

    + bed_id: 1 (number, required) - l'id du lit en question

+ Request lit nettoyé (application/json)

    + Attributes
        + to_clean: false (boolean)

+ Response 204
        
        {}


## Modification d'un lit [PUT /beds/{bed_id}]

+ Parameters

    + bed_id: 1 (number, required) - l'id du lit en question

+ Request modification du lit (application/json)

    + Attributes
        + status: Free (Status)
        + to_clean: false (boolean)
        + display_name: `Chambre 420` (string)

+ Response 204
        
        {}