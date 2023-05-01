import express, { json } from "express";
import morgan from "morgan";
import cors from "cors";

import contactsRouter from "./routes/api/contacts.js";
import usersRouter from "./routes/api/users.js";

const app = express();

app.use(express.static("public"));

const formatsLogger = app.get("env") === "development" ? "dev" : "short";
app.use(morgan(formatsLogger));
app.use(cors());
app.use(json());

app.use("/api/contacts", contactsRouter);
app.use("/api/users", usersRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

export default app;
