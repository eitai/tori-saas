// verify.mjs — drive the built site in real Chrome and check the signature
// scenes, feature morph and form actually work. Saves screenshots to verify/.
//   node scripts/verify.mjs "http://localhost:4174/tori-saas/"

import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const URL = process.argv[2] || "http://localhost:4174/tori-saas/";
const CHROME =
  process.env.CHROME_PATH ||
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT = "verify";
mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

const consoleErrors = [];
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text());
});
page.on("pageerror", (e) => consoleErrors.push("PAGEERROR: " + e.message));

await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
await sleep(1500);

const env = await page.evaluate(() => ({
  fine: matchMedia("(pointer: fine)").matches,
  lenis: !!window.__lenis,
  title: document.title,
  h1: document.querySelector("h1")?.textContent?.trim(),
}));
log("ENV:", JSON.stringify(env));

async function scrollTo(y) {
  await page.evaluate((y) => {
    if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true });
    else window.scrollTo(0, y);
  }, y);
  await sleep(1300); // let scrub (scrub:1) settle
}

async function shot(name) {
  await page.screenshot({ path: `${OUT}/${name}.png` });
  log("  saved", `${OUT}/${name}.png`);
}

/* ---------------- 1) HERO ASSEMBLY ---------------- */
log("\n[1] Hero dashboard assembly");
await scrollTo(0);
const heroTop = await page.evaluate(() => {
  const appt = document.querySelector("[data-appt]");
  const skel = document.querySelector("[data-skeleton='cal']");
  return {
    apptOpacity: appt ? +getComputedStyle(appt).opacity : null,
    skelVisible: skel
      ? getComputedStyle(skel).visibility === "visible" &&
        +getComputedStyle(skel).opacity > 0.2
      : null,
    revenue: document.getElementById("dash-revenue")?.textContent,
  };
});
log("  at rest:", JSON.stringify(heroTop));
await shot("hero-01-skeleton");

await scrollTo(1250);
await shot("hero-02-calendar-toasts");

await scrollTo(2650);
const midRevenue = await page.evaluate(
  () => document.getElementById("dash-revenue")?.textContent
);
log("  revenue counter mid-scroll:", midRevenue);
await shot("hero-03-kpis");

await scrollTo(3950);
const heroEnd = await page.evaluate(() => {
  const appt = document.querySelector("[data-appt]");
  const line = document.getElementById("chart-line");
  return {
    apptOpacity: appt ? +getComputedStyle(appt).opacity : null,
    revenue: document.getElementById("dash-revenue")?.textContent,
    occupancy: document.getElementById("dash-occupancy")?.textContent,
    bookings: document.getElementById("dash-bookings")?.textContent,
    chartOffset: line ? +(line.style.strokeDashoffset || "1") : null,
  };
});
log("  assembled:", JSON.stringify(heroEnd));
await shot("hero-04-assembled");

/* ---------------- 2) FEATURE MORPH ---------------- */
log("\n[2] Feature showcase morph");
// find the pinned feature stage start, then step through its pin range
const featTop = await page.evaluate(() => {
  const el = document.getElementById("features");
  return el ? window.scrollY + el.getBoundingClientRect().top : null;
});
log("  features section starts at y≈", Math.round(featTop));
await scrollTo(featTop + 200);
const screenState = async () =>
  page.evaluate(() => {
    const s = [1, 2, 3].map((i) => {
      const el = document.querySelector(`[data-screen="${i}"]`);
      return el ? +getComputedStyle(el).opacity : null;
    });
    return s;
  });
log("  screen opacities (booking view):", JSON.stringify(await screenState()));
await shot("feat-01-booking");
await scrollTo(featTop + 1500);
log("  screen opacities (reminders view):", JSON.stringify(await screenState()));
await shot("feat-02-reminders");
await scrollTo(featTop + 2600);
log("  screen opacities (analytics view):", JSON.stringify(await screenState()));
await shot("feat-03-analytics");

/* ---------------- 3) TRIAL FORM ---------------- */
log("\n[3] Trial form submit");
await page.evaluate(() => {
  const el = document.getElementById("trial");
  const y = window.scrollY + el.getBoundingClientRect().top - 40;
  if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true });
  else window.scrollTo(0, y);
});
await sleep(900);
await page.type("#t-name", "דניאל כהן");
await page.type("#t-biz", "מספרת דניאל");
await page.select("#t-type", "מספרה / ברבר");
await page.type("#t-contact", "050-1234567");
await shot("form-01-filled");
await page.click('#trial button[type="submit"]');
await sleep(1200);
const success = await page.evaluate(() => {
  const h = document.querySelector('#trial [role="status"] h2');
  return h ? h.textContent.trim() : null;
});
log("  success heading:", success);
await shot("form-02-success");

/* ---------------- 4) MOBILE ---------------- */
log("\n[4] Mobile (390×844, native scroll, stacked fallback)");
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
await page.reload({ waitUntil: "networkidle2" });
await sleep(1200);
const mobileEnv = await page.evaluate(() => ({
  lenis: !!window.__lenis, // should be false (touch/coarse pointer)
  stackVisible: !!document.querySelector("#features .lg\\:motion-safe\\:hidden"),
}));
log("  mobile env:", JSON.stringify(mobileEnv));
await shot("mobile-01-hero");

/* ---------------- report ---------------- */
log("\n=== RESULT ===");
log("console errors:", consoleErrors.length);
consoleErrors.forEach((e) => log("  !", e));

await browser.close();
