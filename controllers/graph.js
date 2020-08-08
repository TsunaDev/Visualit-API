const { v4: uuidv4 } = require('uuid');
const neo4j = require('neo4j-driver').v1;
const dbURI = process.env.DB_URI;
const driver = neo4j.driver(dbURI, neo4j.auth.basic("neo4j", "test")); // TODO: Intégrer les ID et URI de façon plus modulable

/**
 * Cette fonction permet de faire une requête sur le graphe Neo4J et de récupérer le premier résultat. 
 * @param {string} request La requête à envoyer au graphe.
 * @param {function} callback La fonction qui sera appelée en conséquence. Cette dernière recevra un JSON en paramètre contenant un bool "status" vrai ou faux en fonction du succès de la requête et une variable "value" contenant la réponse de Neo4J.
 */
function GraphCall(request, callback) {
  const session = driver.session();

  return session.run(request).then(res => {
    session.close();
    if (res.records && res.records.length) {
      callback({status: true, value: res.records[0].get(0)});
    } else
      callback({status: false, value: {name: "InputError", code: "No record found."}});
  }).catch(function(error) {
    callback({status: false, value: error});
  });
}

/**
 * Créer une string à partir d'un paramètre et de sa valeur. Cette string peut alors être utilisée dans une requête à Neo4J pour SET le paramètre en question.
 * @param {string} key Nom du paramètre.
 * @param {string} value Nouvelle valeur du paramètre.
 * @returns {string} La string que Neo4J peut comprendre.
 */
function setPropertyString(key, value) {
  if (typeof(value) === 'string')
    value = '"' + value + '"';
  return "u." + key + " = " + value.toString();
}

/**
 * Créer une string permettant de SET tous les paramètres souhaités en une seule requête Neo4J.
 * @param {array} properties Liste des propriétés avec leur nouvelle valeur. 
 * @returns {string} La string avec le contenu de la commande SET.
 */
function setProperties(properties) {
  let str = "";
  
  for (key in properties) { str += (setPropertyString(key, properties[key]) + ", ")}

  return str.slice(0, -2);
}

var transformIntegers = function(result) {
  return new Promise( (resolve,reject) => {
    try {
      result.records.forEach( function(row, i) {
        row.forEach( function(col, k) {
        col.forEach( function(dim_x, l) {
        Object.keys(dim_x).forEach( function(j) {
          result.records[i]._fields[0][l][j] = neo4j.isInt(dim_x[j])
              ? (neo4j.integer.inSafeRange(dim_x[j]) ? dim_x[j].toNumber() : dim_x[j].toString())
              : dim_x[j];
        })
        })
      })
      })
      resolve(result);
    } catch (error) {
        reject( error );
    }
  });
};


function GraphCallTransformInteger(request, callback) {
  const session = driver.session();

  return session.run(request).then(transformIntegers).then(res => {
    session.close();
    if (res.records && res.records.length) {
      callback({status: true, value:
      res
		.records[0].get(0)});
    } else
      callback({status: false, value: {name: "InputError", code: "No record found."}});
  }).catch(function(error) {
    callback({status: false, value: error});
  });
}

