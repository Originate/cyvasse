import { describe, it } from "mocha";
import { expect } from "chai";
import {
  resetDatabaseBeforeEach,
  createTestUser,
  loginTestUser,
  IUserCredentials,
  createAndLoginTestUser,
  createTestVariant,
  createTestCredentials,
  createTestPieceRule,
  createTestServer,
  ITestServer,
} from "../../test/test_helper";
import supertest from "supertest";
import {
  IPieceRuleOptions,
  PieceType,
  PathType,
  CaptureType,
  IPieceRule,
} from "../shared/dtos/piece_rule";
import { PieceRuleDataService } from "../services/data/piece_rule_data_service";
import { PieceRule } from "../database/models";
import HttpStatus from "http-status-codes";

describe("PieceRuleRoutes", () => {
  resetDatabaseBeforeEach();
  let testServer: ITestServer;
  let creatorCredentials: IUserCredentials;
  let creatorId: number;
  let variantId: number;

  before(() => {
    testServer = createTestServer();
  });

  after(async () => {
    await testServer.quit();
  });

  beforeEach(async () => {
    creatorCredentials = createTestCredentials("test");
    creatorId = await createTestUser(creatorCredentials);
    variantId = await createTestVariant(creatorId);
  });

  describe("create piece rule (POST /api/variants/:variantId/pieceRules)", () => {
    const pieceRuleOptions: IPieceRuleOptions = {
      pieceTypeId: PieceType.RABBLE,
      count: 1,
      movement: {
        type: PathType.ORTHOGONAL_WITH_TURNS,
        minimum: 1,
        maximum: 1,
      },
      captureType: CaptureType.MOVEMENT,
    };

    it("if not logged in, returns Unauthorized", async () => {
      // Arrange

      // Act
      await supertest(testServer.app)
        .post(`/api/variants/${variantId}/pieceRules`)
        .send(pieceRuleOptions)
        .expect(HttpStatus.UNAUTHORIZED);

      // Assert
    });

    it("if logged in as non-creator, returns Forbidden", async () => {
      // Arrange
      const { agent } = await createAndLoginTestUser(testServer.app, "user2");

      // Act
      await agent
        .post(`/api/variants/${variantId}/pieceRules`)
        .send(pieceRuleOptions)
        .expect(HttpStatus.FORBIDDEN);

      // Assert
    });

    it("if validation errors, returns Unprocessable Entity", async () => {
      // Arrange
      const agent = await loginTestUser(testServer.app, creatorCredentials);

      // Act
      const response = await agent
        .post(`/api/variants/${variantId}/pieceRules`)
        .send({})
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      // Assert
      expect(response.body).to.eql({
        pieceTypeId: "Piece type is required",
        count: "Count is required",
        movement: {
          type: "Movement type is required",
          minimum: "Movement minimum is required",
        },
        captureType: "Capture type must be movement or range.",
      });
    });

    it("on success, returns created object", async () => {
      // Arrange
      const agent = await loginTestUser(testServer.app, creatorCredentials);

      // Act
      const response = await agent
        .post(`/api/variants/${variantId}/pieceRules`)
        .send(pieceRuleOptions)
        .expect(HttpStatus.OK);

      // Assert
      expect(response.body).to.exist();
      expect(response.body.pieceRuleId).to.exist();
    });
  });

  describe("delete piece rule (DETELE /api/variants/:variantId/pieceRules/:pieceRuleId)", () => {
    let pieceRuleId: number;

    beforeEach(async () => {
      pieceRuleId = await createTestPieceRule(PieceType.RABBLE, variantId);
    });

    it("if not logged in, returns Unauthorized", async () => {
      // Arrange

      // Act
      await supertest(testServer.app)
        .delete(`/api/variants/${variantId}/pieceRules/${pieceRuleId}`)
        .expect(HttpStatus.UNAUTHORIZED);

      // Assert
    });

    it("if logged in as non-creator, returns Forbidden", async () => {
      // Arrange
      const { agent } = await createAndLoginTestUser(testServer.app, "user2");

      // Act
      await agent
        .delete(`/api/variants/${variantId}/pieceRules/${pieceRuleId}`)
        .expect(HttpStatus.FORBIDDEN);

      // Assert
    });

    it("if not found, returns Not Found", async () => {
      // Arrange
      const agent = await loginTestUser(testServer.app, creatorCredentials);

      // Act
      await agent
        .delete(`/api/variants/${variantId}/pieceRules/999`)
        .expect(HttpStatus.NOT_FOUND);

      // Assert
    });

    it("on success, deletes the object", async () => {
      // Arrange
      const agent = await loginTestUser(testServer.app, creatorCredentials);

      // Act
      await agent
        .delete(`/api/variants/${variantId}/pieceRules/${pieceRuleId}`)
        .expect(HttpStatus.OK);

      // Assert
      const pieceRules = await new PieceRuleDataService().getPieceRules(
        variantId
      );
      expect(pieceRules.map((pr) => pr.pieceTypeId)).to.eql([PieceType.KING]);
    });
  });

  describe("get piece rules (GET /api/variants/:variantId/pieceRules)", () => {
    it("with default piece rules, returns the king piece rule", async () => {
      // Arrange
      const agent = await loginTestUser(testServer.app, creatorCredentials);

      // Act
      const response = await agent
        .get(`/api/variants/${variantId}/pieceRules`)
        .expect(HttpStatus.OK);

      // Assert
      expect(response.body).to.exist();
      const pieceRules: IPieceRule[] = response.body;
      expect(pieceRules.map((pr) => pr.pieceTypeId)).to.eql([PieceType.KING]);
    });

    it("with piece rules, returns the list", async () => {
      // Arrange
      await createTestPieceRule(PieceType.RABBLE, variantId);
      await createTestPieceRule(PieceType.SPEAR, variantId);
      const agent = await loginTestUser(testServer.app, creatorCredentials);

      // Act
      const response = await agent
        .get(`/api/variants/${variantId}/pieceRules`)
        .expect(HttpStatus.OK);

      // Assert
      expect(response.body).to.exist();
      const pieceRules: PieceRule[] = response.body;
      expect(pieceRules.length).to.eql(3);
      expect(pieceRules.map((x) => x.pieceTypeId)).to.have.members([
        PieceType.KING,
        PieceType.RABBLE,
        PieceType.SPEAR,
      ]);
    });
  });

  describe("update piece rule (UPDATE /api/variants/:variantId/pieceRules/:pieceRuleId)", () => {
    let pieceRuleId: number;
    const updatedPieceRuleOptions: IPieceRuleOptions = {
      pieceTypeId: PieceType.RABBLE,
      count: 1,
      movement: {
        type: PathType.DIAGONAL_LINE,
        minimum: 1,
        maximum: 1,
      },
      captureType: CaptureType.MOVEMENT,
    };

    beforeEach(async () => {
      pieceRuleId = await createTestPieceRule(PieceType.RABBLE, variantId);
    });

    it("if not logged in, returns Unauthorized", async () => {
      // Arrange

      // Act
      await supertest(testServer.app)
        .put(`/api/variants/${variantId}/pieceRules/${pieceRuleId}`)
        .send(updatedPieceRuleOptions)
        .expect(HttpStatus.UNAUTHORIZED);

      // Assert
    });

    it("if logged in as non-creator, returns Forbidden", async () => {
      // Arrange
      const { agent } = await createAndLoginTestUser(testServer.app, "user2");

      // Act
      await agent
        .put(`/api/variants/${variantId}/pieceRules/${pieceRuleId}`)
        .send(updatedPieceRuleOptions)
        .expect(HttpStatus.FORBIDDEN);

      // Assert
    });

    it("if not found, returns Not Found", async () => {
      // Arrange
      const agent = await loginTestUser(testServer.app, creatorCredentials);

      // Act
      await agent
        .put(`/api/variants/${variantId}/pieceRules/999`)
        .send(updatedPieceRuleOptions)
        .expect(HttpStatus.NOT_FOUND);

      // Assert
    });

    it("if validation errors, returns Unprocessable Entity", async () => {
      // Arrange
      const agent = await loginTestUser(testServer.app, creatorCredentials);

      // Act
      const response = await agent
        .put(`/api/variants/${variantId}/pieceRules/${pieceRuleId}`)
        .send({})
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      // Assert
      expect(response.body).to.eql({
        pieceTypeId: "Piece type is required",
        count: "Count is required",
        movement: {
          type: "Movement type is required",
          minimum: "Movement minimum is required",
        },
        captureType: "Capture type must be movement or range.",
      });
    });

    it("on success, returns the updated object", async () => {
      // Arrange
      const agent = await loginTestUser(testServer.app, creatorCredentials);

      // Act
      const response = await agent
        .put(`/api/variants/${variantId}/pieceRules/${pieceRuleId}`)
        .send(updatedPieceRuleOptions)
        .expect(HttpStatus.OK);

      // Assert
      expect(response.body).to.exist();
      const result: IPieceRule = response.body;
      expect(result.movement.type).to.eql(PathType.DIAGONAL_LINE);
    });
  });
});
