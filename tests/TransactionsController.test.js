import { ObjectId } from "mongodb";
import { expect } from "chai";
import sinon from "sinon";
import dbClient from "../utils/db";
import userUtils from "../utils/user";
import TransactionsController from "../controllers/TransactionsController";

describe("TransactionsController", () => {
  describe("createTransaction", () => {
    it("should return 400 if required fields are missing", async () => {
      const req = { body: {} };
      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      };

      await TransactionsController.createTransaction(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.send.calledWith({ error: "Missing fields" })).to.be.true;
    });

    it("should return 400 if user ID is invalid", async () => {
      const req = { body: { type: "buy", symbol: "BTC", amount: 1, price: 5000 } };
      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      };

      sinon.stub(userUtils, "getUserIdAndKey").returns("invalidUserId");

      await TransactionsController.createTransaction(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.send.calledWith({ error: "Invalid user ID" })).to.be.true;

      userUtils.getUserIdAndKey.restore();
    });

    it("should return 500 if there is an internal server error", async () => {
      const req = { body: { type: "buy", symbol: "BTC", amount: 1, price: 5000 } };
      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      };

      sinon.stub(userUtils, "getUserIdAndKey").throws();

      await TransactionsController.createTransaction(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.send.calledWith({ error: "Internal Server Error" })).to.be.true;

      userUtils.getUserIdAndKey.restore();
    });

    // more test cases for different scenarios
  });

  describe("getTransactions", () => {
    it("should return 400 if user ID is missing", async () => {
      const req = { header: sinon.stub().returns(null) };
      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      };

      await TransactionsController.getTransactions(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.send.calledWith({ error: "Missing user ID" })).to.be.true;
    });

    it("should return 400 if user ID is invalid", async () => {
      const req = { header: sinon.stub().returns("invalidToken") };
      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      };

      sinon.stub(userUtils, "getUserIdAndKey").returns("invalidUserId");

      await TransactionsController.getTransactions(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.send.calledWith({ error: "Invalid user ID" })).to.be.true;

      userUtils.getUserIdAndKey.restore();
    });

    it("should return 500 if there is an internal server error", async () => {
      const req = { header: sinon.stub().returns("validToken") };
      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      };

      sinon.stub(userUtils, "getUserIdAndKey").throws();

      await TransactionsController.getTransactions(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.send.calledWith({ error: "Internal Server Error" })).to.be.true;

      userUtils.getUserIdAndKey.restore();
    });

    // more test cases for different scenarios
  });

  describe("getTransaction", () => {
    // tests for getTransaction method
  });

  describe("updateTransaction", () => {
    // tests for updateTransaction method
  });

  describe("deleteTransaction", () => {
    // tests for deleteTransaction method
  });
});
