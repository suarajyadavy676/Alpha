const express = require("express");
const app = express();
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
dotenv.config();

app.use(express.json());
let port = process.env.PORT || 4000

app.get("/", (req, res) => {
  res.send("<h1 style='text-align:center;margin-top:50px'>Hello this is home page</h1>");
})



app.listen(port, () => {
  connectDB()
  console.log("Server started on port 3000");
})