
/* ============ 4. SZENEN: START + EINHORN BENENNEN ============
   Jede Szene hat: enter(opts), update(dt), draw(c) und optional down/move/up/key/resize/leave. */

const StartScene = {
  enter(o) { this.t = 0; this.hold = null; this.holdT = 0; this.flash = 0; this.panel = !!(o && o.panel); this.fromWorld = this.panel; this.armed = -1; },
  btn() { return { x: VW / 2, y: VH * 0.5, r: Math.max(View.btn * 0.8, 92) }; },
  gear() { return { x: VW - 46, y: VH - 46, r: 28 }; },
  charBtn() { const r = Math.max(View.btn / 2, 52); return { x: 16 + r, y: 16 + r, r }; },
  tPos() { return { x: VW * 0.5 - 380 < 60 ? 70 : VW * 0.5 - 380, y: VH - 40 }; },
  // Eltern-Bereich: 0 = Kristalle neu sammeln, 1 = alles neu, 2 = Lesen & Rechnen an/aus, 3 = zurück
  panelBtns() {
    const r = Math.max(View.btn / 2, 54), sp = Math.min(220, (VW - 120) / 3.6), y = VH / 2 - 6, x = i => VW / 2 + (i - 1.5) * sp;
    return [{ x: x(0), y, r, color: '#b79cff', label: 'Kristalle neu', sub: 'Name und Figur bleiben' }, { x: x(1), y, r, color: '#ff8fb1', label: 'Spiel ganz neu', sub: 'Alles wird gelöscht' },
      { x: x(2), y, r, color: Save.data.learn ? '#5fd38d' : '#d6d0e0', label: 'Lesen & Rechnen', sub: Save.data.learn ? 'ist an' : 'ist aus' }, { x: x(3), y, r, color: '#9ecbff', label: 'Zurück', sub: '' }];
  },
  update(dt) {
    this.t += dt;
    if (this.hold != null) { this.holdT += dt; if (this.holdT > 1.5) { this.hold = null; this.panel = true; this.armed = -1; Sfx.play('pop'); } }
    if (this.flash > 0) this.flash -= dt;
    if (!this.panel && Math.random() < dt * 4) ScreenFx.add({ x: rnd(VW), y: rnd(VH * 0.7), vy: -12, life: 1.4, size: rnd(5, 11), color: pick(PASTEL), shape: 'star', vr: 2 });
  },
  draw(c) {
    drawMeadow(c, this.t);
    // Regenbogenbrücke: jeder gefundene Splitter färbt einen Streifen (8 insgesamt)
    const got = SPLITTERS.filter(id => Save.data.crystals[id]).length, RB = ['#ff7b9c', '#ff9f5a', '#ffd23f', '#9be7a0', '#5fd3c7', '#7db8ff', '#a98bff', '#e59bff'];
    c.lineCap = 'butt'; for (let i = 0; i < 8; i++) { c.strokeStyle = i < got ? RB[i] : 'rgba(255,255,255,0.55)'; c.lineWidth = 13; c.beginPath(); c.arc(VW * 0.6, VH * 0.95, 330 - i * 13, Math.PI * 1.08, Math.PI * 1.92); c.stroke(); }
    const tr = (x, y, s, k) => drawTree(c, { x, y, s, kind: k, shake: 0 }, this.t);
    tr(70, VH - 150, 1.3, 0); tr(VW - 80, VH - 170, 1.4, 1); tr(190, VH - 190, 1.0, 2); tr(VW - 220, VH - 200, 0.9, 0);
    const hop = Math.abs(Math.sin(this.t * 3)) * 10, tp = this.tPos();
    drawActor(c, 'dragon', VW - 150, VH - 70, { size: 95, t: this.t, flip: true, lift: Math.abs(Math.sin(this.t * 2.2 + 1)) * 6 });
    drawActor(c, 'unicorn', VW * 0.5 - 245, VH - 50, { size: 150, t: this.t, lift: hop, mark: Save.data.nameId ? (NAMES.find(n => n.id === Save.data.nameId) || {}).icon : null });
    drawActor(c, 't', tp.x, tp.y, { size: 135, t: this.t });
    const pl = Save.data.player;
    if (pl && pl.name) {   // Namensschild über der Figur (zum Spielen nicht nötig, macht es persönlich)
      c.font = '800 26px system-ui, sans-serif'; const w = c.measureText(pl.name).width + 36;
      rr(c, tp.x - w / 2, tp.y - 210, w, 44, 22); fs(c, 'rgba(255,255,255,0.85)', '#ff8fb1', 3);
      c.fillStyle = '#7a5cc9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(pl.name, tp.x, tp.y - 187); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    }
    const b = this.btn();
    c.fillStyle = 'rgba(255,255,255,0.45)'; circ(c, b.x, b.y, b.r + 22 + Math.sin(this.t * 4) * 6); c.fill();
    drawRoundBtn(c, b.x, b.y, b.r, { color: '#5fd38d', icon: 'play', pulse: !this.panel });
    const cb = this.charBtn();   // Knopf zum Figur-Ändern: zeigt den eigenen Kopf
    drawRoundBtn(c, cb.x, cb.y, cb.r, { color: '#fff7ea' });
    c.save(); circ(c, cb.x, cb.y, cb.r - 4); c.clip(); c.translate(cb.x, cb.y + cb.r * 2.25); c.scale(cb.r / 32, cb.r / 32); drawTHead(c, 1, {}); c.restore();
    const g = this.gear();
    c.globalAlpha = 0.6; c.fillStyle = '#fff'; circ(c, g.x, g.y, g.r); c.fill(); c.fillStyle = '#7a8a9a'; for (let i = 0; i < 3; i++) { circ(c, g.x - 10 + i * 10, g.y, 3); c.fill(); } c.globalAlpha = 1;
    if (this.hold != null) { c.strokeStyle = '#ff8fb1'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.arc(g.x, g.y, g.r + 6, -Math.PI / 2, -Math.PI / 2 + TAU * this.holdT / 1.5); c.stroke(); }
    if (this.panel) {
      c.fillStyle = 'rgba(40,40,70,0.55)'; c.fillRect(0, 0, VW, VH);
      const B = this.panelBtns(), w = Math.min(VW - 30, B[3].x - B[0].x + 240);
      rr(c, VW / 2 - w / 2, VH / 2 - 170, w, 330, 30); fs(c, '#fffaf2', '#fff', 4);
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#5a4a7a'; c.font = '700 26px system-ui, sans-serif'; c.fillText('Für Eltern', VW / 2, VH / 2 - 132);
      B.forEach((q, i) => {
        const arm = this.armed === i;
        drawRoundBtn(c, q.x, q.y, q.r, { color: arm ? '#ff9f43' : q.color, icon: i === 3 ? 'x' : i === 2 ? null : arm ? 'check' : 'redo', pulse: arm });
        if (i === 0 && !arm) drawCrystal(c, q.x, q.y, 9, '#fff');
        if (i === 2) { drawIcon(c, 'abc', q.x, q.y - 12, 30); drawIcon(c, 'math', q.x, q.y + 16, 30); }
        c.fillStyle = '#5a4a7a'; c.font = '700 18px system-ui, sans-serif'; c.fillText(arm ? 'Wirklich? Nochmal tippen' : q.label, q.x, q.y + q.r + 28);
        c.fillStyle = '#8a7aa8'; c.font = '500 15px system-ui, sans-serif'; if (!arm && q.sub) c.fillText(q.sub, q.x, q.y + q.r + 50);
      });
      c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    }
    if (this.flash > 0) { c.fillStyle = 'rgba(255,255,255,' + clamp(this.flash, 0, 1) * 0.8 + ')'; c.fillRect(0, 0, VW, VH); }
  },
  down(p) {
    if (this.panel) {
      const B = this.panelBtns(), i = B.findIndex(q => hit(p, q.x, q.y, q.r + 10));
      if (i < 0 || i === 3) { this.panel = false; Sfx.play('tap'); if (i === 3 && this.fromWorld && Save.data.player && Save.data.name) Game.go(World, {}); return; }
      if (i === 2) { Save.data.learn = !Save.data.learn; Save.store(); Sfx.play('pop'); this.armed = -1; return; }
      if (this.armed !== i) { this.armed = i; Sfx.play('tap'); return; }
      if (i === 0) Save.resetProgress(); else Save.reset();
      this.fromWorld = false;
      this.panel = false; this.flash = 1; Sfx.play('good'); return;
    }
    const b = this.btn(); if (hit(p, b.x, b.y, b.r + 14)) { this.start(p); return; }
    const cb = this.charBtn(); if (hit(p, cb.x, cb.y, cb.r + 8)) { Sfx.play('pop'); Game.go(CharScene, { edit: true }); return; }
    const g = this.gear(); if (hit(p, g.x, g.y, g.r + 14)) { this.hold = p.id; this.holdT = 0; return; }
    const tp = this.tPos(); if (dist(p.x, p.y, tp.x, tp.y - 70) < 70) { Sfx.play('hop'); Voice.say('char_hello'); return; }
    Voice.say('start_welcome');
  },
  up(p) { if (this.hold === p.id) this.hold = null; },
  key(k) { if (this.panel) { if (k === 'Escape') this.panel = false; return; } if (k === 'Enter' || k === 'Space') this.start(null); },
  start(p) {
    Sfx.play('pop'); if (p && p.type === 'touch') goFullscreen();
    if (!Save.data.player) Game.go(CharScene, {});              // neues Spiel: erst die eigene Figur
    else if (Save.data.name) Game.go(World, { back: true }); else Game.go(NamingScene, {});
  }
};

/* ---- Figur gestalten und Namen eingeben ----
   Links die große Vorschau mit Namensschild, in der Mitte fünf Bereiche (Junge/Mädchen, Frisur, Haarfarbe, Hautfarbe, Kleidung),
   rechts die Auswahl. Der Name wird über die Handy-Tastatur eingegeben (Eltern-Aufgabe beim Verschenken). */
const CHAR_CATS = ['gender', 'style', 'hair', 'skin', 'cloth'];
const CharScene = {
  enter(o) {
    this.edit = !!o.edit; this.t = 0; this.cat = 0; this.hop = 0; this.said = false;
    const pl = Save.data.player || {};
    this.look = { gender: pl.gender || DEFAULT_LOOK.gender, skin: pl.skin != null ? pl.skin : DEFAULT_LOOK.skin, hair: pl.hair != null ? pl.hair : DEFAULT_LOOK.hair, style: pl.style != null ? pl.style : DEFAULT_LOOK.style, cloth: pl.cloth != null ? pl.cloth : DEFAULT_LOOK.cloth };
    this.name = pl.name || ''; this.input = null;
  },
  leave() { this.closeInput(true); },
  count(cat) { return { gender: 2, style: STYLE_ORDER.length, hair: 8, skin: 6, cloth: 8 }[cat]; },
  layout() {
    const px = clamp(VW * 0.19, 120, 250), catX = px * 2 + 30, gx0 = catX + 70, gx1 = VW - 24, cols = 4, cell = (gx1 - gx0) / cols;
    const cr = clamp(VH / 13, 34, 44), r = clamp(cell * 0.4, 30, 56);
    return { prev: { x: px, y: VH - 50 }, nameBox: { x: px, y: 60, w: clamp(px * 1.7, 200, 340), h: 64 }, cats: CHAR_CATS.map((_, i) => ({ x: catX, y: 70 + i * (VH - 140) / 4, r: cr })),
      opt: k => ({ x: gx0 + cell * (k % cols + 0.5), y: 128 + Math.floor(k / cols) * 132, r: Math.min(r, 54) }), ok: { x: VW - 24 - Math.max(View.btn / 2, 54), y: VH - 24 - Math.max(View.btn / 2, 54), r: Math.max(View.btn / 2, 54) } };
  },
  update(dt) {
    this.t += dt; if (this.hop > 0) this.hop -= dt * 2;
    if (!this.said && this.t > 0.8) { this.said = true; Voice.say('char_intro'); }
  },
  set(key, v) { this.look[key] = v; this.hop = 1; Sfx.play('pop'); delete SIL.t; },
  drawOption(c, cat, k, q, sel) {
    const L = this.look, t = this.t;
    if (sel) { c.fillStyle = 'rgba(255,255,255,0.8)'; circ(c, q.x, q.y, q.r + 10); c.fill(); }
    if (cat === 'gender') {
      drawRoundBtn(c, q.x, q.y, q.r, { color: '#fff7ea', stroke: sel ? '#ff8fb1' : '#fff' });
      c.save(); circ(c, q.x, q.y, q.r - 3); c.clip(); drawActor(c, 't', q.x, q.y + q.r * 0.95, { size: q.r * 1.75, t: 0.5, noShadow: true, look: Object.assign({}, L, { gender: k ? 'boy' : 'girl', style: k ? (L.style === 3 ? 0 : L.style) : L.style }) }); c.restore();
    } else if (cat === 'style') {
      drawRoundBtn(c, q.x, q.y, q.r, { color: '#fff7ea', stroke: sel ? '#ff8fb1' : '#fff' });
      c.save(); circ(c, q.x, q.y, q.r - 3); c.clip(); c.translate(q.x, q.y + q.r * 2.25); c.scale(q.r / 32, q.r / 32); drawTHead(c, 0.5, { look: Object.assign({}, L, { style: STYLE_ORDER[k] }) }); c.restore();
    } else {
      const col = cat === 'hair' ? LOOK.hair[k] : cat === 'skin' ? LOOK.skin[k] : LOOK.cloth[k];
      circ(c, q.x, q.y, q.r); fs(c, col, sel ? '#ff8fb1' : '#fff', sel ? 6 : 4);
      c.fillStyle = 'rgba(255,255,255,0.35)'; ell(c, q.x - q.r * 0.3, q.y - q.r * 0.35, q.r * 0.25, q.r * 0.15, -0.5); c.fill();
    }
    if (sel) { circ(c, q.x + q.r * 0.7, q.y - q.r * 0.7, 14); fs(c, '#5fd38d', '#fff', 3); drawIcon(c, 'check', q.x + q.r * 0.7, q.y - q.r * 0.7, 16); }
  },
  draw(c) {
    const L = this.look, D = this.layout(), t = this.t;
    drawMeadow(c, t);
    // Vorschau
    c.fillStyle = 'rgba(255,255,255,0.45)'; ell(c, D.prev.x, D.prev.y, 110, 26); c.fill();
    drawActor(c, 't', D.prev.x, D.prev.y, { size: 250, t, look: L, lift: hopLift(this.hop, 30) });
    // Namensschild: antippen öffnet die Tastatur
    const nb = D.nameBox;
    rr(c, nb.x - nb.w / 2, nb.y - nb.h / 2, nb.w, nb.h, 32); fs(c, '#fff', this.input ? '#ff8fb1' : '#e8dff5', 4);
    if (this.name && !this.input) { c.font = '800 30px system-ui, sans-serif'; c.fillStyle = '#7a5cc9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(this.name, nb.x, nb.y + 1, nb.w - 70); c.textAlign = 'left'; c.textBaseline = 'alphabetic'; drawIcon(c, 'keys', nb.x + nb.w / 2 - 30, nb.y, 26); }
    else drawIcon(c, 'keys', nb.x, nb.y, 46);
    // Bereiche
    D.cats.forEach((q, i) => {
      const on = this.cat === i;
      drawRoundBtn(c, q.x, q.y, q.r, { color: on ? '#ffe9f3' : '#fff7ea', stroke: on ? '#ff8fb1' : '#fff' });
      c.save(); circ(c, q.x, q.y, q.r - 3); c.clip();
      const id = CHAR_CATS[i];
      if (id === 'gender') drawActor(c, 't', q.x, q.y + q.r * 0.95, { size: q.r * 1.7, t: 0.5, noShadow: true, look: L });
      else if (id === 'style') { c.translate(q.x, q.y + q.r * 2.25); c.scale(q.r / 32, q.r / 32); drawTHead(c, 0.5, { look: L }); }
      else if (id === 'hair') { c.fillStyle = LOOK.hair[L.hair]; ell(c, q.x, q.y - 4, q.r * 0.55, q.r * 0.45); c.fill(); circ(c, q.x - q.r * 0.45, q.y + q.r * 0.25, q.r * 0.22); c.fill(); circ(c, q.x + q.r * 0.45, q.y + q.r * 0.25, q.r * 0.22); c.fill(); }
      else if (id === 'skin') { c.fillStyle = LOOK.skin[L.skin]; c.beginPath(); c.arc(q.x, q.y + 8, q.r * 0.42, 0, TAU); c.fill(); [-0.5, -0.2, 0.1, 0.4].forEach((a, k) => { rr(c, q.x - q.r * 0.42 + k * q.r * 0.23, q.y - q.r * 0.55, q.r * 0.17, q.r * 0.55, q.r * 0.08); c.fill(); }); }
      else { c.save(); c.translate(q.x, q.y + q.r * 0.75); c.scale(q.r / 40, q.r / 40); drawTBody(c, 0, { look: L }); c.restore(); }
      c.restore();
    });
    // Auswahl des aktiven Bereichs
    const cat = CHAR_CATS[this.cat], cur = cat === 'gender' ? (L.gender === 'boy' ? 1 : 0) : cat === 'style' ? STYLE_ORDER.indexOf(L.style) : L[cat];
    for (let k = 0; k < this.count(cat); k++) this.drawOption(c, cat, k, D.opt(k), k === cur);
    drawRoundBtn(c, D.ok.x, D.ok.y, D.ok.r, { color: '#5fd38d', icon: 'check', pulse: true });
  },
  openInput() {
    if (this.input) return;
    try {
      const el = document.createElement('input');
      el.type = 'text'; el.maxLength = 14; el.value = this.name; el.autocomplete = 'off'; el.setAttribute('autocapitalize', 'words'); el.setAttribute('enterkeyhint', 'done'); el.setAttribute('aria-label', 'Name');
      Object.assign(el.style, { position: 'fixed', left: '50%', top: '10px', transform: 'translateX(-50%)', width: 'min(80vw, 420px)', font: '700 28px system-ui, sans-serif', padding: '10px 20px', borderRadius: '999px', border: '4px solid #ff8fb1', textAlign: 'center', zIndex: 10, outline: 'none', background: '#fff', color: '#7a5cc9', userSelect: 'text', webkitUserSelect: 'text', touchAction: 'auto' });
      el.addEventListener('input', () => { this.name = el.value; });
      el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); this.closeInput(); } e.stopPropagation(); });
      el.addEventListener('blur', () => this.closeInput());
      document.body.appendChild(el); this.input = el; el.focus();
    } catch (e) { this.input = null; }
  },
  closeInput(quiet) {
    if (!this.input) return;
    const el = this.input; this.input = null; this.name = el.value.trim().slice(0, 14);
    try { el.remove(); } catch (e) {}
    if (!quiet && this.name) { this.hop = 1; Voice.say('char_hello', { vars: { spieler: this.name } }); }
  },
  down(p) {
    if (this.input) { this.closeInput(); return; }
    const D = this.layout(), nb = D.nameBox;
    if (Math.abs(p.x - nb.x) < nb.w / 2 && Math.abs(p.y - nb.y) < nb.h / 2 + 10) { Sfx.play('tap'); this.openInput(); return; }
    for (let i = 0; i < D.cats.length; i++) { const q = D.cats[i]; if (hit(p, q.x, q.y, q.r + 8)) { this.cat = i; Sfx.play('tap'); return; } }
    const cat = CHAR_CATS[this.cat];
    for (let k = 0; k < this.count(cat); k++) { const q = D.opt(k); if (hit(p, q.x, q.y, q.r + 10)) {
      if (cat === 'gender') { const boy = k === 1; if ((this.look.gender === 'boy') !== boy) { this.look.gender = boy ? 'boy' : 'girl'; if (boy && this.look.style === 3) this.look.style = 0; } this.set('gender', this.look.gender); }
      else this.set(cat, cat === 'style' ? STYLE_ORDER[k] : k);
      return;
    } }
    if (hit(p, D.ok.x, D.ok.y, D.ok.r + 10)) { this.confirm(); return; }
    if (dist(p.x, p.y, D.prev.x, D.prev.y - 130) < 120) { this.hop = 1; Sfx.play('hop'); Voice.say('char_hello', { vars: { spieler: this.name || 'du' } }); }
  },
  key(k) { if (k === 'Enter' && !this.input) this.confirm(); },
  confirm() {
    if (Game.pending) return;
    Save.data.player = Object.assign({}, this.look, { name: this.name.trim() }); Save.store(); delete SIL.t;
    Sfx.play('win'); ScreenFx.confetti(VW, 40); Voice.say('char_done');
    if (this.edit) Game.go(StartScene, {}); else if (Save.data.name) Game.go(World, { back: true }); else Game.go(NamingScene, {});
  }
};

