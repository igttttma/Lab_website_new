#!/usr/bin/env python3
"""Render and audit the standalone BlimpMate review artifacts.

The script deliberately serves local assets through Playwright route interception,
so it exercises browser layout, responsive breakpoints, JS interactions, image
loading, and the browser-safe agent contract without requiring a dev server.
"""
from __future__ import annotations

import argparse
import json
import mimetypes
from pathlib import Path
from urllib.parse import unquote, urlparse

from PIL import Image, ImageDraw, ImageOps
from playwright.sync_api import Browser, Page, Route, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "review-artifacts"
BASE = "http://local.test/"

SNAPSHOT = {
    "success": True,
    "schema": "blimpmate.web-experience.v1",
    "service": "render-review-fixture",
    "connected": True,
    "mode": "live-safe",
    "captured_at": 1786089600.0,
    "interaction_boundary": {
        "digital_twin": True,
        "physical_flight_commands": False,
        "note": "Public digital twin only; no physical-control operation is exposed.",
    },
    "capabilities": {
        "subsystems": {
            "display_stream": {"provenance": "fallback", "mode": "fallback"},
            "scene_left_behind": {"provenance": "real", "mode": "real"},
            "vision_food": {"provenance": "mock", "mode": "mock"},
            "scene_safety": {"provenance": "fallback", "mode": "fallback"},
            "phone_call": {"provenance": "manual/Wizard-of-Oz", "mode": "manual"},
            "navigation": {"provenance": "fallback", "mode": "fallback"},
        },
        "summary": {"total": 6, "real": 1, "fallback": 3, "mock": 1, "manual/Wizard-of-Oz": 1},
    },
    "flight": {"available": False, "armed": False, "publisher_active": False},
    "positioning": {"available": True, "engaged": False, "simulation_only": True},
    "control_authority": {"mode": "idle", "is_autonomous": False, "is_teleop": False},
}

SCENARIO_DISPLAYS = {
    "guidance": {
        "kind": "steps", "eyebrow": "POINT-OF-ACTION GUIDANCE", "title": "Step 3 of 4",
        "body": "Tighten the two front fasteners",
        "items": [
            {"label": "Prepare workspace", "state": "done"},
            {"label": "Place target component", "state": "done"},
            {"label": "Tighten fasteners", "state": "active"},
        ],
    },
    "reminder": {
        "kind": "notification", "eyebrow": "LEFT-BEHIND REMINDER", "title": "Take your keys",
        "body": "Object memory last saw them near the entryway shelf.",
        "items": [{"object_name": "keys", "location_hint": "entryway shelf"}],
    },
    "nutrition": {
        "kind": "nutrition", "eyebrow": "MEAL-TIME FEEDBACK", "title": "About 620 kcal",
        "body": "Disclosed fixed demo fixture; not medical advice.",
        "items": [{"label": "Protein", "value": "31 g"}, {"label": "Carbs", "value": "68 g"}],
    },
    "safety": {
        "kind": "safety", "eyebrow": "SITUATED SAFETY CHECK", "title": "Secure the open container",
        "body": "Move it away from the edge and confirm the cap.",
        "items": [{"description": "Open container", "level": "warning"}],
    },
    "telepresence": {
        "kind": "telepresence", "eyebrow": "MOBILE TELEPRESENCE", "title": "Incoming call",
        "body": "Peer identifiers are redacted in the public experience.",
        "items": [{"label": "Remote collaborator", "state": "incoming"}],
    },
    "positioning": {
        "kind": "positioning", "eyebrow": "USER-RELATIVE POSITIONING", "title": "Face 18° right",
        "body": "Target distance 1.6 m. Setpoint preview only.",
        "items": [{"label": "Yaw", "value": 0.4}, {"label": "Forward", "value": 0.07}],
        "command": {"yaw": 0.4, "forward": 0.07, "vertical": 0},
    },
}

