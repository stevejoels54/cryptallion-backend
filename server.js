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
  const dbStatus = await dbClient.isAlive();
  const redisStatus = await redisClient.isAlive();
  if (dbStatus) console.log("DB connection established");
  if (redisStatus) console.log("Redis connection established");
})();

export default app;
