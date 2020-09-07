const graph = require('./graph');
const csvtojson = require('csvtojson');
const csv = require('csv-parser');
const fs = require('fs');


/**
 * Vérifie que l'utilisateur possède la permission d'accéder à une route donnée.
 * @param {string} resource La ressource liée à la route (ex: beds) 
 * @param {string} route La route elle même (ex: update)
 * @param {object} user Les données utilisateur reçus dans la requête.
 * @returns {boolean} True si l'utilisateur possède la permission. False dans le cas contraire.
 */
async function checkPermission(resource, route, user) {
  let ret = false;

  await graph.getUserPermissions(user.username, (result) => {
    if (result.value.includes(resource + ".all") || result.value.includes(resource + "." + route))
      ret = true;
  })

  return ret;
}

/**
 * Récupère les services présents dans les données reçus
 * @param {json} data Données récupérées dans le fichier csv
 */
function extractServices(data) {
  let services = [];

  for (idx = 0; idx < data.length; idx++) {
    if (!services.includes(data[idx]["service"]))
      services.push(data[idx]["service"]);
  }

  return services;
}

/**
 * Créer des services
 * @param {array} services Liste des services à créer. 
 */
async function createServices(services) {
  for (idx = 0; idx < services.length; idx++) {
    await graph.createService(services[idx], (res) => {console.log(res);});
  }
}

/**
 * Récupère les services présents sur le graphe.
 */
async function getServices() {
  let services = null;

  await graph.listServices((res) => {
    services = res.value;
  });
  
  return services;
}

/**
 * Récupère l'ID (sur le graphe) d'un service en fonction de son nom.
 * @param {array} graphServices Liste des services présents sur le graphe. 
 * @param {string} service Nom du service recherché.
 */
function getServiceId(graphServices, service) {
  for (idx = 0; idx < graphServices.length; idx++) {
    if (service == graphServices[idx].name)
      return graphServices[idx].id;
  }
  return -1;
}

/**
 * Crée les lits présents dans le CSV.
 * @param {json} data Données extraites du CSV.
 * @param {array} graphServices Liste des services présents sur le graphe.
 */
async function createBeds(data, graphServices) {
  for (i = 0; i < data.length; i++) {
    let serviceId = getServiceId(graphServices, data[i].service);
    await graph.createRoom(data[i].room.toString(), serviceId, ()=>{});
    for (idx = 0; idx < data[i].nb_beds; idx++)
      await graph.createBed(data[i].room.toString(), serviceId, "0", false, (res)=>{});
  }
}

/**
 * Crée les utilisateurs présents dans le CSV.
 * @param {json} data Données extraites du CSV.
 */
async function createUsers(data) {
  for (i = 0; i < data.length; i++) {
    await graph.createUser(data[i].username, data[i].password, data[i].role, () => {});
  }
}


module.exports = {
  /**
   * Lance l'import des chambres en utilisant le CSV donné par la requête.
   */
  rooms: async (req, res) => {
    const check = await checkPermission("etl", "import", req.user);
    
    if (!check)
      return res.status(401).send({error: {name: "PermissionDenied"}});

    const file = req.files.data;
    await file.mv('./uploads/' + file.name, function(err, result) {
      if(err) 
        throw err;
    });

    const path = "./uploads/" + file.name;
    await fs.stat(path, async function(err, stats) {
      if (stats.isFile()) {
        const data = await csvtojson().fromFile(path);
        const services = extractServices(data);
        await createServices(services);
        const graphServices = await getServices();
        await createBeds(data, graphServices);
      }
    });


    res.sendStatus(200);
  },

  users: async(req, res) => {
    const check = await checkPermission("etl", "users", req.user);

    if (!check)
      return res.status(401).send({error: {name: "PermissionDenied"}});

    const file = req.files.data;
    await file.mv('./uploads/' + file.name, function(err, result) {
      if (err)
        throw err;
    });

    const path = "./uploads/" + file.name;
    await fs.stat(path, async function(err, stats) {
      if (stats.isFile()) {
        const data = await csvtojson().fromFile(path);
        await createUsers(data);
      }
    });
    res.sendStatus(200);
  }
};