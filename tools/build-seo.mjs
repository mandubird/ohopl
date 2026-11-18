// 오호플 SEO·AEO 정적 페이지 생성기
// 사용법: node tools/build-seo.mjs [https://새도메인]
// index.html 안의 작품 데이터(WORKS 등)를 읽어서 아래를 만들어요.
//   /w/<id>/index.html  작품마다 검색에 걸리는 소개 페이지 (구조화 데이터 포함)
//   /works/index.html   전체 작품 목록 (종류별)
//   /sitemap.xml        이미지 사이트맵 포함
//   /robots.txt         검색엔진·AI 크롤러 허용
//   /llms.txt           AI 답변 서비스용 요약
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm';
import { POSTS } from '../content/posts.mjs';
import { SEASONS, CATEGORY_PAGES } from '../content/seasons.mjs';
import { MONTHLY } from '../content/monthly.mjs';
import { GUIDES } from '../content/guides.mjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const BASE = (process.argv[2] || process.env.SITE_URL || 'https://ohopl.com').replace(/\/$/, '');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const a = html.indexOf('const TYPES = {'), b = html.indexOf('const VACANTS');
const g = html.indexOf('const GALLERY = {'), ge = html.indexOf('};', g) + 2;
const code = html.slice(a, b) + '\n' + html.slice(g, ge) + '\n;({TYPES, WORKS, HIDDEN_WORKS, FAITH_WORKS, TOOL_WORKS, PLACES, THUMBS:[...THUMBS], GALLERY, MOODS: typeof MOODS!=="undefined"?MOODS:[]})';
const D = vm.runInNewContext(code, {});
const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); // 한국 날짜
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SLUG = {PLAY:'play', USE:'tools', CREATE:'create', LEARN:'learn', EXPLORE:'explore'};
const APPCAT = {PLAY:'GameApplication', USE:'UtilitiesApplication', CREATE:'DesignApplication', LEARN:'EducationalApplication', EXPLORE:'EntertainmentApplication'};
const PLACE = w => w.place && D.PLACES[w.place] ? `${D.PLACES[w.place].area || '도구 섬'} · ${D.PLACES[w.place].name}` : ({'광장':'분수 광장','큰길':'큰길','골목':'골목','숨은 곳':'마을 숨은 곳','도구 섬':'도구 섬','큰길 끝':'큰길 끝'}[w.zone] || w.zone);
const works = [...D.WORKS, ...D.HIDDEN_WORKS, ...D.FAITH_WORKS, ...D.TOOL_WORKS, D.GALLERY].filter(w => !w.vacant && !w.soon && w.url);
const thumb = w => D.THUMBS.includes(w.id) ? `${BASE}/thumbs/${w.id}.webp` : null;
const pageUrl = w => `${BASE}/w/${w.id}/`;
const byIdW = Object.fromEntries(works.map(w => [w.id, w]));
const posts = POSTS.filter(p => p.date <= today).sort((a, b) => b.date.localeCompare(a.date));
const postUrl = p => `${BASE}/posts/${p.slug}/`;
const postsFor = id => posts.filter(p => (p.sections || []).some(s => (s.picks || []).some(([pid]) => pid === id)));
const kdate = d => { const [y, m, dd] = d.split('-').map(Number); return `${y}년 ${m}월 ${dd}일`; };
const hostOf = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };

