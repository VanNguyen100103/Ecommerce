const Product = require('../models/productModel.js');
const dotenv = require("dotenv")
const connectDatabase = require("../database.js")
const products = require('../data/products.json');

connectDatabase()
dotenv.config({path: '../.env'})

const seedProducts = async () => {
  try{
    await Product.deleteMany()
    console.log("All products are deleted!")

    await Product.insertMany(products)
    console.log("All products are added!")
  }catch(err){
    console.log(err)
  }
}
