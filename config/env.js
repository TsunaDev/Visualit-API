const uuid = require('uuid/v4');

/**
 * Création de variables d'environement.
 */
if (!process.env.JWTSECRET)
    process.env.JWTSECRET = uuid();
if (!process.env.JWTEXP)
    process.env.JWTEXP = 36000000;