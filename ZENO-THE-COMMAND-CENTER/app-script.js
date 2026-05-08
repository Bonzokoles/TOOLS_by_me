// ── THEMES ────────────────────────────────────────────────────────────────────
const THEMES = {
  'firefly-pro-ember': {
    label: 'Firefly Ember',
    bg: '#090705', bg2: '#100c07', bg3: '#1e1408',
    border: '#2e2018', border2: '#524438',
    accent: '#ff9a3c', accent2: '#ffb347', accentDim: '#ff9a3c18',
    text: '#e0d0c0', text2: '#7a6a58', text3: '#524438',
    palette: ['#ff9a3c','#ffb347','#ffd166','#d4632a','#c0522a','#7a6a58','#2e2018','#090705'],
  },
  'linear': {
    label: 'Linear',
    bg: '#010102', bg2: '#0f1011', bg3: '#141516',
    border: '#23252a', border2: '#34343a',
    accent: '#5e6ad2', accent2: '#828fff', accentDim: '#5e6ad222',
    text: '#f7f8f8', text2: '#d0d6e0', text3: '#8a8f98',
    palette: ['#5e6ad2','#828fff','#4bcffa','#f2994a','#eb5757','#27ae60','#23252a','#010102'],
  },
  'framer': {
    label: 'Framer',
    bg: '#090909', bg2: '#141414', bg3: '#1c1c1c',
    border: '#2a2a2a', border2: '#333333',
    accent: '#0099ff', accent2: '#d44df0', accentDim: '#0099ff22',
    text: '#ffffff', text2: '#999999', text3: '#555555',
    palette: ['#0099ff','#d44df0','#00e5ff','#ff3d71','#ffaa00','#00d68f','#2a2a2a','#090909'],
  },
  'bugatti': {
    label: 'Bugatti',
    bg: '#000000', bg2: '#0d0d0d', bg3: '#141414',
    border: '#1f1f1f', border2: '#2a2a2a',
    accent: '#ffffff', accent2: '#c3d9f3', accentDim: '#ffffff11',
    text: '#ffffff', text2: '#cccccc', text3: '#666666',
    palette: ['#ffffff','#c3d9f3','#aaaaaa','#888888','#555555','#333333','#1f1f1f','#000000'],
  },
};

const THEME_KEYS = Object.keys(THEMES);
let currentThemeKey = localStorage.getItem('zeno-theme') || 'firefly-pro-ember';

function applyTheme(key) {
  const t = THEMES[key];
  if (!t) return;
  currentThemeKey = key;
  localStorage.setItem('zeno-theme', key);
  const r = document.documentElement;
  r.style.setProperty('--bg',         t.bg);
  r.style.setProperty('--bg2',        t.bg2);
  r.style.setProperty('--bg3',        t.bg3);
  r.style.setProperty('--border',     t.border);
  r.style.setProperty('--border2',    t.border2);
  r.style.setProperty('--accent',     t.accent);
  r.style.setProperty('--accent2',    t.accent2);
  r.style.setProperty('--accent-dim', t.accentDim);
  r.style.setProperty('--text',       t.text);
  r.style.setProperty('--text2',      t.text2);
  r.style.setProperty('--text3',      t.text3);

  // scanline tint
  document.body.style.cssText = '';
  const scanColor = t.accent + '12';
  // palette swatches
  const pal = document.getElementById('tp-palette');
  if (pal) {
    pal.innerHTML = t.palette.map(hex =>
      `<div class="tp-swatch" style="background:${hex}" data-hex="${hex}" title="${hex}"></div>`
    ).join('');
  }
  // terminal
  const term = document.getElementById('tp-terminal');
  if (term) {
    term.innerHTML = `
      <div class="tp-line"><span class="tp-prompt">&gt;</span> <span class="tp-comment">load_theme('${key}')</span></div>
      <div class="tp-line"><span class="tp-comment">// accent: ${t.accent}</span></div>
      <div class="tp-line"><span class="tp-keyword">vars</span> {</div>
      <div class="tp-line">&nbsp;&nbsp;bg: <span class="tp-comment">${t.bg}</span></div>
      <div class="tp-line">&nbsp;&nbsp;accent: <span class="tp-comment">${t.accent}</span></div>
      <div class="tp-line">&nbsp;&nbsp;text: <span class="tp-comment">${t.text}</span></div>
      <div class="tp-line">}</div>
    `;
  }
  const footer = document.getElementById('footer-theme');
  if (footer) footer.textContent = 'ZENO · ' + (t.label || key);
  document.getElementById('theme-select').value = key;
}

