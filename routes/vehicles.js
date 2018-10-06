const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');


const Vehicle = require('../model/vehicles');

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
