// verify-demo.mjs — drive the INTERACTIVE demo in real Chrome on the production
// build: open from the hero button, create/arrive/cancel appointments, switch
// all 4 views, confirm reports recompute + reset, test the deep link and mobile.
//   node scripts/verify-demo.mjs "http://localhost:4174/tori-saas/"
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] || "http://localhost:4174/tori-saas/";
const CHROME =
  process.env.CHROME_PATH ||
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT = "verify";
mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);
let failures = 0;
const check = (label, cond) => {
  log(`  ${cond ? "PASS" : "FAIL"} — ${label}`);
  if (!cond) failures++;
};

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

const shot = async (n) => {
  await page.screenshot({ path: `${OUT}/${n}.png` });
  log("    saved", `${OUT}/${n}.png`);
};

// click a visible element matching selector whose text includes `text`
const clickByText = async (selector, text) => {
  const handle = await page.evaluateHandle(
    (sel, t) => {
      const els = [...document.querySelectorAll(sel)];
      return els.find(
        (e) => e.offsetParent !== null && e.textContent.includes(t)
      );
    },
    selector,
    text
  );
  const el = handle.asElement();
  if (!el) throw new Error(`no visible ${selector} with text "${text}"`);
  await el.click();
};

// click the *visible* element for a selector (sidebar + mobile strip both exist)
const clickVisible = (sel) =>
  page.evaluate((s) => {
    const el = [...document.querySelectorAll(s)].find(
      (e) => e.offsetParent !== null
    );
    el?.click();
  }, sel);

const visibleApptCount = () =>
  page.$$eval(
    "[data-demo-appt]",
    (els) => els.filter((e) => e.offsetParent !== null).length
  );

const reportsCount = () =>
  page.evaluate(() => {
    // first KPI card value ("תורים היום")
    const cards = [...document.querySelectorAll("section[aria-label='דוחות'] p")];
    const idx = cards.findIndex((p) => p.textContent.trim() === "תורים היום");
    return idx >= 0 ? cards[idx].nextElementSibling?.textContent?.trim() : null;
  });

/* ---------------- 1) open demo from HERO button ---------------- */
log("\n[1] Open demo from hero CTA");
await page.goto(BASE, { waitUntil: "networkidle2", timeout: 60000 });
await sleep(1200);
await page.evaluate(() => {
  const btn = document.querySelector("#hero [data-demo-open]");
  btn?.scrollIntoView({ block: "center" });
  btn?.click();
});
await page.waitForSelector("[role='dialog'][aria-modal='true']", { timeout: 8000 });
await sleep(600);
const opened = await page.evaluate(() =>
  document.body.textContent.includes("הנתונים להדגמה בלבד")
);
check("demo overlay opened with disclaimer banner", opened);
const url1 = await page.evaluate(() => location.search);
check("URL deep-link set to ?view=demo", url1.includes("view=demo"));
await shot("demo-01-open-calendar");

/* reset to a known seed first */
await page.click("[data-demo-reset]");
await sleep(500);
const seedCount = await visibleApptCount();
log("  seed appointments (today):", seedCount);
check("seed today has ~9 appointments", seedCount >= 8 && seedCount <= 10);

/* ---------------- 2) create an appointment (empty slot) ---------------- */
log("\n[2] Create appointment via empty slot");
const before = await visibleApptCount();
await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button[aria-label^='הוספת תור בשעה']")].find(
    (b) => b.offsetParent !== null
  );
  btn?.click();
});
await page.waitForSelector("#add-name", { timeout: 5000 });
await page.type("#add-name", "בדיקה אוטומטית");
await shot("demo-02-add-form");
await clickByText("button", "קביעת התור");
await sleep(700);
const toastShown = await page.evaluate(() =>
  document.body.textContent.includes("התור נקבע")
);
check("success toast appeared", toastShown);
const after = await visibleApptCount();
log(`  appts before=${before} after=${after}`);
check("calendar gained one appointment", after === before + 1);
await shot("demo-03-after-add");

/* ---------------- 3) mark arrived ---------------- */
log("\n[3] Mark an appointment arrived");
await page.evaluate(() => {
  // pick a BOOKED card (not already arrived / no success styling)
  const c = [...document.querySelectorAll("[data-demo-appt]")].find(
    (e) => e.offsetParent !== null && !e.className.includes("success")
  );
  c?.click();
});
await page.waitForSelector("[role='dialog'] button", { timeout: 5000 });
await sleep(300);
await clickByText("button", "סימון הגעה");
await sleep(600);
const arrivedToast = await page.evaluate(() =>
  document.body.textContent.includes("סומן כהגיע")
);
check("arrival toast appeared", arrivedToast);
const arrivedCards = await page.$$eval(
  "[data-demo-appt]",
  (els) =>
    els.filter((e) => e.offsetParent !== null && e.className.includes("success"))
      .length
);
check("at least one appointment shows arrived styling", arrivedCards >= 1);
await shot("demo-04-arrived");

