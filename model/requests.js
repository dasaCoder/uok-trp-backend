const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const config = require('../config/database');
const autoIncrement = require('mongoose-auto-increment');
const Schema = mongoose.Schema;

autoIncrement.initialize(mongoose.connection);

const RequestSchema = mongoose.Schema({
  refNo:{
    type: Number
  },
  lecturer:{
    type: String
  },
  email:{
    type: String
  },
  password:{
    type: String
  },
  dep_unit:{
    type: String
  },
  position:{
    type: String
  },
  num_passangers:{
    type: String
  },
  purpose:{
    type: String
  },
  vehicle_type:{
    type: String
  },
  status:{
    type: Object
  },
  isPermited:{
    type: Boolean
  },
  fundingWay:{
    type: String
  },
  departure:{
    type: Object
  },
  arrival:{
    type: Object
  },
  vehicle:{
    type: Schema.Types.ObjectId, ref: 'Vehicle'
  },
  driver:{
    type: Schema.Types.ObjectId, ref: 'Driver'
  }
});

const Vehicle = require('./vehicles');
const Driver = require('./driver');

RequestSchema.plugin(autoIncrement.plugin, {model: 'Request', field: 'refNo'});
const Request = module.exports = mongoose.model('Request',RequestSchema);

module.exports.add_request = function(newRequest, callback){
  if(newRequest) {
    newRequest.save(callback);
  }


}

//return a array of requests for given driver
module.exports.getRequetsOfDriver = function (_id, callback){
  

  let query = {'driver':_id};
  // console.log(query);
  Request.find(query, callback).populate('vehicle');
}

// return an aray of requests for given vehicle
module.exports.getRequestsOfVehicle = function(_id, callback) {
  let query = {'vehicle':_id};
  Request.find(query,callback).populate('driver');
}


module.exports.get_req_list = function (refNo, callback) {
  Request.find({'status': refNo},'refNo',callback);
}
module.exports.get_not_considered_requests = function (callback) {
  Request.find({'status.status':3},'refNo',callback);
}

module.exports.get_request = function (refNo, callback) {
  Request.find({'refNo':refNo},callback).populate({path:'vehicle',select:'vehicle_no'}).populate({path: 'driver', select: 'name'});
}

module.exports.get_req_for_user = function (params, callback) {
  Request.find({'refNo':params.refNo, 'password': params.password}, 'lecturer refNo' ,callback)
    .populate({path: 'driver', select: 'name'})
    .populate({path:'vehicle',select:'vehicle_no'});
}

module.exports.change_status = function (refNo, status, callback) {
  let query = {'refNo': refNo};
  // console.log('refNO is : '+refNo + status);
  Request.update(query, {'status' : status}, callback);
}

/*module.exports.setDriver = function(refNo, name, callback) {
  console.log(name);
 Driver.find({'name': name}, '_id', function (err, data) {
   if(err) {
     // console.log(err);
   }
   if(data[0]) {
     let driver = data[0];
     console.log(data);
     let query = {'refNo': refNo};
     Request.findOneAndUpdate(query, {$set: {'driver': driver._id}}, { new: true}, callback);
   }
 })
}*/

module.exports.setDriver = function (refNo, _id, callback) {
  console.log(refNo + _id);
  if(refNo && _id ) {
    console.log(refNo);
    let query = {'refNo': refNo};
    Request.findOneAndUpdate(query, {$set: {'driver': _id}}, {new: true}, callback);
  }
}

module.exports.set_moredetails = function(params, callback) {
  let query = { 'refNo': params.refNo };
  Request.update(query,
                    {
                    'position': params.position,
                    'purpose': params.purpose,
                    'fundingWay': params.fundingWay,
                      'status': params.status
                  },
                callback
                );
}

module.exports.setMoreInfo = function(params, callback){
  console.log(params);
  Request.findOneAndUpdate({'refNo':params.refNo}, {'$set':{
      'position': params.position,
      'purpose': params.purpose,
      'fundingWay': params.fundingWay,
    }})
    .exec(function (err, request) {
        if(err){
          console.log(err);
          res.status(500).send(err);
        }else {
          res.status(200).send(request);
        }
  })
}

