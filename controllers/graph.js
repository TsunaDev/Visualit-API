const neo4j = require('neo4j-driver').v1;
const driver = neo4j.driver("bolt://graph:7687", neo4j.auth.basic("neo4j", "test")) // TODO: Intégrer les ID et URI de façon plus modulable

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

module.exports = {
  createUser: (username, password, role, callback) => {
    return GraphCall('MATCH (r:Role) WHERE r.name = "' + role + '" CREATE (u:User {name: "' + username + '", password: "' + password + '"})-[:ROLE]->(r) RETURN u', callback);
  },

  getUser: (username, callback) => {
    return GraphCall('MATCH (u:User) WHERE u.name = "' + username + '" RETURN u', callback);
  },

  getAllUsers: (callback) => {
    return GraphCall('MATCH (u:User) RETURN u');
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
  }
}