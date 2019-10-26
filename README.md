# uok-trp-backend

This is backend for transport division system.
## How to use

This requires [Node.js](https://nodejs.org/) v10+ to run.

- clone the repo by running ``` git clone https://github.com/dasaCoder/uok-trp-backend.git ```
- run ``` npm install ```
- run the app by ``` npm start app.js ```

## API annotations

```sh
 @api {post} /admin add new admin to the system
 @apiName AddAdmin
 
 @apiParam {string} username password role
 @apiSuccessExample Success-Response:
 {
    "success" : "true",
    "msg" : { username : '', password: '', _id : ''}
 }
 -
 @apiError Admin not created
 ```
 
 