const CSS = `.facts{display:grid;gap:0;margin:12px 0 20px;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--card)}.facts div{display:grid;grid-template-columns:110px 1fr;gap:10px;padding:9px 14px;border-top:1px solid var(--line)}.facts div:first-child{border-top:0}.facts dt{font-weight:700;font-size:14px}.facts dd{margin:0;font-size:14px;color:var(--fg)}
.picker{display:grid;gap:12px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px;margin:16px 0}.picker fieldset{border:0;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:8px}.picker legend{font-weight:700;margin-bottom:6px;width:100%}.picker label{border:1px solid var(--line);border-radius:999px;padding:6px 12px;cursor:pointer;font-size:14px}.picker label:has(input:checked){background:var(--accent);color:#fff;border-color:var(--accent)}.picker input{position:absolute;opacity:0;pointer-events:none}
.answer{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:12px;padding:12px 16px}.tbl{overflow-x:auto;margin:16px 0}.tbl table{border-collapse:collapse;width:100%;min-width:420px;font-size:14px}.tbl th,.tbl td{border-bottom:1px solid var(--line);padding:8px 10px;text-align:left;vertical-align:top}.tbl thead th{background:var(--card)}
.mpicks{display:grid;gap:12px;margin:12px 0 20px}.mpick{display:grid;grid-template-columns:160px 1fr;gap:14px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:10px;text-decoration:none;color:var(--fg)}.mpick img{width:100%;height:auto;border-radius:10px}.mpick p{margin:4px 0 0;color:var(--muted);font-size:14px}@media(max-width:480px){.mpick{grid-template-columns:110px 1fr}}.rules{display:grid;gap:12px;padding-left:20px}.rules p{margin:4px 0 0;color:var(--muted)}.mlist{list-style:none;padding:0;display:grid;gap:12px}.mlist p{margin:4px 0 0;color:var(--muted)}
.fhub{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin:0 0 16px}.fhub div{display:flex;flex-direction:column;gap:4px}.fhub b{font-size:13px;margin-bottom:2px}.fhub a{font-size:13px;color:var(--muted);text-decoration:none}.fhub a:hover{text-decoration:underline}
.trust{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin:22px 0}.trust div{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 14px}.trust b{font-size:14px}.trust p{margin:4px 0 0;font-size:13px;color:var(--muted)}
.moods{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin:14px 0 22px}.moods a{display:flex;flex-direction:column;gap:2px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 14px;text-decoration:none;color:var(--fg)}.moods a span{font-size:22px}.moods a small{color:var(--muted);font-size:12px}
.wgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin:14px 0 22px}.wgrid a{text-decoration:none;color:var(--fg);font-size:13px}.wgrid img{width:100%;height:auto;border-radius:10px;display:block;margin-bottom:4px}
.shots{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin:18px 0}.shots figure{margin:0}.shots img{width:100%;height:auto;border-radius:14px;display:block}.shots figcaption{font-size:13px;color:var(--muted);margin-top:6px}
:root{--bg:#fbf8f2;--fg:#1d2033;--muted:#5d6278;--card:#ffffff;--line:#e7e1d6;--accent:#f26a2e}
@media (prefers-color-scheme:dark){:root{--bg:#141626;--fg:#eef0f8;--muted:#a7acc2;--card:#1d2036;--line:#2c3050;--accent:#ff8a52}}
*{box-sizing:border-box}body{word-break:keep-all;overflow-wrap:anywhere;margin:0;background:var(--bg);color:var(--fg);font:16px/1.7 'IBM Plex Sans KR',system-ui,sans-serif}
a{color:inherit}.wrap{max-width:860px;margin:0 auto;padding:20px max(16px,env(safe-area-inset-left)) 48px}
.top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:22px}
.logo{font-family:'Jua',system-ui;font-size:24px;text-decoration:none}.logo small{font-family:'IBM Plex Sans KR';font-size:13px;color:var(--muted);margin-left:6px}
.crumb{font-size:13px;color:var(--muted)}.crumb a{text-decoration:none}
h1{font-family:'Jua',system-ui;font-weight:400;font-size:clamp(30px,6vw,44px);line-height:1.2;margin:6px 0 10px;text-wrap:balance}
h2{font-family:'Jua',system-ui;font-weight:400;font-size:24px;margin:34px 0 10px}
.chips{display:flex;gap:6px;flex-wrap:wrap}.chip{font-size:13px;font-weight:700;border-radius:999px;padding:3px 10px;background:var(--card);border:1px solid var(--line)}
.shot{width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;border-radius:18px;border:1px solid var(--line);background:var(--card);margin:18px 0}
.lead{font-size:18px}.btns{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0}
.btn{display:inline-block;border-radius:999px;padding:12px 22px;font-weight:700;text-decoration:none;background:var(--accent);color:#fff}.btn.ghost{background:var(--card);color:var(--fg);border:1px solid var(--line)}
dl{display:grid;grid-template-columns:auto 1fr;gap:6px 16px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 18px;margin:0}dt{color:var(--muted)}dd{margin:0;min-width:0}
.faq details{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 16px;margin:8px 0}.faq summary{font-weight:700;cursor:pointer}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}.item{display:block;background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden;text-decoration:none}
.item img,.item .ph{width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;display:block;background:#e8e2d6}.item .ph{display:grid;place-items:center;font-family:'Jua';font-size:44px;color:#fff}
.item b{display:block;padding:10px 12px 2px}.item span{display:block;padding:0 12px 12px;font-size:13px;color:var(--muted)}
footer{margin-top:44px;font-size:13px;color:var(--muted)}
.pick{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px 18px;margin:14px 0}.pick h3{margin:0 0 6px;font-size:20px}.pick h3 a{text-decoration:none}.pick .shot{margin:8px 0}
.postlist{list-style:none;padding:0}.postlist li{padding:14px 0;border-bottom:1px solid var(--line)}.postlist a{text-decoration:none;font-size:18px}`;
const COLORS = {PLAY:'#7b5cff', USE:'#13a17d', CREATE:'#ef4680', LEARN:'#2b8fd6', EXPLORE:'#f28c17'};
const head = (title, desc, url, img, ld) => `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:site_name" content="오호플"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${img}"><meta property="og:locale" content="ko_KR">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${img}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="alternate" type="application/rss+xml" title="오호플 발견 노트" href="/rss.xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jua&family=IBM+Plex+Sans+KR:wght@400;700&display=swap">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g,'\\u003c')}</script>
<style>${CSS}</style></head><body><div class="wrap">
<header class="top"><a class="logo" href="/">오호플<small>오늘의 호기심 플레이</small></a><nav class="btns" style="margin:0"><a class="btn ghost" href="/about/">소개</a><a class="btn ghost" href="/posts/">발견 노트</a><a class="btn ghost" href="/works/">작품 전체</a></nav></header>`;
const TRUST = `<div class="trust"><div><b>직접 해 보고 골라요</b><p>운영자가 작품을 직접 열어 보고, 해 볼 만한 것만 소개해요.</p></div><div><b>휴대폰에서 되는지 확인해요</b><p>설치 없이 브라우저에서 열리는지, 휴대폰에서도 되는지 보고 알아둘 점에 적어요.</p></div><div><b>제작자가 원하면 바로 내려요</b><p>소개된 작품은 각 제작자가 운영해요. 내려 달라고 하면 바로 내려요.</p></div></div>`;
const foot = `<footer><nav class="fhub"><div><b>분류</b><a href="/works/play/">놀이(웹게임)</a><a href="/works/tools/">도구</a><a href="/works/create/">만들기</a><a href="/works/learn/">배우기</a><a href="/works/explore/">탐험</a><a href="/works/">작품 전체</a></div><div><b>시즌</b><a href="/season/christmas/">크리스마스에 할 것</a><a href="/season/winter-break/">겨울방학에 할 것</a><a href="/season/new-year/">새해에 할 것</a></div><div><b>읽을거리</b><a href="/guide/">가이드</a><a href="/posts/">발견 노트</a><a href="/monthly/">이달의 오호플</a><a href="/gallery/">동물 미술관</a></div><div><b>오호플</b><a href="/about/">오호플이란?</a><a href="/about/policy/">큐레이션 원칙</a><a href="/">3D 마을 들어가기</a><a href="https://www.youtube.com/channel/UCvJzrFknk4V-WiTaJlCkZTQ" rel="me noopener">유튜브 오호아재</a><a href="https://blog.naver.com/mandubird/224482662045" rel="me noopener">네이버 블로그</a></div></nav><p>오호플은 AI로 만든 게임·도구·웹서비스를 직접 써 보고 골라 소개하는 3D 창작 마을이에요. 소개된 작품은 각 제작자가 운영하며, 제작자가 원하지 않으면 바로 내려요.</p><p>문의·작품 소개 신청 eunhaebleu@naver.com · © 2026 오호플</p></footer></div></body></html>`;
const card = w => { const T = D.TYPES[w.type], t = thumb(w);
  return `<a class="item" href="/w/${w.id}/">${t ? `<img src="${t}" alt="${esc(w.name)} 첫 화면 · 오호플" loading="lazy" width="640" height="480">` : `<div class="ph" style="background:${COLORS[w.type]}">${esc(w.name.replace(/[^가-힣A-Za-z0-9]/g,'').slice(0,1))}</div>`}<b>${esc(w.name)}</b><span>${T.ko} · ${esc(w.desc.slice(0, 46))}${w.desc.length > 46 ? '…' : ''}</span></a>`; };

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
    {'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'오호플','item':BASE+'/'},{'@type':'ListItem','position':2,'name':'작품 목록','item':BASE+'/works/'},{'@type':'ListItem','position':3,'name':T.ko,'item':`${BASE}/works/${SLUG[w.type]}/`},{'@type':'ListItem','position':4,'name':w.name,'item':url}]},
    {'@type':'FAQPage','mainEntity':qa.map(([q,a])=>({'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':a}}))}]};
  const related = works.filter(x => x.type === w.type && x.id !== w.id).slice(0, 6);
  const body = `<p class="crumb"><a href="/">오호플</a> › <a href="/works/">작품 목록</a> › <a href="/works/${SLUG[w.type]}/">${T.ko}</a></p>
<h1>${esc(w.name)}</h1><div class="chips"><span class="chip">${T.ko}</span><span class="chip">${esc(PLACE(w))}</span>${w.featured ? '<span class="chip">이번 주 광장</span>' : ''}</div>
${thumb(w) ? `<img class="shot" src="${thumb(w)}" alt="오호플이 고른 ${esc(w.name)} 첫 화면: ${esc(w.desc.slice(0, 60))}" width="640" height="480">` : ''}
<p class="lead">${esc(w.desc)}</p>
<div class="btns"><a class="btn" href="${esc(w.url)}" rel="noopener" target="_blank">${esc(w.name)} 열기 ↗</a><a class="btn ghost" href="/#w-${w.id}">3D 마을에서 보기</a></div>
<h2>한눈에 보기</h2><dl><dt>종류</dt><dd>${T.ko}</dd><dt>마을 위치</dt><dd>${esc(PLACE(w))}</dd><dt>주소</dt><dd>${esc(hostOf(w.url))}</dd>${w.share ? `<dt>오호플 추천</dt><dd>${esc(w.share)}</dd>` : ''}${w.note ? `<dt>알아둘 점</dt><dd>${esc(w.note)}</dd>` : ''}</dl>
<h2>자주 묻는 질문</h2><div class="faq">${qa.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
${postsFor(w.id).length ? `<h2>이 작품이 소개된 글</h2><ul>${postsFor(w.id).map(p => `<li><a href="/posts/${p.slug}/">${esc(p.title)}</a></li>`).join('')}</ul>` : ''}
${related.length ? `<h2>비슷한 ${T.ko} 작품</h2><div class="grid">${related.map(card).join('')}</div>` : ''}`;
  fs.mkdirSync(path.join(ROOT, 'w', w.id), {recursive:true});
  fs.writeFileSync(path.join(ROOT, 'w', w.id, 'index.html'), head(title, desc, url, img, ld) + body + TRUST + foot);
}

// 작품 목록
const order = ['PLAY', 'USE', 'CREATE', 'LEARN', 'EXPLORE'];
const listLd = {'@context':'https://schema.org','@graph':[{'@type':'CollectionPage','@id':BASE+'/works/','url':BASE+'/works/','name':'오호플 작품 전체 목록','inLanguage':'ko','isPartOf':{'@id':BASE+'/#website'}},
  {'@type':'ItemList','name':'오호플이 고른 AI 창작 작품','numberOfItems':works.length,'itemListElement':works.map((w,i)=>({'@type':'ListItem','position':i+1,'url':pageUrl(w),'name':w.name}))}]};
