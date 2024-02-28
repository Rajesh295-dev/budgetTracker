const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const compression = require("compression");
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const app = express();

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
app.use(require("./api/api"));

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});