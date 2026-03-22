import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Categories table
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// Products table
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: int("stock").default(0).notNull(),
  weight: decimal("weight", { precision: 8, scale: 3 }).default("0"),
  image: text("image"),
  videoUrl: text("videoUrl"),
  gallery: json("gallery").$type<string[]>(),
  categoryId: int("categoryId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Orders table
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }).notNull(),
  customerAddress: text("customerAddress"),
  items: json("items").$type<Array<{ id: number; name: string; price: string; quantity: number }>>().notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  shippingCost: decimal("shippingCost", { precision: 10, scale: 2 }).default("0").notNull(),
  paymentFee: decimal("paymentFee", { precision: 10, scale: 2 }).default("0").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  termsAccepted: boolean("termsAccepted").default(false).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// Shipping configuration table
export const shippingConfig = mysqlTable("shippingConfig", {
  id: int("id").autoincrement().primaryKey(),
  baseCost: decimal("baseCost", { precision: 10, scale: 2 }).notNull(),
  costPerKg: decimal("costPerKg", { precision: 10, scale: 2 }).notNull(),
  freeShippingThreshold: decimal("freeShippingThreshold", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ShippingConfig = typeof shippingConfig.$inferSelect;
export type InsertShippingConfig = typeof shippingConfig.$inferInsert;

// Payment fee configuration table
export const paymentFeeConfig = mysqlTable("paymentFeeConfig", {
  id: int("id").autoincrement().primaryKey(),
  cardType: varchar("cardType", { length: 50 }).notNull().default("credit"),
  label: varchar("label", { length: 100 }).notNull().default("Cartão de Crédito"),
  feePercentage: decimal("feePercentage", { precision: 5, scale: 2 }).notNull(),
  minFee: decimal("minFee", { precision: 10, scale: 2 }).notNull(),
  maxFee: decimal("maxFee", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaymentFeeConfig = typeof paymentFeeConfig.$inferSelect;
export type InsertPaymentFeeConfig = typeof paymentFeeConfig.$inferInsert;

// Reviews table
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  rating: int("rating").notNull(),
  comment: text("comment"),
  status: mysqlEnum("status", ["pending", "approved", "hidden"]).default("pending").notNull(),
  adminResponse: text("adminResponse"),
  adminResponseAt: timestamp("adminResponseAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// Questions table
export const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  question: text("question").notNull(),
  status: mysqlEnum("status", ["pending", "answered"]).default("pending").notNull(),
  adminResponse: text("adminResponse"),
  adminResponseAt: timestamp("adminResponseAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

// Featured Carousel table
export const featuredCarousel = mysqlTable("featuredCarousel", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  carouselTitle: varchar("carouselTitle", { length: 255 }).default("Destaques").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FeaturedCarousel = typeof featuredCarousel.$inferSelect;
export type InsertFeaturedCarousel = typeof featuredCarousel.$inferInsert;

// Admin users table (independent login)
export const adminUsers = mysqlTable("admin_users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;
