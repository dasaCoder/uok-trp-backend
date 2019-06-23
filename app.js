
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');
const jwt = require('jsonwebtoken');
const app = express();



mongoose.connect(config.database, { useNewUrlParser: true });

mongoose.connection.on('connected', ()=>{
  console.log('connected to database '+ config.database);
});

mongoose.connection.on('error', (err)=>{
  console.log('error '+err);
});

const vehicles = require('./routes/vehicles');
const requests = require('./routes/request_routes');
const admin = require('./routes/admin_routes');

// models
const AdminModel = require('./model/admin');

const port = 3000;

app.use(cors());
let x = 0;
app.use(express.static(path.join(__dirname,'public')));

app.use(bodyParser.json());

app.use('/vehicles',vehicles);
app.use('/requests',requests);
app.use('/admin',admin);

app.get('/', (req,res)=>{
  res.send("home page");
});

app.post('/login', (req,res) => {
  let userN = {
    username: req.body.username,
    password: req.body.password
  };

  AdminModel.findOne(userN, function(err,user) {
    if(err) {
      console.log(err);
      return res.status(500).send();
    }

    if(!user) {
      return res.send({
                        msg: 'User Does not exists',
                        status: 403
                      });
    }

    // if user exists
    let token = jwt.sign({user, isAdmin:true},'uok-trp',{ expiresIn:"10h" });
    return res.send({
                      token: token,
                      status: 200
                    });

  })

});


app.listen(process.env.PORT || 5000 , ()=>{
  console.log('server start on port '+ port);
})


function authAdmin(req,res,next){
  // Get auth header value
  //console.log(req.headers['authorization']);
  const bearerHeader = req.headers['authorization'];
  // Check if bearer is undefined

  if(typeof bearerHeader !== 'undefined') {
    // Split at the space
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearerToken = bearer[2];
    // Set the token
    //console.log(bearerToken);
    let token;
    jwt.verify(bearerToken,'uok-trp',(err, decode)=>{
       token = decode;

       if(err){
         res.sendStatus(403);
       } else{
         // Next middleware
         next();
       }
    });



  } else {
    // Forbidden
    res.sendStatus(404);
  }

  //next();
}




