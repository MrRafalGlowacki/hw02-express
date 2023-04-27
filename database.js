import { connect as _connect } from "mongoose";
import { config } from "./helpers/config.js";
const dbpath = config.MONGODB_URI;
if (!dbpath) {
  console.error("no db secret");
}

const connect = async () => {
  await _connect(dbpath).then(() =>
    console.log("Database connection successful")
  );
};

export default connect;
