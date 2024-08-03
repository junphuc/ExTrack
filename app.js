const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRouter = require("./routes/userRouter");
const errorHandler = require("./middlewares/errorHandlerMiddleware");
const categoryRouter = require("./routes/categoryRouter");
const transactionRouter = require("./routes/transactionRouter");
const dotenv = require("dotenv")
const app = express();
dotenv.config();
//!Connect to mongodb
const connectDB = async() =>{
  try {
    await mongoose.connect('mongodb://localhost:27017/ExTrack');
    console.log("MongoDB connected successfully")
  } catch (e) {
    console.log(e)
  }
};
connectDB();
//! Cors config
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: '*', 
  credentials: true, 
  maxAge: 86400
};
app.use(cors(corsOptions));
//!Middlewares
app.use(express.json()); //?Pass incoming json data
//!Routes
app.use("/", userRouter);
app.use("/", categoryRouter);
app.use("/", transactionRouter);
//! Error
app.use(errorHandler);

//!Start the server
const PORT = process.env.PORT;
app.listen(PORT, () =>
  console.log(`Server is running on this port... ${PORT} `)
);
