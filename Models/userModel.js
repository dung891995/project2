var mongoose = require('../config/dbConnect')
var Schema = mongoose.Schema
var userSchema = new Schema({
    email:String,
    password: String,
    isActive :{
        type:Boolean,
        default:false
    },
})
module.exports= mongoose.model("user",userSchema);