function buildThemeSelect() {
  const sel = document.getElementById('theme-select');
  sel.innerHTML = THEME_KEYS.map(k =>
    `<option value="${k}">${THEMES[k].label}</option>`
  ).join('');
  sel.value = currentThemeKey;
  sel.addEventListener('change', () => applyTheme(sel.value));
}

// ── CLOCK ─────────────────────────────────────────────────────────────────────
function tick() {
  const n = new Date();
  const pad = x => String(x).padStart(2, '0');
  document.getElementById('clock').textContent =
    pad(n.getHours()) + ':' + pad(n.getMinutes()) + ':' + pad(n.getSeconds());
  const days   = ['Nd','Pn','Wt','Sr','Cz','Pt','So'];
  const months = ['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paz','lis','gru'];
  document.getElementById('date').textContent =
    days[n.getDay()] + ' ' + n.getDate() + ' ' + months[n.getMonth()] + ' ' + n.getFullYear();
}
tick(); setInterval(tick, 1000);

// ── SEARCH ────────────────────────────────────────────────────────────────────
const ENGINES = [
  { id:'brave',   label:'Brave',      url: q => 'https://search.brave.com/search?q=' + encodeURIComponent(q) },
  { id:'ddg',     label:'DuckDuckGo', url: q => 'https://duckduckgo.com/?q=' + encodeURIComponent(q) },
  { id:'google',  label:'Google',     url: q => 'https://www.google.com/search?q=' + encodeURIComponent(q) },
  { id:'searxng', label:'SearXNG',    url: q => 'http://localhost:8888/search?q=' + encodeURIComponent(q) },
  { id:'perp',    label:'Perplexity', url: q => 'https://www.perplexity.ai/search?q=' + encodeURIComponent(q) },
];
let activeEngine = localStorage.getItem('zeno-engine') || 'brave';

const CATALOG_URL = 'chrome-extension://' + chrome.runtime.id + '/apps-catalog.html';
const CATALOG_CATS = [
  { id: 'all', label: 'App Catalog', main: true },
  { id: 'ai',          label: 'AI' },
  { id: 'dev',         label: 'Dev' },
  { id: 'design',      label: 'Design' },
  { id: 'cloud',       label: 'Cloud' },
];

function renderEngines() {
  const ec = document.getElementById('engines');
  ec.innerHTML = '';

  // search engines
  ENGINES.forEach(e => {
    const b = document.createElement('button');
    b.className = 'eng-btn' + (e.id === activeEngine ? ' active' : '');
    b.textContent = e.label;
    b.onclick = () => { activeEngine = e.id; localStorage.setItem('zeno-engine', e.id); renderEngines(); };
    ec.appendChild(b);
  });

  // spacer pushes catalog to right
  const sep = document.createElement('span');
  sep.style.cssText = 'flex:1';
  ec.appendChild(sep);

  // catalog buttons
  CATALOG_CATS.forEach(c => {
    const b = document.createElement('button');
    b.className = 'eng-btn' + (c.main ? ' active' : '');
    b.style.cssText = c.main ? 'border-color:var(--accent);color:var(--accent)' : '';
    b.textContent = (c.main ? '⊞ ' : '') + c.label;
    b.onclick = () => {
      const url = c.id === 'all' ? CATALOG_URL : CATALOG_URL + '#cat=' + c.id;
      const a = Object.assign(document.createElement('a'), { href: url, target: '_blank', rel: 'noopener' });
      document.body.appendChild(a); a.click(); a.remove();
    };
    ec.appendChild(b);
  });

  // separator + BRO Lab button
  const sep2 = document.createElement('span');
  sep2.style.cssText = 'width:1px;height:12px;background:var(--border2);margin:0 4px;flex-shrink:0';
  ec.appendChild(sep2);
  const lab = document.createElement('button');
  lab.className = 'eng-btn';
  lab.style.cssText = 'border-color:#27a644;color:#27a644';
  lab.textContent = '[ BRO Lab ]';
  lab.title = 'THE_BRO_wser_lab — localhost:5152';
  lab.onclick = () => {
    const a = Object.assign(document.createElement('a'), { href: 'http://localhost:5152/index.html', target: '_blank', rel: 'noopener' });
    document.body.appendChild(a); a.click(); a.remove();
  };
  ec.appendChild(lab);
}

