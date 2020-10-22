const graph = require ('./graph');
const {checkPermission} = require('./common');



module.exports = {
  /**
   * Crée un nouveau rôle.
   */
  create: async(req, res) => {
    let ret = null;
    const check = await checkPermission("roles", "create", req.user);

    if (!check)
      return res.status(401).send({error: "PermissionDenied"});
    const role = req.body.role
    const index = req.body.index
    const permissions = req.body.permissions;

    if (!role || !index || !permissions)
      ret = res.status(400).send({error: "MissingParameter"});
    else {
      await graph.createRole(role, index, permissions, function(result) {
        if (result.status)
          ret = res.sendStatus(201);
        else
          ret = res.status(500).send({error: result.value});
      });
    }
    return ret;
  },

  /**
   * Récupère un rôle en fonction de son nom ou de son indexe.
   */
  get: async(req, res) => {
    const index = req.query.index
    const role = req.query.role
    const check = await checkPermission("roles", "get", req.user);

    if (!check)
      return res.status(401).send({error: "PermissionDenied"});

    let ret = null;

    if (role)
      await graph.getRole(role, function(result) {
        if (result.status) {
          ret = res.status(200).send({name: result.value.properties.name, index: parseInt(result.value.properties.index, 10)});
        } else
          ret = res.status(500).send({error: result.value});
      });
    else if (index)
      await graph.getRoleByIndex(index, function(result) {
        if (result.status)
          ret = res.status(200).send({name: result.value.properties.name, index: parseInt(result.value.properties.index, 10)});
        else
          ret = res.status(500).send({error: result.value});
      });
    else
      await graph.getAllRoles(function(result) {
        if (result.status) {
          let list = [];

          for (let i = 0; i < result.value.length; i++) {
            list.push({name: result.value[i].name, index: parseInt(result.value[i].index, 10), permissions: result.value[i].permissions});
          }
          ret = res.status(200).send(list);
        } else
          ret = res.status(500).send({error: result.value});
      });

    return ret;
  },

  /**
   * Récupère tous les rôles présents sur le graphe.
   */
  getAll: async(req, res) => {
    const check = await checkPermission("roles", "get", req.user);

    if (!check)
      return res.status(401).send({error: "PermissionDenied"});

    await graph.getAllRoles(function(result) {
      if (result.status) {
        let list = [];

        for (let i = 0; i < result.value.length; i++) {
          list.push({name: result.value[i].name, index: parseInt(result.value[i].index, 10), permissions: result.value[i].permissions});
        }
        ret = res.status(200).send(list);
      } else
        ret = res.status(500).send({error: result.value});
    });
  },

  /**
   * Met à jour un rôle sur le graphe.
   */
  update: async(req, res) => {
    let ret = null;
    const role = req.body["role"];
    let args = JSON.parse(JSON.stringify(req.body));
    delete args.role
    const check = await checkPermission("roles", "update", req.user);

    if (!check)
      return res.status(401).send({error: "PermissionDenied"});

    if (role) {
      await graph.updateRole(role, args, function(result) {
        if (result.status)
          ret = res.status(202).send(result.value.properties);
        else {
          ret = res.status(500).send({error: result.value});
        }
      });
    } else
      ret = res.status(400).send({error: "MissingParameter"})

    return ret;
  },

  updatePermissions: async(req, res) => {
    let ret = null;
    const role = req.body["role"];
    const index = req.body["index"];
    const permissions = req.body["permissions"];

    const check = await checkPermission("roles", "update", req.user);

    if (!check)
      return res.status(401).send({error: "PermissionDenied"});

    if (role && permissions)
      await graph.updateRolePermissions(role, permissions, function(result) {
        if (result.status)
          ret = res.sendStatus(202);
        else
          ret = res.status(500).send({error: result.value});
      });
    else if (index && permissions)
      await graph.updateRolePermissionsByIndex(index, permissions, function(result) {
        if (result.status)
          ret = res.sendStatus(202);
        else
          ret = res.status(500).send({error: result.value});
      });
    else
      ret = res.status(400).send({error: "MissingParameter"});

    return ret;
  },

  /**
   * Supprime un rôle sur le graphe.
   */
  delete: async(req, res) => {
    let ret = null;
    const role = req.body.role
    const index = req.body.index
    const check = await checkPermission("roles", "delete", req.user);
    
    if (!check)
      return res.status(401).send({error: "PermissionDenied"});

    if (role) {
      await graph.deleteRole(role, function(result) {
        if (result.status)
          ret = res.sendStatus(204);
        else
          ret = res.status(500).send({error: result.value});
      });
    } else if (index) {
      await graph.deleteRoleByIndex(index, function(result) {
        if (result.status)
          ret = res.sendStatus(204);
        else
          ret = res.status(500).send({error: result.value});
      });
    } else
      ret = res.status(400).send({error: "MissingParameter"});

    return ret;
  }
};
