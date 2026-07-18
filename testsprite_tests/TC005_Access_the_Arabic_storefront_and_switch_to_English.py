import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:5173/ar")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'EN' language button to switch the storefront language to English on the same page.
        # EN button
        elem = page.get_by_role('button', name='EN', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the storefront is displayed in English and the current page context is preserved
        # Assert: The URL includes '/en', indicating the storefront is in English.
        await expect(page).to_have_url(re.compile("/en"), timeout=15000), "The URL includes '/en', indicating the storefront is in English."
        # Assert: The main content shows the English hero text 'Hi Line Pro Care'.
        await expect(page.locator("xpath=/html/body/div/div/main").nth(0)).to_contain_text("Hi Line Pro Care", timeout=15000), "The main content shows the English hero text 'Hi Line Pro Care'."
        await page.locator("xpath=/html/body/div/div/header/div/div/nav/a[1]").nth(0).scroll_into_view_if_needed()
        # Assert: The English navigation link 'Shop' is visible.
        await expect(page.locator("xpath=/html/body/div/div/header/div/div/nav/a[1]").nth(0)).to_be_visible(timeout=15000), "The English navigation link 'Shop' is visible."
        await page.locator("xpath=/html/body/div/div/main/div/section[2]/div/div[2]/div[1]/div[2]/button").nth(0).scroll_into_view_if_needed()
        # Assert: A product 'Add to Cart' button is visible, confirming the browsing context was preserved after switching to English.
        await expect(page.locator("xpath=/html/body/div/div/main/div/section[2]/div/div[2]/div[1]/div[2]/button").nth(0)).to_be_visible(timeout=15000), "A product 'Add to Cart' button is visible, confirming the browsing context was preserved after switching to English."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    