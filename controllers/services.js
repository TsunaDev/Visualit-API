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

	if (!service_id)
		return res.status(400).send({error: {name: "MissingParameter", info: "The service_id is required for service deletion"}});

	service_id = parseInt(service_id, 10);
	if (isNaN(service_id))
		return res.status(400).send({error: {name: "BadParameter", info: "service_id should be an integer."}});

	graph.deleteService(service_id, (result) => {
		if (result.status == false)
    	ret = res.status(404).send({error: {name: "ItemNotFound", info:`Service corresponding to service_id ${service_id} not found.`}});
    else
    	ret = res.sendStatus(204);
	});

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

	if (!service_id)
		return res.status(404).send({error: {name: "MissingParameter", info: "The service_id is required for service modification"}});

	if (!name || name === "")
		return res.status(400).send({error: {name: "MissingParameter", info: "The name is required for service modification"}});

	service_id = parseInt(service_id, 10);
	if (isNaN(service_id))
		return res.status(400).send({error: {name: "BadParameter", info: "service_id should be an integer."}});

	await graph.modifyService(name, service_id, (result) => {
		if (result.status)
			res.status(202);
		else
			res.status(404).send({error: {name: "ItemNotFound", info: `Service corresponding to service_id ${service_id} not found.`}});
	});
	return res.end()
}

/**
 * Crée un service.
 */
async function createService(req, res) {
	const check = await checkPermission("services", "create", req.user);
	let ret = null;
  
  if (!check)
    return res.status(401).send({error: {name: "PermissionDenied"}});

	var name = req.body.name

	if (!name || name === "")
		return res.status(400).send({error: {name: "MissingParameter", info: "The name is required for service creation"}});

	await graph.createService(name, (result) => {
		if (result.status)
			ret = res.sendStatus(201);
		else
			res.status(500).send(result.value);
	});

 	return ret;
 }

 module.exports = {
	listServices: listServices,
	deleteService: deleteService,
	modifyService: modifyService,
	createService: createService,
 }