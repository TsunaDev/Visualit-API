function listBeds(req, res) {
	var service_id = req.query.service_id
	var status = req.query.status
	var to_clean = req.query.to_clean

	res.json({
	   "beds": [
     	  {
     	      "bed_id": 1,
     	      "service_id": 1,
     	      "status": "Free",
     	      "to_clean": true,
              "display_name": "Chambre 402",
          },
          {
              "bed_id": 1053,
              "service_id": 1,
              "status": "Leaving",
              "to_clean": true,
              "display_name": "Chambre 322",
          },
          {
          	"bed_id": 321,
          	"service_id": 1,
          	"status": "Busy",
          	"to_clean": true,
          	"display_name": "Chambre 107",
          }
       ]
    })
	return res.send(200)
}

function getBed(req, res) {
	var bed_id = req.params.bed_id

	res.json(
		{
		  "bed_id": 10,
		  "service_id": 1,
		  "status": "Free",
		  "to_clean": false,
		  "display_name": "Chambre 420"
		}
	)

	return res.send(200)
}

function deleteBed(req, res) {
	var bed_id = req.params.bed_id

	return res.send(204)
}

function modifyBed(req, res) {
	var bed_id = req.params.bed_id
	var status = req.body.status
	var to_clean = req.body.to_clean
	var display_name = req.body.display_name
	var service_id = req.body.service_id

	return res.send(204)
}

function modifyBedState(req, res) {
 	var bed_id = req.params.bed_id
 	var status = req.body.status

 	return res.send(204)
 }

function cleanlinessBed(req, res) {
	var bed_id = req.params.bed_id
	var to_clean = req.body.to_clean

	return res.send(204)
}

function createBed(req, res) {
	var status = req.body.status
	var to_clean = req.body.to_clean
	var display_name = req.body.display_name
	var service_id = req.body.service_id

	return res.send(201)
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