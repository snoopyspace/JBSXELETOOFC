import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("categories router", () => {
  it("lists categories from the database", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const categories = await caller.categories.list();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThanOrEqual(10);
    // Check first category has expected shape
    const cat = categories[0];
    expect(cat).toHaveProperty("id");
    expect(cat).toHaveProperty("name");
    expect(cat).toHaveProperty("createdAt");
  });

  it("gets a single category by id", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const category = await caller.categories.get({ id: 30001 });
    expect(category).toBeDefined();
    expect(category?.name).toBe("Fones");
  });
});

describe("products router", () => {
  it("lists products from the database", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const products = await caller.products.list();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThanOrEqual(15);
    // Check product shape
    const product = products[0];
    expect(product).toHaveProperty("id");
    expect(product).toHaveProperty("name");
    expect(product).toHaveProperty("price");
    expect(product).toHaveProperty("stock");
    expect(product).toHaveProperty("categoryId");
  });

  it("gets a single product by id", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const product = await caller.products.get({ id: 30001 });
    expect(product).toBeDefined();
    expect(product?.name).toBe("Apple Airpods pro 3");
    expect(product?.stock).toBe(4);
  });

  it("gets products by category", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    // Category 30003 = Cameras (should have products)
    const products = await caller.products.byCategory({ categoryId: 30003 });
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThanOrEqual(3);
    products.forEach((p) => {
      expect(p.categoryId).toBe(30003);
    });
  });
});

describe("orders router", () => {
  it("lists orders from the database", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const orders = await caller.orders.list();
    expect(Array.isArray(orders)).toBe(true);
  });
});

describe("shippingConfig router", () => {
  it("gets shipping config (may be null initially)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const config = await caller.shippingConfig.get();
    // May be null if no config was set yet
    expect(config === null || typeof config === "object").toBe(true);
  });
});

describe("paymentFeeConfig router", () => {
  it("gets payment fee config (may be null initially)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const config = await caller.paymentFeeConfig.get();
    expect(config === null || typeof config === "object").toBe(true);
  });
});
