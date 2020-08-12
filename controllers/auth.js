const jwt = require('jsonwebtoken');
const graph = require ('./graph');

module.exports = {
  /**
   * Vérifie les informations renseignées dans la requête et modifie la réponse en conséquence.
   */
  logIn: async (req, res) => {
    const username = req.body["username"];
    const password = req.body["password"];

    if (!username || !password)
      return res.status(400).send({error: {name: "MissingParameter"}});

    let ret = null;

    await graph.getUser(username, async function(result) {
      if (result.status && result.value[0] && result.value[0].password === password) {
        let token = jwt.sign({username}, process.env["JWTSECRET"], {
          'expiresIn': process.env["JWTEXP"]
        });

        let permissions = null;

        await graph.getUserPermissions(username, (result) => {
          permissions = result.value;
        })
        ret = res.status(200).send({token, expiresIn: process.env.JWTEXP, permissions: permissions});
      } else if (result.status) {
        ret = res.status(400).send({error: {name: "WrongPassword"}});
      } else {
        ret = res.status(500).send({error: result.value});
      }
    })
    return ret;
  }
};