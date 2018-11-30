const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

const Driver = require('../model/driver');
const Vehicle = require('../model/vehicles');
const Request = require('../model/requests');

//get request on status
router.get('/requests/status',(req,res,next)=>{
  
  let status = [];
  status = req.query.status; // get the status, array of status

  Request.getRequestsOnStatus(status,(err,callback)=>{
    if(err){
      res.json({
        success: false, msg:err
      });
    }else{
      res.json({
        success: true, msg: callback
      });
    }
  })

})


router.post('/driver',(req,res,next)=>{
  let newDriver = new Driver(req.body);
  Driver.addDriver(newDriver , (err,callback) => {
    if(err){
      res.json({
        success: false,
        msg: 'error occured'
      });
    }else{
      res.json({
        success: true,
        msg: 'Driver added successfully'
      });
    }
  });
});

router.get('/driver',(req,res,next)=>{
  Driver.getDrivers((err,callback)=>{
    if(err){
      res.json({
        success: false,
        msg: 'error occured'
      });
    }else{
      res.json({
        success: true,
        msg: callback
      });
    }
  });
});
router.get('/driver/get',(req,res,next)=> {
  Driver.getDriver(req.query._id,(err,callback) => {
    if(err) {
      res.json({
        success: false, msg: 'error occured'
      });
    } else {
      res.json({
        data: callback
      })
    }
  })
})

router.get('/vehicle/admin_to_request',(req,res,next)=>{
  Vehicle.get_admin_to_reqeust((err,callback)=>{
    if(err){
      res.json({
        success: false, msg:'error occured'
      });
    }else{
      res.json({
        success: true, msg: callback
      });
    }
  })
});

router.get('/vehicle/set_vehicle',(req, res, next) => {
  Request.set_vehicle(req.query.refNo, req.query._id, (err, callback)=> {
    if(err){
      res.json({
        success: false, msg: 'error occured'
      });
    }else{
      res.json({
        success: true, msg: callback
      })
    }
  });
  // console.log(req.query.vehicle_no);
});

router.post('/driver/set_driver', (req,res,next) => {
  // console.log(req.body);
  Request.setDriver(req.body.refNo, req.body._id, (err, callback) => {
    if(err) {
      res.json({
        success: false
      });
    } else {
      res.json({
        success: true, msg: callback
      })
    }
  });
});

router.get('/get_request_list', (req, res, next) => {
  Request.get_req_list(req.query.status,(err, callback) => {
    if(err) {
      res.json({
        success: false, msg: 'error occured'
      });
    } else {
      res.json({
        msg: callback
      })
    }
  })
});
router.get('/get_request_on_vehicle', (req,res,next) => {
  // console.log(req.query.vehicle_no);
  Request.getReqOnDayForVehicle(req.query.vehicle_no, (err, callback) => {
    if(err) {
      res.json({
        success: false
      });
    } else {
      res.json({
        success: true, msg: callback
      })
    }
  });
});

router.get('/get_all_driver_details', (req,res,next) => {
  Driver.getAllDriverDetails((err, callback) => {
    if(err) {
      res.json({
        success: false
      });
    } else {
      res.json({
        success: true, msg: callback
      })
    }
  });
});

// get list of request of a driver on a day

router.get('/get_driver_request_on_day', (req,res,next) => {
  if(req.query._id) {
    Request.getRequetsOfDriverOnDay(req.query._id, (err,callback) => {
      if(err) {
        res.json({
          success: false
        });
      } else {
        res.json({
          success: true, data: callback
        })
      }
    });
  }
});


/*
* get list of request of a driver on a month
* */

// get list of request of a driver on a day

router.get('/get_driver_request_on_month', (req,res,next) => {
  if(req.query._id && req.query.month_f_d) { // month_f_d ==>  first date of the month
    Request.getRequetsOfDriverOnMonth(req.query._id, new Date(req.query.month_f_d), (err,callback) => {
      if(err) {
        res.json({
          success: false
        });
      } else {
        res.json({
          success: true, data: callback
        })
      }
    });
  } else {
    res.json({
      success: 'false'
    })
  }
});

// get list of requests on a day

router.get('/get_requests_on_date', (req,res,next) => {
  //console.log(req.query.date);
  let date = req.query.date;
  Request.getRequestOnDay(date, (err, callback ) => {
    if(err) {
      res.json({
        success: false
      })
    } else {
      res.json({
      success: true,
      data: callback
    })
    }
});
});

// get a list of drivers
router.get('/get_vehicle_list', (req,res,next) => {
  Vehicle.get_vehicle_list((err,callback) => {
    if(err) {
      res.json({
        success: false
      })
    } else {
      res.json({
        success: true, data: callback
      })
    }
  });
});

// add new vehicle to list

router.post('/addVehicle',(req,res,next)=>{
    let newVehicle = new Vehicle(req.body);
    console.log(req);
  Vehicle.addVehicle(newVehicle,(err, callback) =>{
    if(err){
      res.json({
        success:false, msg: err
      });
    }else{
      res.json({
      success: true, msg: 'vehicle added succesfully'
    });
  }
  })
});

router.get('/getVehicle',(req,res,next)=>{
  let vehicle_no = req.query.vehicle_no;

  Vehicle.getVehicleByNo(vehicle_no,(err,callback)=>{
    if(err){
      console.log(err);
      res.json({
        success: false
      });
    } else{
      res.json({
        success: true, data: callback
      })
    }
  })
});

// get request on day which have assinged a vehicle
router.get('/get_request_has_vehicle', (req,res,next)=>{
  let date = req.query.date;
  Request.getRequestsHasVehicleOnDay(date, (err,callback) =>{
    if(err){
      res.json({
        success: false
      });
    } else {
      res.json({
        success: true,
        data: callback
      })
    }
  })
});

// update the vehicle status
router.get('/set_vehicle_status', (req,res,next)=>{

  let vehicle_no = req.query.vehicle_no;
  let status= req.query.status;
  
  Vehicle.changeVehicleStatus(vehicle_no,status, (err,callback) =>{
    if(err){
      res.json({
        success: false
      });
    } else {
      res.json({
        success: true,
        data: callback
      })
    }
  })
});

module.exports = router;
