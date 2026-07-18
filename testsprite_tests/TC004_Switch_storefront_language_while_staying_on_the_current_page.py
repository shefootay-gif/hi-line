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
        
        # -> Click the 'EN' button in the header to switch the storefront language to English.
        # EN button
        elem = page.get_by_role('button', name='EN', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the page remains on the same storefront location in English
        # Assert: The URL contains '/en', confirming the storefront locale is English.
        await expect(page).to_have_url(re.compile("/en"), timeout=15000), "The URL contains '/en', confirming the storefront locale is English."
        await page.locator("xpath=/html/body/div/div/header/div/div/div/button[1]").nth(0).scroll_into_view_if_needed()
        # Assert: Header shows the 'AR' language button, indicating the site is currently in English.
        await expect(page.locator("xpath=/html/body/div/div/header/div/div/div/button[1]").nth(0)).to_be_visible(timeout=15000), "Header shows the 'AR' language button, indicating the site is currently in English."
        # Assert: The hero section displays the English heading 'Hi Line Pro Care'.
        await expect(page.locator("xpath=/html/body/div/div/main").nth(0)).to_contain_text("Hi Line Pro Care", timeout=15000), "The hero section displays the English heading 'Hi Line Pro Care'."
        
        # --> Verify localized content is displayed in English
        # Assert: Hero heading 'Hi Line Pro Care' is displayed in English.
        await expect(page.locator("xpath=/html/body/div/div/main").nth(0)).to_contain_text("Hi Line Pro Care", timeout=15000), "Hero heading 'Hi Line Pro Care' is displayed in English."
        # Assert: Primary call-to-action button reads 'Shop Now' in English.
        await expect(page.locator("xpath=/html/body/div/div/main/div/section[1]/div/div/div[1]/div[1]/button").nth(0)).to_have_text("Shop Now", timeout=15000), "Primary call-to-action button reads 'Shop Now' in English."
        # Assert: The 'Order on WhatsApp' link is shown in English.
        await expect(page.locator("xpath=/html/body/div/div/main/div/section[1]/div/div/div[1]/div[1]/a").nth(0)).to_have_text("Order on WhatsApp", timeout=15000), "The 'Order on WhatsApp' link is shown in English."
        # Assert: Header language toggle shows 'AR', indicating the storefront is in English.
        await expect(page.locator("xpath=/html/body/div/div/header/div/div/div/button[1]").nth(0)).to_have_text("AR", timeout=15000), "Header language toggle shows 'AR', indicating the storefront is in English."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    