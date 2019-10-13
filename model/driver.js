const mongoose = require('mongoose');
const config = require('../config/database');

const DriverSchema = mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  nic_no : {
    type: String,
    require: true
  },
  driving_liecence_no: {
    type: String,
    require: true
  },
  telephone: {
    type: Number,
    require: true
  },
  image_url: {
    type: String
  },
  address: {
    type: String,
    require: true
  },
  is_deleted:{
    type: Boolean,
    require: false
  },
  deleted_date: {
    type: String,
    require: false
  },
  password: {
    type: String,
    require: false
  }
  /*duties: []*/

});

let Driver = module.exports = mongoose.model('Driver', DriverSchema);

module.exports.addDriver = function (newDriver , callback) {
  newDriver.save(callback);
}

module.exports.login = function(driver, callback) {
  Driver.findOne(driver, callback);
}

module.exports.getDrivers = function(callback){
  Driver.find({'is_deleted':{$in:[false, undefined]}},{'_id' : 0,'name' : 1},callback);
}

module.exports.getDriver = function(_id,callback) {
  Driver.find({'_id':_id},callback);
}

module.exports.getAllDriverDetails = function (callback) {
  Driver.find({},callback);
}


// remove driver 
// soft delete
module.exports.deleteDriver = function (driverId, callback) {
  //let query = { _id : driverId};
  Driver.findByIdAndUpdate(driverId, { 
    $set: {
              is_deleted: true,
              deleted_date: new Date()
            
            }
          }, 
  callback)
}



