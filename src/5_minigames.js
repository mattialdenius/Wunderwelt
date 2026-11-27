
/* ============ 6. MINISPIELE ============
   Neues Minispiel: Objekt mit enter/update/draw/down anlegen, am Ende finishMini('id') aufrufen
   und in MINIGAMES eintragen. */
function miniExit() { const r = Math.max(View.btn / 2 - 6, 44); return { x: 14 + r, y: 14 + r, r }; }
function drawMiniExit(c) { const e = miniExit(); drawRoundBtn(c, e.x, e.y, e.r, { color: '#ffb199', icon: 'home', iconScale: 0.9 }); }
// Jedes Minispiel hat drei Stufen. Wer eine Stufe schafft, lässt seinen Kristall wachsen (Stufe 3 = golden).
const miniLevel = id => Math.min(Save.data.level[id] || 0, 2);
function finishMini(id) { if (Game.pending) return; const up = (Save.data.level[id] || 0) < 3; if (up) Save.data.level[id] = (Save.data.level[id] || 0) + 1; Save.data.crystals[id] = true; Save.data.wallet = (Save.data.wallet || 0) + 1; Save.store(); Game.go(World, { from: id, reward: up ? id : null }); }
function miniWin(scene) { scene.winT = 0; Sfx.play('win'); Voice.say('win'); ScreenFx.confetti(VW, 80); }
function drawSparkleLine(c, x1, y1, x2, y2, t) { const n = Math.max(3, Math.floor(dist(x1, y1, x2, y2) / 46)); for (let i = 1; i < n; i++) { const k = i / n, tw = Math.max(0, Math.sin(t * 6 - i * 0.7)); c.fillStyle = 'rgba(255,225,90,' + (0.5 + tw * 0.5) + ')'; sparklePath(c, lerp(x1, x2, k), lerp(y1, y2, k) - Math.sin(k * Math.PI) * 30, 8 + tw * 7); c.fill(); } }
// Zauberhelfer: ein Glitzerknopf unter dem Haus-Knopf, nur wenn man einen hat. Jeder Tipp hilft einmal.
const HELPER_OF = { owl: 'feather', snail: 'feather', squirrel: 'feather', fox: 'lens', frog: 'lily', dragon: 'slow' };
function helperBtn() { const e = miniExit(); return { x: e.x, y: e.y + e.r * 2 + 22, r: e.r }; }
function helperCount(id) { return ((Save.data.helpers || {})[HELPER_OF[id]]) || 0; }
function drawHelperBtn(c, id) {
  const n = helperCount(id); if (!n) return; const b = helperBtn();
  drawRoundBtn(c, b.x, b.y, b.r, { color: '#f3e8ff', glow: true }); drawThing(c, HELPER_OF[id], b.x, b.y, b.r * 1.1);
  circ(c, b.x + b.r * 0.72, b.y + b.r * 0.72, 14); fs(c, '#8a6ad8', '#fff', 2); c.font = '800 15px system-ui, sans-serif'; c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(n), b.x + b.r * 0.72, b.y + b.r * 0.72 + 1); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
}
function helperDown(p, scene) {
  if (!helperCount(scene.id)) return false; const b = helperBtn(); if (!hit(p, b.x, b.y, b.r + 6)) return false;
  if (scene.winT >= 0 || !scene.useHelper()) { Sfx.play('tap'); return true; }
  Save.data.helpers[HELPER_OF[scene.id]]--; Save.store(); Sfx.play('crystal'); Voice.say('helper_use'); ScreenFx.burst(b.x, b.y, 16, { g: 60 });
  return true;
}
// Fortschritt oben rechts: ein Stern pro Runde
function drawRoundStars(c, n, done) { for (let i = 0; i < n; i++) { starPath(c, VW - 40 - (n - 1 - i) * 36, 40, 14); fs(c, i < done ? '#ffd54a' : 'rgba(255,255,255,0.7)', '#f0b429', 2); } }

/* ---------- Eule: Muster fortsetzen ----------
   u = Muster-Baustein, n = Länge der Reihe, gaps = Stellen der Lücken (fehlt = letzte Stelle), k = Anzahl Auswahl-Steine */
const OWL_ROUNDS = [
  [{ u: 'AB', n: 5 }, { u: 'AAB', n: 6 }, { u: 'ABC', n: 6 }, { u: 'ABB', n: 6 }, { u: 'AB', n: 6, gaps: [2] }],
  [{ u: 'AABB', n: 7 }, { u: 'ABC', n: 7, gaps: [3] }, { u: 'ABAC', n: 8, k: 4 }, { u: 'AAB', n: 8, gaps: [4] }, { u: 'AB', n: 7, gaps: [2, 6] }],
  [{ u: 'ABCB', n: 9, gaps: [5], k: 4 }, { u: 'AABC', n: 9, gaps: [2], k: 4 }, { u: 'ABC', n: 9, gaps: [1, 8], k: 4 }, { u: 'ABBCC', n: 10, k: 4 }, { u: 'ABCD', n: 10, gaps: [3, 9], k: 4 }]
];
const OwlGame = {
  id: 'owl',
  enter() { this.lv = miniLevel('owl'); this.rounds = OWL_ROUNDS[this.lv]; this.round = 0; this.winT = -1; this.t = 0; this.wrongs = 0; this.setup(); Voice.say(this.lv ? 'owl_intro2' : 'owl_intro'); },
  setup() {
    const d = this.rounds[this.round], T = shuffle([0, 1, 2, 3]);
    this.seq = Array.from({ length: d.n }, (_, i) => T['ABCD'.indexOf(d.u[i % d.u.length])]);
    this.gaps = (d.gaps || [d.n - 1]).slice().sort((a, b) => a - b); this.gi = 0; this.filled = [];
    this.opts = shuffle(T.slice(0, d.k || 3));
    this.state = 'intro'; this.st = 0; this.shown = 0; this.fly = null; this.idle = 0; this.hintT = 0; this.bump = -1; this.bumpT = 0; this.shake = 0;
    if (this.round > 0) Voice.say(this.gaps.length > 1 ? 'owl_two' : 'owl_next');
    else if (this.gaps.length > 1) Voice.say('owl_two', { queue: true });
  },
  get gap() { return this.gaps[this.gi]; },
  get ans() { return this.seq[this.gap]; },
  isGap(i) { return this.gaps.includes(i) && !this.filled.includes(i); },
  layout() {
    const n = this.seq.length, k = this.opts.length, gap = Math.min(104, (VW - 90) / n), x0 = VW / 2 - (n - 1) * gap / 2;
    const br = Math.max(View.btn / 2 + 6, 60), sp = Math.min(200, (VW - 270) / (k - 1));
    return { gap, y: 268, gr: gap * 0.33, slots: Array.from({ length: n }, (_, i) => x0 + i * gap), br, opts: this.opts.map((_, i) => ({ x: VW / 2 + (i - (k - 1) / 2) * sp + 30, y: VH - br - 24 })), uni: { x: 78, y: VH - 14 } };
  },
  update(dt) {
    this.t += dt; this.st += dt; if (this.hintT > 0) this.hintT -= dt; if (this.bumpT > 0) this.bumpT -= dt * 3; if (this.shake > 0) this.shake -= dt * 2.5;
    if (this.winT >= 0) { this.winT += dt; if (this.winT > 2.8) finishMini('owl'); return; }
    if (this.state === 'intro') { const k = Math.floor(this.st / 0.34); if (k > this.shown && this.shown < this.seq.length) { if (!this.gaps.includes(this.shown)) Sfx.play('note', GEMS[this.seq[this.shown]].tone); this.shown++; } if (this.st > this.seq.length * 0.34 + 0.5) { this.state = 'choose'; this.idle = 0; } }
    else if (this.state === 'choose') { this.idle += dt; if (this.idle > CONFIG.hintDelay) this.hint(); }
    else if (this.state === 'fly') {
      this.fly.t += dt / 0.4;
      if (this.fly.t >= 1) {
        const L = this.layout();
        if (this.fly.ok) {
          this.filled.push(this.gap); ScreenFx.burst(L.slots[this.gap], L.y, 18, { g: 160 }); this.fly = null; this.wrongs = 0;
          if (this.gi + 1 < this.gaps.length) { this.gi++; this.state = 'choose'; this.idle = 0; Sfx.play('good'); }
          else { this.state = 'right'; this.st = 0; Sfx.play('good'); Voice.say('good'); }
        }
        else { this.state = 'back'; this.fly.t = 0; this.shake = 1; this.wrongs++; Sfx.play('wrong'); Voice.say('try_again'); }
      }
    }
    else if (this.state === 'back') { this.fly.t += dt / 0.35; if (this.fly.t >= 1) { this.fly = null; this.state = 'choose'; this.idle = 0; if (this.wrongs >= 2) { this.wrongs = 0; this.hint(); } } }
    else if (this.state === 'right' && this.st > 1.5) { this.round++; if (this.round >= this.rounds.length) miniWin(this); else this.setup(); }
  },
  hint() { this.idle = 0; this.hintT = 5; Sfx.play('hint'); Voice.say('owl_hint'); },
  draw(c) {
    const L = this.layout(), t = this.t;
    const g = c.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#cfc4ff'); g.addColorStop(0.65, '#ffe1ec'); g.addColorStop(1, '#fff1cf'); c.fillStyle = g; c.fillRect(0, 0, VW, VH);
    c.fillStyle = 'rgba(255,255,255,0.8)'; for (let i = 0; i < 14; i++) { sparklePath(c, (i * 173 + 60) % VW, 30 + (i * 67) % 150, 4 + (Math.sin(t * 2 + i) + 1) * 2.5); c.fill(); }
    c.strokeStyle = '#a67c52'; c.lineWidth = 20; c.lineCap = 'round'; c.beginPath(); c.moveTo(VW / 2 - 190, 156); c.quadraticCurveTo(VW / 2, 136, VW / 2 + 190, 160); c.stroke();
    c.fillStyle = '#84d48f'; [[-180, 150], [-150, 132], [176, 150], [150, 136]].forEach(p => { ell(c, VW / 2 + p[0], p[1], 22, 12, p[0] < 0 ? -0.5 : 0.5); c.fill(); });
    const happy = this.state === 'right' || this.winT >= 0;
    drawActor(c, 'owl', VW / 2, 146, { size: 112, t, happy, lift: happy ? Math.abs(Math.sin(t * 9)) * 12 : 0, noShadow: true });
    // Reihe
    rr(c, L.slots[0] - L.gap * 0.6, L.y - L.gap * 0.56, L.gap * (L.slots.length + 0.2), L.gap * 1.12, 26); fs(c, 'rgba(255,255,255,0.6)');
    for (let i = 0; i < this.seq.length; i++) {
      if (i >= this.shown) continue;
      const wave = this.state === 'right' ? Math.max(0, Math.sin(this.st * 9 - i * 0.7)) * 14 : 0, bp = this.bump === i && this.bumpT > 0 ? Math.sin(this.bumpT * Math.PI) * 12 : 0;
      if (this.isGap(i)) {
        const active = i === this.gap && this.state !== 'intro';
        c.setLineDash([9, 8]); c.strokeStyle = active ? '#a98bff' : 'rgba(169,139,255,0.45)'; c.lineWidth = 4; circ(c, L.slots[i], L.y, L.gr * (active ? 1.05 + Math.sin(t * 5) * 0.08 : 0.95)); c.stroke(); c.setLineDash([]);
        c.fillStyle = active ? 'rgba(169,139,255,0.25)' : 'rgba(169,139,255,0.1)'; c.fill();
      } else drawGem(c, this.seq[i], L.slots[i], L.y - wave - bp, L.gr);
    }
    // Auswahl
    this.opts.forEach((gt, i) => {
      const o = L.opts[i], isHint = this.hintT > 0 && gt === this.ans && this.state === 'choose';
      let gx = o.x, gy = o.y; const flying = this.fly && this.fly.i === i;
      if (flying) { const u = ease(this.fly.t), a = this.state === 'fly' ? u : 1 - u; gx = lerp(o.x, L.slots[this.gap], a); gy = lerp(o.y, L.y, a) - Math.sin(a * Math.PI) * 40; if (this.state === 'back') gx += Math.sin(this.shake * 30) * 8 * this.shake; }
      drawRoundBtn(c, o.x, o.y, L.br, { color: '#fffaf0', glow: isHint, pulse: isHint });
      drawGem(c, gt, gx, gy, L.br * 0.52);
    });
    drawRoundStars(c, this.rounds.length, this.winT >= 0 ? this.rounds.length : this.round);
    const hop = this.state === 'right' || this.winT >= 0 ? Math.abs(Math.sin(t * 8)) * 26 : 0;
    drawActor(c, 'unicorn', L.uni.x, L.uni.y, { size: 112, t, lift: hop, mark: uniMark(), glow: this.hintT > 0 });
    if (this.hintT > 0 && this.state === 'choose') { const o = L.opts[this.opts.indexOf(this.ans)]; drawSparkleLine(c, L.uni.x + 50, L.uni.y - 100, o.x, o.y - L.br, t); }
    drawHelperBtn(c, this.id); drawMiniExit(c);
  },
  useHelper() { if (this.state !== 'choose') return false; this.pickOpt(this.opts.indexOf(this.ans)); return true; },
  pickOpt(i) { if (this.state !== 'choose' || this.winT >= 0) return; this.hintT = 0; this.fly = { i, t: 0, ok: this.opts[i] === this.ans }; this.state = 'fly'; Sfx.play('note', GEMS[this.opts[i]].tone); },
  down(p) {
    const e = miniExit(); if (hit(p, e.x, e.y, e.r + 6)) { Sfx.play('tap'); Game.go(World, { from: 'owl' }); return; }
    if (helperDown(p, this)) return;
    if (this.winT >= 0) return;
    const L = this.layout(); this.idle = 0;
    if (hit(p, L.uni.x, L.uni.y - 55, 60)) { this.hint(); return; }
    for (let i = 0; i < this.shown; i++) if (!this.isGap(i) && hit(p, L.slots[i], L.y, L.gap * 0.5)) { this.bump = i; this.bumpT = 1; Sfx.play('note', GEMS[this.seq[i]].tone); return; }
    for (let i = 0; i < this.opts.length; i++) if (hit(p, L.opts[i].x, L.opts[i].y, L.br + 8)) { this.pickOpt(i); return; }
  },
  key(k) { const n = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3 }[k]; if (n != null && n < this.opts.length) this.pickOpt(n); }
};

