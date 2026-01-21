import mongoose, { Schema, Document } from "mongoose";

/**
 * Order status codes
 * 0 = Pending
 * 1 = Completed
 * 2 = Cancelled
 */
export const ORDER_STATUS = {
  PENDING: 0,
  COMPLETED: 1,
  CANCELLED: 2,
} as const;

export type OrderStatus =
  (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export interface OrderDocument extends Document {
  orderId: string;
  customer: string;
  date: Date;
  amount: number;
  status: OrderStatus;
    region: string; 
}

const OrderSchema = new Schema<OrderDocument>(
  {
    orderId: { type: String, required: true },
    customer: { type: String, required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    status: {
      type: Number,
      enum: Object.values(ORDER_STATUS),
      required: true,
    },
     region: {
    type: String,
    required: true,
  enum: ["North America", "Europe", "Asia", "Middle East"],
  },
  },
  { timestamps: true },
);

export const Order =
  mongoose.models.Order || mongoose.model<OrderDocument>("Order", OrderSchema);
