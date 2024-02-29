const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const compression = require("compression");
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const app = express();

//CORS goes here
const corsOptions = {
  origin: "https://new-budget-tracker.vercel.app", // Allow requests from this origin
  methods: "GET,POST,PUT,DELETE", // Allow these HTTP methods
  optionsSuccessStatus: 200, // Return 200 for preflight requests
};

app.use(cors(corsOptions));

app.use(logger("dev"));


app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Logging middleware for requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});



mongoose.connect(process.env.MONGODB_URL || "mongodb://localhost/budget", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(() => {
  console.log("Connected to MongoDB successfully!");
}).catch((error) => {
  console.error("Error connecting to MongoDB:", error);
});
// routes
// app.use(require("./api/api"));
app.use(require("./api"));
app.use(require("./auth"));

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});