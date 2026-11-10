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
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const BASE = (process.argv[2] || process.env.SITE_URL || 'https://ohopl.com').replace(/\/$/, '');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const a = html.indexOf('const TYPES = {'), b = html.indexOf('const VACANTS');
const g = html.indexOf('const GALLERY = {'), ge = html.indexOf('};', g) + 2;
const code = html.slice(a, b) + '\n' + html.slice(g, ge) + '\n;({TYPES, WORKS, HIDDEN_WORKS, FAITH_WORKS, TOOL_WORKS, PLACES, THUMBS:[...THUMBS], GALLERY})';
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

const CSS = `:root{--bg:#fbf8f2;--fg:#1d2033;--muted:#5d6278;--card:#ffffff;--line:#e7e1d6;--accent:#f26a2e}
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
<header class="top"><a class="logo" href="/">오호플<small>오늘의 호기심 플레이</small></a><nav class="btns" style="margin:0"><a class="btn ghost" href="/posts/">발견 노트</a><a class="btn ghost" href="/works/">작품 전체</a></nav></header>`;
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
    {'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'오호플','item':BASE+'/'},{'@type':'ListItem','position':2,'name':'작품 목록','item':BASE+'/works/'},{'@type':'ListItem','position':3,'name':T.ko,'item':`${BASE}/works/${SLUG[w.type]}/`},{'@type':'ListItem','position':4,'name':w.name,'item':url}]},
    {'@type':'FAQPage','mainEntity':qa.map(([q,a])=>({'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':a}}))}]};
  const related = works.filter(x => x.type === w.type && x.id !== w.id).slice(0, 6);
  const body = `<p class="crumb"><a href="/">오호플</a> › <a href="/works/">작품 목록</a> › <a href="/works/${SLUG[w.type]}/">${T.ko}</a></p>
<h1>${esc(w.name)}</h1><div class="chips"><span class="chip">${T.ko}</span><span class="chip">${esc(PLACE(w))}</span>${w.featured ? '<span class="chip">이번 주 광장</span>' : ''}</div>
${thumb(w) ? `<img class="shot" src="${thumb(w)}" alt="${esc(w.name)} 첫 화면: ${esc(w.desc.slice(0, 60))}" width="640" height="480">` : ''}
<p class="lead">${esc(w.desc)}</p>
<div class="btns"><a class="btn" href="${esc(w.url)}" rel="noopener" target="_blank">${esc(w.name)} 열기 ↗</a><a class="btn ghost" href="/#w-${w.id}">3D 마을에서 보기</a></div>
<h2>한눈에 보기</h2><dl><dt>종류</dt><dd>${T.ko}</dd><dt>마을 위치</dt><dd>${esc(PLACE(w))}</dd><dt>주소</dt><dd>${esc(hostOf(w.url))}</dd>${w.share ? `<dt>오호플 추천</dt><dd>${esc(w.share)}</dd>` : ''}${w.note ? `<dt>알아둘 점</dt><dd>${esc(w.note)}</dd>` : ''}</dl>
<h2>자주 묻는 질문</h2><div class="faq">${qa.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
${postsFor(w.id).length ? `<h2>이 작품이 소개된 글</h2><ul>${postsFor(w.id).map(p => `<li><a href="/posts/${p.slug}/">${esc(p.title)}</a></li>`).join('')}</ul>` : ''}
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
    return `<article class="pick"><h3><a href="/w/${w.id}/">${esc(w.name)}</a> <small class="chip">${D.TYPES[w.type].ko}</small></h3>${t ? `<a href="/w/${w.id}/"><img class="shot" src="${t}" alt="${esc(w.name)} 첫 화면" loading="lazy" width="640" height="480"></a>` : ''}<p>${esc(w.desc)}</p>${line ? `<p><b>오호플 한 줄</b> ${esc(line)}</p>` : ''}${w.note ? `<p class="crumb">알아둘 점: ${esc(w.note)}</p>` : ''}<div class="btns"><a class="btn" href="${esc(w.url)}" rel="noopener" target="_blank">열기 ↗</a><a class="btn ghost" href="/w/${w.id}/">자세히</a></div></article>`; }).join('') : '');
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


const urls = [{loc:BASE+'/', img:BASE+'/og-image.png', t:'오호플 3D 창작 마을'}, {loc:BASE+'/works/'}, {loc:BASE+'/posts/'}, ...posts.map(p => ({loc:postUrl(p), last:p.date})), ...SEASONS.map(S => ({loc:`${BASE}/season/${S.slug}/`})), ...Object.entries(CATEGORY_PAGES).filter(([k]) => works.some(w => w.type === k)).map(([k, C]) => ({loc:`${BASE}/works/${C.slug}/`})), {loc:BASE+'/gallery/'}, ...works.filter(w=>w.id!=='gallery').map(w => ({loc:pageUrl(w), img:thumb(w), t:w.name+' 첫 화면'}))];
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`
  + urls.map(u => `  <url><loc>${u.loc}</loc><lastmod>${u.last || today}</lastmod>${u.img ? `<image:image><image:loc>${u.img}</image:loc><image:title>${esc(u.t)}</image:title></image:image>` : ''}</url>`).join('\n') + '\n</urlset>\n');

