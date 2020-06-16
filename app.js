var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require("passport")
var jwt = require('jsonwebtoken')
var index = require('./routes/index');
var session = require('express-session')
var user = require('./routes/users');
var auth = require('./routes/auth');
const bcrypt = require('bcrypt');
const saltRounds = 10;
require('./routes/passport');
require('dotenv').config()
var sendMail = require('./config/sendMail')
var UserModel = require('./Models/userModel');
var ArticleModel = require('./Models/articleModel');
var cors = require('cors')
var app = express()
app.use(cors())
// app.set('trust proxy', 1) // trust first proxy
// app.use(session({
//   secret: 'keyboard cat',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false,maxAge:1000*60*60}
// }))
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/auth', auth);
app.get('/login', function (req, res, next) {
    res.render("login")
})
app.get('/session', function name(params) {

})
app.get('/signup', function (req, res, next) {
    res.render("signup")
})


//router post bai
app.get('/dangbai', function (req, res, next) {
    var token = req.cookies.token
    if (token) {
        var jwtDecode = jwt.verify(token, 'your_jwt_secret')
        if (jwtDecode.length >= 1 && jwtDecode.email == "dung891995@gmail.com") {
            next();
        } else {
            res.redirect('/showbai')
        }
    } else {
        res.redirect('/showbai')
    }


}, function (req, res) {
    res.render('addArticle')
})


//router forgot password
app.get('/quenpass', function (req, res, next) {
    res.render('forgotPass')
})

app.get('/newPass/:token',function (req,res,next) {
    res.cookie('renewPass', req.params.token, { maxAge: 1000 * 3600 * 12 });
    res.render('newPass')
})
app.post('/newPass',function (req,res) {
    var tokenRenewPass = req.cookies.renewPass;
    var decodeToken = jwt.verify(tokenRenewPass,'dung891995')
    var password=req.body.password;
    console.log(password);
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            UserModel.updateOne({email:decodeToken.email},{password:hash}).then((result) => {
                res.json(result)
            }).catch((err) => {
                
            });
        });
    });

    
})

//router renew password
app.post('/renewPass', function (req, res, next) {
    var email = req.body.email;
    UserModel.findOne({ email: email }).then((result) => {
        var jwtRenewPass = jwt.sign({ email: result.email }, "dung891995", { expiresIn: '2d' });
        
        var subject = "Cap lai Pass";
        var html = `<a href="http://localhost:3000/newPass/${jwtRenewPass}">Click to renew password</a>
                `
                sendMail(result.email,subject,html)
                
    })
})

//router sign up
app.post('/signup', function (req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(password, salt, function (err, hash) {
            UserModel.create({
                email: email,
                password: hash
            }).then((result) => {
                console.log(result);
                var jwtSendMail = jwt.sign({ id: result._id }, "dung891995", { expiresIn: '60' })
                var subject = "Verify tài khoản";
                var html = `<a href="http://localhost:3000/active/${jwtSendMail}">Click to verify</a>
                `
                sendMail(result.email, subject, html)
            })
        });
    });

});


//router xac nhan send email
app.post('/resendEmail', async function (req, res, next) {
    var email = req.body.email

    try {
        var user = await UserModel.findOne({ email: email });
        console.log(user, "usr");
        var token = jwt.sign({ email: user.email }, "dung891995", { expiresIn: 5 * 1000 * 60 });
        console.log(token);
        var subject = "Thư xác nhận"
        var html = `
                <p>Đây là nội dung xác nhận tài khoản tồn tại trong thời gian là 5p</p>
                <a href="http://localhost:3000/active/${token}">Xác nhận</a>
                
              `
        sendMail(user.email, subject, html).then((result) => {
            //  console.log(sendMail);
            return res.json("sendMail thanh cong")
        }).catch((err) => {

        });

    } catch (error) {
        res.json("error")
    }
});

app.get('/active/:token', function (req, res, next) {
    var token = req.params.token;

    try {
        var jwtDecode = jwt.verify(token, "dung891995")
        console.log(jwtDecode);
        UserModel.updateOne({ email: jwtDecode.email }, { isActive: true }).then(function (data) {
            console.log(jwtDecode);

            return res.redirect("/login")

        });
    } catch (error) {
        if (error.message == "jwt expired") {

            res.render('verifyFalse')
        }
        // if (error.message == "invalid token" || error.message == "jwt malformed") {

        // }
    }

})

app.get('/showbai', function (req, res, next) {
    var token = req.cookies.token
    if (token) {
        console.log(222222);
        var jwtDecode = jwt.verify(token, 'your_jwt_secret')
        if (jwtDecode && jwtDecode.id == "5ecb851c93f5200e566235ac") {
            return res.redirect('/showbaiadmin');
        } else {
            return res.json({
                err: true,
                message: 'ban ko phai admin'
            })
        }
    } else {
        console.log(222222);
        next();
    }


}, function (req, res, next) {
    return res.render('showbai')
})
app.get('/showbaiadmin', function (req, res, next) {
    var token = req.cookies.token
    if (token) {


        try {
            console.log(33333333);
            var jwtDecode = jwt.verify(token, 'your_jwt_secret');
            if (jwtDecode && jwtDecode.id == "5ecb851c93f5200e566235ac") {
                console.log(4444);
                return next();
            } else {
                console.log(33333989);
                return res.json({
                    err: true,
                    message: 'ban ko phai admin'
                })
            }
        } catch (error) {
            console.log(err, "errrr");
        }
    } else {
        console.log(11111);
        return res.redirect('/showbai')
    }


}, function (req, res, next) {
    return res.render('showbaiAdmin')
})
app.get('/article', function (req, res, next) {
    ArticleModel.find().then((data) => {
        res.json(data)
    })
})
app.post('/dangbai', function (req, res, next) {
    ArticleModel.create(req.body).then((result) => {
        res.json('dang bai thanh cong')
    })
})
app.get("/page/:npage", function (req, res, next) {
    var npage = req.params.npage;
    ArticleModel.find().skip((npage - 1) * 3).limit(3).then((result) => {
        res.json(result)
    })
})

app.put("/update/:id", function (req, res, next) {
    var id = req.params.id;
    ArticleModel.findById({ _id: id }).then((result) => {
        if (!result) {
         return res.json('khong ton tai bai viet nay')

        }
        next()

    
    })

}, function (req, res, next) {
    var id = req.params.id;
    var title = req.body.title;
    var content = req.body.content;
    var author = req.body.author;
    var userInfor = {
    }
    if (title) {
        userInfor.title = title
    }
    if (content) {
        userInfor.content = content
    }
    if (author) {
        userInfor.author = author
    }
    userInfor.updateAt = new Date();
    ArticleModel.updateOne({
        _id: id
    }, userInfor).then((result) => {
        res.json({
            message:"cap nhat thanh cong"
        })
    })
})

app.get('/logout', function (req, res, next) {
    res.clearCookie("token");
    req.logOut();
    res.json({
        err: false,
        message: 'logout thanh cong'
    })

})


app.delete('/:id', function (req, res, next) {
    ArticleModel.deleteOne({ _id: req.params.id })
})
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


module.exports = app