fs.mkdirSync(path.join(ROOT, 'works'), {recursive:true});
fs.writeFileSync(path.join(ROOT, 'works', 'index.html'), head('오호플 작품 전체 목록 — AI로 만든 게임·도구·웹서비스', `오호플이 직접 써 보고 고른 ${works.length}개 작품. 놀이, 도구, 만들기, 배우기, 탐험으로 나눠 봤어요. 모두 설치 없이 브라우저에서 바로.`, BASE+'/works/', BASE+'/og-image.png', listLd)
  + `<h1>작품 전체 목록</h1><p class="lead">오호플이 직접 써 보고 고른 ${works.length}개 작품이에요. 모두 설치 없이 브라우저에서 바로 열 수 있어요.</p><p class="crumb">${today} 업데이트</p>`
  + order.map(k => { const L = works.filter(w => w.type === k); return L.length ? `<h2 id="${SLUG[k]}"><a href="/works/${SLUG[k]}/">${D.TYPES[k].ko}</a> <small>${L.length}개 · <a href="/works/${SLUG[k]}/">모아 보기</a></small></h2><div class="grid">${L.map(card).join('')}</div>` : ''; }).join('') + foot);

// 발견 노트(블로그)
fs.rmSync(path.join(ROOT, 'posts'), {recursive:true, force:true});
const pick = id => byIdW[id];
for (const p of posts) {
  const url = postUrl(p), ids = p.sections.flatMap(s => (s.picks || []).map(([id]) => id)).filter(pick);
  const img = (ids.map(id => thumb(pick(id))).find(Boolean)) || `${BASE}/og-image.png`;
  const title = `${p.title} | 오호플 발견 노트`;
  const ld = {'@context':'https://schema.org','@graph':[
    {'@type':'BlogPosting','@id':url+'#post','headline':p.title,'description':p.desc,'datePublished':p.date,'dateModified':p.date,'inLanguage':'ko','image':img,'keywords':p.kw.join(', '),'mainEntityOfPage':url,'author':{'@type':'Organization','name':'오호플','url':BASE+'/'},'publisher':{'@id':BASE+'/#org'},
      ...(ids.length?{'mentions':ids.map(id=>({'@type':'WebApplication','name':pick(id).name,'url':pick(id).url}))}:{})},
    {'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'오호플','item':BASE+'/'},{'@type':'ListItem','position':2,'name':'발견 노트','item':BASE+'/posts/'},{'@type':'ListItem','position':3,'name':p.title,'item':url}]},
    ...(ids.length?[{'@type':'ItemList','name':p.title,'itemListElement':ids.map((id,i)=>({'@type':'ListItem','position':i+1,'url':pageUrl(pick(id)),'name':pick(id).name}))}]:[]),
    ...(p.faq&&p.faq.length?[{'@type':'FAQPage','mainEntity':p.faq.map(([q,a])=>({'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':a}}))}]:[])]};
  const sec = s => `<h2>${esc(s.h)}</h2>` + (s.text ? s.text.map(t => `<p>${esc(t)}</p>`).join('') : '') + (s.picks ? s.picks.filter(([id]) => pick(id)).map(([id, line]) => { const w = pick(id), t = thumb(w);
    return `<article class="pick"><h3><a href="/w/${w.id}/">${esc(w.name)}</a> <small class="chip">${D.TYPES[w.type].ko}</small></h3>${t ? `<a href="/w/${w.id}/"><img class="shot" src="${t}" alt="${esc(w.name)} 첫 화면 · 오호플" loading="lazy" width="640" height="480"></a>` : ''}<p>${esc(w.desc)}</p>${line ? `<p><b>오호플 한 줄</b> ${esc(line)}</p>` : ''}${w.note ? `<p class="crumb">알아둘 점: ${esc(w.note)}</p>` : ''}<div class="btns"><a class="btn" href="${esc(w.url)}" rel="noopener" target="_blank">열기 ↗</a><a class="btn ghost" href="/w/${w.id}/">자세히</a></div></article>`; }).join('') : '');
  const near = posts.filter(x => x.slug !== p.slug).slice(0, 4);
  const body = `<p class="crumb"><a href="/">오호플</a> › <a href="/posts/">발견 노트</a> › ${esc(p.tag)}</p><h1>${esc(p.title)}</h1><p class="crumb"><time datetime="${p.date}">${kdate(p.date)}</time> · 오호플</p>
${p.intro.map(t => `<p class="lead">${esc(t)}</p>`).join('')}${p.sections.map(sec).join('')}${p.outro ? `<p>${esc(p.outro)}</p>` : ''}
${p.faq && p.faq.length ? `<h2>자주 묻는 질문</h2><div class="faq">${p.faq.map(([q, a]) => `<details open><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>` : ''}
<div class="btns"><a class="btn" href="/">3D 마을에서 직접 찾아보기</a></div>
${near.length ? `<h2>다른 발견 노트</h2><ul>${near.map(x => `<li><a href="/posts/${x.slug}/">${esc(x.title)}</a> <span class="crumb">${kdate(x.date)}</span></li>`).join('')}</ul>` : ''}`;
  fs.mkdirSync(path.join(ROOT, 'posts', p.slug), {recursive:true});
  fs.writeFileSync(path.join(ROOT, 'posts', p.slug, 'index.html'), head(title, p.desc, url, img, ld).replace('<meta name="description"', `<meta name="keywords" content="${esc(p.kw.join(', '))}"><meta property="article:published_time" content="${p.date}"><meta name="description"`) + body + foot);
}
{
  const ld = {'@context':'https://schema.org','@graph':[{'@type':'Blog','@id':BASE+'/posts/','url':BASE+'/posts/','name':'오호플 발견 노트','inLanguage':'ko','publisher':{'@id':BASE+'/#org'},'blogPost':posts.map(p=>({'@type':'BlogPosting','headline':p.title,'url':postUrl(p),'datePublished':p.date}))}]};
  fs.mkdirSync(path.join(ROOT, 'posts'), {recursive:true});
  fs.writeFileSync(path.join(ROOT, 'posts', 'index.html'), head('오호플 발견 노트 — 무료 웹게임·웹 도구·신기한 사이트 추천', '오호플이 고른 무료 웹게임, 설치 없는 웹 도구, 신기한 사이트를 주제별로 정리한 글 모음이에요.', BASE+'/posts/', BASE+'/og-image.png', ld)
    + `<h1>발견 노트</h1><p class="lead">오호플이 고른 작품을 주제별로 정리한 글이에요. 하고 싶은 일에 맞는 웹게임과 도구를 찾아보세요.</p><h2 id="season">시즌 추천</h2><ul>${SEASONS.map(S => `<li><a href="/season/${S.slug}/">${esc(S.title)}</a> <span class="crumb">${esc(S.period)}</span></li>`).join('')}</ul><h2>최근 글</h2><ul class="postlist">${posts.map(p => `<li><a href="/posts/${p.slug}/"><b>${esc(p.title)}</b></a><br><span class="crumb">${kdate(p.date)} · ${esc(p.tag)} — ${esc(p.desc)}</span></li>`).join('')}</ul>` + foot);
}





// 오호플 한눈에 보기: AI가 그대로 옮겨 쓰기 좋은 사실 목록 (소개 페이지 맨 위 + 첫 페이지)
const FACTS = () => [
  ['정식 이름', '오호플 (OHOPL · 오늘의 호기심 플레이)'],
  ['한 줄 소개', 'AI로 만든 게임·웹 도구·신기한 웹사이트를 직접 써 보고 골라 모은 3D 창작 마을'],
  ['주소', 'ohopl.com'],
  ['시작', '2026년 11월'],
  ['소개한 작품', `${works.length}곳 (놀이 ${works.filter(w=>w.type==='PLAY').length} · 도구 ${works.filter(w=>w.type==='USE').length} · 만들기 ${works.filter(w=>w.type==='CREATE').length} · 배우기 ${works.filter(w=>w.type==='LEARN').length} · 탐험 ${works.filter(w=>w.type==='EXPLORE').length})`],
  ['이용', '무료 · 회원가입 없음 · 앱 설치 없이 휴대폰·PC 브라우저에서'],
  ['마을 구성', '분수 광장 · 큰길 · 놀이 섬 · 도구 섬 · 서쪽·동쪽 골목 · 성소 언덕'],
  ['고르는 기준', '운영자가 직접 열어 확인한 작품만, 제작자가 원하면 바로 내림'],
  ['운영', '블루루반 (문의 eunhaebleu@naver.com)'],
  ['유튜브', '오호아재 — 오호플 작품을 직접 해 보는 채널'],
];
const factsHtml = () => `<dl class="facts">${FACTS().map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
let SITE_FAQ = [];
const SHOTS = [
  ['village-aerial','오호플 3D 창작 마을 전체 모습 — 분수 광장과 골목, 놀이 섬으로 가는 무지개 다리'],
  ['plaza','오호플 분수 광장 — 이번 주 추천 작품 포털과 가게들'],
  ['play-island','오호플 놀이 섬 — 회전목마를 둘러싼 웹게임 가게들'],
  ['tool-island','오호플 도구 섬 — AI 연구소, 생산성 센터와 아이디어의 나무'],
  ['night-village','밤의 오호플 마을 — 가로등이 켜진 분수 광장과 큰길'],
];
// 오호플 소개 페이지 (/about/): "오호플이 뭐야?"에 바로 답하는 정의 페이지
{
  const url = BASE + '/about/';
  const n = works.length, byType = k => works.filter(w => w.type === k).length;
  const faq = [
    ['오호플이 뭐예요?', `오호플(OHOPL, 오늘의 호기심 플레이)은 AI로 만든 게임, 웹 도구, 신기한 웹사이트를 운영자가 직접 써 보고 골라 3D 마을에 모아 둔 큐레이션 사이트예요. ${n}개 작품을 설치 없이 브라우저에서 바로 열 수 있어요.`],
    ['오호플은 무료인가요?', '네. 오호플 마을과 작품 소개는 무료이고 회원가입도 없어요. 작품마다 유료 기능이 있으면 작품 소개의 알아둘 점에 적어 두었어요.'],
    ['오호플에는 어떤 작품이 있나요?', `놀이(웹게임) ${byType('PLAY')}개, 도구 ${byType('USE')}개, 만들기 ${byType('CREATE')}개, 배우기 ${byType('LEARN')}개, 탐험(3D·인터랙티브) ${byType('EXPLORE')}개가 있어요. 놀이는 놀이 섬, 도구는 도구 섬, 만들기·배우기는 서쪽 골목, 탐험은 동쪽 골목에 모여 있어요.`],
    ['오호플은 누가 운영하나요?', '1인 크리에이터 블루루반이 운영해요. 유튜브 오호아재 채널에서 작품을 직접 해 보는 영상도 올려요. 문의는 eunhaebleu@naver.com 이에요.'],
    ['내 작품도 오호플에 소개될 수 있나요?', '네. 설치 없이 브라우저에서 바로 열리는 작품이면 eunhaebleu@naver.com 으로 주소를 보내 주세요. 직접 써 보고 골라 소개해요. 소개를 원하지 않으면 바로 내려요.'],
  ];
  SITE_FAQ = faq;
  const ld = {'@context':'https://schema.org','@graph':[
    {'@type':'AboutPage','@id':url,'url':url,'name':'오호플이란? — 오늘의 호기심 플레이','inLanguage':'ko','image':SHOTS.map(([f,alt])=>({'@type':'ImageObject','contentUrl':`${BASE}/img/ohopl-${f}.webp`,'caption':alt,'name':alt})),'isPartOf':{'@id':BASE+'/#website'},'about':{'@id':BASE+'/#org'},'dateModified':today},
    {'@type':'FAQPage','mainEntity':faq.map(([q,a])=>({'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':a}}))}]};
  const body = `<main><h1>오호플이란?</h1>
<p class="lead"><b>오호플(OHOPL · 오늘의 호기심 플레이)</b>은 AI로 만든 게임, 웹 도구, 신기한 웹사이트를 운영자가 직접 써 보고 골라 소개하는 <b>3D 창작 마을</b>이에요. 동물 캐릭터로 마을을 걸으며 가게 문을 열면 작품이 열려요.</p>
<h2>오호플 한눈에 보기</h2>${factsHtml()}
<div class="shots">${SHOTS.map(([f,alt])=>`<figure><img src="/img/ohopl-${f}.webp" alt="${esc(alt)}" width="1200" height="900" loading="lazy"><figcaption>${esc(alt)}</figcaption></figure>`).join('')}</div>
<h2>이럴 때 오호플</h2><div class="moods">${(D.MOODS||[]).map(m=>`<a href="${m.href}"><span>${m.e}</span><b>${esc(m.t)}</b><small>${esc(m.s)}</small></a>`).join('')}</div>
<h2>오호플이 작품을 고르는 방법</h2>${TRUST}<p><a href="/about/policy/">큐레이션 원칙 자세히 보기 →</a></p>
<h2>마을 구성</h2><ul>
<li><b>분수 광장</b> — 이번 주 가장 반응 좋은 작품 4개가 포털로 열려 있어요.</li>
<li><b>큰길</b> — 반응이 쌓여 이사 온 인기 가게예요.</li>
<li><b>놀이 섬</b> — 웹게임이 모인 섬. 서쪽 골목 끝 무지개 다리를 건너면 회전목마가 돌아요.</li>
<li><b>도구 섬</b> — PDF·한글 파일·여행 준비처럼 쓸모 있는 웹 도구가 모인 섬이에요.</li>
<li><b>서쪽 골목</b> — 만들기·배우기, <b>동쪽 골목</b> — 3D·인터랙티브 탐험 작품이에요.</li>
<li><b>성소 언덕</b> — 온라인 교회·성당·절이 있는 조용한 곳이에요.</li></ul>

<h2>오호플이 고른 작품 ${works.filter(w=>thumb(w)).length}곳</h2><div class="wgrid">${works.filter(w=>thumb(w)).map(w=>`<a href="/w/${w.id}/"><img src="${thumb(w)}" alt="오호플이 고른 ${esc(w.name)} — ${esc(D.TYPES[w.type].ko)}" width="640" height="480" loading="lazy"><span>${esc(w.name)}</span></a>`).join('')}</div>
<p class="btns"><a class="btn" href="/">3D 마을 들어가기</a><a class="btn ghost" href="/works/">작품 전체 목록</a><a class="btn ghost" href="/posts/">발견 노트</a><a class="btn ghost" href="https://www.youtube.com/channel/UCvJzrFknk4V-WiTaJlCkZTQ" rel="me noopener" target="_blank">유튜브 오호아재</a><a class="btn ghost" href="https://blog.naver.com/mandubird/224482662045" rel="me noopener" target="_blank">만든 이야기(블로그)</a></p>
<h2>자주 묻는 질문</h2><div class="faq">${faq.map(([q, a]) => `<details open><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></main>`;
  fs.mkdirSync(path.join(ROOT, 'about'), {recursive: true});
  fs.writeFileSync(path.join(ROOT, 'about', 'index.html'), head('오호플이란? — AI로 만든 게임·도구를 골라 모은 3D 창작 마을', `오호플(OHOPL, 오늘의 호기심 플레이)은 AI로 만든 웹게임·웹 도구·신기한 사이트 ${n}개를 직접 써 보고 골라 모은 3D 마을이에요. 무료, 설치 없이 브라우저에서.`, url, BASE + '/img/ohopl-village-aerial.webp', ld) + body + foot);
}

// 큐레이션 원칙 (/about/policy/)
{
  const url = BASE + '/about/policy/';
  const rules = [
    ['직접 열어 보고 고릅니다', '모든 작품은 운영자가 브라우저에서 직접 열어 첫 화면까지 확인한 뒤 소개해요. 원본 주소가 열리지 않으면 소개하지 않아요.'],
    ['설치 없이 되는 것만', '앱 설치나 프로그램 다운로드가 필요한 작품은 소개하지 않아요. 휴대폰에서 안 되는 작품은 그렇다고 알아둘 점에 적어요.'],
    ['확인한 것과 못 한 것을 구분합니다', '무료 여부, 로그인, 지원 기기, 언어처럼 확인한 사실만 적고, 확인하지 못한 내용은 단정하지 않아요.'],
    ['제외하는 작품', '도박·성인 요소, 광고나 제휴 링크가 중심인 서비스, 잘 알려진 게임을 그대로 베낀 작품은 소개하지 않아요.'],
    ['분류와 자리', '작품은 놀이·도구·만들기·배우기·탐험 중 하나로 분류해 마을의 정해진 구역에 들어가요. 반응이 쌓이면 큰길로, 매주 반응 상위 4곳은 분수 광장 포털로 옮겨요.'],
    ['제작자가 원하면 바로 내립니다', '소개된 작품은 각 제작자가 운영해요. 제작자가 원하지 않거나 원본이 닫히면 바로 내려요. eunhaebleu@naver.com'],
    ['돈을 받고 순서를 바꾸지 않습니다', '오호플은 작품 소개나 자리 배치를 돈을 받고 정하지 않아요.'],
  ];
  const ld = {'@context':'https://schema.org','@type':'WebPage','@id':url,'url':url,'name':'오호플 큐레이션 원칙','inLanguage':'ko','isPartOf':{'@id':BASE+'/#website'},'publisher':{'@id':BASE+'/#org'},'dateModified':today};
  const body = `<main><h1>오호플 큐레이션 원칙</h1><p class="lead">오호플은 AI로 만든 게임·도구·웹서비스를 아래 원칙으로 골라 소개해요.</p>${TRUST}<ol class="rules">${rules.map(([h,p])=>`<li><b>${esc(h)}</b><p>${esc(p)}</p></li>`).join('')}</ol><p class="btns"><a class="btn" href="/about/">오호플이란?</a><a class="btn ghost" href="/works/">작품 전체 목록</a></p></main>`;
  fs.mkdirSync(path.join(ROOT, 'about', 'policy'), {recursive: true});
  fs.writeFileSync(path.join(ROOT, 'about', 'policy', 'index.html'), head('오호플 큐레이션 원칙 — 작품을 고르고 소개하는 기준', '오호플이 AI로 만든 게임·도구·웹서비스를 고르는 기준: 직접 열어 확인, 설치 없는 작품만, 확인한 사실만 기록, 제작자가 원하면 바로 내림.', url, BASE + '/og-image.png', ld) + body + foot);
}
// 이달의 오호플 (/monthly/<ym>/, /monthly/)
const monthly = MONTHLY.filter(m => m.date <= today).sort((a, b) => b.ym.localeCompare(a.ym));
for (const M of monthly) {
  const url = `${BASE}/monthly/${M.ym}/`;
  const picks = M.sections.flatMap(s => s.picks).map(([id]) => byIdW[id]).filter(Boolean);
  const img = picks.map(thumb).find(Boolean) || BASE + '/og-image.png';
  const ld = {'@context':'https://schema.org','@graph':[{'@type':'Article','@id':url+'#article','headline':M.title,'description':M.desc,'datePublished':M.date,'dateModified':M.date,'inLanguage':'ko','image':img,'author':{'@id':BASE+'/#org'},'publisher':{'@id':BASE+'/#org'},'mainEntityOfPage':url},
    {'@type':'ItemList','name':M.title,'itemListElement':picks.map((w,i)=>({'@type':'ListItem','position':i+1,'url':pageUrl(w),'name':w.name}))}]};
  const sec = M.sections.map(S => `<h2>${esc(S.h)}</h2><div class="mpicks">${S.picks.map(([id, line]) => { const w = byIdW[id]; if (!w) return ''; const t = thumb(w); return `<a class="mpick" href="/w/${w.id}/">${t ? `<img src="${t}" alt="오호플이 고른 ${esc(w.name)} 첫 화면" width="640" height="480" loading="lazy">` : ''}<div><b>${esc(w.name)}</b><p>${esc(line)}</p></div></a>`; }).join('')}</div>`).join('');
  const body = `<main><p class="crumb"><a href="/monthly/">이달의 오호플</a> · ${kdate(M.date)}</p><h1>${esc(M.title)}</h1>${M.intro.map(p=>`<p class="lead">${esc(p)}</p>`).join('')}${sec}<h2>이달의 마을 소식</h2><ul>${M.news.map(n=>`<li>${esc(n)}</li>`).join('')}</ul><p class="btns"><a class="btn" href="/">3D 마을 들어가기</a><a class="btn ghost" href="/monthly/">지난 달 보기</a></p></main>`;
  fs.mkdirSync(path.join(ROOT, 'monthly', M.ym), {recursive: true});
  fs.writeFileSync(path.join(ROOT, 'monthly', M.ym, 'index.html'), head(`${M.title} | 오호플`, M.desc, url, img, ld) + body + foot);
}
{
  const url = BASE + '/monthly/';
  const ld = {'@context':'https://schema.org','@type':'CollectionPage','@id':url,'url':url,'name':'이달의 오호플','inLanguage':'ko','isPartOf':{'@id':BASE+'/#website'}};
  const body = `<main><h1>이달의 오호플</h1><p class="lead">매달 오호플 마을에 새로 들어온 작품과 가장 반응이 좋았던 작품, 마을 소식을 정리해요.</p><ul class="mlist">${monthly.map(M=>`<li><a href="/monthly/${M.ym}/"><b>${esc(M.title)}</b></a><p>${esc(M.desc)}</p></li>`).join('')}</ul></main>`;
  fs.mkdirSync(path.join(ROOT, 'monthly'), {recursive: true});
  fs.writeFileSync(path.join(ROOT, 'monthly', 'index.html'), head('이달의 오호플 — 매달 새로 들어온 웹게임·웹 도구 정리', '매달 오호플에 새로 들어온 작품, 반응 1위 작품, 마을 소식을 정리한 월간 기록이에요.', url, BASE + '/og-image.png', ld) + body + foot);
}
const urls = [{loc:BASE+'/', imgs:[[BASE+'/og-image.png','오호플 OHOPL · 오늘의 호기심 플레이'], ...SHOTS.map(([f,alt])=>[`${BASE}/img/ohopl-${f}.webp`,alt])]}, {loc:BASE+'/about/', imgs:SHOTS.map(([f,alt])=>[`${BASE}/img/ohopl-${f}.webp`,alt]).concat(works.filter(w=>thumb(w)).map(w=>[thumb(w),`오호플이 고른 ${w.name}`]))}, {loc:BASE+'/works/'}, {loc:BASE+'/posts/'}, {loc:BASE+'/guide/'}, {loc:BASE+'/season/christmas/pick/'}, ...GUIDES.map(G=>({loc:`${BASE}/guide/${G.slug}/`})), {loc:BASE+'/about/policy/'}, {loc:BASE+'/monthly/'}, ...monthly.map(M=>({loc:`${BASE}/monthly/${M.ym}/`, last:M.date})), ...posts.map(p => ({loc:postUrl(p), last:p.date})), ...SEASONS.map(S => ({loc:`${BASE}/season/${S.slug}/`})), ...Object.entries(CATEGORY_PAGES).filter(([k]) => works.some(w => w.type === k)).map(([k, C]) => ({loc:`${BASE}/works/${C.slug}/`})), {loc:BASE+'/gallery/'}, ...works.filter(w=>w.id!=='gallery').map(w => ({loc:pageUrl(w), img:thumb(w), t:w.name+' 첫 화면'}))];
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`
  + urls.map(u => `  <url><loc>${u.loc}</loc><lastmod>${u.last || today}</lastmod>${(u.imgs || (u.img ? [[u.img, u.t]] : [])).map(([i, t]) => `<image:image><image:loc>${i}</image:loc><image:title>${esc(t)}</image:title></image:image>`).join('')}</url>`).join('\n') + '\n</urlset>\n');

// 공통: 작품 소개 블록
const pickBlock = ([id, line]) => { const w = byIdW[id]; if (!w) return ''; const t = thumb(w);
  return `<article class="pick"><h3><a href="/w/${w.id}/">${esc(w.name)}</a> <small class="chip">${D.TYPES[w.type].ko}</small></h3>${t ? `<a href="/w/${w.id}/"><img class="shot" src="${t}" alt="${esc(w.name)} 첫 화면 · 오호플" loading="lazy" width="640" height="480"></a>` : ''}<p>${esc(w.desc)}</p>${line ? `<p><b>오호플 한 줄</b> ${esc(line)}</p>` : ''}${w.note ? `<p class="crumb">알아둘 점: ${esc(w.note)}</p>` : ''}<div class="btns"><a class="btn" href="${esc(w.url)}" rel="noopener" target="_blank">열기 ↗</a><a class="btn ghost" href="/w/${w.id}/">자세히</a></div></article>`; };
const faqLd = faq => faq && faq.length ? [{'@type':'FAQPage','mainEntity':faq.map(([q,a])=>({'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':a}}))}] : [];
const faqHtml = faq => faq && faq.length ? `<h2>자주 묻는 질문</h2><div class="faq">${faq.map(([q, a]) => `<details open><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>` : '';

// 시즌 페이지 /season/<slug>/
fs.rmSync(path.join(ROOT, 'season'), {recursive:true, force:true});

// 정보 가이드 (/guide/<slug>/, /guide/)
for (const G of GUIDES) {
  const url = `${BASE}/guide/${G.slug}/`, ids = G.sections.flatMap(x => x.picks.map(([id]) => id)).filter(id => byIdW[id]);
  const img = ids.map(id => thumb(byIdW[id])).find(Boolean) || `${BASE}/og-image.png`;
  const faq = [[G.q || G.h1, G.answer], ...G.faq];
  const ld = {'@context':'https://schema.org','@graph':[
    {'@type':'Article','@id':url+'#article','headline':G.title,'description':G.desc,'inLanguage':'ko','dateModified':today,'image':img,'author':{'@id':BASE+'/#org'},'publisher':{'@id':BASE+'/#org'},'mainEntityOfPage':url,'keywords':G.kw.join(', ')},
    {'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'오호플','item':BASE+'/'},{'@type':'ListItem','position':2,'name':'가이드','item':BASE+'/guide/'},{'@type':'ListItem','position':3,'name':G.h1,'item':url}]},
    {'@type':'ItemList','name':G.title,'itemListElement':ids.map((id,i)=>({'@type':'ListItem','position':i+1,'url':pageUrl(byIdW[id]),'name':byIdW[id].name}))}, ...faqLd(faq)]};
  const table = G.table ? `<div class="tbl"><table><thead><tr>${G.table.head.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${G.table.rows.map(r=>`<tr>${r.map((c,i)=>i?`<td>${esc(c)}</td>`:`<th>${esc(c)}</th>`).join('')}</tr>`).join('')}</tbody></table></div>` : '';
  const others = GUIDES.filter(x => x.slug !== G.slug);
  const body = `<p class="crumb"><a href="/">오호플</a> › <a href="/guide/">가이드</a></p><h1>${esc(G.h1)}</h1><p class="crumb">${kdate(today)} 업데이트 · 오호플</p>
<p class="answer"><b>${esc(G.answer)}</b></p>${G.blocks.map(t=>`<p>${esc(t)}</p>`).join('')}${table}${G.sections.map(x => `<h2>${esc(x.h)}</h2>${x.picks.map(pickBlock).join('')}`).join('')}${faqHtml(faq)}
<div class="btns"><a class="btn" href="/">3D 마을에서 직접 찾아보기</a></div><h2>다른 가이드</h2><ul>${others.map(x => `<li><a href="/guide/${x.slug}/">${esc(x.title)}</a></li>`).join('')}</ul>`;
  fs.mkdirSync(path.join(ROOT, 'guide', G.slug), {recursive:true});
  fs.writeFileSync(path.join(ROOT, 'guide', G.slug, 'index.html'), head(`${G.title} | 오호플`, G.desc, url, img, ld).replace('<meta name="description"', `<meta name="keywords" content="${esc(G.kw.join(', '))}"><meta name="description"`) + body + foot);
}
{
  const url = BASE + '/guide/';
  const ld = {'@context':'https://schema.org','@type':'CollectionPage','@id':url,'url':url,'name':'오호플 가이드','inLanguage':'ko','isPartOf':{'@id':BASE+'/#website'}};
  const body = `<main><h1>오호플 가이드</h1><p class="lead">AI로 만든 게임, 브라우저 게임, 웹 도구에 대해 자주 묻는 것들을 정리했어요.</p><ul class="mlist">${GUIDES.map(G=>`<li><a href="/guide/${G.slug}/"><b>${esc(G.title)}</b></a><p>${esc(G.desc)}</p></li>`).join('')}</ul></main>`;
  fs.mkdirSync(path.join(ROOT, 'guide'), {recursive:true});
  fs.writeFileSync(path.join(ROOT, 'guide', 'index.html'), head('오호플 가이드 — AI 게임·브라우저 게임·웹 도구 알아보기', 'AI로 만든 게임이란? 브라우저 게임이란? 웹캠 게임, 무료 PDF 도구 비교까지 자주 묻는 질문에 답해요.', url, BASE + '/og-image.png', ld) + body + foot);
}

// 연말 모임 게임 뽑기 (/season/christmas/pick/): 인원·장소·분위기로 고르는 작은 도구
{
  const url = `${BASE}/season/christmas/pick/`;
  // p: together(한자리)/online(각자 집) · n: 2, mid(3~8), big(9+) · m: loud, funny, calm
  const C = [['imongu',['together','online'],['mid','big'],['loud','funny']],['kimbap',['online'],['mid','big'],['loud']],['mugunghwa',['online'],['mid','big'],['loud']],['domang',['online'],['2','mid'],['loud']],['smash',['online'],['mid','big'],['loud']],['gonfetti',['together','online'],['2','mid'],['loud','funny']],['hanjanhae',['online'],['2','mid'],['calm','funny']],['dontblink',['together','online'],['2'],['funny']],['fruitzip',['online'],['2','mid'],['calm']],['photobooth',['online'],['2','mid'],['funny']],['mangmang',['online'],['2','mid'],['calm']]]
    .filter(([id]) => byIdW[id]).map(([id,p,n,m]) => { const w = byIdW[id]; return {id, name:w.name, desc:w.desc, note:w.note||'', url:w.url, img:thumb(w), p, n, m}; });
  const faq = [['연말 모임에서 다 같이 할 수 있는 게임은?','한자리에 모였다면 휴대폰으로 방 코드에 들어오는 Gonfetti나 그림 맞히기 이뭔그가 좋아요. 각자 집에 있다면 단톡방 링크로 들어오는 김밥운동회, 무궁화 꽃이 피었습니다, 한잔해가 있어요.'],['설치나 가입이 필요한가요?','여기 나온 작품은 모두 앱 설치 없이 브라우저 링크로 시작해요. 로그인이 필요한 기능이 있으면 작품 소개에 적어 뒀어요.'],['몇 명까지 할 수 있나요?','작품마다 달라요. Gonfetti는 방 코드나 QR로 최대 8명이 들어오고 빈자리는 봇이 채워요. 다른 작품은 각 사이트 안내를 확인해 주세요.']];
  const ld = {'@context':'https://schema.org','@graph':[{'@type':'WebApplication','@id':url+'#app','name':'연말 모임 게임 뽑기','url':url,'applicationCategory':'GameApplication','operatingSystem':'Web','inLanguage':'ko','offers':{'@type':'Offer','price':'0','priceCurrency':'KRW'},'isPartOf':{'@id':BASE+'/#website'}}, ...faqLd(faq)]};
  const body = `<p class="crumb"><a href="/">오호플</a> › <a href="/season/christmas/">크리스마스에 할 것</a></p><h1>연말 모임 게임 뽑기</h1>
<p class="lead">어디서, 몇 명이, 어떤 분위기로 놀지 고르면 오호플이 고른 웹게임 중에서 맞는 걸 뽑아 줘요. 모두 설치 없이 링크로 시작해요.</p>
<form class="picker" id="pk" onsubmit="return false">
<fieldset><legend>어디서 놀아요?</legend><label><input type="radio" name="p" value="together" checked> 한자리에 모여서</label><label><input type="radio" name="p" value="online"> 각자 집에서 링크로</label></fieldset>
<fieldset><legend>몇 명이에요?</legend><label><input type="radio" name="n" value="2"> 2명</label><label><input type="radio" name="n" value="mid" checked> 3~8명</label><label><input type="radio" name="n" value="big"> 9명 이상</label></fieldset>
<fieldset><legend>분위기는요?</legend><label><input type="radio" name="m" value="loud" checked> 시끌벅적</label><label><input type="radio" name="m" value="funny"> 웃기게</label><label><input type="radio" name="m" value="calm"> 잔잔하게</label></fieldset>
<button class="btn" id="go" type="button">🎲 게임 뽑기</button></form>
<div id="out" class="mpicks" aria-live="polite"></div>
<noscript><ul>${C.map(c=>`<li><a href="/w/${c.id}/">${esc(c.name)}</a> — ${esc(c.desc)}</li>`).join('')}</ul></noscript>
${faqHtml(faq)}<div class="btns"><a class="btn ghost" href="/season/christmas/">크리스마스에 할 것 전체 보기</a><a class="btn ghost" href="/">3D 마을 들어가기</a></div>
<script>(function(){var C=${JSON.stringify(C).replace(/</g,'\\u003c')};var out=document.getElementById('out');
function v(n){var e=document.querySelector('input[name='+n+']:checked');return e?e.value:'';}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function pick(){var p=v('p'),n=v('n'),m=v('m');
 var sc=C.map(function(c){var s=(c.p.indexOf(p)>=0?3:0)+(c.n.indexOf(n)>=0?2:0)+(c.m.indexOf(m)>=0?2:0)+Math.random();return [s,c];}).filter(function(x){return x[0]>=3;}).sort(function(a,b){return b[0]-a[0];}).slice(0,3);
 out.innerHTML=sc.length?sc.map(function(x){var c=x[1];return '<div class="mpick">'+(c.img?'<img src="'+c.img+'" alt="오호플이 고른 '+esc(c.name)+' 첫 화면" width="640" height="480">':'<span></span>')+'<div><b>'+esc(c.name)+'</b><p>'+esc(c.desc)+'</p>'+(c.note?'<p><small>'+esc(c.note)+'</small></p>':'')+'<p><a class="btn" href="'+esc(c.url)+'" target="_blank" rel="noopener">바로 하기 ↗</a> <a href="/w/'+c.id+'/">자세히</a></p></div></div>';}).join('')+'<p><button class="btn ghost" type="button" id="again">다시 뽑기</button></p>':'<p>맞는 게임이 없어요. 조건을 바꿔 보세요.</p>';
 var a=document.getElementById('again'); if(a) a.onclick=pick; }
document.getElementById('go').onclick=pick;})();</script>`;
  fs.mkdirSync(path.join(ROOT, 'season', 'christmas', 'pick'), {recursive:true});
  fs.writeFileSync(path.join(ROOT, 'season', 'christmas', 'pick', 'index.html'), head('연말 모임 게임 뽑기 — 인원·장소·분위기로 고르는 무료 웹게임 | 오호플', '크리스마스·송년회에 몇 명이, 어디서, 어떤 분위기로 놀지 고르면 설치 없이 링크로 하는 웹게임을 뽑아 줘요.', url, C.map(c=>c.img).find(Boolean) || BASE + '/og-image.png', ld).replace('<meta name="description"','<meta name="keywords" content="연말 모임 게임, 송년회 게임, 크리스마스 게임 추천, 단체 게임 추천, 링크 게임"><meta name="description"') + body + foot);
}
for (const S of SEASONS) {
  const url = `${BASE}/season/${S.slug}/`, ids = S.sections.flatMap(x => x.picks.map(([id]) => id)).filter(id => byIdW[id]);
  const img = ids.map(id => thumb(byIdW[id])).find(Boolean) || `${BASE}/og-image.png`;
  const ld = {'@context':'https://schema.org','@graph':[
    {'@type':'CollectionPage','@id':url,'url':url,'name':S.title,'description':S.desc,'inLanguage':'ko','dateModified':today,'isPartOf':{'@id':BASE+'/#website'},'image':img,'keywords':S.kw.join(', ')},
    {'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'오호플','item':BASE+'/'},{'@type':'ListItem','position':2,'name':'시즌 추천','item':BASE+'/posts/#season'},{'@type':'ListItem','position':3,'name':S.title,'item':url}]},
    {'@type':'ItemList','name':S.title,'itemListElement':ids.map((id,i)=>({'@type':'ListItem','position':i+1,'url':pageUrl(byIdW[id]),'name':byIdW[id].name}))}, ...faqLd(S.faq)]};
  const others = SEASONS.filter(x => x.slug !== S.slug);
  const body = `<p class="crumb"><a href="/">오호플</a> › <a href="/posts/#season">시즌 추천</a> › ${esc(S.period)}</p><h1>${esc(S.title)}</h1><p class="crumb">${kdate(today)} 업데이트 · 오호플</p>
${S.intro.map(t => `<p class="lead">${esc(t)}</p>`).join('')}${S.slug==='christmas' ? '<p class="btns"><a class="btn" href="/season/christmas/pick/">🎲 우리 모임에 맞는 게임 뽑기</a></p>' : ''}${S.sections.map(x => `<h2>${esc(x.h)}</h2>${x.picks.map(pickBlock).join('')}`).join('')}${S.outro ? `<p>${esc(S.outro)}</p>` : ''}${faqHtml(S.faq)}
<div class="btns"><a class="btn" href="/">3D 마을에서 직접 찾아보기</a></div><h2>다른 시즌 추천</h2><ul>${others.map(x => `<li><a href="/season/${x.slug}/">${esc(x.title)}</a></li>`).join('')}</ul>`;
  fs.mkdirSync(path.join(ROOT, 'season', S.slug), {recursive:true});
  fs.writeFileSync(path.join(ROOT, 'season', S.slug, 'index.html'), head(`${S.title} | 오호플`, S.desc, url, img, ld).replace('<meta name="description"', `<meta name="keywords" content="${esc(S.kw.join(', '))}"><meta name="description"`) + body + foot);
}

// 분류별 페이지 /works/<slug>/
for (const [k, C] of Object.entries(CATEGORY_PAGES)) {
  const L = works.filter(w => w.type === k); if (!L.length) continue;
  const url = `${BASE}/works/${C.slug}/`, img = L.map(thumb).find(Boolean) || `${BASE}/og-image.png`;
  const rel = posts.filter(p => p.sections.some(x => (x.picks || []).some(([id]) => byIdW[id] && byIdW[id].type === k))).slice(0, 6);
  const faq = [[`${C.h1}은 정말 무료인가요?`, `오호플이 소개하는 작품은 브라우저에서 바로 열려요. 일부 작품은 유료 기능이나 로그인이 있어서 작품마다 알아둘 점에 적어 두었어요.`], [`${C.h1}은 휴대폰에서도 되나요?`, `대부분 휴대폰 브라우저에서 열려요. 가로 화면이나 PC를 권하는 작품은 작품 소개에 적어 두었어요.`]];
  const ld = {'@context':'https://schema.org','@graph':[
    {'@type':'CollectionPage','@id':url,'url':url,'name':C.title,'description':C.desc,'inLanguage':'ko','isPartOf':{'@id':BASE+'/#website'},'image':img,'keywords':C.kw.join(', ')},
    {'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'오호플','item':BASE+'/'},{'@type':'ListItem','position':2,'name':'작품 목록','item':BASE+'/works/'},{'@type':'ListItem','position':3,'name':D.TYPES[k].ko,'item':url}]},
    {'@type':'ItemList','name':C.h1,'numberOfItems':L.length,'itemListElement':L.map((w,i)=>({'@type':'ListItem','position':i+1,'url':pageUrl(w),'name':w.name}))}, ...faqLd(faq)]};
  const nav = Object.entries(CATEGORY_PAGES).filter(([kk]) => kk !== k && works.some(w => w.type === kk)).map(([kk, c]) => `<a class="chip" href="/works/${c.slug}/">${D.TYPES[kk].ko}</a>`).join(' ');
  const body = `<p class="crumb"><a href="/">오호플</a> › <a href="/works/">작품 목록</a> › ${D.TYPES[k].ko}</p><h1>${esc(C.h1)} <small>${L.length}개</small></h1><p class="lead">${esc(C.intro)}</p><p class="chips">${nav}</p>
<div class="grid">${L.map(card).join('')}</div>
${rel.length ? `<h2>관련 발견 노트</h2><ul>${rel.map(p => `<li><a href="/posts/${p.slug}/">${esc(p.title)}</a></li>`).join('')}</ul>` : ''}${faqHtml(faq)}
<div class="btns"><a class="btn" href="/">3D 마을에서 직접 찾아보기</a></div>`;
  fs.mkdirSync(path.join(ROOT, 'works', C.slug), {recursive:true});
  fs.writeFileSync(path.join(ROOT, 'works', C.slug, 'index.html'), head(`${C.title} | 오호플`, C.desc, url, img, ld).replace('<meta name="description"', `<meta name="keywords" content="${esc(C.kw.join(', '))}"><meta name="description"`) + body + foot);
}

// RSS (네이버 서치어드바이저 RSS 제출용)
{
  const rfc = d => new Date(d + 'T09:00:00+09:00').toUTCString();
  fs.writeFileSync(path.join(ROOT, 'rss.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>오호플 발견 노트</title><link>${BASE}/posts/</link><description>오호플이 고른 무료 웹게임, 설치 없는 웹 도구, 신기한 사이트 추천</description><language>ko</language><atom:link href="${BASE}/rss.xml" rel="self" type="application/rss+xml"/>`
    + posts.map(p => `<item><title>${esc(p.title)}</title><link>${postUrl(p)}</link><guid>${postUrl(p)}</guid><pubDate>${rfc(p.date)}</pubDate><description>${esc(p.desc)}</description></item>`).join('') + '</channel></rss>\n');
}

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

