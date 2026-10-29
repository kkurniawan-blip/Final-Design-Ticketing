/* Sections C (Pregnancy, berry) and D (Safety net). */
(function () {
  'use strict';
  const { ic, esc, btn, chip, sw, field, seg, src, sos, hdr } = P;

  /* ======================================================================
     Shared safety pieces: danger panel, catat sheets
     ====================================================================== */
  P.DANGER = {
    hamil: ['Perdarahan / flek banyak', 'Nyeri perut hebat', 'Bengkak wajah/tangan mendadak', 'Gerakan janin berkurang', 'Sakit kepala hebat / pandangan kabur', 'Keluar air ketuban', 'Demam tinggi', 'Sesak napas', 'Kejang / pingsan'],
    nifas: ['Perdarahan banyak', 'Demam', 'Luka bernanah atau berbau', 'Nyeri perut hebat', 'Sakit kepala hebat / pandangan kabur', 'Sesak napas', 'Kejang / pingsan', 'Sedih berkepanjangan', 'Pikiran menyakiti diri'],
    bayi: ['Demam tinggi', 'Sulit bernapas', 'Tidak mau menyusu', 'Kejang', 'Lemas']
  };
  const MENTAL = /sedih|menyakiti|bunuh diri|ingin mati|putus asa/i;
  P.supportLine = () => `<div class="support-line"><span class="bubble-ic" style="background:#fff;border:1px solid var(--line);color:var(--ink)">${ic('heart')}</span><div class="grow"><b>[Layanan dukungan]</b><p class="t-sec">Bicara dengan konselor terlatih. [Jam layanan]</p></div>${btn('Hubungi', { kind: 'glass', cls: 'btn-sm', 'data-act': 'callSupport' })}</div>`;
  P.sheets.danger = (sign) => {
    const mental = MENTAL.test(sign || '');
    return {
      danger: true,
      body: `<div class="danger-top"><span class="bubble-ic red">${ic('alert', 28)}</span><h2 class="t-h2" id="sh-t" tabindex="-1">Segera cari bantuan</h2></div>
        <p class="t-body" id="sh-d"><b>${esc(sign)}</b> bisa jadi tanda bahaya. Jangan menunggu.</p>
        ${btn('Telepon <span class="num">119</span> (ambulans)', { kind: 'danger', icon: 'phone', cls: 'call-119', 'data-act': 'call119' })}
        ${mental ? P.supportLine() : ''}
        ${btn('Telepon dokter saya', { kind: 'glass', icon: 'phone', 'data-act': 'callDoc' })}
        ${btn('Rumah sakit terdekat', { kind: 'glass', icon: 'nav', 'data-act': 'directions' })}
        ${btn('Kabari pasangan', { kind: 'glass', icon: 'users', 'data-act': 'notifyPartner' })}
        <button type="button" class="btn btn-text ink" style="align-self:center" data-act="dangerBack">Salah pilih, kembali</button>`
    };
  };
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
    const common = baby ? B_COMMON : COMMON, mod = baby ? B_MOD : MODERATE, danger = baby ? P.DANGER.bayi : P.DANGER.hamil;
    return {
      title: baby ? 'Catat hari ini' : 'Apa yang kamu rasakan?',
      body: `${baby ? `<div class="tiles">
          <button type="button" class="card tile tight" data-go="menyusui">${ic('timer', 24)}Menyusui</button>
          <button type="button" class="card tile tight" data-act="growthAddFromCatat">${ic('ruler', 24)}Ukur panjang</button></div>` : ''}
        <div class="stack"><p class="lbl">${baby ? 'Kondisi si kecil' : 'Keluhan umum'}</p><div class="chips">${common.map((t) => chip(t, { pressed: catatLogged.includes(t), 'data-act': 'catatCommon', 'data-v': t })).join('')}</div></div>
        <div class="stack"><p class="lbl">Perlu ditanyakan</p><div class="chips">${mod.map((t) => chip(t, { pressed: catatMod === t, 'data-act': 'catatMod', 'data-v': t })).join('')}</div>
          ${catatMod ? `<div class="card tight tinted" aria-live="polite"><p class="t-h3">${esc(catatMod)} sebaiknya diceritakan ke bidan</p><p class="t-sec">Bidan bisa bantu menilai perlu tidaknya diperiksa.</p>
            <div class="btn-row">${btn('Chat bidan', { cls: 'btn-sm', icon: 'chat', 'data-act': 'catatToBidan' })}${btn('Simpan saja', { kind: 'glass', cls: 'btn-sm', 'data-act': 'catatSaveMod' })}</div></div>` : ''}</div>
        <div class="stack"><p class="lbl" style="display:flex;gap:6px;align-items:center">${ic('alert', 18)}Tanda bahaya</p>
          <div class="chips">${danger.map((t) => chip(t, { cls: 'danger', icon: 'alert', 'data-sheet': 'danger', 'data-v': t })).join('')}</div></div>`
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

  /* follow-up card used on both homes */
  P.followCard = (key) => {
    const f = P.S.followup[key]; if (!f) return '';
    return `<section class="card tinted" aria-labelledby="fu-t"><p class="t-h3" id="fu-t">Kemarin kamu melaporkan ${esc(f)}. Bagaimana kondisimu hari ini?</p>
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
    notes: 'Top: yesterday’s follow-up with three outcomes (Masih sama → Bidan, Memburuk → Emergency). The week ring is the one glowing hero. “Catat” opens symptom chips in three tiers: common save with an undo toast; moderate offer Chat bidan; danger signs open the red panel. Menu holds “Bayi sudah lahir?” and “Kehamilan saya berakhir”.',
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
    notes: 'Camera is a labelled placeholder. Scanning uses a transform-only sweep (static text with reduced motion). Results list each detected food with a worded confidence and “Ubah”. No calorie counts, no weight targets. Free quota shows in brackets; hidden when covered.',
    states: [{ label: 'Memindai', state: (S) => { S.nutri.phase = 'scan'; } }, { label: 'Hasil', state: (S) => { S.nutri.phase = 'result'; } }],
    leave: () => { if (P.S.nutri.phase === 'scan') P.S.nutri.phase = 'idle'; },
    render: () => {
      const n = P.S.nutri, cov = P.S.covered;
      const quota = cov ? `<span class="badge cover">${ic('shieldc', 14)}Ditanggung · scan tanpa batas</span>` : `<p class="t-sec" style="text-align:center"><b class="num" style="color:var(--ink)">[${P.S.scans} dari 3]</b> scan gratis minggu ini</p>`;
      let body = '', dock = '';
      if (n.mode === 'scan') {
        if (n.phase === 'result') {
          body = `<section class="card glow" aria-live="polite"><div class="card-row"><span class="bubble-ic">${ic('checkc')}</span><h2 class="t-h3 grow">Makanan terdeteksi</h2></div>
            <div class="rows">${n.foods.map((f, i) => `<div class="row static"><span class="grow"><span class="t">${esc(f.n)}</span><br><span class="t-sec" style="display:inline-flex;gap:4px;align-items:center">${ic(f.c === 'tinggi' ? 'checkc' : 'info', 15)}Keyakinan ${f.c}</span></span>${btn('Ubah', { kind: 'glass', cls: 'btn-sm', 'data-sheet': 'editFood', 'data-v': String(i), 'aria-label': `Ubah ${f.n}` })}</div>`).join('')}</div></section>
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
  P.acts.nsMenu = (f) => { const v = f.querySelector('#ns-menu').value.trim(); P.S.nutri.menu = v; if (!v) return; P.S.nutri.mode = 'scan'; P.S.nutri.phase = 'result'; P.S.nutri.foods = v.split(/,| dan /).map((x) => ({ n: x.trim().replace(/^\w/, (c) => c.toUpperCase()), c: 'sedang' })).filter((x) => x.n); P.rerender(); };
  P.acts.nsPick = (el) => { const f = P.S.nutri.foods, i = f.findIndex((x) => x.n === el.dataset.v); if (i >= 0) f.splice(i, 1); else f.push({ n: el.dataset.v, c: 'tinggi' }); P.rerender(); };
  P.sheets.editFood = (i) => {
    const f = P.S.nutri.foods[+i] || { n: '' };
    return { title: 'Ubah makanan', body: `${field({ id: 'ef-name', label: 'Nama makanan', value: f.n })}${btn('Simpan', { 'data-act': 'efSave', 'data-v': i })}${btn('Hapus dari daftar', { kind: 'text', cls: 'center ink', 'data-act': 'efDel', 'data-v': i })}` };
  };
  P.acts.efSave = (el) => { const v = P.el().querySelector('#ef-name').value.trim(); if (v) P.S.nutri.foods[+el.dataset.v] = { n: v, c: 'diubah' }; P.closeSheet(true); P.rerender(); };
  P.acts.efDel = (el) => { P.S.nutri.foods.splice(+el.dataset.v, 1); P.closeSheet(true); P.rerender(); };

  /* ======================================================================
     C19 · Makanan
     ====================================================================== */
  const MEALS = {
    hamil: [['Paket makan siang ibu hamil', 'Nasi, lauk, sayur, buah'], ['Paket makan malam ibu hamil', 'Lauk berkuah, sayur, buah']],
    menyusui: [['Paket ibu menyusui · siang', 'Nasi, lauk, sayur hijau'], ['Camilan ibu menyusui', 'Pilihan camilan harian']],
    mpasi: [['Menu MPASI [Usia …]', '[Tekstur sesuai usia · sumber]'], ['Menu MPASI [Usia …]', '[porsi] · [Tekstur sesuai usia · sumber]']]
  };
  P.def({
    id: 'meals', sec: 'C', n: 19, name: 'Makanan', tone: 'shared',
    enter: (arg) => { if (arg) P.S.meals.tab = arg; },
    notes: 'Optional paid service. Halal and allergy filters are chips with check marks. Vendor and price are placeholders. MPASI tab uses texture/portion placeholders pending a source. No formula products anywhere.',
    states: [{ label: 'Sheet jadwal', sheet: 'mealSched' }],
    render: () => {
      const m = P.S.meals;
      return {
        main: hdr({ title: 'Makanan', sub: 'Antar dari vendor terverifikasi' }) + `<div class="body rise">
          ${seg('Kategori menu', [['hamil', 'Hamil'], ['menyusui', 'Menyusui'], ['mpasi', 'MPASI']], m.tab, 'mealTab')}
          <div class="chips" role="group" aria-label="Filter">${[['halal', 'Halal'], ['kacang', 'Tanpa kacang'], ['seafood', 'Tanpa seafood'], ['telur', 'Tanpa telur']].map(([k, t]) => chip(t, { pressed: m.filters.includes(k), 'data-act': 'mealFilter', 'data-v': k })).join('')}</div>
          ${MEALS[m.tab].map(([t, d], i) => `<article class="card"><div class="ph-img" style="height:120px">[Foto menu]</div>
            <div class="card-row" style="align-items:flex-start"><div class="grow"><h2 class="t-h3">${t}</h2><p class="t-sec">${d}</p></div><p class="num" style="font-weight:700;margin:0">[Rp …]</p></div>
            <div class="chips" style="gap:6px"><span class="badge ink">[Vendor A]</span><span class="badge cover">${ic('shieldc', 14)}Vendor terverifikasi</span>${m.filters.includes('halal') ? `<span class="badge ink">${ic('check', 14)}Halal</span>` : ''}</div>
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
    const m = P.S.meals, item = MEALS[m.tab][+i || 0];
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
  const DANGER_RX = /(darah|perdarahan|flek banyak|kejang|pingsan|sesak|ketuban|tidak bergerak|gerakan(nya)?\s+\w*\s*berkurang|janin berkurang|demam tinggi|nyeri\s+\w*\s*hebat|sakit kepala hebat|pandangan kabur|bengkak|sulit bernapas|susah napas|tidak mau menyusu|lemas|bunuh diri|menyakiti diri|ingin mati|bernanah)/i;
  P.isDanger = (t) => DANGER_RX.test(t);
  const AI_SEED = {
    plan: ['Apa itu masa subur?', 'Masa subur adalah beberapa hari dalam siklus saat peluang hamil paling tinggi. Kalender Peluky memberi perkiraan, bukan kepastian.'],
    preg: ['Boleh minum kopi saat hamil?', 'Banyak panduan menyarankan membatasi kafein saat hamil. Batas yang tepat bisa berbeda untuk tiap orang, jadi tanyakan juga ke bidanmu.'],
    baby: ['Kapan si kecil mulai MPASI?', 'ASI eksklusif dianjurkan sampai 6 bulan, lalu MPASI dimulai. Bidan bisa bantu menyesuaikan dengan kondisi si kecil.']
  };
  const SUGG = { plan: ['Kapan sebaiknya tes kehamilan?', 'Siklusku tidak teratur'], preg: ['Apa yang dibawa saat kontrol?', 'Perut terasa kencang'], baby: ['Si kecil sering gumoh', 'Jadwal imunisasi'] };
  const aiInit = () => {
    if (P.S.ai) return;
    const k = AI_SEED[P.S.stage] ? P.S.stage : 'preg', [q, a] = AI_SEED[k];
    P.S.ai = [{ w: 'ai', t: 'Hai! Aku bisa bantu menjawab pertanyaan umum. Untuk keluhan, bidan siap membantu.' }, { w: 'me', t: q }, { w: 'ai', t: a, src: k === 'baby' ? 'PP 33/2012 · [referensi klinis]' : '[referensi klinis]' }];
  };
  const dangerCard = (t) => `<div class="danger-card" role="alert"><div class="card-row">${ic('alert', 24, 'style="color:var(--red)"')}<h3 class="t-h3 grow">Ini bisa jadi tanda bahaya</h3></div>
    <p class="t-body">Jangan menunggu jawaban chat. Segera cari bantuan.</p>
    ${btn('Telepon <span class="num">119</span> sekarang', { kind: 'danger', icon: 'phone', 'data-act': 'call119' })}
    ${MENTAL.test(t) ? P.supportLine() : ''}${btn('Bantuan darurat', { kind: 'glass', cls: 'btn-sm', 'data-go': 'emergency', style: 'width:100%' })}</div>`;
  const renderMsg = (m) => {
    if (m.w === 'me') return `<div class="msg me">${esc(m.t)}</div>`;
    if (m.w === 'typing') return `<div class="msg them typing" aria-label="Sedang mengetik"><i></i><i></i><i></i></div>`;
    if (m.w === 'danger') return dangerCard(m.t);
    if (m.w === 'sys') return `<p class="sysline">${esc(m.t)}</p>`;
    if (m.w === 'quota') return `<div class="card tight solid"><h3 class="t-h3">Kuota pertanyaan gratis habis</h3><p class="t-sec">Keluhan kesehatan tetap dijawab bidan, gratis.</p><div class="btn-row">${btn('Chat bidan', { cls: 'btn-sm', 'data-go': 'bidan' })}${btn('Lihat Premium', { kind: 'glass', cls: 'btn-sm', 'data-go': 'premium' })}</div></div>`;
    return `<div class="msg them"><span class="who">${m.who || 'Tanya Peluky'}</span><span>${esc(m.t)}</span>${m.src ? `<span style="display:flex;gap:6px;flex-wrap:wrap">${src(m.src)}${m.who ? '' : `<button type="button" class="chip sm" data-sheet="askBidan">${ic('chat', 14)}Tanya bidan</button>`}</span>` : ''}</div>`;
  };
  P.def({
    id: 'tanya', sec: 'D', n: 20, name: 'Tanya Peluky', tone: 'shared',
    enter: aiInit,
    notes: 'Answers are short, neutral, never a diagnosis; each carries a source chip and a “Tanya bidan” chip. Danger words skip the AI and show a red card with 119, even when the free quota is 0. The quota line disappears when the mother is covered.',
    states: [{ label: 'Kuota 0 + kata bahaya', state: (S) => { S.quota = 0; if (S.ai && !S.ai.some((m) => m.w === 'danger')) S.ai.push({ w: 'me', t: 'Keluar flek banyak sejak tadi' }, { w: 'danger', t: 'flek banyak' }); } }],
    render: () => {
      aiInit();
      const s = P.S, k = SUGG[s.stage] ? s.stage : 'preg';
      return {
        main: hdr({ title: 'Tanya Peluky', sub: 'Asisten AI · bukan diagnosis', right: s.covered ? `<span class="badge cover">${ic('shieldc', 14)}Ditanggung</span>` : `<span class="badge stage num" aria-label="Sisa ${s.quota} pertanyaan gratis">[${s.quota}] gratis</span>` }) + `<div class="body" style="padding-bottom:190px">
          ${!s.covered ? `<p class="t-sec" style="text-align:center">Sisa <b class="num" style="color:var(--ink)">[${s.quota}]</b> pertanyaan gratis minggu ini</p>` : ''}
          <div class="thread" id="ai-thread" aria-live="polite">${s.ai.map(renderMsg).join('')}</div></div>`,
        bar: `<div class="inputbar"><div class="hscroll">${SUGG[k].map((t) => chip(t, { cls: 'sm', 'data-act': 'aiSugg', 'data-v': t })).join('')}<button type="button" class="chip sm" data-sheet="askBidan">${ic('chat', 14)}Tanya bidan</button></div>
          <form data-submit="aiSend"><div class="fld"><label for="ai-in">Tulis pertanyaanmu</label><input id="ai-in" autocomplete="off" placeholder="Mis. boleh pijat saat hamil?"></div><button class="send" type="submit" aria-label="Kirim">${ic('send', 22)}</button></form></div>`
      };
    },
    after: (scr) => { const s = scr.querySelector('.scroll'); if (s) s.scrollTop = s.scrollHeight; }
  });
  const aiAsk = (t) => {
    const s = P.S; if (!t) return;
    s.ai.push({ w: 'me', t });
    if (P.isDanger(t)) { s.ai.push({ w: 'danger', t }); P.rerender(); P.el().querySelector('.scroll').scrollTop = 1e6; return; }
    if (!s.covered && s.quota <= 0) { s.ai.push({ w: 'quota' }); P.rerender(); P.el().querySelector('.scroll').scrollTop = 1e6; return; }
    if (!s.covered) s.quota--;
    s.ai.push({ w: 'typing' }); P.rerender(); P.el().querySelector('.scroll').scrollTop = 1e6;
    P.later(() => { const i = s.ai.findIndex((m) => m.w === 'typing'); if (i >= 0) s.ai.splice(i, 1, { w: 'ai', t: 'Pertanyaan yang baik. [Jawaban singkat dari referensi klinis yang sudah ditinjau]. Kalau ini keluhan, bidan bisa membantu.', src: '[referensi klinis]' }); P.rerender(); P.el().querySelector('.scroll').scrollTop = 1e6; }, 1200);
  };
  P.acts.aiSend = (f) => { const i = f.querySelector('#ai-in'); const t = i.value.trim(); i.value = ''; aiAsk(t); };
  P.acts.aiSugg = (el) => aiAsk(el.dataset.v);
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
    plan: [['me', 'Bu bidan, apa saja yang perlu dicek sebelum program hamil?'], ['them', 'Pertanyaan yang baik. Kita bisa mulai dari riwayat kesehatanmu. Boleh ceritakan sedikit?']],
    none: []
  };
  P.def({
    id: 'bidan', sec: 'D', n: 21, name: 'Chat bidan', tone: 'shared',
    enter: (arg) => {
      if (!P.S.bidan) { const k = BIDAN_SEED[P.S.stage] ? P.S.stage : 'none'; P.S.bidan = BIDAN_SEED[k].map(([w, t]) => ({ w, t })); if (BIDAN_SEED[k].length) P.S.bidan.push({ w: 'sys', t: 'Bidan akan menanyakan kabarmu besok.' }); }
      if (arg === '__summary') P.S.bidan.push({ w: 'sys', t: 'Ringkasan percakapan Tanya Peluky dikirim ke bidan.' });
      else if (arg) P.S.bidan.push({ w: 'sys', t: `Keluhan dicatat: ${arg}. Bidan akan membalas.` });
    },
    notes: 'Human midwife. Expected reply time is a placeholder. The system line confirms a next-day check-in. Danger words in her own messages trigger the same red card. Health complaints are always answered, whatever the plan.',
    render: () => ({
      main: `<header class="hdr"><button class="ib" data-back aria-label="Kembali">${ic('back')}</button><span class="ph-img" style="width:44px;height:44px;border-radius:50%;padding:0;font-size:10px" aria-hidden="true">[Foto]</span>
        <h1 tabindex="-1" data-focus>[Bidan Nama]<span class="sub">Biasanya membalas dalam [x menit]</span></h1></header>
        <div class="body" style="padding-bottom:190px">
          <p class="sysline" style="display:flex;gap:6px;align-items:center">${ic('shieldc', 16)}Keluhan kesehatan selalu dijawab bidan</p>
          <div class="thread" aria-live="polite">${P.S.bidan.map((m) => m.w === 'them' ? `<div class="msg them"><span class="who">[Bidan Nama]</span><span>${esc(m.t)}</span></div>` : renderMsg(m)).join('')}</div></div>`,
      bar: `<div class="inputbar"><div class="hscroll">${btn('Minta konsultasi dokter', { kind: 'glass', cls: 'btn-sm', icon: 'video', 'data-go': 'konsul', style: 'min-height:40px' })}${btn('Darurat', { kind: 'glass', cls: 'btn-sm', icon: 'phone', 'data-go': 'emergency', style: 'min-height:40px' })}</div>
        <form data-submit="bidanSend"><div class="fld"><label for="bd-in">Pesan untuk bidan</label><input id="bd-in" autocomplete="off" placeholder="Ceritakan yang kamu rasakan"></div><button class="send" type="submit" aria-label="Kirim">${ic('send', 22)}</button></form></div>`
    }),
    after: (scr) => { const s = scr.querySelector('.scroll'); if (s) s.scrollTop = s.scrollHeight; }
  });
  P.acts.bidanSend = (f) => {
    const i = f.querySelector('#bd-in'), t = i.value.trim(); i.value = ''; if (!t) return;
    const b = P.S.bidan; b.push({ w: 'me', t });
    if (P.isDanger(t)) b.push({ w: 'danger', t });
    else { b.push({ w: 'typing' }); P.later(() => { const k = b.findIndex((m) => m.w === 'typing'); if (k >= 0) b.splice(k, 1, { w: 'them', t: 'Terima kasih, pesanmu sudah saya baca. Saya balas sebentar lagi ya.' }); P.rerender(); P.el().querySelector('.scroll').scrollTop = 1e6; }, 1300); }
    P.rerender(); P.el().querySelector('.scroll').scrollTop = 1e6;
  };

  /* ======================================================================
     D22 · Konsultasi dokter
     ====================================================================== */
  const KTYPE = { obg: ['Sp.OG', '[dr. Nama, Sp.OG]'], spa: ['Sp.A', '[dr. Nama, Sp.A]'], lak: ['Konselor laktasi', '[Nama, Konselor laktasi]'] };
  const KDOCS = [['[RS A]', false], ['[RS Ibu & Anak B]', true], ['[RSUD C]', false]];
  const slots = () => [[1, '19.00'], [1, '20.00'], [2, '10.00'], [2, '19.30'], [3, '09.00']].map(([d, t]) => { const x = P.addDays(P.TODAY, d); return [`${d}-${t}`, `${P.DOW[x.getDay()]}, ${x.getDate()} ${P.MON[x.getMonth()]} · ${t}`]; });
  const resetK = () => { const k = P.S.konsul; k.slot = null; k.share = { week: false, notes: false, visits: false, hpl: false }; };
  P.def({
    id: 'konsul', sec: 'D', n: 22, name: 'Konsultasi dokter', tone: 'shared',
    enter: (arg) => { const k = P.S.konsul; k.done = false; if (arg && KTYPE[arg]) { k.type = arg; k.doc = null; resetK(); } },
    notes: 'Data-share ticks start empty and reset whenever she switches doctor or consult type (a line says so). Partner badge is informational only. Price shows “Ditanggung” when covered.',
    states: [{ label: 'Terjadwal', state: (S) => { S.konsul.doc = 1; S.konsul.slot = slots()[0][0]; S.konsul.done = true; }, noEnter: true }],
    render: () => {
      const k = P.S.konsul, [tLabel, dName] = KTYPE[k.type], sl = slots(), slotTxt = (sl.find((x) => x[0] === k.slot) || [])[1];
      if (k.done) {
        return {
          main: hdr({ title: 'Konsultasi dokter' }) + `<div class="body rise"><section class="card glow" style="align-items:center;text-align:center;padding:28px 18px">
            <span class="bubble-ic" style="width:64px;height:64px;border-radius:24px">${ic('checkc', 32)}</span><h2 class="t-h2">Konsultasi terjadwal</h2>
            <p class="t-body num">${slotTxt} · ${dName}</p><p class="t-sec">${k.mode === 'video' ? 'Video' : 'Chat'} · ${KDOCS[k.doc][0]} · ${P.S.covered ? 'Ditanggung' : '[Rp …]'}</p></section>
            <p class="t-sec" style="text-align:center">Kami ingatkan 1 jam sebelumnya.</p>${btn('Bantuan darurat', { kind: 'text', cls: 'center ink', icon: 'phone', 'data-go': 'emergency' })}</div>`,
          dock: btn('Selesai', { 'data-act': 'openHomeKeep' })
        };
      }
      return {
        main: hdr({ title: 'Konsultasi dokter', right: btn('Darurat', { kind: 'text', cls: 'btn-sm ink', icon: 'phone', 'data-go': 'emergency', style: 'padding:0 6px' }) }) + `<div class="body rise">
          ${seg('Jenis tenaga kesehatan', Object.entries(KTYPE).map(([v, a]) => [v, a[0]]), k.type, 'kType')}
          ${KDOCS.map(([h, m], i) => {
            const sel = k.doc === i;
            return `<article class="card ${sel ? 'glow' : ''}"><div class="card-row"><span class="ph-img" style="width:52px;height:52px;border-radius:18px;padding:0;font-size:10px" aria-hidden="true">[Foto]</span>
              <div class="grow"><h2 class="t-h3">${dName}</h2><p class="t-sec">${h}</p>${m ? `<span class="badge mitra" style="margin-top:4px">${ic('heart', 13)}Mitra Peluky</span>` : ''}</div>
              <div style="text-align:right">${P.S.covered ? `<span class="badge cover">${ic('shieldc', 13)}Ditanggung</span>` : '<b class="num">[Rp …]</b>'}</div></div>
              ${btn(sel ? 'Dipilih' : 'Pilih', { kind: sel ? 'primary' : 'glass', cls: 'btn-sm', icon: sel ? 'check' : '', 'data-act': 'kDoc', 'data-v': i, 'aria-pressed': sel ? 'true' : 'false', style: 'width:100%' })}
              ${sel ? `<div class="field"><span class="lbl">Cara konsultasi</span>${seg('Cara konsultasi', [['chat', 'Chat'], ['video', 'Video']], k.mode, 'kMode')}</div>
                <div class="field"><span class="lbl" id="k-sl">Waktu</span><div class="chips" role="radiogroup" aria-labelledby="k-sl">${sl.map(([v, t]) => chip(`<span class="num">${t}</span>`, { role: 'radio', pressed: k.slot === v, 'data-act': 'kSlot', 'data-v': v, 'aria-label': t })).join('')}</div></div>
                <div><p class="lbl">Data yang dibagikan ke ${k.type === 'lak' ? 'konselor' : 'dokter'}</p><p class="t-sec">Diatur ulang saat ganti dokter atau jenis konsultasi.</p>
                  ${[['week', P.S.stage === 'baby' ? 'Usia si kecil' : 'Minggu kehamilan'], ['notes', 'Catatan keluhan 7 hari terakhir'], ['visits', 'Riwayat kontrol'], ['hpl', 'HPL']].map(([x, t]) => P.tick(`k-${x}`, t, k.share[x], 'kShare', x)).join('')}</div>` : ''}
            </article>`;
          }).join('')}
        </div>`,
        dock: `${btn('Jadwalkan konsultasi', { 'data-act': 'kBook', disabled: k.doc === null || !k.slot })}<p class="t-sec">${k.doc === null ? 'Pilih dokter dan waktu dulu' : !k.slot ? 'Pilih waktu konsultasi' : `${slotTxt} · ${P.S.covered ? 'Ditanggung' : '[Rp …]'}`}</p>`
      };
    }
  });
  P.acts.kType = (el) => { const k = P.S.konsul; if (k.type !== el.dataset.v) { k.type = el.dataset.v; k.doc = null; resetK(); } P.rerender(); };
  P.acts.kDoc = (el) => { const k = P.S.konsul, i = +el.dataset.v; if (k.doc !== i) { const had = k.doc !== null; k.doc = i; resetK(); P.rerender(); if (had) P.toast('Pilihan berbagi data diatur ulang', { icon: 'refresh' }); } };
  P.acts.kMode = (el) => { P.S.konsul.mode = el.dataset.v; P.rerender(); };
  P.acts.kSlot = (el) => { P.S.konsul.slot = el.dataset.v; P.rerender(); };
  P.acts.kShare = (el) => { P.S.konsul.share[el.dataset.v] = el.checked; };
  P.acts.kBook = () => { P.S.konsul.done = true; P.rerender(); P.el().querySelector('.scroll').scrollTop = 0; P.toast('Konsultasi terjadwal'); };

  /* ======================================================================
     D23 · Bantuan darurat (calm)
     ====================================================================== */
  P.def({
    id: 'emergency', sec: 'D', n: 23, name: 'Bantuan darurat', tone: 'calm',
    enter: () => { if (!P.S.emergTab) P.S.emergTab = P.S.stage === 'baby' ? 'bayi' : 'hamil'; },
    notes: 'Calm slate palette, one faint orb, no motion, no illustration. “Telepon 119 (ambulans)” is the first and largest element and the only red. Doctor and nearest hospital follow. Danger-sign tabs help her decide, they never gate the call button.',
    render: () => {
      const t = P.S.emergTab || 'hamil';
      return {
        main: hdr({ title: 'Bantuan darurat', sub: 'Selalu gratis' }) + `<div class="body" style="gap:14px">
          ${btn('Telepon <span class="num">119</span> (ambulans)', { kind: 'danger', icon: 'phone', cls: 'call-119', 'data-act': 'call119', style: 'min-height:84px;font-size:20px;border-radius:28px' })}
          <button type="button" class="card tight" data-act="callDoc"><span class="card-row"><span class="bubble-ic slate">${ic('phone')}</span><span class="grow"><span class="t-h3" style="display:block">Telepon dokter saya</span><span class="t-sec">[dr. Nama, Sp.OG] · [nomor]</span></span></span></button>
          <button type="button" class="card tight" data-act="directions"><span class="card-row"><span class="bubble-ic slate">${ic('nav')}</span><span class="grow"><span class="t-h3" style="display:block">Rumah sakit terdekat</span><span class="t-sec">[RS A] · [x km] · petunjuk arah</span></span></span></button>
          <button type="button" class="card tight" data-act="notifyPartner"><span class="card-row"><span class="bubble-ic slate">${ic('users')}</span><span class="grow"><span class="t-h3" style="display:block">Kabari pasangan</span><span class="t-sec">Kirim pesan bahwa kamu butuh bantuan</span></span></span></button>
          <h2 class="t-h3" style="margin-top:8px">Tanda bahaya</h2>
          ${seg('Tanda bahaya untuk', [['hamil', 'Hamil'], ['nifas', 'Nifas'], ['bayi', 'Bayi']], t, 'emTab')}
          <section class="card" role="tabpanel"><ul class="rows" style="list-style:none;margin:0;padding:0">${P.DANGER[t].map((d) => `<li class="row static" style="min-height:48px">${ic('alert', 20)}<span class="grow" style="font-weight:600">${d}</span></li>`).join('')}</ul>
            <p class="t-sec">Mengalami salah satunya? Telepon 119 atau segera ke IGD.</p></section>
          ${t === 'nifas' ? P.supportLine() : ''}
        </div>`
      };
    }
  });
  P.acts.emTab = (el) => { P.S.emergTab = el.dataset.v; P.rerender(); };

  /* ======================================================================
     D24 · Dukungan kehilangan (calm)
     ====================================================================== */
  P.def({
    id: 'loss', sec: 'D', n: 24, name: 'Dukungan kehilangan', tone: 'calm',
    enter: () => { P.S.loss.phase = P.S.loss.stopped ? 'after' : 'confirm'; },
    notes: 'One gentle confirmation stops pregnancy reminders, partner updates and promotions at once, with undo. No links back to pregnancy screens: back and close both go to Akun. Inline 119 for physical warning signs. Calm palette, no motion.',
    states: [{ label: 'Setelah konfirmasi', state: (S) => { S.loss.stopped = true; } }],
    render: () => {
      const l = P.S.loss;
      if (l.phase === 'confirm') {
        return {
          main: hdr({ title: 'Dukungan untukmu', backTo: 'account' }) + `<div class="body">
            <h2 class="t-hero" style="margin-top:8px">Kami turut berduka</h2>
            <p class="t-body">Kamu tidak perlu menjelaskan apa pun. Kami bisa menghentikan semua hal tentang kehamilan sekarang.</p>
            <section class="card"><h3 class="t-h3">Yang akan kami hentikan</h3>
              <ul style="margin:0;padding:0;list-style:none" class="rows">${['Pengingat dan panduan kehamilan', 'Kabar kehamilan ke pasangan', 'Promosi dan penawaran'].map((t) => `<li class="row static">${ic('bell', 20)}<span class="grow">${t}</span></li>`).join('')}</ul>
              <p class="t-sec">Bisa dibatalkan kapan saja.</p></section>
          </div>`,
          dock: `${btn('Ya, hentikan sekarang', { 'data-act': 'lossStop' })}${btn('Nanti saja', { kind: 'text', cls: 'center ink', 'data-go': 'account' })}`
        };
      }
      return {
        main: hdr({ title: 'Dukungan untukmu', backTo: 'account' }) + `<div class="body">
          <section class="card"><div class="card-row"><span class="bubble-ic slate">${ic('checkc')}</span><h2 class="t-h3 grow">Sudah kami hentikan</h2></div>
            <ul style="margin:0;padding:0;list-style:none" class="rows">${['Pengingat dan panduan kehamilan', 'Kabar kehamilan ke pasangan', 'Promosi dan penawaran'].map((t) => `<li class="row static">${ic('check', 20)}<span class="grow">${t}</span></li>`).join('')}</ul>
            ${btn('Urungkan', { kind: 'text', icon: 'undo', cls: 'btn-sm ink', 'data-act': 'lossUndo', style: 'align-self:flex-start' })}</section>
          <section class="card"><p class="t-body"><b>Perdarahan banyak, nyeri hebat, atau demam?</b></p>
            ${btn('Telepon <span class="num">119</span>', { kind: 'danger', icon: 'phone', 'data-act': 'call119' })}
            ${btn('Hubungi dokter', { kind: 'glass', icon: 'phone', 'data-act': 'callDoc' })}</section>
          <section class="card"><h2 class="t-h3">Dukungan untuk hatimu</h2>
            <div class="rows">
              <button type="button" class="row" data-go="bidan">${ic('chat')}<span class="grow"><span class="t">Bicara dengan bidan</span><br><span class="t-sec">Gratis, kapan pun kamu siap</span></span>${ic('chev')}</button>
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
    const s = P.S; s.loss.stopped = true; s.loss.phase = 'after'; s.lossActive = true; s.prevStage = s.stage; s.stage = 'none'; s.followup.preg = null;
    P.rerender(); P.toast('Pengingat, kabar ke pasangan, dan promosi dihentikan', { undo: () => P.acts.lossUndo(true) });
  };
  P.acts.lossUndo = (silent) => {
    const s = P.S; s.loss.stopped = false; s.lossActive = false; if (s.prevStage) s.stage = s.prevStage; s.loss.phase = 'confirm';
    P.rerender(); if (silent !== true) P.toast('Dibatalkan. Semua kembali seperti sebelumnya.');
  };
  P.acts.lossRecovery = () => { P.S.recoveryCalm = true; P.go('recovery'); };
})();
