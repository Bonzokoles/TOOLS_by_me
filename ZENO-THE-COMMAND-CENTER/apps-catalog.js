// ══════════════════════════════════════════════
// THEME SYNC — reads zeno-theme from localStorage (shared chrome-extension:// origin)
// ══════════════════════════════════════════════
const THEMES = {
  'firefly-pro-ember': {
    bg:'#090705',bg2:'#100c07',bg3:'#1e1408',border:'#2e2018',border2:'#524438',
    accent:'#ff9a3c',accent2:'#ffb347',accentDim:'#ff9a3c18',
    text:'#e0d0c0',text2:'#7a6a58',text3:'#524438',
    scanline:'255,154,60',
  },
  'linear': {
    bg:'#010102',bg2:'#0f1011',bg3:'#141516',border:'#23252a',border2:'#34343a',
    accent:'#5e6ad2',accent2:'#828fff',accentDim:'#5e6ad222',
    text:'#f7f8f8',text2:'#d0d6e0',text3:'#8a8f98',
    scanline:'94,106,210',
  },
  'framer': {
    bg:'#090909',bg2:'#141414',bg3:'#1c1c1c',border:'#2a2a2a',border2:'#333333',
    accent:'#0099ff',accent2:'#d44df0',accentDim:'#0099ff22',
    text:'#ffffff',text2:'#999999',text3:'#555555',
    scanline:'0,153,255',
  },
  'bugatti': {
    bg:'#000000',bg2:'#0d0d0d',bg3:'#141414',border:'#1f1f1f',border2:'#2a2a2a',
    accent:'#ffffff',accent2:'#c3d9f3',accentDim:'#ffffff11',
    text:'#ffffff',text2:'#cccccc',text3:'#666666',
    scanline:'200,200,200',
  },
};

function applyTheme(key) {
  const t = THEMES[key] || THEMES['firefly-pro-ember'];
  const r = document.documentElement;
  r.style.setProperty('--bg',          t.bg);
  r.style.setProperty('--bg2',         t.bg2);
  r.style.setProperty('--bg3',         t.bg3);
  r.style.setProperty('--border',      t.border);
  r.style.setProperty('--border2',     t.border2);
  r.style.setProperty('--accent',      t.accent);
  r.style.setProperty('--accent2',     t.accent2);
  r.style.setProperty('--accent-dim',  t.accentDim);
  r.style.setProperty('--text',        t.text);
  r.style.setProperty('--text2',       t.text2);
  r.style.setProperty('--text3',       t.text3);
  r.style.setProperty('--scanline-color', `rgba(${t.scanline},.012)`);
  r.style.setProperty('--grid-color',     `rgba(${t.scanline},.025)`);
}

applyTheme(localStorage.getItem('zeno-theme') || 'firefly-pro-ember');

window.addEventListener('storage', e => {
  if (e.key === 'zeno-theme' && e.newValue) applyTheme(e.newValue);
});

