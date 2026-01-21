import { Router } from "express";
import labelsRoutes from "./labels.routes";
import ordersRoutes from "./orders.routes";
import dashboardRoutes from "./dashboard.routes";
import customersRoutes from "./customers.routes";

const router = Router();

router.use("/labels", labelsRoutes);
router.use("/orders", ordersRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/customers", customersRoutes);

export default router;
