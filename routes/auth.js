const express = require('express');
const router  = express.Router();
const jwt      = require('jsonwebtoken');
const passport = require('passport');
var UserModel = require('../Models/userModel')

const LocalStrategy = require('passport-local').Strategy;

/* POST login. */
router.post('/login', function (req, res, next) {

    passport.authenticate('local', {session: false}, (err, user, info) => {
        console.log(user);
        if (err || !user) {
            return res.status(400).json({
                message: info ? info.message : 'Login failed',
                user   : user
            });
        }

        req.login(user, {session: false}, (err) => {
            if (err) {
                res.send(err);
            }

            const token = jwt.sign(user +'your_jwt_secret');

            return res.json({user, token});
        });
    })
    (req, res);

});

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
},
function (email, password, cb) {

    //Assume there is a DB module pproviding a global UserModel
    return UserModel.findOne({email, password})
        .then(user => {
            bcrypt.compare(password, user.password, function(err, user) {
                if (!user) {
                    return cb(null, false, {message: 'Incorrect email or password.'});
                }
    
                return cb(null, user, {
                    message: 'Logged In Successfully'
                });
            });
            
        })
        .catch(err => {
            return cb(err);
        });
}
));

module.exports = router;