var mongoose = require("mongoose");
var bcrypt = require('bcrypt');

mongoose.connect('mongodb://localhost:27017/database_react');

var mongoSchema = mongoose.Schema;

var PostSchema = new mongoose.Schema({
  title: {
    type: String,
    unique: false,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  data: {
    type: Date,
    required: true
  },
  user_id: {
    type: String,
    required: true
  },
});

module.exports = mongoose.model('Post', PostSchema);