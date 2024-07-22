const router = require('express').Router();
const authController = require('../controllers/authController');
const {isAuthenticatedUser, authorizeRole} = require('../middlewares/authMiddleware.js');

router.post("/auth/register", authController.registerUser)
router.post("/auth/login", authController.loginUser)
router.get("/auth/logout", authController.logoutUser)
router.get("/auth/me", isAuthenticatedUser, authController.getUserProfile)
router.post("/auth/forgot-password", authController.forgotPassword)
router.put("/auth/reset-password/:token", authController.resetPassword)
router.put("/auth/password/update", isAuthenticatedUser,authController.updatePassword)
router.put("/auth/me/update", isAuthenticatedUser,authController.updateProfile)
router.get("/admin/auth/all-users", isAuthenticatedUser, authorizeRole(['admin']), authController.getAllUsers)
router.get("/admin/auth/user/:id", isAuthenticatedUser, authorizeRole(['admin']), authController.getUserDetails)
router.put("/admin/auth/user/:id", isAuthenticatedUser, authorizeRole(['admin']), authController.updateUser)
router.delete("/admin/auth/user/:id", isAuthenticatedUser, authorizeRole(['admin']), authController.deleteUser)

module.exports = router;