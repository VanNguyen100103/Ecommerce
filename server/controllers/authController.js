const User = require("../models/userModel");
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const cloudinary = require("cloudinary");

const authController = {
    registerUser: async (req, res) => {
        try {
            const result = await cloudinary.v2.uploader.upload(req.body.avatar,{
                folder: 'avatars',
                width: 150,
                crop: 'scale'
            })
            const { username, email, password } = req.body;
            const user = await User.create({
                username,
                email,
                password,
                avatar: {
                    public_id: result.public_id,
                    url: result.secure_url,
                },
            })
            const refreshPasswordToken = user.getRefreshPasswordToken()
            return res.status(200).json({success: true, refreshPasswordToken})
        }
        catch (e) {
            console.log(e.message);
            return res.status(500).json({success: false, message: "Can't create new user."})
        }
    },
    loginUser: async (req, res) => {
        try {
            const { email, password } = req.body;
        
    
            if (!email || !password) {
                return res.status(400).json({ success: false, message: "Please enter exactly email & password!" });
            }
    
            const user = await User.findOne({ email }).select('+password');
            if (!user) {
                return res.status(401).json({ success: false, message: "Invalid email or password!" });
            }
    
            const isPasswordMatched = await user.comparePassword(password);
            if (!isPasswordMatched) {
              
                return res.status(401).json({ success: false, message: "Invalid email or password!" });
            }

    
            const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_ACCESS_TOKEN, { expiresIn: "1d" });
            const refreshToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_REFRESH_TOKEN, { expiresIn: '365d' });
    
            res.cookie("refreshToken",  refreshToken, {
                httpOnly: true,
                secure: false,
                path: "/",
                sameSite: "strict",
                maxAge: 365 * 24 * 60 * 60 * 1000
            });
    
            return res.status(200).json({ success: true, accessToken, refreshToken, user });
        } catch (e) {
            console.log(e.message);
            return res.status(500).json({ success: false, message: "Something went wrong." });
        }
    }
    
    ,
    logoutUser : (req, res) => {
        return res.status(200).json({ success: true });
    },
    forgotPassword: async (req, res) => {
        try {
            const {email} = req.body;
            console.log(email)
            if (!email) {
                return res.status(400).json({success: false, message: "Please register this email!"});
            }
            const user = await User.findOne({email})

            if (!user) {
                return res.status(400).json({success: false, message: "User not found."});
            }
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                secure: true, 
                auth: {
                  user: process.env.ADMIN_GMAIL,
                  pass: process.env.ADMIN_PASS,
                },
              });
              
            
            // send mail with defined transport object
            const receiver = {
              from: 'admin@gmail.com', // sender address
              to: "nganhvan1609@gmail.com", // list of receivers
              subject: "Password Reset Request", // Subject line
              html: `Click on this link to generate your new password ${process.env.CLIENT_URL}/reset-password/${user.resetPasswordToken}`, // html body
            };
            await transporter.sendMail(receiver)
            return res.status(200).json({ success: true, message: "Password reset link send successfully." });

        }
        
        catch (e) {
            return res.status(500).json({ success: false, message: "Something went wrong.", error: e.message});
        }    
    },
    resetPassword: async (req, res) => {
        try {
            const user = await User.findOne({resetPasswordToken: req.params.token});
            console.log(user);
            if (!user) {
                return res.status(400).json({ success: false, message: "Password reset token is invalid or has been expired."})
            }
            if(req.body.password !== req.body.confirmPassword) {
                return res.status(401).json({ success: false, message: "Password doesn't match."})
            }
            user.password = req.body.password;
            user.resetPasswordToken = undefined
            user.resetPasswordExpire = undefined
            await user.save()
            return res.status(200).json({ success: true, message: "DONE.", error: e.message});
        } catch (e) {
            return res.status(500).json({ success: false, message: "Something went wrong.", error: e.message});
        }

    },
    getUserProfile: async (req, res) => {
        const user = await User.findById(req.user._id)
        res.status(200).json({ success: true, user})
    },
    updatePassword: async (req, res) => {
        const user = await User.findById(req.user._id).select('+password')
        const isPasswordMatched = await user.comparePassword(req.body.oldPassword)
        if (!isPasswordMatched) {
            return res.status(400).json({ success: false, message : "Old password is incorrect." })
        }
        user.password = req.body.password;
        await user.save()
        return res.status(200).json({ success: true, message : "Old password is updated." })
    },
    updateProfile: async (req, res) => {
        const newUserData = {
            username: req.body.username,
            email: req.body.email,
            'avatar.url': req.body.url
        }
        const user = await User.findByIdAndUpdate(req.user._id, newUserData, {new: true, runValidators: true})
        return res.status(200).json({ success: true, user})
    },
    getAllUsers: async (req, res) => {
        const users = await User.find()
        return res.status(200).json({ success: true, users })
    },
    getUserDetails: async (req, res) => {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(401).json({success : false, message : `User doesn't fund with id ${req.params.id}`})
        }
        return res.status(200).json({success : true, message : user})
    },
    updateUser: async (req, res) => {
        try {
            const newUserData = {
                username: req.body.username,
                email: req.body.email,
                'avatar.url': req.body.url,
                role: req.body.role
            };
            const user = await User.findByIdAndUpdate(req.params.id, newUserData, { new: true, runValidators: true });
            if (!user) {
                return res.status(404).json({ success: false, message: `User not found with id ${req.params.id}` });
            }
            return res.status(200).json({ success: true, user });
        } catch (e) {
            return res.status(500).json({ success: false, message: "Something went wrong.", error: e.message });
        }
    },
    deleteUser: async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ success: false, message: `User not found with id ${req.params.id}` });
            }
            await User.deleteOne({ _id: req.params.id });
            return res.status(200).json({ success: true, message: "User deleted successfully." });
        } catch (e) {
            return res.status(500).json({ success: false, message: "Something went wrong.", error: e.message });
        }
    }
       
    
    
}

module.exports = authController;