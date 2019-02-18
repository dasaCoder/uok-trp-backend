const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const config = require('../config/database');
const autoIncrement = require('mongoose-auto-increment');
const Schema = mongoose.Schema;
var nodemailer = require('nodemailer');

// request upload
const {Storage} = require('@google-cloud/storage');
var pdf = require('html-pdf');
var fs = require('fs');

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

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

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

// edit request
module.exports.editRequest = function(params, callback) {
  console.log(params.refNo);

  Request.findOneAndUpdate({'refNo':params.refNo}, params,callback);

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

/**
 *  Generate application pdf for given request
*/


/**
 *  Send user email in request status changes
 *  @param refNo
 *  */
module.exports.sendUserEmail = function (refNo, callback ){

  Request.find({'refNo':refNo},'lecturer email status password', function(err, data) {
    
    console.log("email is sending "+refNo, data);
    if(data[0]) {

      let request = data[0];
        if(request['status'] == 1){ // when request is confirm

          var mailOptions = {
            from: 'Admin <trp.uok@gmail.com>',
            to: request['email'],
            subject: 'Request Vehicle - Transport Division, University of Kelaniya',
            html: `<center class="wrapper" style="display: table;table-layout: fixed;width: 100%;min-width: 620px;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;background-color: #ffffff;">
            <table class="top-panel center" width="602" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;border-spacing: 0;margin: 0 auto;width: 602px;">
                <tbody>
                <tr>
                    <td class="title" width="300" style="padding: 8px 0;vertical-align: top;text-align: left;width: 300px;color: #616161;font-family: Roboto, Helvetica, sans-serif;font-weight: 400;font-size: 12px;line-height: 14px;">Universtiy Of Kelaniya</td>
                    <td class="subject" width="300" style="padding: 8px 0;vertical-align: top;text-align: right;width: 300px;color: #616161;font-family: Roboto, Helvetica, sans-serif;font-weight: 400;font-size: 12px;line-height: 14px;"><a class="strong" href="#" target="_blank" style="text-decoration: none;color: #616161;font-weight: 700;"></a></td>
                </tr>
                <tr>
                    <td class="border" colspan="2" style="padding: 0;vertical-align: top;font-size: 1px;line-height: 1px;background-color: #e0e0e0;width: 1px;">&nbsp;</td>
                </tr>
                </tbody>
            </table>
        
            <div class="spacer" style="font-size: 1px;line-height: 16px;width: 100%;">&nbsp;</div>
        
            <table class="main center" width="602" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;border-spacing: 0;-webkit-box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 1px 2px 0 rgba(0, 0, 0, 0.24);-moz-box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 1px 2px 0 rgba(0, 0, 0, 0.24);box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 1px 2px 0 rgba(0, 0, 0, 0.24);margin: 0 auto;width: 602px;">
                <tbody>
                <tr>
                    <td class="column" style="padding: 0;vertical-align: top;text-align: left;background-color: #ffffff;font-size: 14px;">
                        <div class="column-top" style="font-size: 24px;line-height: 24px;">&nbsp;</div>
                        <table class="content" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;border-spacing: 0;width: 100%;">
                            <tbody>
                            <tr>
                                <td class="padded" style="padding: 0 24px;vertical-align: top;">
                                  <h1 style="margin-bottom: -5px;margin-top: 0;color: #212121;font-family: Roboto, Helvetica, sans-serif;font-weight: 400;font-size: 20px;line-height: 28px;">Transport Division</h1>
                                  <span style="padding-left:5px;font-size:0.8em;">University of Kelaniya</span>
                                  <hr>
                                  <br>
                                  <p style="margin-top: 0;margin-bottom: 16px;color: #212121;font-family: Roboto, Helvetica, sans-serif;font-weight: 400;font-size: 16px;line-height: 24px;">Hi! ${request['lecturer']},<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Your request (TRD/${refNo}) is Accepted which means we are able to supply your vehicle on time. Please supply us few additional details to proceed. </p> <i> Please use following credentials for check the status of your request.</i> <br><br>
                                  <div style="padding-left:50px">
                                    <ul class="mail-ul" style="margin-top: 0;padding-left: 0;font-family: Roboto, Helvetica, sans-serif;">
                                    <li style="margin-top: 0;padding-left: 0;">Refferance No : TRD/${refNo}</li>
                                    <li style="margin-top: 0;padding-left: 0;">password : ${request['password']}</li>
                                  </ul>
                                  </div>
                                  
                                  
                                  <p style="text-align: center;margin-top: 0;margin-bottom: 16px;color: #212121;font-family: Roboto, Helvetica, sans-serif;font-weight: 400;font-size: 16px;line-height: 24px;"><a href="https://uok-trp.firebaseapp.com" class="btn" style="text-decoration: none;color: #ffffff;background-color: #63BA3C;border: 1px solid #63BA3C;border-radius: 2px;display: inline-block;font-family: Roboto, Helvetica, sans-serif;font-size: 14px;font-weight: 400;line-height: 36px;text-align: center;text-transform: uppercase;width: 200px;height: 36px;padding: 0 8px;margin: 0;outline: 0;outline-offset: 0;-webkit-text-size-adjust: none;mso-hide: all;">Visit Our Website</a></p>
        <!--                           <p style="text-align:center;">
                                    <a href="#" class="strong">Example link</a>
                                  </p> -->
                                  <p class="caption" style="margin-top: 0;margin-bottom: 16px;color: #616161;font-family: Roboto, Helvetica, sans-serif;font-weight: 400;font-size: 12px;line-height: 20px;">This is an automatically generated email.</p>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                        <div class="column-bottom" style="font-size: 8px;line-height: 8px;">&nbsp;</div>
                    </td>
                </tr>
                </tbody>
            </table>
        
            <div class="spacer" style="font-size: 1px;line-height: 16px;width: 100%;">&nbsp;</div>
        
            <table class="footer center" width="602" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;border-spacing: 0;margin: 0 auto;width: 602px;">
                <tbody>
                <tr>
                    <td class="border" colspan="2" style="padding: 0;vertical-align: top;font-size: 1px;line-height: 1px;background-color: #e0e0e0;width: 1px;">&nbsp;</td>
                </tr>
                <tr>
                    <td class="signature" width="300" style="padding: 0;vertical-align: bottom;width: 300px;padding-top: 8px;margin-bottom: 16px;text-align: left;">
                        <p style="margin-top: 0;margin-bottom: 8px;color: #616161;font-family: Roboto, Helvetica, sans-serif;font-weight: 400;font-size: 12px;line-height: 18px;">
                            With best regards,<br>
                            Transport Division,<br>
                            University Of Kelaniya <br>
        <!--                     +0 (000) 00-00-00, John Doe<br> -->
                            </p>
                        <p style="margin-top: 0;margin-bottom: 8px;color: #616161;font-family: Roboto, Helvetica, sans-serif;font-weight: 400;font-size: 12px;line-height: 18px;">
                            Support: <a class="strong" href="mailto:#" target="_blank" style="text-decoration: none;color: #616161;font-weight: 700;">trp.uok@gmail.com</a>
                        </p>
                    </td>
        <!--             <td class="subscription" width="300">
                        <div class="logo-image">
                            <a href="https://zavoloklom.github.io/material-design-iconic-font/" target="_blank"><img src="https://zavoloklom.github.io/material-design-iconic-font/icons/mstile-70x70.png" alt="logo-alt" width="70" height="70"></a>
                        </div>
                        <p>
                            <a class="strong block" href="#" target="_blank">
                                Unsubscribe
                            </a>
                            <span class="hide">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                            <a class="strong block" href="#" target="_blank">
                                Account Settings
                            </a>
                        </p>
                    </td> -->
                </tr>
                </tbody>
            </table>
        </center>`
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

        }
    }

  });


}


module.exports.getRequestOnDay = function (date1, callback ) {
  let date_ = new Date(date1);
  date_ = `${date_.getFullYear()}-${date_.getMonth()+1}-${date_.getDate()}`;
  let nextDate = new Date(date_);
  nextDate = `${nextDate.getFullYear()}-${nextDate.getMonth()+1}-${nextDate.getDate()+1}`;

  let query = {'departure.pickupDate':{$gte:date_,$lt:nextDate}};
  console.log(query);
  Request.find(query, callback)
          .sort({"departure.pickupTime":1});
}

module.exports.getRequestsHasVehicleOnDay = function (date,callback) {
  let query = {$and:[{'vehicle':{$exists:true}}, {'departure.pickupDate':date}]};
  Request.find(query, 'refNo departure.dropPoint departure.pickupPoint departure.dropTime departure.pickupTime',callback)
    .populate('vehicle');
}


/**
 *  upload request file into google cloud store
 *  @param request
 */
module.exports.uploadRequest = function (refNo) {
  var html = fs.readFileSync('./templates/application.html', 'utf8');


  Request.find({'refNo':refNo}, function(err, data) {
    
    console.log("Pdf is uploading....... "+refNo, data);
    if(data[0]) {

      let request = data[0];

      // replace variables in template file
      html = html.replace('{{refNo}}',request['refNo']);
      html = html.replace('{{lecturer}}',request['lecturer']);
      html = html.replace('{{position}}',request['position']);
      html = html.replace('{{dep_unit}}',request['dep_unit']);
      html = html.replace('{{departure_pickPointAddress}}',request['departure']['pickPointAddress']);
      html = html.replace('{{departure_dropPointAddress}}',request['departure']['dropPointAddress']);
      html = html.replace('{{departure_pickupDate}}',request['departure']['pickupDate']);
      html = html.replace('{{departure_pickupTime}}',request['departure']['pickupTime']);
      html = html.replace('{{arrival_dropDate}}',request['arrival']['dropDate']);
      html = html.replace('{{arrival_dropTime}}',request['arrival']['dropTime']);
      html = html.replace('{{purpose}}',request['purpose']);


      var options = { 
                      format: 'A4',
                      border: 0 
                    };

      // create pdf
      pdf.create(html, options).toFile('./'+ refNo +'.pdf', function(err, response) {
        if (err) return console.log(err);
        
        var storage = new Storage({
          projectId: process.env.PROJECT_ID,
          keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
        });
      
        var BUCKET_NAME = process.env.REQUEST_BUCKET;
      
        var myBucket = storage.bucket(BUCKET_NAME);
      
        let localFileLocation = './'+ refNo +'.pdf';
      
        // upload to google cs
        myBucket.upload(localFileLocation, { public: true })
          .then(file => {
            console.log(file);
            fs.unlinkSync(localFileLocation);

            console.log("pdf uploaded");
          })
      
      });

    }
  });
  

}