// 오호플 SEO·AEO 정적 페이지 생성기
// 사용법: node tools/build-seo.mjs [https://새도메인]
// index.html 안의 작품 데이터(WORKS 등)를 읽어서 아래를 만들어요.
//   /w/<id>/index.html  작품마다 검색에 걸리는 소개 페이지 (구조화 데이터 포함)
//   /works/index.html   전체 작품 목록 (종류별)
//   /sitemap.xml        이미지 사이트맵 포함
//   /robots.txt         검색엔진·AI 크롤러 허용
//   /llms.txt           AI 답변 서비스용 요약
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const BASE = (process.argv[2] || 'https://ohopl.vercel.app').replace(/\/$/, '');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const a = html.indexOf('const TYPES = {'), b = html.indexOf('const VACANTS');
const g = html.indexOf('const GALLERY = {'), ge = html.indexOf('};', g) + 2;
const code = html.slice(a, b) + '\n' + html.slice(g, ge) + '\n;({TYPES, WORKS, HIDDEN_WORKS, FAITH_WORKS, TOOL_WORKS, PLACES, THUMBS:[...THUMBS], GALLERY})';
const D = vm.runInNewContext(code, {});
const today = new Date().toISOString().slice(0, 10);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SLUG = {PLAY:'play', USE:'tools', CREATE:'create', LEARN:'learn', EXPLORE:'explore'};
const APPCAT = {PLAY:'GameApplication', USE:'UtilitiesApplication', CREATE:'DesignApplication', LEARN:'EducationalApplication', EXPLORE:'EntertainmentApplication'};
const PLACE = w => w.place && D.PLACES[w.place] ? `${D.PLACES[w.place].area || '도구 섬'} · ${D.PLACES[w.place].name}` : ({'광장':'분수 광장','큰길':'큰길','골목':'골목','숨은 곳':'마을 숨은 곳','도구 섬':'도구 섬','큰길 끝':'큰길 끝'}[w.zone] || w.zone);
const works = [...D.WORKS, ...D.HIDDEN_WORKS, ...D.FAITH_WORKS, ...D.TOOL_WORKS, D.GALLERY].filter(w => !w.vacant && !w.soon && w.url);
const thumb = w => D.THUMBS.includes(w.id) ? `${BASE}/thumbs/${w.id}.webp` : null;
const pageUrl = w => `${BASE}/w/${w.id}/`;
const hostOf = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };

