const express = require("express");
const bodyParser = require("body-parser");
const mysqlpool = require("./config/db");
const userRoutes = require("./routes/usersRoutes");

require('dotenv').config();

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.status(200).send("<h1>App starts server and listens on port 8000 for connections!</h1>");
});

// Database connection check and server start
mysqlpool
  .query("SELECT 1")
  .then(() => {
    console.log("MySQL database connected successfully..");
    const PORT = process.env.PORT;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });
