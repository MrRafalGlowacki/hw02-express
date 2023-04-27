
// const dotenv = require("dotenv");
import app from "./app.js"
// const app = require("./app");
import connect from "./database.js";
// const connect = require("./database");

connect()
  .then(() => {
    app.listen(3000, () => {
      console.log("Server running. Use our API on port: 3000");
    });
  })
  .catch((error) => {
    console.log("Server not running. Error message: " + error);
    process.exit(1);
  });
