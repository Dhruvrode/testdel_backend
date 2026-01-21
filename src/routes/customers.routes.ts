import { Router } from "express";
import { Order, ORDER_STATUS} from "../models/order.model";
 
const router = Router();

router.get("/", async (req, res) => {
  const {
    page = 1,
    pageSize = 10,
    search = "",
    sortKey = "spend",
    sortDir = "desc",
    region,
    month,
  } = req.query as any;

  const pipeline: any[] = [];

  /* ================= BASE FILTERS ================= */

  if (search) {
    pipeline.push({
      $match: {
        customer: { $regex: search, $options: "i" },
      },
    });
  }

  if (region) {
    pipeline.push({ $match: { region } });
  }

  if (month !== undefined && month !== "") {
    pipeline.push({
      $match: {
        $expr: {
          $eq: [{ $month: "$date" }, Number(month) + 1],
        },
      },
    });
  }

  /* ================= GROUP (ALL ORDERS) ================= */

  pipeline.push({
    $group: {
      _id: "$customer",
      name: { $first: "$customer" },

      // all orders
      orders: { $sum: 1 },
      spend: { $sum: "$amount" },

      // completed orders count (key part)
      completedOrders: {
        $sum: {
          $cond: [{ $eq: ["$status", ORDER_STATUS.COMPLETED] }, 1, 0],
        },
      },

      region: { $first: "$region" },
      joinedAt: { $min: "$date" },
    },
  });

  /* ================= CUSTOMER QUALIFICATION ================= */

  pipeline.push({
    $match: {
      completedOrders: { $gt: 0 },
    },
  });

  /* ================= SORT ================= */

  pipeline.push({
    $sort: {
      [sortKey]: sortDir === "asc" ? 1 : -1,
    },
  });

  /* ================= PAGINATION ================= */

  pipeline.push(
    { $skip: (Number(page) - 1) * Number(pageSize) },
    { $limit: Number(pageSize) }
  );

  /* ================= EXECUTE ================= */

  const data = await Order.aggregate(pipeline);

  const totalAgg = await Order.aggregate([
    ...pipeline.filter((s) => !("$skip" in s) && !("$limit" in s)),
    { $count: "total" },
  ]);

  res.json({
    data: data.map((c) => ({
      customerId: `CUST-${c._id.replace(/\s+/g, "").toUpperCase()}`,
      name: c.name,
      orders: c.orders,
      spend: c.spend,
      region: c.region,
      joinedAt: c.joinedAt,
    })),
    total: totalAgg[0]?.total || 0,
    page: Number(page),
    pageSize: Number(pageSize),
  });
});

export default router;
