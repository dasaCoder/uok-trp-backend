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
      html: `
      <style>
  
body {
    margin: 0;
    padding: 0;
    mso-line-height-rule: exactly;
    min-width: 100%;
}

.wrapper {
    display: table;
    table-layout: fixed;
    width: 100%;
    min-width: 620px;
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
}

body, .wrapper {
    background-color: #ffffff;
}

/* Basic */
table {
    border-collapse: collapse;
    border-spacing: 0;
}
table.center {
    margin: 0 auto;
    width: 602px;
}
td {
    padding: 0;
    vertical-align: top;
}

.spacer,
.border {
    font-size: 1px;
    line-height: 1px;
}
.spacer {
    width: 100%;
    line-height: 16px
}
.border {
    background-color: #e0e0e0;
    width: 1px;
}

.padded {
    padding: 0 24px;
}
img {
    border: 0;
    -ms-interpolation-mode: bicubic;
}
.image {
    font-size: 12px;
}
.image img {
    display: block;
}
strong, .strong {
    font-weight: 700;
}
h1,
h2,
h3,
p,
ol,
ul,
li {
    margin-top: 0;
}
ol,
ul,
li {
    padding-left: 0;
}

a {
    text-decoration: none;
    color: #616161;
}
.btn {
    background-color:#2196F3;
    border:1px solid #2196F3;
    border-radius:2px;
    color:#ffffff;
    display:inline-block;
    font-family:Roboto, Helvetica, sans-serif;
    font-size:14px;
    font-weight:400;
    line-height:36px;
    text-align:center;
    text-decoration:none;
    text-transform:uppercase;
    width:200px;
    height: 36px;
    padding: 0 8px;
    margin: 0;
    outline: 0;
    outline-offset: 0;
    -webkit-text-size-adjust:none;
    mso-hide:all;
}

/* Top panel */
.title {
    text-align: left;
}

.subject {
    text-align: right;
}

.title, .subject {
    width: 300px;
    padding: 8px 0;
    color: #616161;
    font-family: Roboto, Helvetica, sans-serif;
    font-weight: 400;
    font-size: 12px;
    line-height: 14px;
}

/* Header */
.logo {
    padding: 16px 0;
}

/* Logo */
.logo-image {

}

/* Main */
.main {
    -webkit-box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 1px 2px 0 rgba(0, 0, 0, 0.24);
    -moz-box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 1px 2px 0 rgba(0, 0, 0, 0.24);
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 1px 2px 0 rgba(0, 0, 0, 0.24);
}

/* Content */
.columns {
    margin: 0 auto;
    width: 600px;
    background-color: #ffffff;
    font-size: 14px;
}

.column {
    text-align: left;
    background-color: #ffffff;
    font-size: 14px;
}

.column-top {
    font-size: 24px;
    line-height: 24px;
}

.content {
    width: 100%;
}

.column-bottom {
    font-size: 8px;
    line-height: 8px;
}

.content h1 {
    margin-top: 0;
    margin-bottom: 16px;
    color: #212121;
    font-family: Roboto, Helvetica, sans-serif;
    font-weight: 400;
    font-size: 20px;
    line-height: 28px;
}

.content p {
    margin-top: 0;
    margin-bottom: 16px;
    color: #212121;
    font-family: Roboto, Helvetica, sans-serif;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
}
.content .caption {
    color: #616161;
    font-size: 12px;
    line-height: 20px;
}

/* Footer */
.signature, .subscription {
    vertical-align: bottom;
    width: 300px;
    padding-top: 8px;
    margin-bottom: 16px;
}

.signature {
    text-align: left;
}
.subscription {
    text-align: right;
}

.signature p, .subscription p {
    margin-top: 0;
    margin-bottom: 8px;
    color: #616161;
    font-family: Roboto, Helvetica, sans-serif;
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
}
  
  .mail-ul{
     font-family: Roboto, Helvetica, sans-serif;
  }
</style>
      <center class="wrapper">
      <table class="top-panel center" width="602" border="0" cellspacing="0" cellpadding="0">
          <tbody>
          <tr>
              <td class="title" width="300">Universtiy Of Kelaniya</td>
              <td class="subject" width="300"><a class="strong" href="#" target="_blank"></a></td>
          </tr>
          <tr>
              <td class="border" colspan="2">&nbsp;</td>
          </tr>
          </tbody>
      </table>
  
      <div class="spacer">&nbsp;</div>
  
      <table class="main center" width="602" border="0" cellspacing="0" cellpadding="0">
          <tbody>
          <tr>
              <td class="column">
                  <div class="column-top">&nbsp;</div>
                  <table class="content" border="0" cellspacing="0" cellpadding="0">
                      <tbody>
                      <tr>
                          <td class="padded">
                            <h1 style="margin-bottom:-5px">Transport Division</h1>
                            <span style="padding-left:5px;font-size:0.8em;">University of Kelaniya</span>
                            <hr>
                            <br>
                            <p>Hi! Diusha,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Your request is placed successfully. Officail from our division will evaluate it soon.</p> <i> Please use following credentials for check the status of your request.</i> <br><br>
                            <div style="padding-left:50px">
                              <ul class="mail-ul">
                              <li>Refferance No : TRD/230</li>
                              <li>password : 1234</li>
                            </ul>
                            </div>
                            
                            
                            <p style="text-align:center;"><a href="https://uok-trp.firebaseapp.com" class="btn">Visit Our Website</a></p>
  <!--                           <p style="text-align:center;">
                              <a href="#" class="strong">Example link</a>
                            </p> -->
                            <p class="caption">This is a caption text in main email body.</p>
                          </td>
                      </tr>
                      </tbody>
                  </table>
                  <div class="column-bottom">&nbsp;</div>
              </td>
          </tr>
          </tbody>
      </table>
  
      <div class="spacer">&nbsp;</div>
  
      <table class="footer center" width="602" border="0" cellspacing="0" cellpadding="0">
          <tbody>
          <tr>
              <td class="border" colspan="2">&nbsp;</td>
          </tr>
          <tr>
              <td class="signature" width="300">
                  <p>
                      With best regards,<br>
                      Transport Division,<br>
                      University Of Kelaniya <br>
  <!--                     +0 (000) 00-00-00, John Doe<br> -->
                      </p>
                  <p>
                      Support: <a class="strong" href="mailto:#" target="_blank">trp.uok@gmail.com</a>
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

module.exports = router;
