require("dotenv").config();

const errorHandler = require("./middleware/error-hundler");
const express = require("express");
const cors = require("cors");
const sequelize = require("./db");
const router = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", router);
app.use(errorHandler);

const port = 3001;

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(port, () => {
      console.log(`SERVER STARTED ON ${port} PORT`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

start();
