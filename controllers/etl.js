const graph = require('./graph');
const csvtojson = require('csvtojson');
const csv = require('csv-parser');
const fs = require('fs');

function extractServices(data) {
  let services = [];

  for (idx = 0; idx < data.length; idx++) {
    if (!services.includes(data[idx]["service"]))
      services.push(data[idx]["service"]);
  }

  return services;
}

async function createServices(services) {
  for (idx = 0; idx < services.length; idx++) {
    await graph.createService(services[idx], (res) => {console.log(res);});
  }
}

async function getServices() {
  let services = null;

  await graph.listServices((res) => {
    services = res.value;
  });
  
  return services;
}

function getServiceId(graphServices, service) {
  for (idx = 0; idx < graphServices.length; idx++) {
    if (service == graphServices[idx].name)
      return graphServices[idx].id;
  }
  return -1;
}

async function createBeds(data, graphServices) {
  for (i = 0; i < data.length; i++) {
    let serviceId = getServiceId(graphServices, data[i].service);
    await graph.createRoom(data[i].room.toString(), serviceId, ()=>{});
    for (idx = 0; idx < data[i].nb_beds; idx++)
      await graph.createBed(data[i].room.toString(), serviceId, "0", false, (res)=>{});
  }
}

module.exports = {
  import: async (req, res) => {
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
  }
};