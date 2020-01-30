const graph = require('./graph');
const {bedUpdateEvent} = require('./logs');

async function getOldBedInfo(bedId) {
  let oldBed = null;
  await graph.getBed(bedId, (result) => {
    if (result.status) {
      oldBed = result.value[0];
    }
  });
  return oldBed
}

async function updateUtil(bedId, oldBed, newBed, user) {
  let role = null;
  await graph.getUserRole(user.username, (result) => {
    if (result.status)
      role = result.value;
  });
  bedUpdateEvent({
    bed_id: bedId,
    service_id: oldBed.service_id,
    username: user.username,
    user_role: role,
    state: {
      old: oldBed.status,
      new: newBed.status
    },
    to_clean: {
      old: oldBed.to_clean,
      new: newBed.to_clean
    }
  })
}

async function listBeds(req, res) {
  let service_id = req.query.service_id;
  let status = req.query.status;
  let to_clean = req.query.to_clean;


  if (service_id) {
    service_id = parseInt(service_id, 10);
    if (isNaN(service_id)) {
      res.statusMessage = "Service_id should be an integer.";
      return res.sendStatus(400)
    }
  }

  if (status) {
    await status.forEach((v, i) => {
      if (!["Free", "Leaving", "Busy"].includes(v)) {
        res.statusMessage = `Invalid '${v}' status.`;
        res.status(400)
      }
      status[i] = "b.status =\"" + v + "\""
    });
    status = status.join(" OR ");
    console.log(status);
    if (res.statusCode === 400) {
      return res.end()
    }
  }
  console.log(status);

  let tmp_to_clean = parseInt(to_clean, 10);
  if (!isNaN(to_clean)) {
    to_clean = tmp_to_clean
  }
  console.log(to_clean);

  if (typeof to_clean != "undefined" && !["false", "true", 0, 1].includes(to_clean)) {
    res.statusMessage = "to_clean should be a boolean";
    return res.sendStatus(400)
  }

  if (to_clean === "false" || to_clean === 0) {
    to_clean = false
  }
  if (to_clean === "true" || to_clean === 1) {
    to_clean = true
  }


  let ret = null;
  graph.listBed(service_id, status, to_clean, (result) => {
    res.status(200);
    if (result.status === false && result.value.code === "No record found.") {
      ret = res.json({"beds": []})
    } else {
      ret = res.json({
        "beds": result.value
      })
    }
  });
  return ret;
}

async function getBed(req, res) {
  let bed_id = req.params.bed_id;
  let ret = null;

  if (!bed_id) {
    res.statusMessage = "The bed_id is required.";
    return res.sendStatus(404)
  }
  bed_id = parseInt(bed_id, 10);
  if (isNaN(bed_id)) {
    res.statusMessage = "bed_id should be an integer.";
    return res.sendStatus(400)
  }

  await graph.getBed(bed_id, (result) => {
    if (result.value.length === 0) {
      res.statusMessage = `Bed corresponding to bed_id ${bed_id} not found.`;
      ret = res.sendStatus(404)
    } else {
      res.status(200);
      ret = res.json(result.value[0])
    }
  });

  return ret;
}

async function getUnboundedBed(req, res) {
  let ret = null;

  await graph.getUnboundedBed((result) => {
    res.status(200);
    ret = res.json(result.value)
  });
  return (ret)
}

async function unboundedBedDelete(req, res) {
  let ret = null;
  let service_id = req.query.service_id;

  if (service_id) {
    service_id = parseInt(service_id, 10);
    if (isNaN(service_id)) {
      res.statusMessage = "Service_id should be an integer.";
      return res.sendStatus(400)
    }
  }
  await graph.unboundedBedDelete(service_id, (result) => {
    if (result.status) {
      ret = res.sendStatus(204)
    } else if (result.value.code === "No record found.") {
      res.status(400);
      ret = res.send({error: "Service id not found."})
    } else {
      res.status(400);
      ret = res.send({error: result.value})
    }
  });
  return ret
}

