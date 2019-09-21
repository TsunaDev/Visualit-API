const jwt = require('jsonwebtoken');
const graph = require ('./graph');

module.exports = {
  logIn: async (req, res) => {
    const username = req.body["username"];
    const password = req.body["password"];
    
    if (!username || !password)
      return res.send(401).send({error: {name: "MissingParameter"}});
    
    let ret = null;

    await graph.getUser(username, function(result) {
      if (result.status && result.value.properties.password === password) {
        let token = jwt.sign({username}, process.env["JWTSECRET"], {
          'expiresIn': process.env["JWTEXP"]
        });
        ret = res.status(200).send({token, expiresIn: process.env.JWTEXP});
      } else if (result.status) {
        ret = res.status(401).send({error: {name: "WrongPassword"}});
      } else {
        ret = res.status(401).send({error: result.value});
      }
    })

    return ret;
  }
};