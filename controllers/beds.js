const graph = require ('./graph');


async function listBeds(req, res) {
	var service_id = req.query.service_id
	var status = req.query.status
	var to_clean = req.query.to_clean


	if (service_id) {
		service_id = parseInt(service_id, 10);
		if (isNaN(service_id)) {
			res.statusMessage = "Service_id should be an integer."
			return res.sendStatus(400)
		}
	}

	if (status) {
		status.forEach((v) =>  {
		 	if (!["Free", "Leaving", "Busy"].includes(v)) {
				res.statusMessage = `Invalid '${v}' status.`
				res.status(400)
			}
		})
		if (res.statusCode == 400) {
			return res.end()
		}
	}

	if (to_clean && !["false", "true"].includes(to_clean)) {
		res.statusMessage = "to_clean should be a boolean"
		return res.sendStatus(400)
	}

	let ret = null;
	graph.listBed(service_id, status, to_clean, (result) => {
	    res.status(200)
	    console.log(result)
	    if (result.status == false && result.value.code == "No record found.") {
	    	ret = res.json({"beds": []})
	    } else {
			ret = res.json({
		   		"beds": result.value
	   		})
	   	}
	})
	return ret;
}

async function getBed(req, res) {
	var bed_id = req.params.bed_id


	if (!bed_id) {
		res.statusMessage = "The bed_id is required."
		return res.sendStatus(404)
	}
	bed_id = parseInt(bed_id, 10);
	if (isNaN(bed_id)) {
		res.statusMessage = "bed_id should be an integer."
		return res.sendStatus(400)
	}
	if (![1, 1053, 321].includes(bed_id)) {
		res.statusMessage = `Bed corresponding to bed_id ${bed_id} not found.`
 		return res.sendStatus(404)
	}

	let ret = null;
	 await graph.getBed(bed_id, (result) => {
		console.log(result)
		res.status(200)
		let = res.json(result)
	})

	return ret;

}

function deleteBed(req, res) {
	var bed_id = req.params.bed_id

	if (!bed_id) {
		res.statusMessage = "The bed_id is required."
		return res.sendStatus(404)
	}
	bed_id = parseInt(bed_id, 10);
	if (isNaN(bed_id)) {
		res.statusMessage = "bed_id should be an integer."
		return res.sendStatus(400)
	}
	if (![1, 1053, 321].includes(bed_id)) {
		res.statusMessage = `Bed corresponding to bed_id ${bed_id} not found.`
 		return res.sendStatus(404)
	}

	return res.sendStatus(204)
}

function modifyBed(req, res) {
	var bed_id = req.params.bed_id
	var status = req.body.status
	var to_clean = req.body.to_clean
	var display_name = req.body.display_name
	var service_id = req.body.service_id


	if (!bed_id) {
		res.statusMessage = "The bed_id is required."
		return res.sendStatus(404)
	}
	bed_id = parseInt(bed_id, 10);
	if (isNaN(bed_id)) {
		res.statusMessage = "bed_id should be an integer."
		return res.sendStatus(400)
	}
	if (![1, 1053, 321].includes(bed_id)) {
		res.statusMessage = `Bed corresponding to bed_id ${bed_id} not found.`
 		return res.sendStatus(404)
	}

	if (!status || !["Free", "Leaving", "Busy"].includes(status)) {
		res.statusMessage = `Invalid '${status}' status.`
		return res.sendStatus(400)
	}

	if (!to_clean || !["false", "true"].includes(to_clean)) {
		res.statusMessage = "to_clean should be a boolean"
		return res.sendStatus(400)
	}

	if (!display_name || display_name === "") {
		res.statusMessage = "Invalid display_name"
		return res.sendStatus(400)
	}

	if (!service_id) {
		res.statusMessage = "The service_id is required."
		return res.sendStatus(400)
	}
	service_id = parseInt(service_id, 10);
	if (isNaN(service_id)) {
		res.statusMessage = "service_id should be an integer."
		return res.sendStatus(400)
	}

	return res.sendStatus(204)
}

function modifyBedState(req, res) {
 	var bed_id = req.params.bed_id
 	var status = req.body.status


	if (!bed_id) {
		res.statusMessage = "The bed_id is required."
		return res.sendStatus(404)
	}
	bed_id = parseInt(bed_id, 10);
	if (isNaN(bed_id)) {
		res.statusMessage = "bed_id should be an integer."
		return res.sendStatus(400)
	}
	if (![1, 1053, 321].includes(bed_id)) {
		res.statusMessage = `Bed corresponding to bed_id ${bed_id} not found.`
 		return res.sendStatus(404)
	}

	if (!status || !["Free", "Leaving", "Busy"].includes(status)) {
		res.statusMessage = `Invalid '${status}' status.`
		return res.sendStatus(400)
	}

 	return res.sendStatus(204)
 }

function cleanlinessBed(req, res) {
	var bed_id = req.params.bed_id
	var to_clean = req.body.to_clean


	if (!bed_id) {
		res.statusMessage = "The bed_id is required."
		return res.sendStatus(404)
	}
	bed_id = parseInt(bed_id, 10);
	if (isNaN(bed_id)) {
		res.statusMessage = "bed_id should be an integer."
		return res.sendStatus(400)
	}
	if (![1, 1053, 321].includes(bed_id)) {
		res.statusMessage = `Bed corresponding to bed_id ${bed_id} not found.`
 		return res.sendStatus(404)
	}

	if (!to_clean || !["false", "true"].includes(to_clean)) {
		res.statusMessage = "to_clean should be a boolean"
		return res.sendStatus(400)
	}

	return res.sendStatus(204)
}

async function createBed(req, res) {
	var status = req.body.status
	var to_clean = req.body.to_clean
	var display_name = req.body.display_name
	var service_id = req.body.service_id

	if (!status || !["Free", "Leaving", "Busy"].includes(status)) {
		res.statusMessage = `Invalid '${status}' status.`
		return res.sendStatus(400)
	}

	if (!to_clean || !["false", "true"].includes(to_clean)) {
		res.statusMessage = "to_clean should be a boolean"
		return res.sendStatus(400)
	}

	if (!display_name || display_name === "") {
		res.statusMessage = "Invalid display_name"
		return res.sendStatus(400)
	}

	if (!service_id) {
		res.statusMessage = "The service_id is required."
		return res.sendStatus(400)
	}
	service_id = parseInt(service_id, 10);
	if (isNaN(service_id)) {
		res.statusMessage = "service_id should be an integer."
		return res.sendStatus(400)
	}

	let ret = null
	await graph.createBed(status, to_clean, display_name, service_id, (result) => {
		if (result.status) {
			ret = res.sendStatus(201)
		} else if (result.value.code == "No record found.") {
			res.status(400)
			ret = res.send({error: "Service id not found."})
		} else {
			res.status(400)
			ret = res.send({error: result.value})
		}
	})
	return ret;
}

module.exports = {
  listBeds: listBeds,
  getBed: getBed,
  createBed: createBed,
  deleteBed: deleteBed,
  modifyBed: modifyBed,
  cleanlinessBed: cleanlinessBed,
  modifyBedState: modifyBedState
};