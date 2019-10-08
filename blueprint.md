FORMAT: 1A


# Visualit API

Cette documentation décrit les fonctionnalités proposées par l'API de Visualit, à savoir la gestion des lits dans un hôpital, et de tous les acteurs qui peuvent influer sur le statut des lits.
Ceci est donc destiné à un public ayant des notions technique en informatique/programmation.
Si ce n'est pas ce que vous cherchez, vous pouvez accéder à la description de visualit, ou au site web.

Afin de faciliter les tests de mises en place de clients utilisant cette API, une version factice de cette API est disponible.

Cette API est divisée en 3 sous parties principales:


## Services

Il s'agit ici d'un service d'un point de vue hospitalier, et absolument pas informatique. Autrement dit ce sont les différentes zones ou catégories des lits et/ou de soins que les patients vont recevoir.

Dans le logiciel, un service est un objet composé de:

+ un id
+ un nom

Chaque lit est lié à un service, et les services sont utiles notamment pour triés les lits lors de l'assignation d'un lit à un patient.


## Lits

Les lits désignent de manière générale un emplacement pouvant accepter un patient.

Les lits sont liés à un service

Chaque lit peut être de trois statuts différents:

- *Free*    : Le lit n'est pas occupé
- *Busy*    : Le lit est occupé
- *Leaving* : Le patient peut quitter la chambre. Il s'agit d'un état transitoire entre *Busy* et *Free*, mais non obligatoire.

Chaque lit peut également avoir besoin d'être nettoyé ou non. Cela est indiqué par le booléen *to_clean*.

*display_name* est le nom du lit que verra le personnel de l'hôpital.


## Utilisateurs

Les utilisateurs du logiciel Visualit, peuvent être de 4 types différents:

- *Admin* : L'administrateur, il possède tous les droits décrits dans cette documentation, notamment sur les autres comptes utilisateurs, et services.
- *Manager* : Le chef de service a tous les droits sur les lits concernants son service.
- *Cleaner* : Le personnel d'entretien a les droits de modification du status de propreté d'une chambre.
- *Nurse* : Les infirmiers peuvent modifier les états des lits (propreté et occupation)


