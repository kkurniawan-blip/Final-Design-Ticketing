/* Sections E (After birth, aqua/green), F (Account & family, neutral), G (Partner portals, desktop). */
(function () {
  'use strict';
  const { ic, esc, btn, chip, sw, field, seg, src, sos, hdr } = P;

  /* ======================================================================
     E25 · Beranda bayi
     ====================================================================== */
  const nextImun = () => P.S.imun.done.indexOf(false);
  P.def({
    id: 'babyHome', sec: 'E', n: 25, name: 'Beranda bayi', tone: 'baby',
    notes: 'One primary card (next immunisation) carries the glow. Mother’s own recovery check sits right below the baby hero, so her health is not an afterthought. “Darurat” in the header and the “Ada tanda bahaya?” row (above the fold) open the baby danger list, which leads to the red panel. Follow-up asks about the baby, not about her.',
    states: [{ label: 'Sheet tanda bahaya bayi', sheet: 'dangerPick', sheetArg: 'bayi' }, { label: 'Sheet catat', sheet: 'catat', state: (S) => { S.stage = 'baby'; } }],
    render: () => {
      const s = P.S, age = P.babyAge(), ni = nextImun(), last = s.growth.data[s.growth.data.length - 1];
      return {
        main: P.homeHdr(`Hai${s.name ? ', ' + esc(s.name) : ''}!`, `<button class="ib" data-go="account" aria-label="Akun">${ic('user')}</button>`) + `<div class="body rise">
          ${P.followCard('baby')}
          <section class="card" aria-label="Si kecil"><div class="card-row"><span class="ph-img" style="width:72px;height:72px;border-radius:26px;padding:0;font-size:11px" aria-hidden="true">[Foto]</span>
            <div class="grow"><h2 class="t-h2">${P.babyName()}</h2><p class="num" style="margin:2px 0 0;font-size:18px;font-weight:600">${age.txt}</p><p class="t-sec">Lahir ${P.fmt(P.parse(s.baby.dob))}</p></div></div></section>
          ${P.dangerRow('bayi')}
          ${ni >= 0 ? `<button type="button" class="card glow" data-go="imun"><span class="card-row"><span class="bubble-ic">${ic('syringe')}</span><span class="grow"><span class="t-sec" style="display:block">Imunisasi berikutnya</span><span class="t-h3" style="display:block">[Nama vaksin] · [Usia …]</span><span class="t-sec">Konfirmasi jadwal ke dokter/bidan</span></span>${ic('chev')}</span></button>` : ''}
          <button type="button" class="card tight" data-act="toRecovery"><span class="card-row"><span class="bubble-ic">${ic('heart')}</span><span class="grow"><span class="t-h3" style="display:block">Cek pemulihanmu</span><span class="t-sec">6 pertanyaan, satu ketukan tiap jawaban</span></span>${ic('chev')}</span></button>
          <button type="button" class="card tight" data-go="growth"><span class="card-row"><span class="bubble-ic">${ic('chart')}</span><span class="grow"><span class="t-h3" style="display:block">Lihat grafik tumbuh</span><span class="t-sec num">Terakhir: ${String(last.v).replace('.', ',')} cm · ${last.m} bulan</span></span>${ic('chev')}</span></button>
          ${P.namePrompt()}
          <div class="tiles">${[['menyusui', 'timer', 'Menyusui'], ['mpasi', 'utensils', 'MPASI'], ['imun', 'syringe', 'Imunisasi'], ['bidan', 'chat', 'Bidan']].map(([g, i, t]) => `<button type="button" class="card tile" data-go="${g}"><span class="bubble-ic">${ic(i)}</span>${t}</button>`).join('')}</div>
        </div>`,
        tab: 'baby'
      };
    }
  });
  P.acts.toRecovery = () => { P.S.recoveryCalm = false; P.go('recovery'); };
  P.sheets.babyDanger = () => P.sheets.dangerPick('bayi');
  P._oldBabyDanger = () => ({
    title: 'Tanda bahaya bayi',
    body: `<p class="t-body">Ketuk yang sedang dialami si kecil.</p><div class="chips">${P.DANGER.bayi.map((t) => chip(t, { cls: 'danger', icon: 'alert', 'data-sheet': 'danger', 'data-v': t })).join('')}</div>
      <p class="t-sec">Ragu? Telepon 119 atau ke IGD terdekat.</p>`
  });
  P.acts.growthAddFromCatat = () => { P.closeSheet(true, true); P.go('growth'); P.openSheet('growthAdd'); };

  /* ======================================================================
     E26 · Cek pemulihan
     ====================================================================== */
  const RQ = [
    ['bleed', 'Perdarahan', 'drop', [['Sedikit / tidak ada', 'ok'], ['Seperti haid', 'mod'], ['Banyak', 'danger', 'Perdarahan banyak']]],
    ['wound', 'Luka jahitan atau operasi', 'band', [['Baik / tidak ada luka', 'ok'], ['Nyeri', 'mod'], ['Bernanah atau berbau', 'danger', 'Luka bernanah atau berbau']]],
    ['fever', 'Suhu badan', 'thermo', [['Normal', 'ok'], ['Agak hangat', 'mod'], ['Demam', 'danger', 'Demam']]],
    ['pain', 'Nyeri', 'zap', [['Tidak ada', 'ok'], ['Ringan', 'mod'], ['Hebat', 'danger', 'Nyeri hebat']]],
    ['sleep', 'Tidur', 'moon', [['Cukup', 'ok'], ['Kurang', 'mod'], ['Hampir tidak bisa tidur', 'mod']]],
    ['mood', 'Perasaanmu', 'smile', [['Baik', 'ok'], ['Naik turun', 'low'], ['Sedih berkepanjangan', 'danger', 'Sedih berkepanjangan'], ['Pikiran menyakiti diri', 'danger', 'Pikiran menyakiti diri']]]
  ];
  P.def({
    id: 'recovery', sec: 'E', n: 26, name: 'Cek pemulihan', tone: () => P.S.recoveryCalm ? 'calm' : 'baby',
    notes: 'Six one-tap questions. Danger answers open the red panel immediately (self-harm and prolonged sadness lead with “Kamu tidak sendiri” and a counsellor button); “Salah pilih, kembali” also undoes the answer. Options are plain chips, so red stays rare. Moderate answers add an inline “Chat bidan” card. Low mood gets a calm, non-alarming card. Opened from the loss screen it renders in the calm palette with no baby references.',
    states: [{ label: 'Jawaban sedang + suasana hati', state: (S) => { S.recovery.a = { bleed: 0, wound: 1, fever: 0, mood: 1 }; } }],
    render: () => {
      const a = P.S.recovery.a, n = Object.keys(a).length;
      return {
        main: hdr({ title: 'Cek pemulihan', sub: 'Untuk kesehatanmu sendiri' }) + `<div class="body rise">
          <p class="t-body"><b class="num">${n} dari 6</b> dijawab. Jawab sesuai yang kamu rasakan hari ini.</p>
          ${RQ.map(([k, q, i, opts]) => {
            const sel = a[k], o = sel !== undefined ? opts[sel] : null;
            return `<section class="card tight" aria-labelledby="rq-${k}"><div class="card-row"><span class="bubble-ic">${ic(i)}</span><h2 class="t-h3 grow" id="rq-${k}">${q}</h2>${o ? `<span class="t-sec">${ic('check', 16, 'style="display:inline;vertical-align:-3px"')} Dijawab</span>` : ''}</div>
              <div class="chips" role="radiogroup" aria-labelledby="rq-${k}">${opts.map(([t, lv], j) => chip(t, { role: 'radio', pressed: sel === j, 'data-act': 'rqAns', 'data-k': k, 'data-v': j })).join('')}</div>
              ${o && o[1] === 'mod' ? `<div class="card tight tinted" style="box-shadow:none"><p class="t-sec" style="color:var(--ink)">Sebaiknya ceritakan ke bidan.</p>${btn('Chat bidan', { cls: 'btn-sm', icon: 'chat', 'data-go': 'bidan', 'data-arg': `${q}: ${t2(o)}` })}</div>` : ''}
              ${o && o[1] === 'low' ? `<div class="card tight solid" style="box-shadow:none"><p class="t-h3">Bicara dengan profesional</p><p class="t-sec">Perasaan naik turun itu wajar. Kamu tidak harus menghadapinya sendiri.</p>
                ${btn('Bicara dengan konselor', { kind: 'support', cls: 'btn-sm', icon: 'heart', 'data-act': 'callSupport', style: 'width:100%' })}${btn('Chat bidan', { kind: 'glass', cls: 'btn-sm', 'data-go': 'bidan', style: 'width:100%' })}
                <p class="t-sec">Ingin cek lebih lengkap? [Kuesioner suasana hati tervalidasi (EPDS) · perlu lisensi & tinjauan klinis]</p></div>` : ''}
            </section>`;
          }).join('')}
          ${sos()}
        </div>`,
        dock: btn('Simpan hasil', { 'data-act': 'rqSave', disabled: !n })
      };
    }
  });
  const t2 = (o) => o[0];
  P.acts.rqAns = (el) => {
    const k = el.dataset.k, j = +el.dataset.v, opt = RQ.find((q) => q[0] === k)[3][j];
    const a = P.S.recovery.a, prev = a[k];
    a[k] = j; P.rerender();
    // “Salah pilih, kembali” restores the previous answer, so a mis-tap is never saved.
    if (opt[1] === 'danger') P.openDanger(opt[2], () => { if (prev === undefined) delete a[k]; else a[k] = prev; });
  };
  P.acts.rqSave = () => { P.toast('Hasil cek pemulihan tersimpan'); P.back(); };

  /* ======================================================================
     E27 · Menyusui
     ====================================================================== */
  const bfSecs = () => { const b = P.S.bf; return b.acc + (b.startedAt ? Math.floor((Date.now() - b.startedAt) / 1000) : 0); };
  const mmss = (t) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
  P.def({
    id: 'menyusui', sec: 'E', n: 27, name: 'Menyusui', tone: 'baby',
    notes: 'Large left/right buttons double as start/pause and show a text state (“Berjalan”). Common problems are described neutrally and route to a lactation consult; no advice, no formula.',
    render: () => {
      const b = P.S.bf, run = !!b.startedAt, t = bfSecs();
      return {
        main: hdr({ title: 'Menyusui' }) + `<div class="body rise">
          <section class="card glow" aria-label="Pengatur waktu menyusui">
            <p class="t-sec" style="text-align:center">${b.side ? `Sisi ${b.side === 'L' ? 'kiri' : 'kanan'} · ${run ? 'berjalan' : 'dijeda'}` : 'Pilih sisi untuk mulai'}</p>
            <div class="timer" id="bf-timer" role="timer" aria-live="off">${mmss(t)}</div>
            <div class="btn-row" style="gap:12px">${[['L', 'Kiri'], ['R', 'Kanan']].map(([k, l]) => `<button type="button" class="side-btn" aria-pressed="${b.side === k && run}" data-act="bfSide" data-v="${k}">${ic(b.side === k && run ? 'pause' : 'play', 24)}<span>${l}</span><span style="font-size:13px;font-weight:600">${b.side === k && run ? 'Berjalan' : b.side === k ? 'Dijeda' : 'Mulai'}</span></button>`).join('')}</div>

          </section>
          <section class="card"><div class="card-row"><h2 class="t-h3 grow">Hari ini</h2><span class="t-sec num" style="font-weight:700">${b.log.length} kali</span></div>
            <ul class="rows" style="list-style:none;margin:0;padding:0">${b.log.map((l) => `<li class="row static"><span class="num" style="font-weight:600;min-width:54px">${l.t}</span><span class="grow">${l.s}</span><span class="num t-sec" style="font-weight:700">${l.m} mnt</span></li>`).join('')}</ul></section>
          <section class="card"><h2 class="t-h3">Kendala yang sering dialami</h2>
            ${['Puting lecet', 'Payudara terasa penuh atau bengkak', 'Khawatir ASI kurang'].map((p) => `<details class="more"><summary>${ic('chev', 18)}${p}</summary><p class="t-sec" style="margin:4px 0 8px">Ini sering dialami. Konselor laktasi bisa membantu melihat posisi dan pelekatan.</p></details>`).join('')}</section>
          <button type="button" class="card tight" data-go="konsul" data-arg="lak"><span class="card-row"><span class="bubble-ic">${ic('video')}</span><span class="grow"><span class="t-h3" style="display:block">Konsultasi laktasi</span><span class="t-sec">Dengan konselor laktasi</span></span>${ic('chev')}</span></button>
          <div class="card tight tinted"><div class="card-row"><span class="bubble-ic">${ic('heart')}</span><p class="grow t-body"><b>ASI eksklusif 6 bulan</b></p></div>${src('PP 33/2012')}</div>
        </div>`,
        dock: btn('Selesai & simpan', { icon: 'check', 'data-act': 'bfSave', disabled: !t })
      };
    },
    after: () => { P.every(() => { const el = P.el().querySelector('#bf-timer'); if (el && P.S.bf.startedAt) { el.textContent = mmss(bfSecs()); const d = P.el().querySelector('.dock .btn'); if (d) d.disabled = false; } }, 500); }
  });
  P.acts.bfSide = (el) => {
    const b = P.S.bf, k = el.dataset.v;
    if (b.side === k && b.startedAt) { b.acc = bfSecs(); b.startedAt = 0; }
    else { if (b.startedAt) b.acc = bfSecs(); b.side = k; b.startedAt = Date.now(); }
    P.rerender();
  };
  P.acts.bfSave = () => {
    const b = P.S.bf, m = Math.max(1, Math.round(bfSecs() / 60));
    b.log.unshift({ t: '09.41', s: b.side === 'R' ? 'Kanan' : 'Kiri', m }); b.side = null; b.startedAt = 0; b.acc = 0; P.rerender(); P.toast(`Tersimpan · ${m} menit`);
  };

  /* ======================================================================
     E28 · Tumbuh kembang
     ====================================================================== */
  const SD = { lo: [45.4, 49.8, 53.0, 55.6, 57.8, 59.6, 61.2], md: [49.1, 53.7, 57.1, 59.8, 62.1, 64.0, 65.7], hi: [52.9, 57.6, 61.1, 64.0, 66.4, 68.5, 70.3] };
  P.SD = SD;
  const cm = (v) => String(v).replace('.', ',');
  const growthStatus = () => {
    const d = P.S.growth.data, last = d[d.length - 1];
    if (last.v < SD.lo[last.m]) return ['low', last]; if (last.v > SD.hi[last.m]) return ['high', last]; return ['ok', last];
  };
  const chart = () => {
    const vals = P.S.growth.data.map((p) => p.v);
    const vmin = Math.min(44, 44 - 6 * Math.ceil((44 - (Math.min(...vals) - 2)) / 6)), vmax = Math.max(72, Math.ceil(Math.max(...vals) + 2));
    const W = 316, H = 262, x0 = 30, x1 = 252, y0 = 226, y1 = 14, ticks = [];
    for (let v = vmin; v <= vmax; v += 6) ticks.push(v);
    const X = (m) => x0 + (m / 6) * (x1 - x0), Y = (v) => y0 - ((v - vmin) / (vmax - vmin)) * (y0 - y1);
    const line = (arr) => arr.map((v, m) => `${X(m).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
    const d = [...P.S.growth.data].sort((a, b) => a.m - b.m), last = d[d.length - 1];
    const pts = d.map((p) => `${X(p.m).toFixed(1)},${Y(p.v).toFixed(1)}`).join(' ');
    const px = X(last.m), lx = px > x1 - 70 ? px - 124 : Math.max(px - 56, x0 + 4), ly = Y(last.v) - 46 < y1 ? Y(last.v) + 14 : Y(last.v) - 46;
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="gc-t gc-d"><title id="gc-t">Grafik panjang badan menurut umur</title>
      <desc id="gc-d">Pengukuran terakhir ${cm(last.v)} cm di usia ${last.m} bulan. Rentang standar −2 SD sampai +2 SD di usia itu: ${cm(SD.lo[last.m])} sampai ${cm(SD.hi[last.m])} cm.</desc>
      ${ticks.map((v) => `<line x1="${x0}" x2="${x1}" y1="${Y(v)}" y2="${Y(v)}" stroke="currentColor" stroke-opacity=".08"/><text x="${x0 - 8}" y="${Y(v) + 4}" text-anchor="end" font-size="13" style="fill:var(--muted)">${v}</text>`).join('')}
      ${[0, 1, 2, 3, 4, 5, 6].map((m) => `<text x="${X(m)}" y="${y0 + 18}" text-anchor="middle" font-size="13" style="fill:var(--muted)">${m}</text>`).join('')}
      <text x="${(x0 + x1) / 2}" y="${H - 1}" text-anchor="middle" font-size="13" style="fill:var(--muted)">Usia (bulan)</text><text x="${x0 - 8}" y="10" text-anchor="end" font-size="13" style="fill:var(--muted)">cm</text>
      <polygon points="${line(SD.hi)} ${SD.lo.map((v, m) => `${X(m).toFixed(1)},${Y(v).toFixed(1)}`).reverse().join(' ')}" fill="#34D6A6" fill-opacity=".18"/>
      <polyline points="${line(SD.hi)}" fill="none" style="stroke:var(--green-dd)" stroke-opacity=".55" stroke-width="1.2"/>
      <polyline points="${line(SD.lo)}" fill="none" style="stroke:var(--green-dd)" stroke-opacity=".55" stroke-width="1.2"/>
      <polyline points="${line(SD.md)}" fill="none" stroke="currentColor" stroke-opacity=".4" stroke-width="1.2" stroke-dasharray="4 4"/>
      <text x="${x1 + 6}" y="${Y(SD.hi[6]) + 4}" font-size="13" style="fill:var(--green-dd)" font-weight="600">+2 SD</text>
      <text x="${x1 + 6}" y="${Y(SD.md[6]) + 4}" font-size="13" style="fill:var(--ink)">Median</text>
      <text x="${x1 + 6}" y="${Y(SD.lo[6]) + 4}" font-size="13" style="fill:var(--green-dd)" font-weight="600">−2 SD</text>
      <polyline points="${pts}" fill="none" stroke="#34D6A6" stroke-opacity=".6" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" style="filter:blur(4px)"/>
      <polyline points="${pts}" fill="none" stroke="#0B7A5C" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      ${d.map((p) => `<circle cx="${X(p.m)}" cy="${Y(p.v)}" r="${p === last ? 6 : 4}" fill="#fff" stroke="#0B7A5C" stroke-width="${p === last ? 3 : 2}"/>`).join('')}
      <g><rect x="${lx}" y="${ly}" width="112" height="32" rx="12" style="fill:var(--glass-strong)"/><rect x="${lx}" y="${ly}" width="112" height="32" rx="12" fill="none" stroke="#0B7A5C" stroke-opacity=".35"/>
        <text x="${lx + 56}" y="${ly + 21}" text-anchor="middle" font-size="13" font-weight="600" style="fill:var(--ink)">${last.m} bln · ${cm(last.v)} cm</text></g>
    </svg>`;
  };
  P.def({
    id: 'growth', sec: 'E', n: 28, name: 'Tumbuh kembang', tone: 'baby',
    notes: 'Chart drawn to scale from the Permenkes 2/2020 girls’ length-for-age table (0–6 months): soft band between −2 SD and +2 SD, dashed median, glowing child line, glass label on the latest point. Status is worded and iconed, and outside the band it is a calm amber card, never red. The add sheet only blocks empty or non-numeric input; odd values get a gentle double-check.',
    states: [{ label: 'Di luar rentang (amber)', state: (S) => { S.growth.data = S.growth.data.slice(0, 4).concat([{ m: 4, v: 56.9 }]); } }, { label: 'Sheet tambah ukuran', sheet: 'growthAdd' }],
    render: () => {
      const g = P.S.growth, [st, last] = growthStatus(), girl = P.S.baby.sex !== 'm';
      const status = st === 'ok'
        ? `<section class="card tight tinted"><div class="card-row"><span class="bubble-ic">${ic('checkc')}</span><div class="grow"><h2 class="t-h3">Dalam rentang standar</h2><p class="t-sec num">${cm(last.v)} cm di usia ${last.m} bulan, di antara −2 SD dan +2 SD.</p></div></div></section>`
        : `<section class="card amber"><div class="card-row"><span class="bubble-ic sun">${ic('info')}</span><div class="grow"><h2 class="t-h3">${st === 'low' ? 'Di bawah −2 SD' : 'Di atas +2 SD'}</h2><p class="t-sec num" style="color:var(--ink)">${cm(last.v)} cm di usia ${last.m} bulan. Ini bukan diagnosis, sebaiknya dicek dokter anak.</p></div></div>
            ${btn('Buat janji dokter anak', { 'data-go': 'konsul', 'data-arg': 'spa', cls: 'btn-sm', style: 'width:100%' })}</section>`;
      return {
        main: hdr({ title: 'Tumbuh kembang', sub: girl ? 'Perempuan · standar WHO (Permenkes 2/2020)' : 'Laki-laki · standar WHO (Permenkes 2/2020)' }) + `<div class="body rise">
          ${seg('Ukuran', [['len', 'Panjang badan'], ['wt', 'Berat badan']], g.tab, 'gTab')}
          ${g.tab === 'len' ? (girl ? `${status}<section class="card glow chart">${chart()}
              <div class="legend" style="grid-template-columns:1fr 1fr"><span><i class="lg" style="background:rgba(52,214,166,.35);border-radius:4px;width:22px;height:12px"></i>Rentang −2 SD s/d +2 SD</span><span><svg width="22" height="8" aria-hidden="true"><line x1="0" x2="22" y1="4" y2="4" stroke="#2A1830" stroke-opacity=".5" stroke-dasharray="4 3" stroke-width="1.5"/></svg>Median</span></div>
              ${src('Permenkes 2/2020 (WHO 2006)')}</section>
            <details class="more card tight"><summary>${ic('chev', 18)}Lihat rincian data standar</summary><div style="overflow-x:auto"><table class="tbl"><thead><tr><th scope="col">Bulan</th><th scope="col" class="num">−2 SD</th><th scope="col" class="num">Median</th><th scope="col" class="num">+2 SD</th></tr></thead><tbody>${SD.md.map((v, m) => `<tr><td class="num">${m}</td><td class="num">${cm(SD.lo[m].toFixed(1))}</td><td class="num">${cm(v.toFixed(1))}</td><td class="num">${cm(SD.hi[m].toFixed(1))}</td></tr>`).join('')}</tbody></table></div><p class="t-sec">Panjang badan perempuan (cm), 0–6 bulan.</p></details>
            <section class="card tight"><h2 class="t-h3">Riwayat pengukuran</h2><ul class="rows" style="list-style:none;margin:0;padding:0">${[...g.data].reverse().map((p) => `<li class="row static"><span class="grow num">${p.m} bulan</span><b class="num">${cm(p.v)} cm</b></li>`).join('')}</ul></section>`
            : '<section class="card"><p class="t-body">[Tabel standar panjang badan laki-laki belum dimuat]</p></section>')
            : '<section class="card"><p class="t-body">[Standar berat badan menurut umur · data belum dimuat]</p><p class="t-sec">Catat berat tetap bisa, grafik menyusul.</p></section>'}
        </div>`,
        dock: btn('Tambah pengukuran', { icon: 'plus', 'data-sheet': 'growthAdd' })
      };
    }
  });
  P.acts.gTab = (el) => { P.S.growth.tab = el.dataset.v; P.rerender(); };
  let gaForm = null;
  P.sheets.growthAdd = () => {
    const d = P.S.growth.data, f = gaForm || { m: Math.min(6, d[d.length - 1].m + 1), v: '', err: '', warn: '' };
    gaForm = f;
    return {
      title: 'Tambah pengukuran',
      body: `<div class="field"><label for="ga-m">Usia saat diukur</label><select class="inp" id="ga-m" data-ch="gaM">${[0, 1, 2, 3, 4, 5, 6].map((m) => `<option value="${m}" ${f.m === m ? 'selected' : ''}>${m} bulan</option>`).join('')}</select></div>
        ${field({ id: 'ga-v', label: 'Panjang badan', value: f.v, ph: 'Mis. 62,5', suf: 'cm', mode: 'decimal', input: 'gaV', err: f.err, warn: f.warn })}
        <p class="t-sec">Ukur dengan bayi berbaring lurus. Hasil dari posyandu atau dokter juga bisa dimasukkan.</p>
        ${btn(f.warn ? 'Tetap simpan' : 'Simpan', { 'data-act': 'gaSave' })}${f.warn ? btn('Ubah angka', { kind: 'text', cls: 'center ink', 'data-act': 'gaEdit' }) : ''}`
    };
  };
  P.acts.gaM = (el) => { gaForm.m = +el.value; gaForm.warn = ''; };
  P.ins.gaV = (el) => { gaForm.v = el.value; if (gaForm.warn || gaForm.err) { gaForm.warn = ''; gaForm.err = ''; } };
  P.acts.gaEdit = () => { gaForm.warn = ''; P.rerender(); const i = P.el().querySelector('#ga-v'); i && i.focus(); };
  P.acts.gaSave = () => {
    const f = gaForm, raw = String(f.v).trim().replace(',', '.');
    if (!raw) { f.err = 'Isi panjang badan dulu ya.'; f.warn = ''; P.rerender(); return; }
    const v = Number(raw);
    if (!isFinite(v) || !/^\d+(\.\d+)?$/.test(raw)) { f.err = 'Gunakan angka, misalnya 62,5.'; f.warn = ''; P.rerender(); return; }
    if (!f.warn && (v < 40 || v > 80 || Math.abs(v - SD.md[f.m]) > 9)) { f.err = ''; f.warn = 'Angkanya tidak biasa, cek lagi ya.'; P.rerender(); return; }
    const d = P.S.growth.data, i = d.findIndex((p) => p.m === f.m);
    if (i >= 0) d[i] = { m: f.m, v }; else d.push({ m: f.m, v });
    d.sort((a, b) => a.m - b.m); gaForm = null; P.closeSheet(true); P.rerender(); P.toast(`Tersimpan · ${cm(v)} cm di ${f.m} bulan`);
  };
  const _close = P.closeSheet; P.closeSheet = (...a) => { gaForm = null; return _close(...a); };

  /* ======================================================================
     E29 · MPASI
     ====================================================================== */
  const FOODS = [['bubur', 'Bubur beras'], ['labu', 'Labu kuning'], ['ayam', 'Ayam'], ['telur', 'Telur'], ['ikan', 'Ikan'], ['hati', 'Hati ayam'], ['alpukat', 'Alpukat'], ['tempe', 'Tempe']];
  P.def({
    id: 'mpasi', sec: 'E', n: 29, name: 'MPASI', tone: 'baby',
    notes: 'Age stages as a segmented control. Texture, portion and frequency are placeholders pending a cited source. The first-foods checklist is a log, not a recommendation list. Allergen copy needs clinical review.',
    render: () => {
      const m = P.S.mpasi, age = P.babyAge(), done = FOODS.filter(([k]) => m.foods[k]).length;
      return {
        main: hdr({ title: 'MPASI' }) + `<div class="body rise">
          ${age.m < 6 ? `<div class="card tight tinted"><p class="t-body"><b class="num">${P.babyName()} ${age.m} bulan.</b> MPASI dimulai setelah ASI eksklusif 6 bulan.</p>${src('PP 33/2012')}</div>` : ''}
          ${seg('Tahap usia', [['6', '6–8 bulan'], ['9', '9–11 bulan'], ['12', '12–23 bulan']], m.stage, 'mpStage')}
          <dl class="card facts"><div class="wide"><dt>Tekstur</dt><dd>[Tekstur sesuai usia · sumber]</dd></div><div><dt>Porsi</dt><dd>[porsi]</dd></div><div><dt>Frekuensi</dt><dd>[frekuensi · sumber]</dd></div></dl>
          <section class="card"><div class="card-row"><h2 class="t-h3 grow">Makanan pertama yang dicoba</h2><span class="t-sec num" style="font-weight:700">${done}/${FOODS.length}</span></div>
            <div class="bar" role="progressbar" aria-label="Makanan yang sudah dicoba" aria-valuemin="0" aria-valuemax="${FOODS.length}" aria-valuenow="${done}"><i style="width:${(done / FOODS.length) * 100}%"></i></div>
            <div>${FOODS.map(([k, t]) => P.check('mp-' + k, t, m.foods[k], 'mpFood', '', k)).join('')}</div></section>
          <section class="card tight"><div class="card-row"><span class="bubble-ic">${ic('info')}</span><h2 class="t-h3 grow">Catatan alergi</h2></div>
            <p class="t-body">Kenalkan makanan baru satu per satu. Ada reaksi? Hubungi bidan atau dokter anak.</p>${src('[referensi klinis]')}</section>
          <div class="tiles">
            <button type="button" class="card tile" data-go="nutriscan"><span class="bubble-ic">${ic('scan')}</span>NutriScan</button>
            <button type="button" class="card tile" data-go="meals" data-arg="mpasi"><span class="bubble-ic">${ic('utensils')}</span>Menu MPASI siap antar</button></div>
        </div>`,
        dock: btn('Tanya bidan soal MPASI', { icon: 'chat', 'data-go': 'bidan', 'data-arg': 'Pertanyaan MPASI' })
      };
    }
  });
  P.acts.mpStage = (el) => { P.S.mpasi.stage = el.dataset.v; P.rerender(); };
  P.acts.mpFood = (el) => { P.S.mpasi.foods[el.dataset.v] = el.checked; P.rerender(); };

  /* ======================================================================
     E30 · Imunisasi
     ====================================================================== */
  P.def({
    id: 'imun', sec: 'E', n: 30, name: 'Imunisasi', tone: 'baby',
    notes: 'Schedule is entirely placeholder until sourced. Three states with distinct icons and outlines (done = filled check, next = glowing clock, upcoming = plain number) plus text. Marking done is instant with undo.',
    render: () => {
      const d = P.S.imun.done, ni = nextImun();
      return {
        main: hdr({ title: 'Imunisasi' }) + `<div class="body rise">
          <div class="card tight solid"><p class="t-sec" style="display:flex;gap:6px;color:var(--ink)">${ic('info', 18)}<span>Jadwal dari [sumber, tanggal] — konfirmasi ke dokter/bidan.</span></p></div>
          <section class="card"><ol class="steps">${d.map((x, i) => {
            const st = x ? 'done' : i === ni ? 'now' : '';
            return `<li><span class="st-ic ${st}">${x ? ic('check', 16) : i === ni ? ic('clock', 16) : `<span class="num" style="font-size:13px;font-weight:600">${i + 1}</span>`}</span>
              <div style="flex:1;min-height:44px"><b>[Nama vaksin]</b><p class="t-sec">[Usia …] · ${x ? 'Selesai' : i === ni ? 'Berikutnya' : 'Akan datang'}</p>
              ${i === ni ? btn('Tandai selesai', { kind: 'glass', cls: 'btn-sm', icon: 'check', 'data-act': 'imunDone', 'data-v': i, style: 'margin-top:8px' }) : ''}</div></li>`;
          }).join('')}</ol></section>
        </div>`,
        dock: btn('Atur pengingat', { icon: 'bell', 'data-act': 'imunRemind' })
      };
    }
  });
  P.acts.imunDone = (el) => { const i = +el.dataset.v; P.S.imun.done[i] = true; P.rerender(); P.toast('Ditandai selesai', { undo: () => { P.S.imun.done[i] = false; } }); };
  P.acts.imunRemind = () => P.toast('Pengingat imunisasi aktif', { icon: 'bell' });

  /* ======================================================================
     F31 · Akun
     ====================================================================== */
  const STAGE_NAME = { plan: 'Merencanakan kehamilan', preg: 'Sedang hamil', baby: 'Sudah punya bayi', none: 'Belum dipilih' };
  P.def({
    id: 'account', sec: 'F', n: 31, name: 'Akun', tone: 'neutral',
    notes: 'Neutral ink/plum. Emergency is listed as always free. Night display can be automatic (21.00–06.00), always or off. Loss support exists for both stages: “Kehamilan saya berakhir” and “Kehilangan si kecil”, plain text with a calm icon, never red. Log-out asks once.',
    states: [{ label: 'Sheet ganti tahap', sheet: 'stageSwitch' }],
    render: () => {
      const s = P.S;
      const row = (go, i, t, sub, extra = '') => `<button type="button" class="row" ${go}><span class="bubble-ic">${ic(i)}</span><span class="grow"><span class="t">${t}</span>${sub ? `<br><span class="t-sec">${sub}</span>` : ''}</span>${extra}${ic('chev')}</button>`;
      return {
        main: hdr({ title: 'Akun' }) + `<div class="body rise">
          <section class="card"><div class="card-row"><span class="ph-img" style="width:60px;height:60px;border-radius:50%;padding:0;font-size:11px" aria-hidden="true">[Foto]</span><div class="grow"><h2 class="t-h3">${s.name ? esc(s.name) : '[Nama]'}</h2><p class="t-sec num">+62 [nomor HP]</p></div>${P.covered()}</div>
            <button type="button" class="row" data-sheet="stageSwitch"><span class="grow"><span class="t-sec">Tahap</span><br><span class="t">${STAGE_NAME[s.stage]}</span></span><span class="t-sec" style="font-weight:700">Ganti</span>${ic('chev')}</button></section>
          <section class="card tight"><div class="rows">
            ${row('data-go="partnerSetup"', 'users', 'Pasangan', 'Kamu atur apa yang dia lihat')}
            ${row('data-go="consent" data-arg="account"', 'lock', 'Privasi & persetujuan', 'Kami tidak menjual datamu')}
            ${row('data-go="premium"', 'star', 'Langganan', s.covered ? 'Ditanggung [Nama kantor]' : 'Gratis')}
            ${row('data-go="code"', 'building', 'Kode kantor/asuransi', s.covered ? 'Aktif' : 'Belum ada')}
          </div></section>
          <section class="card tight"><div class="rows">
            ${row('data-go="emergency"', 'phone', 'Bantuan darurat', 'Selalu gratis')}
            ${row('data-sheet="nightSheet"', 'moon', 'Tampilan malam', { auto: 'Otomatis 21.00–06.00', on: 'Selalu', off: 'Mati' }[s.night])}
            ${s.stage === 'preg' || (s.lossActive && s.lossKind === 'preg') ? row('data-go="loss" data-arg="preg"', 'heart', 'Kehamilan saya berakhir', 'Hentikan semua hal tentang kehamilan') : ''}
            ${s.stage === 'baby' || (s.lossActive && s.lossKind === 'baby') ? row('data-go="loss" data-arg="baby"', 'heart', 'Kehilangan si kecil', 'Hentikan pengingat tentang si kecil') : ''}
            <button type="button" class="row" data-sheet="logout"><span class="bubble-ic">${ic('logout')}</span><span class="grow t">Keluar</span></button>
          </div></section>
          <p class="t-sec" style="text-align:center">Peluky · versi prototipe</p>
        </div>`,
        dock: btn(s.stage === 'none' ? 'Pilih tahap saat kamu siap' : 'Kembali ke beranda', s.stage === 'none' ? { kind: 'glass', 'data-sheet': 'stageSwitch' } : { 'data-act': 'openHomeKeep' })
      };
    }
  });
  P.sheets.nightSheet = () => ({
    title: 'Tampilan malam',
    body: `<p class="t-body">Layar lebih redup untuk menyusui atau mengecek di malam hari.</p>
      <div class="stack" role="radiogroup" aria-label="Tampilan malam">${[['auto', 'Otomatis', '21.00–06.00'], ['on', 'Selalu', 'Tampilan gelap sepanjang hari'], ['off', 'Mati', 'Tampilan terang']].map(([v, t, d]) => `<button type="button" role="radio" aria-checked="${P.S.night === v}" class="card tight choice" style="min-height:64px;--c-deep:var(--deep);--c-glow:var(--glow)" data-act="nightSet" data-v="${v}"><span style="flex:1"><span class="t-h3" style="display:block">${t}</span><span class="t-sec">${d}</span></span><span class="mark">${ic('check', 16)}</span></button>`).join('')}</div>`
  });
  P.acts.nightSet = (el) => { P.S.night = el.dataset.v; P.rerender(); };
  let stageDraft = null;
  P.sheets.stageSwitch = () => {
    const cur = stageDraft || P.S.stage;
    return {
      title: 'Ganti tahap',
      body: `<div class="stack" role="radiogroup" aria-label="Tahap">${P.STAGES.map(([k, t, d, i, dt, tint, deep, glow]) => `<button type="button" role="radio" aria-checked="${cur === k}" class="card tight choice" style="min-height:72px;--c-deep:${deep};--c-glow:${glow}" data-act="stageDraft" data-v="${k}"><span class="bubble-ic" style="background:${tint};color:${dt}">${ic(i)}</span><span style="flex:1"><span class="t-h3" style="display:block">${t}</span><span class="t-sec">${d}</span></span><span class="mark">${ic('check', 16)}</span></button>`).join('')}</div>
        ${btn('Simpan tahap', { 'data-act': 'stageSave' })}`
    };
  };
  P.acts.stageDraft = (el) => { stageDraft = el.dataset.v; P.rerender(); };
  P.acts.stageSave = () => {
    const k = stageDraft || P.S.stage; stageDraft = null; const changed = k !== P.S.stage;
    P.closeSheet(true, true);
    if (!changed) { P.rerender(); return; }
    P.S.stage = k; P.S.lossActive = false; P.S.loss.stopped = false;
    P.go({ plan: 'setupCycle', preg: 'setupPreg', baby: 'setupBaby' }[k]);
  };
  P.sheets.logout = () => ({ title: 'Keluar dari Peluky?', body: `<p class="t-body">Catatanmu tetap tersimpan di akunmu.</p>${btn('Ya, keluar', { 'data-act': 'logout' })}${btn('Batal', { kind: 'glass', 'data-close': true })}` });
  P.acts.logout = () => { P.closeSheet(true, true); P.resetHistory(); P.go('welcome', { replace: true }); };

  /* ======================================================================
     F32 · Atur pasangan
     ====================================================================== */
  P.def({
    id: 'partnerSetup', sec: 'F', n: 32, name: 'Atur pasangan', tone: 'neutral',
    notes: 'One consent model per audience: the “Berbagi ke pasangan” switch (the same one as in Privasi) is the permission, and each item below starts off. While the permission is off, the items are disabled and the partner sees nothing. Copy uses the clipboard API with a fallback toast.',
    render: () => {
      const p = P.S.partner;
      return {
        main: hdr({ title: 'Atur pasangan' }) + `<div class="body rise">
          <section class="card glow" style="align-items:center;text-align:center"><p class="t-sec">Kode undangan</p><p class="num" style="font-size:34px;font-weight:600;letter-spacing:.06em;margin:0" id="inv-code">[KODE-6]</p>
            <div class="btn-row" style="width:100%">${btn('Salin', { kind: 'glass', cls: 'btn-sm', icon: 'copy', 'data-act': 'copyCode' })}${btn('Bagikan', { kind: 'glass', cls: 'btn-sm', icon: 'share', 'data-act': 'shareCode' })}</div>
            <p class="t-sec">Pasangan memasukkan kode ini di aplikasinya.</p></section>
          <section class="card"><div class="rows">${sw('pt-master', 'Berbagi ke pasangan', 'Izin dasar, sama dengan di Privasi. Mati = pasangan tidak melihat apa pun.', P.S.consent.partner, 'consent', 'partner')}</div></section>
          <section class="card"><h2 class="t-h3">Yang bisa dilihat pasangan</h2><p class="t-sec" style="margin-top:-6px">${P.S.consent.partner ? 'Semua mati sampai kamu nyalakan.' : 'Nyalakan “Berbagi ke pasangan” dulu.'}</p>
            <div class="rows">
              ${[['fertile', 'Masa subur', 'Perkiraan dari kalendermu'], ['week', 'Minggu kehamilan', 'Minggu dan HPL'], ['checkup', 'Jadwal kontrol', 'Tanggal dan tempat'], ['tasks', 'Tugas persiapan', 'Tugas yang kamu berikan'], ['alert', 'Kabar darurat', 'Kabar saat kamu menekan Darurat']].map(([k, t, d]) => sw('pt-' + k, t, d, p[k] && P.S.consent.partner, 'partnerSw', k, !P.S.consent.partner)).join('')}
            </div></section>
        </div>`,
        dock: btn('Lihat sebagai pasangan', { icon: 'eye', 'data-go': 'partnerView' })
      };
    }
  });
  P.acts.partnerSw = (el) => { const k = el.dataset.v; P.S.partner[k] = !P.S.partner[k]; P.rerender(); };
  P.acts.copyCode = () => { try { navigator.clipboard.writeText('[KODE-6]').then(() => P.toast('Kode disalin', { icon: 'copy' }), () => P.toast('Pilih kodenya untuk menyalin', { icon: 'copy' })); } catch (_) { P.toast('Pilih kodenya untuk menyalin', { icon: 'copy' }); } };
  P.acts.shareCode = () => P.toast('Prototipe: membuka menu bagikan', { icon: 'share' });

  /* ======================================================================
     F33 · Tampilan pasangan
     ====================================================================== */
  P.def({
    id: 'partnerView', sec: 'F', n: 33, name: 'Tampilan pasangan', tone: 'neutral',
    notes: 'What the partner sees. Empty by default. The example toggle shows the shape of a shared view (week, next check-up, tasks), clearly marked “Contoh”. Real items appear only for switches she turned on.',
    states: [{ label: 'Contoh tampilan', state: (S) => { S.partnerExample = true; } }],
    render: () => {
      const on = P.S.consent.partner, p = P.S.partner, ex = P.S.partnerExample, any = on && Object.values(p).some(Boolean);
      const show = (k) => ex || (on && p[k]);
      const nm = P.S.name ? esc(P.S.name) : '[Nama]';
      const items = `
        ${show('week') ? `<section class="card glow"><div class="card-row"><div class="ring-wrap" style="width:72px;height:72px">${P.ring(14, 72, 6, false)}<div class="ring-c"><b class="num">14</b></div></div><div class="grow"><p class="t-sec">Minggu kehamilan</p><p class="t-h3 num">Minggu ke-14 · HPL ${P.fmt(P.addDays(P.TODAY, 182))}</p></div></div></section>` : ''}
        ${show('checkup') ? `<section class="card tight"><div class="card-row"><span class="bubble-ic">${ic('calendar')}</span><div class="grow"><p class="t-sec">Kontrol berikutnya</p><p class="t-h3 num">Kam, 5 Nov · 09.00</p><p class="t-sec">[RS A]</p></div></div></section>` : ''}
        ${show('tasks') ? `<section class="card tight"><h2 class="t-h3">Tugasmu</h2>${P.check('pv-t1', 'Perlengkapan mandi', false, 'noop')}${P.check('pv-t2', 'Cek rute ke [RS A]', false, 'noop')}</section>` : ''}
        ${show('fertile') ? `<section class="card tight"><div class="card-row"><span class="bubble-ic">${ic('calendar')}</span><div class="grow"><p class="t-sec">Masa subur (perkiraan)</p><p class="t-h3 num">29 Okt – 3 Nov</p></div></div></section>` : ''}
        ${show('alert') ? `<section class="card tight"><div class="card-row"><span class="bubble-ic">${ic('bell')}</span><p class="grow t-body">Kamu akan dikabari bila ${nm} menekan Darurat.</p></div></section>` : ''}`;
      return {
        main: `<header class="hdr"><button class="ib" data-back aria-label="Kembali">${ic('back')}</button><h1 tabindex="-1" data-focus>Tampilan pasangan</h1><span class="badge ink">${ic('eye', 14)}Pratinjau</span></header><div class="body rise">
          ${ex ? `<p class="sysline">Contoh · bukan data sebenarnya</p>` : ''}
          ${any || ex ? items : `<section class="card empty"><span class="bubble-ic">${ic('users', 30)}</span><h2 class="t-h3">${nm} belum membagikan apa pun</h2><p class="t-sec">Saat ${nm} menyalakan sesuatu, kamu akan melihatnya di sini.</p></section>`}
        </div>`,
        dock: btn(ex ? 'Sembunyikan contoh' : 'Lihat contoh tampilan', { kind: 'glass', icon: 'eye', 'data-act': 'pvExample' })
      };
    }
  });
  P.acts.leaveOpt = () => { P.S.leaveOptIn = !P.S.leaveOptIn; P.rerender(); };
  P.acts.pvExample = () => { P.S.partnerExample = !P.S.partnerExample; P.rerender(); };
  P.acts.noop = () => {};

  /* ======================================================================
     F34 · Gratis vs Premium
     ====================================================================== */
  const FREE = ['Bantuan darurat', 'Kalender & prediksi', 'Panduan mingguan', 'Kontrol kehamilan', 'Kisaran biaya', 'Daftar & booking RS', 'Cek pemulihan', 'Menyusui', 'MPASI', 'Tumbuh kembang', 'Dukungan kehilangan', 'Chat bidan untuk keluhan kesehatan', 'Balasan bidan diurutkan menurut urgensi, bukan paket'];
  const PREM = ['Tanya tanpa batas', 'NutriScan tanpa batas', 'Bidan yang sama di tiap chat', 'Pengingat tabungan otomatis & anggaran bersama', 'Simpan & ekspor riwayat chat dan catatan'];
  P.def({
    id: 'premium', sec: 'F', n: 34, name: 'Gratis vs Premium', tone: 'neutral',
    notes: 'The free list comes first and is longer on purpose. Premium is convenience only: no paid priority for midwife replies or consultations, because the midwife queue is ordered by urgency. Every safety feature is in the free list. When covered, the price is replaced by the coverage badge.',
    render: () => ({
      main: hdr({ title: 'Langganan' }) + `<div class="body rise">
        ${P.S.covered ? `<div class="card tight tinted" style="--tint:rgba(52,214,166,.18)"><span class="badge cover">${ic('shieldc', 14)}Ditanggung [Nama kantor]</span><p class="t-sec">Semua fitur Premium sudah termasuk.</p></div>` : ''}
        <section class="card"><div class="card-row"><span class="bubble-ic">${ic('shieldc')}</span><h2 class="t-h3 grow">Selalu gratis</h2></div>
          <ul class="rows" style="list-style:none;margin:0;padding:0">${FREE.map((t) => `<li class="row static" style="min-height:44px">${ic('check', 18)}<span class="grow">${t}</span></li>`).join('')}</ul></section>
        <section class="card glow"><div class="card-row"><span class="bubble-ic">${ic('star')}</span><h2 class="t-h3 grow">Premium</h2>${P.S.covered ? '' : '<b class="num">[Rp …/bulan]</b>'}</div>
          <ul class="rows" style="list-style:none;margin:0;padding:0">${PREM.map((t) => `<li class="row static" style="min-height:44px">${ic('star', 18)}<span class="grow">${t}</span></li>`).join('')}</ul></section>
        <p class="t-sec" style="text-align:center">Fitur keselamatan tidak pernah berbayar.</p>
      </div>`,
      dock: P.S.covered ? btn('Sudah ditanggung', { kind: 'glass', disabled: true }) : `${btn('Coba Premium', { 'data-act': 'tryPremium' })}<p class="t-sec num">[Rp …/bulan] · batalkan kapan saja</p>`
    })
  });
  P.acts.tryPremium = () => P.toast('Prototipe: membuka pembayaran', { icon: 'card' });

  /* ======================================================================
     F35 · Kode kantor/asuransi
     ====================================================================== */
  P.def({
    id: 'code', sec: 'F', n: 35, name: 'Kode kantor/asuransi', tone: 'neutral',
    notes: 'Errors are deep coral with an icon and a fix (“Cek lagi atau tanya HR”). Success states the coverage window and links straight to what the employer can see.',
    states: [{ label: 'Kode salah', state: (S) => { S.code = { val: 'SALAH1', err: 'Kode tidak ditemukan. Cek lagi atau tanya HR-mu.', ok: false }; } }, { label: 'Berhasil', state: (S) => { S.code.ok = true; S.covered = true; } }],
    render: () => {
      const c = P.S.code;
      if (c.ok) {
        return {
          main: hdr({ title: 'Kode kantor/asuransi' }) + `<div class="body rise">
            <section class="card glow" style="align-items:center;text-align:center;padding:26px 18px"><span class="bubble-ic" style="width:64px;height:64px;border-radius:24px;background:rgba(52,214,166,.22);color:var(--green-dd)">${ic('shieldc', 32)}</span>
              <h2 class="t-h2">Ditanggung [Nama kantor]</h2><p class="t-body">Dari rencana hamil sampai si kecil 2 tahun.</p></section>
            <section class="card"><h2 class="t-h3">Yang ditanggung</h2><ul class="rows" style="list-style:none;margin:0;padding:0">${['Tanya Peluky tanpa batas', 'NutriScan tanpa batas', 'Bidan yang sama di tiap chat', 'Konsultasi dokter · [kuota]', 'Pengingat tabungan & anggaran bersama'].map((t) => `<li class="row static" style="min-height:44px">${ic('check', 18)}<span class="grow">${t}</span></li>`).join('')}</ul></section>
            <p class="t-sec" style="text-align:center">Kantormu tidak pernah melihat data kesehatanmu.</p></div>`,
          dock: btn('Lihat yang dilihat kantormu', { icon: 'eye', 'data-go': 'employerView' })
        };
      }
      return {
        main: hdr({ title: 'Kode kantor/asuransi' }) + `<div class="body rise">
          <h2 class="t-hero">Punya kode dari kantor?</h2><p class="t-body" style="color:var(--muted)">Kantor atau asuransimu bisa menanggung fitur Premium.</p>
          <form class="card" data-submit="codeSubmit" id="code-form">${field({ id: 'code-in', label: 'Kode kantor/asuransi', value: c.val, ph: 'Mis. PLK-1234', input: 'codeIn', err: c.err, extra: 'autocapitalize="characters" autocomplete="off"' })}</form>
          <p class="t-sec proto-hint">Prototipe: kode apa pun berhasil, kecuali “SALAH1”.</p></div>`,
        dock: btn('Gunakan kode', { 'data-act': 'codeSubmit' })
      };
    }
  });
  P.ins.codeIn = (el) => { P.S.code.val = el.value; };
  P.acts.codeSubmit = () => {
    const c = P.S.code, v = c.val.trim().toUpperCase();
    if (!v) c.err = 'Masukkan kode dulu ya.';
    else if (v === 'SALAH1' || v.length < 4) c.err = 'Kode tidak ditemukan. Cek lagi atau tanya HR-mu.';
    else { c.err = ''; c.ok = true; P.S.covered = true; P.toast('Kode aktif · Ditanggung [Nama kantor]', { icon: 'shieldc' }); }
    P.rerender(); P.el().querySelector('.scroll').scrollTop = 0;
  };

  /* ======================================================================
     F36 · Yang dilihat kantormu
     ====================================================================== */
  P.def({
    id: 'employerView', sec: 'F', n: 36, name: 'Yang dilihat kantormu', tone: 'neutral',
    notes: 'Shows the mother the exact shape of the employer dashboard: totals only, with the four rules stated plainly. Leave forecasting is derived from due dates, so it is a separate opt-in that starts off.',
    render: () => ({
      main: hdr({ title: 'Yang dilihat kantormu' }) + `<div class="body rise">
        <p class="t-body">Contoh tampilan untuk HR. Hanya angka total.</p>
        <div class="tiles">${[['Anggota aktif', 'users'], ['Konsultasi terpakai', 'video'], ['Chat bidan', 'chat'], ['Fitur paling dipakai', 'chart']].map(([t, i]) => `<div class="card tile" style="min-height:112px"><span class="bubble-ic" style="width:36px;height:36px;flex-basis:36px">${ic(i, 20)}</span><span><span class="num" style="font-size:24px;font-weight:600;display:block">[angka]</span><span class="t-sec">${t}</span></span></div>`).join('')}</div>
        <section class="card"><h2 class="t-h3">Aturan yang kami pegang</h2>
          <ul class="rows" style="list-style:none;margin:0;padding:0">${[['user', 'Tanpa nama atau identitas'], ['users', 'Hanya untuk kelompok 10 orang atau lebih'], ['grid', 'Tanpa rincian tahap untuk kelompok kecil'], ['lock', 'Data kesehatan tidak pernah dibagikan']].map(([i, t]) => `<li class="row static">${ic(i, 20)}<span class="grow" style="font-weight:600">${t}</span></li>`).join('')}</ul></section>
        <section class="card"><h2 class="t-h3">Perkiraan cuti (pilihanmu)</h2><p class="t-sec">Perkiraan cuti dihitung dari HPL. Kantor hanya melihat jumlah total, dan hanya dari yang mengizinkan.</p>
          <div class="rows">${sw('leave-opt', 'Ikut hitungan perkiraan cuti', 'Anonim. Kuartal dengan kurang dari 10 orang disembunyikan.', P.S.leaveOptIn, 'leaveOpt')}</div></section>
      </div>`,
      dock: btn('Mengerti', { 'data-back': true })
    })
  });

  /* ======================================================================
     G37 · Portal rumah sakit (desktop)
     ====================================================================== */
  const REQ = [
    { id: 1, t: 'Hari ini · 08.12', type: 'Paket persalinan', when: 'Jum, 30 Okt · 09.00', name: true, phone: true, week: 'Minggu 32', hpl: null, st: 0 },
    { id: 2, t: 'Hari ini · 07.40', type: 'Konsultasi', when: 'Sab, 31 Okt · 11.00', name: true, phone: true, week: null, hpl: null, st: 0 },
    { id: 3, t: 'Kemarin · 19.05', type: 'Tur RS', when: 'Sen, 2 Nov · 14.00', name: true, phone: false, week: null, hpl: null, st: 0 },
    { id: 4, t: 'Kemarin · 10.22', type: 'Paket persalinan', when: 'Sel, 3 Nov · 09.00', name: true, phone: true, week: 'Minggu 36', hpl: '[tanggal]', st: 1 }
  ];
  let reqSel = 1, propose = false;
  const ns = () => `<span class="nshare">${ic('lock', 14)}Tidak dibagikan</span>`;
  const steps = (st) => `<span class="mini-steps">${['Terkirim', 'Dikonfirmasi', 'Pengingat H-1'].map((t, i) => `<span class="${i <= st ? 'done' : i === st + 1 ? 'on' : ''}">${i <= st ? ic('check', 12) : i === st + 1 ? ic('clock', 12) : ''}${t}</span>`).join('')}</span>`;
  const deskNav = (items, brand) => `<nav class="d-nav" aria-label="Navigasi portal"><div class="brandrow" style="display:flex;flex-direction:column;gap:4px;padding:4px 8px 18px">${P.logo(30, true, 22)}<span class="t-sec" style="font-weight:600">${brand}</span></div>
    ${items.map(([i, t], k) => `<a href="#" ${k === 0 ? 'aria-current="page"' : ''} data-dact="noop">${ic(i, 20)}${t}</a>`).join('')}</nav>`;
  P.def({
    id: 'portalRS', sec: 'G', n: 37, name: 'Portal rumah sakit', tone: 'neutral', desktop: true,
    notes: 'Hospital inbox, desktop 1280 (responsive via container queries). Columns show only fields the mother ticked; anything else reads “Tidak dibagikan” with a lock. Flat monthly fee, never per patient. States that partner status never affects ranking in the app.',
    renderDesk: () => {
      const r = REQ.find((x) => x.id === reqSel) || REQ[0], fresh = REQ.filter((x) => x.st === 0).length;
      return `<div class="desk">${P.orbs('neutral')}<div class="d-shell">
        ${deskNav([['inbox', 'Kotak masuk'], ['calendar', 'Jadwal'], ['bag', 'Paket & harga'], ['gear', 'Pengaturan']], 'Portal Mitra · [RS Ibu & Anak B]')}
        <main class="d-main">
          <div class="d-top"><h1>Kotak masuk permintaan</h1><span class="badge mitra">${ic('heart', 14)}Mitra Peluky</span></div>
          <div class="card tight solid" style="flex-direction:row;align-items:center;gap:10px">${ic('info', 20)}<p class="t-body" style="font-weight:600">Status Mitra tidak memengaruhi urutan di aplikasi ibu.</p></div>
          <div class="d-grid">
            <div class="card kpi"><span class="t-sec">Permintaan baru</span><span class="v">${fresh}</span><span class="t-sec">contoh data</span></div>
            <div class="card kpi"><span class="t-sec">Rata-rata waktu respons</span><span class="v">[x jam]</span><span class="t-sec">30 hari terakhir</span></div>
            <div class="card kpi"><span class="t-sec">Dikonfirmasi bulan ini</span><span class="v">[angka]</span></div>
            <div class="card kpi"><span class="t-sec">Biaya langganan</span><span class="v" style="font-size:22px">[Rp …/bulan]</span><span class="t-sec">Tetap, bukan per pasien</span></div>
          </div>
          <div class="d-split stack">
            <section class="card" aria-labelledby="rq-t"><div class="card-row"><h2 class="t-h3 grow" id="rq-t">Permintaan</h2><span class="t-sec">Hanya data yang disetujui ibu</span></div>
              <div class="d-table-wrap"><table class="d-table"><thead><tr><th scope="col">Permintaan</th><th scope="col">Nama</th><th scope="col">Nomor HP</th><th scope="col">Minggu</th><th scope="col">HPL</th><th scope="col">Status</th></tr></thead>
                <tbody>${REQ.map((x) => `<tr class="${x.id === reqSel ? 'sel' : ''}" data-dact="sel" data-v="${x.id}" tabindex="0" aria-selected="${x.id === reqSel}"><td><b>${x.type}</b><br><span class="t-sec num">${x.t}</span></td><td>${x.name ? '[Nama pasien]' : ns()}</td><td class="num">${x.phone ? '[nomor HP]' : ns()}</td><td class="num">${x.week || ns()}</td><td class="num">${x.hpl || ns()}</td><td>${x.st ? `<span class="badge cover">${ic('check', 13)}Dikonfirmasi</span>` : `<span class="badge ink">${ic('clock', 13)}Menunggu</span>`}</td></tr>`).join('')}</tbody></table></div></section>
            <aside class="card d-detail" aria-labelledby="rd-t"><div><p class="t-sec">Permintaan terpilih</p><h2 class="t-h3" id="rd-t">${r.type}</h2><p class="t-sec num">${r.when}</p><div style="margin-top:8px">${steps(r.st)}</div></div>
              <dl class="kv"><dt>Nama</dt><dd>${r.name ? '[Nama pasien]' : ns()}</dd><dt>Nomor HP</dt><dd class="num">${r.phone ? '[nomor HP]' : ns()}</dd><dt>Minggu</dt><dd class="num">${r.week || ns()}</dd><dt>HPL</dt><dd>${r.hpl || ns()}</dd><dt>Catatan</dt><dd>[catatan pasien]</dd></dl>
              <div class="stack">${r.st === 0 ? (propose ? `<div class="field"><label for="pr-d">Usulan tanggal</label><input class="inp" id="pr-d" type="date" value="2026-11-04"></div><div class="field"><label for="pr-t">Jam</label><input class="inp" id="pr-t" type="time" value="10:00"></div><div class="btn-row">${btn('Kirim usulan', { 'data-dact': 'propose' })}${btn('Batal', { kind: 'glass', 'data-dact': 'proposeCancel' })}</div>`
                : `<div class="stack">${btn('Konfirmasi', { 'data-dact': 'confirm', style: 'width:100%' })}${btn('Usulkan jadwal lain', { kind: 'glass', 'data-dact': 'proposeOpen', style: 'width:100%' })}</div>`) : `<p class="t-body" style="display:flex;gap:6px">${ic('checkc', 20)}Dikonfirmasi. Ibu menerima pengingat H-1.</p>`}</div>
            </aside>
          </div>
          <section class="card"><h2 class="t-h3">Ringkasan bulan ini</h2>
            <dl class="kv" style="max-width:560px"><dt>Permintaan masuk</dt><dd class="num">[angka]</dd><dt>Dikonfirmasi</dt><dd class="num">[angka]</dd><dt>Rata-rata waktu respons</dt><dd class="num">[x jam]</dd><dt>Biaya langganan tetap — bukan per pasien</dt><dd class="num">[Rp …/bulan]</dd></dl></section>
        </main></div></div>`;
    }
  });
  P.dacts = P.dacts || {};
  P.dacts.sel = (el) => { reqSel = +el.dataset.v; propose = false; };
  P.dacts.confirm = () => { const r = REQ.find((x) => x.id === reqSel); r.st = 1; propose = false; return 'Dikonfirmasi · ibu diberi tahu'; };
  P.dacts.proposeOpen = () => { propose = true; };
  P.dacts.proposeCancel = () => { propose = false; };
  P.dacts.propose = () => { propose = false; return 'Usulan jadwal dikirim ke ibu'; };
  P.dacts.noop = () => {};

  /* ======================================================================
     G38 · Dashboard HR (desktop)
     ====================================================================== */
  P.def({
    id: 'portalHR', sec: 'G', n: 38, name: 'Dashboard HR', tone: 'neutral', desktop: true,
    notes: 'Aggregate tiles only. A banner states the 10-person rule; a suppressed row shows what that rule looks like in practice. Leave planning counts only employees who opted in, per quarter. No names, no per-person rows, no stage breakdown.',
    renderDesk: () => `<div class="desk">${P.orbs('neutral')}<div class="d-shell">
      ${deskNav([['grid', 'Ringkasan'], ['shield', 'Program'], ['hash', 'Kode karyawan'], ['info', 'Bantuan']], 'Dashboard HR · [Nama kantor]')}
      <main class="d-main">
        <div class="d-top"><h1>Ringkasan program</h1><span class="badge cover">${ic('shieldc', 14)}Program aktif</span></div>
        <div class="card tight solid" style="flex-direction:row;align-items:center;gap:10px">${ic('users', 20)}<p class="t-body" style="font-weight:700">Kelompok di bawah 10 orang tidak ditampilkan.</p></div>
        <div class="d-grid">${[['Karyawan terdaftar', 'users'], ['Aktif bulan ini', 'chart'], ['Konsultasi ditanggung terpakai', 'video'], ['Chat bidan', 'chat']].map(([t, i]) => `<div class="card kpi"><span class="card-row"><span class="bubble-ic" style="width:36px;height:36px;flex-basis:36px">${ic(i, 20)}</span><span class="t-sec grow">${t}</span></span><span class="v">[angka]</span></div>`).join('')}</div>
        <div class="d-split">
          <section class="card"><h2 class="t-h3">Perencanaan cuti melahirkan (agregat)</h2><p class="t-sec">Hanya dari karyawan yang mengizinkan. Kuartal dengan kurang dari 10 orang disembunyikan.</p>
            <div class="d-table-wrap"><table class="d-table" style="min-width:420px"><thead><tr><th scope="col">Kuartal</th><th scope="col">Perkiraan mulai cuti</th></tr></thead><tbody>
              <tr><td>Q1 2027</td><td class="num">[angka]</td></tr><tr><td>Q2 2027</td><td class="num">[angka]</td></tr><tr><td>Q3 2027</td><td><span class="nshare">${ic('lock', 14)}Tidak ditampilkan · kelompok kurang dari 10</span></td></tr></tbody></table></div>
            <p class="t-sec">Cuti minimal 3 bulan, bisa ditambah hingga 3 bulan dengan surat dokter. Sumber: UU KIA No. 4/2024.</p></section>
          <section class="card"><h2 class="t-h3">Yang tidak pernah Anda lihat</h2><ul class="rows" style="list-style:none;margin:0;padding:0">${[['user', 'Nama atau identitas karyawan'], ['list', 'Baris per orang'], ['grid', 'Rincian tahap untuk kelompok kecil'], ['lock', 'Data kesehatan apa pun']].map(([i, t]) => `<li class="row static">${ic(i, 20)}<span class="grow" style="font-weight:600">${t}</span></li>`).join('')}</ul></section>
        </div>
        <section class="card"><h2 class="t-h3">Program</h2><dl class="kv" style="max-width:560px"><dt>Cakupan</dt><dd>Dari rencana hamil sampai si kecil 2 tahun</dd><dt>Kode karyawan</dt><dd class="num">[KODE-KANTOR]</dd><dt>Biaya</dt><dd class="num">[Rp …]</dd></dl></section>
      </main></div></div>`
  });
})();