async function deleteBed(req, res) {
  let bed_id = req.params.bed_id;
  let ret = null;

  if (!bed_id) {
    res.statusMessage = "The bed_id is required.";
    return res.sendStatus(404)
  }
  bed_id = parseInt(bed_id, 10);
  if (isNaN(bed_id)) {
    res.statusMessage = "bed_id should be an integer.";
    return res.sendStatus(400)
  }
  await graph.deleteBed(bed_id, (result) => {
    if (result.status) {
      ret = res.sendStatus(204)
    } else if (result.value.code === "No record found.") {
      res.statusMessage = `Bed corresponding to bed_id ${bed_id} not found.`;
      ret = res.sendStatus(400)
    } else {
      res.status(400);
      ret = res.send({error: result.value})
    }
  });
  return ret
}

function modifyBed(req, res) {
  let bed_id = req.params.bed_id;
  let status = req.body.status;
  let to_clean = req.body.to_clean;
  let display_name = req.body.name;
  let service_id = req.body.service_id;


  if (!bed_id) {
    res.statusMessage = "The bed_id is required.";
    return res.sendStatus(404)
  }
  bed_id = parseInt(bed_id, 10);
  if (isNaN(bed_id)) {
    res.statusMessage = "bed_id should be an integer.";
    return res.sendStatus(400)
  }
  /*if (![1, 1053, 321].includes(bed_id)) {
      res.statusMessage = `Bed corresponding to bed_id ${bed_id} not found.`
       return res.sendStatus(404)
    }*/

  if (!status || !["Free", "Leaving", "Busy"].includes(status)) {
    res.statusMessage = `Invalid '${status}' status.`;
    return res.sendStatus(400)
  }

  if (typeof to_clean == "undefined" || !["false", "true", false, true, 0, 1].includes(to_clean)) {
    res.statusMessage = "to_clean should be a boolean";
    return res.sendStatus(400)
  }
  /*	if (to_clean == "false") {
      to_clean = false
    }
    if (to_clean == "true") {
      to_clean = true
    }*/

  if (!display_name || display_name === "") {
    res.statusMessage = "Invalid name";
    return res.sendStatus(400)
  }

  if (!service_id) {
    res.statusMessage = "The service_id is required.";
    return res.sendStatus(400)
  }
  service_id = parseInt(service_id, 10);
  if (isNaN(service_id)) {
    res.statusMessage = "service_id should be an integer.";
    return res.sendStatus(400)
  }

  return res.sendStatus(204)
}

async function modifyBedState(req, res) {
  let bed_id = req.params.bed_id;
  let status = req.body.status;
  let ret = null;

  if (!bed_id) {
    res.statusMessage = "The bed_id is required.";
    return res.sendStatus(404)
  }
  bed_id = parseInt(bed_id, 10);
  if (isNaN(bed_id)) {
    res.statusMessage = "bed_id should be an integer.";
    return res.sendStatus(400)
  }
  if (!status || !["Free", "Leaving", "Busy"].includes(status)) {
    res.statusMessage = `Invalid '${status}' status.`;
    return res.sendStatus(400)
  }

  let oldBed = await getOldBedInfo(bed_id);

  await graph.modifyState(bed_id, status, (result) => {
    if (result.status) {
      ret = res.sendStatus(204);
      updateUtil(bed_id, oldBed, result.value.properties, req.user)
    } else if (result.value.code === "No record found.") {
      res.statusMessage = `Bed corresponding to bed_id ${bed_id} not found.`;
      ret = res.sendStatus(400)
    } else {
      res.status(400);
      ret = res.send({error: result.value})
    }
  });
  return ret
}

async function cleanlinessBed(req, res) {
  let bed_id = req.params.bed_id;
  let to_clean = req.body.to_clean;
  let ret = null;

  if (!bed_id) {
    res.statusMessage = "The bed_id is required.";
    return res.sendStatus(404)
  }
  bed_id = parseInt(bed_id, 10);
  if (isNaN(bed_id)) {
    res.statusMessage = "bed_id should be an integer.";
    return res.sendStatus(400)
  }

  if (typeof to_clean == "undefined" || !["false", "true", false, true, 0, 1].includes(to_clean)) {
    res.statusMessage = "to_clean should be a boolean";
    return res.sendStatus(400)
  }

  if (to_clean === "false" || to_clean === 0) {
    to_clean = false
  }
  if (to_clean === "true" || to_clean === 1) {
    to_clean = true
  }

  let oldBed = await getOldBedInfo(bed_id);

  await graph.modifyClean(bed_id, to_clean, (result) => {
    if (result.status) {
      ret = res.sendStatus(204);
      updateUtil(bed_id, oldBed, result.value.properties, req.user)
    } else if (result.value.code === "No record found.") {
      res.statusMessage = `Bed corresponding to bed_id ${bed_id} not found.`;
      ret = res.sendStatus(400)
    } else {
      res.status(400);
      ret = res.send({error: result.value})
    }
  });

  return ret
}

