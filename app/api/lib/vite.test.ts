import { describe, expect, it } from "vitest";
import { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStaticFiles } from "./vite";

describe("serveStaticFiles", () => {
  it("serves the app shell at the root so the saved locale can be respected", async () => {
    const app = new Hono<{ Bindings: HttpBindings }>();
    serveStaticFiles(app);

    const response = await app.request("https://bellorypharma.com/");

    expect(response.status).toBe(200);
    expect(await response.text()).toContain("<div id=\"root\"></div>");
  });
});
