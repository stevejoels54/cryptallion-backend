import jwt from "jsonwebtoken";
import redisClient from "../utils/redis";

class AuthMiddleware {
  static async authenticate(req, res, next) {
    // Extract the JWT token from the request headers
    const token = req.header("X-Token");

    // If token is missing, return 401 Unauthorized
    if (!token) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    try {
      // Verify the authenticity of the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if the token exists in Redis (optional)
      const key = `auth_${token}`;
      const userId = await redisClient.get(key);
      if (!userId || userId !== decoded.user._id.toString()) {
        return res.status(401).send({ error: "Unauthorized" });
      }

      // Attach the user ID to the request object for further processing
      req.userId = decoded.userId;
      return next();
    } catch (error) {
      // If token verification fails, return 401 Unauthorized
      return res.status(401).send({ error: "Unauthorized" });
    }
  }
}

export default AuthMiddleware;
