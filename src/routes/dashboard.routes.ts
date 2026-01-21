import { Router } from "express";
import { Order, ORDER_STATUS } from "../models/order.model";

const router = Router();

/**
 * GET /dashboard/revenue
 * Returns revenue grouped by month (COMPLETED orders only)
 */
router.get("/revenue", async (_req, res) => {
  const data = await Order.aggregate([
    {
      $match: {
        status: ORDER_STATUS.COMPLETED, 
      },
    },
    {
      $group: {
        _id: { $month: "$date" },
        total: { $sum: "$amount" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const formatted = data.map((d) => ({
    label: MONTHS[d._id - 1],
    value: d.total,
  }));

  res.json(formatted);
});

/**
 * GET /dashboard/revenue-by-region
 * Returns revenue grouped by region (COMPLETED orders only)
 */
router.get("/revenue-by-region", async (_req, res) => {
  const data = await Order.aggregate([
    {
      $match: {
        status: ORDER_STATUS.COMPLETED, // ✅ important
      },
    },
    {
      $group: {
        _id: "$region",
        revenue: { $sum: "$amount" },
      },
    },
    {
      $sort: { revenue: -1 },
    },
  ]);

  const formatted = data.map((d) => ({
    region: d._id,
    revenue: d.revenue,
  }));

  res.json(formatted);
});



router.get("/summary", async (_req, res) => {
  const completedOrders = await Order.find({
    status: ORDER_STATUS.COMPLETED,
  });

  const totalRevenue = completedOrders.reduce(
    (sum, o) => sum + o.amount,
    0
  );

  const totalOrders = await Order.countDocuments();

  const avgOrderValue =
    completedOrders.length > 0
      ? totalRevenue / completedOrders.length
      : 0;

  // ---- Month-over-month growth ----
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1
  );

  const thisMonthRevenue = await Order.aggregate([
    {
      $match: {
        status: ORDER_STATUS.COMPLETED,
        date: { $gte: startOfThisMonth },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const lastMonthRevenue = await Order.aggregate([
    {
      $match: {
        status: ORDER_STATUS.COMPLETED,
        date: {
          $gte: startOfLastMonth,
          $lt: startOfThisMonth,
        },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const current = thisMonthRevenue[0]?.total || 0;
  const previous = lastMonthRevenue[0]?.total || 0;

  const growth =
    previous > 0 ? ((current - previous) / previous) * 100 : 0;

  res.json({
    revenue: totalRevenue,
    orders: totalOrders,
    avgOrder: avgOrderValue,
    growth,
  });
});

export default router;
