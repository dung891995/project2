var nodemailer =  require('nodemailer');

function sendMail(to,subject,html) {
    var transporter =  nodemailer.createTransport({ // config mail server
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });
    var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
        from: process.env.EMAIL,
        to: to,
        subject:subject,
        html: html
        
    }
    return new Promise(function(resolve,reject) {
        transporter.sendMail(mainOptions, function(err, info){
            if (err) {
                reject(err)
            } 
            resolve("thanh cong")
        });
    })
    
}
module.exports = sendMail;