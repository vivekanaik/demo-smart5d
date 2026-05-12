import { pgTable, serial, varchar, timestamp, integer, text, jsonb, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const orders = pgTable("orders", {
    id: varchar("id", { length: 50 }).primaryKey(),
    guestName: varchar("guest_name", { length: 100 }).notNull(),
    tableNumber: varchar("table_number", { length: 10 }).notNull(),
    contactNumber: varchar("contact_number", { length: 20 }),
    generalNote: text("general_note"),
    total: integer("total").notNull(),
    status: varchar("status", { enum: ["active", "completed", "cancelled"] }).default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    closedAt: timestamp("closed_at"),
});

export const orderItems = pgTable("order_items", {
    id: serial("id").primaryKey(),
    orderId: varchar("order_id", { length: 50 }).references(() => orders.id).notNull(),
    menuItemId: integer("menu_item_id").notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    quantity: integer("quantity").notNull(),
    price: integer("price").notNull(),
    note: text("note"),
    status: varchar("status", { enum: ["pending", "served"] }).default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(), 
});

export const ordersRelations = relations(orders, ({ many }) => ({
    items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
      fields: [orderItems.orderId],
      references: [orders.id],
    }),
}));

export const menuItems = pgTable("menu_items", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description").notNull(),
    price: varchar("price", { length: 20 }).notNull(), // e.g., "₹480"
    category: varchar("category", { length: 50 }).notNull(),
    diet: varchar("diet", { enum: ["Veg", "Non-Veg"] }).notNull(),
    ingredients: jsonb("ingredients").notNull(), // Array of strings stored as JSON
    nutrition: jsonb("nutrition"), // Object stored as JSON { calories, protein, carbs, fat }
    modelUrl: text("model_url").notNull(), // 3D model link
    posterUrl: text("poster_url").default("/5d.png"),
    isAvailable: integer("is_available").default(1), // 1 = true, 0 = false
});
  
  // ✅ NEW: Settings Table (Single Row)
export const settings = pgTable("settings", {
    id: integer("id").primaryKey().default(1), // Always 1
    gstRate: integer("gst_rate").default(5).notNull(), // 0, 5, or 18
    adminPassword: varchar("admin_password", { length: 255 }).default("admin123").notNull(), 
    upiId: varchar("upi_id", { length: 100 }),
    qrCodeUrl: text("qr_code_url"), // Store base64 string
});

export const serviceRequests = pgTable('service_requests', {
    id: serial('id').primaryKey(),
    tableNumber: integer('table_number').notNull(),
    status: varchar('status', { length: 20 }).default('pending').notNull(), // 'pending' or 'resolved'
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Phase 2 Additions

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    passwordHash: text("password_hash").notNull(),
    role: varchar("role", { enum: ["admin", "manager", "cashier", "chef"] }).default("cashier").notNull(),
    phone: varchar("phone", { length: 20 }),
    salary: integer("salary"),
    status: varchar("status", { enum: ["active", "inactive", "on_leave"] }).default("active").notNull(),
    salaryPaidAt: timestamp("salary_paid_at"), // last time salary was marked as paid
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inventory = pgTable("inventory", {
    id: serial("id").primaryKey(),
    itemName: varchar("item_name", { length: 100 }).notNull(),
    quantity: integer("quantity").notNull().default(0),
    unit: varchar("unit", { length: 20 }).notNull(), // kg, liters, units, etc.
    minStockAlert: integer("min_stock_alert").default(10).notNull(),
    vendorName: varchar("vendor_name", { length: 100 }),
    status: varchar("status", { enum: ["active", "discontinued", "on_order"] }).default("active").notNull(),
    lastRestocked: timestamp("last_restocked"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tables = pgTable("tables", {
    id: serial("id").primaryKey(),
    tableNumber: integer("table_number").unique().notNull(),
    capacity: integer("capacity").notNull().default(4),
    status: varchar("status", { enum: ["available", "occupied", "reserved", "maintenance"] }).default("available").notNull(),
});

export const reservations = pgTable("reservations", {
    id: serial("id").primaryKey(),
    customerName: varchar("customer_name", { length: 100 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
    tableId: integer("table_id").references(() => tables.id),
    reservationTime: timestamp("reservation_time").notNull(),
    guestsCount: integer("guests_count").notNull(),
    status: varchar("status", { enum: ["pending", "confirmed", "cancelled", "completed"] }).default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customers = pgTable("customers", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 20 }).unique().notNull(),
    email: varchar("email", { length: 255 }),
    loyaltyPoints: integer("loyalty_points").default(0).notNull(),
    totalOrders: integer("total_orders").default(0).notNull(),
    totalSpent: integer("total_spent").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leaveRequests = pgTable("leave_requests", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    leaveType: varchar("leave_type", { enum: ["sick", "casual", "earned", "unpaid"] }).default("casual").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    reason: text("reason"),
    status: varchar("status", { enum: ["pending", "approved", "rejected"] }).default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const holidays = pgTable("holidays", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    date: date("date").notNull(),
    type: varchar("type", { enum: ["national", "festival", "optional"] }).default("national").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leaveRequestsRelations = relations(leaveRequests, ({ one }) => ({
    user: one(users, {
        fields: [leaveRequests.userId],
        references: [users.id],
    }),
}));

export const usersRelations = relations(users, ({ many }) => ({
    leaveRequests: many(leaveRequests),
}));