const graph = require('./graph');
const csvtojson = require('csvtojson');
const csv = require('csv-parser');
const fs = require('fs');
const {checkPermission} = require('./common');



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

async function createRoles(data) {
  for (i = 0; i < data.length; i++) {
    console.log(data[i]);
    await graph.createRole(data[i].role, data[i].index, data[i].permissions.split(";"), () => {});
  }
}


module.exports = {
  /**
   * Lance l'import des chambres en utilisant le CSV donné par la requête.
   */
  rooms: async (req, res) => {
    const check = await checkPermission("etl", "rooms", req.user);
    
    if (!check)
      return res.status(401).send({error: {name: "PermissionDenied"}});

    const file = req.files.data;
    await file.mv('./uploads/' + file.name, async function(err, result) {
      if(err) 
        throw err;

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
    });

    res.sendStatus(200);
  },

  users: async(req, res) => {
    const check = await checkPermission("etl", "users", req.user);

    if (!check)
      return res.status(401).send({error: {name: "PermissionDenied"}});

    const file = req.files.data;
    await file.mv('./uploads/' + file.name, async function(err, result) {
      if (err)
        throw err;

      const path = "./uploads/" + file.name;
      await fs.stat(path, async function(err, stats) {
        if (stats.isFile()) {
          const data = await csvtojson().fromFile(path);
          await createUsers(data);
        }
      });
    });

    res.sendStatus(200);
  },

  roles: async(req, res) => {
    const check = await checkPermission("etl", "roles", req.user);

    if (!check)
      return res.status(401).send({error: {name: "PermissionDenied"}});

    const file = req.files.data;
    await file.mv('./uploads/' + file.name, async function(err, result) {
      if (err)
        throw err;

      const path = "./uploads/" + file.name;

      await fs.stat(path, async function(err, stats) {
          if (err)
            console.log(err);
          if (stats.isFile()) {
            const data = await csvtojson().fromFile(path);
            await createRoles(data);
          }
        });
    });


    res.sendStatus(200);
  }
};