const CSS = `:root{--bg:#fbf8f2;--fg:#1d2033;--muted:#5d6278;--card:#ffffff;--line:#e7e1d6;--accent:#f26a2e}
@media (prefers-color-scheme:dark){:root{--bg:#141626;--fg:#eef0f8;--muted:#a7acc2;--card:#1d2036;--line:#2c3050;--accent:#ff8a52}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.7 'IBM Plex Sans KR',system-ui,sans-serif}
a{color:inherit}.wrap{max-width:860px;margin:0 auto;padding:20px max(16px,env(safe-area-inset-left)) 48px}
.top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:22px}
.logo{font-family:'Jua',system-ui;font-size:24px;text-decoration:none}.logo small{font-family:'IBM Plex Sans KR';font-size:13px;color:var(--muted);margin-left:6px}
.crumb{font-size:13px;color:var(--muted)}.crumb a{text-decoration:none}
h1{font-family:'Jua',system-ui;font-weight:400;font-size:clamp(30px,6vw,44px);line-height:1.2;margin:6px 0 10px;text-wrap:balance}
h2{font-family:'Jua',system-ui;font-weight:400;font-size:24px;margin:34px 0 10px}
.chips{display:flex;gap:6px;flex-wrap:wrap}.chip{font-size:13px;font-weight:700;border-radius:999px;padding:3px 10px;background:var(--card);border:1px solid var(--line)}
.shot{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:18px;border:1px solid var(--line);background:var(--card);margin:18px 0}
.lead{font-size:18px}.btns{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0}
.btn{display:inline-block;border-radius:999px;padding:12px 22px;font-weight:700;text-decoration:none;background:var(--accent);color:#fff}.btn.ghost{background:var(--card);color:var(--fg);border:1px solid var(--line)}
dl{display:grid;grid-template-columns:auto 1fr;gap:6px 16px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 18px;margin:0}dt{color:var(--muted)}dd{margin:0;min-width:0}
.faq details{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 16px;margin:8px 0}.faq summary{font-weight:700;cursor:pointer}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}.item{display:block;background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden;text-decoration:none}
.item img,.item .ph{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;background:#e8e2d6}.item .ph{display:grid;place-items:center;font-family:'Jua';font-size:44px;color:#fff}
.item b{display:block;padding:10px 12px 2px}.item span{display:block;padding:0 12px 12px;font-size:13px;color:var(--muted)}
footer{margin-top:44px;font-size:13px;color:var(--muted)}`;
const COLORS = {PLAY:'#7b5cff', USE:'#13a17d', CREATE:'#ef4680', LEARN:'#2b8fd6', EXPLORE:'#f28c17'};
const head = (title, desc, url, img, ld) => `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:site_name" content="오호플"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${img}"><meta property="og:locale" content="ko_KR">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${img}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jua&family=IBM+Plex+Sans+KR:wght@400;700&display=swap">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g,'\\u003c')}</script>
<style>${CSS}</style></head><body><div class="wrap">
<header class="top"><a class="logo" href="/">오호플<small>오늘의 호기심 플레이</small></a><a class="btn ghost" href="/works/">작품 전체 보기</a></header>`;
const foot = `<footer><p>오호플은 AI로 만든 게임·도구·웹서비스를 직접 써 보고 골라 소개하는 3D 창작 마을이에요. 소개된 작품은 각 제작자가 운영하며, 제작자가 원하지 않으면 바로 내려요.</p><p>문의 eunhaebleu@naver.com · © 2026 오호플</p></footer></div></body></html>`;
const card = w => { const T = D.TYPES[w.type], t = thumb(w);
  return `<a class="item" href="/w/${w.id}/">${t ? `<img src="${t}" alt="${esc(w.name)} 첫 화면" loading="lazy" width="640" height="480">` : `<div class="ph" style="background:${COLORS[w.type]}">${esc(w.name.replace(/[^가-힣A-Za-z0-9]/g,'').slice(0,1))}</div>`}<b>${esc(w.name)}</b><span>${T.ko} · ${esc(w.desc.slice(0, 46))}${w.desc.length > 46 ? '…' : ''}</span></a>`; };

