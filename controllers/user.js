const graph = require ('./graph');

async function checkUserRole(req) {
  if (!req.body["username"] && !req.query.username)
    req.body["username"] = req.user.username;
  else if (req.query.username)
    req.body["username"] = req.query.username;
  if (req.body["username"] !== req.user.username) {
    let role = null;

    await graph.getUserRole(req.user.username, (result) => {
      if (result.status)
        role = result.value;
      else
        role = "Unknown";
    });

    if (role !== "admin") {
      console.log(role);
      return false;
    }
  }
  return true;
}

module.exports = {
  register: async (req, res) => {
    const username = req.body["username"];
    const password = req.body["password"];
    const role = req.body["role"];

    if (!username || !password || !role)
    return res.send(401).send({error: {name: "MissingParameter"}});

    let ret = null;

    await graph.createUser(username, password, role, function(result) {
      if (result.status)
        ret = res.sendStatus(201);
      else
        ret = res.status(401).send({error: result.value}); // TODO: Revoir les normes
    });

    return ret;
  },

  fetchInfos: async (req, res) => {
    let ret = null;
    
    const check = await checkUserRole(req);
    if (!check)
      ret = res.status(401).send({error: {name: "InvalidRole"}});
    else {
      await graph.getUser(req.body["username"], function(result) {
        if (result.status)
          ret = res.status(200).send(result.value.properties);
        else
          ret = res.status(401).send({error: result.value}); // 404?
      });
    }

    return ret;
  },

  update: async (req, res) => {
    let ret = null;

    if (!checkUserRole(req))
      ret = res.status(401).send({error: {name: "InvalidRole"}});
    else {
      await graph.updateUser(req.body["username"], req.body, function(result) {
        if (result.status)
          ret = res.status(201).send(result.value.properties);
        else
          ret = res.status(401).send({error: result.value});
      });
    }

    return ret;
  },

  delete: async (req, res) => {
    let ret = null;

    if (!checkUserRole(req))
      ret = res.status(401).send({error: {name: "InvalidRole"}});
    else {
      await graph.deleteUser(req.body["username"], function(result) {
        if (result.status)
          ret = res.sendStatus(204);
        else
          ret = res.status(401).send({error: result.value});
      });
    }

    return ret;
  }
};