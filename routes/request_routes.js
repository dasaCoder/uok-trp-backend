const express = require('express');
const jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
const router = express.Router();

const Request = require('../model/requests');




var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'trp.uok@gmail.com',
    pass: 'Dasa@0114'
  }
});


router.post('/add',(req,res,next)=>{

  if(req.body) {
    let newRequest = new Request(req.body);
    console.log(newRequest);
    Request.add_request(newRequest,(err,callback)=>{
      if(err){
        res.json({
          success: false, msg: 'error ocuured'
        })
      }else{
          // sending email

          sendRegEmail(callback['refNo'],callback['password'],callback['lecturer'],callback['email']);


        res.json({
          success: true, msg: callback
        })
      }
    })
  } else {
    res.json({
      success: false, msg: 'error occured'
    });
  }

});

router.get('/get_not_considered_requests',(req,res,next) => {
  Request.get_not_considered_requests((err,callback)=>{
    if(err){
      res.json({
        success: false, msg: 'error occured'
      })
    }else{
      res.json({
        success: true,
        msg: callback['data']
      })
    }
  })
});

router.get('/get/:refNo',(req,res,next)=> {
  Request.get_request(req.params.refNo, (err,callback)=> {
    if(err){
      res.json({
        success: false, msg: 'error occured'
      });
    }else{
      res.json({
        success: true, msg: callback
      })
    }
  } )
});

router.get('/get_for_user/:refNo/:password',(req,res,next)=> {
  // console.log(req.params);
  Request.get_req_for_user(req.params, (err,callback)=> {
    if(err){
      res.json({
        success: false, msg: 'error occured'
      });
    }else{

      if(!callback[0]){
        res.json({
          success: true, msg: 0
        })
      } else {

        var content = JSON.stringify(callback[0]);

        var token = jwt.sign(content,'uoktrd');


        res.json({
          success: true, msg: 1, token: token
        });
      }

      /*res.json({
        success: true, msg: callback[0]
      })*/
    }
  } )
});

router.get('/setDriver/:refNo',(req,res,next) => {
  Request.setDriver(req.params.refNo,'mr. Gihan ekanayaka',(err,callback) => {
    if(err){
      res.json({
        success: false, msg: 'error occured'
      });
    }else{
      res.json({
        success: true, msg: callback
      });
    }
  })
});

router.get('/status/:refNo/:status',(req,res,next) => {
  Request.change_status(req.params.refNo, req.params.status, (err, callback) => {
    if(err){
      res.json({
        success: false, msg: 'error occured'
      });
    }else{
      // send user email
      if(req.params.status == 1){

        Request.sendUserEmail(req.params.refNo);

      }

      res.json({
        success: true, msg: callback
      });
    }
  });
});

router.post('/more_details', (req,res,next) => {

  Request.set_moredetails(req.body, (err, callback ) => {
    if(err){
      res.json({
        success: false, msg: 'error occured'
      });
    }else{
      res.json({
        success: true, msg: callback
      })
    }
  })
});

router.get('/active_requests', (req,res,next) => {
  Request.getActiveRequests((err, callback)=> {
    if(err){
      res.json({
        success: false, msg: 'error occured'
      })
    }else{
      res.json({
        success: true, msg: callback
      })
    }
  })
});

router.post('/getStatus', (req,res,next) => {
  // console.log(req);
  Request.getStatusReq(req.body, (err, callback) => {
    if(err){    // if some error occured return 10
      res.json({
        success: false, isLogged: 0
      })
    } else {

      if(!callback[0]){ // checks wherther the request is exixts
        res.json({
          success: true, isLogged: 0 // if no return 0
        })
      } else {

        var content = JSON.stringify(callback[0]);

        var token = jwt.sign(content,'uoktrd');


        res.json({
          success: true, isLogged: 1, token: token
        });
      }
    }
  })
})

router.get('/test',(req,res,next) => {
  Request.authTest(5, (err, request) => {
    if(err) console.log(err);
    console.log(request);
  });
});

function sendRegEmail(refNo,password,name,email)
{
  
   

    var mailOptions = {
      from: 'Admin <trp.uok@gmail.com>',
      to: email,
      subject: 'Request Vehicle - Transport Division, University of Kelaniya',
      html: "Hi! <b>"+name+"</b><p>Your request is placed successfully. Officail from our division will evaluate it soon. </p>"+
      "<b><i>Please use following credentials for check the status of your request.</i></b><br><br><p>Your refferance number is : "+
      refNo+"</p><p>Your password is : "+password+"</p><br>Thank you! "
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
}

module.exports = router;
