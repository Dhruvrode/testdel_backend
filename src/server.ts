import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index";
import { seedLabels } from "./seed/seedLabels";
import { connectMongo } from "./db/mongo";
import { seedOrders } from "./seed/seedOrders";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

 app.use("/", routes);



const PORT = 4000;

async function start() {
  await connectMongo();
  await seedLabels();
  await seedOrders()

  app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
  });
}

start();
