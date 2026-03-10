import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import crypto from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./_core/env";

const ADMIN_COOKIE = "admin_session";
const adminSecret = new TextEncoder().encode(ENV.cookieSecret || "fallback-secret-key-jbsx");

function verifyPassword(password: string, hash: string): boolean {
  const [salt, storedHash] = hash.split(":");
  if (!salt || !storedHash) return false;
  const computed = crypto.scryptSync(password, salt, 64).toString("hex");
  return computed === storedHash;
}

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

  // Admin auth (independent login with username/password)
  adminAuth: router({
    login: publicProcedure
      .input(z.object({ username: z.string().min(1), password: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const admin = await db.getAdminByUsername(input.username);
        if (!admin || !verifyPassword(input.password, admin.passwordHash)) {
          throw new Error("Usu\u00e1rio ou senha inv\u00e1lidos");
        }
        const token = await new SignJWT({ adminId: admin.id, username: admin.username, name: admin.name })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime("24h")
          .sign(adminSecret);
        ctx.res.cookie(ADMIN_COOKIE, token, {
          httpOnly: true,
          secure: ctx.req.protocol === "https",
          sameSite: ctx.req.protocol === "https" ? "none" : "lax",
          path: "/",
          maxAge: 24 * 60 * 60 * 1000,
        });
        return { success: true, name: admin.name, username: admin.username };
      }),
    me: publicProcedure.query(async ({ ctx }) => {
      try {
        const cookieHeader = ctx.req.headers.cookie || "";
        const cookies = Object.fromEntries(cookieHeader.split(";").map(c => {
          const [k, ...v] = c.trim().split("=");
          return [k, v.join("=")];
        }));
        const token = cookies[ADMIN_COOKIE];
        if (!token) return null;
        const { payload } = await jwtVerify(token, adminSecret);
        return { adminId: payload.adminId as number, username: payload.username as string, name: payload.name as string };
      } catch {
        return null;
      }
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(ADMIN_COOKIE, {
        httpOnly: true,
        secure: ctx.req.protocol === "https",
        sameSite: ctx.req.protocol === "https" ? "none" : "lax",
        path: "/",
        maxAge: -1,
      });
      return { success: true };
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

  // Reviews
  reviews: router({
    byProduct: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return await db.getReviewsByProduct(input.productId, "approved");
      }),
    allByProduct: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return await db.getReviewsByProduct(input.productId);
      }),
    all: publicProcedure.query(async () => {
      return await db.getAllReviews();
    }),
    stats: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return await db.getReviewStats(input.productId);
      }),
    create: publicProcedure
      .input(z.object({
        productId: z.number(),
        customerName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        rating: z.number().min(1).max(5),
        comment: z.string().min(5, "Comentário deve ter pelo menos 5 caracteres").optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createReview({
          productId: input.productId,
          customerName: input.customerName,
          rating: input.rating,
          comment: input.comment || null,
        });
      }),
    updateStatus: publicProcedure
      .input(z.object({ id: z.number(), status: z.enum(["pending", "approved", "hidden"]) }))
      .mutation(async ({ input }) => {
        return await db.updateReviewStatus(input.id, input.status);
      }),
    respond: publicProcedure
      .input(z.object({ id: z.number(), adminResponse: z.string().min(1) }))
      .mutation(async ({ input }) => {
        return await db.respondToReview(input.id, input.adminResponse);
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteReview(input.id);
      }),
  }),

  // Questions
  questions: router({
    byProduct: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return await db.getQuestionsByProduct(input.productId);
      }),
    all: publicProcedure.query(async () => {
      return await db.getAllQuestions();
    }),
    create: publicProcedure
      .input(z.object({
        productId: z.number(),
        customerName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        question: z.string().min(5, "Pergunta deve ter pelo menos 5 caracteres"),
      }))
      .mutation(async ({ input }) => {
        return await db.createQuestion({
          productId: input.productId,
          customerName: input.customerName,
          question: input.question,
        });
      }),
    respond: publicProcedure
      .input(z.object({ id: z.number(), adminResponse: z.string().min(1) }))
      .mutation(async ({ input }) => {
        return await db.respondToQuestion(input.id, input.adminResponse);
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteQuestion(input.id);
      }),
  }),

  // Payment Fee Configuration
  paymentFeeConfig: router({
    get: publicProcedure.query(async () => {
      return await db.getPaymentFeeConfig();
    }),
    getAll: publicProcedure.query(async () => {
      return await db.getAllPaymentFeeConfigs();
    }),
    create: publicProcedure
      .input(z.object({
        cardType: z.string().min(1),
        label: z.string().min(1),
        feePercentage: z.string(),
        minFee: z.string(),
        maxFee: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await db.createPaymentFeeConfig(input);
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number().optional(),
        cardType: z.string().optional(),
        label: z.string().optional(),
        feePercentage: z.string().optional(),
        minFee: z.string().optional(),
        maxFee: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.updatePaymentFeeConfig(input);
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deletePaymentFeeConfig(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
