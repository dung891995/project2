var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test-env', {useNewUrlParser: true,useUnifiedTopology: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('thanh cong');
})
module.exports = mongoose;