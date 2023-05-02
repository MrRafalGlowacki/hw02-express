import app from "./app.js";
import connect from "./database.js";
import { initDirectory } from "./helpers/tmpCreator.js";

// app.use(express.static("moje"))

connect()
  .then(() => {
    app.listen(3000, async () => {
      await initDirectory("tmp");
      console.log("Server running. Use our API on port: 3000");
    });
  })
  .catch((error) => {
    console.log("Server not running. Error message: " + error);
    process.exit(1);
  });
