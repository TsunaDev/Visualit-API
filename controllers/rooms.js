const graph = require ('./graph');
const {checkPermission} = require('./common');




module.exports = {
  /**
   * Crée une chambre sur le graphe.
   */
  create: async (req, res) => {
    let ret = null;
    const check = await checkPermission("room", "create", req.user);
    
    if (!check)
      return res.status(401).send({error: {name: "PermissionDenied"}});
    let number = req.body.room_nb;
    let service = req.body.service_id;
    let nb_beds = req.body.nb_beds;

    if (!number || !service)
      return res.status(400).send({error: {name: "MissingParameter"}});
    
    if (!nb_beds)
      nb_beds = 0;
    else
      nb_beds = parseInt(nb_beds, 10);

    service = parseInt(service, 10);

    if (isNaN(service))
      return res.status(400).send({error: {name: "BadParameter", info: "service_id has to be an integer."}});
    else if (isNaN(nb_beds))
      return res.status(400).send({error: {name: "BadParameter", info: "nb_beds has to be an integer."}});
    

    await graph.getRoom(number, service, function(result) {
      if (result.status) {
        res.status(400).send({error: {name: "UniqueConstraintError", info: "Room already exists"}});
      }
    });

    if (res.statusCode === 400) {
      return ret;
    }

    let room = null;

    await graph.createRoom(number, service, function(result) {
      if (result.status)
        room = result.value;
      else {
        res.status(500).send({error: result.value});
      }
    });
    let beds = [];

    if (res.statusCode !== 400 && res.statusCode !== 500) {
      for (i = 0; i < nb_beds; i++) {
        await graph.createBed(number, service, "0", false, function(result) {
          if (result.status) {
            result.value.properties.status = parseInt(result.value.properties.status, 10);
            beds.push(result.value.properties);
          } else {
            res.status(500).send({error: result.value});
          }
        });
      }
    }

    if (res.statusCode !== 400 && res.statusCode !== 500)
      ret = res.status(201).send({number: room.properties.number, service_id: service, beds: beds});
    return ret;
  },

  /**
   * Récupère une chambre sur le graphe.
   */
  get: async (req, res) => {
    const check = await checkPermission("room", "get", req.user);
    
    if (!check)
      return res.status(401).send({error: {name: "PermissionDenied"}});

    let ret = null;
    const room_nb = req.query.room_nb;
    let service = req.query.service_id;
    if (!room_nb) {

      if (service) {
        service = parseInt(service, 10);
        if (isNaN(service))
          return res.status(400).send({error: {name: "BadParameter", info: "service_id has to be an integer."}});
      }

      await graph.listRooms(service, function(result) {
        if (result.status)
          ret = res.status(200).send(result.value);
        else
          ret = res.status(500).send({error: result.value});
      });
    } else {
      if (!service)
        return res.status(400).send({error: {name: "MissingParameter"}});
      service = parseInt(service, 10);
      if (isNaN(service))
        return res.status(400).send({error: {name: "BadParameter", info: "service_id has to be an integer."}});
      
      await graph.getRoom(room_nb, service, function(result) {
        if (result.status)
          ret = res.status(200).send(result.value);
        else
          ret = res.status(500).send({error: result.value})
      });
    }
    return ret;
  },

  /**
   * Récupère toutes les chambres présentes sur le graphe.
   */
  getAll: async (req, res) => {
    const check = await checkPermission("room", "get", req.user);
    
    if (!check)
      return res.status(401).send({error: {name: "PermissionDenied"}});

    let ret = null;
    let service = req.query.service_id

    if (service) {
      service = parseInt(service, 10);
      if (isNaN(service))
        return res.status(400).send({error: {name: "BadParameter", info: "service_id has to be an integer."}});
    }
   
    await graph.listRooms(service, function(result) {
      if (result.status)
        ret = res.status(200).send(result.value);
      else
        ret = res.status(500).send({error: result.value});
    });
    return ret;
  },

  /**
   * Met à jour le numéro de la chambre sur le graphe.
   */
  updateNumber: async (req, res) => {
    const check = await checkPermission("room", "update", req.user);
    let ret = null;

    if (!check)
      return res.status(401).send({error: {name: "PermissionDenied"}});

    const room_nb = req.body.room_nb;
    const new_room_nb = req.body.new_room_nb;
    let service = req.body.service_id;

    if (!room_nb || !new_room_nb || !service)
      return res.status(400).send({error: {name: "MissingParameter"}});
    
    service = parseInt(service, 10);
    if (isNaN(service))
      return res.status(400).send({error: {name: "BadParameter", info: "service_id has to be an integer."}});

    await graph.modifyRoomNumber(room_nb, new_room_nb, service, function(result) {
      if (result.status)
        ret = res.status(202).send("Room number successfuly modified.");
      else
        ret = res.status(500).send({error: result.value});
    });
    return ret;
  },

  /**
   * Met à jour le service d'une chambre sur le graphe.
   */
  updateService: async (req, res) => {
    const check = await checkPermission("room", "update", req.user);
    let ret = null;

    if (!check)
      return res.status(401).send({error: {name: "PermissionDenied"}});

    const room_nb = req.body.room_nb;
    let service = req.body.service_id;
    let new_service = req.body.new_service_id;

    if (!room_nb || !new_service || !service)
      return res.status(400).send({error: {name: "MissingParameter"}});

    service = parseInt(service, 10);
    new_service = parseInt(new_service, 10);
    if (isNaN(service))
      return res.status(400).send({error: {name: "BadParameter", info: "service_id has to be an integer."}});
    if (isNaN(new_service))
      return res.status(400).send({error: {name: "BadParameter", info: "new_service_id has to be an integer."}})

    await graph.modifyRoomService(room_nb, service, new_service, function(result) {
      if (result.status)
        ret = res.status(202).send("Room's service successfully modified.");
      else
        ret = res.status(500).send({error: result.value});
    });
    return ret;
  },

  /**
   * Supprime une chambre sur le graphe.
   */
  delete: async (req, res) => {
    const check = await checkPermission("room", "delete", req.user);
    let ret = null;

    if (!check)
      return res.status(401).send({error: {name: "PermissionDenied"}});

    const room_nb = req.body.room_nb;
    let service = req.body.service_id;

    if (!room_nb || !service)
     return res.status(400).send({error: {name: "MissingParameter"}});

    service = parseInt(service, 10);
    if (isNaN(service))
      return res.status(400).send({error: {name: "BadParameter", info: "service_id has to be an integer."}});
    
    await graph.deleteRoom(room_nb, service, function(result) {
      if (result.status)
        ret = res.status(204).send({info: "Room successfully deleted."});
      else
        ret = res.status(500).send({error: result.value});
    });
    return res;
  }
}