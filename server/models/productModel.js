const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your product name!'],
        trim: true,
        maxLength: [100, "Product name can't exceed 100 characters."]
    },
    price: {
        type: Number,
        required: [true, 'Please enter your product price!'],
        maxLength: [100, "Product name can't exceed 100 characters."],
        default: 0.0
    },
    description: {
        type: String,
        required: [true, 'Please enter your product description!'],
    },
    ratings: {
        type: Number,
        default: 0
    },
    images: {
        public_id: {
            type: String,
            require: true
        },
        url: {
            type: String,
            required: true
        }
    },
    category: {
        type: String,
        required: [true, 'Please select category for this product!'],
        enum: {
            values: ['Electronics' ,'Computers', 'Smart Home', 'Arts & Craft','Automotive', 'Baby', 'Beauty and Personal Care',  "Women's Fashion", "Men's Fashion", 'Health and Household', 'Home and Kitchen', 'Industrial and Scientific', 'Luggage', 'Pet supplies', 'Software', 'Sports and Outdoor', 'Tools & Home Improvement', 'Toys and Games', 'Video Games'],
            message: 'Please select correct category for product!'
        }
    },
    vendor: {
        type: String,
        required: [true, 'Please enter product vendor']
    }, 
    stock: {
        type: Number,
        required: [true, 'Please enter product stock!'],
        maxLength: [20, "Product stock can't exceed 20 characters."],
        default: 0
    },
    numberOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            name: {
                type: String,
                required: true,
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }
}, { timestamps: true })

module.exports = mongoose.model("Product",productSchema)