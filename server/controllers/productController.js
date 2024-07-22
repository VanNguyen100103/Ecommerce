const Product = require('../models/productModel.js');
const cloudinary = require("cloudinary");

const productController = {

  getAllProducts: async (req, res) => {
    try {
      const products = await Product.find();
      const productCount = await Product.countDocuments();
      res.status(200).json({ products, productCount });
    } catch (err) {
      console.error('Error in getAllProducts:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  getProductById: async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json({ product });
    } catch (err) {
      console.error('Error in getProductById:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  getProducts: async (req, res) => {
    try {
      const products = await Product.find({ name: req.body.name });
      const productCount = await Product.countDocuments({ name: req.body.name });
      res.status(200).json({ products, productCount });
    } catch (error) {
      console.error('Error in getProducts:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

newProduct : async (req, res) => {
    try {
      console.log('Request body:', req.body);
      console.log('Request files:', req.files);
  
      let images = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const result = await cloudinary.v2.uploader.upload(file.path, { folder: 'products' });
          images.push({
            public_id: result.public_id,
            url: result.secure_url
          });
        }
      } else {
        throw new Error('Images must be uploaded');
      }
  
      req.body.images = images;
      req.body.user = req.user._id;
      const product = await Product.create(req.body);
      return res.status(200).json({ success: true, message: "Added new product successfully.", product });
    } catch (err) {
      console.error('Error adding new product:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  
  
  
  updateProduct: async (req, res) => {
    try {
      let product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      res.status(200).json('Product updated successfully');
    } catch (err) {
      console.error('Error in updateProduct:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const deleteProduct = await Product.findByIdAndDelete(req.params.id);
      res.status(200).json(deleteProduct);
    } catch (err) {
      console.error('Error in deleteProduct:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  createProductReview: async (req, res) => {
    try {
      const { name, rating, comment, productId } = req.body;

      const review = {
        user: req.user._id,
        name,
        rating: Number(rating),
        comment,
      };

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (!product.reviews) {
        product.reviews = [];
      }

      const isReviewed = product.reviews.find(
        (r) => r.user && r.user.toString() === req.user._id.toString()
      );

      if (isReviewed) {
        product.reviews.forEach((r) => {
          if (r.user && r.user.toString() === req.user._id.toString()) {
            r.comment = comment;
            r.rating = rating;
          }
        });
      } else {
        product.reviews.push(review);
        product.numberOfReviews = product.reviews.length;
      }

      product.ratings =
        product.reviews.reduce((acc, item) => acc + item.rating, 0) /
        product.reviews.length;

      await product.save({ validateBeforeSave: false });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Error in createProductReview:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  getProductReviews: async (req, res) => {
    try {
      const product = await Product.findById(req.query.id);
      return res.status(200).json({ success: true, reviews: product?.reviews });
    } catch (err) {
      console.error('Error in getProductReviews:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  deleteProductReview: async (req, res) => {
    try {
      const { productId, reviewId } = req.query;

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const reviews = product.reviews.filter(re => re._id && re._id.toString() !== reviewId.toString());
      const numberOfReviews = reviews.length;

      const totalRatings = reviews.reduce((acc, item) => acc + (item.rating || 0), 0);
      const ratings = numberOfReviews === 0 ? 0 : totalRatings / numberOfReviews;

      product.reviews = reviews;
      product.ratings = ratings;
      product.numberOfReviews = numberOfReviews;

      await product.save({ validateBeforeSave: false });

      return res.status(200).json({ success: true, reviews });
    } catch (err) {
      console.error('Error in deleteProductReview:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
};

module.exports = productController;
