const {Schema, model} = require("mongoose");

let userSchema = new Schema({
  username:String,
  email:String,
  password:String
})

let User = model("User", userSchema);
module.exports = User