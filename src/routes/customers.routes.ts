import { Router } from "express";
import { Order, ORDER_STATUS } from "../models/order.model";

const router = Router();

/**
 * GET /customers
 * Customers aggregated from orders
 */
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      search = "",
      sortKey = "spend",
      sortDir = "desc",
      region = "",
      month = "",
    } = req.query as any;

    const pageNum = Number(page);
    const limitNum = Number(pageSize);

    /* ================= BASE MATCH ================= */
    const searchStr = String(search).trim();

    const baseMatch: any = {};

    if (searchStr) {
      const orConditions: any[] = [
        { customer: { $regex: searchStr, $options: "i" } },
        { region: { $regex: searchStr, $options: "i" } },
      ];

      // allow numeric search (amount)
      if (!isNaN(Number(searchStr))) {
        orConditions.push({
          $expr: {
            $regexMatch: {
              input: { $toString: "$amount" },
              regex: searchStr,
            },
          },
        });
      }

      baseMatch.$or = orConditions;
    }

    if (region) {
      baseMatch.region = region;
    }

    if (month !== "") {
      baseMatch.$expr = {
        $eq: [{ $month: "$date" }, Number(month) + 1],
      };
    }

    /* ================= AGG PIPELINE ================= */

    const basePipeline: any[] = [
      { $match: baseMatch },

      /* GROUP BY CUSTOMER */
      {
        $group: {
          _id: "$customer",
          name: { $first: "$customer" },
          region: { $first: "$region" },

          orders: { $sum: 1 },
          spend: { $sum: "$amount" },

          completedOrders: {
            $sum: {
              $cond: [{ $eq: ["$status", ORDER_STATUS.COMPLETED] }, 1, 0],
            },
          },

          joinedAt: { $min: "$date" },
        },
      },

      /* QUALIFY: must have at least 1 completed order */
      {
        $match: {
          completedOrders: { $gt: 0 },
        },
      },
    ];

    /* ================= TOTAL COUNT ================= */
    const totalAgg = await Order.aggregate([
      ...basePipeline,
      { $count: "total" },
    ]);

    const total = totalAgg[0]?.total || 0;

    /* ================= SORT ================= */
    basePipeline.push({
      $sort: {
        [sortKey]: sortDir === "asc" ? 1 : -1,
      },
    });

    /* ================= PAGINATION ================= */
    basePipeline.push(
      { $skip: (pageNum - 1) * limitNum },
      { $limit: limitNum },
    );

    /* ================= EXECUTE ================= */
    const data = await Order.aggregate(basePipeline);

    /* ================= RESPONSE ================= */
    res.json({
      data: data.map((c) => ({
        customerId: `CUST-${c._id.replace(/\s+/g, "").toUpperCase()}`,
        name: c.name,
        orders: c.orders,
        spend: c.spend,
        region: c.region,
        joinedAt: c.joinedAt,
      })),
      total,
      page: pageNum,
      pageSize: limitNum,
    });
  } catch (err) {
    console.error("Customers API error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /customers/acquisition
 * Customer acquisition by month (first order date)
 */
router.get("/acquisition", async (_req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $group: {
          _id: "$customer",
          firstOrder: { $min: "$date" },
        },
      },
      {
        $group: {
          _id: { $month: "$firstOrder" },
          count: { $sum: 1 },
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
      month: MONTHS[d._id - 1],
      customers: d.count,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Customer acquisition error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// backend/src/routes/customers.routes.ts -  T

/**
 * GET /customers/ltv-distribution
 * Groups customers into spending tiers
 */
router.get("/ltv-distribution", async (_req, res) => {
  try {
    const customers = await Order.aggregate([
      {
        $group: {
          _id: "$customer",
          totalSpend: { $sum: "$amount" },
        },
      },
    ]);

    // Define tiers
    const tiers = {
      "< $10k": 0,
      "$10k-$25k": 0,
      "$25k-$50k": 0,
      "$50k+": 0,
    };

    customers.forEach((c) => {
      const spend = c.totalSpend;
      if (spend < 10000) tiers["< $10k"]++;
      else if (spend < 25000) tiers["$10k-$25k"]++;
      else if (spend < 50000) tiers["$25k-$50k"]++;
      else tiers["$50k+"]++;
    });

    const formatted = Object.entries(tiers).map(([tier, count]) => ({
      tier,
      count,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("LTV distribution error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// backend/src/routes/customers.routes.ts (ADD THIS ENDPOINT)

/**
 * GET /customers/summary
 * Summary stats for customers page
 */
// backend/src/routes/customers.routes.ts
// REPLACE the /summary endpoint with this:

/**
 * GET /customers/summary
 * Summary stats for customers page
 * Active customers = those with at least 1 COMPLETED order
 */
router.get("/summary", async (_req, res) => {
  try {
    // Get all customers with their order details
    const customers = await Order.aggregate([
      {
        $group: {
          _id: "$customer",
          totalSpend: { $sum: "$amount" },
          orders: { $sum: 1 },
          completedOrders: {
            $sum: {
              $cond: [{ $eq: ["$status", ORDER_STATUS.COMPLETED] }, 1, 0],
            },
          },
          completedSpend: {
            $sum: {
              $cond: [
                { $eq: ["$status", ORDER_STATUS.COMPLETED] },
                "$amount",
                0,
              ],
            },
          },
          firstOrder: { $min: "$date" },
          firstCompletedOrder: {
            $min: {
              $cond: [
                { $eq: ["$status", ORDER_STATUS.COMPLETED] },
                "$date",
                null,
              ],
            },
          },
        },
      },
      {
        // ✅ FILTER: Only customers with at least 1 completed order
        $match: {
          completedOrders: { $gt: 0 },
        },
      },
    ]);

    // Total active customers (with completed orders)
    const totalCustomers = customers.length;

    // Total spend from COMPLETED orders only
    const totalSpend = customers.reduce((sum, c) => sum + c.completedSpend, 0);

    // Average spend per active customer
    const avgSpendPerCustomer =
      totalCustomers > 0 ? totalSpend / totalCustomers : 0;

    // Calculate growth (NEW active customers this month vs last month)
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    // New customers = first COMPLETED order was in that month
    const newCustomersThisMonth = customers.filter(
      (c) =>
        c.firstCompletedOrder &&
        c.firstCompletedOrder >= startOfThisMonth
    ).length;

    const newCustomersLastMonth = customers.filter(
      (c) =>
        c.firstCompletedOrder &&
        c.firstCompletedOrder >= startOfLastMonth &&
        c.firstCompletedOrder < startOfThisMonth
    ).length;

    const growth =
      newCustomersLastMonth > 0
        ? ((newCustomersThisMonth - newCustomersLastMonth) /
            newCustomersLastMonth) *
          100
        : 0;

    res.json({
      totalCustomers, // ✅ Only customers with completed orders
      avgSpendPerCustomer, // ✅ Based on completed orders only
      newCustomersThisMonth, // ✅ New ACTIVE customers (with completed orders)
      growth, // ✅ Growth in active customers
    });
  } catch (err) {
    console.error("Customers summary error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
export default router;
