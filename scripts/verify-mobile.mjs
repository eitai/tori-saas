import puppeteer from "puppeteer-core";
const URL = process.argv[2] || "http://localhost:4180/tori-saas/";
const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));
const b = await puppeteer.launch({ executablePath: CHROME, headless:"new", args:["--no-sandbox","--hide-scrollbars"] });
const p = await b.newPage();
await p.setViewport({ width:390, height:844, deviceScaleFactor:1, isMobile:true, hasTouch:true });
const errs=[]; p.on("pageerror",e=>errs.push(e.message));
await p.goto(URL,{waitUntil:"networkidle2"}); await sleep(1500);
await p.evaluate(()=>window.scrollTo(0,0)); await sleep(1200);
await p.screenshot({ path:"verify/mobile-02-hero-top.png" });
// scroll to features stacked
await p.evaluate(()=>{ const el=document.getElementById("features"); window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top + 500); });
await sleep(1200);
await p.screenshot({ path:"verify/mobile-03-features.png" });
const lenis = await p.evaluate(()=>!!window.__lenis);
console.log("mobile lenis active:", lenis, "| pageerrors:", errs.length);
await b.close();
