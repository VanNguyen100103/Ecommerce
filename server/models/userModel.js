const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please enter your name!'],
        maxLength: [30, "Your name can't exceed 30 characters."]
    },
    email: {
        type: String,
        required: [true, "Please enter your email!"],
        unique: true,
        validate: [validator.isEmail, "Please enter valid email address!"]
    },
    password: {
        type: String,
        required: [true, "Please enter your password!"],
        minLength: [6, "Your password must be longer than 6 characters."],
        select: true
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    role: {
        type: String,
        default: "user"
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, { timestamps: true })

userSchema.methods.comparePassword = async function(enteredPass){
    return await bcrypt.compare(enteredPass, this.password);
}
  
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
          return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
      next();
});
  

userSchema.methods.getRefreshPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 24 * 60 * 60 * 1000;
    return resetToken;
}


module.exports = mongoose.model('User', userSchema)