/* ---------- Fuchs: Schatten zuordnen ----------
   Pro Stufe zwei Durchgänge. n = Tiere, mirror = Schatten gespiegelt, decoy = Extra-Schatten ohne Tier */
const FOX_FIGS = ['unicorn', 'dragon', 'owl', 'frog', 'butterfly', 'fox', 't'];
const FOX_ROUNDS = [[{ n: 3 }, { n: 4 }], [{ n: 4 }, { n: 5, mirror: true }], [{ n: 5, mirror: true }, { n: 5, mirror: true, decoy: 1 }]];
const FoxGame = {
  id: 'fox',
  enter() {
    this.lv = miniLevel('fox'); this.rounds = FOX_ROUNDS[this.lv]; this.round = 0; this.t = 0; this.winT = -1;
    this.setup(); Voice.say(['fox_intro', 'fox_intro2', 'fox_intro3'][this.lv]);
  },
  setup() {
    const d = this.rounds[this.round]; this.n = d.n; this.mirror = !!d.mirror; this.m = d.n + (d.decoy || 0);
    this.idle = 0; this.hintT = 0; this.sel = -1; this.wrongs = 0; this.nextT = -1;
    const figs = shuffle(FOX_FIGS.slice()), names = figs.slice(0, this.n);
    this.decoy = d.decoy ? figs[this.n] : null;
    const ids = names.map((_, i) => i).concat(d.decoy ? [-1] : []);
    let order; do { order = shuffle(ids.slice()); } while (order.every((v, i) => v === i));
    this.slots = order;                           // slots[j] = Index der Figur, die in Schatten j gehört (-1 = Täusch-Schatten)
    const L = this.layout();
    this.items = names.map((name, i) => ({ name, x: L.home[i].x, y: L.home[i].y + 200, placed: false, drag: null, shake: 0, hop: 0 }));
    if (this.round > 0) Voice.say(d.decoy ? 'fox_decoy' : 'fox_next');
  },
  layout() {
    const line = (n, room) => { const sp = Math.min(235, (VW - room) / Math.max(1, n - 1)); return { sp, xs: Array.from({ length: n }, (_, i) => VW / 2 + (i - (n - 1) / 2) * sp) }; };
    const top = line(this.m, this.m > 3 ? 300 : 250), bot = line(this.n, this.n > 3 ? 420 : 250);
    const card = Math.min(152, top.sp - 14), k = Math.min(card / 152, bot.sp / 170);
    return { card, k, slot: top.xs.map(x => ({ x, y: 168 })), home: bot.xs.map(x => ({ x, y: 400 })), uni: { x: 62, y: VH - 12 }, fox: { x: VW - 64, y: VH - 12 } };
  },
  resize() { const L = this.layout(); this.items.forEach((it, i) => { if (it.drag) return; const tg = it.placed ? L.slot[this.slots.indexOf(i)] : L.home[i]; it.x = tg.x; it.y = tg.y; }); },
  update(dt) {
    this.t += dt; if (this.hintT > 0) this.hintT -= dt;
    const L = this.layout();
    this.items.forEach((it, i) => {
      if (it.shake > 0) it.shake -= dt * 2.5; if (it.hop > 0) it.hop -= dt * 2.5;
      if (it.drag != null) return;
      const tg = it.placed ? L.slot[this.slots.indexOf(i)] : L.home[i], k = Math.min(1, dt * 12);
      it.x = lerp(it.x, tg.x, k); it.y = lerp(it.y, tg.y, k);
    });
    if (this.winT >= 0) { this.winT += dt; if (this.winT > 2.8) finishMini('fox'); return; }
    if (this.nextT >= 0) { this.nextT += dt; if (this.nextT > 1.6) { this.round++; this.setup(); } return; }
    this.idle += dt; if (this.idle > CONFIG.hintDelay) this.hint();
  },
  hint() { this.idle = 0; this.hintT = 5; Sfx.play('hint'); Voice.say('fox_hint'); },
  useHelper() { if (this.nextT >= 0) return false; const i = this.items.findIndex(q => !q.placed && q.drag == null); if (i < 0) return false; this.tryPlace(i, this.slots.indexOf(i)); return true; },
  tryPlace(i, j) {
    const it = this.items[i], L = this.layout(); this.sel = -1;
    if (this.slots[j] === i) {
      it.placed = true; it.hop = 1; Sfx.play('good'); ScreenFx.burst(L.slot[j].x, L.slot[j].y, 18, { g: 160 }); this.wrongs = 0;
      if (this.items.every(q => q.placed)) { if (this.round + 1 >= this.rounds.length) miniWin(this); else { this.nextT = 0; Sfx.play('win'); Voice.say('good'); } }
      else Voice.say('good');
    } else { it.shake = 1; this.wrongs++; Sfx.play('wrong'); Voice.say('try_again'); if (this.wrongs >= 2) { this.wrongs = 0; this.hintT = 5; } }
  },
  draw(c) {
    const L = this.layout(), t = this.t;
    const g = c.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#fff0c9'); g.addColorStop(0.55, '#e3f6c8'); g.addColorStop(1, '#bfe8b4'); c.fillStyle = g; c.fillRect(0, 0, VW, VH);
    c.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(VW * 0.5 + (i - 2) * 60, -20); c.lineTo(VW * 0.5 + (i - 2) * 300 - 60, VH); c.lineTo(VW * 0.5 + (i - 2) * 300 + 60, VH); c.closePath(); c.fill(); }
    c.fillStyle = '#a6dd9e'; ell(c, VW / 2, VH + 70, VW * 0.75, 170); c.fill();
    const hintI = this.hintT > 0 ? this.items.findIndex(q => !q.placed) : -1;
    L.slot.forEach((s, j) => {
      const h = L.card / 2, want = this.slots[j], isHint = hintI >= 0 && hintI === want;
      rr(c, s.x - h, s.y - h, L.card, L.card, 26); fs(c, '#fffdf5', isHint ? '#ffd54a' : '#e6d9bd', isHint ? 6 : 3);
      const name = want < 0 ? this.decoy : this.items[want].placed ? null : this.items[want].name;
      if (name) { c.save(); c.translate(s.x, 0); if (this.mirror) c.scale(-1, 1); drawSilhouette(c, name, 0, s.y + 56 * L.card / 152, 112 * L.card / 152); c.restore(); }
    });
    const order = this.items.map((_, i) => i).sort((a, b) => (this.items[a].drag != null) - (this.items[b].drag != null));
    for (const i of order) {
      const it = this.items[i], sx = it.shake > 0 ? Math.sin(it.shake * 30) * 9 * it.shake : 0, wig = hintI === i ? Math.sin(t * 10) * 4 : 0;
      const k = it.placed ? L.card / 152 : L.k;
      if (this.sel === i && it.drag == null) { c.fillStyle = 'rgba(255,225,90,0.5)'; circ(c, it.x, it.y, 74 * k); c.fill(); }
      drawActor(c, it.name, it.x + sx + wig, it.y + 56 * k, { size: (it.drag != null ? 124 : 112) * k, t: it.placed || it.drag != null ? t : 0.5, lift: hopLift(it.hop, 26) + (it.drag != null ? 8 : 0), mark: it.name === 'unicorn' ? uniMark() : null });
    }
    if (hintI >= 0 && this.items[hintI].drag == null) { const it = this.items[hintI], s = L.slot[this.slots.indexOf(hintI)]; drawSparkleLine(c, it.x, it.y - 30, s.x, s.y + 40, t); }
    const win = this.winT >= 0 || this.nextT >= 0;
    drawRoundStars(c, this.rounds.length, this.winT >= 0 ? this.rounds.length : this.round + (this.nextT >= 0 ? 1 : 0));
    drawActor(c, 'unicorn', L.uni.x, L.uni.y, { size: 96, t, lift: win ? Math.abs(Math.sin(t * 8)) * 26 : 0, mark: uniMark(), glow: this.hintT > 0 });
    drawActor(c, 'fox', L.fox.x, L.fox.y, { size: 104, t, lift: win ? Math.abs(Math.sin(t * 8 + 1)) * 20 : 0 });
    drawHelperBtn(c, this.id); drawMiniExit(c);
  },
  down(p) {
    const e = miniExit(); if (hit(p, e.x, e.y, e.r + 6)) { Sfx.play('tap'); Game.go(World, { from: 'fox' }); return; }
    if (helperDown(p, this)) return;
    if (this.winT >= 0 || this.nextT >= 0) return;
    const L = this.layout(); this.idle = 0;
    for (let i = 0; i < this.n; i++) { const it = this.items[i]; if (!it.placed && it.drag == null && hit(p, it.x, it.y, 78 * L.k)) { it.drag = p.id; it.ox = it.x - p.x; it.oy = it.y - p.y; this.hintT = 0; Sfx.play('pop'); return; } }
    if (this.sel >= 0) for (let j = 0; j < this.m; j++) if (hit(p, L.slot[j].x, L.slot[j].y, L.card * 0.6) && (this.slots[j] < 0 || !this.items[this.slots[j]].placed)) { this.tryPlace(this.sel, j); return; }
    if (hit(p, L.uni.x, L.uni.y - 50, 56)) this.hint();
  },
  move(p) { for (const it of this.items) if (it.drag === p.id) { it.x = p.x + it.ox; it.y = p.y + it.oy; this.idle = 0; } },
  up(p) {
    const L = this.layout();
    this.items.forEach((it, i) => {
      if (it.drag !== p.id) return; it.drag = null; this.idle = 0;
      let best = -1, bd = Math.max(80, L.card * 0.7); for (let j = 0; j < this.m; j++) { if (this.slots[j] >= 0 && this.items[this.slots[j]].placed) continue; const d = dist(it.x, it.y, L.slot[j].x, L.slot[j].y); if (d < bd) { bd = d; best = j; } }
      if (best >= 0) this.tryPlace(i, best);
      else if (dist(p.x, p.y, p.sx, p.sy) < 14) { this.sel = i; it.hop = 1; }   // nur angetippt: auswählen, dann Schatten antippen
    });
  }
};

