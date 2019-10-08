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

// get suggestions
module.exports.getSuggestions = function(refNo, callback) {

  Request.find({'refNo':refNo})
    .exec((e, request) => {
      //console.log("request",request);
      if(e) {

        callback(e,null);

      } else {

        let startDate = request[0]['departure']['pickupDate'];
        let endDate = request[0]['arrival']['dropDate'];

        Request.find({$or: [ {'departure.pickupDate':startDate},{'arrival.dropDate': startDate}]})
            .populate('driver')
            .exec((e1, reqs) => {
              //console.log("request",request);
              if(e1) {
        
                callback(e1,null);
        
              } else {
                //console.log("requessts ",reqs);
                let vehicleList = [];
                for(let x =0; x < reqs.length; x++) {
                  if(reqs[x]['driver']){
                    vehicleList[x] = reqs[x]['driver']['_id'];
                  }
                  else{
                    //x--;
                  }
                }

                callback(null, vehicleList);
              }
            });

        
      }
    });
}



