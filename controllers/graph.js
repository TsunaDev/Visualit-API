const { v4: uuidv4 } = require('uuid');
const neo4j = require('neo4j-driver').v1;
const dbURI = process.env.DB_URI;
const driver = neo4j.driver(dbURI, neo4j.auth.basic("neo4j", "test")); // TODO: Intégrer les ID et URI de façon plus modulable


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

function setPropertyString(key, value) {
  if (typeof(value) === 'string')
    value = '"' + value + '"';
  return "u." + key + " = " + value.toString();
}

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
  createUser: (username, password, role, callback) => {
    return GraphCall('MATCH (r:Role) WHERE r.index = "' + role + '" CREATE (u:User {name: "' + username + '", password: "' + password + '"})-[:ROLE]->(r) RETURN u', callback);
  },

  getUser: (username, callback) => {
    return GraphCall('MATCH (u:User)-[ROLE]->(r:Role) WHERE u.name = "' + username + '" RETURN collect(u {.*, role:r.index})', callback);
  },

  getAllUsers: (callback) => {
    const request = 'MATCH (u:User) RETURN u';
    const session = driver.session();

    return session.run(request).then(res => {
      session.close();

      let entries = [];
      if (res.records && res.records.length) {
        res.records.forEach((record, index) => {
          let user = record.get(0).properties;
          user.role = parseInt(user.role, 10);
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

  getUserRole: (username, callback) => {
    return GraphCall('MATCH (u:User {name: "' + username + '"})-[:ROLE]-(r) RETURN r.index', callback);
  },

  updateUser: (username, properties, callback) => {
    return GraphCall('MATCH (u:User {name: "' + username + '"}) SET ' + setProperties(properties) + ' RETURN u', callback);
  },

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

  createRole: (role, index, callback) => {
    return GraphCall('CREATE (r:Role {name: "' + role + '", index: "' + index + '"}) RETURN r', callback);
  },

  getRole: (role, callback) => {
    return GraphCall('MATCH (r:Role) WHERE r.name = "' + role + '" RETURN r', callback);
  },

  getRoleByIndex: (index, callback) => {
    return GraphCall('MATCH (r:Role) WHERE r.index = "' + index + '" RETURN r', callback);
  },

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

  updateRole: (role, properties, callback) => {
    return GraphCall('MATCH (u:Role {name: "' + role + '"}) SET ' + setProperties(properties) + ' RETURN u', callback);
  },

  updateRoleByIndex: (index, properties, callback) => {
    return GraphCall('MATCH (u:Role {index: "' + index + '"}) SET ' + setProperties(properties) + ' RETURN u', callback);
  },

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

  createRoom: (number, service_id, callback) => {
    return GraphCall('MATCH (s:Service) WHERE ID(s) = ' + service_id + ' CREATE (r:Room {number: "' + number + '"})-[:SERVICE]->(s) RETURN r', callback);
  },

  modifyRoomNumber: (number, new_number, service_id, callback) => {
    return GraphCall('MATCH (r:Room {number: "' + number + '"})-[:SERVICE]-(s) WHERE ID(s) = ' + service_id + ' SET r.number = "' + new_number + '" RETURN r', callback);
  },

  modifyRoomService: (number, service_id, new_service_id, callback) => {
    return GraphCall('MATCH (r:Room {number: "' + number + '"})-[rel:SERVICE]-(s) WHERE ID(s) = ' + service_id + ' MATCH (s2:Service) WHERE ID(s2) = ' + new_service_id + ' MERGE (r)-[:SERVICE]->(s2) DELETE rel RETURN r', callback);
  },

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

  createBed: (room_nb, service_id, status, to_clean, callback) => {
    return GraphCall('MATCH (r:Room {number: "' + room_nb + '"})-[:SERVICE]-(s:Service) WHERE ID(s) = ' + service_id + ' CREATE (b:Bed {uuid: "' + uuidv4() + '", status: "' + status + '", to_clean: ' + to_clean + '})-[:ROOM]->(r) RETURN b', callback)
  },

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

  getBed: (bed_uuid, callback) => {
    return GraphCall('MATCH (b:Bed {uuid: "' + bed_uuid + '"})-[:ROOM]-(r)-[:SERVICE]-(s) RETURN collect(b {.*, service_id:ID(s), room_nb:r.number})', callback);
  },

  modifyClean: (bed_uuid, value, callback) => {
    return GraphCall('MATCH (b:Bed {uuid: "' + bed_uuid + '"}) SET b.to_clean = ' + value + ' RETURN b', callback);
  },

  modifyStatus: (bed_uuid, value, callback) => {
    return GraphCall('MATCH (b:Bed {uuid: "' + bed_uuid + '"}) SET b.status = "' + value + '" RETURN b', callback);
  },

  modifyBedRoom: (bed_uuid, room_nb, service_id, callback) => {
    return GraphCall('MATCH (r:Room {number: "' + room_nb + '"})-[:SERVICE]-(s:Service) WHERE ID(s) = ' + service_id + ' MATCH (b:Bed {uuid: "' + bed_uuid + '"})-[rel:ROOM]-(r2) MERGE (b)-[:ROOM]->(r) DELETE rel RETURN b', callback);
  },

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

  getUnboundedBed: (callback) => {
  	return GraphCallTransformInteger("MATCH (b:Bed) WHERE NOT (b)-[:ROOM]-() RETURN b", callback)
  },
/*  unboundedBedDelete: (service_id, callback) => {
  	if (!service_id) {
  	  	return GraphCall("MATCH (b:Bed) WHERE NOT (b)-[:ROOM]-() DETACH DELETE b RETURN (b)", callback)
	} else {
	  	return GraphCall("MATCH (b:Bed{old:" + service_id + "}) WHERE NOT (b)-[:SERVICE]-() DETACH DELETE b RETURN (b)", callback)
	}
  }, */ // <------------------------------------UTILE ?

	// SERVICES

  createService: (name, callback) => {
    return GraphCall('CREATE (s:Service {name: "' + name + '"}) RETURN s', callback);
  },

  modifyService: (name, service_id, callback) => {
  	return GraphCall("MATCH (s:Service) WHERE ID(s) = " + service_id + " SET s.name = \"" + name + "\" RETURN s", callback);
  },

  deleteService: (service_id, callback) => {
   	GraphCall("MATCH (b:Bed)-[r:SERVICE]->(s:Service) WHERE ID(s) = " + service_id + " SET b.old = ID(s), b.oldName = s.name DELETE r", (r) => {});
  	return GraphCall("MATCH (s:Service) WHERE ID(s) = " + service_id + " SET s: Deleted RETURN s", callback);
  },

  listServices: (callback) => {
    return GraphCallTransformInteger('MATCH (s:Service) WHERE NOT s:Deleted RETURN collect(s {.*, id: ID(s)})', callback);
  },
}