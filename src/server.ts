import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import { connectMongo } from "./db/mongo.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.use("/", routes);

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectMongo();

     if (process.env.NODE_ENV !== "production") {
      const { seedLabels } = await import("./seed/seedLabels.js");
      const { seedOrders } = await import("./seed/seedOrders.js");
      await seedLabels();
      await seedOrders();
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
}

start();
