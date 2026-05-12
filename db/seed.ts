import { db } from "./index";
import { users, inventory, tables, customers } from "./schema";
import bcryptjs from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function seed() {
  console.log("Seeding database...");

  try {
    // 1. Seed Users (Employees)
    const adminPassword = await bcryptjs.hash("admin123", 10);
    const cashierPassword = await bcryptjs.hash("cashier123", 10);
    const chefPassword = await bcryptjs.hash("chef123", 10);

    await db.insert(users).values([
      { name: "Super Admin", email: "admin@smart5d.com", passwordHash: adminPassword, role: "admin", phone: "1234567890", salary: 100000 },
      { name: "John Manager", email: "john@smart5d.com", passwordHash: cashierPassword, role: "manager", phone: "0987654321", salary: 80000 },
      { name: "Alice Cashier", email: "alice@smart5d.com", passwordHash: cashierPassword, role: "cashier", phone: "1122334455", salary: 40000 },
      { name: "Gordon Chef", email: "gordon@smart5d.com", passwordHash: chefPassword, role: "chef", phone: "5544332211", salary: 90000 },
    ]).onConflictDoNothing();

    console.log("Users seeded.");

    // 2. Seed Tables
    const tablesData = [];
    for (let i = 1; i <= 20; i++) {
      tablesData.push({ tableNumber: i, capacity: i % 5 === 0 ? 6 : 4, status: "available" as const });
    }
    await db.insert(tables).values(tablesData).onConflictDoNothing();
    
    console.log("Tables seeded.");

    // 3. Seed Inventory
    await db.insert(inventory).values([
      { itemName: "Tomatoes", quantity: 50, unit: "kg", minStockAlert: 10, vendorName: "Fresh Farms" },
      { itemName: "Onions", quantity: 100, unit: "kg", minStockAlert: 20, vendorName: "Fresh Farms" },
      { itemName: "Chicken Breast", quantity: 30, unit: "kg", minStockAlert: 15, vendorName: "MeatCo" },
      { itemName: "Paneer", quantity: 15, unit: "kg", minStockAlert: 5, vendorName: "Dairy Plus" },
      { itemName: "Olive Oil", quantity: 20, unit: "liters", minStockAlert: 5, vendorName: "Global Imports" },
    ]).onConflictDoNothing();

    console.log("Inventory seeded.");

    // 4. Seed Customers
    await db.insert(customers).values([
      { name: "Rahul Sharma", phone: "9876543210", email: "rahul@example.com", loyaltyPoints: 150, totalOrders: 5, totalSpent: 4500 },
      { name: "Priya Patel", phone: "8765432109", email: "priya@example.com", loyaltyPoints: 300, totalOrders: 12, totalSpent: 12000 },
      { name: "Amit Kumar", phone: "7654321098", email: "amit@example.com", loyaltyPoints: 50, totalOrders: 2, totalSpent: 1500 },
    ]).onConflictDoNothing();

    console.log("Customers seeded.");

    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
