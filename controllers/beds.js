const graph = require('./graph');
const {bedUpdateEvent} = require('./logs');
const validate = require('uuid-validate');
const {checkPermission} = require('./common');




// "0"=>Free, "1"=>Leaving, "2"=>Busy

/**
 * Récupère les infos d'un lit avant qu'on les modifie.
 * @param {string} bedId UUID du lit.
 * @returns {json} Les informations sur le lit en question.
 */
async function getOldBedInfo(bedId) {
  let oldBed = null;
  await graph.getBed(bedId, (result) => {
    if (result.status) {
      oldBed = result.value[0];
    }
  });
  return oldBed
}

/**
 * Met à jour les informations du lit sur le service de logs
 * @param {string} bedId UUID du lit.
 * @param {json} oldBed Anciennes informations du lit.
 * @param {json} newBed Nouvelles informations.
 * @param {object} user L'utilisateur qui a modifié les informations. 
 */
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


module.exports = {
  /**
   * Créer un lit en fonction des paramètres de la requête.
   * @param {*} req Les données de la requête.
   * @param {*} res La réponse HTTP.
   */
  create: async (req, res) => {
    const check = await checkPermission("beds", "create", req.user);
    
    if (!check)
      return res.status(401).send({error: "PermissionDenied"});
      
    let status = req.body.status;
    let to_clean = req.body.to_clean;
    let room_nb = req.body.room_nb;
    let service_id = req.body.service_id;
  
    if (!status)
      status = "0";
    if (!to_clean)
      to_clean = false;
    if (![0, 1, 2].includes(status) && !["0", "1", "2"].includes(status))
      return res.status(400).send({error: {name: "BadParameter", info: `Invalid '${status}' status.`}})
  
    if (typeof to_clean === "undefined" || ![false, true, "false", "true", 0, 1].includes(to_clean))
      return res.status(400).send({error: {name: "BadParameter", info: "to_clean should be a boolean"}});
  
    if (to_clean === "false" || to_clean === false || to_clean === 0)
      to_clean = false
  
    if (to_clean === true || to_clean === "true" || to_clean === 1)
      to_clean = true
  
  
    if (!room_nb)
      return res.status(400).send({error: {name: "MissingParameter", info: "The room_nb is required"}});
  
    if (!service_id)
      return res.status(400).send({error: {name: "MissingParameter", info: "The service_id is required."}});
  
    service_id = parseInt(service_id, 10);
    if (isNaN(service_id))
      return res.status(400).send({error: {name: "BadParameter", info: "service_id should be an integer."}});
  
    let ret = null;
    await graph.createBed(room_nb, service_id, status, to_clean, (result) => {
      if (result.status)
        ret = res.sendStatus(201)
      else if (result.value.code === "No record found.")
        ret = res.status(400).send({error: {name: "ItemNotFound", info: "Service id or room not found."}});
      else
        ret = res.status(500).send({error: result.value})
    });
    return ret;
  },

  /**
   * Récupère un lit spécifique en fonction des paramètres de la requête.
   * @param {*} req Les données de la requête.
   * @param {*} res La réponse HTTP. 
   */
  get: async (req, res) => {
    const check = await checkPermission("beds", "get", req.user);
    
    if (!check)
      return res.status(401).send({error: "PermissionDenied"});
  
    let bed_uuid = req.params.bed_uuid;
    let ret = null;
  
    if (!bed_uuid)
      return res.status(400).send({error: {name: "MissingParameter", info: "The bed_uuid is required."}});
  
    if (!validate(bed_uuid, 4))
      return res.status(400).send({error: {name: "BadParameter", info: "bed_uuid should be a valid uuid."}});
  
    await graph.getBed(bed_uuid, (result) => {
      if (result.value.length === 0) {
        ret = res.status(404).send({error: {name: "ItemNotFound", info: `Bed corresponding to bed_uuid ${bed_uuid} not found.`}});
      } else {
        result.value[0].service_id = result.value[0].service_id.low;
        result.value[0].status = parseInt(result.value[0].status, 10);
        res.status(200);
        ret = res.json(result.value[0]);
      }
    });
  
    return ret;
  },

  /**
   * Récupère une liste des lits et retourne une réponse HTTP.
   * @param {*} req Les données de la requête.
   * @param {*} res La réponse HTTP.
   */
  list: async (req, res) => {
    const check = await checkPermission("beds", "get", req.user);
    
    if (!check)
      return res.status(401).send({error: "PermissionDenied"});
  
    let room_nb = req.query.room_nb;
    let service_id = req.query.service_id;
    let status = req.query.status;
    let to_clean = req.query.to_clean;
  
    if (service_id) {
      service_id = parseInt(service_id, 10);
      if (isNaN(service_id))
        return res.status(400).send({error: {name: "BadParameter", info: "Service_id should be an integer."}});
    }
  
    
    if (status && !["0", "1", "2"].includes(status))
      return res.status(400).send({error: {name: "BadParameter", info: `Invalid '${v}' status.`}});
  
    let tmp_to_clean = parseInt(to_clean, 10);
    if (!isNaN(to_clean)) {
      to_clean = tmp_to_clean
    }
  
    if (typeof to_clean != "undefined" && !["false", "true", 0, 1].includes(to_clean))
      return res.status(400).send({error: {name: "BadParameter", info: "to_clean should be a boolean"}});
  
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
  },

  /**
   * Met à jour le statut d'un lit en fonction des paramètres de la requête.
   * @param {*} req Les données de la requête.
   * @param {*} res La réponse HTTP.
   */
  updateStatus: async (req, res) => {
    const check = await checkPermission("beds", "update_status", req.user);
    
    if (!check)
      return res.status(401).send({error: "PermissionDenied"});
  
    let bed_uuid = req.params.bed_uuid;
    let status = req.body.status;
    let ret = null;
  
    if (!bed_uuid)
      return res.status(400).send({error: {name: "MissingParameter", info: "The bed_uuid is required."}});
    
    if (typeof status === 'undefined')
      return res.status(400).send({error: {name: "MissingParameter", info: "The status is required."}});
  
    if (!validate(bed_uuid, 4))
      return res.status(400).send({error: {name: "BadParameter", info: "bed_uuid should be a valid uuid."}});
  
    if (![0, 1, 2].includes(status) && !["0", "1", "2"].includes(status))
      return res.status(400).send({error: {name: "BadParameter", info: `Invalid '${status}' status.`}});
  
    let oldBed = await getOldBedInfo(bed_uuid);
  
    await graph.modifyStatus(bed_uuid, status, (result) => {
      if (result.status) {
        ret = res.sendStatus(202);
        updateUtil(bed_uuid, oldBed, result.value.properties, req.user)
      } else if (result.value.code === "No record found.")
        ret = res.status(400).send({error:  {name: "ItemNotFound", info: `Bed corresponding to bed_uuid ${bed_uuid} not found.`}});
      else
        ret = res.status(500).send({error: result.value})
    });

    return ret;
  },

  /**
   * Met à jour l'état de nettoyage d'un lit (nettoyé/à nettoyer) en fonction des paramètres de la requête.
   * @param {*} req Les données de la requête.
   * @param {*} res La réponse HTTP.
   */
  updateCleanState: async (req, res) => {
    const check = await checkPermission("beds", "update_clean", req.user);
    
    if (!check)
      return res.status(401).send({error: "PermissionDenied"});
  
    let bed_uuid = req.params.bed_uuid;
    let to_clean = req.body.to_clean;
    let ret = null;
  
    if (!bed_uuid)
      return res.status(400).send({error: {name: "MissingParameter", info: "The bed_uuid is required."}});
  
    if (!validate(bed_uuid, 4))
      return res.status(400).send({error: {name: "BadParameter", info: "bed_uuid should be a valid uuid."}});
  
    if (typeof to_clean == "undefined" || !["false", "true", false, true, 0, 1].includes(to_clean))
      return res.status(400).send({error: {name: "BadParameter", info: "to_clean should be a boolean"}});
  
    if (to_clean === "false" || to_clean === 0)
      to_clean = false
  
    if (to_clean === "true" || to_clean === 1)
      to_clean = true
  
  
    let oldBed = await getOldBedInfo(bed_uuid);
  
    await graph.modifyClean(bed_uuid, to_clean, (result) => {
      if (result.status) {
        ret = res.sendStatus(202);
        updateUtil(bed_uuid, oldBed, result.value.properties, req.user)
      } else if (result.value.code === "No record found.")
        ret = res.status(404).send({error: {name: "ItemNotFound", info: `Bed corresponding to bed_uuid ${bed_uuid} not found.`}});
      else
        ret = res.status(500).send({error: result.value})
    });
  
    return ret;
  },

  /**
   * Change la chambre dans laquelle se trouve le lit en fonction des paramètres de la requête.
   * @param {*} req Les données de la requête.
   * @param {*} res La réponse HTTP.
   */
  updateRoom: async (req, res) => {
    const check = await checkPermission("beds", "update_room", req.user);

    if (!check)
      return res.status(401).send({error: "PermissionDenied"});
  
    let bed_uuid = req.params.bed_uuid;
    let room_nb = req.body.room_nb;
    let service_id = req.body.service_id;
    let ret = null;
  
  
    if (!bed_uuid)
      return res.status(400).send({error: {name: "MissingParameter", info: "The bed_uuid is required."}});
  
    if (!validate(bed_id, 4))
      return res.status(400).send({error: {name: "BadParameter", info: "bed_uuid should be a valid uuid."}});
  
    service_id = parseInt(service_id, 10);
  
    if (typeof service_id == "undefined" || isNaN(service_id))
      return res.status(400).send({error: {name: "BadParameter", info: "service_id should be an integer."}});
  
    await graph.modifyBedRoom(bed_uuid, room_nb, service_id, (result) => {
      if (result.status)
        ret = res.sendStatus(202)
      else if (result.value.code === "No record found.")
        ret = res.status(404).send({error: {name: "ItemNotFound", info: `Bed corresponding to bed_uuid ${bed_uuid} or room ${room_nb} in service ${service_id} not found.`}});
      else
        ret = res.status(500).send({error: result.value});
    });
  
    return ret;
  },

  /**
   * Supprime un lit en fonction des paramètres de la requête.
   * @param {*} req Les données de la requête.
   * @param {*} res La réponse HTTP.
   */
  delete: async (req, res) => {
    const check = await checkPermission("beds", "delete", req.user);
    
    if (!check)
      return res.status(401).send({error: {name: "PermissionDenied"}});
  
    let bed_uuid = req.params.bed_uuid;
    let ret = null;
  
    if (!bed_uuid)
      return res.status(400).send({error: {name: "MissingParameter", info: "The bed_uuid is required."}});
    
    if (!validate(bed_uuid, 4))
      return res.status(400).send({error: {name: "BadParameter", info: "bed_uuid should be a valide uuid."}});
  
    await graph.getBed(bed_uuid, (result) => {
      if (result.value.length === 0)
        ret = res.status(404).send({error: {name: "ItemNotFound", info: `Bed corresponding to bed_uuid ${bed_uuid} not found.`}});
    });
  
    if (ret) return ret;
  
    await graph.deleteBed(bed_uuid, (result) => {
      if (result.status)
        ret = res.sendStatus(204);
      else
        ret = res.status(500).send({error: result.value})
    });
    return ret
  }  
};