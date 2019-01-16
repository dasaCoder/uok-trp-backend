const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const config = require('../config/database');
const Request = require('./requests');
const Schema = mongoose.Schema;

const VehicleSchema = mongoose.Schema({
  vehicle_no: {
    type: String,
    required: true
  },
  vehicle_type:{
    required: true,
    type: String,
  },
  image:{
    type: String // this type should be changed
  },
  driver: {
    type: Schema.Types.ObjectId, ref: 'Driver'
  },
  chassi_no: String,
  status: String, // 100 -> good, 101-> need maintenence, 102-> under maintenence
  status_info: { type : Array , "default" : [] } // stores the history of maintenence
  /*trips: [{
    ref_no: {
      type: Number
    },
    departure_time: {
      type: String
    },
    arrival_time: {
      type: String
    }
  }]*/
});

const Vehicle = module.exports = mongoose.model('Vehicle', VehicleSchema);

// update the vehicle status
// eg:- set vehicle is on maintanence
module.exports.changeVehicleStatus = function(vehicle_no,status,callback)
{
  let query = { vehicle_no:vehicle_no};

  Vehicle.update(query, {'status' : status}, callback);
}

//return list of vehicles
module.exports.getVehicleList = function (callback) {
  Vehicle.find({},{'_id' : 0,'vehicle_no, _id' : 1},callback);
}

//return list of vehicles under maintenence
module.exports.getVehicleListOnStatus = function (status, callback) {
  Vehicle.find({'status':status}, callback);
}

// add maintenance details
module.exports.addMaintenanceDetails = function(vehicle_id, details, callback) {

  let vehicleCurrentStatus = details['status']; // this will help when entering old maintenence data
  details['_id'] = mongoose.Types.ObjectId(); // generate _id

  Vehicle.findOneAndUpdate(
      {'_id':vehicle_id},
      {'status':vehicleCurrentStatus,'$push':{'status_info':details}},
     callback
  );
  //console.log(details);
  // details['_id'] = mongoose.Types.ObjectId(); // generate _id
  // // generate dummy request for maintenance
  // let dummyReq = new Request(
  //   {
  //     "status":"100",
  //     "purpose":"maintenance",
  //     "departure":details['departure'],
  //     "arrival":details['arrival'],
  //     "vehicle":vehicle_id
  //   }
  // );

  // //console.log(dummyReq);

  // dummyReq.save(function (err, data){
  //   if(err){
  //     return err;
  //   }
  //   else{
  //     // get dummy requests refNo
  //     details['dummyRefNo'] = data['refNo'];

  //     let vehicleCurrentStatus = details['status']; // this will help when entering old maintenence data
  //     // remove unwanted data
  //       delete details['arrival'];
  //       delete details['departure'];
  //       delete details['status'];
    
  //     Vehicle.findOneAndUpdate(
  //            {'_id':vehicle_id},
  //             {'status':vehicleCurrentStatus,'$push':{'status_info':details}},
  //             callback
  //                 );
  //   }
  // });


}

// update vehicle repari details
module.exports.updateRepairRecord = function( _id, newRec, callback) {
  Vehicle.updateOne(
    {'_id':_id, 'status_info._id': newRec._id},
    { '$set': {'status_info.$': newRec }},
    callback
  );
}

// load repair history for given vehicle
module.exports.getVehicleRepairHistory = function(_id,callback) {
  Vehicle.findById(_id, callback);
}

// update vehicle status
module.exports.updateStatus = function(_id, status, callback) {
  Vehicle.findOneAndUpdate(
    { '_id':_id },
    { 'status':status },
    callback
  )
}

module.exports.getVehicleByNo = function(vehicle_no, callback) {
  Vehicle.find({'vehicle_no':vehicle_no},callback);
}

module.exports.get_vehicle_on_day = function(date, callback){
  Vehicle.find({'trips.departure_time': date},'vehicle_no type',callback)
    .where('trips.departure_time').equals(date).or()
    .where('trips.departure_time').lt(date)
    .where('trips.arrival_time').gt(date);

  // {$and:[{'trips.departure_time':{$lte:'2018/3/11'}},{'trips.arrival_time':{$gte:'2018/03/17'}}]}
}

module.exports.addVehicle = function (newVehicle, callback) {
  /*bcrypt.genSalt(10, (err,salt)=>{
    bcrypt.hash(newVehicle)
  })*/
  newVehicle.save(callback);

}

module.exports.get_vehicle_list = function(callback){
  Vehicle.find({},'vehicle_no vehicle_type',callback).populate({path: 'driver', select:'name'});
}

module.exports.get_admin_to_reqeust = function (callback) {
  Vehicle.find({},{'_id' : 0,'vehicle_no' : 1},callback);
}

// get a list of vehicle

module.exports.getAllDriverDetails = function (callback) {
  Vehicle.find({}, '')

}

// we used to set arrival time and departure time of trip
module.exports.set_trip = function (trip_plan, callback) {

}




