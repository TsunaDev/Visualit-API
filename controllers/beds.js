const graph = require('./graph');
const {bedUpdateEvent} = require('./logs');
const validate = require('uuid-validate')

// "0"=>Free, "1"=>Leaving, "2"=>Busy

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
    bed_uuid: bedId,
    room_nb: oldBed.room_nb,
    service_id: oldBed.service_id,
    username: user.username,
    user_role: role,
    state: {
      old: parseInt(oldBed.status, 10),
      new: parseInt(newBed.status, 10)
    },
    to_clean: {
      old: oldBed.to_clean,
      new: newBed.to_clean
    }
  })
}

async function listBeds(req, res) {
  let room_nb = req.query.room_nb;
  let service_id = req.query.service_id;
  let status = req.query.status;
  let to_clean = req.query.to_clean;

  if (service_id) {
    service_id = parseInt(service_id, 10);
    if (isNaN(service_id)) {
      res.json = {error: "Service_id should be an integer."};
      return res.sendStatus(400)
    }
  }

  
  if (status && !["0", "1", "2"].includes(status)) {
    res.json = {error: `Invalid '${v}' status.`};
    return res.sendStatus(400)
  }

  let tmp_to_clean = parseInt(to_clean, 10);
  if (!isNaN(to_clean)) {
    to_clean = tmp_to_clean
  }

  if (typeof to_clean != "undefined" && !["false", "true", 0, 1].includes(to_clean)) {
    res.json = {error: "to_clean should be a boolean"};
    return res.sendStatus(400)
  }

  if (to_clean === "false" || to_clean === 0) {
    to_clean = false
  }
  if (to_clean === "true" || to_clean === 1) {
    to_clean = true
  }


  let ret = null;
  graph.listBeds(room_nb, service_id, status, to_clean, (result) => {
    res.status(200);
    if (result.status === false && result.value.code === "No record found.") {
      ret = res.json([])
    } else {
      ret = res.json(result.value)
    }
  });
  return ret;
}

async function getBed(req, res) {
  let bed_uuid = req.params.bed_uuid;
  let ret = null;

  if (!bed_uuid) {
    res.json = {error: "The bed_uuid is required."};
    return res.sendStatus(404)
  }
  if (!validate(bed_uuid, 4)) {
    res.json = {error: "bed_uuid should be a valid uuid."};
    return res.sendStatus(400)
  }

  await graph.getBed(bed_uuid, (result) => {
    if (result.value.length === 0) {
      res.json = {error: `Bed corresponding to bed_uuid ${bed_uuid} not found.`};
      ret = res.sendStatus(404);
    } else {
      result.value[0].service_id = result.value[0].service_id.low;
      result.value[0].status = parseInt(result.value[0].status, 10);
      res.status(200);
      ret = res.json(result.value[0]);
    }
  });

  return ret;
}

async function deleteBed(req, res) {
  let bed_uuid = req.params.bed_uuid;
  let ret = null;

  if (!bed_uuid) {
    res.json = {error: "The bed_uuid is required."};
    return res.sendStatus(404)
  }
  
  if (!validate(bed_uuid, 4)) {
    res.json = {error: "bed_uuid should be a valide uuid."};
    return res.sendStatus(400)
  }

  await graph.deleteBed(bed_uuid, (result) => {
    if (result.status) {
      ret = res.sendStatus(204)
    } else if (result.value.code === "No record found.") {
      res.json = {error: `Bed corresponding to bed_uuid ${bed_uuid} not found.`};
      ret = res.sendStatus(400)
    } else {
      res.status(400);
      ret = res.send({error: result.value})
    }
  });
  return ret
}

async function modifyBedStatus(req, res) {
  let bed_uuid = req.params.bed_uuid;
  let status = req.body.status;
  let ret = null;

  if (!bed_uuid) {
    res.json = {error: "The bed_uuid is required."};
    return res.sendStatus(404)
  }
  
  if (!status) {
    res.json = {error: "The status is required."};
  }

  if (!validate(bed_uuid, 4)) {
    res.json = {error: "bed_uuid should be a valid uuid."};
    return res.sendStatus(400)
  }

  if (![0, 1, 2].includes(status) && !["0", "1", "2"].includes(status)) {
    res.json = {error: `Invalid '${status}' status.`};
    return res.sendStatus(400)
  }

  let oldBed = await getOldBedInfo(bed_uuid);

  await graph.modifyStatus(bed_uuid, status, (result) => {
    if (result.status) {
      ret = res.sendStatus(204);
      updateUtil(bed_uuid, oldBed, result.value.properties, req.user)
    } else if (result.value.code === "No record found.") {
      res.json = {error: `Bed corresponding to bed_uuid ${bed_uuid} not found.`};
      ret = res.sendStatus(400)
    } else {
      res.status(400);
      ret = res.send({error: result.value})
    }
  });
  return ret
}