fs.rmSync(path.join(ROOT, 'w'), {recursive:true, force:true});
for (const w of works) {
  const T = D.TYPES[w.type], url = pageUrl(w), img = thumb(w) || `${BASE}/og-image.png`;
  const title = `${w.name} — ${T.ko} | 오호플`;
  const desc = `${w.desc} ${w.note ? '(' + w.note + ')' : ''}`.trim().slice(0, 155);
  const kw = [w.name, T.ko, ...(T.kw || '').split(' '), PLACE(w), 'AI로 만든', '무료 웹', '오호플'].filter(Boolean);
  const qa = [
    [`${w.name}은(는) 어떤 서비스인가요?`, w.desc],
    [`${w.name}은(는) 어디서 해 볼 수 있나요?`, `${hostOf(w.url)} 에서 바로 열 수 있어요. 오호플 3D 마을에서는 ${PLACE(w)}에 있어요.`],
    ...(w.note ? [[`${w.name}을(를) 쓰기 전에 알아둘 점이 있나요?`, w.note]] : []),
    [`${w.name}은(는) 어떻게 즐기면 좋나요?`, w.share ? `오호플 추천 포인트: ${w.share}.` : `${T.ko} 작품이에요.`]];
  const ld = {'@context':'https://schema.org','@graph':[
    {'@type':'WebApplication','@id':url+'#app','name':w.name,'url':w.url,'description':w.desc,'applicationCategory':APPCAT[w.type],'operatingSystem':'웹 브라우저','inLanguage':'ko','keywords':kw.join(', '),...(thumb(w)?{'image':thumb(w),'screenshot':thumb(w)}:{})},
    {'@type':'WebPage','@id':url,'url':url,'name':title,'description':desc,'inLanguage':'ko','isPartOf':{'@id':BASE+'/#website'},'about':{'@id':url+'#app'},'dateModified':today,...(thumb(w)?{'primaryImageOfPage':thumb(w)}:{})},
    {'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'오호플','item':BASE+'/'},{'@type':'ListItem','position':2,'name':'작품 목록','item':BASE+'/works/'},{'@type':'ListItem','position':3,'name':T.ko,'item':`${BASE}/works/#${SLUG[w.type]}`},{'@type':'ListItem','position':4,'name':w.name,'item':url}]},
    {'@type':'FAQPage','mainEntity':qa.map(([q,a])=>({'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':a}}))}]};
  const related = works.filter(x => x.type === w.type && x.id !== w.id).slice(0, 6);
  const body = `<p class="crumb"><a href="/">오호플</a> › <a href="/works/">작품 목록</a> › <a href="/works/#${SLUG[w.type]}">${T.ko}</a></p>
<h1>${esc(w.name)}</h1><div class="chips"><span class="chip">${T.ko}</span><span class="chip">${esc(PLACE(w))}</span>${w.featured ? '<span class="chip">이번 주 광장</span>' : ''}</div>
${thumb(w) ? `<img class="shot" src="${thumb(w)}" alt="${esc(w.name)} 첫 화면: ${esc(w.desc.slice(0, 60))}" width="640" height="480">` : ''}
<p class="lead">${esc(w.desc)}</p>
<div class="btns"><a class="btn" href="${esc(w.url)}" rel="noopener" target="_blank">${esc(w.name)} 열기 ↗</a><a class="btn ghost" href="/#w-${w.id}">3D 마을에서 보기</a></div>
<h2>한눈에 보기</h2><dl><dt>종류</dt><dd>${T.ko}</dd><dt>마을 위치</dt><dd>${esc(PLACE(w))}</dd><dt>주소</dt><dd>${esc(hostOf(w.url))}</dd>${w.share ? `<dt>오호플 추천</dt><dd>${esc(w.share)}</dd>` : ''}${w.note ? `<dt>알아둘 점</dt><dd>${esc(w.note)}</dd>` : ''}</dl>
<h2>자주 묻는 질문</h2><div class="faq">${qa.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
${related.length ? `<h2>비슷한 ${T.ko} 작품</h2><div class="grid">${related.map(card).join('')}</div>` : ''}`;
  fs.mkdirSync(path.join(ROOT, 'w', w.id), {recursive:true});
  fs.writeFileSync(path.join(ROOT, 'w', w.id, 'index.html'), head(title, desc, url, img, ld) + body + foot);
}

// 작품 목록
const order = ['PLAY', 'USE', 'CREATE', 'LEARN', 'EXPLORE'];
const listLd = {'@context':'https://schema.org','@graph':[{'@type':'CollectionPage','@id':BASE+'/works/','url':BASE+'/works/','name':'오호플 작품 전체 목록','inLanguage':'ko','isPartOf':{'@id':BASE+'/#website'}},
  {'@type':'ItemList','name':'오호플이 고른 AI 창작 작품','numberOfItems':works.length,'itemListElement':works.map((w,i)=>({'@type':'ListItem','position':i+1,'url':pageUrl(w),'name':w.name}))}]};
fs.mkdirSync(path.join(ROOT, 'works'), {recursive:true});
fs.writeFileSync(path.join(ROOT, 'works', 'index.html'), head('오호플 작품 전체 목록 — AI로 만든 게임·도구·웹서비스', `오호플이 직접 써 보고 고른 ${works.length}개 작품. 놀이, 도구, 만들기, 배우기, 탐험으로 나눠 봤어요. 모두 설치 없이 브라우저에서 바로.`, BASE+'/works/', BASE+'/og-image.png', listLd)
  + `<h1>작품 전체 목록</h1><p class="lead">오호플이 직접 써 보고 고른 ${works.length}개 작품이에요. 모두 설치 없이 브라우저에서 바로 열 수 있어요.</p>`
  + order.map(k => { const L = works.filter(w => w.type === k); return L.length ? `<h2 id="${SLUG[k]}">${D.TYPES[k].ko} <small>${L.length}개</small></h2><div class="grid">${L.map(card).join('')}</div>` : ''; }).join('') + foot);

// sitemap (이미지 포함)
const urls = [{loc:BASE+'/', img:BASE+'/og-image.png', t:'오호플 3D 창작 마을'}, {loc:BASE+'/works/'}, {loc:BASE+'/gallery/'}, ...works.filter(w=>w.id!=='gallery').map(w => ({loc:pageUrl(w), img:thumb(w), t:w.name+' 첫 화면'}))];
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`
  + urls.map(u => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod>${u.img ? `<image:image><image:loc>${u.img}</image:loc><image:title>${esc(u.t)}</image:title></image:image>` : ''}</url>`).join('\n') + '\n</urlset>\n');

