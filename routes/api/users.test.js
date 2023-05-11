import request from "supertest";
import app from "../../app.js";
import { deleteUser } from "../../models/users.js";
import connect from "../../database.js";
import { disconnect } from "mongoose";

describe("Auth routes", () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await deleteUser("test@example.com");
    await disconnect();
  });

  describe("POST /users/signup", () => {
    it("should create a new user and return email and subscription type", async () => {
      const response = await request(app).post("/api/users/signup").send({
        email: "test@example.com",
        password: "testpassword",
      });

      expect(response.body.data).toHaveProperty("email", "test@example.com");
      expect(typeof response.body.data.email).toBe("string");
      expect(response.body.data).toHaveProperty("subscription", "starter");
      expect(typeof response.body.data.subscription).toBe("string");
    });
  });

  describe("POST /users/login", () => {
    it("should return 200 and user token ", async () => {
      const response = await request(app).post("/api/users/login").send({
        email: "test@example.com",
        password: "testpassword",
      });
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty("token");
    });
  });
});
