
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');
const jwt = require('jsonwebtoken');
const app = express();

mongoose.connect(config.database);

mongoose.connection.on('connected', ()=>{
  console.log('connected to database '+ config.database);
});

mongoose.connection.on('error', (err)=>{
  console.log('error '+err);
});

const vehicles = require('./routes/vehicles');
const requests = require('./routes/request_routes');
const admin = require('./routes/admin_routes');

const port = 3000;

app.use(cors());
let x = 0;
app.use(express.static(path.join(__dirname,'public')));

app.use(bodyParser.json());

app.use('/vehicles',vehicles);
app.use('/requests',requests);
app.use('/admin',authAdmin,admin);

app.get('/', (req,res)=>{
  res.send("home page");
});
app.post('/login', (req,res) => {
  const user = {
    username: 'trp-admin',
    password: 'trp-admin'
  };

  // match username and password
  if(req.body.username == user.username && req.body.password == user.password){
    let token = jwt.sign({user, isAdmin:true},'uok-trp',{ expiresIn: 60 * 60 });
    res.send({
      token: token,
      status: 200
    });
  } else {
    res.send({
      msg: 'error in loggin',
      status: 403
    });
  }

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
}
