/*jshint esversion: 6 */
/* This backend file extends route.js, defines the jobs each route requires. */

const express = require('express'),
  app = express(),
  jwt = require('jsonwebtoken'),
  bcrypt = require('bcrypt-nodejs'),
  config = require('../config'),
  User = require('../models/user');

app.set('secretKey', config.secret);

module.exports = {
  // Add a new user (app.post '/users')
  createuser(req, res, next) {
    const userProperties = req.body; // const = entire request body sent in
    User.findOne({ email: userProperties.email })
      .then(user => {
        if (user) {
          res.json({
            success: false,
            message: 'That email is already registered.'
          });
        } else {
          User.create(
            {
              name: userProperties.name,
              email: userProperties.email,
              password: bcrypt.hashSync(
                userProperties.password,
                bcrypt.genSaltSync(10)
              )
            },
            (err, user) => {
              if (err) {
                res.status(400).json(err);
              }
            }
          ).then(user => res.send(user));
        }
      })
      .catch(next);
  },

  // Get my user record ('/users/me') to check my own id (ie, in Postman)
  getme(req, res, next) {
    User.findOne({ token: req.headers['x-access-token'] })
      .then(user => {
        return res.send(user);
      })
      .catch(e => {
        res.status(400).send(e);
      });
  },

  // Get my user record ('/users/me') to check my own id (ie, in Postman)
  getallusers(req, res, next) {
    User.find({})
      .then(members => res.send(members)) // send it
      .catch(data => res.send(data)); // in case of err, run the next thing, don't hang up here
  },

  // Log in (app.post('/auth'))
  gettoken(req, res) {
    const userEmail = req.body.email;
    User.findOne({ email: userEmail }, (err, user) => {
      if (err) throw err;
      if (!user) {
        res.json({
          success: false,
          message: "That email isn't in our records"
        });
      } else if (user) {
        // check if password matches
        if (!bcrypt.compareSync(req.body.password, user.password)) {
          res.json({
            success: false,
            message: "I don't recognize that password."
          });
        } else {
          // if member is found and password is right
          // create a token
          const token = jwt.sign(user, app.get('secretKey'), {
            expiresIn: 60 * 60 * 24 // expires in 24 hours
          });
          user.token = token; // adds token to user object
          user.save(); // and saves it to the db, but APPENDS old token. :(
          // return the information including token as JSON for use on front end?
          res.json({
            success: true,
            message: 'Enjoy your token!',
            token: token,
            id: user._id
          });
        }
      }
    });
  },

  // Route middleware to verify a token (app.use '/')
  checktoken(req, res, next) {
    // check header or url parameters or post parameters for token
    var token =
      req.body.token || req.query.token || req.headers['x-access-token'];
    // decode token
    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, app.get('secretKey'), function(err, decoded) {
        if (err) {
          return res.status(401).send({
            success: false,
            message: 'Failed to authenticate token.'
          });
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;
          next();
        }
      });
    } else {
      // if there is no token, send 401 to controllers.js on the front-end
      return res.status(401).send({
        success: false,
        message: 'No token provided.'
      });
    }
  },

  // Log out (app.delete('/users/me/token'))
  deletetoken(req, res, next) {
    console.log('Im at delete token, back to you');
    User.findOne({ token: req.headers['x-access-token'] })
      .then(user => {
        user.update((user.token = ''));
        user.save();
        res.send();
      })
      .catch(e => {
        res.status(400).send(e);
      })
      .next();
  }
};