async function modifyBedName(req, res) {
  let bed_id = req.params.bed_id;
  let name = req.body.name;
  let ret = null;

  if (!bed_id) {
    res.statusMessage = "The bed_id is required.";
    return res.sendStatus(404)
  }
  bed_id = parseInt(bed_id, 10);
  if (isNaN(bed_id)) {
    res.statusMessage = "bed_id should be an integer.";
    return res.sendStatus(400)
  }

  if (typeof name == "undefined" || name === "") {
    res.statusMessage = "name should be a string";
    return res.sendStatus(400)
  }
  await graph.modifyName(bed_id, name, (result) => {
    console.log(result);
    if (result.status) {
      ret = res.sendStatus(204)
    } else if (result.value.code === "No record found.") {
      res.statusMessage = `Bed corresponding to bed_id ${bed_id} not found.`;
      ret = res.sendStatus(400)
    } else {
      res.status(400);
      ret = res.send({error: result.value})
    }
  });

  return ret
}

async function modifyBedService(req, res) {
  let bed_id = req.params.bed_id;
  let service_id = req.body.service_id;
  let ret = null;


  if (!bed_id) {
    res.statusMessage = "The bed_id is required.";
    return res.sendStatus(404)
  }
  bed_id = parseInt(bed_id, 10);
  if (isNaN(bed_id)) {
    res.statusMessage = "bed_id should be an integer.";
    return res.sendStatus(400)
  }
  service_id = parseInt(service_id, 10);

  if (typeof service_id == "undefined" || isNaN(service_id)) {
    res.statusMessage = "service_id should be a boolean";
    return res.sendStatus(400)
  }
  await graph.modifyBedService(bed_id, service_id, (result) => {
    console.log(result);
    if (result.status) {
      ret = res.sendStatus(204)
    } else if (result.value.code === "No record found.") {
      res.statusMessage = `Bed corresponding to bed_id ${bed_id} not found.`;
      ret = res.sendStatus(400)
    } else {
      res.status(400);
      ret = res.send({error: result.value})
    }
  });

  return ret
}

async function createBed(req, res) {
  let status = req.body.status;
  let to_clean = req.body.to_clean;
  let display_name = req.body.name;
  let service_id = req.body.service_id;

  if (!status || !["Free", "Leaving", "Busy"].includes(status)) {
    res.statusMessage = `Invalid '${status}' status.`;
    return res.sendStatus(400)
  }
  console.log(typeof to_clean);
  console.log(status);

  if (typeof to_clean === "undefined" || ![false, true, "false", "true", 0, 1].includes(to_clean)) {
    res.statusMessage = "to_clean should be a boolean";
    return res.sendStatus(400)
  }
  if (to_clean === "false" || to_clean === false || to_clean === 0) {
    to_clean = false
  }
  if (to_clean === true || to_clean === "true" || to_clean === 1) {
    to_clean = true
  }

  if (!display_name || display_name === "") {
    res.statusMessage = "Invalid name";
    return res.sendStatus(400)
  }

  if (!service_id) {
    res.statusMessage = "The service_id is required.";
    return res.sendStatus(400)
  }
  service_id = parseInt(service_id, 10);
  if (isNaN(service_id)) {
    res.statusMessage = "service_id should be an integer.";
    return res.sendStatus(400)
  }

  let ret = null;
  await graph.createBed(status, to_clean, display_name, service_id, (result) => {
    if (result.status) {
      ret = res.sendStatus(201)
    } else if (result.value.code === "No record found.") {
      res.status(400);
      ret = res.send({error: "Service id not found."})
    } else {
      res.status(400);
      ret = res.send({error: result.value})
    }
  });
  return ret;
}

module.exports = {
  listBeds: listBeds,
  getBed: getBed,
  getUnboundedBed: getUnboundedBed,
  unboundedBedDelete: unboundedBedDelete,
  createBed: createBed,
  deleteBed: deleteBed,
  modifyBed: modifyBed,
  cleanlinessBed: cleanlinessBed,
  modifyBedState: modifyBedState,
  modifyBedName: modifyBedName,
  modifyBedService: modifyBedService
};