// ══════════════════════════════════════════════
// CATEGORIES
// ══════════════════════════════════════════════
const CATS = [
  { id:'ai',          e:'AI',   n:'AI / Chatboty',         d:'Claude, GPT, Gemini, Perplexity' },
  { id:'ai_image',    e:'IMG',  n:'AI Image / Video',       d:'Midjourney, DALL-E, Runway, Sora' },
  { id:'dev',         e:'DEV',  n:'Dev Tools',              d:'GitHub, CodePen, npm, RegEx, DevDocs' },
  { id:'design',      e:'DSN',  n:'Design / UI',            d:'Figma, Framer, Canva, Dribbble' },
  { id:'cloud',       e:'CLD',  n:'Cloud / Hosting',        d:'Vercel, Cloudflare, Railway, Fly.io' },
  { id:'productivity',e:'PRD',  n:'Produktywnosc',          d:'Notion, Linear, Jira, Trello, Asana' },
  { id:'media',       e:'MED',  n:'Media / Video',          d:'YouTube, Twitch, Spotify, Vimeo' },
  { id:'search',      e:'SRC',  n:'Wyszukiwarki',           d:'DDG, Brave, SearXNG, Kagi, Perplexity' },
  { id:'social',      e:'SOC',  n:'Social / Komunikacja',   d:'Discord, Slack, Reddit, X/Twitter' },
  { id:'security',    e:'SEC',  n:'Bezpieczenstwo',         d:'Bitwarden, 1Password, VirusTotal' },
  { id:'finance',     e:'FIN',  n:'Finanse / Business',     d:'Stripe, PayPal, Revolut, Faktury' },
  { id:'learn',       e:'DOC',  n:'Nauka / Dokumentacja',   d:'MDN, Docs, StackOverflow, Coursera' },
  { id:'tools',       e:'TLS',  n:'Online Narzedzia',       d:'Konwertery, regex, generatory, testy' },
  { id:'selfhosted',  e:'LCL',  n:'Self-hosted / Lokalne',  d:'localhost, Podman, wlasne serwisy' },
  { id:'analytics',   e:'ANL',  n:'Analytics / SEO',        d:'GA, Plausible, Umami, Ahrefs' },
  { id:'packages',    e:'PKG',  n:'Pakiety / Biblioteki',   d:'npmjs, PyPI, crates.io, bundlephobia' },
  { id:'writing',     e:'TXT',  n:'Pisanie / Content',      d:'Notion, Medium, Substack, Grammarly' },
  { id:'gaming',      e:'GAM',  n:'Gaming / Rozrywka',      d:'Steam, Itch.io, GOG, Epic Games' },
  { id:'email',       e:'EML',  n:'Email / Newsletter',     d:'Gmail, Proton, Mailchimp, Beehiiv' },
  { id:'maps',        e:'MAP',  n:'Mapy / Travel',          d:'Google Maps, Airbnb, Booking' },
  { id:'shopping',    e:'SHP',  n:'Zakupy / Sklepy',        d:'Amazon, Allegro, AliExpress' },
  { id:'api',         e:'API',  n:'API / Webhooks',         d:'RapidAPI, Postman, Webhook.site' },
  { id:'other',       e:'---',  n:'Inne',                   d:'Pozostale strony i aplikacje' },
];

const BADGES = {
  fav:       { cls:'badge-fav',      label:'* ulubione' },
  installed: { cls:'badge-installed',label:'+ apka' },
  try:       { cls:'badge-try',      label:'◻ TODO' },
  archived:  { cls:'badge-archived', label:'× archiwum' },
};

// ══════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════
const LS = 'app_catalog_v2';
let apps = [];
let activeCat = 'all';
let activeStatus = 'all';
let activeStars = 0;

function load() { try { apps = JSON.parse(localStorage.getItem(LS)) || []; } catch { apps = []; } }
function save() { localStorage.setItem(LS, JSON.stringify(apps)); }
function uid()  { return Date.now().toString(36) + Math.random().toString(36).slice(2,5); }

function faviconUrl(url) {
  try { const d = new URL(url).hostname; return `https://www.google.com/s2/favicons?domain=${d}&sz=64`; }
  catch { return ''; }
}

function thumbUrl(url) {
  if (!url) return '';
  return 'https://s.wordpress.com/mshots/v1/' + encodeURIComponent(url) + '?w=400&h=225';
}

function domainOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return url || ''; }
}

// ══════════════════════════════════════════════
// RENDER
// ══════════════════════════════════════════════
function renderAll() { renderSidebar(); renderCards(); }

function renderSidebar() {
  const el = document.getElementById('sidebar');
  const n = apps.length;
  let h = `<div class="sidebar-label">Filtry</div>
  <button class="cat-btn ${activeCat==='all'?'active':''}" data-cat="all">
    <span class="cat-label">Wszystkie</span><span class="cat-count">${n}</span>
  </button>
  <hr class="sidebar-sep">
  <div class="sidebar-label">Kategorie</div>`;
  CATS.forEach(c => {
    const cnt = apps.filter(a=>a.cat===c.id).length;
    if (!cnt) return;
    h += `<button class="cat-btn ${activeCat===c.id?'active':''}" data-cat="${c.id}">
      <span class="cat-label">${c.e} ${c.n}</span>
      <span class="cat-count">${cnt}</span>
    </button>`;
  });
  el.innerHTML = h;
  // Wire up cat buttons via event delegation
  el.addEventListener('click', e => {
    const btn = e.target.closest('[data-cat]');
    if (btn) setCat(btn.dataset.cat);
  });
}

