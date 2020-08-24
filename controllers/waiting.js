const graph = require ('./graph');

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

let waitingList = [];

function findInList(date) {
  for (let item of waitingList)
    if (item.date === date)
      return item;
  return null;
}

function deleteInList(date) {
  for (let item of waitingList)
    if (item.date === date) {
      let index = waitingList.indexOf(item);
      if (index > -1)
        waitingList.splice(index, 1);
        return true;
    }
  return false;
}

function getTicketsOfService(service) {
  let list = [];

  for (let item of waitingList)
    if (item.service === service)
      list.push(item);
  return list;
}

module.exports = {
  /**
   * Crée un ticket sur la liste d'attente.
   */
  create: async (req, res) => {
    let ret = null;
    const check = await checkPermission("waiting", "create", req.user);
    
    if (!check)
      return res.status(401).send({error: {name: "PermissionDenied"}});

    const date = Date.now().toString();
    let service = req.body.service_id;
    const room = req.body.room || "";
    const bed = req.body.bed || "";
    const comment = req.body.comment || "";

    if (!service)
      return res.status(400).send({error: {name: "MissingParameter"}});
    
    service = parseInt(service, 10);
    if (isNaN(service))
      return res.status(400).send({error: {name: "BadParameter", info: "service_id should be a number"}});

    if (findInList(date))
      return res.status(400).send({error: {name: "BadParameter", info: "There's already a ticket for this date"}});
    
    waitingList.push({date: date, service: service, room: room, bed: bed, comment: comment});

    return res.sendStatus(201);
  },

  update: async(req, res) => {
    const check = await checkPermission("waiting", "update", req.user);

    if (!check)
      return res.status(401).send({error: {name: "PermissionDenied"}});
    
    const date = req.body.date;
    const service = parseInt(req.body.service_id, 10);
    const room = req.body.room;
    const bed = req.body.bed;
    const comment = req.body.comment;

    let item = findInList(date);
    
    if (!item)
      return res.status(404).send({error: {name: "ItemNotFound", info: "Couldn't find any ticket at the date you gave."}});
    
    if (service && !isNaN(service))
      item.service = service;
    item.room = room || item.room;
    item.bed = bed || item.bed;
    item.comment = comment || item.comment;
    
    return res.sendStatus(202);
  },

  /**
   * Supprime un ticket sur la liste d'attente.
   */
  delete: async (req, res) => {
    const check = await checkPermission("waiting", "delete", req.user);

    if (!check)
      return res.status(401).send({error: {name: "PermissionDenied"}});

    const date = req.body.date;

    if (!date)
      return res.status(400).send({error: {name: "MissingParameter"}});

    if (deleteInList(date))
      return res.sendStatus(204);
    else
      return res.status(404).send({error: {name: "ItemNotFound", info: "Couldn't find a ticket at this date."}})

  },

  /**
   * Récupère la liste des tickets en général, dans un service particulier ou un ticket précis.
   */
  get: async (req, res) => {
    const check = await checkPermission("waiting", "get", req.user);
    
    if (!check)
      return res.status(401).send({error: {name: "PermissionDenied"}});

    const date = req.body.date;
    const service = parseInt(req.body.service_id, 10);
  
    
    if (date) {
      let item = findInList(date);
      if (!item)
        return res.status(404).send({error: {name: "ItemNotFound"}});
      else
        return res.status(200).send(item);
    } else if (service) {
      if (isNaN(service))
      return res.status(400).send({error: {name: "BadParameter", info: "service_id should be a number"}});
      else
        return res.status(200).send(getTicketsOfService(service))
    } else
      return res.status(200).send(waitingList);
  }
}