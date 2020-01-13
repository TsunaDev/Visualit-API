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
	    console.log("column", col)
        col.forEach( function(dim_x, l) {
	    console.log("dim x", dim_x)
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
    return GraphCall('MATCH (r:Role) WHERE r.name = "' + role + '" CREATE (u:User {name: "' + username + '", password: "' + password + '"})-[:ROLE]->(r) RETURN u', callback);
  },

  getUser: (username, callback) => {
    return GraphCall('MATCH (u:User)-[ROLE]->(r:Role) WHERE u.name = "' + username + '" RETURN collect(u {.*, role:r.name})', callback);
  },

  getAllUsers: (callback) => {
    const request = 'MATCH (u:User) RETURN u';
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

  getUserRole: (username, callback) => {
    return GraphCall('MATCH (u:User {name: "' + username + '"})-[:ROLE]-(r) RETURN r.name', callback);
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

  // BEDS
  /*
	var status = req.body.status
	var to_clean = req.body.to_clean
	var display_name = req.body.display_name
	var service_id = req.body.service_id
  */
  createBed: (status, to_clean, display_name, service_id, callback) => {
    return GraphCall('MATCH (s:Service) WHERE ID(s) = ' + service_id + ' CREATE (b:Bed {name: "' + display_name + '", to_clean: ' + to_clean + ', status: "' + status + '"})-[:SERVICE]->(s) RETURN b', callback);
  },

  getBed: (bed_id, callback) => {
    return GraphCallTransformInteger('MATCH (b:Bed)-[SERVICE]->(s:Service) WHERE ID(b) = ' + bed_id + ' RETURN collect(b {.*, service_id:ID(s), bed_id:ID(b)})', callback)
  },

  listBed: (service_id, status, to_clean, callback) => {
  	if (typeof to_clean == "undefined" && !status) {
  		if (!service_id) {
	  		return GraphCallTransformInteger('MATCH (b:Bed)-[SERVICE]->(s:Service) RETURN collect(b {.*, service_id:ID(s), bed_id:ID(b)})', callback)
  		} else {
  			return GraphCallTransformInteger('MATCH (b:Bed)-[SERVICE]->(s:Service) WHERE ID(s) = ' + service_id + ' RETURN collect(b {.*, service_id:ID(s), bed_id:ID(b)})', callback)
  		}
  	}
  	if (!status) {
  		if (!service_id) {
	  		return GraphCallTransformInteger('MATCH (b:Bed {to_clean:' + to_clean + '})-[SERVICE]->(s:Service) RETURN collect(b {.*, service_id:ID(s), bed_id:ID(b)})', callback)
  		} else {
  			return GraphCallTransformInteger('MATCH (b:Bed {to_clean:' + to_clean + '})-[SERVICE]->(s:Service) WHERE ID(s) = ' + service_id + ' RETURN collect(b {.*, service_id:ID(s), bed_id:ID(b)})', callback)
  		}
  	}
  	if (typeof to_clean == "undefined") {
  		if (!service_id) {
	  		return GraphCallTransformInteger('MATCH (b:Bed)-[SERVICE]->(s:Service) WHERE (' + status + ') RETURN collect(b {.*, service_id:ID(s), bed_id:ID(b)})', callback)
  		} else {
  			return GraphCallTransformInteger('MATCH (b:Bed)-[SERVICE]->(s:Service) WHERE (' + status + ') AND ID(s) = ' + service_id + ' RETURN collect(b {.*, service_id:ID(s), bed_id:ID(b)})', callback)
  		}
  	}
	if (!service_id) {
		return GraphCallTransformInteger('MATCH (b:Bed {to_clean:' + to_clean + '})-[SERVICE]->(s:Service) WHERE (' + status + ') RETURN collect(b {.*, service_id:ID(s), bed_id:ID(b)})', callback)
  	} else {
  		return GraphCallTransformInteger('MATCH (b:Bed {to_clean:' + to_clean + '})-[SERVICE]->(s:Service) WHERE (' + status + ') AND ID(s) = ' + service_id + ' RETURN collect(b {.*, service_id:ID(s), bed_id:ID(b)})', callback)
  	}
  },

	// SERVICES

  createService: (name, callback) => {
    return GraphCall('CREATE (s:Service {name: "' + name + '"}) RETURN s', callback);
  },
  listServices: (callback) => {
    return GraphCallTransformInteger('MATCH (s:Service) RETURN collect(s {.*, id: ID(s)})', callback);
  },
}