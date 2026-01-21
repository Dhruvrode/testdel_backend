import { Router } from "express";
import { Label } from "../models/label.model";
 
const router = Router();

// GET all labels
router.get("/", async (_req, res) => {
  const labels = await Label.find().lean();
  res.json(labels);
});

// GET label by key
router.get("/:key", async (req, res) => {
  const label = await Label.findOne({ key: req.params.key }).lean();
  if (!label) {
    return res.status(404).json({ message: "Label not found" });
  }
  res.json(label);
});

// UPDATE label value
router.put("/:key", async (req, res) => {
  const { value } = req.body;

  const updated = await Label.findOneAndUpdate(
    { key: req.params.key },
    { value },
    { new: true }
  ).lean();

  if (!updated) {
    return res.status(404).json({ message: "Label not found" });
  }

  res.json(updated);
});

export default router;
