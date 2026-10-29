/* Sections A (Getting started) and B (Planning, coral). */
(function () {
  'use strict';
  const { ic, esc, btn, chip, sw, field, seg, src, sos, hdr } = P;

  /* ======================================================================
     A1 · Selamat datang
     ====================================================================== */
  const ART = {
    plan: `<svg viewBox="0 0 240 190" width="240" height="190" aria-hidden="true">
      <rect x="18" y="64" width="204" height="34" rx="17" fill="#FF8A6B" opacity=".28"/>
      ${[0, 1, 2, 3, 4, 5].map((c) => [0, 1, 2, 3].map((r) => { const x = 36 + c * 34, y = 30 + r * 46; const p = r === 0 && c < 3; return `<circle cx="${x}" cy="${y}" r="11" fill="${p ? '#C04A1A' : '#fff'}" stroke="${p ? 'none' : '#7A6A7D'}" stroke-opacity=".4"/>`; }).join('')).join('')}
      <rect x="161" y="70" width="22" height="22" rx="5" transform="rotate(45 172 81)" fill="#fff" stroke="#8F3210" stroke-width="2.5"/>
      <circle cx="172" cy="81" r="22" fill="none" stroke="#FF8A6B" stroke-width="1.2" opacity=".7"/></svg>`,
    preg: `<svg viewBox="0 0 240 200" width="240" height="200" aria-hidden="true">
      <circle cx="120" cy="100" r="78" fill="none" stroke="#2A1830" stroke-opacity=".08" stroke-width="10"/>
      <circle cx="120" cy="100" r="78" fill="none" stroke="#C86DD7" stroke-width="10" stroke-linecap="round" stroke-dasharray="172 490" transform="rotate(-90 120 100)"/>
      <circle cx="120" cy="100" r="78" fill="none" stroke="#8E2A8B" stroke-width="2" stroke-linecap="round" stroke-dasharray="172 490" transform="rotate(-90 120 100)"/>
      <circle cx="194" cy="76" r="9" fill="#fff" stroke="#8E2A8B" stroke-width="3"/>
      <text x="120" y="112" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-weight="600" font-size="44" fill="#2A1830">14</text>
      <text x="120" y="136" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-weight="600" font-size="13" fill="#5E4B62">minggu</text></svg>`,
    baby: `<svg viewBox="0 0 240 190" width="240" height="190" aria-hidden="true">
      <path d="M20 150 L220 40 L220 90 L20 175 Z" fill="#34D6A6" opacity=".22"/>
      <polyline points="24,160 70,130 116,108 162,88 208,70" fill="none" stroke="#34D6A6" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity=".45"/>
      <polyline points="24,160 70,130 116,108 162,88 208,70" fill="none" stroke="#0B7A5C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${[[24, 160], [70, 130], [116, 108], [162, 88]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#fff" stroke="#0B7A5C" stroke-width="2"/>`).join('')}
      <circle cx="208" cy="70" r="9" fill="#fff" stroke="#0B7A5C" stroke-width="3"/></svg>`
  };
  const SLIDES = [
    ['plan', 'Rencanakan dengan tenang', 'Kenali siklusmu dan siapkan biaya sejak awal.', '#FF8A6B'],
    ['preg', 'Temani tiap minggu kehamilan', 'Kontrol, panduan, dan bidan siap saat kamu ragu.', '#C86DD7'],
    ['baby', 'Tumbuh bersama si kecil', 'Pantau tumbuh kembang sampai usia 2 tahun.', '#34D6A6']
  ];
  P.def({
    id: 'welcome', sec: 'A', n: 1, name: 'Selamat datang', tone: 'neutral', orbs: 'welcome', drift: true,
    notes: 'Orbs drift slowly (18–24s) here only. Each slide carries one stage colour; illustrations are solid shapes on glass, no gradients. The emergency line links straight to the calm emergency screen even before sign-up.',
    render: () => ({
      main: `<div class="body nohdr rise" style="gap:20px">
        <div class="center" style="margin-top:6px">${P.logo(40, true, 30)}</div>
        <h1 class="sr" tabindex="-1" data-focus>Selamat datang di Peluky</h1>
        <div class="carousel" id="wel-car" aria-roledescription="carousel" aria-label="Pengenalan Peluky">
          ${SLIDES.map(([k, t, d], i) => `<section class="slide" aria-roledescription="slide" aria-label="${i + 1} dari 3">
            <div class="card art" style="height:270px;display:grid;place-items:center">${ART[k]}</div>
            <h2 class="t-hero" style="font-size:28px">${t}</h2><p class="t-body" style="color:var(--muted)">${d}</p></section>`).join('')}
        </div>
        <div class="dots" role="group" aria-label="Pilih slide">${SLIDES.map((s, i) => `<button type="button" aria-label="Slide ${i + 1}: ${s[1]}" ${i === 0 ? 'aria-current="true"' : ''} data-act="welDot" data-v="${i}"><i></i></button>`).join('')}</div>
      </div>`,
      dock: `${btn('Daftar', { 'data-go': 'signup' })}${btn('Saya sudah punya akun', { kind: 'glass', 'data-go': 'login' })}
        <button type="button" class="btn-text ink" style="background:none;border:0;min-height:44px;display:flex;align-items:center;justify-content:center;gap:6px;font-weight:600;font-size:14px;cursor:pointer" data-go="emergency">${ic('shieldc', 18)}Bantuan darurat selalu gratis</button>`
    }),
    after: (scr) => {
      const car = scr.querySelector('#wel-car'); if (!car) return;
      car.addEventListener('scroll', () => {
        const i = Math.round(car.scrollLeft / car.clientWidth);
        scr.querySelectorAll('.dots button').forEach((b, j) => b.setAttribute('aria-current', j === i ? 'true' : 'false'));
      }, { passive: true });
    }
  });
  P.acts.welDot = (el) => { const car = P.el().querySelector('#wel-car'); car.scrollTo({ left: car.clientWidth * +el.dataset.v, behavior: P.S.reduce ? 'auto' : 'smooth' }); };

  /* ======================================================================
     A2 · Daftar  /  A3 · Masuk  (shared phone/email → code flow)
     ====================================================================== */
  const authBody = (k) => {
    const s = P.S[k];
    if (s.step === 1) {
      return `<div class="body rise">
        <h2 class="t-hero">${k === 'signup' ? 'Mulai dengan nomormu' : 'Masuk ke akunmu'}</h2>
        ${seg('Cara masuk', [['phone', 'Nomor HP'], ['email', 'Email']], s.mode, k + 'Mode')}
        <div class="card">${s.mode === 'phone'
          ? field({ id: k + '-phone', label: 'Nomor HP', type: 'tel', pre: '+62', value: s.phone, ph: '812 3456 7890', mode: 'numeric', input: 'authField', hint: 'Kami kirim kode lewat SMS.', err: s.err, extra: `data-k="${k}" data-f="phone" autocomplete="tel-national"` })
          : field({ id: k + '-email', label: 'Email', type: 'email', value: s.email, ph: 'nama@email.com', input: 'authField', hint: 'Kami kirim kode ke emailmu.', err: s.err, extra: `data-k="${k}" data-f="email" autocomplete="email"` })}</div>
        <div class="divider">atau</div>
        <div class="stack">
          ${btn('Lanjut dengan Google', { kind: 'text', icon: 'globe', cls: 'ink', 'data-act': 'authSocial', 'data-v': k })}
          ${btn('Lanjut dengan Apple', { kind: 'text', icon: 'device', cls: 'ink', 'data-act': 'authSocial', 'data-v': k })}
        </div>
        ${k === 'signup' ? '<p class="t-sec">Dengan melanjutkan, kamu setuju dengan [Syarat] dan [Kebijakan Privasi].</p>' : ''}
      </div>`;
    }
    if (s.step === 2) {
      const to = s.mode === 'phone' ? `+62 ${esc(s.phone || '812 3456 7890')}` : esc(s.email || 'emailmu');
      const cells = [0, 1, 2, 3, 4, 5].map((i) => `<span class="cell ${i === Math.min(s.code.length, 5) ? 'cur' : ''}" aria-hidden="true">${esc(s.code[i] || '')}</span>`).join('');
      return `<div class="body rise">
        <h2 class="t-hero">Masukkan kode 6 digit</h2>
        <p class="t-body" style="color:var(--muted)">Kode dikirim ke <b class="num" style="color:var(--ink)">${to}</b>.</p>
        <div class="card"><div class="field ${s.codeErr ? 'err' : ''}"><label for="${k}-otp">Kode 6 digit</label>
          <div class="otp ${s.codeErr ? 'err' : ''}">${cells}<input id="${k}-otp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" value="${esc(s.code)}" data-in="authCode" data-k="${k}" ${s.codeErr ? `aria-invalid="true" aria-describedby="${k}-otp-e"` : ''}></div>
          ${s.codeErr ? `<span class="errmsg" id="${k}-otp-e">${ic('alertc', 18)}Kodenya belum cocok. Coba lagi atau kirim ulang.</span>` : ''}
        </div></div>
        <div class="card tight solid"><div class="card-row"><span class="grow t-sec" id="${k}-cd" aria-live="polite">${s.t > 0 ? `Kirim ulang dalam <b class="num">0:${String(s.t).padStart(2, '0')}</b>` : 'Belum menerima kode?'}</span>
          ${btn('Kirim ulang', { kind: 'text', cls: 'btn-sm', 'data-act': 'authResend', 'data-v': k, id: k + '-resend', disabled: s.t > 0 })}</div>
          ${btn('Kirim lewat WhatsApp', { kind: 'glass', icon: 'msg', cls: 'btn-sm', 'data-act': 'authWa', 'data-v': k, style: 'width:100%' })}</div>
        <p class="t-sec">Prototipe: kode apa pun berhasil, kecuali <span class="num">000000</span> (contoh kode salah).</p>
      </div>`;
    }
    return `<div class="body rise" style="align-items:center;text-align:center;padding-top:60px;gap:18px">
      ${P.logo(72, false)}
      <h2 class="t-hero">Selamat datang kembali</h2>
      <p class="t-body" style="color:var(--muted)">Catatan dan pengaturanmu sudah siap.</p></div>`;
  };
  const authDock = (k) => {
    const s = P.S[k];
    if (s.step === 1) return btn('Kirim kode', { 'data-act': 'authSend', 'data-v': k });
    if (s.step === 2) return btn('Verifikasi', { 'data-act': 'authVerify', 'data-v': k, disabled: s.code.length < 6 });
    return btn('Buka beranda', { 'data-act': 'openHome', iconR: 'arrow' });
  };
  const authTimer = (k) => () => {
    const s = P.S[k]; if (s.step !== 2) return;
    P.every(() => {
      if (s.t <= 0) return; s.t--;
      const el = P.el().querySelector('#' + k + '-cd'), rb = P.el().querySelector('#' + k + '-resend');
      if (el) el.innerHTML = s.t > 0 ? `Kirim ulang dalam <b class="num">0:${String(s.t).padStart(2, '0')}</b>` : 'Belum menerima kode?';
      if (rb) rb.disabled = s.t > 0;
    }, 1000);
  };
  ['signup', 'login'].forEach((k) => {
    P.def({
      id: k, sec: 'A', n: k === 'signup' ? 2 : 3, name: k === 'signup' ? 'Daftar' : 'Masuk', tone: 'neutral',
      notes: k === 'signup'
        ? 'One flow, counted “Langkah x dari 4” (contact → code → consent → stage). +62 prefix is fixed and outside the input. Code screen: 0:30 countdown, WhatsApp fallback, wrong-code state in deep coral + icon (never red). Social buttons are text buttons with generic icons, no third-party logos.'
        : 'Same building blocks as sign-up, no step counter. Ends on “Selamat datang kembali” → “Buka beranda”, which opens the home of the saved stage.',
      states: k === 'signup' ? [{ label: 'Kode salah', state: (S) => { S.signup.step = 2; S.signup.code = '000000'; S.signup.codeErr = true; S.signup.t = 18; } }] : [{ label: 'Selamat datang kembali', state: (S) => { S.login.step = 3; } }],
      render: () => {
        const s = P.S[k];
        const backAct = s.step > 1 && s.step < 3 ? `<button class="ib" data-act="authBack" data-v="${k}" aria-label="Kembali">${ic('back')}</button>` : '';
        const h = backAct
          ? `<header class="hdr">${backAct}<h1 tabindex="-1" data-focus>${k === 'signup' ? 'Daftar' : 'Masuk'}</h1>${k === 'signup' ? `<span class="step">Langkah ${s.step} dari 4</span>` : ''}</header>`
          : hdr({ title: k === 'signup' ? 'Daftar' : 'Masuk', step: k === 'signup' ? `Langkah ${s.step} dari 4` : '', back: s.step < 3 });
        return { main: h + authBody(k), dock: authDock(k) };
      },
      after: () => authTimer(k)()
    });
  });
  P.acts.signupMode = (el) => { P.S.signup.mode = el.dataset.v; P.S.signup.err = ''; P.rerender(); };
  P.acts.loginMode = (el) => { P.S.login.mode = el.dataset.v; P.S.login.err = ''; P.rerender(); };
  P.ins.authField = (el) => { P.S[el.dataset.k][el.dataset.f] = el.value; };
  P.ins.authCode = (el) => {
    const s = P.S[el.dataset.k]; s.code = el.value.replace(/\D/g, '').slice(0, 6); s.codeErr = false;
    P.rerender();
    if (s.code.length === 6) P.acts.authVerify({ dataset: { v: el.dataset.k } });
  };
  P.acts.authSend = (el) => {
    const k = el.dataset.v, s = P.S[k];
    if (s.mode === 'phone') { const d = s.phone.replace(/\D/g, '').replace(/^0/, ''); if (d.length < 9 || d.length > 13) { s.err = 'Nomor belum lengkap. Cek lagi ya.'; P.rerender(); return; } }
    else if (!/^\S+@\S+\.\S+$/.test(s.email)) { s.err = 'Format email belum benar. Contoh: nama@email.com'; P.rerender(); return; }
    s.err = ''; s.step = 2; s.code = ''; s.t = 30; P.go(k, { replace: true });
  };
  P.acts.authBack = (el) => { const s = P.S[el.dataset.v]; s.step = 1; s.codeErr = false; P.go(el.dataset.v, { replace: true }); };
  P.acts.authResend = (el) => { const s = P.S[el.dataset.v]; s.t = 30; s.code = ''; s.codeErr = false; P.go(el.dataset.v, { replace: true }); P.toast('Kode baru dikirim lewat SMS'); };
  P.acts.authWa = (el) => { const s = P.S[el.dataset.v]; s.t = 30; s.code = ''; s.codeErr = false; P.go(el.dataset.v, { replace: true }); P.toast('Kode dikirim lewat WhatsApp', { icon: 'msg' }); };
  P.acts.authVerify = (el) => {
    const k = el.dataset.v, s = P.S[k];
    if (s.code.length < 6) return;
    if (s.code === '000000') { s.codeErr = true; P.rerender(); return; }
    if (k === 'signup') { s.step = 1; P.go('consent', { arg: 'signup' }); }
    else { s.step = 3; P.go('login', { replace: true }); }
  };
  P.acts.authSocial = (el) => { if (el.dataset.v === 'signup') P.go('consent', { arg: 'signup' }); else { P.S.login.step = 3; P.go('login', { replace: true }); } };
  P.acts.openHome = () => { P.S.login.step = 1; P.resetHistory(); P.go(P.homeOf(P.S.stage), { replace: true }); };

  /* ======================================================================
     A4 · Privasi & persetujuan
     ====================================================================== */
  let consentFrom = 'signup';
  P.def({
    id: 'consent', sec: 'A', n: 4, name: 'Privasi & persetujuan', tone: () => consentFrom === 'account' ? 'neutral' : 'neutral',
    enter: (arg) => { consentFrom = arg || consentFrom; },
    notes: 'Five separate switches. Only “Data kesehatan” is on by default; partner, hospital, marketing and AI-training are off. Each switch states “Aktif/Mati” in text too, and the knob carries a check when on, so state is never colour-only.',
    render: () => {
      const c = P.S.consent;
      return {
        main: hdr({ title: 'Privasi & persetujuan', step: consentFrom === 'signup' ? 'Langkah 3 dari 4' : '' }) + `<div class="body rise">
          <h2 class="t-hero">Datamu, pilihanmu</h2>
          <div class="card tight solid"><div class="card-row"><span class="bubble-ic">${ic('lock')}</span><div class="grow"><p class="t-h3">Kami tidak menjual datamu</p><p class="t-sec">Ubah pilihan ini kapan saja di Akun.</p></div></div></div>
          <div class="card"><div class="rows">
            ${sw('cs-health', 'Data kesehatan', 'Untuk kalender, panduan, dan pengingatmu.', c.health, 'consent', 'health')}
            ${sw('cs-partner', 'Berbagi ke pasangan', 'Pasangan hanya melihat yang kamu nyalakan.', c.partner, 'consent', 'partner')}
            ${sw('cs-hospital', 'Berbagi ke rumah sakit', 'Kamu tetap memilih data di tiap permintaan.', c.hospital, 'consent', 'hospital')}
            ${sw('cs-marketing', 'Info & promosi', 'Kabar fitur dan penawaran dari Peluky.', c.marketing, 'consent', 'marketing')}
            ${sw('cs-ai', 'Bantu latih AI', 'Percakapan anonim untuk melatih Tanya Peluky.', c.ai, 'consent', 'ai')}
          </div></div>
          <details class="more"><summary>${ic('chev', 18)}Lihat rincian</summary><p class="t-sec" style="margin-top:6px">Data kesehatan disimpan terenkripsi. Kantor atau asuransimu tidak pernah melihat data kesehatanmu. [Kebijakan Privasi]</p></details>
        </div>`,
        dock: consentFrom === 'signup' ? btn('Lanjut', { 'data-go': 'stage' }) : btn('Simpan', { 'data-act': 'consentSave' })
      };
    }
  });
  P.acts.consent = (el) => { const k = el.dataset.v; P.S.consent[k] = !P.S.consent[k]; P.rerender(); };
  P.acts.consentSave = () => { P.toast('Pilihan privasi disimpan'); P.back(); };

  /* ======================================================================
     A5 · Pilih tahap
     ====================================================================== */
  const STAGES = [
    ['plan', 'Merencanakan kehamilan', 'Kenali siklus dan siapkan biaya', 'calendar', '#8F3210', 'rgba(255,138,107,.2)', '#C04A1A', 'rgba(255,138,107,.6)'],
    ['preg', 'Sedang hamil', 'Pantau minggu dan kontrol', 'heart', '#8E2A8B', 'rgba(200,109,215,.18)', '#8E2A8B', 'rgba(200,109,215,.6)'],
    ['baby', 'Sudah punya bayi', 'Tumbuh kembang 0–2 tahun', 'baby', '#075C45', 'rgba(52,214,166,.2)', '#0B7A5C', 'rgba(52,214,166,.6)']
  ];
  P.STAGES = STAGES;
  P.def({
    id: 'stage', sec: 'A', n: 5, name: 'Pilih tahap', tone: 'neutral', orbs: 'welcome',
    notes: 'Radio group of three large glass cards. The selected card gets its stage-colour luminous outline plus a filled check mark (shape + colour). The office/insurance code is a quiet link, not a step.',
    render: () => ({
      main: hdr({ title: 'Pilih tahap', step: 'Langkah 4 dari 4' }) + `<div class="body rise">
        <h2 class="t-hero" id="stage-q">Kamu sedang di tahap mana?</h2>
        <div class="stack" role="radiogroup" aria-labelledby="stage-q" style="gap:12px">
          ${STAGES.map(([k, t, d, i, dt, tint, deep, glow]) => `<button type="button" role="radio" aria-checked="${P.S.stagePick === k}" class="card choice" data-act="pickStage" data-v="${k}" style="--c-deep:${deep};--c-glow:${glow}">
            <span class="bubble-ic" style="background:${tint};color:${dt};width:52px;height:52px;flex-basis:52px">${ic(i, 26)}</span>
            <span class="grow" style="flex:1"><span class="t-h3" style="display:block">${t}</span><span class="t-sec">${d}</span></span>
            <span class="mark">${ic('check', 16)}</span></button>`).join('')}
        </div>
        ${btn('Punya kode kantor/asuransi?', { kind: 'text', cls: 'center ink', 'data-go': 'code' })}
      </div>`,
      dock: btn('Lanjut', { 'data-act': 'stageNext' })
    })
  });
  P.acts.pickStage = (el) => { P.S.stagePick = el.dataset.v; P.rerender(); };
  P.acts.stageNext = () => { const k = P.S.stagePick; P.S.stage = k; P.go({ plan: 'setupCycle', preg: 'setupPreg', baby: 'setupBaby' }[k]); };

  /* ======================================================================
     A6 · Atur siklus
     ====================================================================== */
  P.def({
    id: 'setupCycle', sec: 'A', n: 6, name: 'Atur siklus', tone: 'plan',
    notes: 'Date has a visible label; “Tidak ingat” is a toggle chip that disables the date and explains what happens instead. Stepper buttons are 44px with names; the value is announced politely.',
    render: () => {
      const c = P.S.cycle;
      return {
        main: hdr({ title: 'Atur siklus' }) + `<div class="body rise">
          <h2 class="t-hero">Kapan haid terakhirmu?</h2>
          <div class="card">
            ${field({ id: 'cy-lmp', label: 'Hari pertama haid terakhir', type: 'date', value: c.unknown ? '' : c.lmp, act: 'cycleLmp', extra: `max="${P.iso(P.TODAY)}" ${c.unknown ? 'disabled' : ''}` })}
            <div class="chips">${chip('Tidak ingat', { pressed: c.unknown, 'data-act': 'cycleUnknown' })}</div>
            ${c.unknown ? `<p class="t-sec">${ic('info', 16, 'style="display:inline;vertical-align:-3px"')} Tidak apa-apa. Catat saat haid berikutnya datang, kalender akan menyesuaikan.</p>` : ''}
          </div>
          <div class="card">
            <p class="lbl" id="cy-len-l">Panjang siklus</p>
            <div class="stepper"><button class="ib" type="button" aria-label="Kurangi satu hari" data-act="cycleLen" data-v="-1">${ic('minus')}</button>
              <div class="val" aria-live="polite" aria-labelledby="cy-len-l"><span class="num">${c.len}</span><small>hari</small></div>
              <button class="ib" type="button" aria-label="Tambah satu hari" data-act="cycleLen" data-v="1">${ic('plus')}</button></div>
            <p class="t-sec">Belum yakin? Biarkan 28 hari. Bisa diubah nanti.</p>
          </div>
        </div>`,
        dock: btn('Simpan & lanjut', { 'data-act': 'finishSetup', 'data-v': 'planHome' })
      };
    }
  });
  P.acts.cycleLmp = (el) => { if (el.value) P.S.cycle.lmp = el.value; P.rerender(); };
  P.acts.cycleUnknown = () => { P.S.cycle.unknown = !P.S.cycle.unknown; P.rerender(); };
  P.acts.cycleLen = (el) => { const c = P.S.cycle; c.len = Math.max(20, Math.min(45, c.len + +el.dataset.v)); P.rerender(); };
  P.acts.finishSetup = (el) => { P.resetHistory(); P.go(el.dataset.v, { replace: true }); P.toast('Tersimpan. Selamat datang di Peluky!'); };

  /* ======================================================================
     A7 · Atur kehamilan
     ====================================================================== */
  P.ring = (w, size = 200, stroke = 10, label = true) => {
    const r = (size - stroke * 2 - 8) / 2, c = 2 * Math.PI * r, p = Math.max(0, Math.min(1, w / 40));
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true" style="overflow:visible">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#2A1830" stroke-opacity=".08" stroke-width="${stroke}"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--acc)" stroke-opacity=".55" stroke-width="${stroke + 6}" stroke-linecap="round" stroke-dasharray="${c * p} ${c}" transform="rotate(-90 ${size / 2} ${size / 2})" style="filter:blur(5px)"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--deep)" stroke-width="${Math.max(2, stroke / 3)}" stroke-linecap="round" stroke-dasharray="${c * p} ${c}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
      ${(() => { const a = p * 2 * Math.PI - Math.PI / 2; return `<circle cx="${size / 2 + Math.cos(a) * r}" cy="${size / 2 + Math.sin(a) * r}" r="${stroke / 2 + 3}" fill="#fff" stroke="var(--deep)" stroke-width="2.5"/>`; })()}
    </svg>`;
  };
  P.def({
    id: 'setupPreg', sec: 'A', n: 7, name: 'Atur kehamilan', tone: 'preg',
    notes: 'Live result updates as dates change. If both dates exist, the doctor’s ultrasound HPL wins and a badge says so. Out-of-range dates show a deep-coral error with icon.',
    render: () => {
      const p = P.S.preg, r = P.pregCalc(p.usg, p.lmp);
      const bad = r && (r.w < 0 || r.w > 42);
      return {
        main: hdr({ title: 'Atur kehamilan' }) + `<div class="body rise">
          <h2 class="t-hero">Kapan perkiraan lahirnya?</h2>
          <div class="card">
            ${field({ id: 'pg-usg', label: 'HPL dari USG dokter', type: 'date', value: p.usg, act: 'pregDate', hint: 'Paling akurat. Lihat di hasil USG-mu.', extra: 'data-f="usg"' })}
            <div class="divider">atau</div>
            ${field({ id: 'pg-lmp', label: 'Hari pertama haid terakhir (HPHT)', type: 'date', value: p.lmp, act: 'pregDate', extra: `data-f="lmp" max="${P.iso(P.TODAY)}"` })}
          </div>
          <div class="card glow" aria-live="polite">
            ${!r ? '<p class="t-sec">Isi salah satu tanggal untuk melihat minggu kehamilanmu.</p>'
              : bad ? `<span class="errmsg">${ic('alertc', 18)}Tanggalnya di luar rentang kehamilan. Cek lagi ya.</span>`
              : `<div class="card-row"><div class="ring-wrap" style="width:96px;height:96px">${P.ring(r.w, 96, 7, false)}<div class="ring-c"><b class="num" style="font-size:28px">${r.w}</b></div></div>
                <div class="grow"><p class="t-h3">Minggu ke-<span class="num">${r.w}</span>${r.d ? ` <span class="t-sec num">+${r.d} hari</span>` : ''}</p>
                <p class="t-sec">HPL (hari perkiraan lahir)</p><p class="num" style="font-size:20px;font-weight:600;margin:0">${P.fmt(r.hpl)}</p></div></div>
                <span class="badge stage">${ic(r.from === 'usg' ? 'checkc' : 'info', 15)}${r.from === 'usg' ? 'Memakai tanggal dari doktermu' : 'Dihitung dari HPHT · ganti dengan HPL dokter bila ada'}</span>`}
          </div>
        </div>`,
        dock: btn('Simpan & lanjut', { 'data-act': 'finishSetup', 'data-v': 'pregHome', disabled: !r || bad })
      };
    }
  });
  P.acts.pregDate = (el) => { P.S.preg[el.dataset.f] = el.value; P.rerender(); };

  /* ======================================================================
     A8 · Atur data bayi
     ====================================================================== */
  P.def({
    id: 'setupBaby', sec: 'A', n: 8, name: 'Atur data bayi', tone: 'baby',
    notes: 'Only the birth date is required; everything else is marked “opsional”. Sex decides which growth standard is used (shown later on the chart).',
    render: () => {
      const b = P.S.baby;
      return {
        main: hdr({ title: 'Atur data bayi' }) + `<div class="body rise">
          <h2 class="t-hero">Kenalan dengan si kecil</h2>
          <div class="card">
            ${field({ id: 'bb-dob', label: 'Tanggal lahir (wajib)', type: 'date', value: b.dob, act: 'babyF', err: b.err, extra: `data-f="dob" max="${P.iso(P.TODAY)}" required` })}
            ${field({ id: 'bb-name', label: 'Nama panggilan (opsional)', value: b.name, ph: 'Mis. Ara', input: 'babyIn', extra: 'data-f="name"' })}
            <div class="field"><span class="lbl" id="bb-sex-l">Jenis kelamin (opsional)</span><div class="chips" role="radiogroup" aria-labelledby="bb-sex-l">
              ${[['f', 'Perempuan'], ['m', 'Laki-laki'], ['', 'Nanti saja']].map(([v, t]) => chip(t, { role: 'radio', pressed: b.sex === v, 'data-act': 'babySex', 'data-v': v })).join('')}</div></div>
            <div class="btn-row">${field({ id: 'bb-w', label: 'Berat (opsional)', value: b.w, ph: '3,1', suf: 'kg', mode: 'decimal', input: 'babyIn', extra: 'data-f="w"' })}
              ${field({ id: 'bb-l', label: 'Panjang (opsional)', value: b.l, ph: '49', suf: 'cm', mode: 'decimal', input: 'babyIn', extra: 'data-f="l"' })}</div>
          </div>
          <div class="card">
            <div class="field"><span class="lbl" id="bb-prem-l">Lahir prematur?</span><div class="chips" role="radiogroup" aria-labelledby="bb-prem-l">
              ${[['no', 'Tidak'], ['yes', 'Ya'], ['unk', 'Tidak tahu']].map(([v, t]) => chip(t, { role: 'radio', pressed: b.prem === v, 'data-act': 'babyPrem', 'data-v': v })).join('')}</div></div>
            ${b.prem === 'yes' ? field({ id: 'bb-ga', label: 'Usia kehamilan saat lahir (opsional)', value: b.ga, ph: '34', suf: 'minggu', mode: 'numeric', input: 'babyIn', hint: 'Membantu bidan dan dokter membaca grafik tumbuh.', extra: 'data-f="ga"' }) : ''}
          </div>
        </div>`,
        dock: btn('Simpan & lanjut', { 'data-act': 'babyDone' })
      };
    }
  });
  P.acts.babyF = (el) => { P.S.baby[el.dataset.f] = el.value; P.S.baby.err = ''; P.rerender(); };
  P.ins.babyIn = (el) => { P.S.baby[el.dataset.f] = el.value; };
  P.acts.babySex = (el) => { P.S.baby.sex = el.dataset.v; P.rerender(); };
  P.acts.babyPrem = (el) => { P.S.baby.prem = el.dataset.v; P.rerender(); };
  P.acts.babyDone = () => { if (!P.S.baby.dob) { P.S.baby.err = 'Isi tanggal lahir dulu ya.'; P.rerender(); return; } P.S.stage = 'baby'; P.acts.finishSetup({ dataset: { v: 'babyHome' } }); };

  /* ======================================================================
     B9 · Beranda perencanaan
     ====================================================================== */
  const cycleMarks = () => {
    const c = P.S.cycle, lmp = P.parse(c.lmp), m = {};
    const add = (d, k) => { const s = P.iso(d); (m[s] = m[s] || new Set()).add(k); };
    if (!lmp || c.unknown) return { m, fert: null };
    let fert = null;
    for (let k = 0; k < 4; k++) {
      const start = P.addDays(lmp, k * c.len);
      for (let i = 0; i < 5; i++) add(P.addDays(start, i), k === 0 ? 'period' : 'pred');
      const ovu = P.addDays(start, c.len - 14);
      add(ovu, 'ovu');
      for (let i = -5; i <= 0; i++) add(P.addDays(ovu, i), 'fert');
      if (!fert && P.diffDays(P.TODAY, ovu) >= 0) fert = [P.addDays(ovu, -5), ovu];
    }
    return { m, fert };
  };
  P.cycleMarks = cycleMarks;
  const calendar = () => {
    const [y, mo] = P.S.calMonth, first = new Date(y, mo, 1), days = new Date(y, mo + 1, 0).getDate();
    const off = (first.getDay() + 6) % 7, { m } = cycleMarks(), logs = P.S.cycle.logs;
    let cells = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((d) => `<span class="dow" aria-hidden="true">${d}</span>`).join('');
    for (let i = 0; i < off; i++) cells += '<span aria-hidden="true"></span>';
    for (let d = 1; d <= days; d++) {
      const dt = new Date(y, mo, d), s = P.iso(dt), k = m[s] || new Set();
      const prev = m[P.iso(P.addDays(dt, -1))], next = m[P.iso(P.addDays(dt, 1))];
      const dow = (dt.getDay() + 6) % 7;
      const cls = ['day'];
      if (k.has('period')) cls.push('period'); else if (k.has('pred')) cls.push('pred');
      if (k.has('fert')) { cls.push('fert'); if (!prev || !prev.has('fert') || dow === 0 || d === 1) cls.push('fs'); if (!next || !next.has('fert') || dow === 6 || d === days) cls.push('fe'); }
      if (k.has('ovu')) cls.push('ovu');
      if (s === P.iso(P.TODAY)) cls.push('today');
      if (logs[s] && logs[s].length) cls.push('logged');
      const lab = [`${d} ${P.MONL[mo]}`, s === P.iso(P.TODAY) && 'hari ini', k.has('period') && 'haid', k.has('pred') && 'perkiraan haid', k.has('fert') && 'masa subur', k.has('ovu') && 'perkiraan ovulasi', logs[s] && logs[s].length && 'ada catatan'].filter(Boolean).join(', ');
      cells += `<button type="button" class="${cls.join(' ')}" aria-label="${lab}. Ketuk untuk mencatat." data-sheet="dayLog" data-v="${s}"><span class="n">${d}</span></button>`;
    }
    return `<div class="cal">${cells}</div>`;
  };
  P.def({
    id: 'planHome', sec: 'B', n: 9, name: 'Beranda perencanaan', tone: 'plan',
    notes: 'Calendar markers use shape + colour: filled circle = haid, dashed ring = perkiraan haid, soft band = masa subur, diamond = perkiraan ovulasi, dot = tercatat, solid outline = hari ini. Every day is a 44px button with a full spoken label; tapping opens the log sheet. Honesty lines sit right under the prediction.',
    states: [{ label: 'Sheet catat hari', sheet: 'dayLog', sheetArg: '2026-10-29' }],
    render: () => {
      const s = P.S, { fert } = cycleMarks(), prep = s.prep, done = Object.values(prep).filter(Boolean).length;
      const PREP = ['Cek kesehatan ke dokter atau bidan', 'Ceritakan riwayat kesehatan keluarga', 'Tanyakan status imunisasimu', 'Tanyakan suplemen yang tepat untukmu', 'Buat rencana biaya persalinan'];
      return {
        main: P.homeHdr(`Hai${s.name ? ', ' + esc(s.name) : ''}!`, `<button class="ib" data-go="account" aria-label="Akun">${ic('user')}</button>`) + `<div class="body rise">
          ${s.askName && !s.name ? `<form class="card tight solid" data-submit="saveName"><label class="lbl" for="nm-in">Mau dipanggil apa?</label>
            <div class="btn-row" style="align-items:center"><input class="inp" id="nm-in" placeholder="Nama panggilanmu" autocomplete="given-name" style="flex:2">${btn('Simpan', { kind: 'primary', cls: 'btn-sm', type: 'submit', style: 'flex:0 0 auto' })}</div>
            <button type="button" class="btn-text" style="align-self:flex-start;border:0" data-act="skipName">Lewati</button></form>` : ''}
          <section class="card glow" aria-labelledby="cyc-t">
            <div class="card-row"><div class="grow"><span class="badge stage">${ic('calendar', 15)}Merencanakan</span></div>${btn('Atur', { kind: 'text', cls: 'btn-sm', 'data-go': 'setupCycle' })}</div>
            <div><p class="t-sec" id="cyc-t">Masa subur (perkiraan)</p>
              <p class="num" style="font-size:30px;font-weight:600;margin:2px 0 0;letter-spacing:-.02em">${fert ? `${fert[0].getDate()} ${P.MON[fert[0].getMonth()]} – ${fert[1].getDate()} ${P.MON[fert[1].getMonth()]}` : 'Catat haid dulu'}</p>
              <p class="t-sec">Perkiraan awal · makin tepat setelah beberapa siklus</p></div>
            <div class="card-row"><button class="ib" type="button" aria-label="Bulan sebelumnya" data-act="calNav" data-v="-1">${ic('back', 20)}</button>
              <p class="grow t-h3" style="text-align:center" aria-live="polite">${P.MONL[s.calMonth[1]]} <span class="num">${s.calMonth[0]}</span></p>
              <button class="ib" type="button" aria-label="Bulan berikutnya" data-act="calNav" data-v="1">${ic('chev', 20)}</button></div>
            ${calendar()}
            <div class="legend" aria-label="Keterangan kalender">
              <span><i class="lg period"></i>Haid</span><span><i class="lg pred"></i>Perkiraan haid</span>
              <span><i class="lg fert"></i>Masa subur</span><span><i class="lg ovu"></i>Perkiraan ovulasi</span>
              <span><i class="lg logged"></i>Tercatat</span><span><i class="lg today"></i>Hari ini</span></div>
            <p class="t-sec" style="display:flex;gap:6px">${ic('info', 16)}<span>Bukan kontrasepsi, bukan diagnosis. Ketuk tanggal untuk mencatat.</span></p>
          </section>
          <button type="button" class="card tight" data-go="partnerSetup"><span class="card-row"><span class="bubble-ic">${ic('users')}</span><span class="grow"><span class="t-h3" style="display:block">Mau kabari pasangan?</span><span class="t-sec">Kamu pilih apa yang bisa dia lihat.</span></span>${ic('chev')}</span></button>
          <section class="card" aria-labelledby="prep-t">
            <div class="card-row"><h2 class="t-h3 grow" id="prep-t">Persiapan sebelum hamil</h2><span class="num t-sec" style="font-weight:700">${done} dari 5</span></div>
            <div class="bar" role="progressbar" aria-label="Kemajuan persiapan" aria-valuemin="0" aria-valuemax="5" aria-valuenow="${done}"><i style="width:${done * 20}%"></i></div>
            <div>${PREP.map((t, i) => P.check('prep' + i, t, prep[i], 'prepCheck', '', String(i))).join('')}</div>
          </section>
          <button type="button" class="card tinted money tight" data-go="cost"><span class="card-row"><span class="bubble-ic sun">${ic('coins')}</span><span class="grow"><span class="t-sec" style="display:block">Persalinan normal · RS swasta menengah</span><span class="num" style="font-size:22px;font-weight:600">Rp20–35 juta</span></span>${ic('chev')}</span>
            ${src('Chubb Life, Jan 2026')}<span class="t-sec">Buat rencana biaya, gratis.</span></button>
          <button type="button" class="card tight" data-go="bidan"><span class="card-row"><span class="bubble-ic">${ic('chat')}</span><span class="grow"><span class="t-h3" style="display:block">Tanya bidan</span><span class="t-sec">Keluhan kesehatan selalu dijawab.</span></span>${ic('chev')}</span></button>
          ${btn('Saya hamil', { kind: 'glass', icon: 'heart', 'data-act': 'iAmPregnant' })}
          ${sos()}
        </div>`,
        tab: 'plan'
      };
    }
  });
  P.acts.saveName = (f) => { const v = f.querySelector('#nm-in').value.trim(); if (!v) { P.acts.skipName(); return; } P.S.name = v; P.rerender(); P.toast(`Hai, ${esc(v)}! Senang kenal kamu.`); };
  P.acts.skipName = () => { P.S.askName = false; P.rerender(); };
  P.acts.calNav = (el) => { let [y, m] = P.S.calMonth; m += +el.dataset.v; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } P.S.calMonth = [y, m]; P.rerender(); };
  P.acts.prepCheck = (el) => { P.S.prep[el.dataset.v] = el.checked; P.rerender(); };
  P.acts.iAmPregnant = () => { P.S.stage = 'preg'; P.go('setupPreg'); };

  // Day log sheet (also used by the Catat button on the planning home)
  const DAYLOG = ['Haid mulai', 'Haid selesai', 'Flek', 'Kram ringan', 'Lendir subur', 'Mood naik turun', 'Tes kehamilan positif'];
  P.sheets.dayLog = (iso) => {
    const d = P.parse(iso || P.iso(P.TODAY)), list = P.S.cycle.logs[P.iso(d)] || [];
    return {
      title: `Catat · ${P.fmt(d)}`,
      body: `<div class="chips" role="group" aria-label="Pilih yang kamu alami">${DAYLOG.map((t) => chip(t, { pressed: list.includes(t), 'data-act': 'dayLogToggle', 'data-v': t })).join('')}</div>
        ${list.includes('Tes kehamilan positif') ? `<div class="card tight tinted"><p class="t-h3">Selamat!</p><p class="t-sec">Mau pindah ke tahap hamil? Kalender siklus akan disimpan.</p>${btn('Atur kehamilan', { kind: 'primary', cls: 'btn-sm', 'data-act': 'iAmPregnant' })}</div>` : ''}
        <div class="stack"><p class="lbl" style="display:flex;gap:6px;align-items:center">${ic('alert', 18)}Perlu bantuan segera?</p>
          <div class="chips">${['Nyeri perut hebat', 'Perdarahan sangat banyak'].map((t) => chip(t, { cls: 'danger', icon: 'alert', 'data-sheet': 'danger', 'data-v': t })).join('')}</div></div>
        ${btn('Simpan', { 'data-act': 'dayLogSave' })}`
    };
  };
  P.acts.dayLogToggle = (el) => {
    const iso = P.sheetArg() || P.iso(P.TODAY), L = P.S.cycle.logs, t = el.dataset.v;
    L[iso] = L[iso] || [];
    const i = L[iso].indexOf(t);
    if (i >= 0) L[iso].splice(i, 1); else { L[iso].push(t); if (t === 'Haid mulai') { P.S.cycle.lmp = iso; P.S.cycle.unknown = false; } }
    P.rerender();
  };
  P.acts.dayLogSave = () => { P.closeSheet(true); P.toast('Catatan tersimpan'); };

  /* ======================================================================
     B10 · Rencana biaya
     ====================================================================== */
  const NORMAL = { gov: ['Pemerintah', 10, 17], mid: ['Swasta menengah', 20, 35], top: ['Swasta atas', 40, 70] };
  const CAESAR = { k2: ['Kelas II', 15, 30], k1: ['Kelas I', 25, 50], vip: ['VIP', 30, 70] };
  P.NORMAL = NORMAL; P.CAESAR = CAESAR;
  P.rng = (a) => `Rp${a[1]}–${a[2]} juta`;
  P.SRC_N = 'Chubb Life, Jan 2026'; P.SRC_C = 'Cermati, diakses Okt 2026'; P.SRC_B = 'Kompas TV, Sep 2025';
  P.def({
    id: 'cost', sec: 'B', n: 10, name: 'Rencana biaya', tone: 'plan',
    notes: 'Normal (by hospital tier, Chubb Life) and caesar (by room class, Cermati) are always shown as two separate ranges with their own sources, never merged. When the caesar lower bound is below the normal one, the “sumber berbeda” note appears. BPJS wording follows Kompas TV, Sep 2025. Saving is free; Premium adds automation only.',
    states: [{ label: 'Langkah 2 · tabungan', state: (S) => { S.cost.step = 2; } }],
    render: () => {
      const c = P.S.cost, n = NORMAL[c.tier], cs = CAESAR[c.room];
      const cov = c.cover;
      const covered = [], pay = [];
      if (cov.includes('bpjs')) { covered.push(['Caesar atas indikasi medis', 'di faskes yang bekerja sama dengan BPJS']); pay.push(['Naik kelas kamar', 'dibayar sendiri']); }
      if (cov.includes('asuransi')) covered.push(['[Rp …]', 'sesuai polis asuransimu']);
      if (cov.includes('kantor')) covered.push(['[Rp …]', 'tunjangan dari [Nama kantor]']);
      pay.push(['[Rp …]', cov.length ? 'sisa setelah tanggungan' : 'seluruh biaya persalinan']);
      const step1 = `
        <div class="card">
          <div class="field"><span class="lbl" id="ct-tier">Tipe rumah sakit</span><div class="chips" role="radiogroup" aria-labelledby="ct-tier">${Object.entries(NORMAL).map(([k, v]) => chip(v[0], { role: 'radio', pressed: c.tier === k, 'data-act': 'costTier', 'data-v': k })).join('')}</div></div>
          <div class="field"><span class="lbl" id="ct-room">Kelas kamar (untuk caesar)</span><div class="chips" role="radiogroup" aria-labelledby="ct-room">${Object.entries(CAESAR).map(([k, v]) => chip(v[0], { role: 'radio', pressed: c.room === k, 'data-act': 'costRoom', 'data-v': k })).join('')}</div></div>
          <div class="field"><span class="lbl" id="ct-cov">Yang menanggung</span><div class="chips" role="group" aria-labelledby="ct-cov">${[['bpjs', 'BPJS'], ['asuransi', 'Asuransi'], ['kantor', 'Tunjangan kantor']].map(([k, t]) => chip(t, { pressed: cov.includes(k), 'data-act': 'costCover', 'data-v': k })).join('')}</div></div>
        </div>
        <div class="card tinted money">
          <div><p class="t-sec">Persalinan normal · ${n[0]}</p><p class="num" style="font-size:30px;font-weight:600;margin:0">${P.rng(n)}</p></div>${src(P.SRC_N)}
          <div style="border-top:1px solid rgba(122,106,125,.25);padding-top:12px"><p class="t-sec">Caesar · ${cs[0]}</p><p class="num" style="font-size:30px;font-weight:600;margin:0">${P.rng(cs)}</p></div>${src(P.SRC_C)}
          ${cs[1] < n[1] ? `<p class="t-sec" style="display:flex;gap:6px">${ic('info', 16)}<span>Kisaran caesar dari sumber berbeda, berdasarkan kelas kamar.</span></p>` : ''}
        </div>
        <div class="card">
          <h2 class="t-h3">Ditanggung / Kamu bayar</h2>
          <div class="btn-row" style="align-items:stretch;gap:10px">
            <div class="card tight" style="background:rgba(52,214,166,.14);box-shadow:none"><span class="badge cover">${ic('shieldc', 14)}Ditanggung</span>${covered.length ? covered.map(([a, b]) => `<p style="margin:0"><b class="${a.startsWith('[') ? 'num' : ''}">${a}</b><br><span class="t-sec">${b}</span></p>`).join('') : '<p class="t-sec">Belum ada. Pilih penanggung di atas.</p>'}</div>
            <div class="card tight" style="background:rgba(255,201,60,.18);box-shadow:none"><span class="badge money">${ic('coins', 14)}Kamu bayar</span>${pay.map(([a, b]) => `<p style="margin:0"><b>${a}</b><br><span class="t-sec">${b}</span></p>`).join('')}</div>
          </div>
          ${cov.includes('bpjs') ? src(P.SRC_B) : ''}
          <details class="more"><summary>${ic('chev', 18)}Lihat rincian</summary><p class="t-sec" style="margin-top:6px">Kisaran adalah gambaran pasar, bukan harga RS tertentu. Harga paket tiap RS bisa dilihat di halaman Rumah sakit. [Rincian komponen biaya · perlu sumber]</p></details>
        </div>`;
      const step2 = `
        <div class="card glow">
          <p class="t-sec">Target tabungan</p><p class="num" style="font-size:32px;font-weight:600;margin:0">[Rp …]</p>
          <p class="t-sec">Dari kisaran ${n[0].toLowerCase()}${c.reserve ? ` + cadangan caesar ${cs[0]}` : ''}.</p>
          <div class="rows">${sw('ct-res', 'Termasuk cadangan caesar', 'Berjaga bila persalinan perlu caesar.', c.reserve, 'costReserve')}</div>
        </div>
        <div class="card tinted money"><div class="card-row"><span class="bubble-ic sun">${ic('calendar')}</span><div class="grow"><p class="t-sec">Menabung tiap bulan</p><p class="num" style="font-size:24px;font-weight:600;margin:0">[Rp …/bulan]</p><p class="t-sec">sampai HPL</p></div></div></div>
        <div class="card"><div class="card-row"><span class="bubble-ic">${ic('building')}</span><div class="grow"><h2 class="t-h3">Cuti melahirkan</h2></div></div>
          <p class="t-body">Minimal 3 bulan. Bisa ditambah hingga 3 bulan dengan surat dokter untuk kondisi khusus.</p>${src('UU KIA No. 4/2024')}</div>
        <div class="card tight solid"><div class="card-row"><span class="bubble-ic">${ic('star')}</span><p class="grow t-sec"><b style="color:var(--ink)">Premium:</b> pengingat tabungan otomatis dan anggaran bersama pasangan.</p></div>
          ${btn('Lihat Premium', { kind: 'text', cls: 'btn-sm', 'data-go': 'premium', style: 'align-self:flex-start' })}</div>`;
      return {
        main: hdr({ title: 'Rencana biaya' }) + `<div class="body rise">
          ${seg('Langkah rencana biaya', [['1', '1 · Perkiraan biaya'], ['2', '2 · Rencana tabungan']], String(c.step), 'costStep')}
          ${c.step === 1 ? step1 : step2}</div>`,
        dock: c.step === 1 ? btn('Lanjut ke rencana tabungan', { 'data-act': 'costStep', 'data-v': '2', iconR: 'arrow' }) : `${btn('Simpan rencana', { 'data-act': 'costSave' })}<p class="t-sec">Menyimpan rencana selalu gratis.</p>`
      };
    }
  });
  P.acts.costStep = (el) => { P.S.cost.step = +el.dataset.v; P.go('cost', { replace: true }); };
  P.acts.costTier = (el) => { P.S.cost.tier = el.dataset.v; P.rerender(); };
  P.acts.costRoom = (el) => { P.S.cost.room = el.dataset.v; P.rerender(); };
  P.acts.costCover = (el) => { const a = P.S.cost.cover, k = el.dataset.v, i = a.indexOf(k); if (i >= 0) a.splice(i, 1); else a.push(k); P.rerender(); };
  P.acts.costReserve = () => { P.S.cost.reserve = !P.S.cost.reserve; P.rerender(); };
  P.acts.costSave = () => P.toast('Rencana biaya tersimpan');

  /* ======================================================================
     B11 · Rumah sakit
     ====================================================================== */
  const HOSP = [
    { id: 'a', name: '[RS A]', tier: 'mid', bpjs: true, nicu: true, rooms: ['k2', 'k1', 'vip'], mitra: false, d: 1 },
    { id: 'b', name: '[RS Ibu & Anak B]', tier: 'mid', bpjs: true, nicu: true, rooms: ['k1', 'vip'], mitra: true, d: 2 },
    { id: 'c', name: '[RSUD C]', tier: 'gov', bpjs: true, nicu: true, rooms: ['k2', 'k1'], mitra: false, d: 3 },
    { id: 'd', name: '[RS D]', tier: 'top', bpjs: false, nicu: true, rooms: ['k1', 'vip'], mitra: true, d: 4 },
    { id: 'e', name: '[RS E]', tier: 'gov', bpjs: true, nicu: false, rooms: ['k2'], mitra: false, d: 5 }
  ];
  P.HOSP = HOSP;
  const TIER_ORDER = { gov: 0, mid: 1, top: 2 };
  const hospList = () => {
    const h = P.S.hosp, f = h.f;
    // Sorting uses only her criteria. `mitra` is never read here.
    return HOSP.filter((x) => (!f.bpjs || x.bpjs) && (!f.nicu || x.nicu) && (f.tier === 'all' || x.tier === f.tier) && (f.room === 'all' || x.rooms.includes(f.room)) && (f.dist === 'all' || (f.dist === '5' ? x.d <= 2 : x.d <= 4)))
      .sort((a, b) => h.sort === 'cost' ? (TIER_ORDER[a.tier] - TIER_ORDER[b.tier]) || (a.d - b.d) : a.d - b.d);
  };
  const fcount = () => { const f = P.S.hosp.f; return [f.dist !== 'all', f.tier !== 'all', f.bpjs, f.nicu, f.room !== 'all'].filter(Boolean).length; };
  P.def({
    id: 'hospitals', sec: 'B', n: 11, name: 'Rumah sakit', tone: 'shared',
    notes: 'Shared screen: takes the colour of the stage she came from. Order = her criteria only (distance or cost); the sort function never reads partner status. “Mitra Peluky” badge never on the first card here and never moves a card. Max 6 facts per card; price ranges are market ranges for the hospital type, each with its source. Partners open a detail page; others expand contact info.',
    states: [{ label: 'Sheet filter', sheet: 'hospFilter' }, { label: 'Kosong', state: (S) => { S.hosp.f.bpjs = true; S.hosp.f.tier = 'top'; } }],
    render: () => {
      const h = P.S.hosp, list = hospList(), room = P.S.cost.room;
      const crit = [h.sort === 'cost' ? 'Biaya terendah' : 'Terdekat', h.f.bpjs && 'BPJS', h.f.nicu && 'NICU', h.f.tier !== 'all' && NORMAL[h.f.tier][0], h.f.room !== 'all' && CAESAR[h.f.room][0], h.f.dist !== 'all' && `≤ ${h.f.dist} km`].filter(Boolean).join(' · ');
      const fc = fcount();
      return {
        main: hdr({ title: 'Rumah sakit' }) + `<div class="body rise">
          ${seg('Urutkan', [['dist', 'Terdekat'], ['cost', 'Biaya terendah']], h.sort, 'hospSort')}
          <div class="card tight solid"><p class="t-body" style="display:flex;gap:8px;font-weight:600">${ic('info', 20)}<span>Urutan sesuai kriteriamu. Status mitra tidak memengaruhi urutan.</span></p><p class="t-sec">Kriteria: ${crit}</p></div>
          ${list.length ? list.map((x, i) => {
            const n = NORMAL[x.tier], rk = x.rooms.includes(room) ? room : x.rooms[0], cs = CAESAR[rk], open = h.open[x.id];
            return `<article class="card" aria-labelledby="h-${x.id}">
              <div class="card-row" style="align-items:flex-start"><span class="num t-sec" style="font-weight:700;min-width:22px" aria-label="Urutan ${i + 1}">${i + 1}</span>
                <div class="grow"><h2 class="t-h3" id="h-${x.id}">${x.name}</h2>${x.mitra ? `<span class="badge mitra" style="margin-top:6px">${ic('heart', 14)}Mitra Peluky</span>` : ''}</div></div>
              <dl class="facts">
                <div><dt>Jarak</dt><dd class="num">[x km]</dd></div><div><dt>Tipe</dt><dd>${n[0]}</dd></div>
                <div><dt>BPJS</dt><dd>${x.bpjs ? `${ic('check', 15, 'style="display:inline;vertical-align:-2px"')} Ya` : `${ic('slash', 15, 'style="display:inline;vertical-align:-2px"')} Tidak`}</dd></div>
                <div><dt>NICU</dt><dd>${x.nicu ? `${ic('check', 15, 'style="display:inline;vertical-align:-2px"')} Ada` : `${ic('slash', 15, 'style="display:inline;vertical-align:-2px"')} Tidak ada`}</dd></div>
                <div><dt>Normal (kisaran)</dt><dd class="num">${P.rng(n)}</dd></div><div><dt>Caesar · ${cs[0]}</dt><dd class="num">${P.rng(cs)}</dd></div>
              </dl>
              <p class="t-sec">Kisaran pasar untuk tipe RS ini · ${P.SRC_N} · ${P.SRC_C}</p>
              ${x.mitra ? btn('Lihat detail & booking', { kind: 'glass', cls: 'btn-sm', iconR: 'chev', 'data-go': 'hospitalDetail', 'data-arg': x.id, style: 'width:100%' })
                : `${btn(open ? 'Tutup kontak' : 'Lihat kontak', { kind: 'glass', cls: 'btn-sm', 'data-act': 'hospOpen', 'data-v': x.id, 'aria-expanded': open ? 'true' : 'false', style: 'width:100%' })}
                  ${open ? `<dl class="kv"><dt>Telepon</dt><dd class="num">[nomor telepon]</dd><dt>Alamat</dt><dd>[alamat]</dd></dl>${btn('Petunjuk arah', { kind: 'text', icon: 'nav', cls: 'btn-sm', 'data-act': 'directions' })}` : ''}`}
            </article>`;
          }).join('') : `<div class="card empty"><span class="bubble-ic">${ic('search', 30)}</span><h2 class="t-h3">Belum ada RS yang cocok</h2><p class="t-sec">Coba longgarkan filternya.</p>${btn('Atur ulang filter', { kind: 'glass', cls: 'btn-sm', 'data-act': 'hospReset' })}</div>`}
        </div>`,
        dock: btn(`Filter${fc ? ` (${fc})` : ''}`, { kind: 'primary', icon: 'filter', 'data-sheet': 'hospFilter' })
      };
    }
  });
  P.acts.hospSort = (el) => { P.S.hosp.sort = el.dataset.v; P.rerender(); };
  P.acts.hospOpen = (el) => { const o = P.S.hosp.open; o[el.dataset.v] = !o[el.dataset.v]; P.rerender(); };
  P.acts.hospReset = () => { P.S.hosp.f = { dist: 'all', tier: 'all', bpjs: false, nicu: false, room: 'all' }; P.rerender(); };
  P.acts.directions = () => P.toast('Prototipe: membuka petunjuk arah', { icon: 'nav' });
  P.sheets.hospFilter = () => {
    const f = P.S.hosp.f;
    const group = (lab, key, opts) => `<div class="field"><span class="lbl" id="hf-${key}">${lab}</span><div class="chips" role="radiogroup" aria-labelledby="hf-${key}">${opts.map(([v, t]) => chip(t, { role: 'radio', pressed: f[key] === v, 'data-act': 'hospF', 'data-k': key, 'data-v': v })).join('')}</div></div>`;
    return {
      title: 'Filter rumah sakit',
      body: `${group('Jarak', 'dist', [['5', '≤ 5 km'], ['10', '≤ 10 km'], ['all', 'Semua']])}
        ${group('Anggaran (tipe RS)', 'tier', [['all', 'Semua'], ...Object.entries(NORMAL).map(([k, v]) => [k, v[0]])])}
        ${group('Kelas kamar', 'room', [['all', 'Semua'], ...Object.entries(CAESAR).map(([k, v]) => [k, v[0]])])}
        <div class="rows">${sw('hf-bpjs', 'Menerima BPJS', '', f.bpjs, 'hospFb', 'bpjs')}${sw('hf-nicu', 'Ada NICU', '', f.nicu, 'hospFb', 'nicu')}</div>
        <p class="t-sec">Status mitra tidak bisa dipakai untuk mengurutkan.</p>
        ${btn('Terapkan', { 'data-act': 'hospApply' })}`
    };
  };
  P.acts.hospF = (el) => { P.S.hosp.f[el.dataset.k] = el.dataset.v; P.rerender(); };
  P.acts.hospFb = (el) => { const k = el.dataset.v; P.S.hosp.f[k] = !P.S.hosp.f[k]; P.rerender(); };
  P.acts.hospApply = () => { P.closeSheet(true); P.rerender(); P.toast(`${hospList().length} rumah sakit sesuai kriteriamu`, { icon: 'filter' }); };

  /* ======================================================================
     B12 · Detail RS & booking
     ====================================================================== */
  P.def({
    id: 'hospitalDetail', sec: 'B', n: 12, name: 'Detail RS & booking', tone: 'shared',
    enter: (arg) => { if (arg) P.S.booking.hosp = arg; },
    notes: 'Per-request data sharing: name and phone ticked (needed to reply), HPL and everything else unticked. If the global hospital-sharing consent is off, a line explains these ticks apply to this request only. Package prices are the hospital’s own, with a verified date.',
    render: () => {
      const b = P.S.booking, x = HOSP.find((h) => h.id === b.hosp) || HOSP[1];
      const days = [1, 2, 3, 4, 5].map((i) => P.addDays(P.TODAY, i));
      const pays = [['bpjs', 'BPJS'], ['asuransi', 'Asuransi'], ['sendiri', 'Bayar sendiri']].concat(P.S.covered ? [['cover', 'Ditanggung kantor']] : []);
      return {
        main: hdr({ title: x.name, sub: x.mitra ? 'Mitra Peluky' : NORMAL[x.tier][0] }) + `<div class="body rise">
          <div class="ph-img" style="height:150px">[Foto RS]</div>
          <dl class="card tight facts"><div><dt>Jarak</dt><dd class="num">[x km]</dd></div><div><dt>BPJS</dt><dd>${x.bpjs ? 'Ya' : 'Tidak'}</dd></div><div><dt>NICU</dt><dd>${x.nicu ? 'Ada' : 'Tidak ada'}</dd></div><div><dt>Kelas kamar</dt><dd>${x.rooms.map((r) => CAESAR[r][0]).join(', ')}</dd></div></dl>
          <div class="card">
            <div class="field"><span class="lbl">Jenis permintaan</span>${seg('Jenis permintaan', [['konsul', 'Konsultasi'], ['paket', 'Paket persalinan'], ['tur', 'Tur RS']], b.type, 'bkType')}</div>
            <div class="field"><span class="lbl" id="bk-d">Tanggal</span><div class="hscroll" role="radiogroup" aria-labelledby="bk-d">${days.map((d, i) => chip(`${P.DOW[d.getDay()]} <span class="num">${d.getDate()}</span>`, { role: 'radio', pressed: b.day === i + 1, 'data-act': 'bkDay', 'data-v': i + 1, 'aria-label': P.fmtShort(d) })).join('')}</div></div>
            <div class="field"><span class="lbl" id="bk-t">Jam</span><div class="chips" role="radiogroup" aria-labelledby="bk-t">${['09.00', '11.00', '14.00', '16.00'].map((t) => chip(`<span class="num">${t}</span>`, { role: 'radio', pressed: b.time === t, 'data-act': 'bkTime', 'data-v': t, 'aria-label': t })).join('')}</div></div>
            <div class="field"><label for="bk-doc">Dokter (opsional)</label><select class="inp" id="bk-doc" data-ch="bkDoc"><option value="">Tanpa preferensi</option>${['[dr. Nama, Sp.OG] · Senin & Kamis', '[dr. Nama, Sp.OG] · Selasa & Jumat'].map((o) => `<option ${b.doctor === o ? 'selected' : ''}>${o}</option>`).join('')}</select></div>
            <div class="field"><span class="lbl" id="bk-p">Pembayaran</span><div class="chips" role="radiogroup" aria-labelledby="bk-p">${pays.map(([v, t]) => chip(t, { role: 'radio', pressed: b.pay === v, 'data-act': 'bkPay', 'data-v': v })).join('')}</div></div>
          </div>
          <div class="card">
            <h2 class="t-h3">Data yang dikirim ke RS</h2><p class="t-sec" style="margin-top:-8px">RS hanya menerima yang kamu centang.</p>
            <div>${[['name', 'Nama'], ['phone', 'Nomor HP'], ['week', 'Minggu kehamilan'], ['hpl', 'HPL (hari perkiraan lahir)'], ['notes', 'Ringkasan catatan kontrol']].map(([k, t]) => P.tick('bk-s-' + k, t, b.share[k], 'bkShare', k)).join('')}</div>
            ${!P.S.consent.hospital ? `<p class="t-sec" style="display:flex;gap:6px">${ic('lock', 16)}<span>Izin umum berbagi ke RS sedang mati. Centang di atas hanya berlaku untuk permintaan ini.</span></p>` : ''}
            <div class="field"><label for="bk-note">Catatan untuk RS (opsional)</label><textarea class="inp" id="bk-note" data-in="bkNote" placeholder="Mis. ingin bertanya soal kamar rawat gabung">${esc(b.note)}</textarea></div>
          </div>
          <div class="card tinted money"><div class="card-row"><span class="bubble-ic sun">${ic('bag')}</span><div class="grow"><h2 class="t-h3">Paket persalinan</h2><p class="t-sec">Harga paket dari RS · diverifikasi [tanggal]</p></div></div>
            ${btn('Lihat isi paket', { kind: 'glass', cls: 'btn-sm', 'data-sheet': 'package', style: 'width:100%' })}</div>
        </div>`,
        dock: `${btn('Kirim permintaan', { 'data-act': 'bkSend', icon: 'send' })}<p class="t-sec">Biasanya dibalas dalam [x jam]</p>`
      };
    }
  });
  P.acts.bkType = (el) => { P.S.booking.type = el.dataset.v; P.rerender(); };
  P.acts.bkDay = (el) => { P.S.booking.day = +el.dataset.v; P.rerender(); };
  P.acts.bkTime = (el) => { P.S.booking.time = el.dataset.v; P.rerender(); };
  P.acts.bkDoc = (el) => { P.S.booking.doctor = el.value; };
  P.acts.bkPay = (el) => { P.S.booking.pay = el.dataset.v; P.rerender(); };
  P.acts.bkShare = (el) => { P.S.booking.share[el.dataset.v] = el.checked; };
  P.ins.bkNote = (el) => { P.S.booking.note = el.value; };
  P.acts.bkSend = () => { P.S.request = { status: 'sent', sharing: true, cancelled: false, added: false }; P.go('requestSent'); };
  P.sheets.package = () => ({
    title: 'Isi paket persalinan',
    body: `<div style="overflow-x:auto"><table class="tbl"><thead><tr><th scope="col">Isi paket</th><th scope="col" class="num">Normal</th><th scope="col" class="num">Caesar</th></tr></thead><tbody>
      ${['Kamar rawat ([x] malam)', 'Tindakan persalinan', 'Visite dokter', 'Perawatan bayi', 'Obat & bahan habis pakai'].map((t) => `<tr><td>${t}</td><td class="num">[Rp …]</td><td class="num">[Rp …]</td></tr>`).join('')}
      <tr><th scope="row">Total paket</th><td class="num"><b>[Rp …]</b></td><td class="num"><b>[Rp …]</b></td></tr></tbody></table></div>
      <p class="t-sec">Harga paket dari RS · diverifikasi [tanggal]. Biaya di luar paket bisa berbeda.</p>${btn('Tutup', { kind: 'glass', 'data-close': true })}`
  });

  /* ======================================================================
     B13 · Permintaan terkirim
     ====================================================================== */
  P.def({
    id: 'requestSent', sec: 'B', n: 13, name: 'Permintaan terkirim', tone: 'shared',
    notes: 'Shows exactly what left the phone, and what didn’t. “Berhenti berbagi” acts immediately with an undo toast; cancelling asks once in a sheet.',
    states: [{ label: 'Sheet batalkan', sheet: 'cancelReq' }],
    render: () => {
      const b = P.S.booking, r = P.S.request, x = HOSP.find((h) => h.id === b.hosp) || HOSP[1], d = P.addDays(P.TODAY, b.day);
      const LAB = { name: 'Nama', phone: 'Nomor HP', week: 'Minggu kehamilan', hpl: 'HPL', notes: 'Ringkasan catatan kontrol' };
      const sent = Object.keys(LAB).filter((k) => b.share[k]), not = Object.keys(LAB).filter((k) => !b.share[k]);
      const type = { konsul: 'Konsultasi', paket: 'Paket persalinan', tur: 'Tur RS' }[b.type];
      return {
        main: hdr({ title: r.cancelled ? 'Permintaan dibatalkan' : 'Permintaan terkirim', backTo: P.homeOf(P.S.stage) }) + `<div class="body rise">
          <div class="card glow"><div class="card-row"><span class="bubble-ic">${ic(r.cancelled ? 'close' : 'checkc', 26)}</span><div class="grow"><h2 class="t-h3">${type} · ${x.name}</h2><p class="t-sec num">${P.fmtShort(d)} · ${b.time}</p></div></div>
            ${r.cancelled ? '<p class="t-sec">Permintaan ini sudah dibatalkan. RS diberi tahu.</p>' : `<ol class="steps" aria-label="Status permintaan">
              <li><span class="st-ic done">${ic('check', 16)}</span><div><b>Terkirim</b><p class="t-sec">Hari ini</p></div></li>
              <li><span class="st-ic now">${ic('clock', 16)}</span><div><b>Dikonfirmasi</b><p class="t-sec">Menunggu RS · biasanya [x jam]</p></div></li>
              <li><span class="st-ic next">${ic('bell', 16)}</span><div><b>Pengingat H-1</b><p class="t-sec num">${P.fmtShort(P.addDays(d, -1))}</p></div></li></ol>`}
          </div>
          <div class="card"><h2 class="t-h3">Yang kamu kirim</h2>
            ${r.sharing ? `<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px">${sent.map((k) => `<li style="display:flex;gap:8px;align-items:center">${ic('check', 18)}${LAB[k]}</li>`).join('')}</ul>` : `<p class="t-body" style="display:flex;gap:8px">${ic('lock', 18)}Berbagi dihentikan. RS tidak bisa melihat datamu lagi.</p>`}
            <p class="t-sec">Tidak dikirim: ${not.map((k) => LAB[k]).join(', ') || '—'}</p>
            ${b.note ? `<p class="t-sec">Catatan: “${esc(b.note)}”</p>` : ''}
            ${!r.cancelled && r.sharing ? btn('Berhenti berbagi data', { kind: 'text', cls: 'btn-sm ink', icon: 'lock', 'data-act': 'reqStopShare', style: 'align-self:flex-start' }) : ''}
          </div>
          ${!r.cancelled ? `${btn(r.added ? 'Sudah ada di kontrol kehamilan' : 'Tambahkan ke kontrol kehamilan', { kind: 'glass', icon: r.added ? 'check' : 'calendar', 'data-act': 'reqAdd', disabled: r.added })}
            ${btn('Batalkan permintaan', { kind: 'text', cls: 'center ink', 'data-sheet': 'cancelReq' })}` : ''}
        </div>`,
        dock: btn('Kembali ke beranda', { 'data-act': 'openHomeKeep' })
      };
    }
  });
  P.acts.openHomeKeep = () => { P.resetHistory(); P.go(P.homeOf(P.S.stage), { replace: true }); };
  P.acts.reqAdd = () => { P.S.request.added = true; P.rerender(); P.toast('Ditambahkan ke kontrol kehamilan'); };
  P.acts.reqStopShare = () => { P.S.request.sharing = false; P.rerender(); P.toast('Berbagi data dihentikan', { icon: 'lock', undo: () => { P.S.request.sharing = true; } }); };
  P.sheets.cancelReq = () => ({
    title: 'Batalkan permintaan ini?',
    body: `<p class="t-body">RS akan diberi tahu. Kamu bisa membuat permintaan baru kapan saja.</p>${btn('Ya, batalkan', { 'data-act': 'reqCancel' })}${btn('Tidak jadi', { kind: 'glass', 'data-close': true })}`
  });
  P.acts.reqCancel = () => { P.S.request.cancelled = true; P.closeSheet(true); P.rerender(); P.toast('Permintaan dibatalkan'); };
})();
