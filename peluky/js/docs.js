/* Design-system page and the contrast + placeholder note. Contrast is computed live
   from the same tokens the app uses, so the numbers can't drift from the design. */
(function () {
  'use strict';
  const { ic, btn, chip, sw, field, seg, src } = P;

  /* ------------------------------------------------------------------ contrast maths (WCAG 2.x) */
  const hex = (h) => { h = h.replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16)); };
  const mix = (top, a, bot) => top.map((c, i) => c * a + bot[i] * (1 - a));
  const lum = (rgb) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; const [r, g, b] = rgb.map(f); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  P.contrast = ratio; P.hex = hex; P.mix = mix;
  const W = [255, 255, 255];
  const ORBS = { berry: '#C86DD7', coral: '#FF8A6B', aqua: '#34D6A6', sun: '#FFC93C' };
  const GROUND = hex('#F7F5FB');
  // Worst-case surfaces: the orb sits directly behind, at FULL opacity (real orbs are 0.35–0.5 and blurred).
  const SURF = {
    glass: (o) => mix(W, 0.72, hex(o)),
    sheet: (o) => mix(W, 0.90, hex(o)),
    ground: (o) => mix(hex(o), 0.5, GROUND),
    calmGlass: () => mix(W, 0.72, hex('#E9EDEF')),
    redTint: (o) => mix(hex('#FDE2E2'), 0.97, hex(o)),
    toast: (o) => mix(hex('#2A1830'), 0.92, hex(o))
  };
  const worst = (fg, surf, tintFn) => {
    let min = Infinity, at = '';
    for (const [n, o] of Object.entries(ORBS)) { let bg = SURF[surf](o); if (tintFn) bg = tintFn(bg); const r = ratio(fg, bg); if (r < min) { min = r; at = n; } }
    return [min, at];
  };
  const tint = (c, a) => (bg) => mix(hex(c), a, bg);
  const pass = (r, need) => r >= need;
  const fmt = (r) => r.toFixed(2) + ':1';
  const mark = (ok) => ok ? `<span class="ok">${ic('check', 15)}Pass</span>` : `<span class="no">${ic('close', 15)}Fail</span>`;

  /* ------------------------------------------------------------------ token rows */
  const TOKENS = [
    ['Ink', '--ink', '#2A1830', 'Main text, headings, icons', 'text'],
    ['Muted', '--muted', '#5E4B62', 'Secondary text ≥13px on glass or sheets. Never on bare ground.', 'text'],
    ['Line', '--line', '#7A6A7D', 'Control borders (3:1), always drawn around the control’s own 90% white fill; placeholders on that fill', 'border'],
    ['Coral deep', '--coral-d', '#C04A1A', 'Planning fills (white text 4.96:1); large text ≥24px only', 'large'],
    ['Coral deeper', '--coral-dd', '#8F3210', 'Planning small text, form errors', 'text'],
    ['Berry deep', '--berry-d', '#8E2A8B', 'Pregnancy text and fills', 'text'],
    ['Green deep', '--green-d', '#0B7A5C', 'After-birth fills (white 5.31:1); large text ≥24px only', 'large'],
    ['Green deeper', '--green-dd', '#075C45', 'After-birth small text', 'text'],
    ['Sun deep', '--sun-d', '#7A4A00', 'Money and amber status text', 'text'],
    ['Danger red', '--red', '#C21F1F', 'Emergency buttons and danger panels only (white 5.98:1). Text only on red tint or sheets.', 'fill'],
    ['Calm ink', '--calm-ink', '#1D2B30', 'Emergency + loss screens: text', 'calm'],
    ['Calm muted', '--calm-muted', '#4F6066', 'Emergency + loss screens: secondary', 'calm'],
    ['Calm accent', '--calm-accent', '#3D5560', 'Emergency + loss screens: buttons, icons', 'calm']
  ];
  const BRIGHT = [['Berry', '#C86DD7', 'Pregnancy orbs, tints, glows'], ['Coral', '#FF8A6B', 'Planning orbs, tints, glows'], ['Aqua', '#34D6A6', 'After-birth orbs, tints, glows'], ['Sun', '#FFC93C', 'Money tints'], ['Ground', '#F7F5FB', 'Screen ground (pale cool lilac)'], ['Danger tint', '#FDE2E2', 'Danger panel + danger card fill'], ['Calm ground', '#E9EDEF', 'Emergency + loss ground']];

  const tokenTable = () => `<div class="tbl-wrap"><table class="doc-tbl"><thead><tr><th scope="col">Token</th><th scope="col">Use</th><th scope="col">On glass<br><small>worst orb</small></th><th scope="col">On sheet</th><th scope="col">On bare ground<br><small>orb at 50%</small></th></tr></thead><tbody>
    ${TOKENS.map(([n, v, h, use, kind]) => {
      const fg = hex(h);
      if (kind === 'calm') { const r = ratio(fg, SURF.calmGlass()); return `<tr><td><span class="swc" style="background:${h}"></span><b>${n}</b><br><code>${v} ${h}</code></td><td>${use}</td><td colspan="3">${fmt(r)} on calm glass ${mark(r >= 4.5)}</td></tr>`; }
      const need = kind === 'border' ? 3 : kind === 'large' ? 3 : 4.5;
      const cells = ['glass', 'sheet', 'ground'].map((s) => { const [r, at] = worst(fg, s); return `<td><b>${fmt(r)}</b> <small>(${at})</small><br>${kind === 'fill' ? (r >= 4.5 ? mark(true) : `<span class="no">${ic('close', 15)}No text</span>`) : mark(pass(r, need))}</td>`; }).join('');
      return `<tr><td><span class="swc" style="background:${h}"></span><b>${n}</b><br><code>${v} ${h}</code></td><td>${use}<br><small>Needs ${need}:1${kind === 'large' ? ' (large text)' : kind === 'border' ? ' (non-text)' : ''}</small></td>${cells}</tr>`;
    }).join('')}</tbody></table></div>`;

  /* ------------------------------------------------------------------ design system page */
  P.docs = {};
  P.docs.system = () => `<div class="doc">
    <header class="doc-hero"><div>${P.logo(52, true, 40)}</div><div><h1>Soft Glass design system</h1><p>Frosted glass over a pale lilac ground lit by blurred stage-colour orbs. Every number on this page is computed from the live tokens.</p></div></header>

    <section class="doc-sec" id="ds-colour"><h2>Colour tokens</h2>
      <p class="lead">Bright stage colours never carry text. Deep colours carry text and fills. Contrast is checked against the worst case: the most saturated orb directly behind the surface at full opacity.</p>
      <div class="swatches">${BRIGHT.map(([n, h, u]) => `<div class="swatch"><span style="background:${h}"></span><b>${n}</b><code>${h}</code><small>${u}</small></div>`).join('')}</div>
      ${tokenTable()}
      <div class="stage-key">${[['plan', 'Merencanakan', 'Coral', '#FF8A6B', '#C04A1A'], ['preg', 'Hamil', 'Berry', '#C86DD7', '#8E2A8B'], ['baby', 'Setelah lahir', 'Aqua / green', '#34D6A6', '#0B7A5C'], ['money', 'Uang', 'Sun', '#FFC93C', '#7A4A00'], ['danger', 'Bahaya saja', 'Red', '#FDE2E2', '#C21F1F']].map(([k, n, c, b, d]) => `<div class="key"><span style="background:${b}"></span><span style="background:${d}"></span><b>${n}</b><small>${c}</small></div>`).join('')}</div>
    </section>

    <section class="doc-sec" id="ds-type"><h2>Type scale</h2>
      <p class="lead">Space Grotesk for headings and numbers (tabular numerals for weeks, dates, measurements, timers). Plus Jakarta Sans for body and UI. Body ≥15px, secondary ≥13px.</p>
      <div class="scr demo" data-tone="preg"><div class="type-rows">
        ${[['Hero · Space Grotesk 600 · 30/34', '<span class="t-hero">Kamu sedang di tahap mana?</span>'], ['H2 · Space Grotesk 600 · 22/26', '<span class="t-h2">Konsultasi terjadwal</span>'], ['H3 · Space Grotesk 600 · 17/21', '<span class="t-h3">Kontrol kehamilan berikutnya</span>'], ['Number · Space Grotesk 600 · 64 tabular', '<span class="num" style="font-size:64px;font-weight:600;line-height:1">14</span> <span class="num" style="font-size:30px;font-weight:600">29 Okt – 3 Nov</span>'], ['Body · Plus Jakarta Sans 400–700 · 15/22', '<span class="t-body">Catat yang kamu rasakan dan bawa catatannya saat kontrol.</span>'], ['Secondary · Plus Jakarta Sans 400–600 · 13/18', '<span class="t-sec">Perkiraan awal · makin tepat setelah beberapa siklus</span>'], ['Label · Plus Jakarta Sans 700 · 13 caps +0.04em', '<span class="t-label">Tanda bahaya</span>']].map(([l, s]) => `<div class="type-row"><small>${l}</small><div>${s}</div></div>`).join('')}
      </div></div></section>

    <section class="doc-sec" id="ds-space"><h2>Space, radii, targets</h2>
      <div class="grid2">
        <div><h3>4-point spacing · 20px gutters</h3><div class="spaces">${[4, 8, 12, 16, 20, 24, 32, 40].map((n) => `<div><i style="width:${n * 3}px"></i><code>${n}</code></div>`).join('')}</div></div>
        <div><h3>Radii</h3><div class="radii">${[['Field', 16], ['Card (desktop)', 24], ['Card', 28], ['Sheet', 32], ['Button / chip', 999]].map(([n, r]) => `<div><i style="border-radius:${Math.min(r, 40)}px"></i><b>${n}</b><code>${r === 999 ? 'pill' : r + 'px'}</code></div>`).join('')}</div>
          <h3>Targets</h3><p>Primary buttons 56px tall. Every tap target ≥ 44 × 44px, including chips, calendar days, icon buttons and tab items.</p></div>
      </div></section>

    <section class="doc-sec" id="ds-glass"><h2>Glass recipe</h2>
      <div class="grid2"><pre class="code">/* cards, header, input bar, tab bar */
background: rgba(255,255,255,0.72);
backdrop-filter: blur(22px) saturate(140%);
border: 1px solid rgba(255,255,255,0.7);
box-shadow: 0 24px 56px -18px rgba(42,24,48,.18),
            0 2px 8px rgba(42,24,48,.05);

/* bottom sheets, menus, input fills */
background: rgba(255,255,255,0.90);

/* toasts */
background: rgba(42,24,48,0.92); color: #fff;

/* orbs: solid circles, never gradients */
filter: blur(76–90px); opacity: .35–.5;

/* luminous outline (primary button, active tab, hero card) */
box-shadow: 0 0 0 1px var(--glow), 0 0 28px -4px var(--glow);</pre>
      <div class="scr demo glassdemo" data-tone="preg">${P.orbs('preg')}<div class="card glow" style="position:relative;margin:40px 24px"><p class="t-sec">Hero card · glow</p><p class="t-h3">Minggu ke-14</p></div><div class="card" style="position:relative;margin:0 24px 40px"><p class="t-sec">Standard glass card</p><p class="t-body">Text never sits directly on an orb.</p></div></div></div></section>

    <section class="doc-sec" id="ds-motion"><h2>Motion</h2>
      <ul class="plain"><li>Content rises in ≤ 0.34s with a 40ms stagger (transform + opacity only).</li><li>Sheets slide up in 0.32s; toasts fade up in 0.3s; buttons press-scale to 0.98.</li><li>Orbs drift 19–24s, on the welcome screen only.</li><li>Calm screens (emergency, loss) have no motion.</li><li><code>prefers-reduced-motion: reduce</code> switches every animation and transition off.</li></ul></section>

    <section class="doc-sec" id="ds-comp"><h2>Components</h2>
      <div class="comp-grid">
        <div class="comp"><h3>Buttons</h3><div class="scr demo" data-tone="preg"><div class="stack">${btn('Primary · Hamil')}${btn('Glass', { kind: 'glass' })}${btn('Text button', { kind: 'text', cls: 'center' })}${btn('Telepon <span class="num">119</span> (ambulans)', { kind: 'danger', icon: 'phone' })}${btn('Disabled', { disabled: true })}</div></div>
          <div class="scr demo" data-tone="plan" style="margin-top:10px">${btn('Primary · Merencanakan')}</div><div class="scr demo" data-tone="baby" style="margin-top:10px">${btn('Primary · Setelah lahir')}</div><div class="scr demo" data-tone="neutral" style="margin-top:10px">${btn('Primary · Akun')}</div></div>
        <div class="comp"><h3>Chips, badges, source</h3><div class="scr demo" data-tone="preg"><div class="stack" style="gap:12px"><div class="chips">${chip('Default')}${chip('Selected', { pressed: true })}${chip('Tanda bahaya', { cls: 'danger', icon: 'alert' })}</div>
          <div class="chips"><span class="badge mitra">${ic('heart', 14)}Mitra Peluky</span><span class="badge cover">${ic('shieldc', 14)}Ditanggung</span><span class="badge stage">${ic('calendar', 14)}Hamil</span><span class="badge money">${ic('coins', 14)}Biaya</span></div>${src('Chubb Life, Jan 2026')}</div></div></div>
        <div class="comp"><h3>Inputs</h3><div class="scr demo" data-tone="preg"><div class="stack" style="gap:14px">${field({ id: 'dsi1', label: 'Nomor HP', pre: '+62', ph: '812 3456 7890' })}${field({ id: 'dsi2', label: 'Kode kantor/asuransi', value: 'SALAH1', err: 'Kode tidak ditemukan. Cek lagi atau tanya HR-mu.' })}${field({ id: 'dsi3', label: 'Panjang badan', value: '82', suf: 'cm', warn: 'Angkanya tidak biasa, cek lagi ya.' })}</div></div></div>
        <div class="comp"><h3>Switches, segmented, checkbox</h3><div class="scr demo" data-tone="preg"><div class="stack" style="gap:12px"><div class="rows">${sw('dss1', 'Data kesehatan', 'Untuk kalender dan pengingat.', true, 'noop')}${sw('dss2', 'Info & promosi', '', false, 'noop')}</div>${seg('Contoh', [['a', 'Scan'], ['b', 'Menu'], ['c', 'Manual']], 'a', 'noop')}${P.check('dsc1', 'KTP', true, 'noop')}${P.check('dsc2', 'Buku KIA', false, 'noop')}</div></div></div>
        <div class="comp"><h3>Cards</h3><div class="scr demo" data-tone="baby">${P.orbs('baby')}<div class="stack" style="position:relative;gap:12px"><div class="card glow"><p class="t-h3">Hero · glow outline</p><p class="t-sec">One per home.</p></div><div class="card tinted"><p class="t-h3">Tinted · stage</p><p class="t-sec">Follow-ups, nudges.</p></div><div class="card amber"><p class="t-h3">Amber · calm status</p><p class="t-sec" style="color:var(--ink)">Outside range. Never red.</p></div></div></div></div>
        <div class="comp"><h3>Sheet (dialog) + toast</h3><div class="scr demo sheetdemo" data-tone="preg"><div class="sheet" role="presentation"><div class="sheet-h"><h4 class="sheet-title">Tanya bidan</h4><span class="ib" aria-hidden="true">${ic('close')}</span></div><div class="sheet-b"><p class="t-body">Close button, Escape, focus trapped.</p>${btn('Buka chat bidan')}</div></div>
          <div class="toast" style="position:relative;margin-top:12px">${ic('checkc', 20)}<span class="grow">Tersimpan: Mual</span><button type="button" tabindex="-1">Urungkan</button></div></div></div>
        <div class="comp wide"><h3>Floating tab bar (homes only)</h3><div class="tabdemos">${['plan', 'preg', 'baby'].map((s) => `<div class="scr demo tabdemo" data-tone="${s}">${P.orbs(s)}${P.tabbar(s, P.homeOf(s)).replace(/data-go="[^"]*"|data-sheet="[^"]*"/g, '').replace('<nav', '<nav aria-hidden="true"')}</div>`).join('')}</div></div>
        <div class="comp wide"><h3>Danger panel</h3><div class="scr demo sheetdemo" data-tone="preg" style="max-width:430px">${P.orbs('preg')}<div class="sheet danger" role="presentation"><div class="sheet-b">${P.sheets.danger('Perdarahan / flek banyak').body.replace(/id="sh-[td]"/g, '').replace(/data-act="[^"]*"/g, 'tabindex="-1"')}</div></div></div>
          <p class="note">Red fill, “Telepon 119” first and largest, no close button, scrim tap and Escape do nothing. Only “Salah pilih, kembali” closes it. Self-harm and prolonged sadness add the support line.</p></div>
      </div></section>
  </div>`;

  /* ------------------------------------------------------------------ note: contrast + placeholders */
  const CROWS = [
    ['Body & headings', '15–30px', '#2A1830', 'glass', 4.5],
    ['Section titles on bare ground', '17px', '#2A1830', 'ground', 4.5],
    ['Secondary text', '13px', '#5E4B62', 'glass', 4.5],
    ['Secondary text in sheets', '13px', '#5E4B62', 'sheet', 4.5],
    ['Planning small text / errors', '13–15px', '#8F3210', 'glass', 4.5],
    ['Planning large numerals', '≥24px', '#C04A1A', 'glass', 3],
    ['Pregnancy text', '13–15px', '#8E2A8B', 'glass', 4.5],
    ['After-birth small text', '13–15px', '#075C45', 'glass', 4.5],
    ['After-birth large numerals', '≥24px', '#0B7A5C', 'glass', 3],
    ['Money / amber text', '13–30px', '#7A4A00', 'glass', 4.5],
    ['Text on stage tint (18%)', '13–17px', '#5E4B62', 'glass', 4.5, tint('#C86DD7', 0.18)],
    ['Fertile-day numerals on coral band', '15px', '#8F3210', 'glass', 4.5, tint('#FF8A6B', 0.26)],
    ['Placeholder on input fill', '16px', '#7A6A7D', 'sheet', 4.5],
    ['Control borders (non-text)', '1–1.5px', '#7A6A7D', 'glass', 3],
    ['Control border vs its own fill', '1–1.5px', '#7A6A7D', 'sheet', 3],
    ['Danger panel body', '15px', '#2A1830', 'redTint', 4.5],
    ['Danger panel title', '22px', '#7E1010', 'redTint', 3],
    ['Toast text', '14px', '#FFFFFF', 'toast', 4.5]
  ];
  const FILLS = [['Primary · Merencanakan', '#C04A1A'], ['Primary · Hamil', '#8E2A8B'], ['Primary · Setelah lahir', '#0B7A5C'], ['Primary · Akun', '#2A1830'], ['Danger button', '#C21F1F'], ['Calm button', '#3D5560'], ['Period day (white numeral)', '#C04A1A']];
  const contrastTable = () => `<div class="tbl-wrap"><table class="doc-tbl"><thead><tr><th scope="col">Text style</th><th scope="col">Size</th><th scope="col">Colour</th><th scope="col">Worst surface</th><th scope="col">Ratio</th><th scope="col">Needs</th><th scope="col">Result</th></tr></thead><tbody>
    ${CROWS.map(([n, size, c, s, need, t]) => { const [r, at] = worst(hex(c), s, t); return `<tr><td>${n}</td><td>${size}</td><td><span class="swc" style="background:${c}"></span><code>${c}</code></td><td>${{ glass: 'Glass 72%', ground: 'Bare ground', sheet: 'Sheet 90%', redTint: 'Danger panel', toast: 'Dark toast' }[s]} over ${at}</td><td><b>${fmt(r)}</b></td><td>${need}:1</td><td>${mark(r >= need)}</td></tr>`; }).join('')}
    ${FILLS.map(([n, c]) => { const r = ratio(W, hex(c)); return `<tr><td>${n}</td><td>15–20px</td><td><span class="swc" style="background:#fff;border:1px solid #ccc"></span><code>#FFFFFF</code></td><td>Solid fill <span class="swc" style="background:${c}"></span><code>${c}</code></td><td><b>${fmt(r)}</b></td><td>4.5:1</td><td>${mark(r >= 4.5)}</td></tr>`; }).join('')}
    ${[['Calm text', '#1D2B30'], ['Calm secondary', '#4F6066'], ['Calm accent', '#3D5560']].map(([n, c]) => { const r = ratio(hex(c), SURF.calmGlass()); return `<tr><td>${n}</td><td>13–22px</td><td><span class="swc" style="background:${c}"></span><code>${c}</code></td><td>Glass over calm ground</td><td><b>${fmt(r)}</b></td><td>4.5:1</td><td>${mark(r >= 4.5)}</td></tr>`; }).join('')}
  </tbody></table></div>`;
  const RULES = [
    ['Muted on bare ground', '#5E4B62', 'ground', 4.5, 'Muted text is never placed on bare ground; text there uses ink.'],
    ['Coral deep as small text', '#C04A1A', 'glass', 4.5, 'Coral deep is used for fills and ≥24px numerals only; small coral text uses #8F3210.'],
    ['Green deep as small text', '#0B7A5C', 'glass', 4.5, 'Green deep is used for fills and ≥24px numerals only; small green text uses #075C45.'],
    ['Red as text on glass', '#C21F1F', 'glass', 4.5, 'Red never appears as text on glass; danger copy sits on the red-tint panel in ink or #7E1010.'],
    ['Stage deep text on bare ground', '#8E2A8B', 'ground', 4.5, 'Links and labels on bare ground switch to ink automatically (CSS variable scope); stage colours return inside glass.'],
    ['Error text on bare ground', '#8F3210', 'ground', 4.5, 'Inputs always sit on a card or sheet, so error text is measured on glass (5.94:1), never on bare ground.'],
    ['Line border on bare ground', '#7A6A7D', 'ground', 3, 'Controls never draw a bare border on the ground: chips, fields and segmented controls carry their own 90% white fill (border vs fill ≥ 4.53:1).']
  ];
  const PH = [
    ['Needs clinical review', [
      ['Weekly guide body', '“[Perkembangan janin minggu ke-x · menunggu tinjauan klinis]”, “[Perubahan umum minggu ini]”, “[Ilustrasi ukuran minggu x · sumber]”', '15'],
      ['Danger-sign lists and wording', 'Hamil (9), Nifas (9), Bayi (5); planning day-log chips “Nyeri perut hebat”, “Perdarahan sangat banyak”', '9, 14, 23, 25, 26'],
      ['AI danger keyword list', 'Regex that routes to the red card (perdarahan, kejang, sesak, ketuban, bunuh diri …)', '20, 21'],
      ['Tanya Peluky answers', 'Seed answers (kafein, masa subur, MPASI), generic “[Jawaban singkat dari referensi klinis]”, every “Sumber: [referensi klinis]” chip', '20'],
      ['Midwife sample threads', 'Three sample conversations and their safety wording', '21'],
      ['Recovery check', 'Six questions, answer wording and danger / moderate / low-mood tiers', '26'],
      ['Breastfeeding problems', 'Neutral copy for “Puting lecet”, “Payudara terasa penuh”, “Khawatir ASI kurang”', '27'],
      ['MPASI', '“[Tekstur sesuai usia · sumber]”, “[porsi]”, “[frekuensi · sumber]”, allergen note, first-foods list', '19, 29'],
      ['Immunisation', '“[Nama vaksin]”, “[Usia …]”, “Jadwal dari [sumber, tanggal]”', '25, 30'],
      ['NutriScan', 'General plate note, “[referensi gizi]”, detection confidence wording', '18'],
      ['Growth', 'Amber copy, “unusual value” rule (<40 cm, >80 cm or >9 cm from median), weight-for-age and boys’ tables not loaded', '28'],
      ['Pre-pregnancy checklist', 'Five checklist items', '9'],
      ['Check-up source year', '“Kemenkes, [tahun]”', '16']
    ]],
    ['Needs real content', [
      ['Hospitals', '[RS A], [RS Ibu & Anak B], [RSUD C], [RS D], [RS E] and their BPJS / NICU / room facts, [Foto RS], [nomor telepon], [alamat]', '11, 12, 13, 17, 22, 23, 37'],
      ['Clinicians', '[dr. Nama, Sp.OG], [dr. Nama, Sp.A], [Nama, Konselor laktasi], [Bidan Nama], [Foto]', '12, 21, 22, 23'],
      ['Prices', '[Rp …], [Rp …/bulan] for savings plan, package table, meals, consults, Premium, portal fee, HR programme', '10, 12, 19, 22, 34, 37, 38'],
      ['Distances and times', '[x km], [x menit], reply time [x menit], response time [x jam]', '11, 12, 13, 17, 21, 23, 37'],
      ['Mental-health line', '[Layanan dukungan] and [Jam layanan] (must be verified before testing)', '14, 23, 24, 26'],
      ['Employer & insurer', '[Nama kantor], [KODE-KANTOR], [kuota], every “[angka]” tile', '10, 31, 34, 35, 36, 38'],
      ['Vendor', '[Vendor A], [Foto menu], [alamat rumah], [alamat kantor]', '19'],
      ['Identity', '[Nama], [Nama Anak], +62 [nomor HP], [KODE-6], [Nama pasien], [catatan pasien]', '25, 31, 32, 33, 37'],
      ['Legal links', '[Syarat], [Kebijakan Privasi]', '2, 4'],
      ['Package verification', '“diverifikasi [tanggal]”, package line items', '12'],
      ['Cost detail', '[Rincian komponen biaya · perlu sumber]', '10']
    ]],
    ['Verify before testing', [
      ['Sourced figures', 'Chubb Life (Jan 2026), Cermati (diakses Okt 2026), Kompas TV (Sep 2025), Kemenkes 6× check-ups, UU KIA No. 4/2024, PP 33/2012, Permenkes 2/2020 girls 0–6 m table', '9, 10, 11, 16, 27, 28, 29'],
      ['Privacy promises', '“Kami tidak menjual datamu”, consent defaults, per-request hospital sharing, partner off-by-default, employer ≥10 rule enforced server-side', '4, 12, 32, 36, 38'],
      ['Free vs Premium list', 'Must match the final pricing decision; safety features stay free', '34'],
      ['Calls and directions', 'Prototype only shows a toast; production dials 119 / opens maps', '14, 23, 24']
    ]]
  ];
  P.docs.notes = () => `<div class="doc">
    <header class="doc-hero"><div>${P.logo(52, false)}</div><div><h1>Contrast and placeholder note</h1><p>Worst-case contrast for each text style, then every placeholder that needs real content or clinical review before user testing.</p></div></header>
    <section class="doc-sec"><h2>How the worst case is measured</h2>
      <p class="lead">Each surface is composited over the most saturated orb at <b>full</b> opacity, then the lowest ratio across berry, coral, aqua and sun is kept. Real orbs are blurred and sit at 35–50%, so on-device contrast is higher than shown. Bare ground assumes an orb at 50% over #F7F5FB.</p>
      ${contrastTable()}
      <h3 style="margin-top:22px">Pairs that fail, and the rule that keeps them out</h3>
      <div class="tbl-wrap"><table class="doc-tbl"><thead><tr><th scope="col">Pair</th><th scope="col">Worst ratio</th><th scope="col">Rule in the design</th></tr></thead><tbody>
        ${RULES.map(([n, c, s, need, rule]) => { const [r] = worst(hex(c), s); return `<tr><td>${n}</td><td><b>${fmt(r)}</b> <small>(needs ${need}:1)</small></td><td>${rule}</td></tr>`; }).join('')}</tbody></table></div>
    </section>
    <section class="doc-sec"><h2>Placeholder register</h2><p class="lead">Numbers in the last column are screen numbers from the prototype (A1–G38).</p>
      ${PH.map(([g, rows]) => `<h3>${g}</h3><div class="tbl-wrap"><table class="doc-tbl"><thead><tr><th scope="col">Item</th><th scope="col">Placeholder or content</th><th scope="col">Screens</th></tr></thead><tbody>${rows.map(([a, b, c]) => `<tr><td><b>${a}</b></td><td>${b}</td><td class="num">${c}</td></tr>`).join('')}</tbody></table></div>`).join('')}
    </section>
  </div>`;
})();
