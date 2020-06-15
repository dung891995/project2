const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
var UserModel = require('../Models/userModel')
var bcrypt = require('bcrypt')
const LocalStrategy = require('passport-local').Strategy;
var isLogin = false
/* POST login. */
router.post('/login', function (req, res, next) {

    passport.authenticate('local', { session: false }, (err, user) => {
        // console.log(user);
        if(err || !user) return res.json('sai tk or mk');
        req.login(user, { session: false }, (err) => {
            if (err) {
                res.send(err);
            }
            
            const token = jwt.sign({id:user._id}, 'your_jwt_secret');
            res.cookie('token', token, { maxAge: 1000 * 3600 * 12 });
            return res.json('dang nhap thanh cong')
            
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
        return UserModel.findOne({ email:email }).lean()
            .then(data => {  
                bcrypt.compare(password, data.password, function (err, result) {
                    if (!result) {
                        return cb(null, false, { message: 'Incorrect email or password.' });
                    }
                    console.log(data);
                    return cb(null, data, {
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