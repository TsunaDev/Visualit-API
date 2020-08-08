const graph = require ('./graph');

/**
 * Vérifie que l'utilisateur possède la permission d'accéder à une route donnée.
 * @param {string} resource La ressource liée à la route (ex: beds) 
 * @param {string} route La route elle même (ex: update)
 * @param {object} user Les données utilisateur reçus dans la requête.
 * @returns {boolean} True si l'utilisateur possède la permission. False dans le cas contraire.
 */
async function checkPermission(resource, route, user) {
  let ret = false;

  await graph.getUserPermissions(user.username, (result) => {
    if (result.value.includes(resource + ".all") || result.value.includes(resource + "." + route))
      ret = true;
  })

  return ret;
}

module.exports = {
  /**
   * Crée un nouveau rôle.
   */
  create: async(req, res) => {
    let ret = null;
    const check = await checkPermission("roles", "create", req.user);
    
    if (!check)
      return res.status(401).send({error: {name: "PermissionDenied"}});
    const role = req.body.role
    const index = req.body.index
    const permissions = req.body.permissions;

    if (!role || !index || !permissions)
      ret = res.status(401).send({error: {name: "MissingParameter"}});
    else {
      await graph.createRole(role, index, permissions, function(result) {
        if (result.status)
          ret = res.sendStatus(201);
        else
          ret = res.status(401).send({error: result.value}); // TODO: Revoir les normes
      });
    }
    return ret;
  },

  /**
   * Récupère un rôle en fonction de son nom ou de son indexe.
   */
  get: async(req, res) => {
    const index = req.body.index
    const role = req.body.role
    const check = await checkPermission("roles", "get", req.user);
    
    if (!check)
      return res.status(401).send({error: {name: "PermissionDenied"}});
  
    let ret = null;

    if (role)
      await graph.getRole(role, function(result) {
        if (result.status) {
          ret = res.status(200).send({name: result.value.properties.name, index: parseInt(result.value.properties.index, 10)});
        } else
          ret = res.status(401).send({error: result.value});
      });
    else if (index)
      await graph.getRoleByIndex(index, function(result) {
        if (result.status)
          ret = res.status(200).send({name: result.value.properties.name, index: parseInt(result.value.properties.index, 10)});
        else
          ret = res.status(401).send({error: result.value});
      });
    else
      ret = res.status(401).send({error: "MissingParameter"});
    
    return ret;
  },

  /**
   * Récupère tous les rôles présents sur le graphe.
   */
  getAllRoles: async(req, res) => {
    const check = await checkPermission("roles", "get_all", req.user);
    
    if (!check)
      return res.status(401).send({error: {name: "PermissionDenied"}});
    
    await graph.getAllRoles(function(result) {
      if (result.status) {
        let list = [];

        for (let i = 0; i < result.value.length; i++) {
          list.push({name: result.value[i].name, index: parseInt(result.value[i].index, 10), permissions: result.value[i].permissions});
        }
        ret = res.status(200).send(list);
      } else
        ret = res.status(401).send({error: result.value});
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
      return res.status(401).send({error: {name: "PermissionDenied"}});
    
    if (role) {
      await graph.updateRole(role, args, function(result) {
        if (result.status)
          ret = res.status(202).send(result.value.properties);
        else {
          ret = res.status(401).send({error: result.value});
        }
      });
    } else
      ret = res.status(401).send({error: "MissingParameter"})

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
      return res.status(401).send({error: {name: "PermissionDenied"}});

    if (role) {
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
      ret = res.status(401).send({error: "MissingParameter"});

    return ret;
  }
};