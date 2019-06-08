const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
let opts = {};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWTSECRET;
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    /*User.findOne({id: jwt_payload.sub}, function(err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
            // or you could create a new account
        }
    });*/
    if (jwt_payload.username === "foo") {
        return done(null, {username: jwt_payload.username});
    } else {
        return done(null, false);
    }
}));