function renderCards() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const filtered = apps.filter(a => {
    if (activeCat !== 'all' && a.cat !== activeCat) return false;
    if (activeStatus !== 'all' && a.status !== activeStatus) return false;
    if (activeStars > 0 && (a.stars||0) < activeStars) return false;
    if (q) {
      const txt = [a.name,a.url,a.desc,a.notes||'',(a.tags||[]).join(' ')].join(' ').toLowerCase();
      if (!txt.includes(q)) return false;
    }
    return true;
  });

  // Stats
  document.getElementById('statsRow').innerHTML = [
    `<span class="stat">Łącznie: <span class="stat-n">${apps.length}</span></span>`,
    `<span class="stat">fav: <span class="stat-n">${apps.filter(a=>a.status==='fav').length}</span></span>`,
    `<span class="stat">apka: <span class="stat-n">${apps.filter(a=>a.status==='installed').length}</span></span>`,
    `<span class="stat">◻ <span class="stat-n">${apps.filter(a=>a.status==='try').length}</span></span>`,
    filtered.length !== apps.length ? `<span class="stat" style="color:var(--accent)">Wynik: <span class="stat-n">${filtered.length}</span></span>` : '',
  ].join('');

  if (!filtered.length) {
    document.getElementById('cardsRoot').innerHTML = `<div class="empty">
      <div class="empty-icon">${apps.length===0?'⊞':'[ ]'}</div>
      <p>${apps.length===0
        ? 'Brak wpisów.\nUżyj "Dodaj z URL" lub "+ Ręcznie" żeby zacząć.'
        : 'Brak wyników dla wybranych filtrów.'}</p>
    </div>`;
    return;
  }

  // Group by category
  const groups = {};
  filtered.forEach(a => { (groups[a.cat]=groups[a.cat]||[]).push(a); });

  let html = '';
  CATS.forEach(c => {
    const grp = groups[c.id];
    if (!grp) return;
    html += `<div class="sec-title">${c.e} ${c.n} <span style="color:var(--text3);font-size:8px">(${grp.length})</span></div>
    <div class="cards">`;
    grp.forEach(a => { html += cardHTML(a); });
    html += `</div>`;
  });

  const root = document.getElementById('cardsRoot');
  root.innerHTML = html;

  // Wire card actions via event delegation (no inline onclick needed)
  root.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) {
      // Check if clicking a card itself (toggle)
      const card = e.target.closest('.card');
      if (card && card.dataset.id) toggleCard(card.dataset.id);
      return;
    }
    e.stopPropagation();
    const { action, id } = btn.dataset;
    if (action === 'open')    openUrl(id);
    if (action === 'install') installApp(id);
    if (action === 'edit')    openEdit(id);
    if (action === 'del')     delApp(id);
  });
}

function cardHTML(a) {
  const badge = BADGES[a.status] || BADGES.try;
  const stars = '★'.repeat(a.stars||0) + '☆'.repeat(3-(a.stars||0));
  const tags = (a.tags||[]).map(t=>`<span class="tag ${t}">${t}</span>`).join('');
  const urlShort = domainOf(a.url);
  const fav = a.favicon || faviconUrl(a.url||'');
  const icoContent = fav
    ? `<img src="${fav}" alt="" onerror="this.style.display='none';this.nextSibling.style.display='block'"><span style="display:none;font-size:12px">${a.icon||'#'}</span>`
    : `<span style="font-size:12px">${a.icon||'#'}</span>`;
  const notesHTML = a.notes ? `<div class="card-notes">${a.notes}</div>` : '';

  return `<div class="card" data-id="${a.id}">
    <div class="card-body">
      <div class="card-top">
        <div class="card-ico">${icoContent}</div>
        <div class="card-info">
          <div class="card-name">${a.name}</div>
          <div class="card-url">${urlShort}</div>
        </div>
        <span class="card-badge ${badge.cls}">${badge.label.replace(/^. /,'')}</span>
      </div>
      <div style="font-size:9px;color:var(--accent);margin-bottom:4px">${stars}</div>
      <div class="card-desc">${a.desc||''}</div>
      <div class="card-tags">${tags}</div>
    </div>
    <div class="card-expand">
      ${notesHTML}
      <div class="card-actions">
        <button class="btn" data-action="open"    data-id="${a.id}">Otworz</button>
        <button class="btn" data-action="install" data-id="${a.id}">⊞ Jako apkę</button>
        <button class="btn" data-action="edit"    data-id="${a.id}">&#x270F; Edytuj</button>
        <button class="btn" data-action="del"     data-id="${a.id}" style="color:var(--text3)">&#x2715;</button>
      </div>
    </div>
    <div class="expand-hint">&#x25B8; kliknij</div>
  </div>`;
}

