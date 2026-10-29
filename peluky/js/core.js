/* Peluky prototype — core runtime: state, icons, components, router, sheets, toasts.
   Every screen module registers itself with P.def({...}). */
(function () {
  'use strict';
  const P = (window.P = {});
  P.acts = {}; P.ins = {}; P.sheets = {};

  /* ------------------------------------------------------------------ dates */
  // Fixed "today" so the prototype's weeks, calendar and ages stay consistent.
  P.TODAY = new Date(2026, 9, 29);
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const MONL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const DOW = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  P.MON = MON; P.MONL = MONL; P.DOW = DOW;
  P.parse = (s) => { if (!s) return null; const [y, m, d] = s.split('-').map(Number); if (!y || !m || !d) return null; return new Date(y, m - 1, d); };
  P.iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  P.addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  P.diffDays = (a, b) => Math.round((b - a) / 864e5);
  P.fmt = (d, long) => d ? `${d.getDate()} ${long ? MONL[d.getMonth()] : MON[d.getMonth()]} ${d.getFullYear()}` : '';
  P.fmtShort = (d) => `${DOW[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]}`;

  /* ------------------------------------------------------------------ escape */
  P.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ------------------------------------------------------------------ icons (thin line, 1.7 stroke) */
  const I = {
    back: 'M15 5l-7 7 7 7', chev: 'M9 5l7 7-7 7', down: 'M6 9l6 6 6-6', close: 'M6 6l12 12M18 6L6 18', plus: 'M12 5v14M5 12h14', minus: 'M5 12h14',
    home: 'M4 11l8-7 8 7v8.2a.8.8 0 0 1-.8.8H15v-6H9v6H4.8a.8.8 0 0 1-.8-.8z',
    coins: 'M12 4c3.9 0 7 1.3 7 3s-3.1 3-7 3-7-1.3-7-3 3.1-3 7-3zM5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5',
    hospital: 'M4 20V8.8a.8.8 0 0 1 .8-.8H9V4h6v4h4.2a.8.8 0 0 1 .8.8V20M3 20h18M12 9.5v4M10 11.5h4M10 20v-3h4v3',
    chat: 'M5 5h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-8l-4.5 3.2V17H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
    sparkle: 'M11 3.5l1.9 5.1L18 10.5l-5.1 1.9L11 17.5l-1.9-5.1L4 10.5l5.1-1.9zM18.5 15l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z',
    calendar: 'M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM4 10h16M8 4v4M16 4v4',
    check: 'M5 12.5l4.5 4.5L19 7.5', checkc: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12.3l2.8 2.8L16.2 9.5',
    phone: 'M6.6 4h2.9l1.5 4-2 1.4a10.5 10.5 0 0 0 5.6 5.6l1.4-2 4 1.5v2.9a1.8 1.8 0 0 1-1.9 1.8A15.6 15.6 0 0 1 4.8 5.9 1.8 1.8 0 0 1 6.6 4z',
    pin: 'M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11zM12 12.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8z',
    nav: 'M12 3l7.5 18-7.5-4.2L4.5 21z',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20c1.4-3.4 4.3-5 7.5-5s6.1 1.6 7.5 5',
    users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 19.5c1.1-3 3.6-4.5 6.5-4.5s5.4 1.5 6.5 4.5M16 4.3a3.5 3.5 0 0 1 0 6.4M17.5 15.2c1.9.5 3.3 1.9 4 4.3',
    heart: 'M12 20s-7.5-4.6-7.5-10.4A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z',
    shield: 'M12 3l7 3v5.5c0 4.6-3 7.9-7 9.5-4-1.6-7-4.9-7-9.5V6z', shieldc: 'M12 3l7 3v5.5c0 4.6-3 7.9-7 9.5-4-1.6-7-4.9-7-9.5V6zM9 12l2.2 2.2L15.5 10',
    lock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
    bell: 'M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0',
    camera: 'M4 8h3l2-3h6l2 3h3v11H4zM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
    scan: 'M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16',
    utensils: 'M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 1.2-3 3.7-3 7.5h3V21',
    leaf: 'M5 19c0-8.3 5.2-13.4 14-14 0 9.2-5.3 14-13.3 14zM5 19l7-7',
    baby: 'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM9.5 12.5h.01M14.5 12.5h.01M10 16c1.2.8 2.8.8 4 0M12 5c0-1.4.9-2 2-2',
    ruler: 'M3.5 16.5L16.5 3.5l4 4-13 13zM7.5 12.5l2 2M10.5 9.5l2 2M13.5 6.5l2 2',
    chart: 'M4 4v16h16M7.5 15l3.5-4 3 2.5 5-6.5',
    syringe: 'M14.5 3.5l6 6M17.5 6.5l-9 9-3.5 1 1-3.5 9-9M11.5 9.5l3 3M3.5 20.5l2.5-2.5',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2',
    info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5.5M12 7.8h.01',
    alert: 'M12 4l9 16H3zM12 10v4.5M12 17.2h.01', alertc: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5v5.5M12 16.3h.01',
    search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
    filter: 'M4 7h9M17 7h3M4 17h4M12 17h8M15 5v4M10 15v4',
    copy: 'M8.5 8.5h11v11h-11zM5 15.5V4.5h11',
    share: 'M12 15V3.5M8 7.5l4-4 4 4M5 12v8h14v-8',
    eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    more: 'M5.5 12h.01M12 12h.01M18.5 12h.01',
    arrow: 'M5 12h14M13 6l6 6-6 6',
    mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
    globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18',
    device: 'M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2',
    msg: 'M12 20.5a8.5 8.5 0 1 0-7.4-4.3L3.5 20.5l4.3-1.1a8.5 8.5 0 0 0 4.2 1.1zM9 10.5c.5 2 2.2 3.8 4.5 4.5l1.3-1.3',
    send: 'M4 12l16-8-6.5 16-2.8-6.8z',
    video: 'M3 7h12v10H3zM15 10.5l6-3.5v10l-6-3.5',
    play: 'M8 5l11 7-11 7z', pause: 'M8.5 5v14M15.5 5v14',
    undo: 'M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3',
    logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
    card: 'M3 6h18v12H3zM3 10h18M7 14.5h3',
    building: 'M5 21V4h10v17M15 9h4v12M3 21h18M8 8h4M8 12h4M8 16h4',
    hash: 'M5 9h14M5 15h14M10 4l-2 16M16 4l-2 16',
    bag: 'M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2',
    doc: 'M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6',
    car: 'M5 16l1.5-5a2 2 0 0 1 1.9-1.5h7.2a2 2 0 0 1 1.9 1.5L19 16M4 16h16v3H4zM7.5 19v1.5M16.5 19v1.5',
    route: 'M6 19.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 8.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 17.5h6.5a3 3 0 0 0 0-6h-5a3 3 0 0 1 0-6H16',
    moon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
    drop: 'M12 3.5s6 6.4 6 10.9a6 6 0 0 1-12 0C6 9.9 12 3.5 12 3.5z',
    thermo: 'M10 14.2V5a2 2 0 0 1 4 0v9.2a4 4 0 1 1-4 0zM12 11v6',
    band: 'M4.5 14.5l10-10 5 5-10 10zM9.5 9.5l5 5M11.2 12.8h.01M12.8 11.2h.01',
    smile: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9 10h.01M15 10h.01M8.8 14.5c1.8 1.5 4.6 1.5 6.4 0',
    zap: 'M13 3L5 14h6l-1 7 8-11h-6z',
    star: 'M12 4l2.4 5 5.6.8-4 3.9 1 5.5L12 16.6 7 19.2l1-5.5-4-3.9 5.6-.8z',
    refresh: 'M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6',
    list: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01',
    edit: 'M4 20h4L19 9l-4-4L4 16zM13 7l4 4',
    book: 'M5 4.5h10a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h10',
    inbox: 'M4 13l2.5-8h11l2.5 8v6H4zM4 13h5l1 2h4l1-2h5',
    grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14.2 3h-4l-.4 2.6a7 7 0 0 0-2 1.2l-2.4-.9-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.4-.9a7 7 0 0 0 2 1.2l.4 2.6h4l.4-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z',
    timer: 'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 9v4M10 2.5h4',
    slash: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM5.6 5.6l12.8 12.8',
    flag: 'M5 21V4M5 4h12l-2 4 2 4H5',
    link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
    sprout: 'M12 21v-8M12 13c0-4-3-6-7-6 0 4 3 6 7 6zM12 11c0-3.5 2.5-6 7-6 0 3.5-2.5 6-7 6z'
  };
  P.ic = (name, size = 22, extra = '') => {
    const d = I[name] || I.info;
    const sw = name === 'more' ? 3 : 1.7;
    return `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" ${extra}><path d="${d}"/></svg>`;
  };
  P.ICONS = I;

  /* logo: two arcs (coral + berry) hugging an aqua dot */
  P.logo = (size = 32, word = true, wsize) => `<span class="logo-row"><svg width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
    <path d="M17 5.5C7.5 8.5 6 31 17 34.5" fill="none" stroke="#FF8A6B" stroke-width="4.6" stroke-linecap="round"/>
    <path d="M23 5.5C32.5 8.5 34 31 23 34.5" fill="none" stroke="#C86DD7" stroke-width="4.6" stroke-linecap="round"/>
    <circle cx="20" cy="20" r="5.6" fill="#34D6A6"/></svg>${word ? `<span class="wordmark" style="font-size:${wsize || Math.round(size * 0.72)}px">Peluky</span>` : ''}</span>`;

  /* ------------------------------------------------------------------ state */
  P.defaults = () => ({
    stage: 'preg', covered: false, quota: 3, scans: 2, name: '', askName: true, reduce: false, lossActive: false, lossKind: 'preg', prevStage: null,
    returning: true, clock: '09.41', night: 'auto', testContent: false, leaveOptIn: false,
    consent: { health: true, partner: false, hospital: false, marketing: false, ai: false },
    partner: { fertile: false, week: false, checkup: false, tasks: false, alert: false }, partnerExample: false,
    cycle: { lmp: '2026-10-20', len: 28, unknown: false, logs: { '2026-10-20': ['Haid mulai'], '2026-10-24': ['Haid selesai'], '2026-10-27': ['Kram ringan'] } },
    calMonth: [2026, 9],
    preg: { usg: '2027-04-29', lmp: '2026-07-21' },
    baby: { dob: '2026-06-29', name: '', sex: 'f', w: '', l: '', prem: 'no', ga: '', err: '' },
    followup: { preg: 'pusing', baby: 'si kecil rewel' },
    prep: { 0: true, 1: true, 2: false, 3: false, 4: false },
    signup: { step: 1, mode: 'phone', phone: '', email: '', code: '', err: '', codeErr: false, t: 30 },
    login: { step: 1, mode: 'phone', phone: '', email: '', code: '', err: '', codeErr: false, t: 30 },
    stagePick: 'preg',
    cost: { step: 1, tier: 'mid', room: 'k1', cover: ['bpjs'], reserve: true },
    hosp: { sort: 'dist', f: { dist: 'all', tier: 'all', bpjs: false, nicu: false, room: 'all' }, open: {} },
    booking: { hosp: 'b', type: 'konsul', day: 2, time: '09.00', doctor: '', pay: null, share: { name: true, phone: true, week: false, hpl: false, notes: false }, note: '' },
    request: { status: 'sent', sharing: true, cancelled: false, added: false },
    questions: ['Apakah hasil pemeriksaanku sejauh ini baik?'],
    guideWeek: 14,
    visits: [
      { k: 1, who: 'Bidan', state: 'done', date: '2026-08-18' },
      { k: 2, who: 'Dokter + USG', state: 'done', date: '2026-09-22' },
      { k: 3, who: 'Bidan', state: 'miss', date: '2026-10-20' },
      { k: 4, who: 'Bidan', state: 'next', date: '2026-11-05' },
      { k: 5, who: 'Bidan', state: 'up', date: '' },
      { k: 6, who: 'Dokter + USG', state: 'up', date: '' }
    ],
    birth: { done: { ktp: true, bpjs: true, kia: false, b1: true, b2: false, b3: false, b4: false, y1: false, y2: true, y3: false, y4: false }, assign: { b3: true }, driver: 'pasangan', hosp: '[RS A]' },
    nutri: { mode: 'scan', phase: 'idle', foods: [{ n: 'Nasi putih', c: 'yakin' }, { n: 'Sayur bayam', c: 'cek' }, { n: 'Tempe', c: 'yakin' }], menu: '' },
    meals: { tab: 'hamil', filters: [], loc: 'rumah', day: 1, slot: 'siang' },
    ai: null, bidan: null, aiShare: false,
    konsul: { type: 'obg', doc: null, mode: 'chat', slot: null, share: { week: false, notes: false, visits: false, hpl: false }, done: false },
    emergTab: null,
    loss: { phase: 'confirm', stopped: false },
    recovery: { a: {} }, recoveryCalm: false,
    bf: { side: null, startedAt: 0, acc: 0, log: [{ t: '08.10', s: 'Kiri', m: 12 }, { t: '05.40', s: 'Kanan', m: 15 }, { t: '02.55', s: 'Kiri', m: 10 }] },
    growth: { tab: 'len', data: [{ m: 0, v: 49.0 }, { m: 1, v: 53.2 }, { m: 2, v: 56.8 }, { m: 3, v: 59.4 }, { m: 4, v: 61.5 }] },
    mpasi: { stage: '6', foods: { bubur: true } },
    imun: { done: [true, true, true, false, false, false] },
    code: { val: '', err: '', ok: false }
  });
  P.S = P.defaults();

  /* stage → tone */
  P.stageTone = (s) => ({ plan: 'plan', preg: 'preg', baby: 'baby' }[s] || 'neutral');
  // Night: on, off, or automatic between 21.00 and 05.59 on the (simulated) clock.
  P.isNight = () => { const s = P.S; if (s.night === 'on') return true; if (s.night === 'off') return false; const h = parseInt(s.clock, 10); return h >= 21 || h < 6; };
  P.homeOf = (s) => ({ plan: 'planHome', preg: 'pregHome', baby: 'babyHome' }[s] || 'account');

  /* pregnancy maths (Naegele). The doctor's ultrasound date always wins over HPHT. */
  P.pregCalc = (usg, lmp) => {
    const u = P.parse(usg), l = P.parse(lmp);
    if (u) { const ga = 280 - P.diffDays(P.TODAY, u); return { ga, w: Math.floor(ga / 7), d: ((ga % 7) + 7) % 7, hpl: u, from: 'usg' }; }
    if (l) { const ga = P.diffDays(l, P.TODAY); return { ga, w: Math.floor(ga / 7), d: ((ga % 7) + 7) % 7, hpl: P.addDays(l, 280), from: 'lmp' }; }
    return null;
  };
  P.babyAge = () => {
    const b = P.parse(P.S.baby.dob); if (!b) return { m: 0, w: 0, txt: '' };
    let m = (P.TODAY.getFullYear() - b.getFullYear()) * 12 + P.TODAY.getMonth() - b.getMonth();
    if (P.TODAY.getDate() < b.getDate()) m--;
    const anchor = new Date(b); anchor.setMonth(b.getMonth() + m);
    const w = Math.floor(P.diffDays(anchor, P.TODAY) / 7);
    return { m, w, txt: `${m} bulan${w ? ` ${w} minggu` : ''}` };
  };
  P.babyName = () => P.S.baby.name ? P.esc(P.S.baby.name) : '[Nama Anak]';

  /* ------------------------------------------------------------------ components */
  const ic = P.ic, esc = P.esc;
  P.hdr = ({ title, sub = '', back = true, right = '', step = '', backTo = '' } = {}) => `<header class="hdr">
    ${back ? `<button class="ib" ${backTo ? `data-go="${backTo}"` : 'data-back'} aria-label="Kembali">${ic('back')}</button>` : ''}
    <h1 tabindex="-1" data-focus>${title}${sub ? `<span class="sub">${sub}</span>` : ''}</h1>
    ${step ? `<span class="step">${step}</span>` : ''}${right}</header>`;
  // Home header always carries a labelled emergency button within one tap.
  P.homeHdr = (greet, right) => `<header class="hdr"><div class="brand">${P.logo(30, false)}<h1 tabindex="-1" data-focus>${greet}</h1></div>
    <button type="button" class="hdr-sos" data-go="emergency">${ic('phone', 18)}<span>Darurat</span></button>${right}</header>`;
  // Name prompt shared by the three homes.
  P.namePrompt = () => P.S.askName && !P.S.name ? `<form class="card tight solid" data-submit="saveName"><label class="lbl" for="nm-in">Mau dipanggil apa?</label>
    <div class="btn-row" style="align-items:center"><input class="inp" id="nm-in" placeholder="Nama panggilanmu" autocomplete="given-name" style="flex:2"><button type="submit" class="btn btn-primary btn-sm" style="flex:0 0 auto"><span>Simpan</span></button></div>
    <button type="button" class="btn-text" style="align-self:flex-start;border:0;background:none" data-act="skipName">Lewati</button></form>` : '';

  const attrs = (o) => Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== false).map(([k, v]) => v === true ? k : `${k}="${esc(v)}"`).join(' ');
  P.attrs = attrs;
  P.btn = (label, o = {}) => {
    const { kind = 'primary', icon, iconR, cls = '', tag = 'button', ...rest } = o;
    const a = { class: `btn btn-${kind} ${cls}`, type: tag === 'button' ? 'button' : undefined, ...rest };
    return `<${tag} ${attrs(a)}>${icon ? ic(icon, 22) : ''}<span>${label}</span>${iconR ? ic(iconR, 20) : ''}</${tag}>`;
  };
  P.chip = (label, o = {}) => {
    const { pressed, icon, cls = '', role, ...rest } = o;
    const a = { class: `chip ${cls}`, type: 'button', ...rest };
    if (role) a.role = role;
    if (pressed !== undefined) a[role === 'radio' ? 'aria-checked' : 'aria-pressed'] = pressed ? 'true' : 'false';
    return `<button ${attrs(a)}>${pressed ? ic('check', 16) : icon ? ic(icon, 16) : ''}${label}</button>`;
  };
  P.sw = (id, label, desc, on, act, val, disabled) => `<div class="sw-row ${disabled ? 'off' : ''}"><div class="grow"><div class="t" id="${id}-l">${label}</div>${desc ? `<p class="t-sec" id="${id}-d">${desc}</p>` : ''}</div>
    <span class="sw-state" aria-hidden="true">${on ? 'Aktif' : 'Mati'}</span>
    <button type="button" class="sw" role="switch" id="${id}" aria-checked="${on ? 'true' : 'false'}" aria-labelledby="${id}-l" ${desc ? `aria-describedby="${id}-d"` : ''} data-act="${act}" data-v="${val || id}" ${disabled ? 'disabled' : ''}>${ic('check', 14, 'class="on-ic"')}</button></div>`;
  P.field = ({ id, label, type = 'text', value = '', ph = '', hint = '', err = '', warn = '', pre = '', suf = '', input = '', mode = '', act = '', extra = '' }) => {
    const desc = [hint && `${id}-h`, err && `${id}-e`, warn && `${id}-w`].filter(Boolean).join(' ');
    const control = `<input class="inp" id="${id}" type="${type}" value="${esc(value)}" ${ph ? `placeholder="${esc(ph)}"` : ''} ${mode ? `inputmode="${mode}"` : ''} ${input ? `data-in="${input}"` : ''} ${act ? `data-ch="${act}"` : ''} ${desc ? `aria-describedby="${desc}"` : ''} ${err ? 'aria-invalid="true"' : ''} ${extra}>`;
    return `<div class="field ${err ? 'err' : ''}"><label for="${id}">${label}</label>
      ${pre || suf ? `<div class="inp-wrap">${pre ? `<span class="pre" aria-hidden="true">${pre}</span>` : ''}${control}${suf ? `<span class="suf">${suf}</span>` : ''}</div>` : control}
      ${hint ? `<span class="hint" id="${id}-h">${hint}</span>` : ''}
      ${err ? `<span class="errmsg" id="${id}-e">${ic('alertc', 18)}${err}</span>` : ''}
      ${warn ? `<span class="warnmsg" id="${id}-w">${ic('info', 18)}${warn}</span>` : ''}</div>`;
  };
  // Segmented control = single choice, so it is a radio group (not tabs).
  P.seg = (label, opts, val, act) => `<div class="seg" role="radiogroup" aria-label="${esc(label)}">${opts.map(([v, t]) => `<button type="button" role="radio" aria-checked="${v === val}" data-act="${act}" data-v="${v}">${t}</button>`).join('')}</div>`;
  // Locale-independent date picker: three labelled selects, shows "29 Apr 2027" style values.
  P._ds = {};
  P.dateSel = ({ id, label, value = '', act, f = '', years, optional = false, hint = '', err = '' }) => {
    const pd = P.parse(value), part = P._ds[id] || {}, yrs = years || [2025, 2026, 2027];
    const d = pd ? { getDate: () => pd.getDate(), getMonth: () => pd.getMonth(), getFullYear: () => pd.getFullYear() }
      : { getDate: () => part.d, getMonth: () => (part.m ? part.m - 1 : -1), getFullYear: () => part.y };
    const opt = (v, t, on) => `<option value="${v}" ${on ? 'selected' : ''}>${t}</option>`;
    const blank = optional || !pd ? opt('', '—', false) : '';
    return `<fieldset class="field datesel ${err ? 'err' : ''}" ${hint || err ? `aria-describedby="${hint ? id + '-h' : ''} ${err ? id + '-e' : ''}"` : ''}><legend class="lbl">${label}</legend><div class="ds-row">
      <label class="ds"><span>Tanggal</span><select class="inp" id="${id}-d" data-ch="dateSel" data-id="${id}" data-act2="${act}" data-f="${f}">${blank}${Array.from({ length: 31 }, (_, i) => opt(i + 1, i + 1, d && d.getDate() === i + 1)).join('')}</select></label>
      <label class="ds wide"><span>Bulan</span><select class="inp" id="${id}-m" data-ch="dateSel" data-id="${id}" data-act2="${act}" data-f="${f}">${blank}${P.MONL.map((m, i) => opt(i + 1, m, d && d.getMonth() === i)).join('')}</select></label>
      <label class="ds"><span>Tahun</span><select class="inp" id="${id}-y" data-ch="dateSel" data-id="${id}" data-act2="${act}" data-f="${f}">${blank}${yrs.map((y) => opt(y, y, d && d.getFullYear() === y)).join('')}</select></label></div>
      ${hint ? `<span class="hint" id="${id}-h">${hint}</span>` : ''}${err ? `<span class="errmsg" id="${id}-e">${ic('alertc', 18)}${err}</span>` : ''}</fieldset>`;
  };
  P.acts.dateSel = (el) => {
    const id = el.dataset.id, q = (x) => +P.el().querySelector('#' + id + '-' + x).value;
    let d = q('d'), m = q('m'), y = q('y'), v = '';
    if (d && m && y) { d = Math.min(d, new Date(y, m, 0).getDate()); v = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`; delete P._ds[id]; }
    else P._ds[id] = { d, m, y };
    P.acts[el.dataset.act2]({ value: v, dataset: { f: el.dataset.f } });
  };
  P.src = (t) => `<span class="src">${ic('doc', 14)}Sumber: ${t}</span>`;
  P.sos = () => `<button type="button" class="pill-sos" data-go="emergency"><span class="dot" aria-hidden="true"></span>${ic('phone', 18)}Bantuan darurat</button>`;
  // One calm row that opens the danger list, instead of many red chips in everyday sheets.
  P.dangerRow = (list) => `<button type="button" class="danger-row" data-sheet="dangerPick" data-v="${list}">${ic('alert', 22)}<span class="grow"><b>Ada tanda bahaya?</b><span>Ketuk untuk melihat daftar dan minta bantuan</span></span>${ic('chev', 20)}</button>`;
  // Fictional test-session content replaces brackets when "Konten uji" is on.
  P.TEST = [['[RS Ibu & Anak B]', 'RSIA Kenanga (contoh)'], ['[RS A]', 'RS Melati (contoh)'], ['[RSUD C]', 'RSUD Cempaka (contoh)'], ['[RS D]', 'RS Anggrek (contoh)'], ['[RS E]', 'RSUD Teratai (contoh)'],
    ['[Bidan Nama]', 'Bidan Rina (contoh)'], ['[Nama kantor]', 'PT Sinar Contoh'], ['[Nama Anak]', 'Ara'], ['[Nama pasien]', 'Dewi S.'], ['[Nama]', 'Dewi'],
    ['[x menit]', '10 menit'], ['[x jam]', '2 jam'], ['[KODE-6]', 'PLK-4821'], ['[nomor HP]', '812-xxxx-5521'], ['[Foto RS]', 'Foto RS (contoh)'],
    ['[Layanan dukungan]', 'Layanan dukungan (contoh)'], ['[Vendor A]', 'Dapur Sehat (contoh)'], ['[alamat rumah]', 'Jl. Contoh No. 12, Kemang'], ['[alamat kantor]', 'Jl. Contoh Raya No. 8, Kuningan']];
  P.applyTest = (html) => { if (!P.S.testContent) return html; let h = html; P.TEST.forEach(([a, b]) => { h = h.split(a).join(b); }); return h; };
  P.check = (id, label, checked, act, sub = '', v = '') => `<label class="check ${checked ? 'done' : ''}" for="${id}"><input type="checkbox" id="${id}" ${checked ? 'checked' : ''} data-ch="${act}" data-v="${v || id}"><span class="box">${ic('check', 16)}</span><span class="grow"><span class="t">${label}</span>${sub ? `<br><span class="t-sec">${sub}</span>` : ''}</span></label>`;
  P.tick = (id, label, checked, act, v) => `<label class="check" for="${id}"><input type="checkbox" id="${id}" ${checked ? 'checked' : ''} data-ch="${act}" data-v="${v}"><span class="box">${ic('check', 16)}</span><span class="grow">${label}</span></label>`;
  P.covered = () => P.S.covered ? `<span class="badge cover">${ic('shieldc', 15)}Ditanggung</span>` : '';

  /* orbs per tone (blurred solid circles) */
  const ORBS = {
    plan: [['#FF8A6B', 300, 200, -60, .48], ['#FFC93C', 240, -90, 330, .4], ['#C86DD7', 200, 230, 640, .36]],
    preg: [['#C86DD7', 320, -100, -40, .5], ['#FF8A6B', 230, 230, 300, .38], ['#34D6A6', 190, -40, 650, .35]],
    baby: [['#34D6A6', 310, 190, -50, .48], ['#FFC93C', 220, -100, 340, .38], ['#C86DD7', 190, 220, 660, .35]],
    neutral: [['#C86DD7', 260, 210, -40, .36], ['#34D6A6', 220, -100, 560, .35]],
    calm: [['#A9B7BD', 300, 160, -80, .35]],
    welcome: [['#FF8A6B', 280, -80, -30, .45], ['#C86DD7', 300, 190, 260, .45], ['#34D6A6', 230, -60, 600, .4]]
  };
  P.orbs = (tone, drift, night) => `<div class="orbs ${drift ? 'drift' : ''}" aria-hidden="true">${(ORBS[tone] || ORBS.neutral).map(([c, s, x, y, o]) => `<i class="orb" style="background:${c};width:${s}px;height:${s}px;left:${x}px;top:${y}px;opacity:${night ? Math.min(o, 0.2) : o}"></i>`).join('')}</div>`;
  P.statusbar = () => `<div class="status" aria-hidden="true"><b>${(P.S.clock || '09.41').replace(/^0/, '').replace('.', ':')}</b><span>
    <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor"/><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="currentColor"/><rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor"/><rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor"/></svg>
    <svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".45"/><rect x="2.5" y="2.5" width="17" height="8" rx="2" fill="currentColor"/><rect x="24.6" y="4.5" width="1.6" height="4" rx=".8" fill="currentColor" opacity=".45"/></svg></span></div>`;

  /* floating tab bar — three home screens only */
  const TABS = {
    plan: [['planHome', 'home', 'Beranda'], ['cost', 'coins', 'Biaya'], null, ['hospitals', 'hospital', 'Rumah sakit'], ['tanya', 'sparkle', 'Tanya']],
    preg: [['pregHome', 'home', 'Beranda'], ['kontrol', 'calendar', 'Kontrol'], null, ['meals', 'leaf', 'Gizi'], ['tanya', 'sparkle', 'Tanya']],
    baby: [['babyHome', 'home', 'Beranda'], ['growth', 'chart', 'Tumbuh'], null, ['meals', 'leaf', 'Gizi'], ['tanya', 'sparkle', 'Tanya']]
  };
  P.tabbar = (stage, active) => `<div class="tabband" aria-hidden="true"></div><nav class="tabbar" aria-label="Navigasi utama">${TABS[stage].map((t) => t
    ? `<button type="button" class="tab" ${t[0] === active ? 'aria-current="page"' : ''} data-go="${t[0]}" ${t[0] === 'meals' && stage === 'baby' ? 'data-arg="mpasi"' : ''}>${ic(t[1], 22)}<span>${t[2]}</span></button>`
    : `<div class="catat"><button type="button" aria-label="Catat" data-sheet="catat">${ic('plus', 28)}</button><span aria-hidden="true">Catat</span></div>`).join('')}</nav>`;

  /* ------------------------------------------------------------------ registry */
  P.screens = {}; P.order = [];
  P.def = (spec) => { P.screens[spec.id] = spec; P.order.push(spec.id); };
  P.toneOf = (sp) => sp.tone === 'shared' ? (P.S.lossActive ? 'calm' : P.stageTone(P.S.stage)) : (typeof sp.tone === 'function' ? sp.tone() : sp.tone);

  /* ------------------------------------------------------------------ runtime */
  let root, scr, scroll, dock, layer, toasts, cur = null, hist = [], sheet = null, timers = [];
  P.cur = () => cur;
  P.mount = (el) => {
    root = el;
    root.innerHTML = `<div class="scr" id="pl-scr"><div class="orbs-slot"></div>${P.statusbar()}<div class="scroll" id="pl-scroll"></div><div id="pl-dock"></div><div class="layer" id="pl-layer"></div><div class="toasts" role="status" aria-live="polite" id="pl-toasts"></div></div>`;
    scr = root.querySelector('#pl-scr'); scroll = root.querySelector('#pl-scroll'); dock = root.querySelector('#pl-dock'); layer = root.querySelector('#pl-layer'); toasts = root.querySelector('#pl-toasts');
    scr.addEventListener('click', onClick);
    scr.addEventListener('input', (e) => { const t = e.target.closest('[data-in]'); if (t && P.ins[t.dataset.in]) P.ins[t.dataset.in](t, e); });
    scr.addEventListener('change', (e) => { const t = e.target.closest('[data-ch]'); if (t && P.acts[t.dataset.ch]) P.acts[t.dataset.ch](t, e); });
    // Whole switch row is the tap target, not only the 56×34 switch.
    scr.addEventListener('click', (e) => { const fld = e.target.closest('.inputbar .fld'); if (fld && e.target.tagName !== 'INPUT') { const i = fld.querySelector('input'); i && i.focus(); } });
    scr.addEventListener('click', (e) => { const row = e.target.closest('.sw-row'); if (row && !e.target.closest('.sw,a,button')) { const b = row.querySelector('.sw'); if (b && !b.disabled) b.click(); } });
    scr.addEventListener('submit', (e) => { const f = e.target.closest('[data-submit]'); if (f) { e.preventDefault(); P.acts[f.dataset.submit] && P.acts[f.dataset.submit](f, e); } });
    scr.addEventListener('keydown', onKey);
  };
  P.every = (fn, ms) => { const t = setInterval(fn, ms); timers.push(t); return t; };
  P.later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  const clearTimers = () => { timers.forEach((t) => { clearInterval(t); clearTimeout(t); }); timers = []; };

  function onClick(e) {
    if (sheet && sheet.danger && e.target.classList.contains('scrim')) { const c = layer.querySelector('.call-119'); c && c.focus(); return; }
    const t = e.target.closest('[data-go],[data-back],[data-act],[data-sheet],[data-close],[data-scrim]');
    if (!t || !scr.contains(t)) return;
    if (t.matches('input,select,textarea') && t.dataset.ch) return; // change handler covers it
    if (t.hasAttribute('data-scrim')) { if (sheet && !sheet.danger) P.closeSheet(); return; }
    if (t.hasAttribute('data-close')) { P.closeSheet(true); return; }
    if (t.hasAttribute('data-back')) { P.back(); return; }
    if (t.dataset.go) { if (sheet) P.closeSheet(true, true); P.go(t.dataset.go, { arg: t.dataset.arg }); return; }
    if (t.dataset.sheet) { P.openSheet(t.dataset.sheet, t.dataset.v); return; }
    if (t.dataset.act && P.acts[t.dataset.act]) { e.preventDefault(); P.acts[t.dataset.act](t, e); }
  }
  function onKey(e) {
    if (!sheet) return;
    if (e.key === 'Escape') { if (!sheet.danger) { e.stopPropagation(); P.closeSheet(); } else { const b = layer.querySelector('[data-act="dangerBack"]'); b && b.focus(); } return; }
    if (e.key === 'Tab') {
      const f = [...layer.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter((x) => !x.disabled && x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  /* compose a whole screen's markup — used live and by the static "all screens" grid */
  P.compose = (id) => {
    const sp = P.screens[id]; const tone = P.toneOf(sp); const r = sp.render();
    let bottom = r.dock ? `<div class="dock">${r.dock}</div>` : '';
    if (r.tab) bottom = P.tabbar(r.tab, id);
    if (r.bar) bottom = r.bar;
    return { tone, main: P.applyTest(r.main), bottom: P.applyTest(bottom), tab: !!r.tab, drift: !!sp.drift, orbTone: sp.orbs || tone, night: P.isNight() };
  };

  P.go = (id, o = {}) => {
    if (!P.screens[id]) id = 'welcome';
    if (P.screens[id].desktop && P.onDesktop) { P.onDesktop(id); return; }
    if (cur && P.screens[cur] && P.screens[cur].leave) P.screens[cur].leave();
    if (cur && !o.replace && cur !== id) hist.push(cur);
    if (hist.length > 40) hist.shift();
    clearTimers();
    cur = id;
    if (P.screens[id].enter) P.screens[id].enter(o.arg);
    sheet = null; layer.classList.remove('open'); layer.innerHTML = '';
    paint(true);
    scroll.scrollTop = 0;
    if (P.onNav) P.onNav(id);
  };
  P.back = () => {
    const prev = hist.pop();
    if (cur && P.screens[cur].leave) P.screens[cur].leave();
    clearTimers();
    cur = prev || P.homeOf(P.S.stage);
    sheet = null; layer.classList.remove('open'); layer.innerHTML = '';
    paint(true); scroll.scrollTop = 0;
    if (P.onNav) P.onNav(cur);
  };
  P.resetHistory = () => { hist = []; };

  function paint(fresh) {
    const c = P.compose(cur);
    scr.dataset.tone = c.tone;
    scr.classList.toggle('has-tab', c.tab);
    scr.classList.toggle('reduce', !!P.S.reduce);
    scr.classList.toggle('night', c.night);
    scr.classList.toggle('testmode', !!P.S.testContent);
    scr.querySelector('.orbs-slot').innerHTML = P.orbs(c.orbTone, c.drift, c.night);
    scr.querySelector('.status').outerHTML = P.statusbar();
    const ae = document.activeElement, aeId = ae && scr.contains(ae) ? ae.id : null;
    const sel = aeId && ae.selectionStart != null ? [ae.selectionStart, ae.selectionEnd] : null;
    scroll.innerHTML = c.main;
    dock.innerHTML = c.bottom;
    if (!fresh) scroll.querySelectorAll('.rise').forEach((e) => e.classList.remove('rise'));
    const sp = P.screens[cur];
    if (sp.after) sp.after(scr, fresh);
    if (fresh) { const h = scroll.querySelector('[data-focus]'); if (h && P.focusOnNav) h.focus({ preventScroll: true }); }
    else if (aeId) { const n = scr.querySelector('#' + CSS.escape(aeId)); if (n) { n.focus({ preventScroll: true }); if (sel && n.setSelectionRange) try { n.setSelectionRange(sel[0], sel[1]); } catch (_) {} } }
    setInert(!!sheet);
  }
  P.rerender = () => {
    if (!cur) return;
    const top = scroll.scrollTop; paint(false); scroll.scrollTop = top;
    if (sheet) paintSheet(false);
  };
  P.el = () => scr;

  /* ------------------------------------------------------------------ sheets (dialogs) */
  function setInert(on) { [scroll, dock].forEach((n) => { if (on) n.setAttribute('inert', ''); else n.removeAttribute('inert'); }); }
  P.sheetMarkup = (name, arg) => {
    const d = P.sheets[name](arg);
    return { danger: !!d.danger, html: `${d.danger ? '<div class="scrim"></div>' : '<div class="scrim" data-scrim></div>'}
      <div class="sheet ${d.danger ? 'danger' : ''}" role="${d.danger ? 'alertdialog' : 'dialog'}" aria-modal="true" aria-labelledby="sh-t" ${d.desc ? 'aria-describedby="sh-d"' : ''}>
        ${d.danger ? `<div class="sheet-b" style="padding-top:8px">${d.body}</div>` : `<div class="sheet-h"><h2 id="sh-t" tabindex="-1">${d.title}</h2><button type="button" class="ib" data-close aria-label="Tutup">${ic('close')}</button></div><div class="sheet-b">${d.body}</div>`}
      </div>` };
  };
  function paintSheet(fresh) {
    const m = P.sheetMarkup(sheet.name, sheet.arg);
    sheet.danger = m.danger;
    const keep = !fresh && document.activeElement && layer.contains(document.activeElement) ? document.activeElement.id : null;
    const st = !fresh && layer.querySelector('.sheet-b') ? layer.querySelector('.sheet-b').scrollTop : 0;
    layer.innerHTML = P.applyTest(m.html); layer.classList.add('open');
    if (!fresh) { const s = layer.querySelector('.sheet'); if (s) s.style.animation = 'none'; const sc = layer.querySelector('.scrim'); if (sc) sc.style.animation = 'none'; const b = layer.querySelector('.sheet-b'); if (b) b.scrollTop = st; }
    if (keep) { const n = layer.querySelector('#' + CSS.escape(keep)); n && n.focus({ preventScroll: true }); }
  }
  P.openSheet = (name, arg) => {
    if (!P.sheets[name]) return;
    const opener = document.activeElement;
    sheet = { name, arg, opener }; P._dangerUndo = null;
    paintSheet(true); setInert(true);
    if (sheet.danger) toasts.innerHTML = ''; // nothing may cover the danger panel
    const f = layer.querySelector(sheet.danger ? '.call-119' : '#sh-t');
    f && f.focus({ preventScroll: true });
  };
  P.sheetArg = () => sheet && sheet.arg;
  P.sheetOpen = () => !!sheet;
  P.closeSheet = (force, silent) => {
    if (!sheet) return;
    if (sheet.danger && !force) return;
    const op = sheet.opener; sheet = null;
    layer.classList.remove('open'); layer.innerHTML = ''; setInert(false);
    if (!silent && op && scr.contains(op)) op.focus({ preventScroll: true });
  };
  // "Salah pilih, kembali" also undoes the choice that opened the panel.
  P.openDanger = (sign, undo) => { P.openSheet('danger', sign); P._dangerUndo = undo || null; };
  P.acts.dangerBack = () => { const u = P._dangerUndo; P._dangerUndo = null; P.closeSheet(true); if (u) { u(); P.rerender(); } };

  /* ------------------------------------------------------------------ toasts */
  P.toast = (msg, o = {}) => {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `${ic(o.icon || 'checkc', 20)}<span class="grow">${msg}</span>${o.undo ? '<button type="button">Urungkan</button>' : ''}`;
    if (o.undo) t.querySelector('button').addEventListener('click', () => { o.undo(); t.remove(); P.rerender(); });
    toasts.innerHTML = ''; // one toast at a time
    toasts.appendChild(t);
    setTimeout(() => t.remove(), o.ms || 4200);
  };
  P.call = (who) => P.toast(`Prototipe: membuka telepon ${who}`, { icon: 'phone' });

  /* ------------------------------------------------------------------ static render (overview grid) */
  P.staticScreen = (id, setup) => {
    const saved = JSON.stringify(P.S);
    try {
      if (setup && setup.state) setup.state(P.S);
      const sp = P.screens[id];
      if (sp.enter && !(setup && setup.noEnter)) sp.enter(setup && setup.arg);
      if (setup && setup.state) setup.state(P.S);
      const c = P.compose(id);
      let sh = '';
      if (setup && setup.sheet) { const m = P.sheetMarkup(setup.sheet, setup.sheetArg); sh = `<div class="layer open">${P.applyTest(m.html)}</div>`; }
      return `<div class="scr reduce ${c.tab ? 'has-tab' : ''} ${c.night ? 'night' : ''} ${P.S.testContent ? 'testmode' : ''}" data-tone="${c.tone}">${P.orbs(c.orbTone, false, c.night)}${P.statusbar()}<div class="scroll">${c.main}</div>${c.bottom}${sh}</div>`;
    } finally { P.S = JSON.parse(saved); }
  };
})();
