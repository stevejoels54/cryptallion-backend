import { createClient } from "redis";

require("dotenv").config();

const serverMode = process.env.NODE_ENV;
const redisPort = process.env.REDIS_PORT;
const redisPassword = process.env.REDIS_PASSWORD;
const redisUrl = process.env.REDIS_URL;

class RedisClient {
  constructor() {
    // check if the server is in production mode or not and set the client accordingly
    if (serverMode === "development") {
      this.client = createClient({}); // default configuration
    } else {
      this.client = createClient({
        password: redisPassword,
        socket: {
          host: redisUrl,
          port: redisPort,
        },
      });
    }

    this.client.connect(); // Connect to the Redis server

    this.client.on("error", (err) => {
      console.log(`Redis client not connected to the server: ${err}`);
    });
  }

  async isAlive() {
    try {
      return this.client.status === "ready";
    } catch (error) {
      console.error("Error connecting to Redis:", error);
      return false;
    }
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      return value;
    } catch (error) {
      console.error("Error getting value from Redis:", error);
      throw error; // Re-throw for handling in the main application
    }
  }

  async set(key, value, duration) {
    try {
      await this.client.set(key, value, "EX", duration); // Set expiration
    } catch (error) {
      console.error("Error setting value in Redis:", error);
      throw error; // Re-throw for handling in the main application
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error("Error deleting key from Redis:", error);
      throw error; // Re-throw for handling in the main application
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;