function escAttr(s) {
  return String(s).replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function thumbCardError(img, domain) {
  const box = img.parentElement;
  img.style.display = 'none';
  const ph = document.createElement('div');
  ph.className = 'card-thumb-placeholder';
  ph.textContent = domain;
  box.appendChild(ph);
}

function thumbImgError(imgId, phId) {
  document.getElementById(imgId).style.display = 'none';
  document.getElementById(phId).style.display = 'flex';
}

function toggleCard(id) {
  const el = document.querySelector(`.card[data-id="${id}"]`);
  if (!el) return;
  const wasOpen = el.classList.contains('open');
  document.querySelectorAll('.card.open').forEach(c => c.classList.remove('open'));
  if (!wasOpen) el.classList.add('open');
}

function openUrl(id) {
  const a = apps.find(x=>x.id===id); if (a?.url) window.open(a.url,'_blank');
}
function installApp(id) {
  const a = apps.find(x=>x.id===id); if (!a?.url) return;
  window.open(a.url,'_blank');
  setTimeout(()=>alert(`Aby zainstalować jako aplikację:\n\nChromium/Edge: Menu (⋮) → "Zainstaluj stronę jako aplikację"\nFirefox: nie obsługuje PWA instalacji\n\nURL: ${a.url}`), 600);
}
function delApp(id) {
  if (!confirm('Usunąć ten wpis?')) return;
  apps = apps.filter(a=>a.id!==id); save(); renderAll();
}

// ══════════════════════════════════════════════
// FILTERS
// ══════════════════════════════════════════════
function setCat(id) { activeCat = id; renderAll(); }
function setStatus(val) {
  document.querySelectorAll('#statusPills .pill').forEach(b=>b.classList.remove('active'));
  document.querySelector(`#statusPills [data-status="${val}"]`)?.classList.add('active');
  activeStatus = val; renderCards();
}
function setStars(val, btn) {
  btn.closest('.pills').querySelectorAll('.pill').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active'); activeStars = val; renderCards();
}

// ══════════════════════════════════════════════
// STARS WIDGET
// ══════════════════════════════════════════════
function setStar(elId, val) {
  const el = document.getElementById(elId);
  el.dataset.val = val;
  el.querySelectorAll('span').forEach((s,i) => s.classList.toggle('on', i < val));
}
function getStar(elId) { return parseInt(document.getElementById(elId).dataset.val)||0; }
function resetStar(elId) {
  const el = document.getElementById(elId);
  el.dataset.val = 0;
  el.querySelectorAll('span').forEach(s=>s.classList.remove('on'));
}

// ══════════════════════════════════════════════
// CAT SELECT POPULATE
// ══════════════════════════════════════════════
function fillCatSelect(id) {
  document.getElementById(id).innerHTML = CATS.map(c=>`<option value="${c.id}">${c.e} ${c.n}</option>`).join('');
}

// ══════════════════════════════════════════════
// AUTO-FETCH MODAL
// ══════════════════════════════════════════════
function openAF() {
  fillCatSelect('afCat');
  resetStar('afStars');
  ['afUrl','afUrlFinal','afName','afDesc','afNotes','afTags'].forEach(id => document.getElementById(id).value='');
  document.getElementById('afIcon').value = '#';
  document.getElementById('afStatus').textContent = '';
  document.getElementById('afStatus').className = 'fetch-status';
  document.getElementById('afFavPreview').innerHTML = '<span style="font-size:11px;color:var(--text3)">?</span>';
  document.getElementById('afOverlay').classList.add('open');
  setTimeout(() => document.getElementById('afUrl').focus(), 100);
}
function closeAF(e) { if (e.target===document.getElementById('afOverlay')) closeAFD(); }
function closeAFD() { document.getElementById('afOverlay').classList.remove('open'); }

function onAfUrlChange() {
  const url = document.getElementById('afUrl').value.trim();
  const fav = faviconUrl(url);
  if (fav) {
    document.getElementById('afFavPreview').innerHTML = `<img src="${fav}" alt="" style="width:20px;height:20px;object-fit:contain">`;
    document.getElementById('afUrlFinal').value = url;
  }
}

async function fetchViaProxy(url) {
  const proxies = [
    async () => {
      const r = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(7000) });
      if (!r.ok) throw new Error(r.status);
      return await r.text();
    },
    async () => {
      const r = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(7000) });
      if (!r.ok) throw new Error(r.status);
      return await r.text();
    },
    async () => {
      const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(7000) });
      const d = await r.json();
      return d.contents || '';
    },
  ];
  for (const proxy of proxies) {
    try { const h = await proxy(); if (h && h.length > 100) return h; } catch { continue; }
  }
  return '';
}

