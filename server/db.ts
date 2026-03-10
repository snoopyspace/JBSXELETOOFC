import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  categories, InsertCategory, Category,
  products, InsertProduct, Product,
  orders, InsertOrder, Order,
  shippingConfig, InsertShippingConfig, ShippingConfig,
  paymentFeeConfig, InsertPaymentFeeConfig, PaymentFeeConfig,
  reviews, InsertReview, Review,
  questions, InsertQuestion, Question,
  adminUsers,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===================== Category queries =====================

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(desc(categories.createdAt));
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCategory(category: { name: string; description: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(categories).values(category);
}

export async function updateCategory(id: number, data: { name?: string; description?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(categories).where(eq(categories.id, id));
}

// ===================== Product queries =====================

export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(desc(products.createdAt));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.categoryId, categoryId)).orderBy(desc(products.createdAt));
}

export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(products).values(product);
}

export async function updateProduct(id: number, product: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(products).set(product).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(products).where(eq(products.id, id));
}

// ===================== Order queries =====================

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(orders).values(order);
}

export async function updateOrder(id: number, order: Partial<InsertOrder>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(orders).set(order).where(eq(orders.id, id));
}

// ===================== Shipping configuration =====================

export async function getShippingConfig() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(shippingConfig).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateShippingConfig(config: Partial<InsertShippingConfig>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getShippingConfig();
  if (existing) {
    return db.update(shippingConfig).set(config).where(eq(shippingConfig.id, existing.id));
  } else {
    return db.insert(shippingConfig).values(config as InsertShippingConfig);
  }
}

// ===================== Payment fee configuration =====================

export async function getPaymentFeeConfig() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(paymentFeeConfig).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllPaymentFeeConfigs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paymentFeeConfig).orderBy(paymentFeeConfig.id);
}

export async function createPaymentFeeConfig(config: Omit<InsertPaymentFeeConfig, 'id'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(paymentFeeConfig).values(config);
  return { id: result[0].insertId };
}

export async function updatePaymentFeeConfig(config: Partial<InsertPaymentFeeConfig> & { id?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (config.id) {
    const { id, ...rest } = config;
    return db.update(paymentFeeConfig).set(rest).where(eq(paymentFeeConfig.id, id));
  }
  const existing = await getPaymentFeeConfig();
  if (existing) {
    return db.update(paymentFeeConfig).set(config).where(eq(paymentFeeConfig.id, existing.id));
  } else {
    return db.insert(paymentFeeConfig).values(config as InsertPaymentFeeConfig);
  }
}

export async function deletePaymentFeeConfig(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(paymentFeeConfig).where(eq(paymentFeeConfig.id, id));
}

// ===================== Review queries =====================

export async function getReviewsByProduct(productId: number, status?: string) {
  const db = await getDb();
  if (!db) return [];
  if (status) {
    return db.select().from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.status, status as any)))
      .orderBy(desc(reviews.createdAt));
  }
  return db.select().from(reviews)
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt));
}

export async function getAllReviews() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).orderBy(desc(reviews.createdAt));
}

export async function createReview(review: { productId: number; customerName: string; rating: number; comment: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(reviews).values(review);
}

export async function updateReviewStatus(id: number, status: "pending" | "approved" | "hidden") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(reviews).set({ status }).where(eq(reviews.id, id));
}

export async function respondToReview(id: number, adminResponse: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(reviews).set({ adminResponse, adminResponseAt: new Date() }).where(eq(reviews.id, id));
}

export async function deleteReview(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(reviews).where(eq(reviews.id, id));
}

export async function getReviewStats(productId: number) {
  const db = await getDb();
  if (!db) return { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  const approvedReviews = await db.select().from(reviews)
    .where(and(eq(reviews.productId, productId), eq(reviews.status, "approved")));
  const total = approvedReviews.length;
  const average = total > 0 ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  approvedReviews.forEach(r => { distribution[r.rating as keyof typeof distribution]++; });
  return { average: Math.round(average * 10) / 10, total, distribution };
}

// ===================== Question queries =====================

export async function getQuestionsByProduct(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(questions)
    .where(eq(questions.productId, productId))
    .orderBy(desc(questions.createdAt));
}

export async function getAllQuestions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(questions).orderBy(desc(questions.createdAt));
}

export async function createQuestion(question: { productId: number; customerName: string; question: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(questions).values(question);
}

export async function respondToQuestion(id: number, adminResponse: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(questions).set({ adminResponse, adminResponseAt: new Date(), status: "answered" }).where(eq(questions.id, id));
}

export async function deleteQuestion(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(questions).where(eq(questions.id, id));
}

// ===================== Admin user queries =====================

export async function getAdminByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
