import crypto from "crypto";
import { z } from "zod";
import { and, eq, gt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { serializeSessionCookie } from "./lib/cookies";
import { getAffectedRows } from "./lib/db-result";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { env } from "./lib/env";
import { signSessionToken } from "./lib/session";
import { getDb } from "./queries/connection";
import { users, passwordResetTokens } from "@db/schema";
import {
  hashPasswordResetToken,
  sendPasswordResetEmail,
} from "./email-service";

const passwordResetResponse = {
  success: true,
  message: "If an account with that email exists, a reset link has been sent.",
} as const;

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),
  updateProfile: authedQuery
    .input(
      z.object({
        name: z.string().trim().min(1).max(100),
        phone: z.string().trim().max(50).nullable().optional(),
        gender: z.string().trim().max(20).nullable().optional(),
        birthday: z.string().trim().max(50).nullable().optional(),
        nationality: z.string().trim().max(100).nullable().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db
        .update(users)
        .set({
          name: input.name,
          phone: input.phone,
          gender: input.gender,
          birthday: input.birthday,
          nationality: input.nationality,
        })
        .where(eq(users.id, ctx.user.id));
      return { success: true };
    }),
  localAdminLogin: publicQuery
    .input(
      z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!env.localAdminUsername || !env.localAdminPassword) {
        throw new Error("Local admin login is not configured.");
      }

      if (
        input.username.trim() !== env.localAdminUsername ||
        input.password !== env.localAdminPassword
      ) {
        throw new Error("Invalid username or password.");
      }

      const unionId = `local-admin:${env.localAdminUsername}`;
      const token = await signSessionToken({
        unionId,
        clientId: "local-admin",
      });
      ctx.resHeaders.append(
        "set-cookie",
        serializeSessionCookie(ctx.req.headers, token),
      );

      return { success: true };
    }),

  // Local user login (email + password)
  localUserLogin: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      // Find user by email
      const rows = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email.toLowerCase().trim()))
        .limit(1);
      const user = rows[0];
      if (!user || !user.passwordHash) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
      }
      // Verify password
      const { default: bcrypt } = await import("bcryptjs");
      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
      }
      // Issue session token
      const token = await signSessionToken({ unionId: user.unionId, clientId: "local" });
      ctx.resHeaders.append(
        "set-cookie",
        serializeSessionCookie(ctx.req.headers, token, 30 * 24 * 60 * 60),
      );
      // Return safe user data (omit passwordHash)
      const { passwordHash, ...safeUser } = user;
      void passwordHash;
      return { user: safeUser };
    }),

  // Local user register
  localUserRegister: publicQuery
    .input(
      z.object({
        name: z.string().trim().min(1).max(100),
        email: z.string().email(),
        password: z.string().min(8).max(100),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const email = input.email.toLowerCase().trim();
      // Check if email already registered
      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (existing.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
      }
      // Hash password
      const { default: bcrypt } = await import("bcryptjs");
      const passwordHash = await bcrypt.hash(input.password, 12);
      // Create user with unique unionId
      const { nanoid } = await import("nanoid");
      const unionId = `local:${nanoid()}`;
      await db.insert(users).values({
        unionId,
        name: input.name,
        email,
        passwordHash,
        role: "user",
        lastSignInAt: new Date(),
      });
      return { success: true, message: "Account created. Please login." };
    }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    ctx.resHeaders.append(
      "set-cookie",
      serializeSessionCookie(ctx.req.headers, "", 0),
    );
    return { success: true };
  }),

  forgotPassword: publicQuery
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const email = input.email.toLowerCase().trim();
      const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
      const user = rows[0];
      if (!user) {
        // Return success even if not found to prevent email enumeration
        return passwordResetResponse;
      }

      const token = crypto.randomBytes(32).toString("base64url");
      const tokenHash = hashPasswordResetToken(token);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

      // A new request invalidates any earlier reset links for this account.
      await db
        .update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.userId, user.id));

      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token: tokenHash,
        expiresAt,
      });

      try {
        await sendPasswordResetEmail({
          to: email,
          name: user.name,
          token,
        });
      } catch (error) {
        // Do not reveal whether an account exists, but invalidate an undelivered link.
        await db
          .update(passwordResetTokens)
          .set({ used: true })
          .where(eq(passwordResetTokens.token, tokenHash));
        console.error("Password reset email delivery failed:", error);
      }

      return passwordResetResponse;
    }),

  resetPassword: publicQuery
    .input(z.object({ 
      token: z.string().min(1),
      password: z.string().min(8)
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const tokenHash = hashPasswordResetToken(input.token);
      const rows = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.token, tokenHash))
        .limit(1);
      const resetReq = rows[0];

      if (!resetReq || resetReq.used || resetReq.expiresAt < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired reset token." });
      }

      const { default: bcrypt } = await import("bcryptjs");
      const passwordHash = await bcrypt.hash(input.password, 12);

      await db.transaction(async tx => {
        // Claim the token atomically so concurrent requests cannot reuse it.
        const claimResult = await tx
          .update(passwordResetTokens)
          .set({ used: true })
          .where(
            and(
              eq(passwordResetTokens.id, resetReq.id),
              eq(passwordResetTokens.used, false),
              gt(passwordResetTokens.expiresAt, new Date()),
            ),
          );

        if (getAffectedRows(claimResult) !== 1) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired reset token.",
          });
        }

        await tx
          .update(users)
          .set({ passwordHash })
          .where(eq(users.id, resetReq.userId));

        await tx
          .update(passwordResetTokens)
          .set({ used: true })
          .where(eq(passwordResetTokens.userId, resetReq.userId));
      });

      return { success: true, message: "Password has been reset successfully. Please login." };
    }),
});
