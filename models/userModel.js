const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  role: {type: String, enum: ['user', 'admin'], default: 'user'},
  accessToken: { type: String, default: null},
  refreshToken: {type: String, default: null}
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
})

const User = mongoose.model('User', userSchema);
module.exports = User;