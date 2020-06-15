var mongoose = require('../config/dbConnect')
var Schema = mongoose.Schema
var articleSchema = new Schema({
    title:String,
    content: String,
    author:String,
    createAt:{
        type:String,
        default:(new Date())
    },
    updateAt:{
        type:String,
        default:null
    }
})
module.exports= mongoose.model("article",articleSchema);