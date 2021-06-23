const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true
    },
    last_name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, 'Invalid email format']
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Hash the plain text password before saving
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    let salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
