import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 900, height: 400 }, colorScheme: 'dark', deviceScaleFactor: 2 });
await p.goto('http://localhost:3000/result?fixture=tuvi-ty&tab=chart', { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
// Render the verification string at 9px mono in the app's own font stack.
await p.evaluate(() => {
  const d = document.createElement('div');
  d.id = 'fontcheck';
  d.style.cssText = 'position:fixed;top:0;left:0;z-index:9999;background:#06090f;padding:14px;';
  d.innerHTML = `
    <div class="mono" style="font-size:9px;color:#e6eef9">Tỵ Sửu Dậu Mệnh Phụ Mẫu Tật Ách Nô Bộc</div>
    <div class="mono" style="font-size:9.5px;color:#7d8ca8;margin-top:6px">miếu vượng đắc bình hãm · Quý Dậu · 24–33</div>
    <div style="font-size:13.5px;font-weight:600;color:#e8b25a;margin-top:8px">Liêm Trinh · Phá Quân · Vũ Khúc · Thái Dương</div>
    <div style="font-size:10px;color:#717e98;margin-top:6px">Hồng Loan Thiên Hỷ Long Trì Phượng Các Bát Tọa</div>`;
  document.body.appendChild(d);
});
await p.locator('#fontcheck').screenshot({ path: process.argv[2] });
// which family actually resolved
const fams = await p.evaluate(() => {
  const el = document.querySelector('#fontcheck .mono');
  return { computed: getComputedStyle(el).fontFamily, faces: [...document.fonts].map(f => `${f.family} ${f.weight} ${f.unicodeRange ? 'ur' : ''} ${f.status}`).slice(0, 12) };
});
console.log(JSON.stringify(fams, null, 2));
await b.close();
