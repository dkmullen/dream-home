/*jshint esversion: 6 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
  name: { type: String },
  email: { type: String },
  password: { type: String },
  admin: {
    type: Boolean,
    default: false
  },
  token: {
    type: String
  }
});

UserSchema.methods.updateUser = function() {

};

// Make the model, call it UserSchema, pass in the Schema
module.exports = mongoose.model('User', UserSchema);