Sitemap: ${BASE}/sitemap.xml\nSitemap: ${BASE}/rss.xml
`);

fs.writeFileSync(path.join(ROOT, 'llms.txt'), `# 오호플 (OHOPL · 오늘의 호기심 플레이)

> AI로 만든 게임, 도구, 신기한 웹서비스를 직접 써 보고 골라 소개하는 3D 창작 마을이에요. 동물 캐릭터로 마을을 걸으며 가게(작품)를 발견해요. 작품은 모두 웹에서 열리고, 대부분 설치·가입 없이 바로 쓸 수 있어요(유료·로그인 여부는 작품마다 '알아둘 점'에 적어요). 운영: 블루루반 · 문의 eunhaebleu@naver.com

- 사이트: ${BASE}/
- 오호플이란?(소개·자주 묻는 질문): ${BASE}/about/
- 운영: 블루루반 · 유튜브 오호아재 https://www.youtube.com/channel/UCvJzrFknk4V-WiTaJlCkZTQ · 네이버 블로그 https://blog.naver.com/mandubird/224482662045
- 전체 목록: ${BASE}/works/
- 발견 노트(주제별 추천 글): ${BASE}/posts/
- 이달의 오호플(월간 정리): ${BASE}/monthly/
- 가이드(AI 게임·브라우저 게임·웹 도구 질문 답변): ${BASE}/guide/
- 큐레이션 원칙(작품을 고르는 기준): ${BASE}/about/policy/
- 분류: 놀이(게임), 도구(일·생활), 만들기(창작), 배우기, 탐험(3D·인터랙티브)
- 공간: 분수 광장(이번 주 추천), 큰길, 골목, 도구 섬(생산성·창작 도구), 놀이 섬(새로 들어온 놀이·회전목마), 성소 언덕(교회·성당·절)
- 원칙: 오호플이 직접 확인한 작품만 소개하고, 제작자가 원하지 않으면 바로 내려요.

