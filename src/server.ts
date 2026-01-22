// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import routes from "./routes/index";
// import { connectMongo } from "./db/mongo";
// import { seedLabels } from "./seed/seedLabels";
// import { seedOrders } from "./seed/seedOrders";
 

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// app.use("/", routes);

// const PORT = process.env.PORT || 4000;

// async function start() {
//   await connectMongo();
//   await seedLabels();
//   await seedOrders();

//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// }

// start();
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index";
import { connectMongo } from "./db/mongo";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.use("/", routes);

// ✅ FIX: force PORT to number
const PORT = Number(process.env.PORT) || 4000;

async function start() {
  try {
    await connectMongo();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
}

start();
