import { describe, it } from "mocha";
import { expect } from "chai";
import {
  resetDatabaseBeforeEach,
  createTestServer,
  ITestServer,
} from "../../test/test_helper";
import supertest from "supertest";
import { User } from "../database/models";
import HttpStatus from "http-status-codes";

describe("AuthRoutes", () => {
  resetDatabaseBeforeEach();
  let testServer: ITestServer;

  before(() => {
    testServer = createTestServer();
  });

  after(async () => {
    await testServer.quit();
  });

  describe("accessing protected routes while not logged in", () => {
    it("if not logged in, /api/auth/user returns Unauthorized", async () => {
      // Arrange

      // Act
      await supertest(testServer.app)
        .get("/api/auth/user")
        .expect(HttpStatus.UNAUTHORIZED);

      // Assert
    });

    it("if not logged in, /api/auth/logout returns Unauthorized", async () => {
      // Arrange

      // Act
      await supertest(testServer.app)
        .delete("/api/auth/logout")
        .expect(HttpStatus.UNAUTHORIZED);

      // Assert
    });
  });

  describe("login / logout flow", () => {
    it("on failed login (wrong password), returns Unauthorized", async () => {
      // Arrange
      const username = "test";
      const password = "strong enough";
      const user = User.build({ username: username });
      user.setPassword(password);
      await user.save();

      // Act
      await supertest(testServer.app)
        .post("/api/auth/login")
        .send({ username, password: "wrong" })
        .expect(HttpStatus.UNAUTHORIZED);

      // Assert
    });

    it("on falied login (user does not exist), returns Unauthorized", async () => {
      // Arrange

      // Act
      await supertest(testServer.app)
        .post("/api/auth/login")
        .send({ username: "non-existant", password: "wrong" })
        .expect(HttpStatus.UNAUTHORIZED);

      // Assert
    });

    describe("on successful login", () => {
      let agent: supertest.SuperTest<supertest.Test>;
      const username = "test";

      beforeEach(async () => {
        const password = "strong enough";
        const user = User.build({ username: username });
        user.setPassword(password);
        await user.save();

        agent = supertest.agent(testServer.app);
        await agent
          .post("/api/auth/login")
          .send({ username, password })
          .expect("set-cookie", /connect\.sid/)
          .expect(HttpStatus.OK);
      });

      it("can fetch user data", async () => {
        // Arrange

        // Act
        const response = await agent
          .get("/api/auth/user")
          .expect(HttpStatus.OK);

        // Assert
        expect(response.body).to.eql({
          userId: 1,
          username,
        });
      });

      it("can logout, which prevents further access to protected resources", async () => {
        // Arrange

        // Act
        await agent.delete("/api/auth/logout").expect(HttpStatus.OK);

        // Assert
        await agent.get("/api/auth/user").expect(HttpStatus.UNAUTHORIZED);
      });
    });

    it("on successful login, can fetch user data", async () => {
      // Arrange
      const username = "test";
      const password = "strong enough";
      const user = User.build({ username: username });
      user.setPassword(password);
      await user.save();

      const agent = supertest.agent(testServer.app);
      await agent
        .post("/api/auth/login")
        .send({ username, password })
        .expect("set-cookie", /connect\.sid/)
        .expect(HttpStatus.OK);

      // Act
      const response = await agent.get("/api/auth/user").expect(HttpStatus.OK);

      // Assert
      expect(response.body).to.eql({
        userId: 1,
        username,
      });
    });
  });

  describe("register flow", () => {
    it("on validation error, it returns Unprocessable Entity", async () => {
      // Arrange

      // Act
      const response = await supertest(testServer.app)
        .post("/api/auth/register")
        .send({ username: "", password: "", passwordConfirmation: "" })
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      // Assert
      expect(response.body).to.eql({
        password: "Password is required",
        username: "Username is required",
      });
    });

    it("on succees, sets a cookie allowing access to protected routes", async () => {
      // Arrange
      const username = "test";
      const password = "strong enough";
      const agent = supertest.agent(testServer.app);

      // Act
      await agent
        .post("/api/auth/register")
        .send({ username, password, passwordConfirmation: password })
        .set("Accept", "application/json")
        .expect("set-cookie", /connect\.sid/)
        .expect(HttpStatus.OK);

      // Assert
      await agent.get("/api/auth/user").expect(HttpStatus.OK);
    });
  });
});
