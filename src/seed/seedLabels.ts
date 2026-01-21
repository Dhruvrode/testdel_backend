import { Label } from "../models/label.model";

 
export async function seedLabels() {
  const exists = await Label.countDocuments();
  if (exists > 0) return;

  await Label.insertMany([
    // ===== GLOBAL METRICS (shared across Dashboard + Customers) =====
    {
      key: "metric_revenue",
      value: "Revenue Overview",
      usages: [{ page: "Dashboard", component: "Revenue Line Chart" }],
    },

    {
      key: "revenue_card",
      value: "Total Orders",
      usages: [
        { page: "Dashboard", component: "Orders KPI Card" },
        { page: "Customers", component: "Customers KPI Card" },
      ],
    },
    {
      key: "orders_card",
      value: "Total Orders",
      usages: [
        { page: "Dashboard", component: "Orders KPI Card" },
        { page: "Customers", component: "Orders Table Header" },
      ],
    },

    {
      key: "avg_order_card",
      value: "Avg Order Value",
      usages: [
        { page: "Dashboard", component: "AOV KPI Card" },
        { page: "Customers", component: "Customer AOV Column" },
      ],
    },
    {
      key: "growth_card",
      value: "Monthly Growth",
      usages: [
        { page: "Dashboard", component: "Monthly growth card" },
        { page: "Customers", component: "Customer growth card" },
        { page: "Test", component: "Test" },
        { page: "Test", component: "Test" },
        { page: "Test", component: "Test" },
        { page: "Test", component: "Test" },
        { page: "Test", component: "Test" },
        { page: "Test", component: "Test" },
        { page: "Test", component: "Test" },
        { page: "Test", component: "Test" },
        { page: "Test", component: "Test" },
        { page: "Test", component: "Test" },
        { page: "Test", component: "Test" },
        { page: "Test", component: "Test" },
        { page: "Test", component: "Test" },
        { page: "Test", component: "Test" },
        { page: "Test", component: "Test" },
        { page: "Test", component: "Test" },
        { page: "Test", component: "Test" },
      ],
    },
    {
      key: "total_customers_card",
      value: "Total Customers",
      usages: [{ page: "Customers", component: "Total Customers Card" }],
    },
    {
      key: "avg_customer_value_card",
      value: "Avg Customer Value",
      usages: [{ page: "Customers", component: "Customer Value Card" }],
    },
    {
      key: "new_customers_card",
      value: "New Customers",
      usages: [{ page: "Customers", component: "New Customers Card" }],
    },

    // ===== PAGE TITLES =====
    {
      key: "page_dashboard_title",
      value: "Dashboard",
      usages: [{ page: "Dashboard", component: "Page Header" }],
    },

    {
      key: "page_customers_title",
      value: "Customers",
      usages: [{ page: "Customers", component: "Page Header" }],
    },

    // ===== CHART TITLES (shared) =====
    {
      key: "revenue_region",
      value: "Revenue by Region",
      usages: [{ page: "Dashboard", component: "Region Pie Chart Title" }],
    },

    {
      key: "customer_acquisition",
      value: "Customer Acquisition",
      usages: [{ page: "Customers", component: "Acquisition Chart" }],
    },
    {
      key: "customer_ltv",
      value: "Customer Value Distribution",
      usages: [{ page: "Customers", component: "LTV Chart" }],
    },

    // ===== TABLE LABELS (shared) =====
    {
      key: "table",
      value: "Transactions",
      usages: [
        { page: "Dashboard", component: "Sales Table Header" },
        { page: "Customers", component: "Customers Table Header" },
      ],
    },
  ]);

  console.log("Default label configuration seeded");
}
