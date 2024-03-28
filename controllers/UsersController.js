import bcrpt from "bcrypt";
import { ObjectId } from "mongodb";
import dbClient from "../utils/db";
import redisClient from "../utils/redis";
import userUtils from "../utils/user";

class UsersController {
  static async signUp(req, res) {
    const { email, password } = req.body;

    if (!email) return res.status(400).send({ error: "Missing email" });
    if (!password) return res.status(400).send({ error: "Missing password" });

    const userExists = await dbClient.users.findOne({ email });
    if (userExists)
      return res.status(400).send({ error: "User already exist" });

    // encrypt the password
    const hashedPassword = await bcrpt.hash(password, 10);

    // catch errors that can be thrown by insertOne
    try {
      const result = await dbClient.users.insertOne({
        email,
        password: hashedPassword,
      });
      return res.status(201).send({
        message: "User created successfully",
        id: result.insertedId,
        email,
      });
    } catch (error) {
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }

  static async logIn(req, res) {
    const { email, password } = req.body;

    if (!email) return res.status(400).send({ error: "Missing email" });
    if (!password) return res.status(400).send({ error: "Missing password" });

    const user = await dbClient.users.findOne({ email });
    if (!user) return res.status(400).send({ error: "Bad email or password" });

    const passwordMatch = await bcrpt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).send({ error: "Bad email or password" });
    }

    const token = userUtils.generateAuthToken(user);
    const key = `auth_${token}`;
    // use a try catch block to catch errors that can be thrown by set method
    try {
      await redisClient.set(key, user._id.toString(), 86400);
    } catch (error) {
      return res.status(500).send({ error: "Internal Server Error" });
    }

    return res.status(200).send({
      message: "Login successful",
      authToken: token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  }

  static async logOut(req, res) {
    const token = req.header("X-Token");
    if (!token) return res.status(401).send({ error: "Unauthorized" });

    const userId = await userUtils.getUserIdAndKey(token);
    if (!userId) return res.status(401).send({ error: "Unauthorized" });

    await redisClient.del(`auth_${token}`);
    return res.status(204).send({ message: "Logout successful" });
  }

  static async getUser(req, res) {
    const token = req.header("X-Token");
    if (!token) return res.status(401).send({ error: "Unauthorized" });

    const userId = await userUtils.getUserIdAndKey(token);
    if (!userId) return res.status(401).send({ error: "Unauthorized" });

    const user = await dbClient.users.findOne({ _id: new ObjectId(userId) });
    if (!user) return res.status(401).send({ error: "Unauthorized" });

    return res.status(200).send({
      message: "User found",
      user: {
        ...user,
        id: user._id,
      },
    });
  }
}

export default UsersController;