async function cleanlinessBed(req, res) {
  let bed_uuid = req.params.bed_uuid;
  let to_clean = req.body.to_clean;
  let ret = null;

  if (!bed_uuid) {
    res.json = {error: "The bed_uuid is required."};
    return res.sendStatus(404)
  }

  if (!validate(bed_uuid, 4)) {
    res.json = {error: "bed_id should be a valid uuid."};
    return res.sendStatus(400)
  }

  if (typeof to_clean == "undefined" || !["false", "true", false, true, 0, 1].includes(to_clean)) {
    res.json = {error: "to_clean should be a boolean"};
    return res.sendStatus(400)
  }

  if (to_clean === "false" || to_clean === 0) {
    to_clean = false
  }
  if (to_clean === "true" || to_clean === 1) {
    to_clean = true
  }

  let oldBed = await getOldBedInfo(bed_uuid);

  await graph.modifyClean(bed_uuid, to_clean, (result) => {
    if (result.status) {
      ret = res.sendStatus(204);
      updateUtil(bed_uuid, oldBed, result.value.properties, req.user)
    } else if (result.value.code === "No record found.") {
      res.json = {error: `Bed corresponding to bed_uuid ${bed_uuid} not found.`};
      ret = res.sendStatus(400)
    } else {
      res.status(400);
      ret = res.send({error: result.value})
    }
  });

  return ret
}


async function modifyBedRoom(req, res) {
  let bed_uuid = req.params.bed_uuid;
  let room_nb = req.body.room_nb;
  let service_id = req.body.service_id;
  let ret = null;


  if (!bed_uuid) {
    res.json = {error: "The bed_uuid is required."};
    return res.sendStatus(404)
  }

  if (!validate(bed_id, 4)) {
    res.json = {error: "bed_uuid should be a valid uuid."};
    return res.sendStatus(400)
  }

  service_id = parseInt(service_id, 10);

  if (typeof service_id == "undefined" || isNaN(service_id)) {
    res.json = {error: "service_id should be an integer."};
    return res.sendStatus(400)
  }

  await graph.modifyBedRoom(bed_uuid, room_nb, service_id, (result) => {
    if (result.status) {
      ret = res.sendStatus(204)
    } else if (result.value.code === "No record found.") {
      res.statusMessage = `Bed corresponding to bed_uuid ${bed_uuid} or room ${room_nb} in service ${service_id} not found.`;
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
  let room_nb = req.body.room_nb;
  let service_id = req.body.service_id;

  if (!status)
    status = "0";
  if (!to_clean)
    to_clean = false;
  if (![0, 1, 2].includes(status) && !["0", "1", "2"].includes(status)) {
    res.json = {error: `Invalid '${status}' status.`};
    return res.sendStatus(400)
  }

  if (typeof to_clean === "undefined" || ![false, true, "false", "true", 0, 1].includes(to_clean)) {
    res.json = {error: "to_clean should be a boolean"};
    return res.sendStatus(400)
  }
  if (to_clean === "false" || to_clean === false || to_clean === 0) {
    to_clean = false
  }
  if (to_clean === true || to_clean === "true" || to_clean === 1) {
    to_clean = true
  }

  if (!room_nb) {
    res.json = {error: "The room_nb is required"};
    return res.sendStatus(400);
  }
  if (!service_id) {
    res.json = {error: "The service_id is required."};
    return res.sendStatus(400)
  }
  service_id = parseInt(service_id, 10);
  if (isNaN(service_id)) {
    res.json = {error: "service_id should be an integer."};
    return res.sendStatus(400)
  }

  let ret = null;
  await graph.createBed(room_nb, service_id, status, to_clean, (result) => {
    if (result.status) {
      ret = res.sendStatus(201)
    } else if (result.value.code === "No record found.") {
      res.status(400);
      ret = res.send({error: "Service id or room not found."})
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
  createBed: createBed,
  deleteBed: deleteBed,
  cleanlinessBed: cleanlinessBed,
  modifyBedStatus: modifyBedStatus,
  modifyBedRoom: modifyBedRoom
};