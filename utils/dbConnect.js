require("dotenv").config();
const mongoose = require("mongoose");

const connection = {};

async function dbConnect() {
  if (connection.isConnected) {
    return;
  }
  console.log("Connecting to the Database");
  const db = await mongoose.connect(process.env.MONGO_URI, {
    UseNewUrlParser: true,
    useUnifiedTopology: true,
  });

  connection.isConnected = db.connections[0].readyState;
  console.log("Connected to the Database");
}

module.exports = dbConnect;
