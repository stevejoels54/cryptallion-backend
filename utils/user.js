// a class with user methods that are used in the controllers and routes
import jwt from "jsonwebtoken";
import redisClient from "./redis";
import dbClient from "./db";

class userUtils {
  static async getUserIdAndKey(token) {
    const userId = await redisClient.get(`auth_${token}`);
    return userId;
  }

  static async getUser(query) {
    const user = await dbClient.users.findOne(query);
    return user;
  }

  static generateAuthToken(user) {
    const token = jwt.sign({ user }, process.env.JWT_SECRET);
    return token;
  }
}

export default userUtils;
