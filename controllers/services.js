const graph = require ('./graph');

async function listServices(req, res) {
	let ret = null
	graph.listServices((result) => {
		res.status(200)
		console.log(result)
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

async function deleteService(req, res) {
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
		console.log(result)
		if (result.status == false) {
       		res.statusMessage = `Service corresponding to service_id ${service_id} not found.`
      		ret = res.sendStatus(404)
       	} else {
       		ret = res.sendStatus(204)
       	}
	})

	return ret
}

async function modifyService(req, res) {
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

async function createService(req, res) {
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