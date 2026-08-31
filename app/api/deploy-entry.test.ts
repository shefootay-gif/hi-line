// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ exists: vi.fn(), write: vi.fn(), seed: vi.fn(), boot: vi.fn() }));
vi.mock("node:fs", () => ({ default: { existsSync: mocks.exists, writeFileSync: mocks.write } }));
vi.mock("../db/seed", () => ({ seed: mocks.seed }));
vi.mock("./boot", () => { mocks.boot(); return {}; });

describe("production bootstrap", () => {
  beforeEach(() => { vi.resetModules(); vi.clearAllMocks(); });
  it("does not seed on ordinary restarts or deployments", async () => {
    mocks.exists.mockReturnValue(true);
    await import("./deploy-entry");
    await vi.waitFor(() => expect(mocks.boot).toHaveBeenCalledOnce());
    expect(mocks.seed).not.toHaveBeenCalled();
    expect(mocks.write).not.toHaveBeenCalled();
  });
  it("uses guarded initialization when the marker is missing", async () => {
    mocks.exists.mockReturnValue(false);
    await import("./deploy-entry");
    await vi.waitFor(() => expect(mocks.write).toHaveBeenCalledOnce());
    expect(mocks.seed).toHaveBeenCalledOnce();
    expect(mocks.write).toHaveBeenCalledOnce();
    expect(mocks.seed.mock.invocationCallOrder[0]).toBeLessThan(mocks.write.mock.invocationCallOrder[0]);
  });
});
