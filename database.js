const mongoose = require("mongoose");
const dotenv = require('dotenv')

dotenv.config();

class Database {
  constructor() {
    this.connect();
  }

  connect() {
    mongoose.connect(process.env.DB_CONN)
      .then(() => {
        console.log("DB Connected");
      })
      .catch((err) => {
        console.log(err);
      })
  }
}

module.exports = new Database();