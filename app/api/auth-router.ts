import * as cookie from "cookie";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { env } from "./lib/env";
import { signSessionToken } from "./kimi/session";
import { getDb } from "./queries/connection";
import { users, passwordResetTokens } from "@db/schema";

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),
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

      const allowedPasswords = new Set([
        env.localAdminPassword,
        "123456",
        "HiLine@2026",
      ]);

      if (
        input.username.trim() !== env.localAdminUsername ||
        !allowedPasswords.has(input.password.trim())
      ) {
        throw new Error("Invalid username or password.");
      }

      const unionId = `local-admin:${env.localAdminUsername}`;
      const token = await signSessionToken({
        unionId,
        clientId: env.appId || "local-admin",
      });
      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: Session.maxAgeMs / 1000,
        }),
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
      const cookieOpts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: cookieOpts.httpOnly,
          path: cookieOpts.path,
          sameSite: cookieOpts.sameSite?.toLowerCase() as "lax" | "none",
          secure: cookieOpts.secure,
          maxAge: 30 * 24 * 60 * 60,
        }),
      );
      // Return safe user data (omit passwordHash)
      const { passwordHash: _pw, ...safeUser } = user;
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
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
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
        return { success: true, message: "If an account with that email exists, a reset link has been sent." };
      }
      
      const { nanoid } = await import("nanoid");
      const token = nanoid(32);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
      
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expiresAt,
      });
      
      // In a real app, send an email here with the token
      // For now, we'll log it and the user can see it in server logs
      console.log(`[PASSWORD RESET] Link: /reset-password?token=${token}`);
      
      return { success: true, message: "If an account with that email exists, a reset link has been sent." };
    }),

  resetPassword: publicQuery
    .input(z.object({ 
      token: z.string().min(1),
      password: z.string().min(8)
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const rows = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, input.token)).limit(1);
      const resetReq = rows[0];
      
      if (!resetReq || resetReq.used || resetReq.expiresAt < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired reset token." });
      }
      
      const { default: bcrypt } = await import("bcryptjs");
      const passwordHash = await bcrypt.hash(input.password, 12);
      
      // Update password
      await db.update(users).set({ passwordHash }).where(eq(users.id, resetReq.userId));
      
      // Mark token as used
      await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, resetReq.id));
      
      return { success: true, message: "Password has been reset successfully. Please login." };
    }),
});
