// og-capture.mjs — screenshot the assembled תורי hero into a 1200×630 OG image.
// 0 credits: the OG image is a real render of the coded dashboard hero.
// Run against a LOCAL preview of the production build:
//   npm run build && npm run preview   (note the URL, e.g. http://localhost:4173/tori-saas/)
//   node scripts/og-capture.mjs "http://localhost:4173/tori-saas/" "public/og.jpg"

import puppeteer from "puppeteer-core";
import { writeFileSync } from "node:fs";

const URL = process.argv[2] || "http://localhost:4173/tori-saas/";
const OUT = process.argv[3] || "public/og.jpg";
const CHROME_PATH =
  process.env.CHROME_PATH ||
  "C:/Program Files/Google/Chrome/Application/chrome.exe";

const W = 1200,
  H = 630;

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });
// Reduce motion so the dashboard renders in its fully-assembled static state.
await page.emulateMediaFeatures([
  { name: "prefers-reduced-motion", value: "reduce" },
]);
await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
await page.waitForNetworkIdle({ idleTime: 800 }).catch(() => {});
await new Promise((r) => setTimeout(r, 2500)); // fonts + reveal settle

// Hide the scroll hint from the share image.
await page.evaluate(() => {
  document
    .querySelector(".hero-hint")
    ?.style.setProperty("display", "none", "important");
});

const rawB64 = await page.screenshot({
  encoding: "base64",
  clip: { x: 0, y: 0, width: W, height: H },
});
const jpgDataUrl = await page.evaluate(
  async (b64, w, h) => {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, w, h);
    for (const q of [0.92, 0.88, 0.84, 0.8, 0.75]) {
      const url = c.toDataURL("image/jpeg", q);
      if (url.length * 0.75 <= 300 * 1024) return url;
    }
    return c.toDataURL("image/jpeg", 0.7);
  },
  rawB64,
  W,
  H
);

const buf = Buffer.from(jpgDataUrl.split(",")[1], "base64");
writeFileSync(OUT, buf);
console.log(`OG image → ${OUT}  (${W}×${H}, ${(buf.length / 1024).toFixed(1)} KB)`);

await browser.close();
