import { describe, expect, it } from "vitest";
import { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStaticFiles } from "./vite";

describe("serveStaticFiles", () => {
  it("opens the main storefront in Arabic", async () => {
    const app = new Hono<{ Bindings: HttpBindings }>();
    serveStaticFiles(app);

    const response = await app.request("https://bellorypharma.com/");

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/ar");
  });
});