function doSearch() {
  const q = document.getElementById('q').value.trim();
  if (!q) return;
  const eng = ENGINES.find(e => e.id === activeEngine) || ENGINES[0];
  window.open(eng.url(q), '_top');
}
document.getElementById('go-btn').onclick = doSearch;
document.getElementById('q').addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
renderEngines();

// ── QUICK LINKS ───────────────────────────────────────────────────────────────
const QLINKS = [
  { icon:'⌘', label:'GitHub',          url:'https://github.com' },
  { icon:'✺', label:'Claude Code',      url:'https://claude.ai/code' },
  { icon:'▣', label:'Cloudflare',       url:'https://dash.cloudflare.com' },
  { icon:'◉', label:'JIMBO Hub :4111',  url:'http://localhost:4111' },
  { icon:'△', label:'Hacker News',      url:'https://news.ycombinator.com' },
  { icon:'◆', label:'MDN Web Docs',     url:'https://developer.mozilla.org' },
  { icon:'⊛', label:'Vercel',           url:'https://vercel.com' },
  { icon:'▸', label:'Podman Desktop',   url:'https://podman-desktop.io' },
  { icon:'⊞', label:'App Catalog',      url:'file:///V:/GIT_HOOB_catalogi/apps-catalog.html' },
];
(function renderQlinks() {
  const ql = document.getElementById('qlinks');
  QLINKS.forEach(l => {
    const b = document.createElement('button');
    b.className = 'qlink';
    b.innerHTML = '<span class="qlink-icon">' + l.icon + '</span>' + l.label;
    b.onclick = () => window.open(l.url, '_top');
    ql.appendChild(b);
  });
})();

// ── CHAT CARDS ────────────────────────────────────────────────────────────────
const CHATS = [
  { name:'Claude',     desc:'Anthropic · Sonnet 4.6', url:'https://claude.ai',           icon:'✺', tag:'reasoning' },
  { name:'ChatGPT',   desc:'OpenAI · GPT-4o',         url:'https://chat.openai.com',     icon:'⊛', tag:'generalist' },
  { name:'Gemini',    desc:'Google · 2.5 Pro',         url:'https://gemini.google.com',   icon:'◈', tag:'multimodal' },
  { name:'Perplexity',desc:'AI Search',                url:'https://perplexity.ai',       icon:'◉', tag:'web search' },
  { name:'Grok',      desc:'xAI · Grok 3',             url:'https://grok.com',            icon:'⊕', tag:'realtime' },
  { name:'DeepSeek',  desc:'DeepSeek · R1',            url:'https://chat.deepseek.com',   icon:'▣', tag:'reasoning' },
  { name:'Ollama',    desc:'Lokalny · offline',         url:'http://localhost:11434',      icon:'▸', tag:'local LLM' },
  { name:'OpenRouter',desc:'300+ modeli',               url:'https://openrouter.ai/chat',  icon:'◆', tag:'multi-model' },
  { name:'LM Studio', desc:'Lokalny GUI',               url:'http://localhost:1234',       icon:'◇', tag:'local' },
];
(function renderChats() {
  const grid = document.getElementById('chats-grid');
  CHATS.forEach(c => {
    const a = document.createElement('a');
    a.className = 'chat-card';
    a.href = c.url;
    a.target = '_top';
    a.innerHTML =
      '<div class="chat-card-top">' +
        '<div class="chat-icon">' + c.icon + '</div>' +
        '<div><div class="chat-name">' + c.name + '</div><div class="chat-desc">' + c.desc + '</div></div>' +
      '</div>' +
      '<span class="chat-tag">' + c.tag + '</span>';
    grid.appendChild(a);
  });
})();

