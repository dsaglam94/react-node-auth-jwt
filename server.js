require("dotenv").config();
const express = require("express");
const dbConnect = require("./utils/dbConnect");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 3001;

// middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// db connection
dbConnect()
  .then((result) => {
    app.listen(process.env.PORT || PORT, () => {
      console.log(`Server is listening at port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Database connection failed");
    console.log(err);
  });

app.use(authRoutes);
