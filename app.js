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
var app = express()
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
app.use(express.static(path.join(__dirname,'public')));

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
app.get('/dangbai', function (req, res, next) {
    var token = req.cookies.token
    if (token) {
        var jwtDecode = jwt.verify(token, 'your_jwt_secret')
        if (jwtDecode.length >= 1 && jwtDecode.id == "5ecb851c93f5200e566235ac") {
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

app.post('/signup', function (req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(password, salt, function (err, hash) {
            UserModel.create({
                email: email,
                password: hash
            }).then((result) => {
                var jwtSendMail = jwt.sign({id:result._id},"dung891995")
                var subject = "Verify tài khoản";
                var html = `<a href="http://localhost:3000/active/${jwtSendMail}">Click to verify</a>`
                sendMail(result.email,subject,html)
            })
        });
    });

});
app.get('/showbai',function (req, res, next) {
    var token = req.cookies.token
    if (token) {
        console.log(222222);
        var jwtDecode = jwt.verify(token, 'your_jwt_secret')
        if (jwtDecode && jwtDecode.id == "5ecb851c93f5200e566235ac") {
            return res.redirect('/showbaiadmin');
        } else {
            return res.json({
                err:true,
                message:'ban ko phai admin'
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
                err:true,
                message:'ban ko phai admin'
            })
        }
       } catch (error) {
           console.log(err,"errrr");
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

app.put("/update/:id",function (req, res, next) {
    var id = req.params.id;
    ArticleModel.findById({_id:id}).then((result) => {
        if (result) {
        next()
        }
    })
    res.json('khong ton tai bai viet nay')
    
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
        res.json(result)
    })
})

app.get('/logout',function (req,res,next) {
    res.clearCookie("token");
    req.logOut();
    res.json({
        err:false,
        message:'logout thanh cong'
    })

})

app.get('/active/:token',function (req,res,next) {
    var token = req.params.token;
    var jwtDecode= jwt.verify(token,"dung891995")
    UserModel.updateOne({_id:jwtDecode.id},{isActive:true}).then(function(data){
    console.log(jwtDecode);

        return res.redirect("/login")

    });
})
app.delete('/:id',function (req,res,next) {
    ArticleModel.deleteOne({_id:req.params.id})
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