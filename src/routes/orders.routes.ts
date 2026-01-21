import { Router } from "express";
import { Order } from "../models/order.model";

const router = Router();

router.get("/", async (req, res) => {
  const {
    page = 1,
    pageSize = 10,
    search = "",
    sortKey = "amount",
    sortDir = "desc",
    status,
    region,
    month
  } = req.query as any;

  const searchStr = String(search).trim();

  const orConditions: any[] = [
    { orderId: { $regex: searchStr, $options: "i" } },
    { customer: { $regex: searchStr, $options: "i" } },
    { region: { $regex: searchStr, $options: "i" } },
  ];

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

  
  const query: any = {
    $or: orConditions,
  };

  if (status !== undefined && status !== "") {
    query.status = Number(status);
  }

 if (month !== undefined && month !== "" && !isNaN(Number(month))) {
  const m = Number(month);

  query.$expr = {
    $eq: [{ $month: "$date" }, m + 1], // Mongo months are 1-based
  };
}
 

  if (region) {
    query.region = region;
  }

  const total = await Order.countDocuments(query);

  const data = await Order.find(query)
    .sort({ [sortKey]: sortDir === "asc" ? 1 : -1 })
    .skip((Number(page) - 1) * Number(pageSize))
    .limit(Number(pageSize))
    .lean();

  res.json({
    data,
    total,
    page: Number(page),
    pageSize: Number(pageSize),
  });
});

export default router;
