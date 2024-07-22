const Order = require("../models/orderModel.js");
const Product = require('../models/productModel.js');

const orderController = {
    newOrder: async (req, res) => {
        const { orderItems, shippingInfo, itemsPrice, taxPrice, shippingPrice, totalPrice, paymentInfo } = req.body
        const order = await Order.create({orderItems, shippingInfo, itemsPrice, taxPrice, shippingPrice, totalPrice, paymentInfo, paidAt: Date.now(),user: req.user_id})
        res.status(200).json({success: true, order})
    },
    getOrder: async (req, res) => {
        try {
            const order = await Order.findById(req.params.id).populate('user', 'name email');
            if (!order) {
                return res.status(404).json({ message: "No order found with this ID" });
            }
            res.status(200).json({ success: true, order });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    myOrder: async (req, res) => {
        try {
            const order = await Order.find({ user: mongoose.Types.ObjectId(req.user._id) });
            res.status(200).json({ success: true, order });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    allOrders: async (req, res) => {
        const orders = await Order.find()
        let totalAmount = 0;
        orders.forEach(async order => {
            totalAmount += order.totalPrice;
        })
   
        res.status(200).json({ success: true, totalAmount})
    },
    updateStock: async (id, quantity) => {
        const product = await Product.findById(id);
        product.stock = product.stock - quantity;
        await product.save();
    },
    updateOrder: async (req, res) => {
        try {
            const order = await Order.findById(req.params.id);
            if (!order) {
                return res.status(404).json({ success: false, message: "Order not found with this ID" });
            }
            if (order.orderStatus === "Delivered") {
                return res.status400().json({ success: false, message: "You have already delivered this order." });
            }

            order.orderItems.forEach(async orderItem => {
                await orderController.updateStock(orderItem.product, orderItem.quantity);
            });

            order.orderStatus = req.body.status;
            order.deliveredAt = Date.now();
            await order.save();

            res.status(200).json({ success: true, order });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    deleteOrder: async (req, res) => {
        try {
            const order = await Order.findById(req.params.id);
            if (!order) {
                return res.status(404).json({ success: false, message: `User not found with id ${req.params.id}` });
            }
            await Order.deleteOne({ _id: req.params.id });
            return res.status(200).json({ success: true, message: "Order deleted successfully." });
        } catch (e) {
            return res.status(500).json({ success: false, message: "Something went wrong.", error: e.message });
        }
    }

}

module.exports =  orderController;


