import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // File Upload (images and videos)
  upload: router({
    image: publicProcedure
      .input(z.object({
        base64: z.string(),
        filename: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const base64Data = input.base64.split(',')[1] || input.base64;
          const buffer = Buffer.from(base64Data, 'base64');
          const ext = input.filename?.split('.').pop() || 'jpg';
          const filename = `products/${nanoid()}.${ext}`;
          const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
          const { url } = await storagePut(filename, buffer, contentType);
          return { url, success: true };
        } catch (error) {
          console.error('Upload error:', error);
          throw new Error('Failed to upload image');
        }
      }),

    video: publicProcedure
      .input(z.object({
        base64: z.string(),
        filename: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const base64Data = input.base64.split(',')[1] || input.base64;
          const buffer = Buffer.from(base64Data, 'base64');
          const ext = input.filename?.split('.').pop() || 'mp4';
          const filename = `videos/${nanoid()}.${ext}`;
          const contentType = ext === 'webm' ? 'video/webm' : 'video/mp4';
          const { url } = await storagePut(filename, buffer, contentType);
          return { url, success: true };
        } catch (error) {
          console.error('Video upload error:', error);
          throw new Error('Failed to upload video');
        }
      }),
  }),

  // Categories
  categories: router({
    list: publicProcedure.query(async () => {
      return await db.getAllCategories();
    }),
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCategoryById(input.id);
      }),
    create: publicProcedure
      .input(z.object({ name: z.string().min(1), description: z.string().optional() }))
      .mutation(async ({ input }) => {
        return await db.createCategory({
          name: input.name,
          description: input.description || null,
        });
      }),
    update: publicProcedure
      .input(z.object({ id: z.number(), name: z.string().optional(), description: z.string().optional() }))
      .mutation(async ({ input }) => {
        return await db.updateCategory(input.id, {
          name: input.name,
          description: input.description,
        });
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteCategory(input.id);
      }),
  }),

  // Products
  products: router({
    list: publicProcedure.query(async () => {
      return await db.getAllProducts();
    }),
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductById(input.id);
      }),
    byCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductsByCategory(input.categoryId);
      }),
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.string().or(z.number()),
        stock: z.number().default(0),
        weight: z.string().optional(),
        image: z.string().optional(),
        videoUrl: z.string().optional(),
        gallery: z.array(z.string()).optional(),
        categoryId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createProduct({
          name: input.name,
          description: input.description || null,
          price: String(input.price),
          stock: input.stock,
          weight: input.weight || "0",
          image: input.image || null,
          videoUrl: input.videoUrl || null,
          gallery: input.gallery || null,
          categoryId: input.categoryId ?? null,
        });
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.string().or(z.number()).optional(),
        stock: z.number().optional(),
        weight: z.string().optional(),
        image: z.string().optional(),
        videoUrl: z.string().optional().nullable(),
        gallery: z.array(z.string()).optional().nullable(),
        categoryId: z.number().optional().nullable(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.price !== undefined) updateData.price = String(data.price);
        if (data.stock !== undefined) updateData.stock = data.stock;
        if (data.weight !== undefined) updateData.weight = data.weight;
        if (data.image !== undefined) updateData.image = data.image;
        if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
        if (data.gallery !== undefined) updateData.gallery = data.gallery;
        if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
        return await db.updateProduct(id, updateData);
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteProduct(input.id);
      }),
  }),

  // Orders
  orders: router({
    list: publicProcedure.query(async () => {
      return await db.getAllOrders();
    }),
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getOrderById(input.id);
      }),
    create: publicProcedure
      .input(z.object({
        customerName: z.string().min(1),
        customerEmail: z.string().email(),
        customerPhone: z.string().min(1),
        customerAddress: z.string().optional(),
        items: z.array(z.object({
          id: z.number(),
          name: z.string(),
          price: z.string(),
          quantity: z.number(),
        })),
        subtotal: z.string(),
        shippingCost: z.string().optional(),
        paymentFee: z.string().optional(),
        total: z.string(),
        termsAccepted: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createOrder({
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          customerAddress: input.customerAddress || null,
          items: input.items,
          subtotal: input.subtotal,
          shippingCost: input.shippingCost || "0",
          paymentFee: input.paymentFee || "0",
          total: input.total,
          termsAccepted: input.termsAccepted || false,
        });
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateOrder(id, data);
      }),
  }),

  // Shipping Configuration
  shippingConfig: router({
    get: publicProcedure.query(async () => {
      return await db.getShippingConfig();
    }),
    update: publicProcedure
      .input(z.object({
        baseCost: z.string().optional(),
        costPerKg: z.string().optional(),
        freeShippingThreshold: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.updateShippingConfig(input);
      }),
  }),

  // Payment Fee Configuration
  paymentFeeConfig: router({
    get: publicProcedure.query(async () => {
      return await db.getPaymentFeeConfig();
    }),
    update: publicProcedure
      .input(z.object({
        feePercentage: z.string().optional(),
        minFee: z.string().optional(),
        maxFee: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.updatePaymentFeeConfig(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
