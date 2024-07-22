const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const isAuthenticatedUser = async  (req, res, next) => {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: "Please login to access this resource." });
        }
    
        const accessToken = authHeader.split(' ')[1];
    
        try {
            const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN);
    

            req.user = await User.findById(decoded.id);
    
            if (!req.user) {
                return res.status(401).json({ success: false, message: "User not found." });
            }
            req.user_id = req.user._id;
    
            next()
      
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid token, please login again." });
    }
};

const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "You are not authorized to access this resource." });
        }
        next();
    }
}

module.exports = {
    isAuthenticatedUser, authorizeRole
};