module.exports = {
  /**
   * Crée un utilisateur
   * @param {string} username Nom de l'utilisateur à créer.
   * @param {string} password Mot de passe de l'utilisateur à créer.
   * @param {number} role Role de l'utilisateur à créer.
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  createUser: (username, password, role, callback) => {
    return GraphCall('MATCH (r:Role) WHERE r.index = "' + role + '" CREATE (u:User {name: "' + username + '", password: "' + password + '"})-[:ROLE]->(r) RETURN u', callback);
  },

  /**
   * Récupère un utilisateur en fonction de son nom.
   * @param {string} username Nom de l'utilisateur à récupérer.
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  getUser: (username, callback) => {
    return GraphCall('MATCH (u:User)-[ROLE]->(r:Role) WHERE u.name = "' + username + '" RETURN collect(u {.*, role:r.index})', callback);
  },

  /**
   * Récupère tous les utilisateurs du système.
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  getAllUsers: (callback) => {
    const request = 'MATCH (u:User)-[ROLE]->(r:Role) RETURN collect(u {.*, role:r.index})';
    const session = driver.session();

    return session.run(request).then(res => {
      session.close();

      let entries = [];
      if (res.records && res.records.length) {
        res.records[0].get(0).forEach((record, index) => {
          let user = record;
          user.role = user.role.low;
          delete user.password;

          entries.push(user);
        });
        callback({status: true, value: entries});
      } else
        callback({status: false, value: {name: "InputError", code: "No record found."}});
    }).catch(function(error) {
      callback({status: false, value: error});
    });
  },

  /**
   * Récupère les permissions d'un utilisateur.
   * @param {string} username Nom de l'utilisateur.
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  getUserPermissions: (username, callback) => {
    return GraphCall('MATCH (u:User {name: "' + username + '"})-[:ROLE]-(r) RETURN r.permissions', callback);
  },

  /**
   * Récupère le rôle d'un utilisateur.
   * @param {string} username Nom de l'utilisateur.
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  getUserRole: (username, callback) => {
    return GraphCall('MATCH (u:User {name: "' + username + '"})-[:ROLE]-(r) RETURN r.index', callback);
  },

  /**
   * Met à jour les informations d'un utilisateur sur le graphe.
   * @param {string} username Nom de l'utilisateur.
   * @param {json} properties Les propriétés à modifier.
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  updateUser: (username, properties, callback) => {
    return GraphCall('MATCH (u:User {name: "' + username + '"}) SET ' + setProperties(properties) + ' RETURN u', callback);
  },

  /**
   * Supprime l'utilisateur sur le graphe.
   * @param {string} username Nom de l'utilisateur.
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  deleteUser: (username, callback) => {
    const request = 'MATCH (u:User {name: "' + username + '"}) OPTIONAL MATCH (u)-[r]-() DELETE r, u'
    const session = driver.session();

    return session.run(request).then(res => {
      session.close();
      callback({status: true, value: {}});
    }).catch(function(error) {
      callback({status: false, value: error});
    });
  },

  // Roles

  /** 
   * Crée un rôle sur le graphe.
   * @param {string} role Nom du rôle.
   * @param {string} index Index du rôle.
   * @param {array} permissions Liste des permissions
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  createRole: (role, index, permissions, callback) => {
    return GraphCall('CREATE (r:Role {name: "' + role + '", index: "' + index + '", permissions: ' + JSON.stringify(permissions) + '}) RETURN r', callback);
  },

  /**
   * Récupère un rôle sur le graphe.
   * @param {string} role Nom du rôle.
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  getRole: (role, callback) => {
    return GraphCall('MATCH (r:Role) WHERE r.name = "' + role + '" RETURN r', callback);
  },

  /**
   * Récupère un rôle avec son index.
   * @param {number} index Index du rôle
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  getRoleByIndex: (index, callback) => {
    return GraphCall('MATCH (r:Role) WHERE r.index = "' + index + '" RETURN r', callback);
  },

  /**
   * Récupère tous les rôles existants sur le graphe.
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  getAllRoles: (callback) => {
    const request = 'MATCH (r:Role) RETURN r';
    const session = driver.session();

    return session.run(request).then(res => {
      session.close();

      let entries = [];
      if (res.records && res.records.length) {
        res.records.forEach((record, index) => {  
          entries.push(record.get(0).properties);
        });
        callback({status: true, value: entries});
      } else
        callback({status: false, value: {name: "InputError", code: "No record found."}});
    }).catch(function(error) {
      callback({status: false, value: error});
    });
  },

  /**
   * Met à jour un rôle.
   * @param {string} role Nom du rôle.
   * @param {array} properties Liste des propriétés à modifier.
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  updateRole: (role, properties, callback) => {
    return GraphCall('MATCH (u:Role {name: "' + role + '"}) SET ' + setProperties(properties) + ' RETURN u', callback);
  },

  
  /**
   * Met à jour un rôle en l'identifiant par son index.
   * @param {number} index Index du rôle.
   * @param {array} properties Liste des propriétés à modifier.
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  updateRoleByIndex: (index, properties, callback) => {
    return GraphCall('MATCH (u:Role {index: "' + index + '"}) SET ' + setProperties(properties) + ' RETURN u', callback);
  },

  /**
   * Supprime un rôle du graphe.
   * @param {string} role Nom du rôle
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  deleteRole: (role, callback) => {
    const request = 'MATCH (r:Role {name: "' + role + '"}) OPTIONAL MATCH (r)-[u]-() DELETE r, u'
    const session = driver.session();

    return session.run(request).then(res => {
      session.close();
      callback({status: true, value: {}});
    }).catch(function(error) {
      callback({status: false, value: error});
    });
  },

  /**
   * Supprime un rôle du graphe en l'identifiant par son index.
   * @param {number} index Index du rôle.
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  deleteRoleByIndex: (index, callback) => {
    const request = 'MATCH (r:Role {index: "' + index + '"}) OPTIONAL MATCH (r)-[u]-() DELETE r, u'
    const session = driver.session();

    return session.run(request).then(res => {
      session.close();
      callback({status: true, value: {}});
    }).catch(function(error) {
      callback({status: false, value: error});
    });
  },

  // ROOMS

  /**
   * Crée une chambre sur le graphe
   * @param {string} number Numéro de la chambre
   * @param {number} service_id ID du service dans lequel se trouve la chambre
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  createRoom: (number, service_id, callback) => {
    return GraphCall('MATCH (s:Service) WHERE ID(s) = ' + service_id + ' CREATE (r:Room {number: "' + number + '"})-[:SERVICE]->(s) RETURN r', callback);
  },

  /**
   * Modifie le numéro d'une chambre.
   * @param {string} number Ancien numéro de la chambre permettant de l'identifier.
   * @param {string} new_number Nouveau numéro.
   * @param {number} service_id ID du service dans lequel se trouve la chambre.
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  modifyRoomNumber: (number, new_number, service_id, callback) => {
    return GraphCall('MATCH (r:Room {number: "' + number + '"})-[:SERVICE]-(s) WHERE ID(s) = ' + service_id + ' SET r.number = "' + new_number + '" RETURN r', callback);
  },

  /**
   * Modifie le service auquel la chambre appartient.
   * @param {string} number Numéro de la chambre.
   * @param {number} service_id ID actuel du service.
   * @param {number} new_service_id Nouvel ID.
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  modifyRoomService: (number, service_id, new_service_id, callback) => {
    return GraphCall('MATCH (r:Room {number: "' + number + '"})-[rel:SERVICE]-(s) WHERE ID(s) = ' + service_id + ' MATCH (s2:Service) WHERE ID(s2) = ' + new_service_id + ' MERGE (r)-[:SERVICE]->(s2) DELETE rel RETURN r', callback);
  },

  /**
   * Récupère une chambre.
   * @param {string} number Numéro de la chambre
   * @param {number} service_id ID du service de la chambre.
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  getRoom: (number, service_id, callback) => {
    const session = driver.session();
    const request = 'MATCH (r:Room {number: "' + number + '"})-[:SERVICE]-(s) WHERE ID(s) = ' + service_id + ' OPTIONAL MATCH (b:Bed)-[:ROOM]-(r) RETURN r AS room, s AS service, collect(b) AS beds';

    return session.run(request).then(res => {
      session.close();
      if (res.records && res.records.length) {
        let beds = [];
        res.records[0].get("beds").forEach((bed, _index) => {
          bed.properties.status = parseInt(bed.properties.status);
          beds.push(bed.properties);
        });
        callback({status: true, value: {number: res.records[0].get("room").properties.number, service_id: res.records[0].get("service").identity.low, beds: beds}});
      } else
        callback({status: false, value: {name: "InputError", code: "No record found."}});
    }).catch(function(error) {
      callback({status: false, value: error});
    });
  },

  /**
   * Supprime une chambre.
   * @param {string} number Numéro de la chambre.
   * @param {number} service_id ID du service auquel la chambre est affilié.
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  deleteRoom: (number, service_id, callback) => {
    const request = 'MATCH (r:Room {number: "' + number + '"})-[:SERVICE]-(s) WHERE ID(s) = ' + service_id + ' OPTIONAL MATCH (b:Bed)-[:ROOM]-(r) DETACH DELETE b, r';
    const session = driver.session();

    return session.run(request).then(res => {
      session.close();
      callback({status: true, value: {}});
    }).catch(function(error) {
      callback({status: false, value: error});
    });
  },

  /**
   * Récupère l'ensemble des chambres présentes sur le graphe.
   * @param {string} service_id (optionnel) ID du service pour lequel on veut récupérer les chambres.
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  listRooms: (service_id, callback) => {
    let add = '';

    if (service_id)
      add = 'WHERE ID(s) = ' + service_id
    
    let request = "MATCH (r:Room)-[:SERVICE]-(s) " + add + " OPTIONAL MATCH (b:Bed)-[:ROOM]-(r) RETURN r AS room, s AS service, collect(b) AS beds";
    const session = driver.session();

    return session.run(request).then(res => {
      session.close();
      let entries = [];
      if (res.records && res.records.length) {
        res.records.forEach((record, _index) => {  
          let beds = [];
          record.get("beds").forEach((bed, _index2) => {
            bed.properties.status = parseInt(bed.properties.status);
            beds.push(bed.properties);
          });
          entries.push({number: record.get("room").properties.number, service_id: record.get("service").identity.low, beds: beds});
        });
        callback({status: true, value: entries});
      } else
        callback({status: false, value: {name: "InputError", code: "No record found."}});
    }).catch(function(error) {
      callback({status: false, value: error});
    });
  },

  // BEDS

  /**
   * Crée un lit.
   * @param {string} room_nb Le numéro de la chambre dans lequel le lit se trouve
   * @param {number} service_id ID du service de la chambre.
   * @param {number} status Statut de la chambre (libre, occupée, ...).
   * @param {bool} to_clean Booléen true si la chambre est à nettoyer et false si elle est propre.
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  createBed: (room_nb, service_id, status, to_clean, callback) => {
    return GraphCall('MATCH (r:Room {number: "' + room_nb + '"})-[:SERVICE]-(s:Service) WHERE ID(s) = ' + service_id + ' CREATE (b:Bed {uuid: "' + uuidv4() + '", status: "' + status + '", to_clean: ' + to_clean + '})-[:ROOM]->(r) RETURN b', callback)
  },

  /**
   * Supprime un lit.
   * @param {string} bed_uuid UUID du lit.
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  deleteBed: (bed_uuid, callback) => {
    const request = 'MATCH (b:Bed {uuid: "' + bed_uuid + '"}) DETACH DELETE b';
    const session = driver.session();

    return session.run(request).then(res => {
      session.close();
      callback({status: true, value: {}});
    }).catch(function(error) {
      callback({status: false, value: error});
    });
  },

  /**
   * Récupère un lit.
   * @param {string} bed_uuid UUID du lit.
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  getBed: (bed_uuid, callback) => {
    return GraphCall('MATCH (b:Bed {uuid: "' + bed_uuid + '"})-[:ROOM]-(r)-[:SERVICE]-(s) RETURN collect(b {.*, service_id:ID(s), room_nb:r.number})', callback);
  },

  /**
   * Défini si le lit est à nettoyer ou non.
   * @param {string} bed_uuid UUID du lit.
   * @param {bool} value true si à nettoyer, false dans la cas contraire.
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  modifyClean: (bed_uuid, value, callback) => {
    return GraphCall('MATCH (b:Bed {uuid: "' + bed_uuid + '"}) SET b.to_clean = ' + value + ' RETURN b', callback);
  },

  /**
   * Change le status du lit.
   * @param {string} bed_uuid UUID du lit.
   * @param {number} value Nouveau statut du lit.
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  modifyStatus: (bed_uuid, value, callback) => {
    return GraphCall('MATCH (b:Bed {uuid: "' + bed_uuid + '"}) SET b.status = "' + value + '" RETURN b', callback);
  },

  /**
   * Change le lit de chambre.
   * @param {string} bed_uuid UUID du lit.
   * @param {string} room_nb Numéro de la nouvelle chambre
   * @param {number} service_id ID du service dans lequel se trouve la chambre
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  modifyBedRoom: (bed_uuid, room_nb, service_id, callback) => {
    return GraphCall('MATCH (r:Room {number: "' + room_nb + '"})-[:SERVICE]-(s:Service) WHERE ID(s) = ' + service_id + ' MATCH (b:Bed {uuid: "' + bed_uuid + '"})-[rel:ROOM]-(r2) MERGE (b)-[:ROOM]->(r) DELETE rel RETURN b', callback);
  },

  /**
   * Récupère la liste de tous les lits en fonction de filtres.
   * @param {string} room_nb (optionnel) Chambre spécifique pour laquel on veut récupérer les lits. (service_id doit être renseigné)
   * @param {string} service_id (optionnel) Service spécifique pour lequel récupérer les lits.
   * @param {number} status (optionnel) Filtre par statut.
   * @param {to_clean} to_clean (optionnel) Filtre les chambres nettoyés ou non.
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  listBeds: (room_nb, service_id, status, to_clean, callback) => {
    let query = "MATCH (b:Bed {";
    
    if (status && typeof status !== "undefined")
      query += 'status: "' + status + '",';
    if (to_clean && typeof to_clean === "boolean")
      query += 'to_clean: ' + to_clean + ',';
    if (query.slice(-1) == ",")
      query = query.slice(0, -1);
    query += "})-[:ROOM]-(r)-[:SERVICE]-(s) ";

    if (room_nb && service_id)
      query += 'WHERE ID(s) = ' + service_id + ' AND r.number = ' + room_nb;
    else if (service_id)
      query += 'WHERE ID(s) = ' + service_id + ' ';
    query += " RETURN r AS room, s AS service, b AS bed";
    
    const session = driver.session();

    return session.run(query).then(res => {
      session.close();

      let entries = [];
      if (res.records && res.records.length) {
        res.records.forEach((record, index) => {  
          entries.push({uuid: record.get("bed").properties.uuid, room: record.get("room").properties.number, service: record.get("service").identity.low, status: parseInt(record.get("bed").properties.status, 10), to_clean: record.get("bed").properties.to_clean});
        });
        callback({status: true, value: entries});
      } else
        callback({status: false, value: {name: "InputError", code: "No record found."}});
    }).catch(function(error) {
      callback({status: false, value: error});
    });
  },

	// SERVICES

  /**
   * Crée un service.
   * @param {string} name Nom du service
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  createService: (name, callback) => {
    return GraphCall('CREATE (s:Service {name: "' + name + '"}) RETURN s', callback);
  },

  /**
   * Met à jour un service.
   * @param {string} name Nouveau nom pour le service.
   * @param {number} service_id ID du service.
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  modifyService: (name, service_id, callback) => {
  	return GraphCall("MATCH (s:Service) WHERE ID(s) = " + service_id + " SET s.name = \"" + name + "\" RETURN s", callback);
  },

  /**
   * Supprime un service
   * @param {number} service_id ID du service.
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  deleteService: (service_id, callback) => {
   	GraphCall("MATCH (b:Bed)-[r:SERVICE]->(s:Service) WHERE ID(s) = " + service_id + " SET b.old = ID(s), b.oldName = s.name DELETE r", (r) => {});
  	return GraphCall("MATCH (s:Service) WHERE ID(s) = " + service_id + " SET s: Deleted RETURN s", callback);
  },

  /**
   * Récupère la liste des services.
   * @param {function} callback Fonction de callback qui sera appelée lorsque la requête sera achevée. Le callback recevra en paramètre un JSON contenant la réponse de la requête.
   */
  listServices: (callback) => {
    return GraphCallTransformInteger('MATCH (s:Service) WHERE NOT s:Deleted RETURN collect(s {.*, id: ID(s)})', callback);
  },
}
