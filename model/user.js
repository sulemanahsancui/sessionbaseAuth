var mongoose = require("mongoose");
const { Schema } = require("mongoose");

const userSchema = new Schema({
  username: { type: String },
  email: { type: String, require: true },
  password: { type: String, require: true },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
