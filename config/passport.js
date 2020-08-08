const passport = require('passport');
const graph = require('../controllers/graph');
const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
let opts = {};

/**
 * Stratégie passport récupérant simplement le nom de l'utilisateur présent dans le payload et vérifie qu'il existe bien dans le graphe.
 */

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWTSECRET;
passport.use(new JwtStrategy(opts, async function(jwt_payload, done) {
  let ret = null;
  
  await graph.getUser(jwt_payload.username, function(result) {
    if (result.status)
      ret = done(null, {username: jwt_payload.username});
    else
      ret = done(null, false);
  });

  return ret;
}));