module.exports.getActiveRequests = function (callback) {
  Request.find({status : {"$in": [1,2,'1','2']} },'refNo departure arrival status driver vehicle dep_unit',callback);
}

// return as array of reqeusts on given status
// params array of status ["1","2"]

module.exports.getRequestsOnStatus = function (status,callback) {
  Request.find({status : {"$in": status} },'refNo departure arrival status driver vehicle dep_unit',callback)
        .populate({path: 'driver', select: 'name'})
        .populate({path:'vehicle',select:'vehicle_no'});
}

module.exports.getStatusReq = function (params, callback) {
  let query = {$and:[{'refNo':params.refNo},{'password':params.password}]};
  Request.find(query,'status lecturer refNo',callback);
}

module.exports.set_vehicle = function (refNo, _id, callback) {
  /*Vehicle.find({'vehicle_no': vehicle_no}, '_id', function (err, data) {
    let vehicle = data[0];

    Request.findOneAndUpdate(query, {$set: {'vehicle': vehicle._id} }, { new: true }, callback);
  });*/
  // console.log('SET_VEHICLE');
  if(refNo && _id) {
    let query = { 'refNo': refNo};
    Request.findOneAndUpdate(query, {$set: {'vehicle': _id} }, { new: true }, callback);
  }

}

module.exports.authTest = function (id, callback ) {
  Request.find({'refNo':1},'refNo',callback)
}

module.exports.getReqOnDayForVehicle = function (vehicle_no, callback) {
  //console.log(vehicle_no);
  Vehicle.find({'vehicle_no':vehicle_no},'_id', function (err, data) {
    if(data[0]) {
      let date = new Date('2018-4-19');
      date = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
      let nextDate = new Date('2018-4-19');
      nextDate = `${nextDate.getFullYear()}-${nextDate.getMonth()+1}-${nextDate.getDate()+1}`;
      let query = {'vehicle': data[0]['_id'],'departure.pickupDate':{$gte:date,$lt:nextDate}};
     // console.log(query);
      Request.find(query,'refNo arrival departure',callback);
    }

  });
}

/// get list of requests of a driver on a specific day

module.exports.getRequetsOfDriverOnDay = function (_id, callback){
  let date = new Date();
  date = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
  let nextDate = new Date();
  nextDate = `${nextDate.getFullYear()}-${nextDate.getMonth()+1}-${nextDate.getDate()+1}`;

  let query = {'driver':_id, 'departure.pickupDate':{$gte:date,$lt:nextDate}};
  // console.log(query);
  Request.find(query, 'arrival departure dep_unit purpose', callback).populate('vehicle');
}

/*
* get list of request of a driver for a month
*
* */
module.exports.getRequetsOfDriverOnMonth = function (_id, month_first_day, callback){
  let date = new Date(month_first_day);
  date = `${date.getFullYear()}-${date.getMonth()+1}-1`;
  let nextDate = new Date(month_first_day);
  nextDate = `${nextDate.getFullYear()}-${nextDate.getMonth()+2}-${nextDate.getDate()}`;

  let query = {
                'driver':_id,
                'departure.pickupDate':{
                                        $gte: date,
                                        $lt:  nextDate
                  }};
  console.log(query);
  Request.find(query, 'arrival departure dep_unit purpose', callback).populate('vehicle');

}

module.exports.getRequestOnDay = function (date1, callback ) {
  let date_ = new Date(date1);
  date_ = `${date_.getFullYear()}-${date_.getMonth()+1}-${date_.getDate()}`;
  let nextDate = new Date(date_);
  nextDate = `${nextDate.getFullYear()}-${nextDate.getMonth()+1}-${nextDate.getDate()+1}`;

  let query = {'departure.pickupDate':{$gte:date_,$lt:nextDate}};
  console.log(query);
  Request.find(query, callback);
}

module.exports.getRequestsHasVehicleOnDay = function (date,callback) {
  let query = {$and:[{'vehicle':{$exists:true}}, {'departure.pickupDate':date}]};
  Request.find(query, 'refNo departure.dropPoint departure.pickupPoint departure.dropTime departure.pickupTime',callback)
    .populate('vehicle');
}
