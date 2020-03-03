const graph = require ('./graph');

async function userIsAdmin(req) {
  let role = null;
  await graph.getUserRole(req.user.username, (result) => {
    if (result.status)
      role = result.value.low;
    else
      role = 0;
  });
  if (role !== 1)
    return false;
  return true;
}

module.exports = {
  create: async(req, res) => {
    const check = await userIsAdmin(req);
    let ret = null;

    if (!check)
      ret = res.status(401).send({error: {name: "InvalidRole"}});
    else {
      const role = req.body.role
      const id = req.body.index

      if (!role || !id)
        ret = res.status(401).send({error: {name: "MissingParameter"}});
      else {
        await graph.createRole(role, index, function(result) {
          if (result.status)
            ret = res.sendStatus(201);
          else
            ret = res.status(401).send({error: result.value}); // TODO: Revoir les normes
        });
      }
    }
    return ret;
  },

  get: async(req, res) => {
    const index = req.body.index
    const role = req.body.role
  
    let ret = null;

    if (role)
      await graph.getRole(role, function(result) {
        if (result.status) {
          ret = res.status(200).send({name: result.value.properties.name, index: result.value.properties.index.low});
        } else
          ret = res.status(401).send({error: result.value});
      });
    else if (index)
      await graph.getRoleByIndex(index, function(result) {
        if (result.status)
          ret = res.status(200).send({name: result.value.properties.name, index: result.value.properties.index.low});
        else
          ret = res.status(401).send({error: result.value});
      });
    else
      ret = res.status(401).send({error: "Missing argument"});
    
    return ret;
  },

  getAllRoles: async(req, res) => {
    await graph.getAllRoles(function(result) {
      if (result.status) {
        let list = [];

        for (let i = 0; i < result.value.length; i++) {
          list.push({name: result.value[i].name, index: result.value[i].index.low});
        }
        ret = res.status(200).send(list);
      } else
        ret = res.status(401).send({error: result.value});
    });
  },

  update: async(req, res) => {
    let ret = null;
    const role = req.body.role;
    const index = req.body.index;

    const check = await userIsAdmin(req);
    if (!check) {
      ret = res.status(401).send({error: {name: "InvalidRole"}});
    } else if (role) {
      await graph.updateRole(role, args, function(result) {
        if (result.status)
          ret = res.status(202).send(result.value.properties);
        else {
          ret = res.status(401).send({error: result.value});
        }
      });
    } else if (index) {
      await graph.updateRoleByIndex(index, args, function(result) {
        if (result.status)
          ret = res.status(202).send(result.value.properties);
        else {
          ret = res.status(401).send({error: result.value});
        }
      });
    } else
      ret = res.status(401).send({error: "Missing Parameter"})

    return ret;
  },

  delete: async(req, res) => {
    let ret = null;
    const check = await userIsAdmin(req);
    const role = req.body.role
    const index = req.body.index

    if (!check)
      ret = res.status(401).send({error: {name: "InvalidRole"}});
    else if (role) {
      await graph.deleteRole(role, function(result) {
        if (result.status)
          ret = res.sendStatus(204);
        else
          ret = res.status(401).send({error: result.value});
      });
    } else if (index) {
      await graph.deleteRoleByIndex(index, function(result) {
        if (result.status)
          ret = res.sendStatus(204);
        else
          ret = res.status(401).send({error: result.value});
      });
    } else
      ret = res.status(401).send({error: "Missing Parameter"});

    return ret;
  }
};