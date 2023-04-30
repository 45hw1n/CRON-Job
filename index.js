const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
require("dotenv").config();
const app = express();
const cron = require("node-cron");
const APIs = require("./api.js");

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connected");
    new Date().toLocaleString();
  });

// cron.schedule("*/1 * * * *", () => {
//   APIs.publishBlog();
// });

// cron.schedule("* * * * * *", () => {
//   console.log('CRON running')
// });

app.listen(process.env.PORT, () => {
  console.log(`App is running on port ${process.env.PORT}`);
});
