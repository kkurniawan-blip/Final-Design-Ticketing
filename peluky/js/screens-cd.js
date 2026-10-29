/* Sections C (Pregnancy, berry) and D (Safety net). */
(function () {
  'use strict';
  const { ic, esc, btn, chip, sw, field, seg, src, sos, hdr } = P;

  /* ======================================================================
     Shared safety pieces: danger triage, danger panel, catat sheets
     ====================================================================== */
  P.DANGER = {
    hamil: ['Perdarahan / flek banyak', 'Nyeri perut hebat', 'Bengkak wajah/tangan mendadak', 'Gerakan janin berkurang', 'Sakit kepala hebat / pandangan kabur', 'Keluar air ketuban', 'Demam tinggi', 'Sesak napas', 'Kejang / pingsan'],
    nifas: ['Perdarahan banyak', 'Demam', 'Luka bernanah atau berbau', 'Nyeri perut hebat', 'Sakit kepala hebat / pandangan kabur', 'Sesak napas', 'Kejang / pingsan', 'Sedih berkepanjangan', 'Pikiran menyakiti diri'],
    bayi: ['Demam tinggi', 'Sulit bernapas', 'Tidak mau menyusu', 'Kejang', 'Lemas'],
    loss: ['Perdarahan banyak', 'Nyeri perut hebat', 'Demam', 'Cairan berbau dari jalan lahir', 'Pusing berat atau pingsan', 'Sedih berkepanjangan', 'Pikiran menyakiti diri'],
    plan: ['Nyeri perut hebat', 'Perdarahan sangat banyak', 'Demam tinggi', 'Pingsan']
  };
  const MENTAL = /sedih|menyakiti|bunuh diri|ingin mati|putus asa/i;

  /* Danger triage for free text (Tanya + Bidan). Placeholder rules pending a clinically
     reviewed classifier; tuned on colloquial Jakarta phrasing. Returns
     mental | danger | ask (ambiguous word: ask before alarming) | none. */
  const NOT_DANGER = /(tekanan darah|gula darah|golongan darah|darah tinggi|darah rendah|tambah darah|cek darah|tes darah|periksa darah|donor darah|kurang darah|hasil lab)/g;
  const MENTAL_RX = /(bunuh diri|akhiri hidup|mengakhiri hidup|ingin mati|mau mati|lebih baik mati|tidak ingin hidup|tidak mau hidup|ingin hilang|mau hilang|hilang( \w+)? dari dunia|menyakiti diri|melukai diri|sakiti diri|tidak kuat lagi|putus asa)/;
  const DANGER_RULES = [
    [/(perdarahan|pendarahan|keluar darah banyak|darah(nya)? banyak|flek banyak|darah( \w+)? tidak berhenti)/, 'Perdarahan banyak'],
    [/(kejang|\bstep\b)/, 'Kejang'],
    [/(pingsan|tidak sadar)/, 'Pingsan'],
    [/(sesak|tidak bisa (bernapas|napas)|sulit (bernapas|napas)|susah (bernapas|napas)|napas( \w+)? (berat|tersengal))/, 'Sulit bernapas'],
    [/(bibir|wajah|muka|kulit|badan)( \w+)? (biru|kebiruan)/, 'Bibir atau kulit kebiruan'],
    [/ketuban/, 'Keluar air ketuban'],
    [/((janin|bayi|dedek|adek|baby)( \w+){0,3} (tidak|jarang|kurang|berkurang|belum)( \w+){0,2} (gerak|bergerak|menendang|nendang)|(gerak\w*|tendangan)( \w+)? (berkurang|jarang))/, 'Gerakan janin berkurang'],
    [/(demam tinggi|panas tinggi|suhu (39|40|41))/, 'Demam tinggi'],
    [/((nyeri|sakit) (perut|kepala)( \w+)? (hebat|parah|sekali)|sakit kepala hebat)/, 'Nyeri hebat'],
    [/(pandangan (kabur|buram|gelap)|mata berkunang)/, 'Pandangan kabur'],
    [/((wajah|muka|tangan) bengkak|bengkak (mendadak|tiba tiba|di wajah|di muka|di tangan))/, 'Bengkak wajah/tangan mendadak'],
    [/((tidak|tak) mau (menyusu|nyusu|minum asi|netek)|menolak menyusu)/, 'Tidak mau menyusu'],
    [/(bayi( \w+)? lemas|lemas sekali|lunglai)/, 'Lemas'],
    [/((kencang|kontraksi|mules)( \w+){0,2} (terus|tiap|setiap|teratur))/, 'Kontraksi teratur']
  ];
  const ASK_RX = /(darah|flek|bengkak|lemas|demam|panas|pusing|kontraksi|kencang|nyeri|mimisan|muntah|kejang)/;
  P.normText = (t) => (' ' + String(t).toLowerCase().replace(/[^a-z0-9\s]/g, ' ') + ' ')
    .replace(/ (gak|ga|nggak|ngga|enggak|engga|gk|tdk|ndak) /g, ' tidak ').replace(/ (gak|ga|nggak|ngga|enggak|gk|tdk) /g, ' tidak ')
    .replace(/ (pengen|pingin|kepengen|pgn|pengin) /g, ' ingin ').replace(/nafas/g, 'napas').replace(/kenceng/g, 'kencang')
    .replace(/ (banget|bgt|aja|sih|deh|nih|dong|udah|sudah) /g, ' ').replace(/ (banget|bgt|aja|sih|deh|nih|dong) /g, ' ').replace(/\s+/g, ' ').trim();
  P.triage = (t) => {
    const n = P.normText(t).replace(NOT_DANGER, ' ');
    if (MENTAL_RX.test(n)) return { level: 'mental', sign: 'Pikiran menyakiti diri' };
    for (const [rx, sign] of DANGER_RULES) if (rx.test(n)) return { level: 'danger', sign };
    const m = n.match(ASK_RX); if (m) return { level: 'ask', word: m[1] };
    return { level: 'none' };
  };
  P.isDanger = (t) => ['danger', 'mental'].includes(P.triage(t).level);

  P.supportLine = () => `<div class="support-line"><span class="bubble-ic" style="background:#fff;border:1px solid var(--line);color:var(--ink)">${ic('heart')}</span><div class="grow"><b>[Layanan dukungan]</b><p class="t-sec">Bicara dengan konselor terlatih. [Jam layanan]</p></div>${btn('Hubungi', { kind: 'glass', cls: 'btn-sm', 'data-act': 'callSupport' })}</div>`;
  P.sheets.danger = (sign) => {
    const mental = MENTAL.test(sign || '');
    return {
      danger: true,
      body: `<div class="danger-top"><span class="bubble-ic red">${ic(mental ? 'heart' : 'alert', 28)}</span><h2 class="t-h2" id="sh-t" tabindex="-1">${mental ? 'Kamu tidak sendiri' : 'Segera cari bantuan'}</h2></div>
        <p class="t-body" id="sh-d">${mental ? 'Terima kasih sudah jujur. Kamu berhak dapat bantuan sekarang.' : `<b>${esc(sign)}</b> bisa jadi tanda bahaya. Jangan menunggu.`}</p>
        ${btn('Telepon <span class="num">119</span> (ambulans)', { kind: 'danger', icon: 'phone', cls: 'call-119', 'data-act': 'call119' })}
        ${mental ? btn('Bicara dengan konselor · [Layanan dukungan]', { kind: 'support', icon: 'heart', 'data-act': 'callSupport' }) : ''}
        ${btn('Telepon dokter saya', { kind: 'glass', icon: 'phone', 'data-act': 'callDoc' })}
        ${btn('IGD kebidanan terdekat', { kind: 'glass', icon: 'nav', 'data-act': 'directions' })}
        ${btn('Kabari pasangan', { kind: 'glass', icon: 'users', 'data-act': 'notifyPartner' })}
        <button type="button" class="btn btn-text ink" style="align-self:center" data-act="dangerBack">Salah pilih, kembali</button>`
    };
  };
  P.sheets.dangerPick = (list) => ({
    title: 'Tanda bahaya',
    body: `<p class="t-body">Ketuk yang sedang ${list === 'bayi' ? 'dialami si kecil' : 'kamu alami'}.</p>
      <div class="chips">${(P.DANGER[list] || P.DANGER.hamil).map((t) => chip(t, { cls: 'danger', icon: 'alert', 'data-sheet': 'danger', 'data-v': t })).join('')}</div>
      <p class="t-sec">Ragu? Lebih baik telepon 119 atau ke IGD.</p>${btn('Telepon <span class="num">119</span>', { kind: 'danger', icon: 'phone', 'data-act': 'call119' })}`
  });
  P.acts.call119 = () => P.call('119');
  P.acts.callDoc = () => P.call('[dr. Nama, Sp.OG]');
  P.acts.callSupport = () => P.call('[Layanan dukungan]');
  P.acts.notifyPartner = () => P.toast('Prototipe: membuka pesan ke pasangan', { icon: 'users' });

  const COMMON = ['Mual', 'Lelah', 'Sulit tidur', 'Nyeri punggung', 'Sembelit', 'Sering buang air kecil'];
  const MODERATE = ['Pusing', 'Muntah terus-menerus', 'Keputihan berubah', 'Kram perut ringan', 'Nyeri saat buang air kecil'];
  const B_COMMON = ['Rewel', 'Gumoh', 'Pilek ringan', 'Susah tidur'];
  const B_MOD = ['Batuk', 'Ruam kulit', 'Diare', 'Muntah'];
  let catatMod = null, catatLogged = [];
  P.sheets.catat = () => {
    const st = P.S.stage;
    if (st === 'plan') return P.sheets.dayLog(P.iso(P.TODAY));
    const baby = st === 'baby';
    const common = baby ? B_COMMON : COMMON, mod = baby ? B_MOD : MODERATE;
    return {
      title: baby ? 'Catat hari ini' : 'Apa yang kamu rasakan?',
      body: `${P.dangerRow(baby ? 'bayi' : 'hamil')}
        ${baby ? `<div class="tiles">
          <button type="button" class="card tile tight" data-go="menyusui">${ic('timer', 24)}Menyusui</button>
          <button type="button" class="card tile tight" data-act="growthAddFromCatat">${ic('ruler', 24)}Ukur panjang</button></div>` : ''}
        <div class="stack"><p class="lbl">${baby ? 'Kondisi si kecil' : 'Keluhan umum'}</p><div class="chips">${common.map((t) => chip(t, { pressed: catatLogged.includes(t), 'data-act': 'catatCommon', 'data-v': t })).join('')}</div></div>
        <div class="stack"><p class="lbl">Perlu ditanyakan</p><div class="chips">${mod.map((t) => chip(t, { pressed: catatMod === t, 'data-act': 'catatMod', 'data-v': t })).join('')}</div>
          ${catatMod ? `<div class="card tight tinted" aria-live="polite"><p class="t-h3">Ceritakan ke bidan, ya</p><p class="t-sec">${esc(catatMod)} perlu dinilai bidan.</p>
            <div class="btn-row">${btn('Chat bidan', { cls: 'btn-sm', icon: 'chat', 'data-act': 'catatToBidan' })}${btn('Simpan saja', { kind: 'glass', cls: 'btn-sm', 'data-act': 'catatSaveMod' })}</div></div>` : ''}</div>`
    };
  };
  P.acts.catatCommon = (el) => {
    const t = el.dataset.v; if (catatLogged.includes(t)) { catatLogged = catatLogged.filter((x) => x !== t); P.rerender(); return; }
    catatLogged.push(t); P.rerender();
    P.toast(`Tersimpan: ${esc(t)}`, { undo: () => { catatLogged = catatLogged.filter((x) => x !== t); } });
  };
  P.acts.catatMod = (el) => { catatMod = catatMod === el.dataset.v ? null : el.dataset.v; P.rerender(); };
  P.acts.catatToBidan = () => { const t = catatMod; catatMod = null; P.closeSheet(true, true); P.go('bidan', { arg: t }); };
  P.acts.catatSaveMod = () => { const t = catatMod; catatMod = null; P.closeSheet(true); P.toast(`Tersimpan: ${esc(t)}. Bidan tetap bisa dihubungi.`); };

  /* follow-up card used on both homes (returning users only) */
  P.followCard = (key) => {
    const f = P.S.followup[key]; if (!f || !P.S.returning) return '';
    return `<section class="card tinted" aria-labelledby="fu-t"><div><p class="t-h3" id="fu-t">${key === 'baby' ? 'Bagaimana si kecil hari ini?' : 'Bagaimana kabarmu hari ini?'}</p><p class="t-sec">Kemarin kamu mencatat ${esc(f)}.</p></div>
      <div class="fu-row">
        <button type="button" class="chip" data-act="fuBetter" data-v="${key}">${ic('smile', 20)}Membaik</button>
        <button type="button" class="chip" data-go="bidan">${ic('chat', 20)}Masih sama</button>
        <button type="button" class="chip" data-go="emergency">${ic('alert', 20)}Memburuk</button></div></section>`;
  };
  P.acts.fuBetter = (el) => { const k = el.dataset.v, old = P.S.followup[k]; P.S.followup[k] = null; P.rerender(); P.toast('Syukurlah. Catatannya kami simpan.', { undo: () => { P.S.followup[k] = old; } }); };

  /* ======================================================================
     C14 · Beranda kehamilan
     ====================================================================== */
  P.def({
    id: 'pregHome', sec: 'C', n: 14, name: 'Beranda kehamilan', tone: 'preg',
    notes: 'A labelled “Darurat” button sits in the header of every home, one tap from anywhere. Returning users see yesterday’s follow-up (Masih sama → Bidan, Memburuk → Emergency); new users never see invented history. The week ring is the one glowing hero. “Catat” opens with a single “Ada tanda bahaya?” row at the top (one tap to the danger list), then common chips (save with undo) and moderate chips (offer Chat bidan). Menu holds “Bayi sudah lahir?” and “Kehamilan saya berakhir”.',
    states: [{ label: 'Sheet catat', sheet: 'catat' }, { label: 'Panel bahaya', sheet: 'danger', sheetArg: 'Perdarahan / flek banyak' }, { label: 'Menu', sheet: 'pregMenu' }],
    render: () => {
      const s = P.S, r = P.pregCalc(s.preg.usg, s.preg.lmp) || { w: 14, d: 0, hpl: P.addDays(P.TODAY, 182) };
      const tri = r.w < 14 ? 1 : r.w < 28 ? 2 : 3, nv = s.visits.find((v) => v.state === 'next');
      return {
        main: P.homeHdr(`Hai${s.name ? ', ' + esc(s.name) : ''}!`, `<button class="ib" data-sheet="pregMenu" aria-label="Menu">${ic('more')}</button>`) + `<div class="body rise">
          ${P.followCard('preg')}
          <section class="card glow" aria-label="Minggu kehamilan" style="align-items:center;text-align:center;padding-top:22px">
            <div class="ring-wrap" style="width:212px;height:212px">${P.ring(r.w, 212, 12)}
              <div class="ring-c"><span class="t-sec" style="font-weight:600">Minggu ke-</span><span class="num" style="font-size:64px;font-weight:600;line-height:1;letter-spacing:-.03em">${r.w}</span><span class="t-sec num">${r.d ? `+${r.d} hari · ` : ''}Trimester ${tri}</span></div></div>
            <div class="btn-row" style="width:100%;text-align:left">
              <div><p class="t-sec">HPL (hari perkiraan lahir)</p><p class="num" style="font-size:19px;font-weight:600;margin:0">${P.fmt(r.hpl)}</p></div>
              <div style="text-align:right"><p class="t-sec">Menuju HPL</p><p class="num" style="font-size:19px;font-weight:600;margin:0">${Math.max(0, 40 - r.w)} minggu</p></div></div>
          </section>
          ${nv ? `<button type="button" class="card tight" data-go="kontrol"><span class="card-row"><span class="bubble-ic">${ic('calendar')}</span><span class="grow"><span class="t-sec" style="display:block">Kontrol kehamilan berikutnya · K${nv.k}</span><span class="t-h3 num" style="display:block">${P.fmtShort(P.parse(nv.date))} · 09.00</span><span class="t-sec">${nv.who} · [RS A]</span></span>${ic('chev')}</span></button>` : ''}
          ${P.namePrompt()}
          <button type="button" class="card tight" data-go="guide"><span class="card-row"><span class="bubble-ic">${ic('book')}</span><span class="grow"><span class="t-h3" style="display:block">Panduan minggu ini</span><span class="t-sec">Si kecil, tubuhmu, dan pertanyaan untuk kontrol</span></span>${ic('chev')}</span></button>
          <div class="tiles" style="grid-template-columns:repeat(3,1fr)">
            ${[['birthplan', 'bag', 'Rencana persalinan'], ['bidan', 'chat', 'Bidan'], ['meals', 'utensils', 'Makanan']].map(([g, i, t]) => `<button type="button" class="card tile tight" data-go="${g}" style="min-height:96px"><span class="bubble-ic" style="width:40px;height:40px;flex-basis:40px">${ic(i)}</span><span style="font-size:14px">${t}</span></button>`).join('')}
          </div>
          ${sos()}
        </div>`,
        tab: 'preg'
      };
    }
  });
  P.sheets.pregMenu = () => ({
    title: 'Menu',
    body: `<div class="rows">
      <button type="button" class="row" data-act="babyBorn"><span class="bubble-ic">${ic('baby')}</span><span class="grow"><span class="t">Bayi sudah lahir?</span><br><span class="t-sec">Pindah ke tahap setelah lahir</span></span>${ic('chev')}</button>
      <button type="button" class="row" data-go="account"><span class="bubble-ic">${ic('user')}</span><span class="grow"><span class="t">Akun & ganti tahap</span></span>${ic('chev')}</button>
      <button type="button" class="row" data-go="loss"><span class="bubble-ic slate">${ic('heart')}</span><span class="grow"><span class="t">Kehamilan saya berakhir</span><br><span class="t-sec">Kami hentikan semua hal tentang kehamilan</span></span>${ic('chev')}</button>
    </div>`
  });
  P.acts.babyBorn = () => { P.closeSheet(true, true); P.S.stage = 'baby'; P.go('setupBaby'); };

  /* ======================================================================
     C15 · Panduan minggu ini
     ====================================================================== */
  const GQ = ['Apakah hasil pemeriksaanku sejauh ini baik?', 'Kapan jadwal USG berikutnya?', 'Aktivitas apa yang aman untukku sekarang?'];
  P.def({
    id: 'guide', sec: 'C', n: 15, name: 'Panduan minggu ini', tone: 'preg',
    notes: 'Clinical copy for “Si kecil” and “Tubuhmu” is a placeholder until reviewed; no invented developmental claims. Questions can be added to the check-up list with one tap and show a check when added.',
    render: () => {
      const w = P.S.guideWeek, q = P.S.questions;
      return {
        main: hdr({ title: 'Panduan minggu ini' }) + `<div class="body rise">
          <div class="hscroll" role="tablist" aria-label="Pilih minggu" id="gw-scroll">${Array.from({ length: 37 }, (_, i) => i + 4).map((n) => `<button type="button" role="tab" class="chip" aria-selected="${n === w}" data-act="guideWeek" data-v="${n}" ${n === w ? 'id="gw-cur"' : ''}><span class="num">${n}</span></button>`).join('')}</div>
          <h2 class="t-hero">Minggu ke-<span class="num">${w}</span></h2>
          <section class="card"><div class="card-row"><span class="bubble-ic">${ic('sprout')}</span><h2 class="t-h3 grow">Si kecil</h2></div>
            <div class="ph-img" style="height:120px">[Ilustrasi ukuran minggu ${w} · sumber]</div>
            <p class="t-body">[Perkembangan janin minggu ke-${w} · menunggu tinjauan klinis]</p>${src('[referensi klinis]')}</section>
          <section class="card"><div class="card-row"><span class="bubble-ic">${ic('heart')}</span><h2 class="t-h3 grow">Tubuhmu</h2></div>
            <p class="t-body">Setiap kehamilan berbeda. Catat yang kamu rasakan dan bawa catatannya saat kontrol.</p><p class="t-sec">[Perubahan umum minggu ini · menunggu tinjauan klinis]</p></section>
          <section class="card"><div class="card-row"><span class="bubble-ic">${ic('list')}</span><h2 class="t-h3 grow">Yang bisa kamu lakukan</h2></div>
            <div class="rows">${[['kontrol', 'calendar', 'Cek jadwal kontrol berikutnya'], ['catat', 'edit', 'Catat keluhan harian'], ['birthplan', 'bag', 'Mulai susun rencana persalinan']].map(([g, i, t]) => g === 'catat'
              ? `<button type="button" class="row" data-sheet="catat">${ic(i)}<span class="grow t">${t}</span>${ic('chev')}</button>`
              : `<button type="button" class="row" data-go="${g}">${ic(i)}<span class="grow t">${t}</span>${ic('chev')}</button>`).join('')}</div></section>
          <section class="card"><div class="card-row"><span class="bubble-ic">${ic('chat')}</span><h2 class="t-h3 grow">Pertanyaan untuk kontrol</h2></div>
            <div class="rows">${GQ.map((t, i) => { const on = q.includes(t); return `<div class="row static"><span class="grow">${t}</span>${chip(on ? 'Ditambahkan' : 'Tambah', { pressed: on, icon: on ? 'check' : 'plus', cls: 'sm', 'data-act': 'guideQ', 'data-v': i, 'aria-label': `${on ? 'Hapus dari' : 'Tambah ke'} daftar: ${t}` })}</div>`; }).join('')}</div></section>
        </div>`,
        dock: btn(`Lihat daftar pertanyaanku (${q.length})`, { 'data-go': 'kontrol', 'data-arg': 'q', icon: 'list' })
      };
    },
    after: (scr, fresh) => { if (fresh) { const c = scr.querySelector('#gw-cur'); if (c) c.scrollIntoView({ inline: 'center', block: 'nearest' }); } }
  });
  P.acts.guideWeek = (el) => { P.S.guideWeek = +el.dataset.v; P.rerender(); };
  P.acts.guideQ = (el) => { const t = GQ[+el.dataset.v], q = P.S.questions, i = q.indexOf(t); if (i >= 0) q.splice(i, 1); else { q.push(t); P.toast('Ditambahkan ke Pertanyaanku'); } P.rerender(); };

  /* ======================================================================
     C16 · Kontrol kehamilan
     ====================================================================== */
  P.def({
    id: 'kontrol', sec: 'C', n: 16, name: 'Kontrol kehamilan', tone: 'preg',
    enter: (arg) => { P._kontrolQ = arg === 'q'; },
    notes: 'States are encoded three ways: icon (check / dashed slash / clock / number), outline style (filled / dashed / glowing / plain) and a text label. The missed visit gets a gentle nudge with “Tanya bidan”, never red. Kemenkes year is a placeholder.',
    states: [{ label: 'Sheet catat / buat janji', sheet: 'visit', sheetArg: '4' }],
    render: () => {
      const V = P.S.visits, done = V.filter((v) => v.state === 'done').length, doc = V.filter((v) => v.state === 'done' && v.who.includes('Dokter')).length;
      const miss = V.find((v) => v.state === 'miss');
      const LAB = { done: 'Selesai', miss: 'Terlewat', next: 'Berikutnya', up: 'Akan datang' };
      const ICO = { done: 'check', miss: 'slash', next: 'clock' };
      return {
        main: hdr({ title: 'Kontrol kehamilan' }) + `<div class="body rise">
          <section class="card glow"><p class="t-sec">Kontrol yang sudah dilakukan</p>
            <p style="margin:0"><span class="num" style="font-size:44px;font-weight:600;letter-spacing:-.02em">${done}</span> <span class="t-h3">dari 6</span></p>
            <div class="pips" aria-hidden="true">${V.map((v) => `<i class="${v.state === 'next' ? 'now' : v.state}">${ICO[v.state] ? ic(ICO[v.state], 16) : `<span class="num" style="font-size:13px;font-weight:600">K${v.k}</span>`}</i>`).join('')}</div>
            <p class="t-body">Minimal 6 kali selama hamil, 2 di antaranya dengan dokter + USG. <span class="t-sec">(${doc} dari 2 dengan dokter sudah)</span></p>${src('Kemenkes, [tahun]')}</section>
          ${miss ? `<section class="card tinted"><div class="card-row"><span class="bubble-ic">${ic('clock')}</span><div class="grow"><h2 class="t-h3">K${miss.k} terlewat</h2><p class="t-sec">Tidak apa-apa. Yuk jadwalkan ulang.</p></div></div>
            <div class="btn-row">${btn('Jadwalkan', { cls: 'btn-sm', 'data-sheet': 'visit', 'data-v': String(miss.k) })}${btn('Tanya bidan', { kind: 'glass', cls: 'btn-sm', 'data-go': 'bidan' })}</div></section>` : ''}
          <section class="card"><h2 class="t-h3">Jadwal kontrol</h2>
            <ol class="steps">${V.map((v) => `<li><span class="st-ic ${v.state === 'next' ? 'now' : v.state === 'up' ? '' : v.state}">${ICO[v.state] ? ic(ICO[v.state], 16) : `<span class="num" style="font-size:13px;font-weight:600">${v.k}</span>`}</span>
              <button type="button" class="grow" style="all:unset;flex:1;cursor:pointer;display:flex;align-items:center;gap:8px;min-height:44px" data-sheet="visit" data-v="${v.k}" aria-label="K${v.k}, ${v.who}, ${LAB[v.state]}${v.date ? ', ' + P.fmt(P.parse(v.date)) : ''}. Catat atau buat janji.">
                <span style="flex:1"><b>K${v.k} · ${v.who}</b><br><span class="t-sec">${LAB[v.state]}${v.date ? ` · <span class="num">${P.fmt(P.parse(v.date))}</span>` : ''}</span></span>${ic('chev', 18)}</button></li>`).join('')}</ol></section>
          <section class="card" id="myq" aria-labelledby="myq-t"><h2 class="t-h3" id="myq-t">Pertanyaanku</h2>
            ${P.S.questions.length ? `<ul style="list-style:none;margin:0;padding:0" class="rows">${P.S.questions.map((q, i) => `<li class="row static"><span class="grow">${esc(q)}</span><button class="ib plain" type="button" aria-label="Hapus: ${esc(q)}" data-act="qDel" data-v="${i}">${ic('close', 18)}</button></li>`).join('')}</ul>` : '<p class="t-sec">Belum ada. Tambahkan yang ingin kamu tanyakan saat kontrol.</p>'}
            <form data-submit="qAdd" class="btn-row" style="align-items:flex-end"><div class="field" style="flex:2"><label for="q-in">Tambah pertanyaan</label><input class="inp" id="q-in" placeholder="Tulis pertanyaanmu"></div>${btn('Tambah', { kind: 'glass', cls: 'btn-sm', type: 'submit', style: 'flex:0 0 auto;min-height:52px' })}</form></section>
        </div>`,
        dock: btn('Catat atau buat janji', { 'data-sheet': 'visit', 'data-v': '4', icon: 'plus' })
      };
    },
    after: (scr, fresh) => { if (fresh && P._kontrolQ) { const q = scr.querySelector('#myq'); if (q) q.scrollIntoView({ block: 'start' }); } }
  });
  P.acts.qDel = (el) => { const q = P.S.questions, [t] = q.splice(+el.dataset.v, 1); P.rerender(); P.toast('Pertanyaan dihapus', { undo: () => q.splice(+el.dataset.v, 0, t) }); };
  P.acts.qAdd = (f) => { const v = f.querySelector('#q-in').value.trim(); if (!v) return; P.S.questions.push(v); P.rerender(); P.toast('Ditambahkan ke Pertanyaanku'); };
  let visitMode = 'book';
  P.sheets.visit = (k) => {
    const v = P.S.visits.find((x) => x.k === +k) || P.S.visits[3];
    return {
      title: `K${v.k} · ${v.who}`,
      body: `${P.seg('Pilih aksi', [['log', 'Catat hasil'], ['book', 'Buat janji']], visitMode, 'visitMode')}
        ${field({ id: 'vs-date', label: visitMode === 'log' ? 'Tanggal kontrol' : 'Tanggal janji', type: 'date', value: v.date || P.iso(P.addDays(P.TODAY, 7)) })}
        <div class="field"><label for="vs-place">Tempat</label><select class="inp" id="vs-place">${P.HOSP.map((h) => `<option>${h.name}</option>`).join('')}<option>[Bidan praktik mandiri]</option></select></div>
        <div class="field"><label for="vs-note">Catatan (opsional)</label><textarea class="inp" id="vs-note" placeholder="${visitMode === 'log' ? 'Mis. hasil pemeriksaan, saran bidan' : 'Mis. bawa buku KIA'}"></textarea></div>
        ${btn(visitMode === 'log' ? 'Simpan hasil' : 'Simpan janji', { 'data-act': 'visitSave', 'data-v': String(v.k) })}`
    };
  };
  P.acts.visitMode = (el) => { visitMode = el.dataset.v; P.rerender(); };
  P.acts.visitSave = (el) => {
    const v = P.S.visits.find((x) => x.k === +el.dataset.v), d = P.el().querySelector('#vs-date').value;
    if (visitMode === 'log') v.state = 'done'; else { P.S.visits.forEach((x) => { if (x.state === 'next') x.state = 'up'; }); v.state = 'next'; }
    if (d) v.date = d;
    P.closeSheet(true); P.rerender(); P.toast(visitMode === 'log' ? `K${v.k} tercatat selesai` : `Janji K${v.k} tersimpan · pengingat H-1 aktif`);
  };

  /* ======================================================================
     C17 · Rencana persalinan
     ====================================================================== */
  const BP = [
    ['Dokumen', [['ktp', 'KTP'], ['bpjs', 'Kartu BPJS/asuransi'], ['kia', 'Buku KIA']]],
    ['Tas ibu', [['b1', 'Baju ganti & kain'], ['b2', 'Pembalut nifas'], ['b3', 'Perlengkapan mandi'], ['b4', 'Bra menyusui']]],
    ['Tas bayi', [['y1', 'Baju bayi'], ['y2', 'Popok'], ['y3', 'Selimut bayi'], ['y4', 'Topi & kaus kaki']]]
  ];
  P.def({
    id: 'birthplan', sec: 'C', n: 17, name: 'Rencana persalinan', tone: 'preg',
    notes: 'Checklists with a single progress figure. Each item can be assigned to the partner (toggle with a text label “Pasangan”), but nothing reaches the partner unless “Tugas persiapan” sharing is on.',
    render: () => {
      const b = P.S.birth, all = BP.flatMap((g) => g[1]), done = all.filter(([k]) => b.done[k]).length;
      return {
        main: hdr({ title: 'Rencana persalinan' }) + `<div class="body rise">
          <section class="card glow"><div class="card-row"><div class="grow"><p class="t-sec">Persiapan</p><p style="margin:0"><span class="num" style="font-size:36px;font-weight:600">${done}</span> <span class="t-h3">dari ${all.length} siap</span></p></div><span class="badge stage">${ic('bag', 15)}${Math.round((done / all.length) * 100)}%</span></div>
            <div class="bar" role="progressbar" aria-label="Kemajuan persiapan persalinan" aria-valuemin="0" aria-valuemax="${all.length}" aria-valuenow="${done}"><i style="width:${(done / all.length) * 100}%"></i></div></section>
          <section class="card"><div class="card-row"><span class="bubble-ic">${ic('hospital')}</span><div class="grow"><p class="t-sec">Rumah sakit pilihan</p><h2 class="t-h3">${b.hosp}</h2></div>${btn('Ganti', { kind: 'text', cls: 'btn-sm', 'data-go': 'hospitals' })}</div>
            <div class="card-row"><span class="bubble-ic">${ic('route')}</span><div class="grow"><p class="t-sec">Rute dari rumah</p><p class="num" style="margin:0;font-weight:700">[x km] · [x menit]</p></div>${btn('Arah', { kind: 'text', cls: 'btn-sm', icon: 'nav', 'data-act': 'directions' })}</div>
            <div class="field"><span class="lbl" id="bp-drv">Siapa yang mengantar?</span><div class="chips" role="radiogroup" aria-labelledby="bp-drv">${[['pasangan', 'Pasangan'], ['keluarga', 'Keluarga'], ['taksi', 'Taksi online']].map(([v, t]) => chip(t, { role: 'radio', pressed: b.driver === v, 'data-act': 'bpDriver', 'data-v': v })).join('')}</div></div></section>
          ${BP.map(([g, items]) => `<section class="card" aria-label="${g}"><div class="card-row"><h2 class="t-h3 grow">${g}</h2><span class="t-sec num" style="font-weight:700">${items.filter(([k]) => b.done[k]).length}/${items.length}</span></div>
            <div class="rows">${items.map(([k, t]) => `<div class="row static" style="padding:0">${P.check('bp-' + k, t, b.done[k], 'bpCheck', b.assign[k] ? 'Ditugaskan ke pasangan' : '', k).replace('class="check', 'style="flex:1" class="check')}
              <button type="button" class="chip sm" aria-pressed="${!!b.assign[k]}" data-act="bpAssign" data-v="${k}" aria-label="Tugaskan ke pasangan: ${t}">${ic('users', 16)}${b.assign[k] ? 'Pasangan' : 'Tugaskan'}</button></div>`).join('')}</div></section>`).join('')}
        </div>`,
        dock: btn('Bagikan tugas ke pasangan', { icon: 'users', 'data-act': 'bpShare' })
      };
    }
  });
  P.acts.bpDriver = (el) => { P.S.birth.driver = el.dataset.v; P.rerender(); };
  P.acts.bpCheck = (el) => { P.S.birth.done[el.dataset.v] = el.checked; P.rerender(); };
  P.acts.bpAssign = (el) => { const a = P.S.birth.assign, k = el.dataset.v; a[k] = !a[k]; P.rerender(); };
  P.acts.bpShare = () => { if (P.S.partner.tasks) P.toast('Tugas dibagikan ke pasangan', { icon: 'users' }); else P.openSheet('shareTasks'); };
  P.sheets.shareTasks = () => ({
    title: 'Tugas belum dibagikan',
    body: `<p class="t-body">Pasanganmu belum bisa melihat tugas persiapan. Nyalakan “Tugas persiapan” di pengaturan pasangan.</p>${btn('Atur pasangan', { 'data-go': 'partnerSetup' })}${btn('Nanti saja', { kind: 'glass', 'data-close': true })}`
  });

  /* ======================================================================
     C18 · NutriScan
     ====================================================================== */
  P.def({
    id: 'nutriscan', sec: 'C', n: 18, name: 'NutriScan', tone: 'shared',
    notes: 'Camera is a labelled placeholder. Scanning uses a transform-only sweep (static text with reduced motion). Results list each detected food with plain-language confidence (“Cukup yakin / Perlu dicek”) and “Ubah”. No calorie counts, no weight targets. Free quota shows in brackets; hidden when covered.',
    states: [{ label: 'Memindai', state: (S) => { S.nutri.phase = 'scan'; } }, { label: 'Hasil', state: (S) => { S.nutri.phase = 'result'; } }],
    leave: () => { if (P.S.nutri.phase === 'scan') P.S.nutri.phase = 'idle'; },
    render: () => {
      const n = P.S.nutri, cov = P.S.covered;
      const quota = cov ? `<span class="badge cover">${ic('shieldc', 14)}Ditanggung · scan tanpa batas</span>` : `<p class="t-sec" style="text-align:center"><b class="num" style="color:var(--ink)">[${P.S.scans} dari 3]</b> scan gratis minggu ini</p>`;
      let body = '', dock = '';
      if (n.mode === 'scan') {
        if (n.phase === 'result') {
          body = `<section class="card glow" aria-live="polite"><div class="card-row"><span class="bubble-ic">${ic('checkc')}</span><h2 class="t-h3 grow">Makanan terdeteksi</h2></div>
            <div class="rows">${n.foods.map((f, i) => `<div class="row static"><span class="grow"><span class="t">${esc(f.n)}</span><br><span class="t-sec" style="display:inline-flex;gap:4px;align-items:center">${ic(f.c === 'yakin' ? 'checkc' : 'info', 15)}${{ yakin: 'Cukup yakin', cek: 'Perlu dicek', diubah: 'Diubah olehmu' }[f.c] || 'Perlu dicek'}</span></span>${btn('Ubah', { kind: 'glass', cls: 'btn-sm', 'data-sheet': 'editFood', 'data-v': String(i), 'aria-label': `Ubah ${f.n}` })}</div>`).join('')}</div></section>
            <section class="card"><h2 class="t-h3">Catatan umum</h2><p class="t-body">Piring ini berisi sumber karbohidrat, sayur, dan protein nabati.</p>${src('[referensi gizi]')}<p class="t-sec">Bukan pengganti saran tenaga kesehatan.</p></section>`;
          dock = `${btn('Simpan ke catatan', { 'data-act': 'nsSave' })}${btn('Ulangi', { kind: 'text', cls: 'center', 'data-act': 'nsReset' })}`;
        } else {
          const scanning = n.phase === 'scan';
          body = `<div class="cam" role="img" aria-label="${scanning ? 'Sedang memindai makanan' : 'Pratinjau kamera'}"><span class="corner c1"></span><span class="corner c2"></span><span class="corner c3"></span><span class="corner c4"></span>
              ${scanning ? '<span class="sweep"></span>' : ''}<span class="ph">${scanning ? 'Mengenali makanan…' : '[Pratinjau kamera]<br><span style="font-weight:500;opacity:.85">Arahkan ke piringmu</span>'}</span></div>
            <p class="t-sec" aria-live="polite" style="text-align:center">${scanning ? 'Mengenali makanan…' : 'Pastikan cahaya cukup dan seluruh piring terlihat.'}</p>${quota}`;
          dock = P.S.scans <= 0 && !cov ? `${btn('Pakai mode Manual', { kind: 'glass', 'data-act': 'nsMode', 'data-v': 'manual' })}<p class="t-sec">Kuota scan minggu ini habis. Mode Manual tetap gratis.</p>` : btn(scanning ? 'Memindai…' : 'Ambil foto', { icon: 'camera', 'data-act': 'nsShoot', disabled: scanning });
        }
      } else if (n.mode === 'menu') {
        body = `<form class="card" data-submit="nsMenu">${field({ id: 'ns-menu', label: 'Tulis menu', value: n.menu, ph: 'Mis. soto ayam dan nasi' })}${btn('Cek menu', { kind: 'glass', type: 'submit' })}</form><p class="t-sec">Mode Menu tidak memakai kuota scan.</p>`;
        dock = btn('Buka kamera', { kind: 'glass', icon: 'camera', 'data-act': 'nsMode', 'data-v': 'scan' });
      } else {
        const opts = ['Nasi putih', 'Nasi merah', 'Telur', 'Tempe', 'Tahu', 'Ikan', 'Ayam', 'Sayur bayam', 'Buah pepaya', 'Kacang hijau'];
        body = `<section class="card"><h2 class="t-h3" id="ns-man">Pilih yang kamu makan</h2><div class="chips" role="group" aria-labelledby="ns-man">${opts.map((o) => chip(o, { pressed: n.foods.some((f) => f.n === o), 'data-act': 'nsPick', 'data-v': o })).join('')}</div></section><p class="t-sec">Mode Manual selalu gratis.</p>`;
        dock = btn('Simpan ke catatan', { 'data-act': 'nsSave' });
      }
      return {
        main: hdr({ title: 'NutriScan' }) + `<div class="body rise">${seg('Mode NutriScan', [['scan', 'Scan'], ['menu', 'Menu'], ['manual', 'Manual']], n.mode, 'nsMode')}${body}</div>`,
        dock
      };
    }
  });
  P.acts.nsMode = (el) => { P.S.nutri.mode = el.dataset.v; P.S.nutri.phase = 'idle'; P.rerender(); };
  P.acts.nsShoot = () => {
    const n = P.S.nutri; n.phase = 'scan'; if (!P.S.covered) P.S.scans = Math.max(0, P.S.scans - 1); P.rerender();
    P.later(() => { if (P.cur() === 'nutriscan' && n.phase === 'scan') { n.phase = 'result'; P.rerender(); } }, 1800);
  };
  P.acts.nsReset = () => { P.S.nutri.phase = 'idle'; P.rerender(); };
  P.acts.nsSave = () => { P.S.nutri.phase = 'idle'; P.rerender(); P.toast('Tersimpan ke catatan makan'); };
  P.acts.nsMenu = (f) => { const v = f.querySelector('#ns-menu').value.trim(); P.S.nutri.menu = v; if (!v) return; P.S.nutri.mode = 'scan'; P.S.nutri.phase = 'result'; P.S.nutri.foods = v.split(/,| dan /).map((x) => ({ n: x.trim().replace(/^\w/, (c) => c.toUpperCase()), c: 'cek' })).filter((x) => x.n); P.rerender(); };
  P.acts.nsPick = (el) => { const f = P.S.nutri.foods, i = f.findIndex((x) => x.n === el.dataset.v); if (i >= 0) f.splice(i, 1); else f.push({ n: el.dataset.v, c: 'yakin' }); P.rerender(); };
  P.sheets.editFood = (i) => {
    const f = P.S.nutri.foods[+i] || { n: '' };
    return { title: 'Ubah makanan', body: `${field({ id: 'ef-name', label: 'Nama makanan', value: f.n })}${btn('Simpan', { 'data-act': 'efSave', 'data-v': i })}${btn('Hapus dari daftar', { kind: 'text', cls: 'center ink', 'data-act': 'efDel', 'data-v': i })}` };
  };
  P.acts.efSave = (el) => { const v = P.el().querySelector('#ef-name').value.trim(); if (v) P.S.nutri.foods[+el.dataset.v] = { n: v, c: 'diubah' }; P.closeSheet(true); P.rerender(); };
  P.acts.efDel = (el) => { P.S.nutri.foods.splice(+el.dataset.v, 1); P.closeSheet(true); P.rerender(); };

  /* ======================================================================
     C19 · Makanan
     ====================================================================== */
  // Each item carries its own attributes; filters hide items, they never change a badge.
  const MEALS = {
    hamil: [['Paket makan siang ibu hamil', 'Nasi, lauk, sayur, buah', { halal: true, kacang: false, seafood: false, telur: true }], ['Paket makan malam ibu hamil', 'Lauk berkuah, sayur, buah', { halal: true, kacang: false, seafood: true, telur: false }]],
    menyusui: [['Paket ibu menyusui · siang', 'Nasi, lauk, sayur hijau', { halal: true, kacang: false, seafood: false, telur: false }], ['Camilan ibu menyusui', 'Pilihan camilan harian', { halal: false, kacang: true, seafood: false, telur: true }]],
    mpasi: [['Menu MPASI [Usia …]', '[Tekstur sesuai usia · sumber]', { halal: true, kacang: false, seafood: false, telur: false }], ['Menu MPASI [Usia …]', '[porsi] · [Tekstur sesuai usia · sumber]', { halal: true, kacang: false, seafood: true, telur: true }]]
  };
  const mealOk = (a) => P.S.meals.filters.every((f) => f === 'halal' ? a.halal : !a[f]);
  P.def({
    id: 'meals', sec: 'C', n: 19, name: 'Makanan', tone: 'shared',
    enter: (arg) => { if (arg) P.S.meals.tab = arg; },
    notes: 'Optional paid service. Halal and allergy filters are chips with check marks; they hide items, and each item states its own halal and allergen facts, so a badge never depends on a filter. Vendor and price are placeholders. MPASI tab uses texture/portion placeholders pending a source. No formula products anywhere.',
    states: [{ label: 'Sheet jadwal', sheet: 'mealSched' }],
    render: () => {
      const m = P.S.meals;
      return {
        main: hdr({ title: 'Makanan', sub: 'Antar dari vendor terverifikasi' }) + `<div class="body rise">
          ${seg('Kategori menu', [['hamil', 'Hamil'], ['menyusui', 'Menyusui'], ['mpasi', 'MPASI']], m.tab, 'mealTab')}
          <div class="chips" role="group" aria-label="Filter">${[['halal', 'Halal'], ['kacang', 'Tanpa kacang'], ['seafood', 'Tanpa seafood'], ['telur', 'Tanpa telur']].map(([k, t]) => chip(t, { pressed: m.filters.includes(k), 'data-act': 'mealFilter', 'data-v': k })).join('')}</div>
          ${MEALS[m.tab].filter((x) => mealOk(x[2])).length ? '' : `<div class="card empty"><span class="bubble-ic">${ic('utensils', 30)}</span><h2 class="t-h3">Belum ada menu yang cocok</h2><p class="t-sec">Coba kurangi filternya.</p></div>`}
          ${MEALS[m.tab].map((x, i) => [x, i]).filter(([x]) => mealOk(x[2])).map(([[t, d, a], i]) => `<article class="card"><div class="ph-img" style="height:120px">[Foto menu]</div>
            <div class="card-row" style="align-items:flex-start"><div class="grow"><h2 class="t-h3">${t}</h2><p class="t-sec">${d}</p></div><p class="num" style="font-weight:700;margin:0">[Rp …]</p></div>
            <div class="chips" style="gap:6px"><span class="badge ink">[Vendor A]</span><span class="badge cover">${ic('shieldc', 14)}Vendor terverifikasi</span>${a.halal ? `<span class="badge ink">${ic('check', 14)}Halal</span>` : `<span class="badge ink">Belum bersertifikat halal</span>`}${a.kacang ? '<span class="badge ink">Mengandung kacang</span>' : ''}${a.seafood ? '<span class="badge ink">Mengandung seafood</span>' : ''}${a.telur ? '<span class="badge ink">Mengandung telur</span>' : ''}</div>
            ${btn('Jadwalkan', { kind: 'glass', cls: 'btn-sm', icon: 'calendar', 'data-sheet': 'mealSched', 'data-v': String(i), style: 'width:100%' })}</article>`).join('')}
          <button type="button" class="card tight" data-go="nutriscan"><span class="card-row"><span class="bubble-ic">${ic('scan')}</span><span class="grow"><span class="t-h3" style="display:block">Cek piringmu dengan NutriScan</span><span class="t-sec">Tanpa hitung kalori</span></span>${ic('chev')}</span></button>
        </div>`,
        dock: btn('Lihat jadwal antar', { kind: 'primary', icon: 'calendar', 'data-sheet': 'mealSched', 'data-v': '0' })
      };
    }
  });
  P.acts.mealTab = (el) => { P.S.meals.tab = el.dataset.v; P.rerender(); };
  P.acts.mealFilter = (el) => { const f = P.S.meals.filters, i = f.indexOf(el.dataset.v); if (i >= 0) f.splice(i, 1); else f.push(el.dataset.v); P.rerender(); };
  P.sheets.mealSched = (i) => {
    const m = P.S.meals, item = MEALS[m.tab][+i || 0] || MEALS[m.tab][0];
    return {
      title: 'Jadwal antar',
      body: `<p class="t-sec" style="margin-top:-8px">${item[0]} · [Vendor A]</p>
        <div class="field"><span class="lbl">Antar ke</span>${seg('Lokasi antar', [['rumah', 'Rumah'], ['kantor', 'Kantor']], m.loc, 'mealLoc')}</div>
        ${field({ id: 'ms-addr', label: 'Alamat', value: m.loc === 'rumah' ? '[alamat rumah]' : '[alamat kantor]' })}
        <div class="field"><span class="lbl" id="ms-d">Mulai tanggal</span><div class="hscroll" role="radiogroup" aria-labelledby="ms-d">${[1, 2, 3, 4, 5].map((n) => { const d = P.addDays(P.TODAY, n); return chip(`${P.DOW[d.getDay()]} <span class="num">${d.getDate()}</span>`, { role: 'radio', pressed: m.day === n, 'data-act': 'mealDay', 'data-v': n, 'aria-label': P.fmtShort(d) }); }).join('')}</div></div>
        <div class="field"><span class="lbl" id="ms-s">Waktu</span><div class="chips" role="radiogroup" aria-labelledby="ms-s">${[['siang', 'Siang'], ['malam', 'Malam']].map(([v, t]) => chip(t, { role: 'radio', pressed: m.slot === v, 'data-act': 'mealSlot', 'data-v': v })).join('')}</div></div>
        <p class="t-sec">Biaya: <b class="num">[Rp …]</b> per porsi · dibayar saat konfirmasi</p>
        ${btn('Simpan jadwal', { 'data-act': 'mealSave' })}`
    };
  };
  P.acts.mealLoc = (el) => { P.S.meals.loc = el.dataset.v; P.rerender(); };
  P.acts.mealDay = (el) => { P.S.meals.day = +el.dataset.v; P.rerender(); };
  P.acts.mealSlot = (el) => { P.S.meals.slot = el.dataset.v; P.rerender(); };
  P.acts.mealSave = () => { P.closeSheet(true); P.toast('Jadwal tersimpan · [Vendor A]'); };

  /* ======================================================================
     D20 · Tanya Peluky (AI)
     ====================================================================== */
  const AI_SEED = {
    plan: ['Apa itu masa subur?', 'Masa subur adalah beberapa hari dalam siklus saat peluang hamil paling tinggi. Kalender Peluky memberi perkiraan, bukan kepastian.'],
    preg: ['Boleh minum kopi saat hamil?', 'Banyak panduan menyarankan membatasi kafein saat hamil. Batas yang tepat bisa berbeda untuk tiap orang, jadi tanyakan juga ke bidanmu.'],
    baby: ['Kapan si kecil mulai MPASI?', 'ASI eksklusif dianjurkan sampai 6 bulan, lalu MPASI dimulai. Bidan bisa bantu menyesuaikan dengan kondisi si kecil.']
  };
  const SUGG = { plan: ['Kapan sebaiknya tes kehamilan?', 'Siklusku tidak teratur'], preg: ['Apa yang dibawa saat kontrol?', 'Perut terasa kencang'], baby: ['Si kecil sering gumoh', 'Jadwal imunisasi'] };
  const aiInit = () => {
    if (P.S.ai) return;
    const intro = { w: 'ai', t: 'Hai! Aku bisa bantu menjawab pertanyaan umum. Untuk keluhan, bidan siap membantu.' };
    if (!P.S.returning || P.S.lossActive) { P.S.ai = [intro]; return; }
    const k = AI_SEED[P.S.stage] ? P.S.stage : 'preg', [q, a] = AI_SEED[k];
    P.S.ai = [intro, { w: 'me', t: q }, { w: 'ai', t: a, src: k === 'baby' ? 'PP 33/2012 · [referensi klinis]' : '[referensi klinis]' }];
  };
  const answer = () => ({ w: 'ai', t: '[Jawaban singkat dari referensi klinis yang sudah ditinjau]. Kalau ini keluhan, bidan bisa membantu.', src: '[referensi klinis]' });
  const dangerCard = (m, i) => {
    const mental = m.level === 'mental';
    return `<div class="danger-card" role="alert"><div class="card-row">${ic(mental ? 'heart' : 'alert', 24, 'style="color:var(--red)"')}<h3 class="t-h3 grow">${mental ? 'Kamu tidak sendiri' : 'Ini bisa jadi tanda bahaya'}</h3></div>
      <p class="t-body">${mental ? 'Terima kasih sudah bercerita. Kamu berhak dapat bantuan sekarang.' : 'Jangan menunggu jawaban chat. Segera cari bantuan.'}</p>
      ${btn('Telepon <span class="num">119</span> sekarang', { kind: 'danger', icon: 'phone', 'data-act': 'call119' })}
      ${mental ? btn('Bicara dengan konselor', { kind: 'support', icon: 'heart', 'data-act': 'callSupport' }) : btn('Bantuan darurat', { kind: 'glass', cls: 'btn-sm', 'data-go': 'emergency', style: 'width:100%' })}
      ${m.resolved ? '' : `<button type="button" class="btn btn-text ink" style="align-self:center" data-act="aiNotEmergency" data-v="${i}">Bukan darurat, lanjutkan</button>`}</div>`;
  };
  const renderMsg = (m, i) => {
    if (m.w === 'me') return `<div class="msg me">${esc(m.t)}</div>`;
    if (m.w === 'typing') return `<div class="msg them typing" aria-label="Sedang mengetik"><i></i><i></i><i></i></div>`;
    if (m.w === 'danger') return dangerCard(m, i);
    if (m.w === 'ask') return `<div class="card tight solid" role="group" aria-labelledby="ask-${i}"><div class="card-row">${ic('info', 22)}<h3 class="t-h3 grow" id="ask-${i}">Apakah ini terjadi sekarang?</h3></div>
      <p class="t-sec">Pesanmu menyebut “${esc(m.word)}”. Kami tanya dulu agar tidak salah arah.</p>
      ${m.resolved ? '' : `<div class="btn-row">${btn('Ya, sekarang', { kind: 'glass', cls: 'btn-sm', 'data-act': 'aiAskYes', 'data-v': i })}${btn('Cuma bertanya', { kind: 'glass', cls: 'btn-sm', 'data-act': 'aiAskNo', 'data-v': i })}</div>`}</div>`;
    if (m.w === 'sys') return `<p class="sysline">${esc(m.t)}</p>`;
    if (m.w === 'quota') return `<div class="card tight solid"><h3 class="t-h3">Kuota pertanyaan gratis habis</h3><p class="t-sec">Keluhan kesehatan tetap dijawab bidan, gratis.</p><div class="btn-row">${btn('Chat bidan', { cls: 'btn-sm', 'data-go': 'bidan' })}${btn('Lihat Premium', { kind: 'glass', cls: 'btn-sm', 'data-go': 'premium' })}</div></div>`;
    return `<div class="msg them"><span class="who">${m.who || 'Tanya Peluky'}</span><span>${esc(m.t)}</span>${m.src ? `<span style="display:flex;gap:6px;flex-wrap:wrap">${src(m.src)}${m.who ? '' : `<button type="button" class="chip sm" data-sheet="askBidan">${ic('chat', 14)}Tanya bidan</button>`}</span>` : ''}</div>`;
  };
  P.renderMsg = renderMsg;
  P.def({
    id: 'tanya', sec: 'D', n: 20, name: 'Tanya Peluky', tone: 'shared',
    enter: aiInit,
    notes: 'Answers are short and neutral, never a diagnosis, each with a source chip and “Tanya bidan”. Free text runs through a triage step: clear danger or crisis wording shows a red card with 119 (crisis wording leads with “Kamu tidak sendiri” and a counsellor button), even at quota 0; an ambiguous word (darah, bengkak, lemas…) asks “Apakah ini terjadi sekarang?” before alarming; everyday phrases like “tekanan darah” are excluded. Every safety card has “Bukan darurat, lanjutkan” so her question is still answered. Quota shows once, in the header, and disappears when covered.',
    states: [{ label: 'Kuota 0 + kata bahaya', state: (S) => { S.quota = 0; if (S.ai && !S.ai.some((m) => m.w === 'danger')) S.ai.push({ w: 'me', t: 'Keluar flek banyak sejak tadi' }, { w: 'danger', level: 'danger', t: 'flek banyak' }); } },
      { label: 'Tanya dulu (ambigu)', state: (S) => { if (S.ai && !S.ai.some((m) => m.w === 'ask')) S.ai.push({ w: 'me', t: 'Kaki bengkak kalau sore, normal?' }, { w: 'ask', word: 'bengkak', q: 'Kaki bengkak kalau sore, normal?' }); } }],
    render: () => {
      aiInit();
      const s = P.S, k = SUGG[s.stage] ? s.stage : 'preg';
      return {
        main: hdr({ title: 'Tanya Peluky', sub: 'Asisten AI · bukan diagnosis', right: s.covered ? `<span class="badge cover">${ic('shieldc', 14)}Ditanggung</span>` : `<span class="badge stage num" aria-label="Sisa ${s.quota} pertanyaan gratis minggu ini">Sisa [${s.quota}]</span>` }) + `<div class="body" style="padding-bottom:200px">
          <div class="thread" id="ai-thread" aria-live="polite">${s.ai.map(renderMsg).join('')}</div></div>`,
        bar: `<div class="inputbar"><div class="hscroll"><button type="button" class="chip sm" data-go="emergency">${ic('phone', 14)}Darurat</button>${s.lossActive ? '' : SUGG[k].map((t) => chip(t, { cls: 'sm', 'data-act': 'aiSugg', 'data-v': t })).join('')}<button type="button" class="chip sm" data-sheet="askBidan">${ic('chat', 14)}Tanya bidan</button></div>
          <form data-submit="aiSend"><div class="fld"><label for="ai-in">Tulis pertanyaanmu</label><input id="ai-in" autocomplete="off" placeholder="Mis. boleh pijat saat hamil?"></div><button class="send" type="submit" aria-label="Kirim">${ic('send', 22)}</button></form></div>`
      };
    },
    after: (scr) => { const s = scr.querySelector('.scroll'); if (s) s.scrollTop = s.scrollHeight; }
  });
  const bottom = () => { const sc = P.el().querySelector('.scroll'); if (sc) sc.scrollTop = 1e6; };
  const aiAnswer = () => {
    const s = P.S;
    if (!s.covered && s.quota <= 0) { s.ai.push({ w: 'quota' }); P.rerender(); bottom(); return; }
    if (!s.covered) s.quota--;
    s.ai.push({ w: 'typing' }); P.rerender(); bottom();
    P.later(() => { const i = s.ai.findIndex((m) => m.w === 'typing'); if (i >= 0) s.ai.splice(i, 1, answer()); P.rerender(); bottom(); }, 1200);
  };
  const aiAsk = (t) => {
    const s = P.S; if (!t) return;
    s.ai.push({ w: 'me', t });
    const r = P.triage(t);
    if (r.level === 'danger' || r.level === 'mental') { s.ai.push({ w: 'danger', level: r.level, t, q: t }); P.rerender(); bottom(); return; }
    if (r.level === 'ask') { s.ai.push({ w: 'ask', word: r.word, q: t }); P.rerender(); bottom(); return; }
    aiAnswer();
  };
  P.acts.aiSend = (f) => { const i = f.querySelector('#ai-in'); const t = i.value.trim(); i.value = ''; aiAsk(t); };
  P.acts.aiSugg = (el) => aiAsk(el.dataset.v);
  P.acts.aiNotEmergency = (el) => { const m = P.S.ai[+el.dataset.v]; m.resolved = true; P.S.ai.push({ w: 'sys', t: 'Baik. Kalau keadaan memburuk, tombol Darurat selalu di atas.' }); aiAnswer(); };
  P.acts.aiAskYes = (el) => { const m = P.S.ai[+el.dataset.v]; m.resolved = true; P.S.ai.push({ w: 'danger', level: 'danger', t: m.q, q: m.q }); P.rerender(); bottom(); };
  P.acts.aiAskNo = (el) => { const m = P.S.ai[+el.dataset.v]; m.resolved = true; aiAnswer(); };
  P.sheets.askBidan = () => ({
    title: 'Tanya bidan',
    body: `<p class="t-body">Bidan menjawab keluhan kesehatan, gratis.</p>
      <div class="rows">${sw('ab-share', 'Ringkasan percakapan dikirim ke bidan', 'Bidan melihat ringkasan, bukan seluruh percakapan.', P.S.aiShare, 'aiShare')}</div>
      ${btn('Buka chat bidan', { 'data-act': 'toBidan' })}`
  });
  P.acts.aiShare = () => { P.S.aiShare = !P.S.aiShare; P.rerender(); };
  P.acts.toBidan = () => { P.closeSheet(true, true); P.go('bidan', { arg: P.S.aiShare ? '__summary' : '' }); };

  /* ======================================================================
     D21 · Chat bidan
     ====================================================================== */
  const BIDAN_SEED = {
    preg: [['me', 'Bu bidan, sejak kemarin saya pusing, terutama saat bangun tidur.'], ['them', 'Terima kasih sudah cerita. Apakah ada pandangan kabur, bengkak di wajah atau tangan, atau sakit kepala hebat?'], ['me', 'Tidak ada, hanya pusing sebentar.'], ['them', 'Baik. Coba catat kapan pusingnya muncul dan ceritakan saat kontrol. Kalau muncul tanda tadi, segera telepon 119.']],
    baby: [['me', 'Bu bidan, si kecil rewel sejak kemarin sore.'], ['them', 'Terima kasih sudah cerita. Apakah si kecil demam, sulit bernapas, atau tidak mau menyusu?'], ['me', 'Tidak, masih mau menyusu.'], ['them', 'Baik. Catat kapan rewelnya muncul. Kalau ada tanda tadi, segera telepon 119.']],
    plan: [['me', 'Bu bidan, apa saja yang perlu dicek sebelum program hamil?'], ['them', 'Pertanyaan yang penting. Kita bisa mulai dari riwayat kesehatanmu. Boleh ceritakan sedikit?']]
  };
  const bidanCtx = () => P.S.lossActive ? 'loss' : `${P.S.stage}-${P.S.returning ? 'r' : 'n'}`;
  const bidanInit = () => {
    const ctx = bidanCtx();
    if (P.S.bidan && P._bidanCtx === ctx) return;
    P._bidanCtx = ctx;
    if (P.S.lossActive) { P.S.bidan = [{ w: 'sys', t: 'Bidan sudah tahu situasimu. Kamu tidak perlu menjelaskan apa pun.' }, { w: 'them', t: 'Halo, aku [Bidan Nama]. Aku turut berduka. Aku di sini kalau kamu ingin bicara atau bertanya soal pemulihanmu.' }]; return; }
    const seed = P.S.returning ? BIDAN_SEED[P.S.stage] || [] : [];
    P.S.bidan = seed.map(([w, t]) => ({ w, t }));
    if (seed.length) P.S.bidan.push({ w: 'sys', t: 'Bidan akan menanyakan kabarmu besok.' });
    else P.S.bidan.push({ w: 'them', t: 'Halo, aku [Bidan Nama]. Ceritakan yang kamu rasakan, keluhan kesehatan selalu kami jawab.' });
  };
  const offHours = () => { const h = parseInt(P.S.clock, 10); return h >= 22 || h < 6; };
  P.def({
    id: 'bidan', sec: 'D', n: 21, name: 'Chat bidan', tone: 'shared',
    enter: (arg) => {
      bidanInit();
      if (arg === '__summary') P.S.bidan.push({ w: 'sys', t: 'Ringkasan percakapan Tanya Peluky dikirim ke bidan.' });
      else if (arg) P.S.bidan.push({ w: 'sys', t: `Keluhan dicatat: ${arg}. Bidan akan membalas.` });
    },
    notes: 'Human midwife. New users start with a greeting, not someone else’s history; after a loss the chat opens already knowing her situation, in the calm palette. Service hours are always visible; outside them a card explains the on-call midwife, 119 and Tanya. Replies are ordered by urgency, never by plan. Danger words in her messages trigger the same red card.',
    states: [{ label: 'Di luar jam layanan (02.14)', state: (S) => { S.clock = '02.14'; } }],
    render: () => {
      bidanInit();
      const off = offHours();
      return {
        main: `<header class="hdr"><button class="ib" data-back aria-label="Kembali">${ic('back')}</button><span class="ph-img" style="width:44px;height:44px;border-radius:50%;padding:0;font-size:10px" aria-hidden="true">[Foto]</span>
          <h1 tabindex="-1" data-focus>${off ? 'Bidan jaga' : '[Bidan Nama]'}<span class="sub">${off ? 'Membalas keluhan dalam [x menit]' : 'Biasanya membalas dalam [x menit]'}</span></h1></header>
          <div class="body" style="padding-bottom:200px">
            ${off ? `<section class="card tight solid"><div class="card-row"><span class="bubble-ic">${ic('moon')}</span><div class="grow"><h2 class="t-h3">Di luar jam layanan</h2><p class="t-sec">Bidan jaga tetap menjawab keluhan. Butuh bantuan sekarang? Telepon 119.</p></div></div>
              ${btn('Telepon <span class="num">119</span>', { kind: 'danger', cls: 'btn-sm', icon: 'phone', 'data-act': 'call119', style: 'width:100%' })}${btn('Tanya Peluky', { kind: 'glass', cls: 'btn-sm', 'data-go': 'tanya', style: 'width:100%' })}</section>`
              : `<p class="sysline" style="display:flex;gap:6px;align-items:center">${ic('shieldc', 16)}Keluhan selalu dijawab · jam layanan [06.00–22.00]</p>`}
            <div class="thread" aria-live="polite">${P.S.bidan.map((m, i) => m.w === 'them' ? `<div class="msg them"><span class="who">${m.who || '[Bidan Nama]'}</span><span>${esc(m.t)}</span></div>` : renderMsg(m, i)).join('')}</div></div>`,
        bar: `<div class="inputbar"><div class="hscroll">${btn('Darurat', { kind: 'glass', cls: 'btn-sm', icon: 'phone', 'data-go': 'emergency' })}${btn('Minta konsultasi dokter', { kind: 'glass', cls: 'btn-sm', icon: 'video', 'data-go': 'konsul' })}</div>
          <form data-submit="bidanSend"><div class="fld"><label for="bd-in">Pesan untuk bidan</label><input id="bd-in" autocomplete="off" placeholder="Ceritakan yang kamu rasakan"></div><button class="send" type="submit" aria-label="Kirim">${ic('send', 22)}</button></form></div>`
      };
    },
    after: (scr) => { const s = scr.querySelector('.scroll'); if (s) s.scrollTop = s.scrollHeight; }
  });
  P.acts.bidanSend = (f) => {
    const i = f.querySelector('#bd-in'), t = i.value.trim(); i.value = ''; if (!t) return;
    const b = P.S.bidan, r = P.triage(t); b.push({ w: 'me', t });
    if (r.level === 'danger' || r.level === 'mental') b.push({ w: 'danger', level: r.level, t, resolved: true }, { w: 'sys', t: 'Pesanmu ditandai mendesak. Bidan akan membalas lebih dulu.' });
    else { b.push({ w: 'typing' }); P.later(() => { const k = b.findIndex((m) => m.w === 'typing'); if (k >= 0) b.splice(k, 1, { w: 'them', who: offHours() ? 'Bidan jaga' : '', t: 'Terima kasih, pesanmu sudah saya baca. Saya balas sebentar lagi ya.' }); P.rerender(); bottom(); }, 1300); }
    P.rerender(); bottom();
  };

  /* ======================================================================
     D22 · Konsultasi dokter
     ====================================================================== */
  const KTYPE = { obg: ['Sp.OG', '[dr. Nama, Sp.OG]'], spa: ['Sp.A', '[dr. Nama, Sp.A]'], lak: ['Konselor laktasi', '[Nama, Konselor laktasi]'] };
  const KDOCS = [['[RS A]', false, 'f'], ['[RS Ibu & Anak B]', true, 'm'], ['[RSUD C]', false, 'f']];
  const KTEST = { obg: ['dr. Ayu L., Sp.OG (contoh)', 'dr. Bima P., Sp.OG (contoh)', 'dr. Citra W., Sp.OG (contoh)'], spa: ['dr. Dian P., Sp.A (contoh)', 'dr. Eko S., Sp.A (contoh)', 'dr. Fitri H., Sp.A (contoh)'], lak: ['Gita M. (contoh)', 'Hana P. (contoh)', 'Indah S. (contoh)'] };
  const slots = () => [[1, '19.00'], [1, '20.00'], [2, '10.00'], [2, '19.30'], [3, '09.00']].map(([d, t]) => { const x = P.addDays(P.TODAY, d); return [`${d}-${t}`, `${P.DOW[x.getDay()]}, ${x.getDate()} ${P.MON[x.getMonth()]} · ${t}`]; });
  const resetK = () => { const k = P.S.konsul; k.slot = null; k.share = {}; };
  const shareOpts = () => P.S.lossActive ? [['notes', 'Catatan keluhan 7 hari terakhir'], ['recovery', 'Hasil cek pemulihan']]
    : P.S.stage === 'baby' ? [['week', 'Usia si kecil'], ['growth', 'Grafik tumbuh si kecil'], ['notes', 'Catatan keluhan 7 hari terakhir']]
    : [['week', 'Minggu kehamilan'], ['notes', 'Catatan keluhan 7 hari terakhir'], ['visits', 'Riwayat kontrol'], ['hpl', 'HPL']];
  const docName = (i) => { const k = P.S.konsul; if (P.S.testContent) return KTEST[k.type][i]; return KTYPE[k.type][1]; };
  const gender = (i) => P.S.konsul.type === 'lak' ? 'f' : KDOCS[i][2];
  P.def({
    id: 'konsul', sec: 'D', n: 22, name: 'Konsultasi dokter', tone: 'shared',
    enter: (arg) => { const k = P.S.konsul; k.done = false; if (arg && KTYPE[arg]) { k.type = arg; k.doc = null; resetK(); } },
    notes: 'Data-share ticks start empty and reset whenever she switches doctor or consult type. Share options follow her situation: after a loss no pregnancy fields appear; with a baby the options are about the baby. “Dokter perempuan” filter. Partner badge is informational only; no paid priority. Price shows “Ditanggung” when covered.',
    states: [{ label: 'Terjadwal', state: (S) => { S.konsul.doc = 0; S.konsul.slot = slots()[0][0]; S.konsul.done = true; }, noEnter: true }],
    render: () => {
      const k = P.S.konsul, sl = slots(), slotTxt = (sl.find((x) => x[0] === k.slot) || [])[1];
      if (k.done) {
        return {
          main: hdr({ title: 'Konsultasi dokter' }) + `<div class="body rise"><section class="card glow" style="align-items:center;text-align:center;padding:28px 18px">
            <span class="bubble-ic" style="width:64px;height:64px;border-radius:24px">${ic('checkc', 32)}</span><h2 class="t-h2">Konsultasi terjadwal</h2>
            <p class="t-body num">${slotTxt} · ${docName(k.doc)}</p><p class="t-sec">${k.mode === 'video' ? 'Video' : 'Chat'} · ${KDOCS[k.doc][0]} · ${P.S.covered ? 'Ditanggung' : '[Rp …]'}</p></section>
            <p class="t-body" style="text-align:center">Kami ingatkan 1 jam sebelumnya.</p></div>`,
          dock: btn('Selesai', { 'data-act': 'openHomeKeep' })
        };
      }
      const list = KDOCS.map((d, i) => i).filter((i) => !k.female || gender(i) === 'f');
      return {
        main: hdr({ title: 'Konsultasi dokter', right: btn('Darurat', { kind: 'text', cls: 'btn-sm ink', icon: 'phone', 'data-go': 'emergency', style: 'padding:0 6px' }) }) + `<div class="body rise">
          ${seg('Jenis tenaga kesehatan', Object.entries(KTYPE).map(([v, a]) => [v, a[0]]), k.type, 'kType')}
          ${k.type !== 'lak' ? `<div class="chips">${chip('Dokter perempuan', { pressed: !!k.female, 'data-act': 'kFemale' })}</div>` : ''}
          ${list.map((i) => {
            const [h, m] = KDOCS[i], sel = k.doc === i;
            return `<article class="card ${sel ? 'glow' : ''}"><div class="card-row"><span class="ph-img" style="width:52px;height:52px;border-radius:18px;padding:0;font-size:10px" aria-hidden="true">[Foto]</span>
              <div class="grow"><h2 class="t-h3">${docName(i)}</h2><p class="t-sec">${h} · ${gender(i) === 'f' ? 'perempuan' : 'laki-laki'}</p>${m ? `<span class="badge mitra" style="margin-top:4px">${ic('hospital', 13)}Mitra Peluky</span>` : ''}</div>
              <div style="text-align:right">${P.S.covered ? `<span class="badge cover">${ic('shieldc', 13)}Ditanggung</span>` : '<b class="num">[Rp …]</b>'}</div></div>
              ${btn(sel ? 'Dipilih' : 'Pilih', { kind: sel ? 'primary' : 'glass', cls: 'btn-sm', icon: sel ? 'check' : '', 'data-act': 'kDoc', 'data-v': i, 'aria-pressed': sel ? 'true' : 'false', style: 'width:100%' })}
              ${sel ? `<div class="field"><span class="lbl">Cara konsultasi</span>${seg('Cara konsultasi', [['chat', 'Chat'], ['video', 'Video']], k.mode, 'kMode')}</div>
                <div class="field"><span class="lbl" id="k-sl">Waktu</span><div class="chips" role="radiogroup" aria-labelledby="k-sl">${sl.map(([v, t]) => chip(`<span class="num">${t}</span>`, { role: 'radio', pressed: k.slot === v, 'data-act': 'kSlot', 'data-v': v, 'aria-label': t })).join('')}</div></div>
                <div><p class="lbl">Data yang dibagikan</p><p class="t-sec">Kosong lagi tiap ganti dokter.</p>
                  ${shareOpts().map(([x, t]) => P.tick(`k-${x}`, t, !!k.share[x], 'kShare', x)).join('')}</div>` : ''}
            </article>`;
          }).join('')}
        </div>`,
        dock: `${btn('Jadwalkan konsultasi', { 'data-act': 'kBook', disabled: k.doc === null || !k.slot })}<p class="t-sec">${k.doc === null ? 'Pilih dokter dan waktu dulu' : !k.slot ? 'Pilih waktu konsultasi' : `${slotTxt} · ${P.S.covered ? 'Ditanggung' : '[Rp …]'}`}</p>`
      };
    }
  });
  P.acts.kType = (el) => { const k = P.S.konsul; if (k.type !== el.dataset.v) { k.type = el.dataset.v; k.doc = null; resetK(); } P.rerender(); };
  P.acts.kFemale = () => { const k = P.S.konsul; k.female = !k.female; if (k.doc !== null && k.female && gender(k.doc) !== 'f') { k.doc = null; resetK(); } P.rerender(); };
  P.acts.kDoc = (el) => { const k = P.S.konsul, i = +el.dataset.v; if (k.doc !== i) { const had = k.doc !== null; k.doc = i; resetK(); P.rerender(); if (had) P.toast('Pilihan berbagi data dikosongkan', { icon: 'refresh' }); } };
  P.acts.kMode = (el) => { P.S.konsul.mode = el.dataset.v; P.rerender(); };
  P.acts.kSlot = (el) => { P.S.konsul.slot = el.dataset.v; P.rerender(); };
  P.acts.kShare = (el) => { P.S.konsul.share[el.dataset.v] = el.checked; };
  P.acts.kBook = () => { P.S.konsul.done = true; P.rerender(); P.el().querySelector('.scroll').scrollTop = 0; };

  /* ======================================================================
     D23 · Bantuan darurat (calm)
     ====================================================================== */
  const emTabs = () => P.S.lossActive ? (P.S.lossKind === 'baby' ? [['nifas', 'Untukmu']] : [['loss', 'Setelah keguguran']]) : [['hamil', 'Hamil'], ['nifas', 'Nifas'], ['bayi', 'Bayi']];
  P.def({
    id: 'emergency', sec: 'D', n: 23, name: 'Bantuan darurat', tone: 'calm',
    enter: () => { const t = emTabs(); if (!P.S.emergTab || !t.some(([k]) => k === P.S.emergTab)) P.S.emergTab = P.S.lossActive ? t[0][0] : P.S.stage === 'baby' ? 'bayi' : 'hamil'; },
    notes: 'Calm slate palette, one faint orb, no motion. “Telepon 119 (ambulans)” is the first and largest element, and a second 119 button stays fixed in the bottom dock, within thumb reach while she reads. Nearest hospital means nearest obstetric 24-hour ER (PONEK), not just nearest. After a loss the sign list is “Setelah keguguran”, never pregnancy signs.',
    render: () => {
      const tabs = emTabs(), t = P.S.emergTab && tabs.some(([k]) => k === P.S.emergTab) ? P.S.emergTab : tabs[0][0];
      return {
        main: hdr({ title: 'Bantuan darurat', sub: 'Selalu gratis' }) + `<div class="body" style="gap:14px">
          ${btn('Telepon <span class="num">119</span> (ambulans)', { kind: 'danger', icon: 'phone', cls: 'call-119', 'data-act': 'call119', style: 'min-height:84px;font-size:20px;border-radius:28px' })}
          <button type="button" class="card tight" data-act="callDoc"><span class="card-row"><span class="bubble-ic slate">${ic('phone')}</span><span class="grow"><span class="t-h3" style="display:block">Telepon dokter saya</span><span class="t-sec">[dr. Nama, Sp.OG] · [nomor]</span></span></span></button>
          <button type="button" class="card tight" data-act="directions"><span class="card-row"><span class="bubble-ic slate">${ic('nav')}</span><span class="grow"><span class="t-h3" style="display:block">IGD kebidanan terdekat</span><span class="t-sec">[RS A] · IGD 24 jam (PONEK) · [x menit]</span></span></span></button>
          <button type="button" class="card tight" data-act="notifyPartner"><span class="card-row"><span class="bubble-ic slate">${ic('users')}</span><span class="grow"><span class="t-h3" style="display:block">Kabari pasangan</span><span class="t-sec">Kirim pesan bahwa kamu butuh bantuan</span></span></span></button>
          <h2 class="t-h3" style="margin-top:8px">Tanda bahaya</h2>
          ${tabs.length > 1 ? seg('Tanda bahaya untuk', tabs, t, 'emTab') : ''}
          <section class="card"><ul class="rows" style="list-style:none;margin:0;padding:0">${P.DANGER[t].map((d) => `<li class="row static" style="min-height:48px">${ic('alert', 20)}<span class="grow" style="font-weight:600">${d}</span></li>`).join('')}</ul>
            <p class="t-sec">Mengalami salah satunya? Telepon 119 dengan tombol di bawah, atau segera ke IGD.</p></section>
          ${t === 'nifas' || t === 'loss' ? P.supportLine() : ''}
        </div>`,
        dock: btn('Telepon <span class="num">119</span> (ambulans)', { kind: 'danger', icon: 'phone', 'data-act': 'call119' })
      };
    }
  });
  P.acts.emTab = (el) => { P.S.emergTab = el.dataset.v; P.rerender(); };

  /* ======================================================================
     D24 · Dukungan kehilangan (calm)
     ====================================================================== */
  const STOPS = { preg: ['Pengingat dan panduan kehamilan', 'Kabar kehamilan ke pasangan', 'Promosi dan penawaran'], baby: ['Pengingat imunisasi dan tumbuh kembang', 'Kabar si kecil ke pasangan', 'Promosi dan penawaran'] };
  const call119Line = () => `<section class="card tight"><p class="t-body"><b>Perdarahan banyak, nyeri hebat, atau demam?</b></p>${btn('Telepon <span class="num">119</span>', { kind: 'danger', icon: 'phone', cls: 'btn-sm', 'data-act': 'call119', style: 'width:100%' })}</section>`;
  P.def({
    id: 'loss', sec: 'D', n: 24, name: 'Dukungan kehilangan', tone: 'calm',
    enter: (arg) => { if (!P.S.loss.stopped && (arg === 'baby' || arg === 'preg')) P.S.lossKind = arg; P.S.loss.phase = P.S.loss.stopped ? 'after' : 'confirm'; },
    notes: 'Covers pregnancy loss and the loss of a baby (from Akun). One gentle confirmation stops reminders, partner updates and promotions at once; undo is inline, no toast over the 119 button. A quiet 119 line is on the confirm screen too. Every screen reached from here (Bidan, Konsultasi, Emergency, Cek pemulihan) stays calm and drops pregnancy content. Back and close go to Akun.',
    states: [{ label: 'Setelah konfirmasi', state: (S) => { S.loss.stopped = true; } }],
    render: () => {
      const l = P.S.loss, stops = STOPS[P.S.lossKind] || STOPS.preg;
      if (l.phase === 'confirm') {
        return {
          main: hdr({ title: 'Dukungan untukmu', backTo: 'account' }) + `<div class="body">
            <h2 class="t-hero" style="margin-top:8px">Kami turut berduka</h2>
            <p class="t-body">Kamu tidak perlu menjelaskan apa pun.</p>
            <section class="card"><h3 class="t-h3">Yang akan kami hentikan</h3>
              <ul style="margin:0;padding:0;list-style:none" class="rows">${stops.map((t) => `<li class="row static">${ic('bell', 20)}<span class="grow">${t}</span></li>`).join('')}</ul>
              <p class="t-sec">Bisa dibatalkan kapan saja.</p></section>
            ${call119Line()}
          </div>`,
          dock: `${btn('Ya, hentikan sekarang', { 'data-act': 'lossStop' })}${btn('Nanti saja', { kind: 'text', cls: 'center ink', 'data-go': 'account' })}`
        };
      }
      return {
        main: hdr({ title: 'Dukungan untukmu', backTo: 'account' }) + `<div class="body">
          <section class="card" aria-live="polite"><div class="card-row"><span class="bubble-ic slate">${ic('checkc')}</span><h2 class="t-h3 grow">Sudah kami hentikan</h2></div>
            <ul style="margin:0;padding:0;list-style:none" class="rows">${stops.map((t) => `<li class="row static">${ic('check', 20)}<span class="grow">${t}</span></li>`).join('')}</ul>
            ${btn('Urungkan', { kind: 'text', icon: 'undo', cls: 'btn-sm ink', 'data-act': 'lossUndo', style: 'align-self:flex-start' })}</section>
          ${call119Line()}
          ${btn('Hubungi dokter', { kind: 'glass', icon: 'phone', 'data-act': 'callDoc' })}
          <section class="card"><h2 class="t-h3">Dukungan untuk hatimu</h2>
            <div class="rows">
              <button type="button" class="row" data-go="bidan">${ic('chat')}<span class="grow"><span class="t">Bicara dengan bidan</span><br><span class="t-sec">Bidan sudah tahu situasimu</span></span>${ic('chev')}</button>
              <button type="button" class="row" data-act="callSupport">${ic('heart')}<span class="grow"><span class="t">Konselor profesional</span><br><span class="t-sec">[Layanan dukungan]</span></span>${ic('chev')}</button>
              <button type="button" class="row" data-act="callSupport">${ic('users')}<span class="grow"><span class="t">Kelompok dukungan</span><br><span class="t-sec">[Layanan dukungan]</span></span>${ic('chev')}</button>
              <button type="button" class="row" data-act="lossRecovery">${ic('list')}<span class="grow"><span class="t">Cek pemulihan</span><br><span class="t-sec">Enam pertanyaan singkat</span></span>${ic('chev')}</button>
            </div></section>
        </div>`,
        dock: btn('Tutup', { 'data-go': 'account' })
      };
    }
  });
  P.acts.lossStop = () => {
    const s = P.S; s.loss.stopped = true; s.loss.phase = 'after'; s.lossActive = true; s.prevStage = s.stage; s.stage = 'none'; s.followup.preg = null; s.emergTab = null;
    P.rerender(); // inline confirmation + undo; no toast on calm screens
  };
  P.acts.lossUndo = () => {
    const s = P.S; s.loss.stopped = false; s.lossActive = false; if (s.prevStage) s.stage = s.prevStage; s.loss.phase = 'confirm'; s.emergTab = null;
    P.rerender();
  };
  P.acts.lossRecovery = () => { P.S.recoveryCalm = true; P.go('recovery'); };
})();
