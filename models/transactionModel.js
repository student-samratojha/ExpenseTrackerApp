const mongoose = require("mongoose");

const transactionSchema = mongoose.Schema({
    email:String,
    amount:Number,
    date:{
        type:Date,
        default:Date.now
    },
    category:String,
type:String
})

module.exports = mongoose.model("transaction" , transactionSchema);