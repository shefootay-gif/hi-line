import { cleanup, fireEvent, render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, useNavigate } from "react-router";
import { MetaPixelPageView } from "./MetaPixelPageView";

function NavigationTest() {
  const navigate = useNavigate();
  return <><MetaPixelPageView /><button onClick={() => navigate("/en/shop?q=roll-on")}>Shop</button></>;
}

describe("Meta Pixel", () => {
  afterEach(() => {
    cleanup();
    delete window.fbq;
    delete window.__metaPixelLastPageView;
  });

  it("loads the supplied pixel in the document head with a no-script fallback", () => {
    const html = readFileSync("index.html", "utf8");
    const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
    expect(head).toContain("https://connect.facebook.net/en_US/fbevents.js");
    expect(head).toContain("fbq('init', '1325671356119871')");
    expect(head).toContain("fbq('track', 'PageView')");
    expect(html).toContain("https://www.facebook.com/tr?id=1325671356119871&amp;ev=PageView&amp;noscript=1");
    expect(html).not.toContain("[https://");
  });

  it("tracks client-side navigation once without duplicating the initial page view", () => {
    window.fbq = vi.fn();
    window.__metaPixelLastPageView = "/ar";
    const { getByRole } = render(
      <MemoryRouter initialEntries={["/ar"]}><NavigationTest /></MemoryRouter>,
    );
    expect(window.fbq).not.toHaveBeenCalled();
    fireEvent.click(getByRole("button", { name: "Shop" }));
    expect(window.fbq).toHaveBeenCalledTimes(1);
    expect(window.fbq).toHaveBeenCalledWith("track", "PageView");
    fireEvent.click(getByRole("button", { name: "Shop" }));
    expect(window.fbq).toHaveBeenCalledTimes(1);
  });
});