## 분류별 모음
${Object.entries(CATEGORY_PAGES).map(([k,C]) => `- [${C.h1}](${BASE}/works/${C.slug}/): ${C.desc}`).join('\n')}

## 시즌 추천
${SEASONS.map(S => `- [${S.title}](${BASE}/season/${S.slug}/): ${S.desc}`).join('\n')}

## 발견 노트
${posts.map(p => `- [${p.title}](${postUrl(p)}): ${p.desc}`).join('\n')}

## 작품
${order.map(k => `\n### ${D.TYPES[k].ko}\n` + works.filter(w => w.type === k).map(w => `- [${w.name}](${pageUrl(w)}): ${w.desc}${w.note ? ' (' + w.note + ')' : ''}`).join('\n')).join('\n')}
`);
console.log(`pages ${works.length}, base ${BASE}`);

// 메인 index.html: 구조화 데이터(head)와 자바스크립트 없이도 읽히는 작품 링크(noscript)를 갱신
{
  const siteLd = {'@context':'https://schema.org','@graph':[
    {'@type':'WebSite','@id':BASE+'/#website','url':BASE+'/','name':'오호플','alternateName':['OHOPL','ohopl','오호 플','오호플레이','오늘의 호기심 플레이'],'inLanguage':'ko','description':'AI로 만든 게임, 도구, 신기한 웹서비스를 직접 써 보고 골라 소개하는 3D 창작 마을','publisher':{'@id':BASE+'/#org'}},
    {'@type':'Organization','@id':BASE+'/#org','name':'오호플','legalName':'블루루반','url':BASE+'/','logo':BASE+'/icon-512.png','email':'eunhaebleu@naver.com','alternateName':['OHOPL','ohopl','오호 플','오호플레이','오늘의 호기심 플레이'],'description':'AI로 만든 게임, 도구, 신기한 웹서비스를 직접 써 보고 골라 소개하는 3D 창작 마을','sameAs':['https://www.youtube.com/channel/UCvJzrFknk4V-WiTaJlCkZTQ','https://blog.naver.com/mandubird']},
    {'@type':'FAQPage','mainEntity':SITE_FAQ.map(([q,a])=>({'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':a}}))},
    {'@type':'ItemList','name':'오호플이 고른 AI 창작 작품','numberOfItems':works.length,'itemListElement':works.map((w,i)=>({'@type':'ListItem','position':i+1,'url':pageUrl(w),'name':w.name}))}]};
  let idx = fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  idx = idx.replace(/<!--seo-ld-->[\s\S]*?<!--\/seo-ld-->\n?/,'').replace(/<!--seo-list-->[\s\S]*?<!--\/seo-list-->\n?/,'');
  const ldBlock = `<!--seo-ld--><link rel="canonical" href="${BASE}/">\n<script type="application/ld+json">${JSON.stringify(siteLd).replace(/</g,'\\u003c')}</script><!--/seo-ld-->\n`;
  idx = idx.replace('<link rel="preconnect"', ldBlock + '<link rel="preconnect"');
  const list = `<!--seo-list--><noscript><nav aria-label="오호플 작품 목록"><h1>오호플 · 오늘의 호기심 플레이</h1><p>AI로 만든 게임, 도구, 신기한 웹서비스가 모인 3D 창작 마을이에요.</p>${factsHtml()}<ul>${works.map(w=>`<li><a href="/w/${w.id}/">${esc(w.name)}</a> — ${esc(w.desc)}</li>`).join('')}</ul><p><a href="/works/">작품 전체 목록</a> · <a href="/posts/">발견 노트</a></p>${posts.length?`<ul>${posts.map(p=>`<li><a href="/posts/${p.slug}/">${esc(p.title)}</a></li>`).join('')}</ul>`:''}</nav></noscript><!--/seo-list-->\n`;
  idx = idx.replace(/<body>\n?/, m => m + list);
  fs.writeFileSync(path.join(ROOT,'index.html'), idx);
}
