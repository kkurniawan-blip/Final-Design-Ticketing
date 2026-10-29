/* Prototype viewer: screen list, phone/desktop frame, notes + state controls,
   "all screens" overview, design system and notes views. Hash routes: #<screenId>, #all, #system, #notes. */
(function () {
  'use strict';
  const { ic, esc } = P;
  const $ = (s, r = document) => r.querySelector(s);
  const SECTIONS = { A: 'Memulai', B: 'Merencanakan', C: 'Hamil', D: 'Jaring pengaman', E: 'Setelah lahir', F: 'Akun & keluarga', G: 'Portal mitra (desktop)' };
  const TONE_NAME = { plan: 'Coral · Merencanakan', preg: 'Berry · Hamil', baby: 'Aqua · Setelah lahir', neutral: 'Neutral · ink/plum', calm: 'Calm · slate' };
  const VIEWS = ['all', 'system', 'notes'];
  let view = 'proto', deskId = null, deskW = 1280, deskToast = '';

  /* ---------------------------------------------------------------- build chrome */
  const list = $('#vw-list'), sel = $('#vw-select');
  const groups = {};
  P.order.forEach((id) => { const s = P.screens[id]; (groups[s.sec] = groups[s.sec] || []).push(s); });
  Object.values(groups).forEach((g) => g.sort((a, b) => a.n - b.n));
  list.innerHTML = Object.entries(groups).map(([k, g]) => `<div class="vw-grp"><h2><span>${k}</span>${SECTIONS[k]}</h2><ul>${g.map((s) => `<li><a href="#${s.id}" data-id="${s.id}"><span class="n">${s.n}</span>${s.name}</a></li>`).join('')}</ul></div>`).join('');
  sel.innerHTML = Object.entries(groups).map(([k, g]) => `<optgroup label="${k} · ${SECTIONS[k]}">${g.map((s) => `<option value="${s.id}">${s.n}. ${s.name}</option>`).join('')}</optgroup>`).join('');
  sel.addEventListener('change', () => { location.hash = sel.value; });
  const flat = Object.values(groups).flat();
  const step = (d) => { const cur = deskId || P.cur(); const i = flat.findIndex((s) => s.id === cur); const n = flat[(i + d + flat.length) % flat.length]; location.hash = n.id; };
  $('#vw-prev').addEventListener('click', () => step(-1));
  $('#vw-next').addEventListener('click', () => step(1));

  P.mount($('#app'));
  P.focusOnNav = false;

  /* ---------------------------------------------------------------- notes panel */
  const notes = $('#vw-notes');
  function renderNotes(id) {
    const s = P.screens[id]; if (!s) return;
    const tone = s.desktop ? 'neutral' : P.toneOf(s);
    const st = P.S;
    notes.innerHTML = `<p class="vw-eyebrow">${s.sec}${s.n} · ${SECTIONS[s.sec]}</p><h2>${s.name}</h2>
      <p class="vw-tone"><i class="t-${tone}"></i>${TONE_NAME[tone]}${s.tone === 'shared' ? ' <small>(ikut tahap asal)</small>' : ''}${s.desktop ? ' · 1280 desktop' : ' · 390×844'}</p>
      <p class="vw-note">${s.notes || ''}</p>
      ${s.states && s.states.length ? `<h3>States to view</h3><div class="vw-states">${s.states.map((x, i) => `<button type="button" data-state="${i}">${x.label}</button>`).join('')}</div>` : ''}
      ${s.desktop ? `<h3>Frame width</h3><div class="vw-seg">${[1280, 1024, 768, 390].map((w) => `<button type="button" aria-pressed="${deskW === w}" data-w="${w}">${w}</button>`).join('')}</div>` : `
      <h3>Prototype state</h3>
      <div class="vw-ctl"><span>Mother’s stage</span><div class="vw-seg">${[['plan', 'Rencana'], ['preg', 'Hamil'], ['baby', 'Bayi']].map(([k, t]) => `<button type="button" aria-pressed="${st.stage === k}" data-stage="${k}">${t}</button>`).join('')}</div></div>
      <div class="vw-ctl"><span>User</span><div class="vw-seg">${[[true, 'Returning'], [false, 'New']].map(([v, t]) => `<button type="button" aria-pressed="${st.returning === v}" data-ret="${v}">${t}</button>`).join('')}</div></div>
      <div class="vw-ctl"><span>Phone clock</span><div class="vw-seg">${[['09.41', '09:41'], ['02.14', '02:14']].map(([v, t]) => `<button type="button" aria-pressed="${st.clock === v}" data-clock="${v}">${t}</button>`).join('')}</div></div>
      <div class="vw-ctl"><span>Night display</span><div class="vw-seg">${[['auto', 'Auto'], ['on', 'On'], ['off', 'Off']].map(([v, t]) => `<button type="button" aria-pressed="${st.night === v}" data-night="${v}">${t}</button>`).join('')}</div></div>
      <label class="vw-ctl vw-tog"><span>Ditanggung (covered)</span><input type="checkbox" id="vw-cov" ${st.covered ? 'checked' : ''}></label>
      <label class="vw-ctl vw-tog"><span>Test-session content (fictional)</span><input type="checkbox" id="vw-test" ${st.testContent ? 'checked' : ''}></label>
      <div class="vw-ctl"><span>Free Tanya quota</span><div class="vw-seg">${[3, 1, 0].map((q) => `<button type="button" aria-pressed="${st.quota === q}" data-quota="${q}">${q}</button>`).join('')}</div></div>
      <label class="vw-ctl vw-tog"><span>Preview reduced motion</span><input type="checkbox" id="vw-rm" ${st.reduce ? 'checked' : ''}></label>`}
      ${s.desktop ? '' : `<button type="button" class="vw-reset" id="vw-fs">${ic('device', 16)}Full-screen test mode</button>`}
      <button type="button" class="vw-reset" id="vw-reset">${ic('refresh', 16)}Reset prototype</button>`;
  }
  notes.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const id = deskId || P.cur(), s = P.screens[id];
    if (b.dataset.state !== undefined) {
      const x = s.states[+b.dataset.state];
      if (x.state) x.state(P.S);
      P.go(id, { replace: true });
      if (x.state) { x.state(P.S); P.rerender(); }
      if (x.sheet) P.openSheet(x.sheet, x.sheetArg);
    } else if (b.dataset.stage) { P.S.stage = b.dataset.stage; P.S.ai = null; P.S.bidan = null; P.S.emergTab = null; P.go(id, { replace: true }); }
    else if (b.dataset.quota) { P.S.quota = +b.dataset.quota; P.rerender(); }
    else if (b.dataset.ret) { P.S.returning = b.dataset.ret === 'true'; P.S.ai = null; P.S.bidan = null; P.S.followup = P.S.returning ? { preg: 'pusing', baby: 'si kecil rewel' } : { preg: null, baby: null }; P.go(id, { replace: true }); }
    else if (b.dataset.clock) { P.S.clock = b.dataset.clock; P.go(id, { replace: true }); }
    else if (b.dataset.night) { P.S.night = b.dataset.night; P.rerender(); }
    else if (b.id === 'vw-fs') { setFull(true); }
    else if (b.dataset.w) { deskW = +b.dataset.w; showDesk(deskId); }
    else if (b.id === 'vw-reset') { P.S = P.defaults(); P.resetHistory(); location.hash = 'welcome'; route(); }
    renderNotes(id);
  });
  notes.addEventListener('change', (e) => {
    if (e.target.id === 'vw-cov') { P.S.covered = e.target.checked; P.rerender(); }
    if (e.target.id === 'vw-rm') { P.S.reduce = e.target.checked; P.rerender(); }
    if (e.target.id === 'vw-test') { P.S.testContent = e.target.checked; P.rerender(); }
  });

  /* ---------------------------------------------------------------- nav sync */
  function mark(id) {
    list.querySelectorAll('a').forEach((a) => { if (a.dataset.id === id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    const a = list.querySelector(`a[data-id="${id}"]`); if (a && view === 'proto') a.scrollIntoView({ block: 'nearest' });
    sel.value = id;
    renderNotes(id);
  }
  P.onNav = (id) => {
    deskId = null; $('#vw-phone').hidden = false; $('#vw-desk').hidden = true;
    if (location.hash.slice(1) !== id) history.replaceState(null, '', '#' + id);
    mark(id); fit();
  };
  P.onDesktop = (id) => showDesk(id);

  /* ---------------------------------------------------------------- desktop frame */
  const desk = $('#vw-desk');
  function showDesk(id) {
    deskId = id; $('#vw-phone').hidden = true; desk.hidden = false;
    desk.innerHTML = `<div class="desk-scale"><div class="desk-frame" style="width:${deskW}px">${P.screens[id].renderDesk()}${deskToast ? `<div class="desk-toast" role="status">${ic('checkc', 18)}${deskToast}</div>` : ''}</div></div>`;
    if (location.hash.slice(1) !== id) history.replaceState(null, '', '#' + id);
    mark(id); fit();
  }
  desk.addEventListener('click', (e) => {
    const t = e.target.closest('[data-dact]'); if (!t) return; e.preventDefault();
    const msg = P.dacts[t.dataset.dact] && P.dacts[t.dataset.dact](t);
    deskToast = typeof msg === 'string' ? msg : '';
    showDesk(deskId);
    if (deskToast) setTimeout(() => { deskToast = ''; const n = desk.querySelector('.desk-toast'); if (n) n.remove(); }, 3000);
  });
  desk.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('tr[data-dact]')) { e.preventDefault(); e.target.click(); } });

  /* ---------------------------------------------------------------- full-screen test mode (for sessions with mothers) */
  function setFull(on) {
    document.body.classList.toggle('fullscreen', on);
    if (on) { P.S.testContent = true; P.rerender(); }
    fit(); renderNotes(deskId || P.cur());
  }
  $('#vw-exit').addEventListener('click', () => setFull(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('fullscreen') && !$('#app').contains(e.target)) setFull(false); });

  /* ---------------------------------------------------------------- scale to fit */
  function fit() {
    const stage = $('#vw-stage'); if (!stage || view !== 'proto') return;
    const full = document.body.classList.contains('fullscreen');
    const narrow = window.innerWidth < 760 && !full;
    const w = full ? window.innerWidth : stage.clientWidth - (narrow ? 0 : 32), h = full ? window.innerHeight : narrow ? Infinity : stage.clientHeight - 32;
    if (!deskId) {
      const bare = full && window.innerWidth <= 500, BW = bare ? 390 : 410, BH = bare ? 844 : 864;
      const s = full ? Math.min(w / BW, h / BH) : Math.min(1, w / BW, h / BH);
      const ph = $('#vw-phone'); ph.style.width = BW * s + 'px'; ph.style.height = BH * s + 'px';
      $('#vw-bezel').style.transform = `scale(${s})`;
    } else {
      const fr = desk.querySelector('.desk-frame'), sc = desk.querySelector('.desk-scale'); if (!fr) return;
      const H = 820, s = Math.min(1, w / deskW, narrow ? 1 : h / H);
      fr.style.height = H + 'px'; fr.style.transform = `scale(${s})`;
      sc.style.width = deskW * s + 'px'; sc.style.height = H * s + 'px';
    }
  }
  window.addEventListener('resize', fit);

  /* ---------------------------------------------------------------- overview grid */
  let gridBuilt = false;
  function buildGrid() {
    if (gridBuilt) return; gridBuilt = true;
    const out = [];
    Object.entries(groups).forEach(([k, g]) => {
      const items = [];
      g.forEach((s) => {
        if (s.desktop) { items.push(`<figure class="thumb desk-thumb"><a href="#${s.id}" aria-label="Buka ${s.n}. ${s.name}"><div class="tframe" inert aria-hidden="true"><div class="desk-frame" style="width:1280px;height:820px">${s.renderDesk()}</div></div></a><figcaption><b>${s.n}</b> ${s.name}</figcaption></figure>`); return; }
        const variants = [{ label: '' }].concat(s.states || []);
        variants.forEach((v) => {
          let html; try { html = P.staticScreen(s.id, v.label ? v : null); } catch (err) { html = `<div class="scr"><p style="padding:60px 20px">Render error: ${esc(err.message)}</p></div>`; }
          items.push(`<figure class="thumb"><a href="#${s.id}" aria-label="Buka ${s.n}. ${s.name}${v.label ? ' · ' + v.label : ''}"><div class="tframe" inert aria-hidden="true">${html}</div></a><figcaption><b>${s.n}</b> ${s.name}${v.label ? `<small>${v.label}</small>` : ''}</figcaption></figure>`);
        });
      });
      out.push(`<section class="vw-allsec"><h2><span>${k}</span>${SECTIONS[k]}</h2><div class="thumbs">${items.join('')}</div></section>`);
    });
    $('#view-all').innerHTML = `<div class="vw-allhead"><h1>All screens</h1><p>${P.order.length} screens grouped A–G, plus key states. Select any frame to open it in the clickable prototype.</p></div>${out.join('')}`;
  }

  /* ---------------------------------------------------------------- routing */
  function setView(v) {
    view = v;
    ['proto', 'all', 'system', 'notes'].forEach((x) => { $('#view-' + x).hidden = x !== v; });
    document.querySelectorAll('.vw-tabs a').forEach((a) => { if (a.dataset.view === v) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    document.body.dataset.view = v;
  }
  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (VIEWS.includes(h)) {
      setView(h);
      if (h === 'all') buildGrid();
      if (h === 'system' && !$('#view-system').innerHTML) $('#view-system').innerHTML = P.docs.system();
      if (h === 'notes' && !$('#view-notes').innerHTML) $('#view-notes').innerHTML = P.docs.notes();
      window.scrollTo(0, 0);
      return;
    }
    setView('proto');
    const id = P.screens[h] ? h : 'welcome';
    if (P.screens[id].desktop) showDesk(id);
    else if (P.cur() !== id || deskId) P.go(id);
    else { mark(id); fit(); }
  }
  $('#vw-proto-tab').addEventListener('click', (e) => { e.preventDefault(); location.hash = deskId || P.cur() || 'welcome'; });
  window.addEventListener('hashchange', route);
  route();
  try { if (new URLSearchParams(location.search).has('test')) setFull(true); } catch (_) {}
  requestAnimationFrame(fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
})();
