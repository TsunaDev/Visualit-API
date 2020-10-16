const graph = require ('./graph');

/**
 * Vérifie que l'utilisateur possède la permission d'accéder à une route donnée.
 * Ajoute un paramètre "username" au body si il n'existe pas. Si il existe déjà, vérifie si le nom de l'utilisateur correspond à ce paramètre.
 * @param {string} resource La ressource liée à la route (ex: beds) 
 * @param {string} route La route elle même (ex: update)
 * @param {object} user Les données utilisateur reçus dans la requête.
 * @returns {boolean} True si l'utilisateur possède la permission. False dans le cas contraire.
 */
async function checkPermission(resource, route, req) {
  let permissions = null;

  await graph.getUserPermissions(req.user.username, (result) => {
    permissions = result.value;
  });

  if (!req.body["username"] && !req.query.username)
    req.body["username"] = req.user.username;
  else if (req.query.username)
    req.body["username"] = req.query.username;
  
  if (permissions.includes(resource + ".all") || permissions.includes(resource + "." + route + ".all"))
    return true;
  
  if (req.body.username !== req.user.username && permissions.includes(resource + "." + route + ".others"))
    return true;
  else if (req.body.username === req.user.username && permissions.includes(resource + "." + route + ".self"))
    return true;
  else
    return false;
}

module.exports = {
  /**
   * Crée un utilisateur.
   */
  register: async (req, res) => {
    let ret = null;
    const check = await checkPermission("user", "create", req);

    if (!check)
      return res.status(401).send({error: {name: "PermissionDenied"}});
      
    const username = req.body["username"];
    const password = req.body["password"];
    const role = req.body["role"];

    if (!username || !password || !role)
    return res.status(400).send({error: {name: "MissingParameter"}});

    await graph.createUser(username, password, role, function(result) {
      if (result.status)
        ret = res.sendStatus(201);
      else
        ret = res.status(500).send({error: result.value});
    });
    return ret;
  },

  /**
   * Récupère les informations d'un utilisateur.
   */
  fetchInfos: async (req, res) => {
    let ret = null;

    const check = await checkPermission("user", "get", req);

    if (!check)
      return res.status(401).send({error: {name: "PermissionDenied"}});

    await graph.getUser(req.body["username"], function(result) {
      if (result.status) {
        result.value[0].role = parseInt(result.value[0].role, 10);
        delete result.value[0].password;
        ret = res.status(200).send(result.value[0]);
      } else
        ret = res.status(404).send({error: result.value});
    });

    return ret;
  },

  /**
   * Met à jour les informations d'un utilisateur.
   */
  update: async (req, res) => {
    let ret = null;

    const check = await checkPermission("user", "update", req);

    if (!check)
      return res.status(401).send({error: {name: "PermissionDenied"}});

    let args = JSON.parse(JSON.stringify(req.body));
    delete args.username

    await graph.getUser(req.body["username"], function(result) {
      if (result.value.length === 0)
        ret = res.status(404).send({error: {name: "ItemNotFound", info: 'User "' + req.body["username"] + '" cannot be found.'}});
    });

    if (ret)
      return ret;
    await graph.updateUser(req.body["username"], args, function(result) {
      if (result.status)
        ret = res.status(202).send(result.value.properties);
      else {
        ret = res.status(500).send({error: result.value});
      }
    });

    return ret;
  },

  /**
   * Supprime un utilisateur.
   */
  delete: async (req, res) => {
    let ret = null;

    const check = await checkPermission("user", "delete", req);

    if (!check)
      return res.status(401).send({error: {name: "PermissionDenied"}});

    await graph.deleteUser(req.body["username"], function(result) {
      if (result.status)
        ret = res.sendStatus(204);
      else
        ret = res.status(500).send({error: result.value});
    });
    
    return ret;
  },

  /**
   * Récupère tous les utilisateurs existants sur le graphe.
   */
  getAllUsers: async (req, res) => {
    let ret = null;
    let check = false;

    await graph.getUserPermissions(req.user.username, (result) => {
      if (result.value.includes("user.all") || result.value.includes("user.get_all"))
        check = true;
    })
  

    if (!check)
      ret = res.status(401).send({error: {name: "PermissionDenied"}});
    
    await graph.getAllUsers(function(result) {
      if (result.status)
        ret = res.status(200).send(result.value);
      else
        ret = res.status(404).send({error: result.value});
    });
    return ret;
  }
};