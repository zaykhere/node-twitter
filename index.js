const express = require("express");
const app = express();
const path = require("path")
const bodyParser = require("body-parser");
const trimBody = require("./middlewares/trimBody");
const dotenv = require('dotenv')
const mongoose = require("./database");

const PORT = 5000;

dotenv.config()

app.set('view engine', 'pug');
app.set("views", "views")

app.use(express.json())
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({extended: false}))
app.use(trimBody);

//Import Routes
const authRoutes = require("./routes/authRoutes");
const { requireLogin } = require("./middlewares/auth");

app.use("/auth", authRoutes);

app.get("/", requireLogin ,(req,res) => {
  let payload = {
    pageTitle: "Home"
  }
  res.status(200).render("home", payload);
})

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));