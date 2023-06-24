const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');
mongoose.connect('mongodb://localhost/nodemailer');

const userSchema = mongoose.Schema({
  name : String,
  username : String,
  email: String,
  password:String,
  expiresAt:{
    type:Date,
    default: Date.now() + 24*60*60*1000
  },
  otp: String
})
userSchema.plugin(plm);
module.exports = mongoose.model('user',userSchema)