PROVENANCE = {
    "guidance": "fallback",
    "reminder": "real",
    "nutrition": "mock",
    "safety": "fallback",
    "telepresence": "manual/Wizard-of-Oz",
    "positioning": "fallback",
}


def content_type(path: Path) -> str:
    if path.suffix == ".js":
        return "application/javascript"
    if path.suffix == ".svg":
        return "image/svg+xml"
    if path.suffix == ".glb":
        return "model/gltf-binary"
    return mimetypes.guess_type(path.name)[0] or "application/octet-stream"


def action_fixture(post_data: str | None) -> dict:
    try:
        request = json.loads(post_data or "{}")
    except json.JSONDecodeError:
        request = {}
    scenario = str(request.get("scenario") or "reminder")
    display = SCENARIO_DISPLAYS.get(scenario, SCENARIO_DISPLAYS["reminder"])
    return {
        "success": True,
        "schema": "blimpmate.web-experience.v1",
        "scenario": scenario,
        "action": request.get("action") or "run",
        "mode": "live-safe",
        "digital_twin": True,
        "physical_control": False,
        "latency_ms": 38,
        "provenance": {
            "subsystem": next((k for k, v in SNAPSHOT["capabilities"]["subsystems"].items() if v["provenance"] == PROVENANCE.get(scenario)), scenario),
            "mode": PROVENANCE.get(scenario, "fallback"),
            "reason": "Render-review contract fixture.",
        },
        "display": display,
        "tools": [{"tool": f"experience.{scenario}", "ok": True, "actuator": False}],
        "summary": "Bounded agent scene completed through the public digital-twin contract.",
        "audit_recorded": False,
        "control_authority": {"mode": "idle"},
        "interaction_boundary": "No physical-control operation is exposed by the public experience.",
        "captured_at": 1786089601.0,
    }


def route_request(route: Route) -> None:
    request = route.request
    parsed = urlparse(request.url)
    path = unquote(parsed.path)
    if path == "/api/blimpmate-agent/snapshot":
        route.fulfill(status=200, content_type="application/json", body=json.dumps(SNAPSHOT))
        return
    if path == "/api/blimpmate-agent/action":
        route.fulfill(status=200, content_type="application/json", body=json.dumps(action_fixture(request.post_data)))
        return
    relative = path.lstrip("/")
    candidate = (ROOT / relative).resolve()
    try:
        candidate.relative_to(ROOT)
    except ValueError:
        route.abort("blockedbyclient")
        return
    if candidate.is_file():
        route.fulfill(status=200, content_type=content_type(candidate), path=str(candidate))
    else:
        route.fulfill(status=404, content_type="text/plain", body=f"Missing local asset: {relative}")


def load_html(page: Page, filename: str) -> None:
    html = (ROOT / filename).read_text(encoding="utf-8")
    html = html.replace("<head>", f'<head><base href="{BASE}">', 1)
    page.set_content(html, wait_until="domcontentloaded", timeout=60_000)
    page.wait_for_timeout(3_200)
    page.add_style_tag(content="*,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}")