fs.writeFileSync(path.join(ROOT, 'robots.txt'), `# 오호플 — 검색엔진·AI 답변 서비스 모두 환영해요. 요약: /llms.txt
User-agent: *
Allow: /
Disallow: /tools/

User-agent: Googlebot-Image
Allow: /

User-agent: Yeti
Allow: /

User-agent: Daum
Allow: /

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: ${BASE}/sitemap.xml
`);

fs.writeFileSync(path.join(ROOT, 'llms.txt'), `# 오호플 (OHOPL · 오늘의 호기심 플레이)

> AI로 만든 게임, 도구, 신기한 웹서비스를 직접 써 보고 골라 소개하는 3D 창작 마을이에요. 동물 캐릭터로 마을을 걸으며 가게(작품)를 발견해요. 작품은 모두 웹에서 열리고, 대부분 설치·가입 없이 바로 쓸 수 있어요(유료·로그인 여부는 작품마다 '알아둘 점'에 적어요). 운영: 블루루반 · 문의 eunhaebleu@naver.com

- 사이트: ${BASE}/
- 전체 목록: ${BASE}/works/
- 분류: 놀이(게임), 도구(일·생활), 만들기(창작), 배우기, 탐험(3D·인터랙티브)
- 공간: 분수 광장(이번 주 추천), 큰길, 골목, 도구 섬(생산성·창작 도구), 성소 언덕(교회·성당·절)
- 원칙: 오호플이 직접 확인한 작품만 소개하고, 제작자가 원하지 않으면 바로 내려요.

## 작품
${order.map(k => `\n### ${D.TYPES[k].ko}\n` + works.filter(w => w.type === k).map(w => `- [${w.name}](${pageUrl(w)}): ${w.desc}${w.note ? ' (' + w.note + ')' : ''}`).join('\n')).join('\n')}
`);
console.log(`pages ${works.length}, base ${BASE}`);

// 메인 index.html: 구조화 데이터(head)와 자바스크립트 없이도 읽히는 작품 링크(noscript)를 갱신
{
  const siteLd = {'@context':'https://schema.org','@graph':[
    {'@type':'WebSite','@id':BASE+'/#website','url':BASE+'/','name':'오호플','alternateName':['OHOPL','오늘의 호기심 플레이'],'inLanguage':'ko','description':'AI로 만든 게임, 도구, 신기한 웹서비스를 직접 써 보고 골라 소개하는 3D 창작 마을','publisher':{'@id':BASE+'/#org'}},
    {'@type':'Organization','@id':BASE+'/#org','name':'오호플','legalName':'블루루반','url':BASE+'/','logo':BASE+'/icon-512.png','email':'eunhaebleu@naver.com'},
    {'@type':'ItemList','name':'오호플이 고른 AI 창작 작품','numberOfItems':works.length,'itemListElement':works.map((w,i)=>({'@type':'ListItem','position':i+1,'url':pageUrl(w),'name':w.name}))}]};
  let idx = fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  idx = idx.replace(/<!--seo-ld-->[\s\S]*?<!--\/seo-ld-->\n?/,'').replace(/<!--seo-list-->[\s\S]*?<!--\/seo-list-->\n?/,'');
  const ldBlock = `<!--seo-ld--><link rel="canonical" href="${BASE}/">\n<script type="application/ld+json">${JSON.stringify(siteLd).replace(/</g,'\\u003c')}</script><!--/seo-ld-->\n`;
  idx = idx.replace('<link rel="preconnect"', ldBlock + '<link rel="preconnect"');
  const list = `<!--seo-list--><noscript><nav aria-label="오호플 작품 목록"><h1>오호플 · 오늘의 호기심 플레이</h1><p>AI로 만든 게임, 도구, 신기한 웹서비스가 모인 3D 창작 마을이에요.</p><ul>${works.map(w=>`<li><a href="/w/${w.id}/">${esc(w.name)}</a> — ${esc(w.desc)}</li>`).join('')}</ul><p><a href="/works/">작품 전체 목록</a></p></nav></noscript><!--/seo-list-->\n`;
  idx = idx.replace(/<body>\n?/, m => m + list);
  fs.writeFileSync(path.join(ROOT,'index.html'), idx);
}
