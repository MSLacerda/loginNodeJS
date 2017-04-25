var mongoose = require("mongoose");
var bcrypt = require('bcrypt');

var mongoSchema = mongoose.Schema;

var UsuarioSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  },
});

UsuarioSchema.pre('save', function (next) {
  var user = this;
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(user.password, salt);
  user.password = hash;
  next();
})

UsuarioSchema.methods.verifyPassword = function (password, next) {
  bcrypt.compare(password, this.password, function (err, res) {
    if (err) {
      return next(err);
    }
    return next(res);
  });
}


module.exports = mongoose.model('Usuario', UsuarioSchema);