def audit(page: Page, key_selectors: list[str]) -> dict:
    return page.evaluate(
        """(keySelectors) => {
          const all = [...document.querySelectorAll('*')];
          const duplicateIds = [...document.querySelectorAll('[id]')]
            .map((el) => el.id)
            .filter((id, i, ids) => ids.indexOf(id) !== i)
            .filter((id, i, ids) => ids.indexOf(id) === i);
          const brokenImages = [...document.images]
            .filter((img) => img.complete && img.naturalWidth === 0)
            .map((img) => ({src: img.getAttribute('src'), alt: img.alt}));
          const allowedOverflow = (el) => el.matches(
            '.blimp-highlights-track,.blimp-agent-scenario-rail,.blimp-agent-loop-map,.blimp-agent-tabs,.tabs,.top nav,[role="tablist"]'
          );
          const clipped = all.filter((el) => {
            if (allowedOverflow(el)) return false;
            const style = getComputedStyle(el);
            if (style.display === 'inline' || style.visibility === 'hidden') return false;
            const horizontal = el.scrollWidth > el.clientWidth + 4 && !['auto','scroll'].includes(style.overflowX);
            const vertical = el.scrollHeight > el.clientHeight + 4 && style.overflowY === 'hidden';
            return horizontal || vertical;
          }).slice(0, 40).map((el) => ({
            tag: el.tagName.toLowerCase(),
            id: el.id,
            className: String(el.className || '').slice(0, 150),
            client: [el.clientWidth, el.clientHeight],
            scroll: [el.scrollWidth, el.scrollHeight],
            overflow: [getComputedStyle(el).overflowX, getComputedStyle(el).overflowY],
          }));
          const keys = Object.fromEntries(keySelectors.map((selector) => {
            const el = document.querySelector(selector);
            if (!el) return [selector, null];
            const r = el.getBoundingClientRect();
            return [selector, {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}];
          }));
          return {
            viewport: {width: innerWidth, height: innerHeight},
            document: {
              clientWidth: document.documentElement.clientWidth,
              scrollWidth: document.documentElement.scrollWidth,
              scrollHeight: document.documentElement.scrollHeight,
              horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            },
            duplicateIds,
            brokenImages,
            clipped,
            keys,
          };
        }""",
        key_selectors,
    )


def screenshot_locator(page: Page, selector: str, destination: Path) -> None:
    locator = page.locator(selector).first
    if locator.count() == 0:
        return
    locator.scroll_into_view_if_needed(timeout=10_000)
    page.wait_for_timeout(500)
    locator.screenshot(path=str(destination), animations="disabled")


def render_page(browser: Browser, filename: str, prefix: str, viewport: dict[str, int], mobile: bool, full_page: bool = False) -> dict:
    context = browser.new_context(
        viewport=viewport,
        device_scale_factor=1,
        is_mobile=mobile,
        has_touch=mobile,
        reduced_motion="reduce",
    )
    page = context.new_page()
    console: list[dict] = []
    failures: list[dict] = []
    page.on("console", lambda msg: console.append({"type": msg.type, "text": msg.text}))
    page.on("pageerror", lambda exc: console.append({"type": "pageerror", "text": str(exc)}))
    page.on("requestfailed", lambda req: failures.append({"url": req.url, "failure": req.failure}))
    page.route("**/*", route_request)
    load_html(page, filename)

    page.screenshot(path=str(OUT / f"{prefix}-top.png"), full_page=False, animations="disabled")
    sections = (
        [("#overview", "hero"), ("#agent", "agent"), ("#performance", "performance")]
        if "extended" in filename
        else [(".hero", "hero"), (".stage-shell", "stage"), (".controls", "controls"), (".observability", "observability")]
    )
    for selector, label in sections:
        screenshot_locator(page, selector, OUT / f"{prefix}-{label}.png")

    # Exercise the first public Agent action and capture the updated state.
    run_selector = "[data-agent-run]" if "extended" in filename else "#runButton"
    if page.locator(run_selector).count():
        page.locator(run_selector).first.click(timeout=10_000)
        page.wait_for_timeout(700)
        result_selector = ".blimp-agent-live-shell" if "extended" in filename else ".stage-shell"
        screenshot_locator(page, result_selector, OUT / f"{prefix}-agent-result.png")

    if full_page:
        try:
            page.screenshot(path=str(OUT / f"{prefix}-full.png"), full_page=True, animations="disabled", timeout=120_000)
        except Exception as exc:  # large full-page captures can exceed a browser limit
            console.append({"type": "full-page-screenshot", "text": str(exc)})

    key_selectors = [selector for selector, _ in sections]
    report = audit(page, key_selectors)
    report["console"] = console
    report["request_failures"] = failures
    report["url"] = filename
    report["prefix"] = prefix
    context.close()
    return report


