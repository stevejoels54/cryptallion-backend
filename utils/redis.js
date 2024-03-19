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

    this.client.on("error", (err) => {
      console.log(`Redis client not connected to the server: ${err}`);
    });
  }

  async isAlive() {
    try {
      await this.client.connect();
      return true;
    } catch (error) {
      console.error("Error connecting to Redis:", error);
      return false;
    } finally {
      await this.client.quit();
    }
  }

  async get(key) {
    try {
      await this.client.connect();
      const value = await this.client.get(key);
      return value;
    } catch (error) {
      console.error("Error getting value from Redis:", error);
      throw error; // Re-throw for handling in the main application
    } finally {
      await this.client.quit();
    }
  }

  async set(key, value, duration) {
    try {
      await this.client.connect();
      await this.client.set(key, value, "EX", duration); // Set expiration
    } catch (error) {
      console.error("Error setting value in Redis:", error);
      throw error; // Re-throw for handling in the main application
    } finally {
      await this.client.quit();
    }
  }

  async del(key) {
    try {
      await this.client.connect();
      await this.client.del(key);
    } catch (error) {
      console.error("Error deleting key from Redis:", error);
      throw error; // Re-throw for handling in the main application
    } finally {
      await this.client.quit();
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;
