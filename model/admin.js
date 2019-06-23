const mongoose = require('mongoose');
const config = require('../config/database');

const AdminSchema = mongoose.Schema({
    username :{
        type: String,
        require: true,
        unique: true
      },
    password : {
        type: String,
        require: true
      },
    role : {
        type: String,
        require: true
      }
});

let Admin = module.exports = mongoose.model('Admin',AdminSchema);

// create new admin account
module.exports.createAdmin = function(admin, callback) {
    admin.save(callback);
}

//change password of admin
module.exports.changePassword = function(admin,callback) {
  let username = admin.username;
  let oldPassword = admin.oldPassword;
  let newPassword = admin.newPassword;

  Admin.findOneAndUpdate({username: username, password: oldPassword},{$set: {password: newPassword}},{upsert: true},callback);
}