const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
    userName:String,
    email:{
        type:String,
        required:true
    },
    password:{type:String,
        required:true
    }
    isApproved:
}
)

module.exports = mongoose.model("user" , userSchema);