// ── SITE PINGS ────────────────────────────────────────────────────────────────
[{id:'s1',url:'https://zenbrowsers.org'},{id:'s2',url:'https://stolarnia-ams.workers.dev'},{id:'s3',url:'http://localhost:4111/health'},{id:'s4',url:'http://localhost:8888'}]
.forEach(s => {
  fetch(s.url, { method:'HEAD', mode:'no-cors', signal: AbortSignal.timeout(3000) })
    .then(() => document.getElementById(s.id).classList.add('green'))
    .catch(() => document.getElementById(s.id).classList.add('red'));
});

// ── FONT SELECTOR ─────────────────────────────────────────────────────────────
document.getElementById('font-select').addEventListener('change', function() {
  document.documentElement.style.setProperty('--font-main', this.value);
  localStorage.setItem('zeno-font', this.value);
});
(function() {
  const saved = localStorage.getItem('zeno-font');
  if (saved) {
    document.documentElement.style.setProperty('--font-main', saved);
    document.getElementById('font-select').value = saved;
  }
})();

// ── FULLSCREEN ────────────────────────────────────────────────────────────────
document.getElementById('btn-fullscreen').addEventListener('click', function() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
    this.classList.add('active');
  } else {
    document.exitFullscreen();
    this.classList.remove('active');
  }
});
document.getElementById('btn-refresh').onclick = () => location.reload();