// 공통: 작품 소개 블록
const pickBlock = ([id, line]) => { const w = byIdW[id]; if (!w) return ''; const t = thumb(w);
  return `<article class="pick"><h3><a href="/w/${w.id}/">${esc(w.name)}</a> <small class="chip">${D.TYPES[w.type].ko}</small></h3>${t ? `<a href="/w/${w.id}/"><img class="shot" src="${t}" alt="${esc(w.name)} 첫 화면" loading="lazy" width="640" height="480"></a>` : ''}<p>${esc(w.desc)}</p>${line ? `<p><b>오호플 한 줄</b> ${esc(line)}</p>` : ''}${w.note ? `<p class="crumb">알아둘 점: ${esc(w.note)}</p>` : ''}<div class="btns"><a class="btn" href="${esc(w.url)}" rel="noopener" target="_blank">열기 ↗</a><a class="btn ghost" href="/w/${w.id}/">자세히</a></div></article>`; };
const faqLd = faq => faq && faq.length ? [{'@type':'FAQPage','mainEntity':faq.map(([q,a])=>({'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':a}}))}] : [];
const faqHtml = faq => faq && faq.length ? `<h2>자주 묻는 질문</h2><div class="faq">${faq.map(([q, a]) => `<details open><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>` : '';

// 시즌 페이지 /season/<slug>/
fs.rmSync(path.join(ROOT, 'season'), {recursive:true, force:true});
for (const S of SEASONS) {
  const url = `${BASE}/season/${S.slug}/`, ids = S.sections.flatMap(x => x.picks.map(([id]) => id)).filter(id => byIdW[id]);
  const img = ids.map(id => thumb(byIdW[id])).find(Boolean) || `${BASE}/og-image.png`;
  const ld = {'@context':'https://schema.org','@graph':[
    {'@type':'CollectionPage','@id':url,'url':url,'name':S.title,'description':S.desc,'inLanguage':'ko','dateModified':today,'isPartOf':{'@id':BASE+'/#website'},'image':img,'keywords':S.kw.join(', ')},
    {'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'오호플','item':BASE+'/'},{'@type':'ListItem','position':2,'name':'시즌 추천','item':BASE+'/posts/#season'},{'@type':'ListItem','position':3,'name':S.title,'item':url}]},
    {'@type':'ItemList','name':S.title,'itemListElement':ids.map((id,i)=>({'@type':'ListItem','position':i+1,'url':pageUrl(byIdW[id]),'name':byIdW[id].name}))}, ...faqLd(S.faq)]};
  const others = SEASONS.filter(x => x.slug !== S.slug);
  const body = `<p class="crumb"><a href="/">오호플</a> › <a href="/posts/#season">시즌 추천</a> › ${esc(S.period)}</p><h1>${esc(S.title)}</h1><p class="crumb">${kdate(today)} 업데이트 · 오호플</p>
${S.intro.map(t => `<p class="lead">${esc(t)}</p>`).join('')}${S.sections.map(x => `<h2>${esc(x.h)}</h2>${x.picks.map(pickBlock).join('')}`).join('')}${S.outro ? `<p>${esc(S.outro)}</p>` : ''}${faqHtml(S.faq)}
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
- 전체 목록: ${BASE}/works/
- 발견 노트(주제별 추천 글): ${BASE}/posts/
- 분류: 놀이(게임), 도구(일·생활), 만들기(창작), 배우기, 탐험(3D·인터랙티브)
- 공간: 분수 광장(이번 주 추천), 큰길, 골목, 도구 섬(생산성·창작 도구), 성소 언덕(교회·성당·절)
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
    {'@type':'WebSite','@id':BASE+'/#website','url':BASE+'/','name':'오호플','alternateName':['OHOPL','오늘의 호기심 플레이'],'inLanguage':'ko','description':'AI로 만든 게임, 도구, 신기한 웹서비스를 직접 써 보고 골라 소개하는 3D 창작 마을','publisher':{'@id':BASE+'/#org'}},
    {'@type':'Organization','@id':BASE+'/#org','name':'오호플','legalName':'블루루반','url':BASE+'/','logo':BASE+'/icon-512.png','email':'eunhaebleu@naver.com'},
    {'@type':'ItemList','name':'오호플이 고른 AI 창작 작품','numberOfItems':works.length,'itemListElement':works.map((w,i)=>({'@type':'ListItem','position':i+1,'url':pageUrl(w),'name':w.name}))}]};
  let idx = fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  idx = idx.replace(/<!--seo-ld-->[\s\S]*?<!--\/seo-ld-->\n?/,'').replace(/<!--seo-list-->[\s\S]*?<!--\/seo-list-->\n?/,'');
  const ldBlock = `<!--seo-ld--><link rel="canonical" href="${BASE}/">\n<script type="application/ld+json">${JSON.stringify(siteLd).replace(/</g,'\\u003c')}</script><!--/seo-ld-->\n`;
  idx = idx.replace('<link rel="preconnect"', ldBlock + '<link rel="preconnect"');
  const list = `<!--seo-list--><noscript><nav aria-label="오호플 작품 목록"><h1>오호플 · 오늘의 호기심 플레이</h1><p>AI로 만든 게임, 도구, 신기한 웹서비스가 모인 3D 창작 마을이에요.</p><ul>${works.map(w=>`<li><a href="/w/${w.id}/">${esc(w.name)}</a> — ${esc(w.desc)}</li>`).join('')}</ul><p><a href="/works/">작품 전체 목록</a> · <a href="/posts/">발견 노트</a></p>${posts.length?`<ul>${posts.map(p=>`<li><a href="/posts/${p.slug}/">${esc(p.title)}</a></li>`).join('')}</ul>`:''}</nav></noscript><!--/seo-list-->\n`;
  idx = idx.replace(/<body>\n?/, m => m + list);
  fs.writeFileSync(path.join(ROOT,'index.html'), idx);
}
