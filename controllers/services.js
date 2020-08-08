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

/**
 * Récupère la liste des services.
 */
async function listServices(req, res) {
  const check = await checkPermission("services", "get", req.user);
  
  if (!check)
    return res.status(401).send({error: {name: "PermissionDenied"}});

	let ret = null
	graph.listServices((result) => {
		res.status(200);
		if (result.status == false && result.value.code == "No record found.") {
			ret = res.json({"services": []})
		} else {
			ret = res.json({
				"services": result.value
			})
		}
	})
	return ret;
}

/**
 * Supprime un service.
 */
async function deleteService(req, res) {
  const check = await checkPermission("services", "delete", req.user);
  
  if (!check)
    return res.status(401).send({error: {name: "PermissionDenied"}});

	var service_id = req.params.service_id
	let ret = null

	if (!service_id) {
		res.statusMessage = "The service_id is required for service deletion"
		return res.sendStatus(404)
	}
	service_id = parseInt(service_id, 10);
	if (isNaN(service_id)) {
		res.statusMessage = "Service_id should be an integer."
		return res.sendStatus(400)
	}
	graph.deleteService(service_id, (result) => {
		if (result.status == false) {
       		res.statusMessage = `Service corresponding to service_id ${service_id} not found.`
      		ret = res.sendStatus(404)
       	} else {
       		ret = res.sendStatus(204)
       	}
	})

	return ret
}

/**
 * Modifie un service.
 */
async function modifyService(req, res) {
  const check = await checkPermission("services", "update", req.user);
  
  if (!check)
    return res.status(401).send({error: {name: "PermissionDenied"}});

	var service_id = req.params.service_id
	var name = req.body.name

	if (!service_id) {
		res.statusMessage = "The service_id is required for service modification"
		return res.sendStatus(404)
	}
	if (!name || name === "") {
		res.statusMessage = "The name is required for service modification"
		return res.sendStatus(400)
	}
	service_id = parseInt(service_id, 10);
	if (isNaN(service_id)) {
		res.statusMessage = "Service_id should be an integer."
		return res.sendStatus(400)
	}

	await graph.modifyService(name, service_id, (result) => {
		if (result.status) {
			res.status(204)
		} else {
			res.statusMessage = `Service corresponding to service_id ${service_id} not found.`
			res.status(404)
		}
	})
 	return res.end()
}

/**
 * Crée un service.
 */
async function createService(req, res) {
  const check = await checkPermission("services", "create", req.user);
  
  if (!check)
    return res.status(401).send({error: {name: "PermissionDenied"}});

	var name = req.body.name

	if (!name || name === "") {
		res.statusMessage = "The name is required for service creation"
		res.status(400)
		return res.end()
	}
	await graph.createService(name, (result) => {
		if (result.status) {
			res.status(201)
		} else {
			res.status(401)
			res.statusMessage = result.value
		}
	})
 	return res.end()
 }

 module.exports = {
	listServices: listServices,
	deleteService: deleteService,
	modifyService: modifyService,
	createService: createService,
 }