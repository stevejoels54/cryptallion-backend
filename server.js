import express from "express";
import cors from "cors";
import router from "./routes";
import dbClient from "./utils/db";
import redisClient from "./utils/redis";

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use("/", router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

(async () => {
  try {
    await dbClient.isAlive();
    console.log("MongoDB is connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }

  try {
    await redisClient.isAlive();
    console.log("Redis is connected");
  } catch (error) {
    console.error("Error connecting to Redis:", error);
  }
})();

export default app;