// ── INIT THEMES + DEV TERMINAL ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {

  buildThemeSelect();
  applyTheme(currentThemeKey);

  // ── DEV toggle ──
  document.getElementById('btn-dev').addEventListener('click', function() {
    const p = document.getElementById('dev-panel');
    const open = p.style.display === 'none' || p.style.display === '';
    p.style.display = open ? 'block' : 'none';
    this.classList.toggle('active', open);
    if (open) edCSS.focus();
  });

  const LS_CSS = 'zeno-dev-css', LS_JS = 'zeno-dev-js';
  const styleEl = document.querySelector('style');
  const __origCSS = styleEl ? styleEl.textContent.trim() : '';

  const savedCSS = localStorage.getItem(LS_CSS);
  const savedJS  = localStorage.getItem(LS_JS);
  if (savedCSS) {
    let el = document.getElementById('zeno-user-css');
    if (!el) { el = document.createElement('style'); el.id = 'zeno-user-css'; document.head.appendChild(el); }
    el.textContent = savedCSS;
  }
  if (savedJS) { try { eval(savedJS); } catch(e) { console.warn('zeno-dev-js:', e); } }

  const edCSS  = document.getElementById('ed-css');
  const edJS   = document.getElementById('ed-js');
  const edHTML = document.getElementById('ed-html');
  const edAI   = document.getElementById('ed-ai');
  const devSt  = document.getElementById('dev-status');

  edCSS.value = savedCSS || __origCSS;
  edJS.value  = savedJS  || '// JavaScript — wykona sie przy RUN\n';

  function devStatus(msg, color) {
    devSt.textContent = msg;
    devSt.style.color = color || 'var(--text3)';
    if (color) setTimeout(() => { devSt.style.color = 'var(--text3)'; devSt.textContent = 'ready · Tab = indent · Ctrl+Enter = run'; }, 3000);
  }

  [edCSS, edJS].forEach(ta => {
    ta.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const s = ta.selectionStart, end = ta.selectionEnd;
        ta.value = ta.value.substring(0,s) + '  ' + ta.value.substring(end);
        ta.selectionStart = ta.selectionEnd = s + 2;
      }
      if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); applyChanges(); }
    });
  });

  function applyChanges() {
    const css = edCSS.value, js = edJS.value;
    let el = document.getElementById('zeno-user-css');
    if (!el) { el = document.createElement('style'); el.id = 'zeno-user-css'; document.head.appendChild(el); }
    el.textContent = css;
    localStorage.setItem(LS_CSS, css);
    localStorage.setItem(LS_JS, js);
    try { eval(js); devStatus('Applied — CSS live, JS executed', 'var(--accent)'); }
    catch(e) { devStatus('JS error: ' + e.message, '#ff4f4f'); }
  }

  document.getElementById('dev-apply').onclick = applyChanges;
  document.getElementById('dev-reset').onclick = () => {
    localStorage.removeItem(LS_CSS); localStorage.removeItem(LS_JS);
    const el = document.getElementById('zeno-user-css'); if (el) el.remove();
    edCSS.value = __origCSS; edJS.value = '// JavaScript\n';
    devStatus('Reset — zmiany usuniete', 'var(--accent2)');
  };
  document.getElementById('dev-save').onclick = () => {
    navigator.clipboard.writeText(document.documentElement.outerHTML)
      .then(() => devStatus('HTML skopiowany do schowka', 'var(--accent)'))
      .catch(() => devStatus('Clipboard error', '#ff4f4f'));
  };

  // ── Tab switching ──
  document.querySelectorAll('.dev-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.dataset.tab;
      document.querySelectorAll('.dev-tab').forEach(b => {
        b.classList.remove('active');
        b.style.color = b.classList.contains('dev-tab-ai') ? '#ffd16666' : 'var(--text3)';
        b.style.borderBottomColor = 'transparent';
      });
      btn.classList.add('active');
      btn.style.color   = t === 'ai' ? '#ffd166' : 'var(--accent)';
      btn.style.borderBottomColor = t === 'ai' ? '#ffd166' : 'var(--accent)';

      edCSS.style.display  = t === 'css'  ? 'block' : 'none';
      edJS.style.display   = t === 'js'   ? 'block' : 'none';
      edHTML.style.display = t === 'html' ? 'block' : 'none';
      edAI.style.display   = t === 'ai'   ? 'flex'  : 'none';
      devSt.style.display  = t === 'ai'   ? 'none'  : 'block';

      if (t === 'html') edHTML.value = '<!-- read-only preview -->\n' + document.documentElement.outerHTML.substring(0, 4000) + '...';
      if (t === 'ai')   { aiInitKey(); document.getElementById('ai-input').focus(); }
    });
  });

  // ── AI TAB ────────────────────────────────────────────────────────────────
  const LS_AI_KEY   = 'zeno-ai-key';
  const LS_AI_MODEL = 'zeno-ai-model';
  const NOTES_PATH  = 'C:\\Users\\Bonzo2\\Desktop\\NOTATKI.md';
  const JIMBO_URL   = 'http://localhost:4111';

  function aiInitKey() {
    const k = localStorage.getItem(LS_AI_KEY) || '';
    const m = localStorage.getItem(LS_AI_MODEL) || 'openai/gpt-4o';
    document.getElementById('ai-key-input').value = k ? '••••••••' : '';
    document.getElementById('ai-model-sel').value = m;
  }

  document.getElementById('ai-key-save').onclick = () => {
    const v = document.getElementById('ai-key-input').value.trim();
    const m = document.getElementById('ai-model-sel').value;
    if (v && v !== '••••••••') localStorage.setItem(LS_AI_KEY, v);
    localStorage.setItem(LS_AI_MODEL, m);
    aiStatus('Klucz i model zapisane', 'var(--accent)');
  };

  function aiStatus(msg, color) {
    const s = document.getElementById('ai-status');
    s.textContent = msg; s.style.color = color || 'var(--text3)';
    if (color) setTimeout(() => { s.style.color = 'var(--text3)'; s.textContent = 'ready · Ctrl+Enter = send'; }, 4000);
  }

  function aiAddMsg(role, text, looksCSS) {
    const hist = document.getElementById('ai-history');
    const el = document.createElement('div');
    el.className = 'ai-msg ' + (role === 'user' ? 'from-user' : 'from-ai');
    const label = document.createElement('span');
    label.className = 'ai-msg-label';
    label.textContent = role === 'user' ? 'TY' : 'AI';
    el.appendChild(label);
    const body = document.createTextNode(text);
    el.appendChild(body);
    if (looksCSS) {
      const btn = document.createElement('button');
      btn.className = 'ai-apply-btn';
      btn.textContent = '▶ APPLY CSS';
      btn.onclick = () => {
        edCSS.value = text;
        let s = document.getElementById('zeno-user-css');
        if (!s) { s = document.createElement('style'); s.id = 'zeno-user-css'; document.head.appendChild(s); }
        s.textContent = text;
        localStorage.setItem(LS_CSS, text);
        aiStatus('CSS zastosowany', 'var(--accent)');
      };
      el.appendChild(btn);
    }
    hist.appendChild(el);
    hist.scrollTop = hist.scrollHeight;
  }

  async function aiSaveNote(text) {
    const ts = new Date().toISOString().slice(0,16).replace('T',' ');
    const line = '\n- [' + ts + '] ' + text.trim();
    try {
      const r = await fetch(JIMBO_URL + '/fs/append', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ path: NOTES_PATH, content: line })
      });
      if (r.ok) return true;
      const rr = await fetch(JIMBO_URL + '/fs/read', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ path: NOTES_PATH })
      });
      const prev = rr.ok ? ((await rr.json()).content || '# NOTATKI\n') : '# NOTATKI\n';
      await fetch(JIMBO_URL + '/fs/write', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ path: NOTES_PATH, content: prev + line })
      });
      return true;
    } catch { return false; }
  }

  async function aiSend() {
    const key   = localStorage.getItem(LS_AI_KEY);
    const model = localStorage.getItem(LS_AI_MODEL) || 'openai/gpt-4o';
    const input = document.getElementById('ai-input');
    const msg   = input.value.trim();
    if (!msg) return;
    if (!key) { aiStatus('Wpisz klucz OpenRouter i kliknij SAVE!', '#ff4f4f'); return; }

    aiAddMsg('user', msg);
    input.value = '';
    aiStatus('Mysle...', 'var(--accent2)');

    const isNote = /^(zapisz|notuj|notatka|note|dodaj|pamietaj)\s*[:–-]?\s*/i.test(msg);
    const isCSS  = /css|styl|kolor|czcionk|font|rozmiar|margin|padding|border|background|wygla|karta/i.test(msg);

    const sysPrompt = isNote
      ? 'Extract the clean note text and reply ONLY: SAVE_NOTE: <the note text>. No other text.'
      : isCSS
      ? 'You are a CSS expert for a dark sci-fi web dashboard. Output ONLY raw CSS (no markdown fences, no explanation). The CSS will be injected directly.'
      : 'You are a helpful assistant in ZENO Start browser dashboard. Answer concisely in the user language. For CSS: output only CSS. For notes: SAVE_NOTE: <text>.';

    try {
      const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization':'Bearer ' + key,
          'HTTP-Referer':'chrome-extension://bflpfmnmnokmjhmgnolecpppdbdophmk',
          'X-Title':'ZENO Start'
        },
        body: JSON.stringify({ model, messages:[{role:'system',content:sysPrompt},{role:'user',content:msg}], max_tokens:1400 })
      });
      if (!resp.ok) { aiStatus('Blad API: ' + resp.status, '#ff4f4f'); return; }
      const data = await resp.json();
      const reply = data.choices?.[0]?.message?.content?.trim() || '(brak odpowiedzi)';

      if (reply.startsWith('SAVE_NOTE:')) {
        const noteText = reply.replace(/^SAVE_NOTE:\s*/i, '').trim();
        const ok = await aiSaveNote(noteText);
        aiAddMsg('ai', ok ? 'Zapisano: "' + noteText + '"' : 'JIMBO offline. Notatka: "' + noteText + '"');
        aiStatus(ok ? 'Zapisano do NOTATKI.md' : 'Blad JIMBO — skopiuj recznie', ok ? 'var(--accent)' : '#ff4f4f');
      } else {
        const looksCSS = isCSS && /[{}:;]/.test(reply);
        aiAddMsg('ai', reply, looksCSS);
        aiStatus('Gotowe', 'var(--accent)');
      }
    } catch(e) {
      aiStatus('Blad: ' + e.message, '#ff4f4f');
    }
  }

  document.getElementById('ai-send').onclick = aiSend;
  document.getElementById('ai-input').addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); aiSend(); }
  });

  // global Ctrl+Enter for dev panel
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'Enter' && document.getElementById('dev-panel').style.display === 'block') {
      const activeTab = document.querySelector('.dev-tab.active');
      if (activeTab && activeTab.dataset.tab !== 'ai') applyChanges();
    }
  });

});
