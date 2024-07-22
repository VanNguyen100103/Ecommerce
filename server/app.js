const express = require("express");
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");
const connectDatabase = require('./database.js');
const bodyParser = require('body-parser');
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload")
const cors = require('cors');
const authRoute = require('./routes/authRoute.js');
const orderRoute = require("./routes/orderRoute.js");
const productRoute = require("./routes/productRoute.js");
dotenv.config({ path: './.env' });
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload())
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionSuccessStatus: 200
};

app.use(cors(corsOptions));

app.listen(port, () => {
    console.log(`Server running on http://localhost:${process.env.PORT || port}`);
});

app.use('/api/v1', authRoute);
app.use("/api/v1", productRoute);
app.use("/api/v1", orderRoute);

connectDatabase();
