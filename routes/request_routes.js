const {Storage} = require('@google-cloud/storage');
const express = require('express');
const jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');

var pdf = require('html-pdf');

const router = express.Router();

const Request = require('../model/requests');

var fs = require('fs');


var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
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
      Request.uploadRequest(req.body['refNo']);

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
  let refNo = 54;
  var html = fs.readFileSync('./templates/application.html', 'utf8');
  html = html.replace('{{refNo}}',refNo);
  var options = { 
                  format: 'A4',
                  border: 0 
                };

  pdf.create(html, options).toFile('./'+ refNo +'.pdf', function(err, response) {
    if (err) return console.log(err);
    
    var storage = new Storage({
      projectId: process.env.PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });
  
    var BUCKET_NAME = process.env.REQUEST_BUCKET;
  
    var myBucket = storage.bucket(BUCKET_NAME);
  
    let localFileLocation = './'+ refNo +'.pdf';
  
    myBucket.upload(localFileLocation, { public: true })
      .then(file => {
        console.log(file);
        fs.unlinkSync(localFileLocation);
      })
  
  });



});

async function uploadFile() {


}

function sendRegEmail(refNo,password,name,email)
{

    var mailOptions = {
      from: 'Admin <trp.uok@gmail.com>',
      to: email,
      subject: 'Request Vehicle - Transport Division, University of Kelaniya',
      html: `
      <center class="wrapper" style="display: table;table-layout: fixed;width: 100%;min-width: 620px;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;background-color: #ffffff;">
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
                            <p style="margin-top: 0;margin-bottom: 16px;color: #212121;font-family: Roboto, Helvetica, sans-serif;font-weight: 400;font-size: 16px;line-height: 24px;">Hi! ${name},<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Your request is placed successfully. Officail from our division will evaluate it soon.</p> <i> Please use following credentials for check the status of your request.</i> <br><br>
                            <div style="padding-left:50px">
                              <ul class="mail-ul" style="margin-top: 0;padding-left: 0;font-family: Roboto, Helvetica, sans-serif;">
                              <li style="margin-top: 0;padding-left: 0;">Refferance No : TRD/${refNo}</li>
                              <li style="margin-top: 0;padding-left: 0;">password : ${password}</li>
                            </ul>
                            </div>
                            
                            
                            <p style="text-align: center;margin-top: 0;margin-bottom: 16px;color: #212121;font-family: Roboto, Helvetica, sans-serif;font-weight: 400;font-size: 16px;line-height: 24px;"><a href="https://uok-trp.firebaseapp.com" class="btn" style="text-decoration: none;color: #ffffff;background-color: #2196F3;border: 1px solid #2196F3;border-radius: 2px;display: inline-block;font-family: Roboto, Helvetica, sans-serif;font-size: 14px;font-weight: 400;line-height: 36px;text-align: center;text-transform: uppercase;width: 200px;height: 36px;padding: 0 8px;margin: 0;outline: 0;outline-offset: 0;-webkit-text-size-adjust: none;mso-hide: all;">Visit Our Website</a></p>
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




module.exports = router;