## Erreurs
Les [statuts d'erreur http](https://github.com/for-GET/know-your-http-well/blob/master/status-codes.md) sont utilisés.

# Data Structures

## Status (enum)
+ Free (string)
+ Busy (string)
+ Leaving (string)

## User (enum)
+ Admin (string)
+ Manager (string)
+ Cleaner (string)
+ Nurse (string)

# Services [/services]


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


## Création d'un service [POST]

+ Request service à rajouter (application/json)

    + Attributes
        + name: `Maternité` (string, required)

+ Response 201

        {}


## Suppression d'un service [DELETE /services/{service_id}]

+ Parameters

    + service_id: 1 (number, required) - l'id du lit à supprimer

+ Request ID valide (application/json)

+ Response 204

        {}

+ Request ID invalide (application/json)

+ Response 404

        {}


## Modification d'un service [PUT /services/{service_id}]

+ Parameters

    + service_id: 1 (number, required) - l'id du lit à modifier

+ Request modifications (application/json)

    + Attributes
        + name: `Pédiatrie` (string, required) - nouveau nom du service

+ Response 204

        {}


# Lits [/beds]


## Liste des lits [GET /beds{?services_id}{?status}{?to_clean}]

+ Parameters
    + services_id: 1 (array[number], optional) - renvoie les lits appartenant au service en question. Si plusieurs ID sont demandés, le résultat final sera l'union des résultats séparés.
    + status: Leaving, Busy (array[Status], optional) - renvoie les lits correspondants à cet état. Si plusieurs états sont demandés, le résultat final sera l'union des résultats séparés.
        + Default: Free, Busy, Leaving
    + to_clean: true (boolean, optional) - filtre les lits en fonction de leur état de nettoyage.

+ Request chambres à nettoyer par service (application/json)

    + Attributes
        + services_id: 1 (number, optional)
        + status: Free (array[Status], optional)

+ Response 200 (application/json)

        {
            "beds": [
                {
                    "bed_id": 1,
                    "service_id": 1,
                    "status": "Free",
                    "to_clean": true,
                    "display_name": "Chambre 402",
                },
                {
                    "bed_id": 1053,
                    "service_id": 1,
                    "status": "Leaving",
                    "to_clean": true,
                    "display_name": "Chambre 322",
                },
                {
                    "bed_id": 321,
                    "service_id": 1,
                    "status": "Busy",
                    "to_clean": true,
                    "display_name": "Chambre 107",
                }
            ]
        }

+ Request chambres libres par service (application/json)

    + Attributes
        + services_id: 7, 8 (array[number], optional)
        + status: Free (array[Status], optional)
        + to_clean: true (boolean, optional)

+ Response 200 (application/json)

        {
            "beds": [
                {
                    "bed_id": 7,
                    "service_id": 7,
                    "status": "Free",
                    "to_clean": true,
                    "display_name": "Chambre 402",
                },
                {
                    "bed_id": 1053,
                    "service_id": 7,
                    "status": "Leaving",
                    "to_clean": false,
                    "display_name": "Chambre 32",
                },
                {
                    "bed_id": 321,
                    "service_id": 7,
                    "status": "Busy",
                    "to_clean": false,
                    "display_name": "Chambre 109",
                },
                {
                    "bed_id": 321,
                    "service_id": 8,
                    "status": "Busy",
                    "to_clean": false,
                    "display_name": "Chambre 203",
                },
                {
                    "bed_id": 321,
                    "service_id": 8,
                    "status": "Busy",
                    "to_clean": true,
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

    + bed_id: 10 (number, required) - l'id du lit en question

+ Request valide (application/json)

+ Response 200 (application/json)

    + Attributes
        + bed_id: 10 (number)
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

    + bed_id: 1 (number, required) - l'id du lit à modifier

+ Request modification du lit (application/json)

    + Attributes
        + status: Free (Status)
        + to_clean: false (boolean)
        + display_name: `Chambre 420` (string)
        + service_id: 1 (number)

+ Response 204
        
        {}


## Création d'un lit [POST]

+ Request

    + Attributes
        + service_id: 1 (number) - L'id du service auquel le lit est associé
        + status: Free (Status, optional) - L'état du nouveau lit
            + Default: Free
        + to_clean: false (boolean, optional) - Indique si le lit doit être nettoyé ou non
            + Default: false
        + display_name: `Chambre 420` (string) - Nom du lit que le personnel hospitalier verra

+ Response 201

        {}

## Suppression d'un lit [DELETE /beds/{bed_id}]

+ Parameters

    + bed_id: 1 (number, required) - l'id du lit à supprimer

+ Response 204

        {}

# Utilisateurs [/users]

## Connexion [POST /users/login]

Il s'agit de la seule action disponible lorsqu'un utilisateur n'est pas connecté.
Toutes les actions qu'il effectuera par la suite sera donc liée à son compte.

+ Request valide (application/json)

    + Attributes
        + type: Admin (User) - Le type d'utilisateur demandé
        + username: john.doe - Le nom de l'utilisateur
        + password: password - Le mot de passe

+ Response 204 (application/json)

        {}

+ Request invalide (application/json)

    + Attributes
        + type: Admin (User) - Le type d'utilisateur demandé
        + username: john.doe - Le nom de l'utilisateur
        + password: wrongpassword - Un mauvais mot de passe

+ Response 401 (application/json)

        {}


## Déconnexion [POST /users/logout]

Déconnecte l'utilisateur.

+ Request utilisateur connecté (application/json)

+ Response 204 (application/json)

        {}

+ Request utilisateur non connecté (application/json)

+ Response 403 (application/json)

        {}


## Creation d'un utilisateur [POST /users]

Créé un compte utilisateur

+ Request (application/json)

    + Attributes
        + type: Cleaner (User) - Le type d'utilisateur à créer
        + username: john.doe (string) - Le nom de l'utilisateur
        + password: wrongpassword (string) - Le mot de passe


+ Response 201 (application/json)

        {}

## List des utilisateurs [GET /users{?type}{?offset}{?limit}]

Permet de récupérer/filtrer tous les utilisateurs.

+ Parameters
    + type: Cleaner (User, optional) - Le type d'utilisateur
    + offset: 40 (number, optional) - Le nombre de résultats correspondant à la requête à ignorer
        - Default: 0
    + limit: 20 (number, optional) - Le nombre maximum de résultats à retourner en réponse de la requếte.
        - Default: 20

+ Request avec des droits administrateur (application/json)

+ Response 200 (application/json)

        {
            "users": [
                {
                    "id": 12,
                    "type": "Cleaner",
                    "username": "john.doe",
                    "password": "xxxxxx"
                }
            ],
            "offset": 20
        }

+ Request avec des droits normaux (application/json)

+ Response 200 (application/json)

        {
            "users": [
                {
                    "id": 12,
                    "type": "Cleaner",
                    "username": "john.doe"
                }
            ],
            "offset": 20
        }
 
## Suppression d'un utilisateur [DELETE /users/{user_id}]

Supprime un utilisateur.

+ Parameters

    + user_id: 1 (number, required) - l'id de l'utilisateur à supprimer

+ Request (application/json)

+ Response 204 (application/json)

        {}

## Modification d'un utilisateur [PUT /users/{user_id}]

Modifie un utilisateur

+ Parameters

    + user_id: 1 (number, required) - l'id de l'utilisateur à modifier

+ Request (application/json)

    + Attributes
        + username: john.smith (string, optional) - Le nouveau nom de l'utilisateur
        + password: password (string, optional) - Le nouveau mot de passe
        
+ Response 204 (application/json)

## Informations d'un utilisateur [GET /users/{user_id}]

Récupère les informations d'un utilisateur. Sera probablement utile plus tard lorsque l'utilisateur contiendra les informations de ses actions, etc.

+ Parameters

    + user_id: 1 (number, required) - l'id de l'utilisateur

+ Request (application/json)

+ Response 200

    + Attributes
        + user_id: 1 (number) - L'id de l'utilisateur
        + type: Cleaner (User) - Le type d'utilisateur à créer
        + username: john.doe (string) - Le nom de l'utilisateur
        + password: password (string) - Le mot de passe
       