async function doFetch() {
  const url = document.getElementById('afUrl').value.trim();
  if (!url) return;
  const statusEl = document.getElementById('afStatus');
  const btn = document.getElementById('afFetchBtn');
  statusEl.textContent = 'Pobieranie...'; statusEl.className = 'fetch-status loading';
  btn.disabled = true;
  document.getElementById('afUrlFinal').value = url;

  const fav = faviconUrl(url);
  if (fav) document.getElementById('afFavPreview').innerHTML = `<img src="${fav}" alt="" style="width:20px;height:20px;object-fit:contain">`;

  const html = await fetchViaProxy(url);

  try {
    if (!html) throw new Error('no content');
    const meta = (pattern) => { const m = html.match(pattern); return m ? m[1].replace(/&amp;/g,'&').replace(/&#39;/g,"'").trim() : ''; };
    const title = meta(/<title[^>]*>([^<]{1,150})<\/title>/i)
      || meta(/<meta[^>]+property="og:title"[^>]+content="([^"]{1,150})"/i)
      || meta(/<meta[^>]+content="([^"]{1,150})"[^>]+property="og:title"/i) || '';
    const desc = meta(/<meta[^>]+name="description"[^>]+content="([^"]{1,200})"/i)
      || meta(/<meta[^>]+content="([^"]{1,200})"[^>]+name="description"/i)
      || meta(/<meta[^>]+property="og:description"[^>]+content="([^"]{1,200})"/i) || '';

    if (title) document.getElementById('afName').value = title.replace(/\s*[|\-–—·•·].*$/, '').trim().slice(0,60);
    if (desc)  document.getElementById('afDesc').value = desc.slice(0,120);

    const ctx = (url+' '+title+' '+desc).toLowerCase();
    let cat = 'other';
    if (/claude|openai|gpt|gemini|perplexity|mistral|deepseek|ollama|groq|llm|chatbot|huggingface/i.test(ctx)) cat='ai';
    else if (/midjourney|dall-e|stable.diffusion|runway|sora|imagen|flux|comfyui/i.test(ctx)) cat='ai_image';
    else if (/figma|framer|canva|sketch|dribbble|zeplin|invision/i.test(ctx)) cat='design';
    else if (/vercel|cloudflare|railway|fly\.io|render\.com|heroku|aws|azure|gcp|vps|hosting/i.test(ctx)) cat='cloud';
    else if (/notion|linear|jira|trello|asana|clickup|monday/i.test(ctx)) cat='productivity';
    else if (/youtube|twitch|spotify|vimeo|soundcloud|netflix/i.test(ctx)) cat='media';
    else if (/github|gitlab|bitbucket|stackoverflow|codepen|replit/i.test(ctx)) cat='dev';
    else if (/npm|pypi|crates\.io|bundlephobia/i.test(ctx)) cat='packages';
    else if (/discord|slack|reddit|twitter|x\.com|telegram/i.test(ctx)) cat='social';
    else if (/localhost|127\.0\.0\.1|:4111|:8888|:3000|self.host/i.test(ctx)) cat='selfhosted';
    else if (/analytics|seo|ahrefs|semrush|plausible|umami/i.test(ctx)) cat='analytics';
    else if (/docs\.|documentation|mdn|devdocs|learn\.|tutorial|course/i.test(ctx)) cat='learn';
    else if (/gmail|proton|mailchimp|beehiiv|newsletter/i.test(ctx)) cat='email';
    else if (/maps|travel|airbnb|booking|tripadvisor/i.test(ctx)) cat='maps';
    else if (/amazon|allegro|aliexpress|ebay|sklep|shop/i.test(ctx)) cat='shopping';
    else if (/bitwarden|1password|lastpass|virustotal|security/i.test(ctx)) cat='security';
    else if (/stripe|paypal|revolut|faktury|invoice|finanse/i.test(ctx)) cat='finance';
    document.getElementById('afCat').value = cat;

    const tags = [];
    if (/ai|gpt|llm|claude/i.test(ctx)) tags.push('ai');
    if (/free|open.source|kostenlos/i.test(ctx)) tags.push('free');
    if (/paid|pro|premium|pricing/i.test(ctx)) tags.push('paid');
    if (/install|app|pwa/i.test(ctx)) tags.push('pwa');
    document.getElementById('afTags').value = tags.join(', ');

    statusEl.textContent = `OK: ${title||url}`;
    statusEl.className = 'fetch-status ok';
  } catch {
    const host = domainOf(url);
    document.getElementById('afName').value = host.replace(/^www\./,'');
    statusEl.textContent = 'Brak polaczenia — wypelnij recznie.';
    statusEl.className = 'fetch-status err';
  }
  btn.disabled = false;
}

