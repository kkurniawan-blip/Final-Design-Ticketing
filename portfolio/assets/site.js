/* Kenneth Kurniawan portfolio: shared interactions. No dependencies. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const styles = getComputedStyle(document.body);
  const token = name => styles.getPropertyValue('--' + name).trim();
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* storage blocked */ } },
    del(k) { try { sessionStorage.removeItem(k); } catch { /* storage blocked */ } },
  };
  const rgba = (hex, a) => {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.replace(/./g, c => c + c) : h, 16);
    return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
  };

  /* Aurora field: a tiny canvas stretched full screen, so the blur is free. */
  function aurora() {
    const c = document.createElement('canvas');
    c.id = 'aurora';
    c.setAttribute('aria-hidden', 'true');
    document.body.prepend(c);
    const ctx = c.getContext('2d');
    const base = token('bg');
    const cols = [token('blue'), token('pink'), token('blue'), token('pink'), token('blue-soft'), token('pink')];
    const blobs = cols.map((col, i) => ({
      col, x: (i * 0.37 + 0.1) % 1, y: (i * 0.53 + 0.2) % 1, r: 0.32 + (i % 3) * 0.1, ph: i * 1.7,
    }));
    let w, h, mx = 0.5, my = 0.5, last = 0, raf;
    const size = () => {
      w = c.width = Math.max(48, Math.round(innerWidth / 9));
      h = c.height = Math.max(48, Math.round(innerHeight / 9));
    };
    const draw = t => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);
      blobs.forEach((b, i) => {
        const x = (b.x + Math.sin(t * 0.00011 * (i + 1) + b.ph) * 0.2 + (mx - 0.5) * 0.08 * (i % 2 ? 1 : -1)) * w;
        const y = (b.y + Math.cos(t * 0.00008 * (i + 2) + b.ph) * 0.18 + (my - 0.5) * 0.08) * h;
        const r = b.r * Math.max(w, h);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, rgba(b.col, 0.26));
        g.addColorStop(1, rgba(b.col, 0));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      });
    };
    const loop = t => {
      raf = requestAnimationFrame(loop);
      if (t - last < 33) return;
      last = t;
      draw(t);
    };
    size();
    draw(0);
    addEventListener('resize', () => { size(); draw(performance.now()); });
    if (reduce) return;
    addEventListener('pointermove', e => { mx = e.clientX / innerWidth; my = e.clientY / innerHeight; }, { passive: true });
    document.addEventListener('visibilitychange', () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(loop);
    });
    raf = requestAnimationFrame(loop);
  }

  function cursorGlow() {
    if (!fine || reduce) return;
    const g = document.createElement('div');
    g.className = 'glow';
    g.setAttribute('aria-hidden', 'true');
    document.body.prepend(g);
    let x = -2000, y = -2000, tx = x, ty = y;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; if (x < -1000) { x = tx; y = ty; } }, { passive: true });
    const tick = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      g.style.setProperty('--gx', x + 'px');
      g.style.setProperty('--gy', y + 'px');
      requestAnimationFrame(tick);
    };
    tick();
  }

  function progress() {
    const bar = $('#progress');
    if (!bar) return;
    const set = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.setProperty('--p', max > 0 ? Math.min(1, scrollY / max) : 0);
    };
    addEventListener('scroll', set, { passive: true });
    set();
  }

  /* Split text nodes into letters, keeping inline markup like .hl intact. */
  function split() {
    let i = 0;
    $$('[data-split]').forEach(el => {
      el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
      const walk = node => {
        [...node.childNodes].forEach(child => {
          if (child.nodeType === 3) {
            const frag = document.createDocumentFragment();
            child.textContent.split(/(\s+)/).forEach(part => {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.append(' '); return; }
              const word = document.createElement('span');
              word.className = 'word';
              word.setAttribute('aria-hidden', 'true');
              [...part].forEach(ch => {
                const s = document.createElement('span');
                s.className = 'ch';
                s.textContent = ch;
                s.style.setProperty('--i', i);
                i++;
                word.append(s);
              });
              frag.append(word);
            });
            child.replaceWith(frag);
          } else if (child.nodeType === 1) {
            walk(child);
          }
        });
      };
      walk(el);
      const groups = $$('.hl', el);
      (groups.length ? groups : [el]).forEach(g => {
        const chars = $$('.ch', g);
        chars.forEach((c, k) => {
          const p = chars.length > 1 ? Math.round(k / (chars.length - 1) * 100) : 0;
          c.style.setProperty('--c', `color-mix(in oklab, var(--pink-deep) ${p}%, var(--blue-deep))`);
        });
      });
      $$('.ch', el).forEach(c => { if (!c.style.getPropertyValue('--c')) c.style.setProperty('--c', 'var(--pink-deep)'); });
      if (!reduce) el.classList.add('split-ready');
    });
  }

  function rotator() {
    $$('[data-rotate]').forEach(el => {
      const words = el.dataset.rotate.split('|');
      const sr = document.createElement('span');
      sr.className = 'sr-only';
      sr.textContent = words.join(', ');
      el.after(sr);
      el.setAttribute('aria-hidden', 'true');
      if (reduce) {
        let k = 0;
        setInterval(() => { k = (k + 1) % words.length; el.textContent = words[k]; }, 3200);
        return;
      }
      let k = 0, n = words[0].length, deleting = false;
      const step = () => {
        const word = words[k];
        if (!deleting) {
          n++;
          el.textContent = word.slice(0, n);
          if (n >= word.length) { deleting = true; return setTimeout(step, 2200); }
          return setTimeout(step, 45 + Math.random() * 40);
        }
        n--;
        el.textContent = word.slice(0, n);
        if (n <= 0) { deleting = false; k = (k + 1) % words.length; return setTimeout(step, 300); }
        setTimeout(step, 22);
      };
      setTimeout(() => { deleting = true; step(); }, 2600);
    });
  }

  function reveal() {
    if (reduce || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    $$('[data-reveal]').forEach(el => {
      if (el.getBoundingClientRect().top > innerHeight) io.observe(el);
    });
  }

  function countUp() {
    if (reduce || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target;
      const end = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.decimals || '0', 10);
      const pre = el.dataset.prefix || '';
      const t0 = performance.now();
      const run = t => {
        const p = Math.min(1, (t - t0) / 1400);
        const v = end * (1 - Math.pow(1 - p, 4));
        el.textContent = pre + v.toFixed(dec);
        if (p < 1) requestAnimationFrame(run);
      };
      requestAnimationFrame(run);
    }), { threshold: 0.6 });
    $$('[data-count]').forEach(el => io.observe(el));
  }

  function magnetic() {
    if (!fine || reduce) return;
    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--tx', (e.clientX - r.left - r.width / 2) * 0.22 + 'px');
        el.style.setProperty('--ty', (e.clientY - r.top - r.height / 2) * 0.3 + 'px');
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--tx', '0px'); el.style.setProperty('--ty', '0px'); });
    });
  }

  /* 3D tilt + light that follows the pointer, for tickets and the boarding pass. */
  function tilt() {
    if (!fine || reduce) return;
    $$('.ticket:not(.static), .pass, [data-tilt]').forEach(el => {
      const max = el.classList.contains('ticket') ? 12 : 9;
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--ry', (px - 0.5) * max + 'deg');
        el.style.setProperty('--rx', (0.5 - py) * max + 'deg');
        el.style.setProperty('--mx', px * 100 + '%');
        el.style.setProperty('--my', py * 100 + '%');
        el.style.setProperty('--hx', px * 100 + '%');
      });
      el.addEventListener('pointerleave', () => {
        ['--rx', '--ry'].forEach(p => el.style.setProperty(p, '0deg'));
      });
    });
  }

  /* Gate navigation: tear the stub, wipe the screen in the destination's colour, then go. */
  const wipe = $('#gate-wipe');
  function go(href, colorName, label, x, y) {
    if (reduce || !wipe) { location.href = href; return; }
    wipe.style.setProperty('--wipe', `var(--grad-${colorName})`);
    wipe.style.setProperty('--x', x + 'px');
    wipe.style.setProperty('--y', y + 'px');
    $('strong', wipe).textContent = label;
    wipe.classList.remove('in');
    void wipe.offsetWidth;
    wipe.classList.add('out');
    store.set('kk-arrive', colorName);
    setTimeout(() => { location.href = href; }, 620);
  }
  function gates() {
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.getAttribute('href'), location.href);
      if (url.origin !== location.origin || !/\.html$/.test(url.pathname)) return;
      e.preventDefault();
      if (a.classList.contains('ticket')) a.classList.add('torn');
      const r = a.getBoundingClientRect();
      const x = e.clientX || r.left + r.width / 2, y = e.clientY || r.top + r.height / 2;
      go(url.href, a.dataset.color || 'blend', a.dataset.label || a.textContent.trim(), x, y);
    });
    const arrive = store.get('kk-arrive');
    if (arrive && wipe && !reduce) {
      wipe.style.setProperty('--wipe', `var(--grad-${arrive})`);
      wipe.classList.add('in');
    }
    store.del('kk-arrive');
    addEventListener('pageshow', e => {
      if (!e.persisted) return;
      wipe && wipe.classList.remove('out', 'in');
      $$('.ticket.torn').forEach(t => t.classList.remove('torn'));
    });
  }

  /* Decorative QR-style code for the boarding pass. */
  function passCode() {
    const c = $('#pass-code');
    if (!c) return;
    const N = 21, S = 6;
    c.width = c.height = N * S;
    const ctx = c.getContext('2d');
    let seed = [...'Kenneth Kurniawan'].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    ctx.fillStyle = token('ink');
    const finder = (fx, fy) => {
      ctx.fillRect(fx * S, fy * S, 7 * S, 7 * S);
      ctx.clearRect((fx + 1) * S, (fy + 1) * S, 5 * S, 5 * S);
      ctx.fillRect((fx + 2) * S, (fy + 2) * S, 3 * S, 3 * S);
    };
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const inFinder = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
      if (!inFinder && rnd() > 0.52) ctx.fillRect(x * S, y * S, S, S);
    }
    finder(0, 0); finder(14, 0); finder(0, 14);
  }

  function filters() {
    $$('[data-filter-group]').forEach(group => {
      const target = $(group.dataset.filterGroup);
      const mode = group.dataset.mode || 'hide';
      const items = $$('[data-tags]', target);
      const status = $(group.dataset.status || '#none');
      group.addEventListener('click', e => {
        const btn = e.target.closest('[data-filter]');
        if (!btn) return;
        const f = btn.dataset.filter;
        const same = btn.getAttribute('aria-pressed') === 'true' && mode === 'dim';
        $$('[data-filter]', group).forEach(b => b.setAttribute('aria-pressed', String(b === btn && !same)));
        const active = same ? 'all' : f;
        let shown = 0;
        items.forEach(it => {
          const hit = active === 'all' || it.dataset.tags.split(' ').includes(active);
          if (mode === 'hide') it.hidden = !hit;
          else it.classList.toggle('match', hit && active !== 'all');
          if (hit) shown++;
        });
        if (mode === 'dim') {
          if (active === 'all') { target.removeAttribute('data-active'); $$('[data-filter="all"]', group).forEach(b => b.setAttribute('aria-pressed', 'true')); }
          else target.dataset.active = active;
        }
        $$('[data-year]', target).forEach(y => {
          y.hidden = mode === 'hide' && !items.some(it => !it.hidden && it.dataset.yearOf === y.dataset.year);
        });
        if (status) status.textContent = `${shown} shown`;
      });
    });
  }

  function expandAll() {
    $$('[data-expand]').forEach(btn => {
      const scope = $(btn.dataset.expand);
      btn.addEventListener('click', () => {
        const all = $$('details', scope);
        const open = !all.every(d => d.open);
        all.forEach(d => { d.open = open; });
        btn.textContent = open ? 'Collapse all' : 'Expand all';
      });
    });
  }

  function flips() {
    $$('.flip').forEach(card => {
      const front = $('.front', card), back = $('.back', card);
      const set = on => {
        card.classList.toggle('flipped', on);
        front.inert = on;
        back.inert = !on;
        $$('.flip-btn', card).forEach(b => b.setAttribute('aria-expanded', String(on)));
      };
      set(false);
      card.addEventListener('click', e => {
        if (e.target.closest('a')) return;
        const on = !card.classList.contains('flipped');
        set(on);
        if (e.target.closest('.flip-btn')) $(on ? '.back .flip-btn' : '.front .flip-btn', card).focus({ preventScroll: true });
      });
    });
  }

  function tabs() {
    $$('[role="tablist"]').forEach(list => {
      const tabsEls = $$('[role="tab"]', list);
      const select = t => {
        tabsEls.forEach(x => {
          const on = x === t;
          x.setAttribute('aria-selected', String(on));
          x.tabIndex = on ? 0 : -1;
          $('#' + x.getAttribute('aria-controls')).hidden = !on;
        });
      };
      list.addEventListener('click', e => { const t = e.target.closest('[role="tab"]'); if (t) select(t); });
      list.addEventListener('keydown', e => {
        const i = tabsEls.indexOf(document.activeElement);
        if (i < 0 || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
        const n = tabsEls[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabsEls.length) % tabsEls.length];
        select(n);
        n.focus();
      });
    });
  }

  function confetti(x, y) {
    if (reduce) return;
    const c = document.createElement('canvas');
    c.className = 'confetti';
    c.setAttribute('aria-hidden', 'true');
    document.body.append(c);
    const dpr = Math.min(2, devicePixelRatio || 1);
    c.width = innerWidth * dpr;
    c.height = innerHeight * dpr;
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    const cols = ['blue', 'blue-deep', 'pink', 'pink-deep', 'blue-soft', 'pink-soft'].map(token);
    const parts = Array.from({ length: 160 }, () => {
      const a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 9;
      return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6, s: 5 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: cols[Math.floor(Math.random() * cols.length)] };
    });
    const t0 = performance.now();
    const frame = t => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts.forEach(p => {
        p.vy += 0.28; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        ctx.restore();
      });
      if (t - t0 < 2600) requestAnimationFrame(frame); else c.remove();
    };
    requestAnimationFrame(frame);
  }
  function celebrate() {
    $$('[data-confetti]').forEach(btn => btn.addEventListener('click', e => {
      const r = btn.getBoundingClientRect();
      if (btn.classList.contains('coin') && !reduce) {
        btn.classList.remove('burst');
        void btn.offsetWidth;
        btn.classList.add('burst');
      }
      confetti(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2);
    }));
  }

  async function copyText(text, btn) {
    const label = btn.querySelector('.copy-label') || btn;
    const old = label.textContent;
    try {
      await navigator.clipboard.writeText(text);
      label.textContent = 'Copied';
    } catch {
      const target = btn.dataset.copyTarget && $(btn.dataset.copyTarget);
      if (target) {
        const range = document.createRange();
        range.selectNodeContents(target);
        const sel = getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
      label.textContent = 'Selected, press Ctrl+C';
    }
    setTimeout(() => { label.textContent = old; }, 2000);
  }
  function copies() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-copy]');
      if (btn) copyText(btn.dataset.copy, btn);
    });
  }

  /* KennyBot: a scripted demo of the chatbots Kenneth designs, with a human handover fallback. */
  const ICON = {
    bot: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4M9 13h.01M15 13h.01M9 17h6"/></svg>',
    x: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    send: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></svg>',
    arrow: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:16px;height:16px"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  };
  const LINK = {
    experience: ['experience.html', 'blue', { en: 'See the experience log', id: 'Lihat pengalaman' }],
    projects: ['projects.html', 'blend', { en: 'See the projects', id: 'Lihat proyek' }],
    awards: ['awards.html', 'pink', { en: 'Open the trophy case', id: 'Buka lemari piala' }],
    contact: ['contact.html', 'dusk', { en: 'Go to contact', id: 'Ke halaman kontak' }],
  };
  const INTENTS = [
    { id: 'lang-id', words: ['bahasa', 'indonesia', 'indo'] },
    { id: 'lang-en', words: ['english', 'inggris'] },
    { id: 'chatbot', words: ['chatbot', 'chatbots', 'bot', 'mobichat', 'prompt', 'persona', 'ai'], link: 'projects' },
    { id: 'ticketing', words: ['ticket', 'ticketing', 'tiket'], link: 'projects' },
    { id: 'win', words: ['award', 'awards', 'win', 'won', 'champion', 'asean', 'juara', 'prestasi', 'penghargaan', 'trophy', 'biggest', 'hackathon', 'tropicrew'], link: 'awards' },
    { id: 'project', words: ['project', 'projects', 'nutrisense', 'nexus', 'stunting', 'harvard', 'hsil', 'proyek'], link: 'projects' },
    { id: 'contact', words: ['contact', 'email', 'hire', 'reach', 'linkedin', 'phone', 'whatsapp', 'kontak', 'hubungi', 'menghubungi', 'wa'], link: 'contact' },
    { id: 'now', words: ['now', 'current', 'currently', 'job', 'work', 'working', 'waresix', 'mobitech', 'role', 'kerja', 'sekarang', 'pekerjaan', 'wms', 'erp'], link: 'experience' },
    { id: 'study', words: ['study', 'studies', 'school', 'university', 'binus', 'gpa', 'ipk', 'kuliah', 'kampus', 'education', 'student', 'teaching'], link: 'experience' },
    { id: 'skills', words: ['skill', 'skills', 'stack', 'tools', 'language', 'languages', 'python', 'sap', 'laravel', 'flutter', 'keahlian', 'certification', 'sertifikasi'], link: 'projects' },
    { id: 'hello', words: ['hi', 'hello', 'hey', 'halo', 'hai', 'pagi', 'siang', 'malam', 'yo'] },
  ];
  const REPLY = {
    en: {
      hello: "Hi! I'm KennyBot, a small demo of the kind of chatbot Kenneth builds at MobiChat. Ask me about his work, projects, awards or how to reach him.",
      now: 'Since February 2026 Kenneth has two roles at Waresix (Mobitech): Product & AI Chatbot Specialist for MobiChat, and Project & Product Manager for WMS and ERP projects.',
      chatbot: 'He designs chatbots for retail and fashion brands: knowledge bases, system prompts and brand personas that reply in natural Bahasa Indonesia. When a question gets too complex, the bot hands the customer over to a human.',
      ticketing: "He built a ticketing system for Waresix's existing platform, so issues and requests are logged, assigned and tracked to resolution in one place, and clients can see where everything stands.",
      win: 'Two highlights. ASEAN Data Science Explorers 2025: National Champion, then Most Favorite Team at the Regional Finals in Kuala Lumpur. Harvard HSIL Hackathon 2026 with team TropiCrew: 3rd place at the national stage (Bandung hub), then a Top 50 team at the international stage.',
      project: 'NutriSense & N.E.X.U.S. is an AI-powered health-tech solution against child stunting in Indonesia: a mobile app plus a smart logistics network. It was also developed within the Harvard HSIL initiative.',
      study: 'He studies Business Information Systems at BINUS University International (Sep 2023 to Jan 2027) with a 3.95 cumulative GPA, and was a teaching assistant for Programming for Business.',
      skills: 'Python, Java, PHP, SQL and HTML/CSS; Laravel, Bootstrap and Flutter; AI chatbot design, prompt engineering, knowledge bases, ticketing systems and WMS/ERP implementation. Plus SAP S/4HANA and Google Cloud certifications.',
      contact: 'Email kenneth.kurniawan12@gmail.com or find him on LinkedIn. The contact page has both, with copy buttons.',
      fallback: "That's outside my knowledge base, so I'm handing you over to the real Kenneth: kenneth.kurniawan12@gmail.com. A clean handover to a human is part of every bot he designs.",
      'lang-id': 'Oke, kita lanjut pakai Bahasa Indonesia ya!',
      'lang-en': "Switched to English. What would you like to know?",
      sub: 'Demo bot · scripted answers',
      placeholder: 'Ask about Kenneth…',
      quick: [["What's he doing now?", 'now'], ['Biggest win?', 'win'], ['Tell me about NutriSense', 'project'], ['How do I reach him?', 'contact'], ['Bahasa Indonesia, please', 'lang-id']],
    },
    id: {
      hello: 'Halo! Aku KennyBot, demo kecil dari chatbot yang biasa Kenneth bangun di MobiChat. Tanya saja soal pekerjaan, proyek, prestasi, atau cara menghubunginya.',
      now: 'Sejak Februari 2026 Kenneth memegang dua peran di Waresix (Mobitech): Product & AI Chatbot Specialist untuk MobiChat, serta Project & Product Manager untuk proyek WMS dan ERP.',
      chatbot: 'Dia merancang chatbot untuk brand retail dan fashion: knowledge base, system prompt, dan persona brand yang membalas dengan Bahasa Indonesia yang natural. Kalau pertanyaannya terlalu rumit, bot meneruskan pelanggan ke tim manusia.',
      ticketing: 'Dia membangun sistem ticketing untuk platform Waresix, supaya setiap kendala dan permintaan tercatat, ditugaskan, dan dipantau sampai selesai di satu tempat.',
      win: 'Dua sorotan. ASEAN Data Science Explorers 2025: Juara Nasional, lalu Most Favorite Team di Regional Finals Kuala Lumpur. Harvard HSIL Hackathon 2026 bersama tim TropiCrew: juara 3 di tahap nasional (Bandung hub), lalu masuk Top 50 tim di tahap internasional.',
      project: 'NutriSense & N.E.X.U.S. adalah solusi health-tech berbasis AI untuk melawan stunting pada anak di Indonesia: aplikasi mobile plus jaringan logistik pintar. Proyek ini juga dikembangkan dalam inisiatif Harvard HSIL.',
      study: 'Kenneth kuliah Business Information Systems di BINUS University International (Sep 2023 sampai Jan 2027) dengan IPK kumulatif 3,95, dan pernah jadi asisten dosen Programming for Business.',
      skills: 'Python, Java, PHP, SQL, dan HTML/CSS; Laravel, Bootstrap, dan Flutter; desain chatbot AI, prompt engineering, knowledge base, sistem ticketing, dan implementasi WMS/ERP. Ditambah sertifikasi SAP S/4HANA dan Google Cloud.',
      contact: 'Email ke kenneth.kurniawan12@gmail.com atau cari dia di LinkedIn. Halaman kontak punya keduanya, lengkap dengan tombol salin.',
      fallback: 'Itu di luar knowledge base-ku, jadi aku teruskan ke Kenneth langsung: kenneth.kurniawan12@gmail.com. Handover yang rapi ke manusia memang bagian dari setiap bot yang dia rancang.',
      'lang-id': 'Kita sudah pakai Bahasa Indonesia kok. Mau tanya apa?',
      'lang-en': 'Switched to English. What would you like to know?',
      sub: 'Bot demo · jawaban terskrip',
      placeholder: 'Tanya soal Kenneth…',
      quick: [['Sekarang kerja di mana?', 'now'], ['Prestasi terbesar?', 'win'], ['Ceritakan NutriSense', 'project'], ['Cara menghubungi?', 'contact'], ['English, please', 'lang-en']],
    },
  };
  const ID_HINTS = ['apa', 'siapa', 'gimana', 'bagaimana', 'dong', 'kak', 'yang', 'saya', 'aku', 'kamu', 'bisa', 'di', 'mana', 'ceritakan', 'tolong', 'dia'];

  function kennybot() {
    let lang = 'en', opened = false;
    const launch = document.createElement('button');
    launch.type = 'button';
    launch.className = 'kb-launch magnetic';
    launch.setAttribute('aria-expanded', 'false');
    launch.setAttribute('aria-controls', 'kb-panel');
    launch.innerHTML = `<span class="kb-avatar">${ICON.bot}</span><span class="kb-label">Ask KennyBot</span>`;
    launch.setAttribute('aria-label', 'Ask KennyBot');
    const panel = document.createElement('section');
    panel.id = 'kb-panel';
    panel.className = 'kb-panel';
    panel.hidden = true;
    panel.setAttribute('aria-label', 'KennyBot chat');
    panel.innerHTML = `
      <div class="kb-head">
        <span class="kb-avatar">${ICON.bot}</span>
        <div class="who"><b>KennyBot</b><small class="kb-sub"></small></div>
        <button type="button" class="kb-icon-btn kb-lang" aria-label="Switch language">ID</button>
        <button type="button" class="kb-icon-btn kb-close" aria-label="Close chat">${ICON.x}</button>
      </div>
      <div class="kb-log" role="log" aria-live="polite"></div>
      <div class="kb-quick" aria-label="Suggested questions"></div>
      <form class="kb-form">
        <label class="sr-only" for="kb-input">Message KennyBot</label>
        <input id="kb-input" autocomplete="off" maxlength="200">
        <button class="kb-send" type="submit" aria-label="Send">${ICON.send}</button>
      </form>`;
    document.body.append(panel, launch);
    const log = $('.kb-log', panel), quick = $('.kb-quick', panel), input = $('#kb-input', panel);

    const paint = () => {
      const R = REPLY[lang];
      $('.kb-sub', panel).textContent = R.sub;
      $('.kb-lang', panel).textContent = lang === 'en' ? 'ID' : 'EN';
      $('.kb-lang', panel).setAttribute('aria-label', lang === 'en' ? 'Ganti ke Bahasa Indonesia' : 'Switch to English');
      input.placeholder = R.placeholder;
      quick.innerHTML = '';
      R.quick.forEach(([label, intent]) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip';
        b.textContent = label;
        b.addEventListener('click', () => ask(label, intent));
        quick.append(b);
      });
    };
    const bubble = (who, text, linkKey) => {
      const m = document.createElement('div');
      m.className = 'msg ' + who;
      m.textContent = text;
      if (linkKey && LINK[linkKey]) {
        const [href, color, label] = LINK[linkKey];
        const a = document.createElement('a');
        a.className = 'go';
        a.href = href;
        a.dataset.color = color;
        a.dataset.label = linkKey[0].toUpperCase() + linkKey.slice(1);
        a.innerHTML = `<span></span>${ICON.arrow}`;
        a.firstChild.textContent = label[lang];
        m.append(document.createElement('br'), a);
      }
      log.append(m);
      log.scrollTop = log.scrollHeight;
      return m;
    };
    const detect = text => {
      const words = text.toLowerCase().match(/[a-z0-9]+/g) || [];
      if (lang === 'en' && words.filter(w => ID_HINTS.includes(w)).length >= 2) lang = 'id';
      const hit = INTENTS.find(it => it.words.some(w => words.includes(w)));
      return hit ? hit.id : 'fallback';
    };
    const reply = intent => {
      if (intent === 'lang-id') lang = 'id';
      if (intent === 'lang-en') lang = 'en';
      paint();
      const typing = document.createElement('div');
      typing.className = 'msg bot typing';
      typing.setAttribute('aria-label', 'KennyBot is typing');
      typing.innerHTML = '<i></i><i></i><i></i>';
      log.append(typing);
      log.scrollTop = log.scrollHeight;
      const it = INTENTS.find(x => x.id === intent);
      setTimeout(() => {
        typing.remove();
        bubble('bot', REPLY[lang][intent] || REPLY[lang].fallback, it && it.link);
      }, reduce ? 150 : 650 + Math.random() * 450);
    };
    const ask = (text, intent) => {
      bubble('me', text);
      reply(intent || detect(text));
    };
    const open = (question) => {
      panel.hidden = false;
      launch.setAttribute('aria-expanded', 'true');
      if (!opened) { opened = true; paint(); bubble('bot', REPLY[lang].hello); }
      if (question) ask(question);
      input.focus({ preventScroll: true });
    };
    const close = () => {
      panel.hidden = true;
      launch.setAttribute('aria-expanded', 'false');
      launch.focus({ preventScroll: true });
    };
    launch.addEventListener('click', () => (panel.hidden ? open() : close()));
    $('.kb-close', panel).addEventListener('click', close);
    $('.kb-lang', panel).addEventListener('click', () => { lang = lang === 'en' ? 'id' : 'en'; reply(lang === 'id' ? 'lang-id' : 'lang-en'); });
    panel.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    $('.kb-form', panel).addEventListener('submit', e => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      ask(text);
    });
    $$('[data-open-chat]').forEach(b => b.addEventListener('click', () => open(b.dataset.ask)));
  }

  /* Projects page: a draggable 3D cube with one skill group per side. */
  function cube() {
    const stage = $('#cube-stage');
    if (!stage) return;
    const el = $('.cube', stage);
    const btns = $$('[data-face]');
    const FACES = [[-12, 0], [-12, -90], [-12, -180], [-12, 90], [-90, 0], [90, 0]];
    let rx = -18, ry = -32, vx = 0, vy = 0, target = null, dragging = false, auto = !reduce, last = null, running = false;
    const apply = () => { el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`; };
    const press = i => btns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    const tick = () => {
      if (!running) return;
      requestAnimationFrame(tick);
      if (target) {
        rx += (target[0] - rx) * 0.12;
        ry += (target[1] - ry) * 0.12;
        if (Math.abs(target[0] - rx) < 0.05 && Math.abs(target[1] - ry) < 0.05) { [rx, ry] = target; target = null; }
      } else if (!dragging) {
        rx += vx; ry += vy; vx *= 0.94; vy *= 0.94;
        if (auto) ry += 0.2;
      }
      apply();
    };
    const show = i => {
      auto = false;
      const [fx, fy] = FACES[i];
      const ty = fy + 360 * Math.round((ry - fy) / 360);
      target = [fx, ty];
      press(i);
      if (reduce) { [rx, ry] = target; target = null; apply(); }
    };
    btns.forEach(b => b.addEventListener('click', () => show(+b.dataset.face)));
    stage.addEventListener('pointerdown', e => {
      dragging = true; auto = false; target = null; last = [e.clientX, e.clientY];
      stage.setPointerCapture(e.pointerId);
      stage.classList.add('dragging');
    });
    stage.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - last[0], dy = e.clientY - last[1];
      last = [e.clientX, e.clientY];
      vy = dx * 0.35; vx = -dy * 0.35;
      ry += vy; rx = Math.max(-90, Math.min(90, rx + vx));
      press(-1);
      if (reduce) apply();
    });
    const end = () => { dragging = false; stage.classList.remove('dragging'); if (reduce) { vx = vy = 0; } };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    apply();
    if (reduce) return;
    new IntersectionObserver(([e]) => {
      const was = running;
      running = e.isIntersecting;
      if (running && !was) tick();
    }).observe(stage);
  }

  /* Contact page: compose a ticket locally; nothing is sent from the page. */
  function ticketDesk() {
    const form = $('#ticket-form');
    if (!form) return;
    const out = $('#issued');
    const empty = $('#empty-desk');
    const check = (el, msg) => {
      const err = $('#' + el.id + '-err');
      const bad = !el.value.trim();
      el.setAttribute('aria-invalid', String(bad));
      err.hidden = !bad;
      err.textContent = bad ? msg : '';
      return !bad;
    };
    const name = $('#t-name'), topic = $('#t-topic'), msg = $('#t-msg');
    [name, msg].forEach(el => el.addEventListener('input', () => {
      if (el.getAttribute('aria-invalid') === 'true' && el.value.trim()) check(el, '');
    }));
    form.addEventListener('submit', e => {
      e.preventDefault();
      const ok = [check(name, 'Add your name so Kenneth knows who to reply to.'), check(msg, 'Write a short message, even one line is fine.')];
      if (ok.includes(false)) { (ok[0] ? msg : name).focus(); return; }
      const d = new Date();
      const id = `KK-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`;
      const subject = `[${id}] ${topic.value} from ${name.value.trim()}`;
      const body = `${msg.value.trim()}\n\n${name.value.trim()}`;
      $('#iss-id', out).textContent = id;
      $('#iss-topic', out).textContent = topic.value;
      $('#iss-from', out).textContent = name.value.trim();
      $('#iss-msg', out).textContent = msg.value.trim();
      $('#iss-copy', out).dataset.copy = `To: kenneth.kurniawan12@gmail.com\nSubject: ${subject}\n\n${body}`;
      $('#iss-mail', out).href = `mailto:kenneth.kurniawan12@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      empty.hidden = true;
      out.hidden = false;
      const r = $('.ticket', out).getBoundingClientRect();
      confetti(r.left + r.width / 2, r.top + 40);
      $('#iss-heading', out).focus();
    });
  }

  if (reduce) $$('svg').forEach(s => s.pauseAnimations && s.pauseAnimations());
  window.KK = { go, token, reduce, fine };
  aurora();
  cursorGlow();
  progress();
  split();
  rotator();
  reveal();
  countUp();
  tilt();
  gates();
  passCode();
  filters();
  expandAll();
  flips();
  tabs();
  celebrate();
  copies();
  kennybot();
  magnetic();
  ticketDesk();
  cube();
})();
