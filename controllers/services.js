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
	return res.send(200)
}

function deleteService(req, res) {
	var service_id = req.params.service_id

	return res.send(204)
}

function modifyService(req, res) {
	var service_id = req.params.service_id
	var name = req.body.name

	return res.send(204)
}

function createService(req, res) {
	var name = req.body.name

 	return res.send(204)
 }

 module.exports = {
	listServices: listServices,
	deleteService: deleteService,
	modifyService: modifyService,
	createService: createService,
 }