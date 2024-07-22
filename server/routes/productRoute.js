const express = require('express');
const router = express.Router();
const productController = require("../controllers/productController.js");
const { isAuthenticatedUser, authorizeRole } = require("../middlewares/authMiddleware");
const upload = require('../middlewares/multerMiddleware.js');

router.post('/admin/product/new', isAuthenticatedUser, authorizeRole(['admin']), upload.array('images', 10), productController.newProduct);


router.get('/product/', isAuthenticatedUser, productController.getProducts);
router.get('/product/all', productController.getAllProducts);
router.get('/product/:id', productController.getProductById);
router.put('/admin/product/:id', isAuthenticatedUser, authorizeRole(['admin']),productController.updateProduct);
router.delete('/admin/product/:id', isAuthenticatedUser, authorizeRole(['admin']),productController.deleteProduct);
router.put("/product/review", isAuthenticatedUser, productController.createProductReview)
router.get("/product/reviews", isAuthenticatedUser, productController.getProductReviews)
router.delete("/product/reviews", isAuthenticatedUser, productController.deleteProductReview)

module.exports = router;