def make_contact_sheet(files: list[Path], destination: Path) -> None:
    images: list[tuple[Path, Image.Image]] = []
    for file in files:
        if file.exists():
            image = Image.open(file).convert("RGB")
            image.thumbnail((600, 3800))
            images.append((file, image.copy()))
    if not images:
        return
    width = max(image.width for _, image in images) + 40
    height = sum(image.height + 58 for _, image in images) + 20
    sheet = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(sheet)
    y = 18
    for file, image in images:
        draw.text((20, y), file.name, fill="black")
        y += 28
        sheet.paste(ImageOps.expand(image, border=1, fill="#cccccc"), (20, y))
        y += image.height + 30
    sheet.save(destination, quality=92)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--clean", action="store_true", help="Remove old PNG/JSON review output first")
    parser.add_argument("--quick", action="store_true", help="Skip very large full-page captures")
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    if args.clean:
        for pattern in ("*.png", "*.json", "*.md"):
            for file in OUT.glob(pattern):
                file.unlink()

    reports: list[dict] = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=True,
            executable_path="/usr/bin/chromium",
            args=["--no-sandbox", "--disable-dev-shm-usage", "--use-angle=swiftshader"],
        )
        reports.append(render_page(browser, "blimpmate-extended-preview.html", "product-desktop", {"width": 1440, "height": 960}, False, full_page=not args.quick))
        reports.append(render_page(browser, "blimpmate-extended-preview.html", "product-mobile", {"width": 390, "height": 844}, True, full_page=False))
        reports.append(render_page(browser, "blimpmate-agent-lab-preview.html", "agent-desktop", {"width": 1440, "height": 960}, False, full_page=not args.quick))
        reports.append(render_page(browser, "blimpmate-agent-lab-preview.html", "agent-mobile", {"width": 390, "height": 844}, True, full_page=False))
        browser.close()

    report_path = OUT / "render-audit.json"
    report_path.write_text(json.dumps(reports, indent=2, ensure_ascii=False), encoding="utf-8")
    sheet_files = [
        OUT / "product-desktop-hero.png",
        OUT / "product-desktop-agent.png",
        OUT / "product-mobile-hero.png",
        OUT / "product-mobile-agent.png",
        OUT / "agent-desktop-hero.png",
        OUT / "agent-desktop-stage.png",
        OUT / "agent-mobile-hero.png",
        OUT / "agent-mobile-stage.png",
    ]
    make_contact_sheet(sheet_files, OUT / "contact-sheet.png")

    failures = []
    for report in reports:
        if report["document"]["horizontalOverflow"] or report["duplicateIds"] or report["brokenImages"]:
            failures.append(report["prefix"])
        errors = [entry for entry in report["console"] if entry["type"] in {"error", "pageerror"}]
        if errors:
            failures.append(report["prefix"])
    summary_lines = [
        "# BlimpMate render review",
        "",
        "Rendered with Chromium through Playwright route interception at desktop and 390 px mobile widths.",
        "",
    ]
    for report in reports:
        summary_lines.extend([
            f"## {report['prefix']}",
            f"- Document: {report['document']['clientWidth']} × {report['document']['scrollHeight']} px",
            f"- Horizontal overflow: {report['document']['horizontalOverflow']}",
            f"- Broken images: {len(report['brokenImages'])}",
            f"- Duplicate IDs: {len(report['duplicateIds'])}",
            f"- Potential clipped elements: {len(report['clipped'])}",
            f"- Console entries: {len(report['console'])}; request failures: {len(report['request_failures'])}",
            "",
        ])
    (OUT / "RENDER_REVIEW.md").write_text("\n".join(summary_lines), encoding="utf-8")
    print(report_path)
    if failures:
        print("Critical audit flags:", ", ".join(sorted(set(failures))))
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
