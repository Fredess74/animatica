import time
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1920, 'height': 1080})
    page = context.new_page()

    try:
        print("Navigating to /create...")
        page.goto("http://localhost:3000/create")

        # Wait for editor layout to load
        print("Waiting for editor layout...")
        try:
            page.wait_for_selector(".editor-layout", timeout=10000)
        except:
            print("Editor layout not found. Taking screenshot of whatever loaded.")
            page.screenshot(path="verification/error_layout_not_found.png")
            raise

        # Take base screenshot
        print("Taking base screenshot...")
        page.screenshot(path="verification/editor_base.png")

        # Check for panel titles (should have retro stripe)
        titles = page.locator(".panel__title").all()
        if titles:
            print(f"Found {len(titles)} panel titles.")
            # We can't verify ::after directly easily with Playwright selectors,
            # but screenshot will show it.
        else:
            print("No panel titles found.")

        # Hover over an asset item if exists
        assets = page.locator(".asset-item")
        if assets.count() > 0:
            print("Hovering over first asset item...")
            assets.first.hover()
            time.sleep(0.5) # Wait for transition
            page.screenshot(path="verification/editor_asset_hover.png")
        else:
            print("No asset items found to hover.")

        # Hover over a keyframe if exists
        keyframes = page.locator(".timeline-keyframe")
        if keyframes.count() > 0:
            print("Hovering over first keyframe...")
            keyframes.first.hover()
            time.sleep(1.5) # Wait for animation cycle
            page.screenshot(path="verification/editor_keyframe_hover.png")
        else:
            print("No keyframes found to hover.")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
