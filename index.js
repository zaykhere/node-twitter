const express = require("express");
const app = express();

const PORT = 5000;

app.set('view engine', 'pug');
app.set("views", "views")

app.get("/", (req, res) => {
  let payload = {
    pageTitle: "Home"
  }
  res.status(200).render("home", payload);
})

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));