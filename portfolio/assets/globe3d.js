/* Home hero 3D scene: a dotted globe with the JKT → KUL route and the four gate tickets in orbit.
   Click a ticket to board its page; drag to spin. Needs three.js (r128) and site.js (window.KK). */
(() => {
  const stage = document.querySelector('.globe-stage');
  if (!stage) return;
  const fail = () => { stage.closest('.hero-grid').classList.add('no-3d'); stage.hidden = true; };
  if (!window.THREE || !window.KK) return fail();
  const T = THREE;
  const { go, token, reduce } = window.KK;

  let renderer;
  try {
    renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch (err) {
    return fail();
  }
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  stage.prepend(canvas);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 10);
  const color = name => new T.Color(token(name));

  scene.add(new T.AmbientLight(0xffffff, 0.75));
  const key = new T.DirectionalLight(0xffffff, 0.9);
  key.position.set(4, 5, 8);
  scene.add(key);
  const rim = new T.PointLight(color('pink'), 0.8, 20);
  rim.position.set(-5, -2, 3);
  scene.add(rim);

  const world = new T.Group();
  scene.add(world);
  const globe = new T.Group();
  world.add(globe);
  const R = 2;


  /* Occluding core, so the back of the globe and anything orbiting behind it is hidden */
  const core = new T.Mesh(new T.SphereGeometry(R * 0.985, 48, 32), new T.MeshBasicMaterial({ color: new T.Color(token('surface')).lerp(new T.Color(token('blue-soft')), 0.85) }));
  core.renderOrder = -1;
  globe.add(core);

  /* Fibonacci dot sphere */
  const N = 2400;
  const pos = new Float32Array(N * 3), cols = new Float32Array(N * 3);
  const cA = color('blue'), cB = color('blue-deep');
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963;
    pos.set([Math.cos(th) * r * R, y * R, Math.sin(th) * r * R], i * 3);
    const c = cA.clone().lerp(cB, (y + 1) / 2);
    cols.set([c.r, c.g, c.b], i * 3);
  }
  const dotGeo = new T.BufferGeometry();
  dotGeo.setAttribute('position', new T.BufferAttribute(pos, 3));
  dotGeo.setAttribute('color', new T.BufferAttribute(cols, 3));
  globe.add(new T.Points(dotGeo, new T.PointsMaterial({ size: 0.055, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false })));

  /* Equator and a meridian ring */
  const ringMat = new T.MeshBasicMaterial({ color: color('blue'), transparent: true, opacity: 0.4 });
  const equator = new T.Mesh(new T.TorusGeometry(R * 1.002, 0.006, 6, 120), ringMat);
  equator.rotation.x = Math.PI / 2;
  globe.add(equator);

  /* Jakarta → Kuala Lumpur */
  const ll = (lat, lon, r = R) => {
    const phi = (90 - lat) * Math.PI / 180, th = (lon + 180) * Math.PI / 180;
    return new T.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
  };
  const jkt = ll(-6.2, 106.8), kul = ll(3.14, 101.69);
  const sun = color('pink-deep');
  const pulses = [];
  [jkt, kul].forEach(p => {
    const dot = new T.Mesh(new T.SphereGeometry(0.055, 16, 12), new T.MeshBasicMaterial({ color: sun }));
    dot.position.copy(p);
    globe.add(dot);
    const ring = new T.Mesh(new T.RingGeometry(0.07, 0.095, 32), new T.MeshBasicMaterial({ color: sun, transparent: true, side: T.DoubleSide, depthWrite: false }));
    ring.position.copy(p.clone().multiplyScalar(1.003));
    ring.lookAt(p.clone().multiplyScalar(2));
    globe.add(ring);
    pulses.push(ring);
  });
  const mid = jkt.clone().add(kul).multiplyScalar(0.5).normalize().multiplyScalar(R * 1.32);
  const arc = new T.QuadraticBezierCurve3(jkt, mid, kul);
  globe.add(new T.Mesh(new T.TubeGeometry(arc, 48, 0.014, 6), new T.MeshBasicMaterial({ color: sun })));
  const traveler = new T.Mesh(new T.SphereGeometry(0.05, 12, 10), new T.MeshBasicMaterial({ color: color('blue-deep') }));
  globe.add(traveler);
  const baseY = -Math.atan2(mid.x, mid.z);

  /* Ticket gates */
  const GATES = [
    ['experience.html', 'blue', '01', 'Experience', 'blue-deep', 'blue'],
    ['projects.html', 'blend', '02', 'Projects', 'blue-deep', 'pink-deep'],
    ['awards.html', 'pink', '03', 'Awards', 'pink-deep', 'pink'],
    ['contact.html', 'dusk', '04', 'Contact', 'pink-deep', 'blue-deep'],
  ];
  const W = 1.5, H = 0.74, D = 0.06, CR = 0.08, NX = 0.42, NR = 0.09;
  const shape = new T.Shape();
  {
    const w = W / 2, h = H / 2;
    shape.moveTo(-w + CR, -h);
    shape.lineTo(NX - NR, -h);
    shape.absarc(NX, -h, NR, Math.PI, 0, true);
    shape.lineTo(w - CR, -h);
    shape.quadraticCurveTo(w, -h, w, -h + CR);
    shape.lineTo(w, h - CR);
    shape.quadraticCurveTo(w, h, w - CR, h);
    shape.lineTo(NX + NR, h);
    shape.absarc(NX, h, NR, 0, Math.PI, true);
    shape.lineTo(-w + CR, h);
    shape.quadraticCurveTo(-w, h, -w, h - CR);
    shape.lineTo(-w, -h + CR);
    shape.quadraticCurveTo(-w, -h, -w + CR, -h);
  }
  const bodyGeo = new T.ExtrudeGeometry(shape, { depth: D, bevelEnabled: false, curveSegments: 12 });
  bodyGeo.translate(0, 0, -D / 2);
  const faceGeo = new T.PlaneGeometry(W, H);
  const ink = token('ink'), muted = token('muted'), white = token('surface');
  const labels = [];

  /* White ticket, gradient stub: the same treatment as the page tickets */
  const drawLabel = (cv, num, title, c1, c2) => {
    const ctx = cv.getContext('2d'), cw = cv.width, ch = cv.height;
    const k = cw / W, sx = (NX + W / 2) * k, nr = NR * k, cr = CR * k;
    ctx.clearRect(0, 0, cw, ch);
    ctx.save();
    ctx.fillStyle = c1;
    ctx.beginPath();
    ctx.moveTo(sx, 0); ctx.lineTo(cw - cr, 0); ctx.quadraticCurveTo(cw, 0, cw, cr);
    ctx.lineTo(cw, ch - cr); ctx.quadraticCurveTo(cw, ch, cw - cr, ch); ctx.lineTo(sx, ch); ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(sx, 0, nr, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(sx, ch, nr, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = c1;
    ctx.font = '600 30px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillText('GATE ' + num, 46, 76);
    let size = 96;
    do { ctx.font = `900 ${size}px Unbounded, "Arial Black", sans-serif`; size -= 4; } while (ctx.measureText(title).width > sx - 80 && size > 40);
    ctx.fillStyle = c1;
    ctx.fillText(title, 42, 220);
    ctx.fillStyle = muted;
    ctx.font = '600 26px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillText('TAP TO BOARD', 46, 318);
    ctx.save();
    ctx.setLineDash([16, 12]);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(14,20,64,0.18)';
    ctx.beginPath(); ctx.moveTo(sx - 4, nr + 8); ctx.lineTo(sx - 4, ch - nr - 8); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = white;
    const bx = sx + 34, bw = cw - bx - 40;
    for (let x = 0, n = 0; x < bw; n++) {
      const bar = [4, 2, 6, 3, 2, 5][n % 6];
      ctx.fillRect(bx + x, 64, bar, 150);
      x += bar + [4, 6, 3, 5][n % 4];
    }
    const ax = sx + (cw - sx) / 2, ay = 290;
    ctx.beginPath(); ctx.arc(ax, ay, 40, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = c1; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(ax - 16, ay); ctx.lineTo(ax + 16, ay); ctx.moveTo(ax + 3, ay - 13); ctx.lineTo(ax + 16, ay); ctx.lineTo(ax + 3, ay + 13); ctx.stroke();
  };

  const tickets = GATES.map(([href, name, num, title, k1, k2], i) => {
    const c1 = token(k1), c2 = token(k2);
    const g = new T.Group();
    const body = new T.Mesh(bodyGeo, new T.MeshStandardMaterial({ color: white, emissive: white, emissiveIntensity: 0.45, roughness: 0.5, metalness: 0.05 }));
    const cv = document.createElement('canvas');
    cv.width = 768; cv.height = 379;
    drawLabel(cv, num, title, c1, c2);
    const tex = new T.CanvasTexture(cv);
    tex.anisotropy = 4;
    labels.push([cv, num, title, c1, c2, tex]);
    const mat = new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
    const front = new T.Mesh(faceGeo, mat);
    front.position.z = D / 2 + 0.002;
    const back = new T.Mesh(faceGeo, mat);
    back.position.z = -D / 2 - 0.002;
    back.rotation.y = Math.PI;
    g.add(body, front, back);
    g.userData = { href, name, title, phase: i * Math.PI / 2, hover: 0 };
    world.add(g);
    return g;
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      labels.forEach(([cv, num, title, c1, c2, tex]) => { drawLabel(cv, num, title, c1, c2); tex.needsUpdate = true; });
      if (reduce) render(performance.now());
    });
  }
  const ringTilt = new T.Euler(0.42, 0, 0.38);
  const ORBIT = 2.8;

  /* Layout */
  let scale = 1;
  const layout = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const visH = 2 * camera.position.z * Math.tan(camera.fov * Math.PI / 360);
    const visW = visH * camera.aspect;
    scale = Math.min(1.2, visW / 6.9, visH / 6.6);
    world.scale.setScalar(scale);
  };

  /* Interaction */
  const ray = new T.Raycaster();
  const ndc = new T.Vector2(-9, -9);
  let hovered = null, dragging = false, moved = 0, last = null;
  let offY = 0, offX = 0, velY = 0, px = 0, py = 0;
  const pick = () => {
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(tickets, true)[0];
    let g = hit ? hit.object : null;
    while (g && !tickets.includes(g)) g = g.parent;
    if (g) {
      // ignore tickets hidden behind the globe
      const coreHit = ray.intersectObject(core)[0];
      if (coreHit && coreHit.distance < hit.distance) g = null;
    }
    hovered = g;
    canvas.style.cursor = dragging ? 'grabbing' : g ? 'pointer' : 'grab';
  };
  const toNdc = e => {
    const r = canvas.getBoundingClientRect();
    ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    px = ndc.x; py = ndc.y;
  };
  canvas.addEventListener('pointerdown', e => {
    dragging = true; moved = 0; last = [e.clientX, e.clientY];
    canvas.setPointerCapture(e.pointerId);
    toNdc(e); pick();
  });
  canvas.addEventListener('pointermove', e => {
    toNdc(e);
    if (dragging) {
      const dx = e.clientX - last[0], dy = e.clientY - last[1];
      moved += Math.abs(dx) + Math.abs(dy);
      last = [e.clientX, e.clientY];
      velY = dx * 0.006;
      offY += velY;
      offX = Math.max(-0.6, Math.min(0.6, offX + dy * 0.004));
    }
    pick();
    if (reduce) render(performance.now());
  });
  const release = e => {
    if (!dragging) return;
    dragging = false;
    if (moved < 8 && hovered) {
      const { href, name, title } = hovered.userData;
      go(href, name, title, e.clientX, e.clientY);
    }
    pick();
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', () => { dragging = false; });
  canvas.addEventListener('pointerleave', () => { held = false; if (!dragging) { ndc.set(-9, -9); hovered = null; px = py = 0; } });
  canvas.addEventListener('pointerenter', () => { held = true; });

  /* The orbit holds still under the pointer and stops for good with the pause button. */
  let held = false, paused = false;
  const pause = document.createElement('button');
  pause.type = 'button';
  pause.className = 'globe-pause';
  pause.setAttribute('aria-pressed', 'false');
  pause.textContent = 'Pause motion';
  pause.addEventListener('click', () => {
    paused = !paused;
    pause.setAttribute('aria-pressed', String(paused));
    pause.textContent = paused ? 'Play motion' : 'Pause motion';
  });
  if (!reduce) stage.append(pause);

  /* Frame */
  let clock = 0, lastNow = performance.now();
  const camPos = new T.Vector3();
  function render(now) {
    const dt = Math.min(0.1, Math.max(0, (now - lastNow) / 1000));
    lastNow = now;
    if (!paused && !held) clock += dt;
    const t = reduce ? 2.2 : clock;
    if (!dragging) {
      offY += velY; velY *= 0.94;
      offY *= 0.985; offX *= 0.96;
    }
    globe.rotation.y = baseY + Math.sin(t * 0.22) * 0.55 + offY;
    globe.rotation.x = 0.12 + offX;
    world.rotation.y += ((reduce ? 0 : px * 0.18) - world.rotation.y) * 0.06;
    world.rotation.x += ((reduce ? 0 : -py * 0.12) - world.rotation.x) * 0.06;

    const k = (t * 0.45) % 1;
    traveler.position.copy(arc.getPoint(k));
    pulses.forEach((p, i) => {
      const f = (t * 0.7 + i * 0.5) % 1;
      p.scale.setScalar(1 + f * 2.2);
      p.material.opacity = 1 - f;
    });

    camera.getWorldPosition(camPos);
    tickets.forEach((g, i) => {
      const a = t * 0.32 + g.userData.phase;
      g.position.set(Math.cos(a) * ORBIT, 0, Math.sin(a) * ORBIT).applyEuler(ringTilt);
      g.position.y += Math.sin(t * 1.4 + i) * 0.08;
      g.lookAt(camPos);
      g.rotateZ(Math.sin(t * 0.9 + i * 1.7) * 0.14);
      g.rotateY(Math.sin(t * 0.7 + i) * 0.35);
      g.userData.hover += ((g === hovered ? 1 : 0) - g.userData.hover) * 0.15;
      g.scale.setScalar(1 + g.userData.hover * 0.22);
    });
    renderer.render(scene, camera);
  }

  /* 30fps is plenty for a slow drift; skip frames while the page is scrolling so scroll stays smooth. */
  let running = false, onScreen = true, lastFrame = 0, scrollingUntil = 0;
  window.addEventListener('scroll', () => { scrollingUntil = performance.now() + 160; }, { passive: true });
  const loop = now => {
    if (!running) return;
    requestAnimationFrame(loop);
    if (now - lastFrame < 32 || (now < scrollingUntil && !dragging)) return;
    lastFrame = now;
    render(now);
  };
  const setRunning = () => {
    const should = !reduce && onScreen && !document.hidden;
    if (should && !running) { running = true; requestAnimationFrame(loop); }
    if (!should) running = false;
  };
  layout();
  render(performance.now());
  if ('ResizeObserver' in window) new ResizeObserver(() => { layout(); render(performance.now()); }).observe(stage);
  else window.addEventListener('resize', () => { layout(); render(performance.now()); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; setRunning(); }).observe(stage);
  }
  document.addEventListener('visibilitychange', setRunning);
  setRunning();
})();