/* ---------------- 4) cancel an appointment ---------------- */
log("\n[4] Cancel an appointment");
const beforeCancel = await visibleApptCount();
await page.evaluate(() => {
  const c = [...document.querySelectorAll("[data-demo-appt]")].find(
    (e) => e.offsetParent !== null
  );
  c?.click();
});
await page.waitForSelector("[role='dialog'] button", { timeout: 5000 });
await sleep(300);
await clickByText("button", "ביטול תור");
await sleep(600);
const cancelToast = await page.evaluate(() =>
  document.body.textContent.includes("התור בוטל")
);
check("cancel toast appeared", cancelToast);
const afterCancel = await visibleApptCount();
log(`  appts before=${beforeCancel} after=${afterCancel}`);
check("calendar lost one appointment", afterCancel === beforeCancel - 1);

/* ---------------- 5) switch all 4 views + reports recompute ---------------- */
log("\n[5] Switch views + reports recompute");
await clickVisible("[data-demo-tab='reports']");
await sleep(500);
const rc1 = await reportsCount();
log("  reports 'תורים היום' =", rc1);
await shot("demo-05-reports");

await clickVisible("[data-demo-tab='calendar']");
await sleep(300);
// add another today appointment
await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button[aria-label^='הוספת תור בשעה']")].find(
    (b) => b.offsetParent !== null
  );
  btn?.click();
});
await page.waitForSelector("#add-name", { timeout: 5000 });
await page.type("#add-name", "לקוח דוחות");
await clickByText("button", "קביעת התור");
await sleep(500);
await clickVisible("[data-demo-tab='reports']");
await sleep(500);
const rc2 = await reportsCount();
log("  reports 'תורים היום' after add =", rc2);
check("reports count increased after adding", Number(rc2) === Number(rc1) + 1);

await clickVisible("[data-demo-tab='clients']");
await sleep(400);
const clientsOk = await page.evaluate(() =>
  document.body.textContent.includes("לקוחות רשומים")
);
check("clients view renders", clientsOk);
await page.type("input[type='search']", "מאיה");
await sleep(400);
await shot("demo-06-clients-search");

await clickVisible("[data-demo-tab='reminders']");
await sleep(400);
const remindersOk = await page.evaluate(() =>
  document.body.textContent.includes("שליחה אוטומטית")
);
check("reminders view renders with auto-send toggle", remindersOk);
// toggle auto-send
await page.click("[role='switch']");
await sleep(400);
await shot("demo-07-reminders");

/* ---------------- 6) reset ---------------- */
log("\n[6] Reset demo");
await clickVisible("[data-demo-tab='calendar']");
await sleep(300);
await page.click("[data-demo-reset]");
await sleep(600);
const resetCount = await visibleApptCount();
log("  appointments after reset:", resetCount);
check("reset restored seed count", resetCount === seedCount);

/* ---------------- 7) exit back to landing ---------------- */
log("\n[7] Exit back to landing");
await page.click("[data-demo-exit]");
await sleep(600);
const closed = await page.evaluate(
  () => !document.querySelector("[role='dialog'][aria-modal='true']")
);
check("demo closed, landing restored", closed);
const url2 = await page.evaluate(() => location.search);
check("URL no longer has view=demo", !url2.includes("view=demo"));

/* ---------------- 8) deep link ---------------- */
log("\n[8] Deep link ?view=demo");
await page.goto(BASE + "?view=demo", { waitUntil: "networkidle2" });
await page.waitForSelector("[role='dialog'][aria-modal='true']", { timeout: 8000 });
const deepOk = await page.evaluate(() =>
  document.body.textContent.includes("הנתונים להדגמה בלבד")
);
check("deep link opens demo directly", deepOk);

/* ---------------- 9) mobile 390px ---------------- */
log("\n[9] Mobile 390×844");
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await page.goto(BASE + "?view=demo", { waitUntil: "networkidle2" });
await page.waitForSelector("[role='dialog'][aria-modal='true']", { timeout: 8000 });
await sleep(600);
const mobileList = await page.evaluate(() => {
  const list = [...document.querySelectorAll("[data-demo-appt]")].filter(
    (e) => e.offsetParent !== null
  ).length;
  const tabStrip = !!document.querySelector("[data-demo-tab]");
  return { list, tabStrip };
});
log("  mobile visible appts:", mobileList.list, "| tab strip:", mobileList.tabStrip);
check("mobile renders day list", mobileList.list >= 5);
await shot("demo-08-mobile");

/* ---------------- report ---------------- */
log("\n=== RESULT ===");
log("console errors:", consoleErrors.length);
consoleErrors.forEach((e) => log("  !", e));
log("checks failed:", failures);
await browser.close();
process.exit(failures === 0 && consoleErrors.length === 0 ? 0 : 1);
