const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const app = express();

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
app.use(require("./api"));

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});