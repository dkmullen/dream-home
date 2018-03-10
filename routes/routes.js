/*jshint esversion: 6 */
// This file routes incoming requests to the various controllers
const MemberController = require('../controllers/member_controller'),
  UserController = require('../controllers/user_controller');

// Receive app as the argument from app.js
module.exports = (app) => {
  /* For the GET method...Whenever a GET req comes in for the /members route,
   run this function. Send back the object. In this case, the request is for:
   http://localhost:3000/ - 3000 comes from bin/www  */

  app.post('/users', UserController.createuser);
  app.post('/auth', UserController.gettoken);

  app.use( '/', UserController.checktoken);
  app.get('/members/me', MemberController.getme);
  app.get('/members', MemberController.getall);
  app.post('/members', MemberController.create);

  // :id is a wildcard - any value can go here
  app.get('/members/:id', MemberController.getone);
  app.put('/members/:id', MemberController.edit);
  app.delete('/members/:id', MemberController.delete);
  app.delete('/users/me/token', UserController.deletetoken);

  app.get('/users/me', UserController.getme);
  app.get('/users', UserController.getallusers);

  // The only use for this is to get the add page to load under checktoken, above
  app.get('/add', MemberController.loadAddPage);
  app.get('/update', MemberController.loadUpdatePage);
};
