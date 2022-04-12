const express = require("express");
const mongoose = require("mongoose");
const app = express();
const dotenv = require("dotenv").config();
const cors = require("cors");
const PORT = 5000;
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3000"], // linking frontend
    credentials: true,
  })
);

mongoose
  .connect(process.env.MDB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("i'm connected!");
  })
  .catch((err) => console.log("error: ", err));

app.listen(PORT, () => console.log("Server started on port:" + PORT));

app.use("/route", require("./Routes/routes.js"));