/* ---------- Frosch: Hüpfspiel (Seitenansicht) ----------
   Die Strecke wird jedes Mal neu gebaut. n = Plattformen, gap/w = Lücken und Breiten (von–bis), dy = Höhenunterschied,
   move = jede wievielte Seerose schwimmt, spring = jede wievielte Plattform hat einen Sprungpilz, stars = Anzahl Sterne */
const FROG_LEVELS = [
  { n: 18, gap: [80, 110], w: [125, 160], dy: 40, move: 0, amp: 0, spring: 0, stars: 10 },
  { n: 24, gap: [90, 122], w: [110, 145], dy: 50, move: 4, amp: 22, spring: 7, stars: 14 },
  { n: 30, gap: [100, 130], w: [100, 135], dy: 55, move: 3, amp: 26, spring: 6, stars: 18 }
];
const FrogGame = {
  id: 'frog', WATER: 440,
  build(d) {
    const R = seeded(1000 * this.lv + Math.floor(Math.random() * 100000));
    this.pl = [{ x: -300, w: 580, y: 400, type: 'ground' }]; this.stars = [];
    let x = 280, y = 400, wide = false;
    for (let i = 0; i < d.n; i++) {
      const gp = wide ? 90 : lerp(d.gap[0], d.gap[1], R()), w = wide ? 270 : lerp(d.w[0], d.w[1], R());
      const ny = wide ? y : clamp(Math.round(y + (R() * 2 - 1) * d.dy), 300, 400);
      x += gp; y = ny;
      const pl = { x, w, y, type: i % 2 ? 'stone' : 'pad' };
      wide = false;
      if (d.spring && i % d.spring === d.spring - 1 && i < d.n - 2) { pl.type = 'stone'; pl.spring = true; wide = true; }
      else if (d.move && i % d.move === d.move - 1) { pl.type = 'pad'; pl.bx = x; pl.amp = d.amp; pl.ph = i; }   // schwimmt hin und her
      this.pl.push(pl); x += w;
    }
    x += 90; this.endX = x; this.pl.push({ x, w: 900, y: 400, type: 'ground' }); this.levelW = x + 560;
    // Sterne gleichmäßig verteilen, über Sprungpilzen ganz hoch
    const cand = this.pl.slice(1, -1);
    for (let k = 0; k < d.stars; k++) {
      const pl = cand[Math.min(cand.length - 1, Math.round((k + 0.5) * cand.length / d.stars))];
      this.stars.push({ x: pl.x + pl.w / 2 + (pl.spring ? 0 : 0), y: pl.y - (pl.spring ? 270 : k % 2 ? 128 : 64), got: false, pl });
    }
  },
  enter() {
    this.lv = miniLevel('frog'); const d = FROG_LEVELS[this.lv];
    this.build(d);
    this.p = { x: 110, y: 400, vy: 0, ground: true, face: 1, coy: 0, buf: 0, moving: false };
    this.safe = { pl: this.pl[0], rel: 410, y: 400 }; this.cam = 0; this.t = 0; this.winT = -1; this.got = 0; this.idle = 0; this.bestX = 110; this.hintT = 0; this.respawn = 0; this.falls = 0; this.jumpHeld = false; this.teach = this.lv ? 0 : 7;
    this.fx = new Fx(); this.uni = { x: 30, y: 250 };
    Voice.say(this.lv ? 'frog_intro2' : 'frog_intro');
  },
  btns() { const r = Math.max(View.btn / 2, 54), rj = r * 1.3; return { l: { x: 22 + r, y: VH - 22 - r, r }, r: { x: 22 + r * 3 + 18, y: VH - 22 - r, r }, j: { x: VW - 26 - rj, y: VH - 26 - rj, r: rj } }; },
  update(dt) {
    this.t += dt; this.fx.update(dt); if (this.hintT > 0) this.hintT -= dt; if (this.teach > 0) this.teach -= dt;
    const p = this.p, B = this.btns(), K = Input.keys;
    this.uni.x = lerp(this.uni.x, p.x - 86 * p.face, Math.min(1, dt * 3)); this.uni.y = lerp(this.uni.y, p.y - 170 + Math.sin(this.t * 2) * 8, Math.min(1, dt * 3));
    for (const s of this.stars) { if (s.got && s.pop > 0) s.pop -= dt * 3; if (s.pl.amp) s.x = s.pl.x + s.pl.w / 2; }
    for (const pl of this.pl) { if (pl.bob > 0) pl.bob -= dt * 2; if (pl.boing > 0) pl.boing -= dt * 2.5; }
    if (this.winT >= 0) { this.winT += dt; p.moving = false; if (this.winT > 2.8) finishMini('frog'); return; }
    if (this.respawn > 0) { this.respawn -= dt; if (this.respawn <= 0) { p.x = this.safe.pl.x + this.safe.rel; p.y = this.safe.y; p.vy = 0; p.ground = true; p.on = this.safe.pl; Sfx.play('pop'); this.fx.burst(p.x - this.cam, p.y - 40, 10, { g: 60 }); } return; }
    let left = K.has('ArrowLeft'), right = K.has('ArrowRight'), jump = K.has('Space') || K.has('ArrowUp');
    for (const q of Input.pointers.values()) { if (hit(q, B.l.x, B.l.y, B.l.r + 14)) left = true; else if (hit(q, B.r.x, B.r.y, B.r.r + 14)) right = true; else if (hit(q, B.j.x, B.j.y, B.j.r + 22)) jump = true; }
    this.pressed = { left, right, jump };
    if (jump && !this.jumpHeld) p.buf = 0.16; this.jumpHeld = jump;
    const dir = (right ? 1 : 0) - (left ? 1 : 0);
    if (dir) { p.face = dir; p.x = clamp(p.x + dir * 235 * dt, 30, this.levelW - 60); }
    p.moving = !!dir;
    for (const pl of this.pl) if (pl.amp) { const nx = pl.bx + Math.sin(this.t * 1.5 + pl.ph) * pl.amp; if (p.on === pl && p.ground) p.x += nx - pl.x; pl.x = nx; }
    p.buf -= dt; p.coy -= dt;
    if (p.buf > 0 && (p.ground || p.coy > 0)) { p.vy = -650; p.ground = false; p.coy = 0; p.buf = 0; Sfx.play('jump'); }
    const prevY = p.y, wasGround = p.ground, fallV = p.vy; p.vy = Math.min(p.vy + 1500 * dt, 900); p.y += p.vy * dt; p.ground = false;
    if (p.vy >= 0) for (const pl of this.pl) if (p.x > pl.x - 10 && p.x < pl.x + pl.w + 10 && prevY <= pl.y + 0.5 && p.y >= pl.y) {
      p.y = pl.y; p.vy = 0; p.ground = true; p.coy = 0.12; this.safe = { pl, rel: clamp(p.x - pl.x, 30, pl.w - 30), y: pl.y }; p.on = pl;
      if (pl.spring && !wasGround && fallV > 150 && Math.abs(p.x - (pl.x + pl.w / 2)) < 38) { p.vy = -980; p.ground = false; pl.boing = 1; Sfx.play('jump'); Sfx.play('squeak'); this.fx.burst(p.x - this.cam, pl.y - 30, 8, { g: 200 }); break; }
      if (!wasGround && fallV > 250) { Sfx.play('land'); if (pl.type === 'pad') pl.bob = 1; } break;
    }
    if (p.y > this.WATER + 26) { this.respawn = 0.7; this.falls++; Sfx.play('splash'); this.fx.burst(p.x - this.cam, this.WATER, 16, { shape: 'dot', color: '#e6f7ff', g: 500, up: 220, sp1: 160, s1: 10 }); if (this.falls === 1 || this.falls % 4 === 0) Voice.say('frog_splash'); }
    for (const s of this.stars) if (!s.got && dist(p.x, p.y - 45, s.x, s.y) < 52) { s.got = true; s.pop = 1; this.got++; Sfx.play('star'); this.fx.burst(s.x - this.cam, s.y, 10, { g: 120 }); }
    if (p.x > this.endX + 170 && p.ground) { miniWin(this); return; }
    this.cam = lerp(this.cam, clamp(p.x - VW * 0.36, 0, this.levelW - VW), Math.min(1, dt * 6));
    if (p.x > this.bestX + 25) { this.bestX = p.x; this.idle = 0; this.hintT = 0; } else { this.idle += dt; if (this.idle > CONFIG.hintDelay) { this.idle = 0; this.hintT = 5; Sfx.play('hint'); Voice.say('frog_hint'); } }
  },
  draw(c) {
    const t = this.t, cam = this.cam, p = this.p, W = this.WATER;
    const g = c.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#9fdcff'); g.addColorStop(0.7, '#e3f6ff'); c.fillStyle = g; c.fillRect(0, 0, VW, VH);
    c.fillStyle = '#fff3a0'; circ(c, VW - 150, 90, 40); c.fill();
    for (let i = 0; i < 6; i++) drawCloud(c, ((i * 420 - cam * 0.15) % (VW + 400) + VW + 400) % (VW + 400) - 200, 70 + (i % 3) * 46, 0.7 + (i % 2) * 0.3);
    c.fillStyle = '#c6ecc0'; for (let i = -1; i < 8; i++) { ell(c, i * 520 - cam * 0.3 % 520, W + 10, 330, 150 + (i & 1) * 40); c.fill(); }
    c.fillStyle = '#a6dd9e'; for (let i = -1; i < 10; i++) { ell(c, i * 380 - cam * 0.55 % 380 + 100, W + 20, 240, 90 + (i & 1) * 30); c.fill(); }
    c.fillStyle = '#8fd0f0'; c.fillRect(0, W, VW, VH - W);
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 3; c.lineCap = 'round';
    for (let r = 0; r < 3; r++) for (let x = -(cam * (1 + r * 0.1) + t * 20 * (r + 1)) % 90 - 90; x < VW + 90; x += 90) { c.beginPath(); c.arc(x + r * 30, W + 18 + r * 30, 14, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
    c.save(); c.translate(-cam, 0);
    for (const pl of this.pl) {
      if (pl.x + pl.w < cam - 60 || pl.x > cam + VW + 60) continue;
      const bob = pl.bob > 0 ? Math.sin(pl.bob * Math.PI) * 5 : 0;
      if (pl.magic) { c.fillStyle = 'rgba(255,240,140,' + (0.35 + Math.sin(this.t * 5) * 0.15) + ')'; ell(c, pl.x + pl.w / 2, pl.y + 8, pl.w / 2 + 16, 24); c.fill(); }
      if (pl.type === 'ground') { rr(c, pl.x, pl.y, pl.w, 200, 30); fs(c, '#d9b98a'); rr(c, pl.x - 6, pl.y - 6, pl.w + 12, 34, 17); fs(c, '#8fd67f', '#74c067', 2); }
      else if (pl.type === 'pad') { ell(c, pl.x + pl.w / 2, pl.y + 12 + bob, pl.w / 2 + 6, 16); fs(c, '#58b964'); c.beginPath(); c.ellipse(pl.x + pl.w / 2, pl.y + 7 + bob, pl.w / 2 + 6, 14, 0, 0.25, TAU - 0.1); c.lineTo(pl.x + pl.w / 2, pl.y + 7 + bob); c.closePath(); fs(c, '#7ed56f', '#58b964', 2); if (pl.amp) { c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 3; const dx = Math.cos(this.t * 1.5 + pl.ph) > 0 ? 1 : -1; line(c, pl.x + pl.w / 2 - dx * (pl.w / 2 + 14), pl.y + 22, pl.x + pl.w / 2 - dx * (pl.w / 2 + 34), pl.y + 22); } else if (pl.w > 135) { c.fillStyle = '#ff9ecb'; sparklePath(c, pl.x + pl.w - 22, pl.y + 2 + bob, 10); c.fill(); c.fillStyle = '#fff3a0'; circ(c, pl.x + pl.w - 22, pl.y + 2 + bob, 3); c.fill(); } }
      else { rr(c, pl.x - 4, pl.y, pl.w + 8, 80, 22); fs(c, '#c9c9d6', '#a8a8b8', 2); c.fillStyle = 'rgba(255,255,255,0.5)'; rr(c, pl.x + 10, pl.y + 6, pl.w * 0.4, 7, 4); c.fill(); }
      if (pl.spring) { const q = pl.boing > 0 ? Math.sin(pl.boing * Math.PI * 3) * 0.3 * pl.boing : 0; c.save(); c.translate(pl.x + pl.w / 2, pl.y + 2); c.scale(1.9 * (1 + q), 1.9 * (1 - q)); drawMushroom(c, { x: 0, y: 0, col: '#ff6b6b', squish: 0 }); c.restore(); }
    }
    // Ziel: Blumentor und Frosch
    const gx = this.endX + 250;
    c.strokeStyle = '#84d48f'; c.lineWidth = 12; c.beginPath(); c.arc(gx, 400, 96, Math.PI, 0); c.stroke();
    for (let i = 0; i <= 8; i++) { const a = Math.PI + i * Math.PI / 8; drawFlower(c, { x: gx + Math.cos(a) * 96, y: 400 + Math.sin(a) * 96, col: PASTEL[i % 5], r: i }); }
    drawActor(c, 'frog', gx, 400, { size: 92, t, lift: this.winT >= 0 ? Math.abs(Math.sin(t * 9)) * 30 : Math.abs(Math.sin(t * 2.5)) * 5 });
    for (const s of this.stars) { if (s.got || s.x < cam - 40 || s.x > cam + VW + 40) continue; const y = s.y + Math.sin(t * 3 + s.x) * 5; c.fillStyle = 'rgba(255,243,160,0.45)'; circ(c, s.x, y, 26); c.fill(); starPath(c, s.x, y, 19, 5, 0.5, -Math.PI / 2 + Math.sin(t * 2 + s.x) * 0.2); fs(c, '#ffd54a', '#f0b429', 2.5); }
    drawCloud(c, this.uni.x, this.uni.y + 6, 0.62); drawActor(c, 'unicorn', this.uni.x, this.uni.y, { size: 66, t, flip: p.face < 0, noShadow: true, mark: uniMark(), glow: this.hintT > 0, lift: this.winT >= 0 ? Math.abs(Math.sin(t * 8)) * 16 : 0 });
    if (this.respawn <= 0) drawActor(c, 't', p.x, p.y, { size: 88, t, walk: p.moving && p.ground, flip: p.face < 0, noShadow: !p.ground, lift: this.winT >= 0 ? Math.abs(Math.sin(t * 8)) * 22 : 0 });
    c.restore();
    c.fillStyle = 'rgba(143,208,240,0.45)'; c.fillRect(0, W + 34, VW, VH - W - 34);
    this.fx.draw(c);
    // Sterne-Anzeige und Weg-Fortschritt
    const n = this.stars.length, sw = Math.min(30, (VW - 330) / n), sx = VW / 2 - (n - 1) * sw / 2;
    rr(c, sx - 24, 14, (n - 1) * sw + 48, 42, 21); fs(c, 'rgba(255,255,255,0.7)');
    for (let i = 0; i < n; i++) { starPath(c, sx + i * sw, 35, sw * 0.42); fs(c, i < this.got ? '#ffd54a' : 'rgba(255,255,255,0.9)', i < this.got ? '#f0b429' : '#d6cfe6', 2); }
    const prog = clamp(p.x / (this.endX + 170), 0, 1), px0 = VW / 2 - 140;
    rr(c, px0, 64, 280, 12, 6); fs(c, 'rgba(255,255,255,0.6)'); rr(c, px0, 64, 280 * prog, 12, 6); fs(c, '#7ed56f');
    drawActor(c, 'frog', px0 + 292, 80, { size: 24, t, noShadow: true });
    // Knöpfe
    const B = this.btns(), P = this.pressed || {}, teachMove = this.teach > 3.5, teachJump = this.teach > 0 && this.teach <= 3.5, hj = this.hintT > 0;
    c.globalAlpha = 0.92;
    drawRoundBtn(c, B.l.x, B.l.y, B.l.r, { color: '#9ecbff', icon: 'left', pressed: P.left });
    drawRoundBtn(c, B.r.x, B.r.y, B.r.r, { color: '#9ecbff', icon: 'right', pressed: P.right, pulse: teachMove || hj, glow: teachMove || hj });
    drawRoundBtn(c, B.j.x, B.j.y, B.j.r, { color: '#ffb65c', icon: 'up', pressed: P.jump, pulse: teachJump || hj, glow: teachJump || hj });
    c.globalAlpha = 1;
    drawHelperBtn(c, this.id); drawMiniExit(c);
  },
  useHelper() {   // Seerosenbrücke: schließt die Lücke vor T
    const p = this.p; if (this.respawn > 0) return false;
    const cur = p.ground && p.on ? p.on : this.safe.pl, next = this.pl.filter(q => q.x > cur.x + cur.w - 1 && !q.magic).sort((a, b) => a.x - b.x)[0];
    if (!next || next.x - (cur.x + cur.w) < 10) return false;
    const gx = cur.x + cur.w - 8, gw = next.x - gx + 16; this.pl.push({ x: gx, w: gw, y: Math.max(cur.y, next.y), type: 'pad', magic: true });
    this.fx.burst(gx + gw / 2 - this.cam, Math.max(cur.y, next.y), 20, { g: 60 }); return true;
  },
  down(p) { const e = miniExit(); if (hit(p, e.x, e.y, e.r + 6)) { Sfx.play('tap'); Game.go(World, { from: 'frog' }); return; } helperDown(p, this); }
};

/* ---------- Drache: Fangen spielen ----------
   Der Drache schaut aus Büschen heraus, T tippt ihn an. spots = Büsche, show = Sekunden sichtbar,
   goal = so oft fangen, bunny = Anteil Hasen (Antippen schadet nicht), double = manchmal Drache und Hase zugleich */
const DRAGON_LEVELS = [
  { spots: 4, show: 2.4, goal: 6, bunny: 0, pause: [0.5, 1.0], double: 0 },
  { spots: 6, show: 1.7, goal: 9, bunny: 0.3, pause: [0.4, 0.9], double: 0 },
  { spots: 8, show: 1.25, goal: 12, bunny: 0.35, pause: [0.3, 0.7], double: 0.35 }
];
const DragonGame = {
  id: 'dragon',
  enter() {
    this.lv = miniLevel('dragon'); this.d = DRAGON_LEVELS[this.lv];
    this.t = 0; this.winT = -1; this.got = 0; this.pops = []; this.wait = 2.2; this.idle = 0; this.hintT = 0; this.slow = 1; this.miss = 0; this.last = -1; this.bunnies = 0;
    this.fx = new Fx(); this.bush = Array.from({ length: this.d.spots }, () => ({ shake: 0, peek: 0 }));
    Voice.say(['dragon_intro', 'dragon_intro2', 'dragon_intro3'][this.lv], { pitch: 1.6 });
  },
  layout() {
    const n = this.d.spots, rows = n > 4 ? 2 : 1, per = Math.ceil(n / rows), sp = Math.min(240, (VW - 250) / Math.max(1, per - 1)), s = rows === 1 ? 1.55 : 1.3;
    const spots = []; for (let r = 0; r < rows; r++) for (let k = 0; k < per && spots.length < n; k++) spots.push({ x: VW / 2 + 20 + (k - (per - 1) / 2) * sp + (r ? sp * 0.18 : -sp * 0.18) * (rows - 1), y: rows === 1 ? 390 : r === 0 ? 270 : 450, s });
    return { spots, uni: { x: 62, y: VH - 10 } };
  },
  spawn() {
    const n = this.d.spots, pickSpot = ex => { let k; do { k = Math.floor(Math.random() * n); } while (ex.includes(k)); return k; };
    const bunny = this.bunnies < 2 && Math.random() < this.d.bunny, stay = this.d.show * this.slow * (this.hintT > 0 ? 1.7 : 1);
    const used = [this.last];
    const add = who => { const k = pickSpot(used); used.push(k); this.pops.push({ spot: k, who, t: 0, rise: 0.22, stay: who === 'bunny' ? stay * 0.9 : stay, caught: false }); return k; };
    if (bunny) { this.bunnies++; add('bunny'); if (Math.random() < this.d.double) this.last = add('dragon'); }
    else { this.bunnies = 0; this.last = add('dragon'); if (Math.random() < this.d.double * 0.6) add('bunny'); }
  },
  popP(o) { return o.t < o.rise ? o.t / o.rise : o.t < o.rise + o.stay ? 1 : Math.max(0, 1 - (o.t - o.rise - o.stay) / o.rise); },
  update(dt) {
    this.t += dt; this.fx.update(dt); if (this.hintT > 0) this.hintT -= dt;
    if (this.slowT > 0) { this.slowT -= dt; if (this.slowT <= 0) this.slow = 1; }
    for (const b of this.bush) { if (b.shake > 0) b.shake -= dt * 2.5; }
    for (const o of this.pops) o.t += dt;
    this.pops = this.pops.filter(o => {
      if (o.t < o.rise * 2 + o.stay) return true;
      if (o.who === 'dragon' && !o.caught && this.winT < 0) { this.miss++; if (this.miss >= 2) { this.miss = 0; this.slow = Math.min(2, this.slow * 1.2); } }
      return false;
    });
    if (this.winT >= 0) { this.winT += dt; if (this.winT > 3) finishMini('dragon'); return; }
    if (!this.pops.length) { this.wait -= dt; if (this.wait <= 0) { this.spawn(); this.wait = rnd(this.d.pause[0], this.d.pause[1]); } }
    this.idle += dt; if (this.idle > CONFIG.hintDelay) { this.idle = 0; this.hintT = 8; this.slow = Math.min(2, this.slow * 1.25); Sfx.play('hint'); Voice.say('dragon_hint'); }
  },
  useHelper() { this.slow = Math.max(this.slow, 2.2); this.slowT = 15; return true; },
  hitPop(p, L) {
    for (const o of this.pops) {
      const sp = L.spots[o.spot], pp = this.popP(o); if (pp < 0.35 || o.caught) continue;
      if (dist(p.x, p.y, sp.x, sp.y - 72 * sp.s * pp) < 64 * sp.s) return o;
    }
    return null;
  },
  draw(c) {
    const L = this.layout(), t = this.t;
    drawMeadow(c, t);
    drawTree(c, { x: 70, y: VH - 150, s: 1.3, kind: 0, shake: 0 }, t); drawTree(c, { x: VW - 80, y: VH - 160, s: 1.4, kind: 1, shake: 0 }, t);
    // Wer gerade aus welchem Busch schaut
    L.spots.forEach((sp, k) => {
      const b = this.bush[k], sh = b.shake > 0 ? Math.sin(t * 50) * 5 * b.shake : 0;
      c.save(); c.beginPath(); c.rect(sp.x - 120 * sp.s, 0, 240 * sp.s, sp.y - 12 * sp.s); c.clip();
      for (const o of this.pops) if (o.spot === k) {
        const pp = this.popP(o), rise = (1 - easeOut(pp)) * 110 * sp.s;
        if (o.who === 'dragon') {
          drawActor(c, 'dragon', sp.x, sp.y - 36 * sp.s + rise, { size: 72 * sp.s, t, noShadow: true, flip: k % 2 === 0, happy: true });
          if (o.caught) for (let i = 0; i < 3; i++) { const a = t * 6 + i * 2.1; c.fillStyle = '#ffd54a'; starPath(c, sp.x + Math.cos(a) * 34 * sp.s, sp.y - 100 * sp.s + rise + Math.sin(a) * 10, 8); c.fill(); }
        } else drawBunnyHead(c, sp.x + 4, sp.y - 34 * sp.s + rise, sp.s * 1.25, t);
      }
      c.restore();
      c.save(); c.translate(sp.x + sh, sp.y); c.scale(sp.s, sp.s); drawBush(c, { x: 0, y: 0, shake: 0, peek: 0 }, t); c.restore();
      if (this.hintT > 0) for (const o of this.pops) if (o.spot === k && o.who === 'dragon' && !o.caught && this.popP(o) > 0.5) { c.strokeStyle = 'rgba(255,213,74,' + (0.6 + Math.sin(t * 10) * 0.3) + ')'; c.lineWidth = 6; circ(c, sp.x, sp.y - 78 * sp.s, 58 * sp.s); c.stroke(); drawSparkleLine(c, L.uni.x + 40, L.uni.y - 100, sp.x, sp.y - 78 * sp.s, t); }
    });
    if (this.winT >= 0) drawActor(c, 'dragon', VW / 2, VH / 2 + 60, { size: 130, t, lift: Math.abs(Math.sin(t * 8)) * 40, fly: true, noShadow: true });
    // Fortschritt
    const n = this.d.goal, sw = Math.min(40, (VW - 330) / n), sx = VW / 2 - (n - 1) * sw / 2;
    rr(c, sx - 26, 14, (n - 1) * sw + 52, 46, 23); fs(c, 'rgba(255,255,255,0.75)');
    for (let i = 0; i < n; i++) { starPath(c, sx + i * sw, 37, sw * 0.42); fs(c, i < this.got ? '#ffd54a' : 'rgba(255,255,255,0.9)', i < this.got ? '#f0b429' : '#d6cfe6', 2); }
    drawActor(c, 'unicorn', L.uni.x, L.uni.y, { size: 96, t, lift: this.winT >= 0 ? Math.abs(Math.sin(t * 8)) * 26 : 0, mark: uniMark(), glow: this.hintT > 0 });
    this.fx.draw(c);
    drawHelperBtn(c, this.id); drawMiniExit(c);
  },
  down(p) {
    const e = miniExit(); if (hit(p, e.x, e.y, e.r + 6)) { Sfx.play('tap'); Game.go(World, { from: 'dragon' }); return; }
    if (helperDown(p, this)) return;
    if (this.winT >= 0) return;
    const L = this.layout(), o = this.hitPop(p, L);
    if (o && o.who === 'dragon') {
      o.caught = true; o.t = Math.max(o.t, o.rise + o.stay); this.got++; this.idle = 0; this.hintT = 0; this.miss = 0; this.slow = Math.max(1, this.slow * 0.95);
      const sp = L.spots[o.spot]; this.fx.burst(sp.x, sp.y - 70 * sp.s, 16, { g: 120 }); Sfx.play('star'); Sfx.play('giggle');
      if (this.got >= this.d.goal) { this.pops = []; miniWin(this); Voice.say('dragon_caught', { pitch: 1.6, queue: true }); }
      else if (this.got % 2 === 0) Voice.say('dragon_caught', { pitch: 1.6 });
      return;
    }
    if (o && o.who === 'bunny') { o.t = Math.max(o.t, o.rise + o.stay); Sfx.play('hop'); const sp = L.spots[o.spot]; this.fx.burst(sp.x, sp.y - 60 * sp.s, 6, { shape: 'heart', color: '#ff9ecb', g: -40, sp1: 70 }); if (Math.random() < 0.5) Voice.say('dragon_bunny'); return; }
    L.spots.forEach((sp, k) => { if (dist(p.x, p.y, sp.x, sp.y - 30 * sp.s) < 60 * sp.s) { this.bush[k].shake = 1; Sfx.play('rustle'); } });
    if (hit(p, L.uni.x, L.uni.y - 50, 56)) { this.hintT = 8; Sfx.play('hint'); }
  }
};


/* ---------- Schnecke Sina: Leserätsel ----------
   Rundenarten: w2p = Wort lesen, Bild wählen · gap = fehlender Buchstabe · p2w = Bild sehen, ähnliches Wort wählen · build = Wort aus Buchstaben legen.
   Wörter und Bilder: PICS (Grafik-Teil). CONFIG.readUpper schaltet zwischen GROSSBUCHSTABEN und normaler Schreibung. */
const READ_SHORT = ['EI', 'HUT', 'UHR', 'BALL', 'MAUS', 'HAUS', 'MOND', 'BOOT', 'AUTO', 'ENTE', 'EULE', 'HASE', 'IGEL', 'NUSS', 'PILZ', 'BAUM'];
const READ_LONG = READ_SHORT.concat(['STERN', 'HERZ', 'SONNE', 'FISCH', 'BLUME', 'APFEL']);
const READ_SIMILAR = { MAUS: ['HAUS', 'MAUL'], HAUS: ['MAUS', 'HASE'], BAUM: ['BALL', 'RAUM'], BALL: ['BAUM', 'FALL'], HASE: ['NASE', 'HAUS'], MOND: ['MUND', 'HUND'], HUT: ['HUND', 'HAUT'],
  BOOT: ['BROT', 'BOTE'], IGEL: ['INSEL', 'ENGEL'], ENTE: ['EULE', 'ENDE'], NUSS: ['NASS', 'NUDEL'], FISCH: ['TISCH', 'FROSCH'], STERN: ['STEIN', 'STIRN'], SONNE: ['TONNE', 'SAHNE'], PILZ: ['PELZ', 'FILZ'], HERZ: ['HARZ', 'HERD'], EULE: ['ENTE', 'EILE'], BLUME: ['BLUSE', 'BLAU'] };
const READ_BUILD = ['HUT', 'UHR', 'MAUS', 'HAUS', 'MOND', 'HASE', 'IGEL', 'NUSS', 'PILZ', 'BAUM', 'ENTE', 'EULE', 'AUTO', 'BOOT'];
const READ_PLAN = [['w2p', 'w2p', 'w2p', 'w2p', 'w2p'], ['gap', 'w2p', 'gap', 'w2p', 'gap'], ['p2w', 'build', 'gap', 'p2w', 'build']];
const shown = (w, i) => CONFIG.readUpper || i === 0 ? w[i] : w[i].toLowerCase();          // ein Buchstabe so, wie er angezeigt wird
const shownWord = w => w.split('').map((_, i) => shown(w, i)).join('');
const spokenWord = w => w[0] + w.slice(1).toLowerCase();                                  // für die Sprachausgabe immer normal geschrieben
const ReadGame = {
  id: 'snail',
  enter() { this.lv = miniLevel('snail'); this.plan = READ_PLAN[this.lv]; this.round = 0; this.t = 0; this.winT = -1; this.used = []; this.setup(); Voice.say(['snail_intro', 'snail_intro2', 'snail_intro3'][this.lv]); },
  setup() {
    const type = this.plan[this.round], prev = this.round ? this.plan[this.round - 1] : null, fresh = a => a.filter(w => !this.used.includes(w));
    this.type = type; this.state = 'play'; this.st = 0; this.idle = 0; this.hintT = 0; this.wrongs = 0; this.shake = []; this.fx = new Fx();
    if (type === 'w2p') {
      const w = pick(fresh(this.lv ? READ_LONG.filter(x => x.length >= 4) : READ_SHORT)), others = shuffle(READ_LONG.filter(x => x !== w && x[0] !== w[0])).slice(0, 2);
      this.word = w; this.opts = shuffle([w].concat(others));
    } else if (type === 'gap') {
      const w = pick(fresh(READ_LONG.filter(x => x.length >= 3 && /[AEIOU]/.test(x)))), pos = w.split('').map((ch, i) => 'AEIOU'.includes(ch) ? i : -1).filter(i => i >= 0);
      this.word = w; this.gap = pick(pos); this.opts = shuffle([w[this.gap]].concat(shuffle('AEIOU'.split('').filter(v => v !== w[this.gap])).slice(0, 2)));
    } else if (type === 'p2w') {
      const w = pick(fresh(Object.keys(READ_SIMILAR))); this.word = w; this.opts = shuffle([w].concat(READ_SIMILAR[w]));
    } else {
      const w = pick(fresh(READ_BUILD)); this.word = w; this.filled = 0;
      let order; do { order = shuffle(w.split('').map((_, i) => i)); } while (order.every((v, i) => v === i));
      this.tiles = order.map(i => ({ ch: w[i], idx: i, used: false }));
    }
    this.used.push(this.word);
    if (type !== prev && this.round > 0) Voice.say('read_' + type); else if (this.round === 0 && this.lv === 2) Voice.say('read_' + type, { queue: true });
  },
  ansIndex() { return this.type === 'gap' ? this.opts.indexOf(this.word[this.gap]) : this.opts.indexOf(this.word); },
  layout() {
    const cw = Math.min(VW - 340, 600), card = { x: VW / 2, y: 160, w: cw, h: 230 };
    const n = this.type === 'build' ? this.tiles.length : 3, room = VW - 330;
    const r = this.type === 'w2p' ? Math.max(View.btn / 2 + 12, 72) : this.type === 'build' ? Math.max(View.btn / 2, 50) : Math.max(View.btn / 2 + 4, 58);
    const pw = Math.min(250, room / 3 - 16), sp = this.type === 'p2w' ? pw + 24 : Math.min(r * 2 + 40, room / Math.max(1, n - 1));
    const y = VH - (this.type === 'p2w' ? 70 : r + 26);
    return { card, r, pw, opts: Array.from({ length: n }, (_, i) => ({ x: VW / 2 + (i - (n - 1) / 2) * sp, y })), uni: { x: 62, y: VH - 10 }, snail: { x: VW - 72, y: VH - 14 } };
  },
  update(dt) {
    this.t += dt; this.st += dt; this.fx.update(dt); if (this.hintT > 0) this.hintT -= dt;
    this.shake = this.shake.map(v => Math.max(0, v - dt * 2.5));
    if (this.winT >= 0) { this.winT += dt; if (this.winT > 2.8) finishMini('snail'); return; }
    if (this.state === 'right') { if (this.st > 1.6) { this.round++; if (this.round >= this.plan.length) miniWin(this); else this.setup(); } return; }
    this.idle += dt; if (this.idle > CONFIG.hintDelay) this.hint();
  },
  hint() { this.idle = 0; this.hintT = 6; Sfx.play('hint'); Voice.say('read_hint', { vars: { wort: spokenWord(this.word) } }); },
  solved() {
    this.state = 'right'; this.st = 0; this.wrongs = 0; Sfx.play('good'); const L = this.layout();
    this.fx.burst(L.card.x, L.card.y, 22, { g: 140 }); Voice.say('read_word', { vars: { wort: spokenWord(this.word) } });
  },
  useHelper() { if (this.state !== 'play') return false; if (this.type === 'build') { this.tiles.forEach(q => q.used = true); this.filled = this.word.length; } this.solved(); return true; },
  wrong(i) { this.shake[i] = 1; this.wrongs++; Sfx.play('wrong'); Voice.say('try_again'); if (this.wrongs >= 2) { this.wrongs = 0; this.hint(); } },
  letterBoxes(cx, cy, w, size) {   // Buchstabenkästchen eines Wortes
    const bw = size * 0.82, x0 = cx - (w.length - 1) * bw / 2;
    return w.split('').map((_, i) => ({ x: x0 + i * bw, y: cy, w: bw - 8, h: size * 1.05 }));
  },
  draw(c) {
    const L = this.layout(), t = this.t, right = this.state === 'right', K = L.card;
    const g = c.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#fff3d6'); g.addColorStop(1, '#e3f6c8'); c.fillStyle = g; c.fillRect(0, 0, VW, VH);
    c.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 9; i++) { heartPath(c, (i * 197 + 80) % VW, 40 + (i * 89) % 130, 7 + Math.sin(t + i) * 2); c.fill(); }
    // Brief
    c.save(); c.translate(K.x, K.y); if (right) c.scale(1 + Math.sin(this.st * 8) * 0.02, 1 + Math.sin(this.st * 8) * 0.02);
    rr(c, -K.w / 2, -K.h / 2, K.w, K.h, 18); fs(c, '#fffdf7', right ? '#5fd38d' : '#e6d9bd', right ? 6 : 4);
    c.strokeStyle = 'rgba(230,217,189,0.7)'; c.lineWidth = 2; for (let y = -K.h / 2 + 40; y < K.h / 2 - 10; y += 34) line(c, -K.w / 2 + 20, y, K.w / 2 - 20, y);
    c.fillStyle = '#ff6b81'; heartPath(c, K.w / 2 - 28, -K.h / 2 + 26, 9); c.fill();
    c.restore();
    c.textAlign = 'center'; c.textBaseline = 'middle';
    const big = n => '800 ' + n + 'px system-ui, sans-serif';
    if (this.type === 'w2p') { c.font = big(Math.min(92, K.w / (this.word.length * 0.75))); c.fillStyle = '#5a4a7a'; c.fillText(shownWord(this.word), K.x, K.y + 4); }
    else if (this.type === 'p2w') drawPic(c, this.word, K.x, K.y, 170);
    else {
      drawPic(c, this.word, K.x - K.w * 0.3, K.y, 150);
      const boxes = this.letterBoxes(K.x + K.w * 0.16, K.y, this.word, Math.min(76, (K.w * 0.6) / (this.word.length * 0.82)));
      boxes.forEach((b, i) => {
        const open = this.type === 'gap' ? i === this.gap && !right : i >= this.filled;
        rr(c, b.x - b.w / 2, b.y - b.h / 2, b.w, b.h, 10);
        if (open) { c.setLineDash([8, 6]); fs(c, 'rgba(169,139,255,0.12)', '#a98bff', 3.5); c.setLineDash([]); }
        else { fs(c, this.type === 'build' || (this.type === 'gap' && i === this.gap) ? '#eafbe9' : 'rgba(255,255,255,0.6)', '#d6cfe6', 2); c.font = big(b.h * 0.62); c.fillStyle = '#5a4a7a'; c.fillText(shown(this.word, i), b.x, b.y + 3); }
      });
    }
    // Auswahl
    const ai = this.type === 'build' ? this.tiles.findIndex(q => !q.used && q.ch === this.word[this.filled]) : this.ansIndex();
    L.opts.forEach((o, i) => {
      const sx = this.shake[i] ? Math.sin(this.shake[i] * 30) * 9 * this.shake[i] : 0, isHint = this.hintT > 0 && i === ai && !right, ok = right && i === ai;
      if (this.type === 'p2w') {
        c.save(); c.translate(o.x + sx, o.y); if (isHint) c.scale(1.05 + Math.sin(t * 6) * 0.04, 1.05 + Math.sin(t * 6) * 0.04);
        if (isHint) { c.fillStyle = 'rgba(255,240,140,0.6)'; rr(c, -L.pw / 2 - 12, -56, L.pw + 24, 112, 30); c.fill(); }
        rr(c, -L.pw / 2, -44, L.pw, 88, 26); fs(c, ok ? '#eafbe9' : '#fffaf0', ok ? '#5fd38d' : '#fff', 4);
        c.font = big(Math.min(50, L.pw / (this.opts[i].length * 0.72))); c.fillStyle = '#5a4a7a'; c.fillText(shownWord(this.opts[i]), 0, 3); c.restore();
        return;
      }
      if (this.type === 'build' && this.tiles[i].used) { c.globalAlpha = 0.25; drawRoundBtn(c, o.x, o.y, L.r, { color: '#fffaf0' }); c.globalAlpha = 1; return; }
      drawRoundBtn(c, o.x + sx, o.y, L.r, { color: ok ? '#eafbe9' : '#fffaf0', stroke: ok ? '#5fd38d' : '#fff', glow: isHint, pulse: isHint });
      if (this.type === 'w2p') drawPic(c, this.opts[i], o.x + sx, o.y, L.r * 1.45);
      else { const ch = this.type === 'gap' ? this.opts[i] : this.tiles[i].ch, pos = this.type === 'gap' ? this.gap : this.tiles[i].idx, show = CONFIG.readUpper || pos === 0 ? ch : ch.toLowerCase(); c.font = big(L.r * 1.05); c.fillStyle = '#5a4a7a'; c.fillText(show, o.x + sx, o.y + 4); }
    });
    c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    drawRoundStars(c, this.plan.length, this.winT >= 0 ? this.plan.length : this.round + (right ? 1 : 0));
    const happy = right || this.winT >= 0;
    drawActor(c, 'unicorn', L.uni.x, L.uni.y, { size: 96, t, lift: happy ? Math.abs(Math.sin(t * 8)) * 24 : 0, mark: uniMark(), glow: this.hintT > 0 });
    drawActor(c, 'snail', L.snail.x, L.snail.y, { size: 100, t, flip: true, lift: happy ? Math.abs(Math.sin(t * 7)) * 14 : 0 });
    this.fx.draw(c);
    drawHelperBtn(c, this.id); drawMiniExit(c);
  },
  down(p) {
    const e = miniExit(); if (hit(p, e.x, e.y, e.r + 6)) { Sfx.play('tap'); Game.go(World, { from: 'snail' }); return; }
    if (helperDown(p, this)) return;
    if (this.winT >= 0 || this.state !== 'play') return;
    const L = this.layout(); this.idle = 0;
    if (hit(p, L.uni.x, L.uni.y - 50, 56)) { this.hint(); return; }
    if (hit(p, L.card.x, L.card.y, L.card.h / 2) && this.type !== 'w2p') { Voice.say('read_' + this.type); return; }   // Brief antippen: Aufgabe nochmal hören
    for (let i = 0; i < L.opts.length; i++) {
      const o = L.opts[i], inside = this.type === 'p2w' ? Math.abs(p.x - o.x) < L.pw / 2 + 6 && Math.abs(p.y - o.y) < 52 : hit(p, o.x, o.y, L.r + 8);
      if (!inside) continue;
      if (this.type === 'build') {
        const tile = this.tiles[i]; if (tile.used) return;
        if (tile.ch === this.word[this.filled]) { tile.used = true; this.filled++; Sfx.play('note', 523 + this.filled * 90); this.hintT = 0; if (this.filled >= this.word.length) this.solved(); }
        else this.wrong(i);
        return;
      }
      if (i === this.ansIndex()) this.solved(); else this.wrong(i);
      return;
    }
  }
};

/* ---------- Eichhörnchen Flink: Rechnen ----------
   Stufe 1: Plus bis 10 · Stufe 2: Plus, Minus und Ergänzen bis 10 · Stufe 3: bis 20 (auch mit Zehnerübergang).
   Nüsse in Fünfer- und Zehnerreihen helfen beim Zählen; auf Stufe 3 erscheinen sie erst als Hilfe. */
const MATH_PLAN = [['add10', 'add10', 'add10', 'add10', 'add10', 'add10'], ['add10', 'sub10', 'add10', 'sub10', 'fill10', 'sub10'], ['add20', 'sub20', 'fill20', 'add20x', 'sub20', 'fill20']];
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
function mathTask(type) {
  let a, b, op = '+', total;
  if (type === 'add10') { a = ri(1, 6); b = ri(1, Math.min(5, 10 - a)); }
  else if (type === 'sub10') { a = ri(4, 10); b = ri(1, a - 1); op = '-'; }
  else if (type === 'fill10') { a = ri(2, 8); total = 10; op = 'fill'; }
  else if (type === 'add20') { a = ri(10, 15); b = ri(1, Math.min(5, 20 - a)); }
  else if (type === 'add20x') { a = ri(6, 9); b = ri(11 - a, Math.min(9, 20 - a)); }
  else if (type === 'sub20') { a = ri(12, 20); b = ri(2, Math.min(9, a - 1)); op = '-'; }
  else { total = ri(12, 20); a = ri(5, total - 2); op = 'fill'; }
  const ans = op === '+' ? a + b : op === '-' ? a - b : total - a;
  const spoken = op === '+' ? `${a} plus ${b}` : op === '-' ? `${a} minus ${b}` : `${a} plus wie viel ist ${total}?`;
  const full = op === '+' ? `${a} plus ${b} ist ${ans}` : op === '-' ? `${a} minus ${b} ist ${ans}` : `${a} plus ${ans} ist ${total}`;
  return { a, b: op === 'fill' ? ans : b, op, total, ans, spoken, full, max: type.endsWith('10') ? 10 : 20 };
}
const MathGame = {
  id: 'squirrel',
  enter() { this.lv = miniLevel('squirrel'); this.plan = MATH_PLAN[this.lv]; this.round = 0; this.t = 0; this.winT = -1; this.setup(); Voice.say(['squirrel_intro', 'squirrel_intro2', 'squirrel_intro3'][this.lv]); },
  setup() {
    this.task = mathTask(this.plan[this.round]); this.state = 'play'; this.st = 0; this.idle = 0; this.hintT = 0; this.wrongs = 0; this.help = this.lv < 2; this.fx = new Fx();
    const T = this.task, k = this.lv ? 4 : 3, cands = shuffle([1, -1, 2, -2, 3, -3].map(d => T.ans + d).filter(v => v >= 0 && v <= 20));
    this.opts = [T.ans].concat(cands.slice(0, k - 1)).sort((x, y) => x - y); this.shake = this.opts.map(() => 0);
    Voice.say('math_task', { vars: { aufgabe: T.spoken }, queue: this.round === 0 });
  },
  layout() {
    const n = this.opts.length, r = Math.max(View.btn / 2 + 8, 62), sp = Math.min(r * 2 + 40, (VW - 330) / Math.max(1, n - 1));
    return { r, task: { x: VW / 2, y: 92 }, nuts: { x: VW / 2, y: 250 }, opts: this.opts.map((_, i) => ({ x: VW / 2 + (i - (n - 1) / 2) * sp, y: VH - r - 26 })), uni: { x: 62, y: VH - 10 }, sq: { x: VW - 72, y: VH - 14 } };
  },
  update(dt) {
    this.t += dt; this.st += dt; this.fx.update(dt); if (this.hintT > 0) this.hintT -= dt;
    this.shake = this.shake.map(v => Math.max(0, v - dt * 2.5));
    if (this.winT >= 0) { this.winT += dt; if (this.winT > 2.8) finishMini('squirrel'); return; }
    if (this.state === 'right') { if (this.st > 1.9) { this.round++; if (this.round >= this.plan.length) miniWin(this); else this.setup(); } return; }
    this.idle += dt; if (this.idle > CONFIG.hintDelay) this.hint();
  },
  hint() { this.idle = 0; this.hintT = 6; this.help = true; Sfx.play('hint'); Voice.say('math_hint'); },
  useHelper() { if (this.state !== 'play') return false; const L = this.layout(), i = this.opts.indexOf(this.task.ans); this.down({ x: L.opts[i].x, y: L.opts[i].y }); return true; },
  nutItems() {   // was die Nüsse zeigen: a = erste Menge, b = dazu, gone = aufgegessen, empty = fehlt noch
    const T = this.task, items = [];
    if (T.op === '+') { for (let i = 0; i < T.a; i++) items.push('a'); for (let i = 0; i < T.b; i++) items.push('b'); }
    else if (T.op === '-') { for (let i = 0; i < T.a; i++) items.push(i >= T.a - T.b ? 'gone' : 'a'); }
    else { for (let i = 0; i < T.total; i++) items.push(i < T.a ? 'a' : this.state === 'right' ? 'b' : 'empty'); }
    return items;
  },
  draw(c) {
    const L = this.layout(), t = this.t, T = this.task, right = this.state === 'right';
    const g = c.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#fff0d4'); g.addColorStop(1, '#d9f2c4'); c.fillStyle = g; c.fillRect(0, 0, VW, VH);
    c.fillStyle = '#a6dd9e'; ell(c, VW / 2, VH + 60, VW * 0.8, 150); c.fill();
    // Aufgabe als Bausteine, das Fragezeichen ist ein Kästchen
    const tok = T.op === 'fill' ? [String(T.a), '+', '?', '=', String(T.total)] : [String(T.a), T.op === '+' ? '+' : '−', String(T.b), '=', '?'];
    c.font = '800 70px system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const ws = tok.map(s => s === '?' ? 96 : c.measureText(s).width + 26), tw = ws.reduce((x, y) => x + y, 0);
    rr(c, L.task.x - tw / 2 - 26, L.task.y - 58, tw + 52, 116, 30); fs(c, 'rgba(255,255,255,0.8)', right ? '#5fd38d' : '#fff', right ? 6 : 4);
    let x = L.task.x - tw / 2;
    tok.forEach((s, i) => {
      const cx = x + ws[i] / 2;
      if (s === '?') {
        if (right) { c.fillStyle = '#2fa866'; c.fillText(String(T.ans), cx, L.task.y + 4 - Math.abs(Math.sin(this.st * 6)) * 8); }
        else { rr(c, cx - 40, L.task.y - 42, 80, 84, 14); c.setLineDash([9, 7]); fs(c, 'rgba(169,139,255,0.12)', '#a98bff', 4); c.setLineDash([]); c.fillStyle = '#a98bff'; c.fillText('?', cx, L.task.y + 4); }
      } else { c.fillStyle = '#5a4a7a'; c.fillText(s, cx, L.task.y + 4); }
      x += ws[i];
    });
    // Nüsse in Zehnerreihen, nach je fünf eine kleine Lücke
    if (this.help) {
      const items = this.nutItems(), s = items.length > 10 ? 40 : 54, gap5 = s * 0.4, rows = Math.ceil(items.length / 10);
      const rowW = Math.min(10, items.length) * s + (Math.min(10, items.length) > 5 ? gap5 : 0);
      items.forEach((k, i) => {
        const col = i % 10, row = Math.floor(i / 10), nx = L.nuts.x - rowW / 2 + col * s + (col >= 5 ? gap5 : 0) + s / 2, ny = L.nuts.y - (rows - 1) * s * 0.6 + row * s * 1.2;
        const bob = right ? Math.abs(Math.sin(this.st * 7 + i * 0.4)) * 6 : 0;
        if (k === 'empty') { c.setLineDash([4, 4]); circ(c, nx, ny, s * 0.38); c.strokeStyle = '#c9a46e'; c.lineWidth = 2.5; c.stroke(); c.setLineDash([]); return; }
        c.globalAlpha = k === 'gone' ? 0.28 : 1;
        drawPic(c, 'NUSS', nx, ny - bob, s * 1.35);
        if (k === 'b') { c.fillStyle = 'rgba(255,213,74,0.55)'; circ(c, nx, ny - bob - s * 0.5, 4); c.fill(); }
        c.globalAlpha = 1;
        if (k === 'gone') { c.strokeStyle = '#ff6b81'; c.lineWidth = 3; line(c, nx - s * 0.3, ny - s * 0.3, nx + s * 0.3, ny + s * 0.3); }
      });
    }
    // Antworten
    const ai = this.opts.indexOf(T.ans);
    L.opts.forEach((o, i) => {
      const sx = this.shake[i] ? Math.sin(this.shake[i] * 30) * 9 * this.shake[i] : 0, isHint = this.hintT > 0 && i === ai && !right, ok = right && i === ai;
      drawRoundBtn(c, o.x + sx, o.y, L.r, { color: ok ? '#eafbe9' : '#fffaf0', stroke: ok ? '#5fd38d' : '#fff', glow: isHint, pulse: isHint });
      c.font = '800 ' + Math.round(L.r * 0.9) + 'px system-ui, sans-serif'; c.fillStyle = '#5a4a7a'; c.fillText(String(this.opts[i]), o.x + sx, o.y + 4);
    });
    c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    drawRoundStars(c, this.plan.length, this.winT >= 0 ? this.plan.length : this.round + (right ? 1 : 0));
    const happy = right || this.winT >= 0;
    drawActor(c, 'unicorn', L.uni.x, L.uni.y, { size: 96, t, lift: happy ? Math.abs(Math.sin(t * 8)) * 24 : 0, mark: uniMark(), glow: this.hintT > 0 });
    drawActor(c, 'squirrel', L.sq.x, L.sq.y, { size: 104, t, flip: true, lift: happy ? Math.abs(Math.sin(t * 9)) * 22 : 0 });
    this.fx.draw(c);
    drawHelperBtn(c, this.id); drawMiniExit(c);
  },
  down(p) {
    const e = miniExit(); if (hit(p, e.x, e.y, e.r + 6)) { Sfx.play('tap'); Game.go(World, { from: 'squirrel' }); return; }
    if (helperDown(p, this)) return;
    if (this.winT >= 0 || this.state !== 'play') return;
    const L = this.layout(); this.idle = 0;
    if (hit(p, L.uni.x, L.uni.y - 50, 56)) { this.hint(); return; }
    if (Math.abs(p.y - L.task.y) < 60 && Math.abs(p.x - L.task.x) < 260) { Voice.say('math_task', { vars: { aufgabe: this.task.spoken } }); return; }   // Aufgabe nochmal hören
    for (let i = 0; i < L.opts.length; i++) if (hit(p, L.opts[i].x, L.opts[i].y, L.r + 8)) {
      if (this.opts[i] === this.task.ans) { this.state = 'right'; this.st = 0; this.wrongs = 0; Sfx.play('good'); this.fx.burst(L.task.x, L.task.y, 22, { g: 140 }); Voice.say('math_task', { vars: { aufgabe: this.task.full + '. Super!' } }); }
      else { this.shake[i] = 1; this.wrongs++; Sfx.play('wrong'); Voice.say('try_again'); if (this.wrongs >= 2) { this.wrongs = 0; this.hint(); } }
      return;
    }
  },
  key(k) { const n = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3 }[k]; if (n != null && n < this.opts.length) { const L = this.layout(); this.down({ x: L.opts[n].x, y: L.opts[n].y }); } }
};

const MINIGAMES = { owl: OwlGame, fox: FoxGame, frog: FrogGame, dragon: DragonGame, snail: ReadGame, squirrel: MathGame };
