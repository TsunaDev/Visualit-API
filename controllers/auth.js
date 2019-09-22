const jwt = require('jsonwebtoken');
module.exports = {
  logIn: (req, res) => {
      const username = req.body["username"];
      const password = req.body["password"];
      if (!username || !password)
          return res.sendStatus(401);
      if (username === "foo" && password === "bar") {
          let token = jwt.sign({username}, process.env["JWTSECRET"], {
              'expiresIn': process.env["JWTEXP"]
          });
          return res.status(200).send({token, expiresIn: parseInt(process.env.JWTEXP)});
      } else {
          return res.sendStatus(401);
      }
  }
};
