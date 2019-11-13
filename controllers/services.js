function listServices(req, res) {
	res.json(
		{
			"services": [
				{
					"name": "Cardiologie",
					"id": 1
				},
				{
					"name": "Urgences",
					"id": 2
				},
				{
					"name": "Radiologie",
					"id": 4
				},
				{
					"name": "Pédiatrie",
					"id": 7
				},
				{
					"name": "Maternité",
					"id": 8
				}
			]
		}
	)
	return res.sendStatus(200)
}

function deleteService(req, res) {
	var service_id = req.params.service_id

	if (!service_id) {
		res.statusMessage = "The service_id is required for service deletion"
		return res.sendStatus(404)
	}
	service_id = parseInt(service_id, 10);
	if (isNaN(service_id)) {
		res.statusMessage = "Service_id should be an integer."
		return res.sendStatus(400)
	}
	if (![1, 2, 4, 7, 8].includes(service_id)) {
		res.statusMessage = `Service corresponding to service_id ${service_id} not found.`
 		return res.sendStatus(404)
	}

	return res.sendStatus(204)
}

function modifyService(req, res) {
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
	if (![1, 2, 4, 7, 8].includes(service_id)) {
		res.statusMessage = `Service corresponding to service_id ${service_id} not found.`
		return res.sendStatus(404)
	}

	return res.sendStatus(204)
}

function createService(req, res) {
	var name = req.body.name

	console.log(name)

	if (!name || name === "") {
		res.statusMessage = "The name is required for service creation"
		res.status(400)
		return res.end()
	}
 	return res.sendStatus(204)
 }

 module.exports = {
	listServices: listServices,
	deleteService: deleteService,
	modifyService: modifyService,
	createService: createService,
 }