function saveAF() {
  const url = (document.getElementById('afUrlFinal').value || document.getElementById('afUrl').value).trim();
  const name = document.getElementById('afName').value.trim();
  if (!name || !url) { alert('Podaj nazwę i URL.'); return; }
  apps.push({
    id: uid(), name, url,
    icon: document.getElementById('afIcon').value || '#',
    favicon: faviconUrl(url),
    thumbnail: thumbUrl(url),
    cat: document.getElementById('afCat').value,
    desc: document.getElementById('afDesc').value.trim(),
    notes: document.getElementById('afNotes').value.trim(),
    status: document.getElementById('afStatus2').value,
    stars: getStar('afStars'),
    tags: document.getElementById('afTags').value.split(',').map(t=>t.trim()).filter(Boolean),
    addedAt: new Date().toISOString().slice(0,10),
  });
  save(); closeAFD(); renderAll();
}

// ══════════════════════════════════════════════
// ADD MANUAL
// ══════════════════════════════════════════════
function openAdd() {
  fillCatSelect('fCat');
  resetStar('fStars');
  ['fName','fUrl','fDesc','fNotes','fTags'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('fIcon').value='#';
  document.getElementById('addOverlay').classList.add('open');
  setTimeout(()=>document.getElementById('fName').focus(),100);
}
function closeAddOv(e) { if(e.target===document.getElementById('addOverlay'))closeAddD(); }
function closeAddD() { document.getElementById('addOverlay').classList.remove('open'); }

function saveManual() {
  const name=document.getElementById('fName').value.trim();
  const url=document.getElementById('fUrl').value.trim();
  if(!name||!url){alert('Podaj nazwę i URL.');return;}
  apps.push({
    id:uid(),name,url,
    icon:document.getElementById('fIcon').value||'#',
    favicon:faviconUrl(url),
    thumbnail:thumbUrl(url),
    cat:document.getElementById('fCat').value,
    desc:document.getElementById('fDesc').value.trim(),
    notes:document.getElementById('fNotes').value.trim(),
    status:document.getElementById('fStatus').value,
    stars:getStar('fStars'),
    tags:document.getElementById('fTags').value.split(',').map(t=>t.trim()).filter(Boolean),
    addedAt:new Date().toISOString().slice(0,10),
  });
  save();closeAddD();renderAll();
}

// ══════════════════════════════════════════════
// EDIT
// ══════════════════════════════════════════════
function openEdit(id) {
  const a=apps.find(x=>x.id===id);if(!a)return;
  fillCatSelect('eCat');
  setStar('eStars',a.stars||0);
  document.getElementById('eId').value=a.id;
  document.getElementById('eIcon').value=a.icon||'#';
  document.getElementById('eName').value=a.name;
  document.getElementById('eUrl').value=a.url;
  document.getElementById('eDesc').value=a.desc||'';
  document.getElementById('eNotes').value=a.notes||'';
  document.getElementById('eStatus').value=a.status||'try';
  document.getElementById('eTags').value=(a.tags||[]).join(', ');
  document.getElementById('eCat').value=a.cat;

  const thumb = a.thumbnail || thumbUrl(a.url||'');
  const img = document.getElementById('eThumbImg');
  const ph = document.getElementById('eThumbPh');
  if (thumb) {
    img.src = thumb;
    img.style.display = 'block';
    ph.style.display = 'none';
  } else {
    img.style.display = 'none';
    ph.style.display = 'flex';
    ph.textContent = 'brak miniatury';
  }

  document.getElementById('editOverlay').classList.add('open');
}
function closeEditOv(e){if(e.target===document.getElementById('editOverlay'))closeEditD();}
function closeEditD(){document.getElementById('editOverlay').classList.remove('open');}

function refreshEditThumb() {
  const url = document.getElementById('eUrl').value.trim();
  if (!url) return;
  const thumb = thumbUrl(url);
  const img = document.getElementById('eThumbImg');
  const ph = document.getElementById('eThumbPh');
  img.src = thumb;
  img.style.display = 'block';
  ph.style.display = 'none';
  const id = document.getElementById('eId').value;
  const i = apps.findIndex(a=>a.id===id);
  if (i>=0) apps[i].thumbnail = thumb;
}

function saveEdit() {
  const id=document.getElementById('eId').value;
  const i=apps.findIndex(a=>a.id===id);if(i<0)return;
  const url=document.getElementById('eUrl').value.trim();
  apps[i]={...apps[i],
    icon:document.getElementById('eIcon').value||'#',
    cat:document.getElementById('eCat').value,
    name:document.getElementById('eName').value.trim(),
    url,
    favicon:faviconUrl(url),
    thumbnail:thumbUrl(url),
    desc:document.getElementById('eDesc').value.trim(),
    notes:document.getElementById('eNotes').value.trim(),
    status:document.getElementById('eStatus').value,
    stars:getStar('eStars'),
    tags:document.getElementById('eTags').value.split(',').map(t=>t.trim()).filter(Boolean),
  };
  save();closeEditD();renderAll();
}

// ══════════════════════════════════════════════
// IMPORT / EXPORT / CLEAR
// ══════════════════════════════════════════════
function exportAll() {
  const data={_system:'APP_CATALOG',_version:'2.0',_exported:new Date().toISOString(),apps};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`app_catalog_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
}

function triggerImport(){document.getElementById('importFile').click();}
function importJSON(input) {
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    try {
      const data=JSON.parse(e.target.result);
      const imported=data.apps||(Array.isArray(data)?data:[]);
      if(!imported.length){alert('Brak danych do importu.');return;}
      const merge=confirm(`Znaleziono ${imported.length} wpisów.\n\nOK = scal z istniejącymi\nAnuluj = zastąp katalog`);
      if(merge){
        const existing=new Set(apps.map(a=>a.id));
        imported.forEach(a=>{if(!existing.has(a.id))apps.push(a);});
      } else {
        apps=imported;
      }
      save();renderAll();
      alert(`Import zakończony. Łącznie: ${apps.length} wpisów.`);
    } catch{alert('Błąd parsowania JSON.');}
    input.value='';
  };
  reader.readAsText(file);
}

function clearAll() {
  if(!confirm(`Wyczyścić cały katalog?\n\n(${apps.length} wpisów zostanie usuniętych)\n\nWyeksportuj najpierw JSON jeśli chcesz zachować dane.`))return;
  apps=[];save();renderAll();
}

// ══════════════════════════════════════════════
// WIRE STATIC HTML BUTTONS (replaces inline onclick)
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Header buttons
  document.querySelector('[data-hbtn="add-url"]')?.addEventListener('click', openAF);
  document.querySelector('[data-hbtn="add-manual"]')?.addEventListener('click', openAdd);
  document.querySelector('[data-hbtn="import"]')?.addEventListener('click', triggerImport);
  document.querySelector('[data-hbtn="export"]')?.addEventListener('click', exportAll);
  document.querySelector('[data-hbtn="clear"]')?.addEventListener('click', clearAll);

  // Import file input
  document.getElementById('importFile')?.addEventListener('change', function(){ importJSON(this); });

  // Search
  document.getElementById('searchInput')?.addEventListener('input', renderCards);

  // Status pills
  document.getElementById('statusPills')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-status]');
    if (!btn) return;
    document.querySelectorAll('#statusPills .pill').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    activeStatus = btn.dataset.status;
    renderCards();
  });

  // Stars pills
  document.getElementById('starsPills')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-stars]');
    if (!btn) return;
    btn.closest('.pills').querySelectorAll('.pill').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    activeStars = parseInt(btn.dataset.stars);
    renderCards();
  });

  // AF modal
  document.getElementById('afOverlay')?.addEventListener('click', closeAF);
  document.querySelector('#afOverlay .modal-close')?.addEventListener('click', closeAFD);
  document.getElementById('afUrl')?.addEventListener('input', onAfUrlChange);
  document.getElementById('afFetchBtn')?.addEventListener('click', doFetch);
  document.querySelector('[data-hbtn="af-save"]')?.addEventListener('click', saveAF);
  document.querySelector('[data-hbtn="af-cancel"]')?.addEventListener('click', closeAFD);

  // AF stars
  document.getElementById('afStars')?.querySelectorAll('span').forEach((s,i) => {
    s.addEventListener('click', () => setStar('afStars', i+1));
  });

  // Add manual modal
  document.getElementById('addOverlay')?.addEventListener('click', closeAddOv);
  document.querySelector('#addOverlay .modal-close')?.addEventListener('click', closeAddD);
  document.querySelector('[data-hbtn="manual-save"]')?.addEventListener('click', saveManual);
  document.querySelector('[data-hbtn="manual-cancel"]')?.addEventListener('click', closeAddD);

  // Manual stars
  document.getElementById('fStars')?.querySelectorAll('span').forEach((s,i) => {
    s.addEventListener('click', () => setStar('fStars', i+1));
  });

  // Edit modal
  document.getElementById('editOverlay')?.addEventListener('click', closeEditOv);
  document.querySelector('#editOverlay .modal-close')?.addEventListener('click', closeEditD);
  document.querySelector('[data-hbtn="edit-save"]')?.addEventListener('click', saveEdit);
  document.querySelector('[data-hbtn="edit-cancel"]')?.addEventListener('click', closeEditD);
  document.querySelector('[data-hbtn="edit-thumb-refresh"]')?.addEventListener('click', refreshEditThumb);

  // Edit stars
  document.getElementById('eStars')?.querySelectorAll('span').forEach((s,i) => {
    s.addEventListener('click', () => setStar('eStars', i+1));
  });

  // eThumbImg onerror
  document.getElementById('eThumbImg')?.addEventListener('error', () => thumbImgError('eThumbImg','eThumbPh'));

  // ── INIT ──
  load();
  const hash = location.hash.replace('#','');
  const params = Object.fromEntries(hash.split('&').map(p => p.split('=')));
  if (params.cat) {
    const valid = CATS.find(c => c.id === params.cat);
    if (valid) activeCat = params.cat;
  }
  renderAll();
});
