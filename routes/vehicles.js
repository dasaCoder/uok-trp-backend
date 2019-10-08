const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');


const Vehicle = require('../model/vehicles');

// update vehicle status
router.post('/update/status', (req,res,next) => {
  _id = req.query._id;

  Vehicle.updateStatus(_id, req.body.status, (err,callback) => {
    if(err){
      res.json({
        success: false, msg: err
      });
    }else {
      res.json({
        success: true,
        msg: callback
      })
    }
  })
});

// load repair history for given vehicle
router.get('/maintenance/single/get',(req,res,next) => {
  _id = req.query._id;

  Vehicle.getVehicleRepairHistory(_id,(err, callback)=>{
      if(err){
        res.json({
          success: false, msg: err
        });
      }else {
        res.json({
          success: true,
          msg: callback
        })
      }
  })
});

// change vehicle maintenence details
router.post('/maintenance/update', (req,res,next) => {
  _id = req.query._id;

  Vehicle.updateRepairRecord(_id, req.body, (err, callback) =>{
    if(err){
      res.json({
        success: false, msg: err
      });
    }else {
      
      Vehicle.checkUnfinishedRepairs(_id, req.body.isFinished);

      res.json({
        success: true,
        msg: callback
      })
    }
  });
});

// get available vehicles for given requests
router.get('/suggestions',(req,res,next) => {
  _id = req.query._id;

  Vehicle.getSuggestions(_id,(e,c) => {
    if(e) {
      res.json({
        success: false, msg: e
      });
    }
    else {
      console.log("c",c);
      res.json({
        success : true,
        msg: c
      })
    }
  })
});

// test purposes
router.get('/test',(req,res,next) =>{

  _id = req.query._id;

  Vehicle.checkUnfinishedRepairs(_id, (err, callback) => {
    if(err){
      res.json({
        success: false, msg: err
      });
    }else {
      res.json({
        success: true,
        msg: callback
      })
    }
  })
});

router.get('/day', (req,res,next)=>{
  res.send('today vehcle list');
});

router.post('/add',(req,res,next)=>{
  let newVehicle = new Vehicle(req.body);
  Vehicle.addVehicle(newVehicle,(err, callback) =>{
    if(err){
      res.json({
        success:false, msg: 'failed to register user'
      });
    }else{
      res.json({
        success: true, msg: 'vehicle added succesfully'
      });
    }
  })
});

router.get('/all_vehicles',(req,res,next)=>{
  Vehicle.get_vehicle_list((err,callback)=>{
    if(err){
      res.json({
        success: false, msg: 'error occured'
      });
    }else {
      res.json({
        success: true,
        msg: callback
      })
    }
  });
});

router.get('/get_vehicle_on_date',(req,res,next)=>{
  Vehicle.get_vehicle_on_day(req.query.date,(err,callback)=>{
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
});


module.exports = router;