const NamingScene = {
  enter() { this.t = 0; this.sel = -1; this.done = -1; this.idle = 0; this.hop = 0; this.said = false; this.toldConfirm = false; this.hintT = 0; },
  layout() {
    const r = Math.max(View.btn / 2 + 6, 58), sp = Math.min(190, (VW - 60) / 4);
    return { r, btns: NAMES.map((n, i) => ({ x: VW / 2 + (i - 1.5) * sp, y: VH - r - 22 })), ok: { x: Math.min(VW - 110, VW / 2 + 250), y: 215, r: Math.max(View.btn / 2 + 4, 56) }, uni: { x: VW / 2 - 10, y: 330 } };
  },
  update(dt) {
    this.t += dt; if (this.hop > 0) this.hop -= dt * 2; if (this.hintT > 0) this.hintT -= dt;
    if (!this.said && this.t > 1.1) { this.said = true; Voice.say('name_intro'); }
    if (this.done >= 0) { this.done += dt; if (this.done > 3.2) Game.go(World, { first: true }); return; }
    this.idle += dt;
    if (this.idle > CONFIG.hintDelay) { this.idle = 0; this.hintT = 4; Sfx.play('hint'); Voice.say(this.sel >= 0 ? 'name_confirm' : 'name_intro'); }
  },
  draw(c) {
    drawMeadow(c, this.t);
    const L = this.layout(), enter = easeOut(this.t / 1.1);
    const ux = lerp(-140, L.uni.x, enter), lift = Math.sin(clamp(this.hop, 0, 1) * Math.PI) * 40 + (enter < 1 ? Math.abs(Math.sin(this.t * 9)) * 16 : 0) + (this.done >= 0 ? Math.abs(Math.sin(this.done * 7)) * 30 : 0);
    drawActor(c, 't', L.uni.x - 210 < 70 ? 70 : L.uni.x - 210, 345, { size: 125, t: this.t });
    drawActor(c, 'unicorn', ux, L.uni.y, { size: 215, t: this.t, lift, walk: enter < 1, mark: this.sel >= 0 ? NAMES[this.sel].icon : null, glow: this.done >= 0 });
    NAMES.forEach((n, i) => {
      const b = L.btns[i], on = this.sel === i, wig = this.hintT > 0 && this.sel < 0 ? Math.max(0, Math.sin(this.t * 6 - i * 0.9)) * 9 : 0;
      if (on) { c.fillStyle = 'rgba(255,255,255,0.7)'; circ(c, b.x, b.y, L.r + 12); c.fill(); }
      drawRoundBtn(c, b.x, b.y - wig, L.r * (on ? 1.08 : 1), { color: n.color, stroke: on ? '#ff8fb1' : '#fff', icon: n.icon, iconScale: 1.15 });
    });
    if (this.sel >= 0 && this.done < 0) drawRoundBtn(c, L.ok.x, L.ok.y, L.ok.r, { color: '#5fd38d', icon: 'check', pulse: true, glow: this.hintT > 0 });
  },
  down(p) {
    if (this.done >= 0 || this.t < 0.6) return;
    this.idle = 0; this.hintT = 0;
    const L = this.layout();
    for (let i = 0; i < NAMES.length; i++) if (hit(p, L.btns[i].x, L.btns[i].y, L.r + 8)) {
      this.sel = i; this.hop = 1; Sfx.play('pop'); Voice.say('name_' + NAMES[i].id);
      ScreenFx.burst(L.btns[i].x, L.btns[i].y, 10, { g: 100 });
      if (!this.toldConfirm) { this.toldConfirm = true; Voice.say('name_confirm', { queue: true }); }
      return;
    }
    if (this.sel >= 0 && hit(p, L.ok.x, L.ok.y, L.ok.r + 10)) this.confirm();
    else if (hit(p, L.uni.x, L.uni.y - 110, 110)) { this.hop = 1; Sfx.play('hop'); }
  },
  key(k) {
    if (this.done >= 0) return;
    const n = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3 }[k];
    if (n != null) { this.sel = n; this.hop = 1; Sfx.play('pop'); Voice.say('name_' + NAMES[n].id); }
    if ((k === 'Enter' || k === 'Space') && this.sel >= 0) this.confirm();
  },
  confirm() {
    const n = NAMES[this.sel]; Save.data.name = n.text; Save.data.nameId = n.id; Save.store();
    this.done = 0; Sfx.play('win'); Voice.say('name_done'); ScreenFx.confetti(VW, 70);
  }
};
