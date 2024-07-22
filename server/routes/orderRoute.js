const router = require('express').Router();
const orderController = require('../controllers/orderController');
const {isAuthenticatedUser, authorizeRole} = require('../middlewares/authMiddleware');

router.post("/order/new", isAuthenticatedUser, orderController.newOrder)
router.get("/order/:id",isAuthenticatedUser, orderController.getOrder)
router.get("/order/me", isAuthenticatedUser, orderController.myOrder)
router.get("/admin/orders", isAuthenticatedUser, authorizeRole(['admin']), orderController.allOrders)
router.put("/admin/order/:id", isAuthenticatedUser, authorizeRole(['admin']), orderController.updateOrder)
router.delete("/admin/order/:id", isAuthenticatedUser, authorizeRole(['admin']), orderController.deleteOrder)

module.exports = router;