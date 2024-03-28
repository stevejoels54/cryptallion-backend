import { ObjectId } from "mongodb";
import dbClient from "../utils/db";
import userUtils from "../utils/user";
import isValidObjectId from "../helpers/validateId";

// Include fields for specifying the type of transaction (buy, sell, transfer), the cryptocurrency symbol or name, the amount bought/sold/transferred, the transaction date/time, and the price at which the transaction occurred.
// Provide options for users to add additional details such as transaction fees, notes, and tags for categorization.

// transaction types: buy, sell, transfer
// cryptocurrency symbol or name
// amount bought/sold/transferred
// transaction date/time
// price at which the transaction occurred
// transaction fees
// notes
// tags for categorization
// transaction status: pending, completed, failed
// transaction ID
// user ID

class TransactionsController {
  static async createTransaction(req, res) {
    const token = req.header("X-Token");
    const userId = await userUtils.getUserIdAndKey(token);

    if (!isValidObjectId(userId)) {
      return res.status(400).send({ error: "Invalid user ID" });
    }

    const { type, symbol, amount, price, fee, notes, tags } = req.body;

    if (!type || !symbol || !amount || !price) {
      return res.status(400).send({ error: "Missing fields" });
    }

    const transaction = {
      type,
      symbol,
      amount,
      price,
      fee,
      notes,
      tags,
      status: "pending",
      userId: new ObjectId(userId),
      createdAt: new Date(),
    };

    try {
      const result = await dbClient.transactions.insertOne(transaction);
      transaction._id = result.insertedId;
    } catch (error) {
      return res.status(500).send({ error: "Internal Server Error" });
    }

    return res.status(201).send({
      message: "Transaction created successfully",
      transaction: transaction,
    });
  }

  static async getTransactions(req, res) {
    // const userId = req.userId;
    const token = req.header("X-Token");
    const userId = await userUtils.getUserIdAndKey(token);

    if (!userId) {
      return res.status(400).send({ error: "Missing user ID" });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).send({ error: "Invalid user ID" });
    }

    try {
      const transactions = await dbClient.transactions
        .find({
          userId: new ObjectId(userId),
        })
        .toArray();

      return res.status(200).send({
        message: "Transactions found",
        transactions: transactions,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }

  static async getTransaction(req, res) {
    // const userId = req.userId;
    const token = req.header("X-Token");
    const userId = await userUtils.getUserIdAndKey(token);

    const { id } = req.params;

    if (!userId) {
      return res.status(400).send({ error: "Missing user ID" });
    }

    if (!id) {
      return res.status(400).send({ error: "Missing transaction ID" });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).send({ error: "Invalid transaction ID" });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).send({ error: "Invalid user ID" });
    }

    try {
      const transaction = await dbClient.transactions.findOne({
        _id: new ObjectId(id),
        userId: new ObjectId(userId),
      });
      if (!transaction) {
        return res.status(404).send({ error: "Transaction not found" });
      }

      return res.status(200).send({
        message: "Transaction found",
        transaction: transaction,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }

  static async updateTransaction(req, res) {
    const token = req.header("X-Token");
    const userId = await userUtils.getUserIdAndKey(token);

    const { id } = req.params;
    const { type, symbol, amount, price, fee, notes, tags, status } = req.body;

    if (!userId) {
      return res.status(400).send({ error: "Missing user ID" });
    }

    if (!id) {
      return res.status(400).send({ error: "Missing transaction ID" });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).send({ error: "Invalid transaction ID" });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).send({ error: "Invalid user ID" });
    }

    try {
      const transaction = await dbClient.transactions.findOne({
        _id: new ObjectId(id),
        userId: new ObjectId(userId),
      });
      if (!transaction) {
        return res.status(404).send({ error: "Transaction not found" });
      }

      const updatedTransaction = {
        type: type || transaction.type,
        symbol: symbol || transaction.symbol,
        amount: amount || transaction.amount,
        price: price || transaction.price,
        fee: fee || transaction.fee,
        notes: notes || transaction.notes,
        tags: tags || transaction.tags,
        status: status || transaction.status,
      };

      await dbClient.transactions.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedTransaction }
      );

      return res.status(200).send({
        message: "Transaction updated successfully",
        transaction: updatedTransaction,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }

  static async deleteTransaction(req, res) {
    const token = req.header("X-Token");
    const userId = await userUtils.getUserIdAndKey(token);

    const { id } = req.params;

    if (!userId) {
      return res.status(400).send({ error: "Missing user ID" });
    }

    if (!id) {
      return res.status(400).send({ error: "Missing transaction ID" });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).send({ error: "Invalid transaction ID" });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).send({ error: "Invalid user ID" });
    }

    try {
      const transaction = await dbClient.transactions.findOne({
        _id: new ObjectId(id),
        userId: new ObjectId(userId),
      });
      if (!transaction) {
        return res.status(404).send({ error: "Transaction not found" });
      }

      await dbClient.transactions.deleteOne({ _id: new ObjectId(id) });

      return res
        .status(204)
        .send({ message: "Transaction deleted successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }
}

export default TransactionsController;
