
/* ============ 3. GRAFIK ============
   Jede Figur ist eine Funktion draw…(c, t, o), die mit den Füßen bei (0,0) und ca. 100 Einheiten Höhe zeichnet.
   drawActor() entscheidet: Gibt es in CONFIG.sprites ein Bild, wird das Bild benutzt, sonst der Code. */
function circ(c, x, y, r) { c.beginPath(); c.arc(x, y, Math.max(0, r), 0, TAU); }
function ell(c, x, y, rx, ry, rot = 0) { c.beginPath(); c.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), rot, 0, TAU); }
function rr(c, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function line(c, x1, y1, x2, y2) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }
function tri(c, x1, y1, x2, y2, x3, y3) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineTo(x3, y3); c.closePath(); }
function starPath(c, x, y, r, n = 5, inner = 0.5, rot = -Math.PI / 2) {
  c.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, rad = i % 2 ? r * inner : r; c.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); }
  c.closePath();
}
function sparklePath(c, x, y, r) { c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r); c.closePath(); }
function heartPath(c, x, y, s) { c.beginPath(); c.moveTo(x, y + s * 0.5); c.bezierCurveTo(x - s, y - s * 0.1, x - s * 0.5, y - s * 0.8, x, y - s * 0.3); c.bezierCurveTo(x + s * 0.5, y - s * 0.8, x + s, y - s * 0.1, x, y + s * 0.5); c.closePath(); }
function fs(c, fill, stroke, lw) { if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 2; c.stroke(); } }

/* ---- Symbole (statt Text) ---- */
function drawIcon(c, id, x, y, s, col) {
  c.save(); c.translate(x, y); const k = s / 50; c.scale(k, k); c.lineCap = 'round'; c.lineJoin = 'round';
  switch (id) {
    case 'play': tri(c, -13, -24, 27, 0, -13, 24); c.lineWidth = 8; fs(c, col || '#fff', col || '#fff', 8); break;
    case 'check': c.strokeStyle = col || '#fff'; c.lineWidth = 11; c.beginPath(); c.moveTo(-20, 2); c.lineTo(-6, 16); c.lineTo(22, -14); c.stroke(); break;
    case 'left': tri(c, 14, -20, -18, 0, 14, 20); fs(c, col || '#fff', col || '#fff', 8); break;
    case 'right': tri(c, -14, -20, 18, 0, -14, 20); fs(c, col || '#fff', col || '#fff', 8); break;
    case 'up': tri(c, -20, 12, 0, -20, 20, 12); fs(c, col || '#fff', col || '#fff', 8); break;
    case 'home': tri(c, -24, -2, 0, -24, 24, -2); fs(c, col || '#fff', col || '#fff', 6); rr(c, -16, -4, 32, 24, 4); c.fill(); c.fillStyle = 'rgba(0,0,0,0.18)'; rr(c, -5, 6, 10, 14, 3); c.fill(); break;
    case 'x': c.strokeStyle = col || '#fff'; c.lineWidth = 11; line(c, -16, -16, 16, 16); line(c, 16, -16, -16, 16); break;
    case 'redo': c.strokeStyle = col || '#fff'; c.lineWidth = 9; c.beginPath(); c.arc(0, 0, 18, -Math.PI * 0.35, Math.PI * 1.25); c.stroke(); tri(c, 2, -26, 22, -16, 6, -6); fs(c, col || '#fff', col || '#fff', 4); break;
    case 'heart': heartPath(c, 0, 2, 26); fs(c, '#ff8fb1', '#f06a98', 3); c.fillStyle = 'rgba(255,255,255,0.6)'; ell(c, -8, -6, 5, 3, -0.6); c.fill(); break;
    case 'map':
      c.beginPath(); c.moveTo(-24, -16); c.lineTo(-8, -22); c.lineTo(8, -16); c.lineTo(24, -22); c.lineTo(24, 18); c.lineTo(8, 24); c.lineTo(-8, 18); c.lineTo(-24, 24); c.closePath(); fs(c, '#fff3d6', '#c9a46e', 3);
      c.fillStyle = 'rgba(201,164,110,0.25)'; c.beginPath(); c.moveTo(-8, -22); c.lineTo(8, -16); c.lineTo(8, 24); c.lineTo(-8, 18); c.closePath(); c.fill();
      c.fillStyle = '#7ed56f'; circ(c, -14, 6, 6); c.fill(); c.fillStyle = '#8fd0f0'; ell(c, 13, -4, 7, 5); c.fill();
      c.setLineDash([3, 4]); c.strokeStyle = '#e76f4c'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-16, 14); c.quadraticCurveTo(0, 0, 14, 10); c.stroke(); c.setLineDash([]);
      c.strokeStyle = '#e76f4c'; c.lineWidth = 3.5; line(c, 10, 6, 18, 14); line(c, 18, 6, 10, 14); break;
    case 'abc': rr(c, -24, -18, 48, 36, 5); fs(c, '#fff', '#c9a46e', 3); c.strokeStyle = '#c9a46e'; c.lineWidth = 2; line(c, -24, -18, 0, 2); line(c, 24, -18, 0, 2); c.fillStyle = '#5a4a7a'; c.font = '800 16px system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ABC', 0, 10); break;
    case 'math': c.fillStyle = '#5a4a7a'; c.font = '800 24px system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('1+2', 0, 2); break;
    case 'keys': rr(c, -26, -16, 52, 32, 6); fs(c, '#fff', '#9a8fb5', 3); c.fillStyle = '#9a8fb5'; for (let r = 0; r < 2; r++) for (let k = 0; k < 5; k++) { rr(c, -21 + k * 9, -10 + r * 9, 6, 6, 1.5); c.fill(); } rr(c, -12, 8, 24, 4, 2); c.fill(); break;
    case 'star': starPath(c, 0, 0, 25); fs(c, '#ffd54a', '#f0b429', 3); break;
    case 'sparkle': sparklePath(c, -2, 2, 24); fs(c, '#ff8fd0'); sparklePath(c, 17, -16, 11); fs(c, '#ffd54a'); sparklePath(c, -18, -15, 8); fs(c, '#a98bff'); break;
    case 'cloud': c.fillStyle = '#fff'; c.strokeStyle = '#a9cdee'; c.lineWidth = 3;
      c.beginPath(); c.arc(-14, 6, 12, Math.PI * 0.5, Math.PI * 1.5); c.arc(-4, -6, 14, Math.PI, Math.PI * 1.8); c.arc(12, -2, 12, Math.PI * 1.3, Math.PI * 0.2); c.arc(14, 8, 10, Math.PI * 1.7, Math.PI * 0.5); c.closePath(); c.fill(); c.stroke(); break;
    case 'rainbow': ['#ff7b9c', '#ffb65c', '#ffe066', '#7ddc8a', '#7db8ff'].forEach((col2, i) => { c.strokeStyle = col2; c.lineWidth = 5.5; c.beginPath(); c.arc(0, 12, 26 - i * 5, Math.PI, 0); c.stroke(); }); break;
    case 'gem': drawGem(c, 1, -9, 2, 15); drawGem(c, 0, 12, 4, 13); break;
    case 'shadow': c.fillStyle = '#5d5a80'; ell(c, 0, 8, 17, 14); c.fill(); circ(c, 0, -10, 11); c.fill(); tri(c, -10, -14, -8, -26, -2, -18); c.fill(); tri(c, 10, -14, 8, -26, 2, -18); c.fill(); break;
  }
  c.restore();
}
function drawBackpack(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s / 50, s / 50);
  c.strokeStyle = '#d9603f'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.arc(0, -20, 10, Math.PI, 0); c.stroke();
  rr(c, -23, -20, 46, 46, 13); fs(c, '#ff8a65', '#e76f4c', 2.5);
  rr(c, -23, -20, 46, 21, 11); fs(c, '#ff7043');
  rr(c, -13, 6, 26, 15, 6); fs(c, '#ffb199');
  rr(c, -5, -4, 10, 9, 3); fs(c, '#ffe082', '#f0b429', 1.5);
  c.restore();
}
function drawRoundBtn(c, x, y, r, o = {}) {
  const s = (o.pulse ? 1 + Math.sin(Game.time * 6) * 0.07 : 1) * (o.pressed ? 0.93 : 1);
  c.save(); c.translate(x, y); c.scale(s, s);
  if (o.glow) { c.fillStyle = 'rgba(255,240,140,' + (0.35 + Math.sin(Game.time * 6) * 0.2) + ')'; circ(c, 0, 0, r + 14); c.fill(); }
  c.fillStyle = 'rgba(60,40,80,0.2)'; circ(c, 0, 5, r); c.fill();
  circ(c, 0, 0, r); fs(c, o.color || '#fff', o.stroke || 'rgba(255,255,255,0.95)', 4);
  if (o.icon) drawIcon(c, o.icon, 0, 0, r * (o.iconScale || 1.05), o.iconColor);
  c.restore();
}

/* ---- Edelsteine (Farbe UND Form unterscheiden sich) und Kristalle ---- */
const GEMS = [
  { col: '#ff6b81', dark: '#d9435e', shape: 'round', tone: 523 },
  { col: '#5aa9ff', dark: '#2f7fd6', shape: 'diamond', tone: 659 },
  { col: '#ffd23f', dark: '#e0a800', shape: 'star', tone: 784 },
  { col: '#5fd38d', dark: '#2fa866', shape: 'tri', tone: 880 }
];
function drawGem(c, type, x, y, r) {
  const g = GEMS[type]; c.save(); c.translate(x, y); c.lineJoin = 'round';
  if (g.shape === 'round') circ(c, 0, 0, r);
  else if (g.shape === 'diamond') { c.beginPath(); c.moveTo(0, -r * 1.15); c.lineTo(r, 0); c.lineTo(0, r * 1.15); c.lineTo(-r, 0); c.closePath(); }
  else if (g.shape === 'star') starPath(c, 0, 0, r * 1.2, 5, 0.55);
  else { c.beginPath(); c.moveTo(0, -r * 1.05); c.lineTo(r * 1.05, r * 0.85); c.lineTo(-r * 1.05, r * 0.85); c.closePath(); }
  fs(c, g.col, g.dark, Math.max(2, r * 0.12));
  c.fillStyle = 'rgba(255,255,255,0.55)'; ell(c, -r * 0.28, -r * 0.3, r * 0.22, r * 0.13, -0.6); c.fill();
  c.restore();
}
function drawCrystal(c, x, y, s, col) {
  if (s <= 0) return;
  c.save(); c.translate(x, y); c.lineJoin = 'round';
  c.beginPath(); c.moveTo(0, -s); c.lineTo(s * 0.58, -s * 0.35); c.lineTo(s * 0.58, s * 0.45); c.lineTo(0, s); c.lineTo(-s * 0.58, s * 0.45); c.lineTo(-s * 0.58, -s * 0.35); c.closePath();
  fs(c, col, 'rgba(255,255,255,0.9)', Math.max(1.5, s * 0.09));
  c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.moveTo(0, -s); c.lineTo(s * 0.58, -s * 0.35); c.lineTo(0, -s * 0.1); c.lineTo(-s * 0.58, -s * 0.35); c.closePath(); c.fill();
  c.fillStyle = 'rgba(0,0,0,0.1)'; c.beginPath(); c.moveTo(0, -s * 0.1); c.lineTo(s * 0.58, -s * 0.35); c.lineTo(s * 0.58, s * 0.45); c.lineTo(0, s); c.closePath(); c.fill();
  c.restore();
}

/* ---- Bilder laden (optional) ---- */
const Sprites = {
  img: {},
  load() {
    const mk = src => { try { const i = new Image(); i.src = src; return i; } catch (e) { return null; } };
    for (const k in CONFIG.sprites) if (CONFIG.sprites[k]) this.img[k] = mk(CONFIG.sprites[k]);
    if (CONFIG.tHead.image) this.img.tHead = mk(CONFIG.tHead.image);
  },
  ready(k) { const i = this.img[k]; return i && i.complete && i.naturalWidth > 0 ? i : null; }
};

/* ---- T: Körper + eigene, austauschbare Kopf-Ebene ----
   Das Aussehen (Junge/Mädchen, Haut, Haare, Frisur, Kleidung) kommt aus Save.data.player
   oder für Vorschauen aus o.look. Ein Kopfbild in CONFIG.tHead ersetzt Gesicht und Haare. */
const LOOK = {
  skin:  ['#fde4cf', '#f9d0b0', '#eab28c', '#c98d63', '#a0683f', '#6f4529'],
  hair:  ['#2b2122', '#5a3825', '#8a5a3c', '#b5562e', '#e0b25a', '#f3dc95', '#f48fb1', '#8fb8f4'],
  cloth: ['#ff8fb1', '#b79cff', '#5aa9ff', '#5fd38d', '#ffd23f', '#ff9f5a', '#ff6b6b', '#5fd3c7'],
  styles: ['kurz', 'wuschel', 'bob', 'zoepfe', 'zopf', 'lang', 'scheitel', 'stoppel', 'igel', 'afro']
};
// Reihenfolge in der Auswahl: erst kurze, dann lange Frisuren (die Nummern im Spielstand bleiben gleich)
const STYLE_ORDER = [0, 6, 7, 8, 1, 9, 2, 3, 4, 5];
const DEFAULT_LOOK = { gender: 'girl', skin: 1, hair: 2, style: 3, cloth: 0 };
const curLook = o => (o && o.look) || Object.assign({}, DEFAULT_LOOK, (Save.data && Save.data.player) || {});
function shade(hex, f) {   // f < 0 dunkler
  const n = parseInt(hex.slice(1), 16), ch = k => clamp(Math.round(((n >> k) & 255) * (1 + f)), 0, 255);
  return '#' + ((1 << 24) + (ch(16) << 16) + (ch(8) << 8) + ch(0)).toString(16).slice(1);
}
function drawTBody(c, t, o) {
  const img = Sprites.ready('tBody');
  if (img) { const h = 100, w = h * img.naturalWidth / img.naturalHeight; c.drawImage(img, -w / 2, -h, w, h); return; }
  const L = curLook(o), skin = LOOK.skin[L.skin], cl = LOOK.cloth[L.cloth], boy = L.gender === 'boy';
  const w = o.walk ? Math.sin(t * 13) : 0, shoe = '#6a5a8a';
  c.lineCap = 'round';
  c.strokeStyle = skin; c.lineWidth = 7;
  if (o.sit) { line(c, -6, -24, -13, -6); line(c, 7, -24, 13, -4); c.fillStyle = shoe; ell(c, -13, -4, 6.5, 4.5); c.fill(); ell(c, 15, -2, 6.5, 4.5); c.fill(); }
  else { line(c, -7, -24, -7 + w * 5, -5); line(c, 7, -24, 7 - w * 5, -5); c.fillStyle = shoe; ell(c, -7 + w * 5 + 2, -3, 7.5, 4.5); c.fill(); ell(c, 7 - w * 5 + 2, -3, 7.5, 4.5); c.fill(); }
  c.strokeStyle = skin; c.lineWidth = 6; line(c, -12, -47, -21, -31 + w * 4); line(c, 12, -47, 21, -31 - w * 4);
  if (boy) {
    rr(c, -13, -32, 26, 13, 4); fs(c, '#5b6b9a', '#4a5880', 1.5);                    // kurze Hose
    c.beginPath(); c.moveTo(-12, -54); c.lineTo(12, -54); c.lineTo(17, -44); c.lineTo(13, -42); c.lineTo(14, -28); c.lineTo(-14, -28); c.lineTo(-13, -42); c.lineTo(-17, -44); c.closePath();
    fs(c, cl, shade(cl, -0.15), 2);
    c.fillStyle = '#fff'; starPath(c, 0, -40, 6); c.fill();
  } else {
    c.beginPath(); c.moveTo(-12, -53); c.lineTo(12, -53); c.lineTo(21, -21); c.quadraticCurveTo(0, -14, -21, -21); c.closePath(); fs(c, cl, shade(cl, -0.15), 2);
    c.fillStyle = '#fff'; sparklePath(c, 0, -34, 6); c.fill();
  }
}
function drawHairBack(c, L, cx, cy, hc) {
  c.fillStyle = hc;
  switch (LOOK.styles[L.style]) {
    case 'kurz': circ(c, cx, cy - 3, 22.5); c.fill(); break;
    case 'wuschel': for (let a = 0; a < 9; a++) { const an = Math.PI * (0.9 + a * 0.15); circ(c, cx + Math.cos(an) * 20, cy - 2 + Math.sin(an) * 20, 9); c.fill(); } circ(c, cx, cy - 3, 22); c.fill(); break;
    case 'bob': rr(c, cx - 25, cy - 25, 50, 42, 18); c.fill(); break;
    case 'zoepfe': circ(c, cx, cy - 2, 24); c.fill(); ell(c, cx - 27, cy + 12, 8, 14); c.fill(); ell(c, cx + 27, cy + 12, 8, 14); c.fill(); c.fillStyle = '#ffd86b'; circ(c, cx - 25, cy - 1, 4); c.fill(); circ(c, cx + 25, cy - 1, 4); c.fill(); break;
    case 'zopf': circ(c, cx, cy - 2, 24); c.fill(); ell(c, cx - 27, cy + 2, 9, 19, 0.45); c.fill(); c.fillStyle = '#ffd86b'; circ(c, cx - 21, cy - 12, 4); c.fill(); break;
    case 'lang': rr(c, cx - 26, cy - 26, 52, 62, 20); c.fill(); break;
    case 'scheitel': circ(c, cx, cy - 3, 22.5); c.fill(); break;
    case 'stoppel': circ(c, cx, cy - 1, 21.6); c.fill(); break;
    case 'igel': circ(c, cx, cy - 3, 22); c.fill(); for (let k = 0; k < 9; k++) { const a = Math.PI * (1.02 + k * 0.12); tri(c, cx + Math.cos(a - 0.09) * 20, cy - 3 + Math.sin(a - 0.09) * 20, cx + Math.cos(a) * 31, cy - 3 + Math.sin(a) * 31, cx + Math.cos(a + 0.09) * 20, cy - 3 + Math.sin(a + 0.09) * 20); c.fill(); } break;
    case 'afro': circ(c, cx, cy - 7, 31); c.fill(); for (let a = 0; a < 12; a++) { const an = a / 12 * TAU; circ(c, cx + Math.cos(an) * 28, cy - 7 + Math.sin(an) * 28, 8); c.fill(); } break;
  }
}
function drawHairFront(c, L, cx, cy, hc) {
  c.fillStyle = hc;
  switch (LOOK.styles[L.style]) {
    case 'wuschel': for (let k = -2; k <= 2; k++) { circ(c, cx + k * 7.5, cy - 15 + Math.abs(k) * 2, 7); c.fill(); } break;
    case 'bob': c.beginPath(); c.arc(cx, cy, 20.5, Math.PI, 0); c.lineTo(cx + 20.5, cy - 6); c.lineTo(cx - 20.5, cy - 6); c.closePath(); c.fill(); break;
    case 'scheitel': c.beginPath(); c.arc(cx, cy, 20.5, Math.PI * 1.02, Math.PI * 1.98); c.quadraticCurveTo(cx + 14, cy - 2, cx + 4, cy - 10); c.quadraticCurveTo(cx - 8, cy - 14, cx - 20, cy - 4); c.closePath(); c.fill(); break;
    case 'stoppel': c.beginPath(); c.arc(cx, cy, 20.5, Math.PI * 1.1, Math.PI * 1.9); c.quadraticCurveTo(cx, cy - 13, cx - 19.5, cy - 7); c.closePath(); c.fill(); break;
    case 'igel': c.beginPath(); c.arc(cx, cy, 20.5, Math.PI * 1.08, Math.PI * 1.92); c.lineTo(cx + 12, cy - 12); c.lineTo(cx + 6, cy - 9); c.lineTo(cx, cy - 13); c.lineTo(cx - 6, cy - 9); c.lineTo(cx - 12, cy - 12); c.closePath(); c.fill(); break;
    case 'afro': for (let k = -3; k <= 3; k++) { circ(c, cx + k * 6.5, cy - 15 + Math.abs(k) * 1.6, 7); c.fill(); } break;
    default: c.beginPath(); c.arc(cx, cy, 20.5, Math.PI * 1.08, Math.PI * 1.92); c.quadraticCurveTo(cx, cy - 8, cx - 19.5, cy - 5); c.closePath(); c.fill();
  }
}
function drawTHead(c, t, o) {
  const cx = CONFIG.tHead.offsetX, cy = -72 + CONFIG.tHead.offsetY;
  const img = Sprites.ready('tHead');
  if (img) { const h = 54 * CONFIG.tHead.size, w = h * img.naturalWidth / img.naturalHeight; c.drawImage(img, cx - w / 2, cy - h / 2, w, h); return; }
  const L = curLook(o), hc = LOOK.hair[L.hair], skin = LOOK.skin[L.skin];
  drawHairBack(c, L, cx, cy, hc);
  circ(c, cx, cy, 20.5); fs(c, skin);
  drawHairFront(c, L, cx, cy, hc);
  const blink = ((t || 0) % 3.7) < 0.12;
  c.fillStyle = '#3d2b3a';
  if (blink) { c.fillRect(cx - 10, cy + 1, 6, 1.6); c.fillRect(cx + 4, cy + 1, 6, 1.6); }
  else { circ(c, cx - 7, cy + 1, 2.7); c.fill(); circ(c, cx + 7, cy + 1, 2.7); c.fill(); }
  c.fillStyle = 'rgba(255,120,150,0.4)'; circ(c, cx - 12, cy + 8, 4); c.fill(); circ(c, cx + 12, cy + 8, 4); c.fill();
  c.strokeStyle = '#b5546a'; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); c.arc(cx, cy + 5, 6.5, Math.PI * 0.15, Math.PI * 0.85); c.stroke();
}
function drawT(c, t, o) { drawTBody(c, t, o); drawTHead(c, t, o); const hat = o && o.hat !== undefined ? o.hat : Save.data && Save.data.wear && Save.data.wear.t; if (hat && !Sprites.ready('tHead')) drawHat(c, hat, CONFIG.tHead.offsetX, -72 + CONFIG.tHead.offsetY - 4); }

/* ---- Einhorn (schaut nach rechts) ---- */
const MANE = ['#ff9ecb', '#ffd27f', '#9be7c4', '#9ecbff', '#c9a5ff'];
function drawUnicorn(c, t, o) {
  const w = o.walk ? Math.sin(t * 13) : 0;
  c.lineCap = 'round'; c.lineJoin = 'round';
  MANE.forEach((col, i) => { c.strokeStyle = col; c.lineWidth = 6; c.beginPath(); c.moveTo(-29, -50); c.quadraticCurveTo(-60, -52 + i * 4, -52 + i * 2.5, -20 + i * 3 + Math.sin(t * 3 + i) * 2); c.stroke(); });
  const leg = (x, ph, shade) => { const dx = ph * w * 5; rr(c, x - 5 + dx, -26, 10, 24, 4); fs(c, shade ? '#efe6f5' : '#ffffff', '#e0d0ec', 1.5); rr(c, x - 5 + dx, -7, 10, 7, 3); fs(c, '#f7b6d2'); };
  const wings = o.wings !== undefined ? o.wings : Save.data && Save.data.wings;
  if (wings) drawWing(c, false, t);
  leg(-17, -1, true); leg(19, 1, true);
  ell(c, 0, -43, 32, 20); fs(c, '#ffffff', '#e0d0ec', 2);
  leg(-24, 1, false); leg(12, -1, false);
  if (wings) drawWing(c, true, t);
  c.beginPath(); c.moveTo(14, -56); c.lineTo(27, -84); c.lineTo(42, -74); c.lineTo(31, -38); c.closePath(); fs(c, '#ffffff', '#e0d0ec', 2);
  c.fillStyle = '#fff'; ell(c, 20, -46, 14, 13); c.fill();
  tri(c, 27, -90, 30, -103, 37, -91); fs(c, '#ffffff', '#e0d0ec', 2);
  tri(c, 38, -91, 49, -116, 46, -88); fs(c, '#ffd86b', '#e8b93e', 1.5);
  ell(c, 36, -79, 15, 12.5, -0.2); fs(c, '#ffffff', '#e0d0ec', 2);
  ell(c, 48, -74, 8.5, 7.5); fs(c, '#fff3f8', '#e0d0ec', 1.5);
  [[27, -93, 8], [20, -85, 9], [15, -74, 9], [12, -62, 8]].forEach((m, i) => { c.fillStyle = MANE[i]; circ(c, m[0], m[1], m[2]); c.fill(); });
  c.fillStyle = MANE[4]; circ(c, 33, -92, 6); c.fill();
  c.fillStyle = '#4a3b5c';
  if ((t % 4.3) < 0.12) c.fillRect(37, -81, 6, 1.6); else { circ(c, 40, -81, 2.8); c.fill(); c.fillStyle = '#fff'; circ(c, 41, -82, 1); c.fill(); }
  c.fillStyle = 'rgba(255,130,170,0.5)'; circ(c, 45, -72, 3.6); c.fill();
  c.strokeStyle = '#c98aa8'; c.lineWidth = 1.6; c.beginPath(); c.arc(50, -73, 3.5, Math.PI * 0.2, Math.PI * 0.9); c.stroke();
  if (o.mark) drawIcon(c, o.mark, -9, -44, 17);
  const acc = o.acc !== undefined ? o.acc : Save.data && Save.data.wear && Save.data.wear.uni; if (acc) drawUniAcc(c, acc);
}

/* ---- Eule ---- */
function drawOwl(c, t, o) {
  const flap = o.happy ? Math.sin(t * 16) * 0.5 : 0;
  c.fillStyle = '#ffb347'; ell(c, -9, -2, 7, 4); c.fill(); ell(c, 9, -2, 7, 4); c.fill();
  [-1, 1].forEach(s => { c.save(); c.translate(s * 25, -48); c.rotate(s * (-0.15 - flap)); ell(c, s * 4, 16, 9, 22); fs(c, '#96694a'); c.restore(); });
  ell(c, 0, -38, 29, 36); fs(c, '#b0825a', '#96694a', 2);
  ell(c, 0, -28, 19, 23); fs(c, '#f3dfc1');
  c.strokeStyle = '#d9b98f'; c.lineWidth = 2; c.lineCap = 'round';
  [[-7, -30], [7, -30], [0, -20], [-8, -12], [8, -12]].forEach(p => { c.beginPath(); c.moveTo(p[0] - 3, p[1]); c.lineTo(p[0], p[1] + 3); c.lineTo(p[0] + 3, p[1]); c.stroke(); });
  tri(c, -24, -62, -27, -84, -9, -70); fs(c, '#96694a'); tri(c, 24, -62, 27, -84, 9, -70); fs(c, '#96694a');
  circ(c, -12, -54, 12.5); fs(c, '#fff', '#d9b98f', 2); circ(c, 12, -54, 12.5); fs(c, '#fff', '#d9b98f', 2);
  c.fillStyle = '#3d2b3a';
  if ((t % 3.1) < 0.14) { c.fillRect(-18, -55, 12, 2); c.fillRect(6, -55, 12, 2); }
  else { circ(c, -11, -54, 5.5); c.fill(); circ(c, 11, -54, 5.5); c.fill(); c.fillStyle = '#fff'; circ(c, -9, -56, 1.8); c.fill(); circ(c, 13, -56, 1.8); c.fill(); }
  tri(c, -5, -46, 5, -46, 0, -37); fs(c, '#ffb347', '#e8952a', 1);
}

/* ---- Fuchs (sitzt) ---- */
function drawFox(c, t, o) {
  c.save(); c.translate(-14, -10); c.rotate(Math.sin(t * 3) * 0.12);
  ell(c, -18, -12, 21, 12, -0.5); fs(c, '#f28c38', '#d97424', 2); ell(c, -32, -22, 9, 7, -0.5); fs(c, '#fff');
  c.restore();
  ell(c, 0, -27, 21, 27); fs(c, '#f28c38', '#d97424', 2);
  ell(c, 0, -21, 11, 18); fs(c, '#fff3e0');
  c.fillStyle = '#7a4a2b'; ell(c, -10, -3, 8, 5); c.fill(); ell(c, 10, -3, 8, 5); c.fill();
  tri(c, -23, -72, -19, -99, -5, -80); fs(c, '#f28c38', '#d97424', 2); tri(c, 23, -72, 19, -99, 5, -80); fs(c, '#f28c38', '#d97424', 2);
  tri(c, -19, -76, -17, -91, -9, -80); fs(c, '#7a4a2b'); tri(c, 19, -76, 17, -91, 9, -80); fs(c, '#7a4a2b');
  ell(c, 0, -63, 25, 19); fs(c, '#f28c38', '#d97424', 2);
  c.fillStyle = '#fff'; ell(c, -13, -56, 11, 8, 0.3); c.fill(); ell(c, 13, -56, 11, 8, -0.3); c.fill(); ell(c, 0, -54, 8, 7); c.fill();
  c.fillStyle = '#3d2b3a'; circ(c, 0, -55, 3.2); c.fill();
  if ((t % 3.9) < 0.12) { c.fillRect(-12, -67, 6, 1.6); c.fillRect(6, -67, 6, 1.6); } else { circ(c, -9, -67, 2.8); c.fill(); circ(c, 9, -67, 2.8); c.fill(); }
  c.strokeStyle = '#3d2b3a'; c.lineWidth = 1.6; c.lineCap = 'round'; c.beginPath(); c.arc(0, -53, 5, Math.PI * 0.2, Math.PI * 0.8); c.stroke();
}

/* ---- Frosch ---- */
function drawFrog(c, t, o) {
  c.fillStyle = '#5fbf57'; ell(c, -25, -6, 13, 7); c.fill(); ell(c, 25, -6, 13, 7); c.fill();
  ell(c, 0, -23, 30, 22); fs(c, '#7ed56f', '#5fbf57', 2);
  ell(c, 0, -16, 20, 13); fs(c, '#dff7a8');
  circ(c, -14, -44, 11.5); fs(c, '#7ed56f', '#5fbf57', 2); circ(c, 14, -44, 11.5); fs(c, '#7ed56f', '#5fbf57', 2);
  c.fillStyle = '#fff'; circ(c, -14, -45, 8); c.fill(); circ(c, 14, -45, 8); c.fill();
  c.fillStyle = '#3d2b3a';
  if ((t % 2.9) < 0.14) { c.fillRect(-19, -46, 10, 2); c.fillRect(9, -46, 10, 2); } else { circ(c, -13, -45, 4); c.fill(); circ(c, 15, -45, 4); c.fill(); }
  c.strokeStyle = '#3d7a37'; c.lineWidth = 2.2; c.lineCap = 'round'; c.beginPath(); c.arc(0, -30, 16, Math.PI * 0.12, Math.PI * 0.88); c.stroke();
  c.fillStyle = 'rgba(255,130,150,0.45)'; circ(c, -20, -24, 4); c.fill(); circ(c, 20, -24, 4); c.fill();
}

/* ---- Der freche kleine Drache (rundlich, niedlich) ---- */
function drawDragon(c, t, o) {
  const flap = o.fly ? Math.sin(t * 20) * 0.6 : Math.sin(t * 2) * 0.08;
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.strokeStyle = '#6fd3c7'; c.lineWidth = 10; c.beginPath(); c.moveTo(-14, -16); c.quadraticCurveTo(-48, -6, -44, -34); c.stroke();
  heartPath(c, -44, -42, 9); fs(c, '#ff8fb1');
  [-1, 1].forEach(s => { c.save(); c.translate(s * 15, -50); c.scale(s, 1); c.rotate(-0.3 - flap); c.beginPath(); c.moveTo(0, 0); c.lineTo(30, -24); c.quadraticCurveTo(26, -10, 33, -3); c.quadraticCurveTo(20, -6, 14, 6); c.closePath(); fs(c, '#ffb3c7', '#f08fab', 1.5); c.restore(); });
  c.fillStyle = '#58bdb1'; ell(c, -11, -3, 9, 5); c.fill(); ell(c, 11, -3, 9, 5); c.fill();
  ell(c, 0, -28, 24, 26); fs(c, '#6fd3c7', '#58bdb1', 2);
  ell(c, 0, -22, 15, 18); fs(c, '#fff2c9');
  c.strokeStyle = '#f0dba0'; c.lineWidth = 2; line(c, -10, -26, 10, -26); line(c, -11, -18, 11, -18);
  tri(c, -15, -78, -18, -95, -6, -83); fs(c, '#ffe08a', '#e8c25a', 1); tri(c, 15, -78, 18, -95, 6, -83); fs(c, '#ffe08a', '#e8c25a', 1);
  circ(c, 0, -63, 22); fs(c, '#6fd3c7', '#58bdb1', 2);
  c.fillStyle = '#fff'; circ(c, -9, -67, 8); c.fill(); circ(c, 9, -67, 8); c.fill();
  const look = Math.sin(t * 1.7) * 2;
  c.fillStyle = '#3d2b3a'; circ(c, -8 + look, -66, 4); c.fill(); circ(c, 10 + look, -66, 4); c.fill();
  c.strokeStyle = '#3d2b3a'; c.lineWidth = 2; line(c, -16, -77, -5, -75); line(c, 16, -79, 5, -75);
  c.strokeStyle = '#2f8f85'; c.lineWidth = 2.2; c.beginPath(); c.arc(0, -58, 11, Math.PI * 0.1, Math.PI * 0.9); c.stroke();
  tri(c, 3, -48.5, 7, -43, 9, -50); fs(c, '#fff');
  c.fillStyle = 'rgba(255,130,150,0.5)'; circ(c, -16, -57, 4); c.fill(); circ(c, 16, -57, 4); c.fill();
}

/* ---- Schmetterling (als Figur im Schattenspiel) ---- */
function drawButterflyBig(c, t, o) {
  const f = 1 - Math.abs(Math.sin(t * 5)) * 0.25;
  [-1, 1].forEach(s => { c.save(); c.translate(0, -48); c.scale(s * f, 1);
    ell(c, 24, -16, 24, 20, -0.4); fs(c, '#c9a5ff', '#a784e6', 2); ell(c, 20, 18, 17, 14, 0.5); fs(c, '#ff9ecb', '#e97bb0', 2);
    c.fillStyle = '#fff'; circ(c, 28, -18, 6); c.fill(); circ(c, 20, 18, 4); c.fill(); c.restore(); });
  rr(c, -5, -78, 10, 56, 5); fs(c, '#6b5a8a');
  circ(c, 0, -80, 8); fs(c, '#6b5a8a');
  c.strokeStyle = '#6b5a8a'; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(-3, -86); c.quadraticCurveTo(-10, -98, -14, -96); c.moveTo(3, -86); c.quadraticCurveTo(10, -98, 14, -96); c.stroke();
}

const ART = { t: drawT, unicorn: drawUnicorn, owl: drawOwl, fox: drawFox, frog: drawFrog, dragon: drawDragon, butterfly: drawButterflyBig, snail: (c, t, o) => drawSnail(c, t, o), squirrel: (c, t, o) => drawSquirrel(c, t, o),
  mouse: (c, t, o) => drawMouse(c, t, o), hedgehog: (c, t, o) => drawHedgehog(c, t, o),
  duckNpc: (c, t, o) => drawDuckNpc(c, t, o), bee: (c, t, o) => drawBee(c, t, o), bear: (c, t, o) => drawBear(c, t, o), mole: (c, t, o) => drawMole(c, t, o), bunny: (c, t, o) => drawBunny(c, t, o) };

/* Figur zeichnen: Füße bei (x,y). o: size, flip, t, walk, lift, glow, mark, happy, fly, noShadow, sy */
function drawActor(c, name, x, y, o = {}) {
  const s = (o.size || 100) / 100;
  if (!o.noShadow) { c.fillStyle = 'rgba(40,60,60,0.16)'; ell(c, x, y, 30 * s * (1 - Math.min(0.5, (o.lift || 0) / 200)), 9 * s); c.fill(); }
  c.save(); c.translate(x, y - (o.lift || 0)); c.scale(s * (o.flip ? -1 : 1), s * (o.sy || 1));
  if (o.glow) { c.shadowColor = '#fff7a8'; c.shadowBlur = 26 * View.scale; }
  const img = name !== 't' ? Sprites.ready(name) : null;
  if (img) { const h = 100, w = h * img.naturalWidth / img.naturalHeight; c.drawImage(img, -w / 2, -h, w, h); }
  else ART[name](c, o.t == null ? Game.time : o.t, o);
  c.restore();
}

/* Schatten-Bild einer Figur (für das Fuchs-Spiel), wird einmal erzeugt und gemerkt */
const SIL = {};
function silhouette(name) {
  if (SIL[name]) return SIL[name];
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256;
  const c = cv.getContext('2d');
  c.save(); c.translate(128, 240); c.scale(2, 2);
  const img = Sprites.ready(name);
  if (img) { const h = 100, w = h * img.naturalWidth / img.naturalHeight; c.drawImage(img, -w / 2, -h, w, h); } else ART[name](c, 0.5, {});
  c.restore();
  c.globalCompositeOperation = 'source-in'; c.fillStyle = '#5d5a80'; c.fillRect(0, 0, 256, 256);
  SIL[name] = cv; return cv;
}
function drawSilhouette(c, name, x, y, size) { const k = size / 200; c.drawImage(silhouette(name), x - 128 * k, y - 240 * k, 256 * k, 256 * k); }

/* ---- Landschaft ---- */
function drawTree(c, tr, t, alpha) {
  const sh = tr.shake > 0 ? Math.sin(t * 45) * 4 * tr.shake : 0, s = tr.s;
  c.fillStyle = 'rgba(40,70,50,0.18)'; ell(c, tr.x, tr.y, 34 * s, 11 * s); c.fill();
  c.save(); c.translate(tr.x, tr.y); c.scale(s, s);
  rr(c, -9, -44, 18, 46, 6); fs(c, '#a67c52', '#8a6541', 2);
  const cols = tr.kind === 1 ? ['#f7a8c8', '#fbc3d9', '#fde0ea'] : tr.kind === 2 ? ['#58b77a', '#6cc98b', '#93dfa8'] : ['#6cc47a', '#84d48f', '#aee6b2'];
  c.translate(sh, 0); if (alpha) c.globalAlpha = alpha;   // durchsichtig, wenn jemand dahinter steht
  c.fillStyle = cols[0]; circ(c, -24, -60, 27); c.fill(); circ(c, 24, -60, 27); c.fill();
  c.fillStyle = cols[1]; circ(c, 0, -82, 38); c.fill();
  c.fillStyle = cols[2]; circ(c, -10, -94, 13); c.fill(); circ(c, 14, -74, 8); c.fill();
  c.restore();
}
function drawBush(c, b, t) {
  const sh = b.shake > 0 ? Math.sin(t * 50) * 5 * b.shake : 0;
  c.fillStyle = 'rgba(40,70,50,0.16)'; ell(c, b.x, b.y + 2, 34, 9); c.fill();
  c.save(); c.translate(b.x + sh, b.y);
  c.fillStyle = '#5fb873'; circ(c, -18, -14, 18); c.fill(); circ(c, 18, -14, 18); c.fill();
  c.fillStyle = '#74c985'; circ(c, 0, -24, 23); c.fill();
  c.fillStyle = '#ff7b9c'; [[-12, -18], [8, -30], [18, -12], [-2, -10]].forEach(p => { circ(c, p[0], p[1], 3.5); c.fill(); });
  if (b.peek > 0) { const h = Math.sin(clamp(b.peek, 0, 1) * Math.PI) * 16; c.fillStyle = '#fff'; ell(c, -4, -44 - h + 12, 4, 10); c.fill(); ell(c, 5, -44 - h + 12, 4, 10); c.fill(); circ(c, 0, -34 - h + 12, 9); c.fill(); c.fillStyle = '#3d2b3a'; circ(c, -3, -36 - h + 12, 1.5); c.fill(); circ(c, 3, -36 - h + 12, 1.5); c.fill(); c.fillStyle = '#74c985'; circ(c, 0, -22, 21); c.fill(); }
  c.restore();
}
function drawMushroom(c, m) {
  const q = m.squish > 0 ? Math.sin(m.squish * Math.PI * 3) * 0.25 * m.squish : 0;
  c.fillStyle = 'rgba(40,70,50,0.16)'; ell(c, m.x, m.y + 1, 15, 5); c.fill();
  c.save(); c.translate(m.x, m.y); c.scale(1 + q, 1 - q);
  rr(c, -6, -18, 12, 19, 5); fs(c, '#fff6e6', '#e6d6bf', 1.5);
  c.beginPath(); c.arc(0, -16, 19, Math.PI, 0); c.quadraticCurveTo(0, -8, -19, -16); c.closePath(); fs(c, m.col, 'rgba(0,0,0,0.12)', 1.5);
  c.fillStyle = '#fff'; circ(c, -8, -24, 3.5); c.fill(); circ(c, 6, -28, 4); c.fill(); circ(c, 11, -20, 2.5); c.fill();
  c.restore();
}
function drawFlower(c, f) {
  c.fillStyle = f.col; for (let i = 0; i < 5; i++) { const a = i * TAU / 5 + f.r; circ(c, f.x + Math.cos(a) * 4.5, f.y + Math.sin(a) * 4.5, 3.6); c.fill(); }
  c.fillStyle = '#fff3a0'; circ(c, f.x, f.y, 2.8); c.fill();
}
function drawSmallButterfly(c, x, y, t, col) {
  const f = Math.abs(Math.sin(t * 14));
  c.save(); c.translate(x, y);
  c.fillStyle = col; ell(c, -6 * f - 1, -3, 7 * f + 1, 8); c.fill(); ell(c, 6 * f + 1, -3, 7 * f + 1, 8); c.fill();
  c.fillStyle = '#6b5a8a'; rr(c, -1.5, -8, 3, 13, 1.5); c.fill();
  c.restore();
}
function drawCloud(c, x, y, s) { c.fillStyle = 'rgba(255,255,255,0.9)'; circ(c, x - 26 * s, y + 4 * s, 20 * s); c.fill(); circ(c, x, y - 8 * s, 28 * s); c.fill(); circ(c, x + 28 * s, y + 4 * s, 20 * s); c.fill(); rr(c, x - 44 * s, y + 2 * s, 90 * s, 22 * s, 11 * s); c.fill(); }

/* Hintergrund für Start- und Namens-Bildschirm */
function drawMeadow(c, t) {
  const g = c.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#aee3ff'); g.addColorStop(0.6, '#e9f8ff'); g.addColorStop(1, '#fff3d6');
  c.fillStyle = g; c.fillRect(0, 0, VW, VH);
  c.fillStyle = '#fff3a0'; circ(c, VW - 120, 90, 46); c.fill(); c.fillStyle = 'rgba(255,243,160,0.35)'; circ(c, VW - 120, 90, 64 + Math.sin(t * 2) * 4); c.fill();
  drawCloud(c, (t * 12) % (VW + 300) - 150, 80, 1); drawCloud(c, (t * 7 + 500) % (VW + 300) - 150, 150, 0.7);
  c.fillStyle = '#bfe8b4'; ell(c, VW * 0.25, VH + 60, VW * 0.5, 230); c.fill();
  c.fillStyle = '#a6dd9e'; ell(c, VW * 0.8, VH + 80, VW * 0.5, 240); c.fill();
  c.fillStyle = '#93d48d'; ell(c, VW * 0.5, VH + 150, VW * 0.8, 230); c.fill();
}

/* ---- Neue Landschafts-Teile für die große Welt ---- */
function drawRock(c, r, t) {
  const w = r.wob > 0 ? Math.sin(t * 40) * 3 * r.wob : 0;
  c.fillStyle = 'rgba(40,60,60,0.16)'; ell(c, r.x, r.y + 2, r.r * 1.05, r.r * 0.32); c.fill();
  c.save(); c.translate(r.x + w, r.y);
  c.beginPath(); c.moveTo(-r.r, 0); c.quadraticCurveTo(-r.r * 1.05, -r.r * 0.8, -r.r * 0.3, -r.r * 1.0); c.quadraticCurveTo(r.r * 0.5, -r.r * 1.15, r.r * 0.95, -r.r * 0.45); c.quadraticCurveTo(r.r * 1.1, -r.r * 0.05, r.r, 0); c.closePath();
  fs(c, '#cfcfdc', '#a8a8b8', 2.5);
  c.fillStyle = 'rgba(255,255,255,0.45)'; ell(c, -r.r * 0.3, -r.r * 0.72, r.r * 0.34, r.r * 0.14, -0.3); c.fill();
  if (r.moss) { c.fillStyle = '#8fd67f'; ell(c, r.r * 0.35, -r.r * 0.12, r.r * 0.32, r.r * 0.12); c.fill(); }
  c.restore();
}
function drawDen(c, x, y) {   // Fuchsbau
  c.fillStyle = 'rgba(40,70,50,0.16)'; ell(c, x, y + 4, 52, 14); c.fill();
  c.beginPath(); c.moveTo(-50 + x, y); c.quadraticCurveTo(x - 40, y - 62, x, y - 64); c.quadraticCurveTo(x + 40, y - 62, x + 50, y); c.closePath(); fs(c, '#c99a6b', '#a87c50', 2.5);
  c.fillStyle = '#6b4a33'; c.beginPath(); c.ellipse(x, y - 2, 20, 26, 0, Math.PI, 0); c.closePath(); c.fill();
  c.fillStyle = '#7ed56f'; circ(c, x - 30, y - 40, 7); c.fill(); circ(c, x + 26, y - 46, 6); c.fill(); circ(c, x - 6, y - 60, 6); c.fill();
}
function drawDuck(c, x, y, flip, splash) {
  c.save(); c.translate(x, y); if (flip) c.scale(-1, 1);
  if (splash > 0) { c.strokeStyle = 'rgba(255,255,255,' + splash + ')'; c.lineWidth = 3; ell(c, 0, 4, 24 + (1 - splash) * 18, 8 + (1 - splash) * 6); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,0.5)'; ell(c, 0, 4, 22, 6); c.fill();
  ell(c, 0, -6, 18, 11); fs(c, '#fff', '#e3e3ee', 2);
  ell(c, -5, -8, 9, 5, 0.2); fs(c, '#eeeef6');
  circ(c, 12, -20, 9); fs(c, '#fff', '#e3e3ee', 2);
  tri(c, 19, -22, 29, -18, 19, -15); fs(c, '#ffb347');
  c.fillStyle = '#3d2b3a'; circ(c, 14, -22, 1.8); c.fill();
  c.restore();
}
function drawGlitter(c, x, y, t) {
  const b = Math.abs(Math.sin(t * 2.4)) * 8, s = 1 + Math.sin(t * 5) * 0.08;
  c.fillStyle = 'rgba(255,240,140,' + (0.3 + Math.sin(t * 4) * 0.12) + ')'; circ(c, x, y - 22 - b, 30); c.fill();
  c.fillStyle = 'rgba(40,70,50,0.16)'; ell(c, x, y + 2, 12, 4); c.fill();
  c.save(); c.translate(x, y - 22 - b); c.rotate(Math.sin(t * 1.5) * 0.25); c.scale(s, s);
  starPath(c, 0, 0, 17); fs(c, '#ffe066', '#fff', 3);
  c.fillStyle = 'rgba(255,255,255,0.7)'; ell(c, -4, -5, 4, 2.5, -0.5); c.fill();
  c.restore();
  c.fillStyle = '#fff'; for (let i = 0; i < 3; i++) { const a = t * 2 + i * 2.1, tw = Math.max(0, Math.sin(t * 6 + i * 2)); sparklePath(c, x + Math.cos(a) * 26, y - 22 - b + Math.sin(a) * 18, 3 + tw * 4); c.fill(); }
}
function drawDragonTail(c, x, y, t) {   // Schwanz schaut aus dem Busch
  const sw = Math.sin(t * 6) * 8;
  c.strokeStyle = '#58bdb1'; c.lineWidth = 13; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 4, y); c.quadraticCurveTo(x + 22, y - 4, x + 32 + sw * 0.4, y - 26 + sw); c.stroke();
  c.strokeStyle = '#6fd3c7'; c.lineWidth = 9; c.stroke();
  heartPath(c, x + 34 + sw * 0.4, y - 34 + sw, 11); fs(c, '#ff8fb1', '#f06a98', 2);
}
function drawBunnyHead(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const ew = Math.sin((t || 0) * 5) * 0.08;
  [-1, 1].forEach(k => { c.save(); c.translate(k * 8, -26); c.rotate(k * (0.15 + ew)); ell(c, 0, -14, 6.5, 17); fs(c, '#fff', '#e6dde8', 2); ell(c, 0, -13, 3, 11); fs(c, '#ffc9da'); c.restore(); });
  circ(c, 0, -12, 17); fs(c, '#fff', '#e6dde8', 2);
  c.fillStyle = '#3d2b3a'; circ(c, -6, -15, 2.4); c.fill(); circ(c, 6, -15, 2.4); c.fill();
  c.fillStyle = '#ff9ecb'; ell(c, 0, -9, 3, 2.2); c.fill();
  c.fillStyle = 'rgba(255,130,170,0.35)'; circ(c, -10, -8, 3.5); c.fill(); circ(c, 10, -8, 3.5); c.fill();
  c.restore();
}

/* ---- Neue Figuren: Postschnecke Sina, Eichhörnchen Flink ---- */
function drawSnail(c, t, o) {
  const sq = Math.sin(t * 3) * 1.5;
  ell(c, 6, -8, 40, 9); fs(c, '#c9e88a', '#a6cc66', 2);                              // Fuß
  c.save(); c.translate(32, -12); c.rotate(-0.25);
  rr(c, -9, -42 - sq, 18, 44 + sq, 9); fs(c, '#c9e88a', '#a6cc66', 2);              // Hals und Kopf
  c.strokeStyle = '#a6cc66'; c.lineWidth = 3; c.lineCap = 'round'; line(c, -4, -40 - sq, -10, -58 - sq); line(c, 4, -40 - sq, 9, -58 - sq);
  c.fillStyle = '#fff'; circ(c, -10, -60 - sq, 6); c.fill(); circ(c, 9, -60 - sq, 6); c.fill();
  c.fillStyle = '#3d2b3a'; circ(c, -9, -60 - sq, 3); c.fill(); circ(c, 10, -60 - sq, 3); c.fill();
  c.strokeStyle = '#6d8f3a'; c.lineWidth = 2; c.beginPath(); c.arc(0, -30 - sq, 5, Math.PI * 0.15, Math.PI * 0.85); c.stroke();
  c.fillStyle = 'rgba(255,130,150,0.5)'; circ(c, -6, -33 - sq, 3); c.fill(); circ(c, 6, -33 - sq, 3); c.fill();
  c.restore();
  circ(c, -8, -38, 30); fs(c, '#d9a5ff', '#b07fe0', 2.5);                            // Haus
  c.strokeStyle = '#b07fe0'; c.lineWidth = 4; c.beginPath(); for (let a = 0; a < 12; a += 0.2) { const r = 3 + a * 2.1; c.lineTo(-8 + Math.cos(a) * r, -38 + Math.sin(a) * r); } c.stroke();
  rr(c, -30, -16, 26, 18, 4); fs(c, '#fff', '#e0d6c0', 2); c.strokeStyle = '#e0d6c0'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-30, -16); c.lineTo(-17, -6); c.lineTo(-4, -16); c.stroke();   // Brief
  c.fillStyle = '#ff6b81'; heartPath(c, -17, -9, 4); c.fill();
}
function drawSquirrel(c, t, o) {
  const sw = Math.sin(t * 2.5) * 0.08;
  c.save(); c.translate(-14, -22); c.rotate(sw);                                       // buschiger Schwanz
  c.beginPath(); c.moveTo(0, 18); c.bezierCurveTo(-40, 10, -36, -60, -4, -64); c.bezierCurveTo(14, -66, 18, -48, 6, -44); c.bezierCurveTo(-14, -40, -14, -10, 10, 6); c.closePath(); fs(c, '#e08a3c', '#c06e24', 2);
  c.fillStyle = '#f3b06c'; ell(c, -18, -30, 8, 20, 0.2); c.fill();
  c.restore();
  c.fillStyle = '#c06e24'; ell(c, -8, -3, 8, 5); c.fill(); ell(c, 10, -3, 8, 5); c.fill();
  ell(c, 2, -26, 18, 24); fs(c, '#e08a3c', '#c06e24', 2);
  ell(c, 4, -22, 10, 16); fs(c, '#fbe3c4');
  c.fillStyle = '#a5672c'; ell(c, 4, -34, 9, 8); c.fill(); c.fillStyle = '#c98a4a'; ell(c, 4, -39, 9, 4); c.fill();   // Nuss in den Pfoten
  tri(c, -8, -66, -12, -84, 0, -70); fs(c, '#e08a3c', '#c06e24', 1.5); tri(c, 14, -66, 18, -84, 6, -70); fs(c, '#e08a3c', '#c06e24', 1.5);
  circ(c, 3, -56, 16); fs(c, '#e08a3c', '#c06e24', 2);
  ell(c, 8, -50, 9, 7); fs(c, '#fbe3c4');
  c.fillStyle = '#3d2b3a';
  if ((t % 3.3) < 0.12) { c.fillRect(-6, -59, 6, 1.6); c.fillRect(8, -59, 6, 1.6); } else { circ(c, -3, -58, 3); c.fill(); circ(c, 11, -58, 3); c.fill(); c.fillStyle = '#fff'; circ(c, -2, -59, 1); c.fill(); circ(c, 12, -59, 1); c.fill(); }
  c.fillStyle = '#3d2b3a'; circ(c, 9, -51, 2.2); c.fill();
  c.fillStyle = 'rgba(255,130,150,0.45)'; circ(c, -6, -50, 3.5); c.fill(); circ(c, 16, -50, 3.5); c.fill();
}

/* ---- Bilder für die Leserätsel: jedes Wort hat eine kleine Zeichnung (Mitte 0,0, etwa ±45) ---- */
const PICS = {
  EI: c => { ell(c, 0, 4, 26, 34); fs(c, '#fff8e8', '#e3cfa2', 3); c.fillStyle = 'rgba(255,255,255,0.8)'; ell(c, -9, -8, 6, 10, -0.3); c.fill(); },
  HUT: c => { ell(c, 0, 24, 46, 12); fs(c, '#7a5cc9', '#5e45a3', 2.5); rr(c, -27, -30, 54, 54, 14); fs(c, '#8a6ad8', '#5e45a3', 2.5); c.fillStyle = '#ff8fb1'; c.fillRect(-27, 6, 54, 10); },
  UHR: c => { circ(c, 0, 0, 38); fs(c, '#fff', '#5aa9ff', 7); c.fillStyle = '#5aa9ff'; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; circ(c, Math.cos(a) * 28, Math.sin(a) * 28, 2.5); c.fill(); } c.strokeStyle = '#3d2b3a'; c.lineWidth = 4; c.lineCap = 'round'; line(c, 0, 0, 0, -22); line(c, 0, 0, 15, 6); },
  BALL: c => { circ(c, 0, 0, 38); fs(c, '#ff6b6b', '#d9435e', 3); c.strokeStyle = '#fff'; c.lineWidth = 7; c.beginPath(); c.ellipse(0, 0, 38, 13, -0.4, 0, TAU); c.stroke(); c.fillStyle = 'rgba(255,255,255,0.5)'; ell(c, -14, -18, 8, 5, -0.6); c.fill(); },
  MAUS: c => { c.strokeStyle = '#ff9ecb'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(-28, 14); c.quadraticCurveTo(-48, 10, -44, -12); c.stroke(); ell(c, -2, 12, 32, 22); fs(c, '#b8b8c8', '#9a9aae', 2); circ(c, 24, -2, 16); fs(c, '#b8b8c8', '#9a9aae', 2); circ(c, 16, -18, 10); fs(c, '#b8b8c8', '#9a9aae', 2); circ(c, 16, -18, 5); fs(c, '#ffc9da'); c.fillStyle = '#3d2b3a'; circ(c, 28, -4, 2.8); c.fill(); c.fillStyle = '#ff9ecb'; circ(c, 39, 2, 4); c.fill(); },
  HAUS: c => { rr(c, -32, -6, 64, 46, 4); fs(c, '#ffe6bf', '#e3c08a', 2.5); tri(c, -44, -2, 0, -42, 44, -2); fs(c, '#ff6b6b', '#d9435e', 2.5); rr(c, -10, 14, 18, 26, 4); fs(c, '#b98852'); rr(c, 13, 2, 14, 14, 3); fs(c, '#9ecbff', '#fff', 2); },
  MOND: c => { c.beginPath(); c.arc(0, 0, 36, Math.PI * 0.35, Math.PI * 1.65); c.arc(16, -4, 30, Math.PI * 1.5, Math.PI * 0.5, true); c.closePath(); fs(c, '#ffe066', '#f0b429', 3); },
  BOOT: c => { c.beginPath(); c.moveTo(-44, 8); c.lineTo(44, 8); c.lineTo(30, 30); c.lineTo(-30, 30); c.closePath(); fs(c, '#b98852', '#96693d', 2.5); c.strokeStyle = '#96693d'; c.lineWidth = 4; line(c, 0, 8, 0, -40); tri(c, 4, -38, 4, 2, 34, 2); fs(c, '#fff', '#d6cfe6', 2); },
  AUTO: c => { rr(c, -44, -4, 88, 28, 10); fs(c, '#ff6b6b', '#d9435e', 2.5); c.beginPath(); c.moveTo(-24, -4); c.lineTo(-14, -26); c.lineTo(18, -26); c.lineTo(28, -4); c.closePath(); fs(c, '#ff8a8a', '#d9435e', 2.5); rr(c, -12, -21, 12, 15, 3); fs(c, '#9ecbff'); rr(c, 4, -21, 14, 15, 3); fs(c, '#9ecbff'); circ(c, -24, 26, 11); fs(c, '#3d3d4d'); circ(c, 24, 26, 11); fs(c, '#3d3d4d'); circ(c, -24, 26, 4); fs(c, '#ccc'); circ(c, 24, 26, 4); fs(c, '#ccc'); },
  ENTE: c => { c.save(); c.scale(1.9, 1.9); c.translate(-2, 14); drawDuck(c, 0, 0, false, 0); c.restore(); },
  EULE: c => { c.save(); c.scale(0.92, 0.92); c.translate(0, 48); drawOwl(c, 0.5, {}); c.restore(); },
  HASE: c => drawBunnyHead(c, 0, 26, 1.75, 0),
  IGEL: c => { c.fillStyle = '#8a6a4a'; for (let i = 0; i < 11; i++) { const a = Math.PI * (1.02 + i * 0.1); tri(c, Math.cos(a) * 26 - 6, Math.sin(a) * 18 + 10, Math.cos(a + 0.12) * 46 - 6, Math.sin(a + 0.12) * 36 + 10, Math.cos(a + 0.24) * 26 - 6, Math.sin(a + 0.24) * 18 + 10); c.fill(); } ell(c, -6, 12, 32, 22); fs(c, '#8a6a4a'); ell(c, 24, 16, 18, 13); fs(c, '#f3d7b0', '#d9b98f', 2); c.fillStyle = '#3d2b3a'; circ(c, 40, 16, 4); c.fill(); circ(c, 26, 10, 2.6); c.fill(); },
  NUSS: c => { ell(c, 0, 8, 30, 32); fs(c, '#b5763c', '#8a5528', 2.5); c.beginPath(); c.ellipse(0, -14, 33, 16, 0, Math.PI, 0); c.closePath(); fs(c, '#d9a066', '#a5672c', 2.5); c.strokeStyle = '#8a5528'; c.lineWidth = 3; line(c, 0, -30, 2, -40); c.fillStyle = 'rgba(255,255,255,0.3)'; ell(c, -10, 8, 6, 12, -0.2); c.fill(); },
  PILZ: c => { c.save(); c.translate(0, 34); c.scale(2.4, 2.4); drawMushroom(c, { x: 0, y: 0, col: '#ff6b6b', squish: 0 }); c.restore(); },
  BAUM: c => { c.save(); c.translate(0, 46); c.scale(0.68, 0.68); drawTree(c, { x: 0, y: 0, s: 1, kind: 0, shake: 0 }, 0); c.restore(); },
  STERN: c => { starPath(c, 0, 2, 42); fs(c, '#ffe066', '#f0b429', 3); },
  HERZ: c => { heartPath(c, 0, 8, 46); fs(c, '#ff8fb1', '#f06a98', 3); },
  SONNE: c => { c.strokeStyle = '#ffb347'; c.lineWidth = 6; c.lineCap = 'round'; for (let i = 0; i < 10; i++) { const a = i * TAU / 10; line(c, Math.cos(a) * 30, Math.sin(a) * 30, Math.cos(a) * 43, Math.sin(a) * 43); } circ(c, 0, 0, 24); fs(c, '#ffe066', '#f0b429', 3); },
  FISCH: c => { tri(c, -26, 0, -46, -20, -46, 20); fs(c, '#ff9f5a', '#e07a30', 2.5); ell(c, 4, 0, 34, 22); fs(c, '#ffb65c', '#e07a30', 2.5); c.fillStyle = '#3d2b3a'; circ(c, 22, -5, 3.5); c.fill(); c.strokeStyle = '#e07a30'; c.lineWidth = 2; c.beginPath(); c.arc(-6, 0, 12, -1, 1); c.stroke(); },
  BLUME: c => { c.strokeStyle = '#5fbf57'; c.lineWidth = 6; line(c, 0, 8, 0, 46); ell(c, 10, 32, 10, 5, -0.5); fs(c, '#7ed56f'); c.fillStyle = '#ff8fb1'; for (let i = 0; i < 6; i++) { const a = i * TAU / 6; circ(c, Math.cos(a) * 17, -12 + Math.sin(a) * 17, 12); c.fill(); } circ(c, 0, -12, 11); fs(c, '#ffe066'); },
  APFEL: c => { c.strokeStyle = '#8a5528'; c.lineWidth = 4; c.lineCap = 'round'; line(c, 0, -26, 4, -40); ell(c, 14, -36, 11, 6, -0.4); fs(c, '#7ed56f'); c.beginPath(); c.moveTo(0, -24); c.bezierCurveTo(-46, -40, -46, 38, 0, 34); c.bezierCurveTo(46, 38, 46, -40, 0, -24); c.closePath(); fs(c, '#ff6b6b', '#d9435e', 2.5); c.fillStyle = 'rgba(255,255,255,0.45)'; ell(c, -16, -8, 6, 10, 0.3); c.fill(); }
};
function drawPic(c, key, x, y, size) { c.save(); c.translate(x, y); c.scale(size / 100, size / 100); c.lineJoin = 'round'; PICS[key](c); c.restore(); }

/* ---- Figuren mit Nebenaufgaben: Entenmama Lotte, Biene Summ, Bär Brummi, Maulwurf Moritz, Hase Hoppel ---- */
function drawDuckNpc(c, t, o) {
  c.save(); c.scale(2.1, 2.1); c.translate(0, -8); drawDuck(c, 0, 0, false, 0); c.restore();
  c.fillStyle = '#ff9ecb'; tri(c, 14, -60, 34, -66, 28, -52); c.fill(); tri(c, 14, -60, 22, -74, 30, -60); c.fill();   // Schleife
}
function drawBee(c, t, o) {
  const f = Math.abs(Math.sin(t * 22));
  c.fillStyle = 'rgba(255,255,255,0.75)'; c.strokeStyle = '#cfe6ff'; c.lineWidth = 1.5;
  ell(c, -8, -50, 12, 18 * (0.5 + f * 0.5), -0.5); c.fill(); c.stroke(); ell(c, 10, -50, 12, 18 * (0.5 + f * 0.5), 0.5); c.fill(); c.stroke();
  ell(c, 0, -26, 24, 20); fs(c, '#ffd23f', '#e0a800', 2);
  c.fillStyle = '#3d2b3a'; c.save(); ell(c, 0, -26, 24, 20); c.clip(); c.fillRect(-8, -48, 7, 44); c.fillRect(6, -48, 7, 44); c.restore();
  tri(c, -24, -26, -34, -24, -24, -20); fs(c, '#3d2b3a');
  circ(c, 20, -36, 13); fs(c, '#ffd23f', '#e0a800', 2);
  c.strokeStyle = '#3d2b3a'; c.lineWidth = 2; c.lineCap = 'round'; line(c, 20, -48, 16, -60); line(c, 25, -47, 28, -59); c.fillStyle = '#3d2b3a'; circ(c, 16, -61, 2.5); c.fill(); circ(c, 28, -60, 2.5); c.fill();
  circ(c, 24, -38, 2.4); c.fill(); c.beginPath(); c.arc(22, -33, 4, 0.2, Math.PI * 0.8); c.stroke();
}
function drawBear(c, t, o) {
  c.fillStyle = '#8a5a3c'; ell(c, -18, -6, 14, 9); c.fill(); ell(c, 18, -6, 14, 9); c.fill();
  ell(c, 0, -38, 36, 36); fs(c, '#a0683f', '#7a4a2b', 2);
  ell(c, 0, -30, 22, 24); fs(c, '#d9a876');
  c.fillStyle = '#a0683f'; ell(c, -30, -40, 10, 16, 0.4); c.fill(); ell(c, 30, -40, 10, 16, -0.4); c.fill();
  circ(c, -22, -96, 11); fs(c, '#a0683f', '#7a4a2b', 2); circ(c, 22, -96, 11); fs(c, '#a0683f', '#7a4a2b', 2);
  circ(c, -22, -96, 5); fs(c, '#d9a876'); circ(c, 22, -96, 5); fs(c, '#d9a876');
  circ(c, 0, -80, 27); fs(c, '#a0683f', '#7a4a2b', 2);
  ell(c, 0, -72, 13, 10); fs(c, '#d9a876');
  c.fillStyle = '#3d2b3a'; ell(c, 0, -77, 5, 3.5); c.fill();
  if ((t % 4.1) < 0.12) { c.fillRect(-13, -86, 7, 1.8); c.fillRect(6, -86, 7, 1.8); } else { circ(c, -10, -86, 3); c.fill(); circ(c, 10, -86, 3); c.fill(); }
  c.strokeStyle = '#3d2b3a'; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); c.arc(0, -71, 5, 0.3, Math.PI - 0.3); c.stroke();
  c.fillStyle = 'rgba(255,130,150,0.4)'; circ(c, -16, -74, 4); c.fill(); circ(c, 16, -74, 4); c.fill();
}
function drawMole(c, t, o) {
  c.fillStyle = '#b58a5c'; ell(c, 0, -4, 40, 12); c.fill(); c.fillStyle = '#c99d6c'; ell(c, -14, -8, 8, 4); c.fill(); ell(c, 16, -6, 6, 3); c.fill();   // Erdhügel
  ell(c, 0, -30, 26, 28); fs(c, '#6e6480', '#564d66', 2);
  ell(c, 0, -24, 15, 18); fs(c, '#8a809c');
  c.fillStyle = '#ffb3c7'; ell(c, -24, -26, 8, 6, -0.4); c.fill(); ell(c, 24, -26, 8, 6, 0.4); c.fill();          // Schaufelhände
  circ(c, 0, -58, 18); fs(c, '#6e6480', '#564d66', 2);
  circ(c, 0, -50, 7); fs(c, '#ff8fb1', '#e86e98', 1.5);
  c.strokeStyle = '#3d2b3a'; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); c.arc(-7, -62, 3, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); c.beginPath(); c.arc(7, -62, 3, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
}
function drawGlassesOn(c, x, y, size) { const k = size / 70; c.save(); c.translate(x, y); c.scale(k, k); c.strokeStyle = '#3d2b3a'; c.lineWidth = 2.5; circ(c, -7, -62, 6); c.stroke(); circ(c, 7, -62, 6); c.stroke(); line(c, -1, -62, 1, -62); c.restore(); }
function drawBunny(c, t, o) {
  c.fillStyle = '#fff'; c.strokeStyle = '#e6dde8'; c.lineWidth = 2;
  ell(c, -12, -4, 10, 6); fs(c, '#fff', '#e6dde8', 2); ell(c, 12, -4, 10, 6); fs(c, '#fff', '#e6dde8', 2);
  ell(c, 0, -24, 22, 22); fs(c, '#fff', '#e6dde8', 2);
  circ(c, -20, -20, 7); fs(c, '#fff', '#e6dde8', 2);
  drawBunnyHead(c, 0, -34, 1.25, t);
}
function drawChick(c, x, y, t, s = 1) {
  const b = Math.abs(Math.sin(t * 8)) * 2;
  c.save(); c.translate(x, y - b); c.scale(s, s);
  c.fillStyle = 'rgba(40,70,50,0.15)'; ell(c, 0, b + 1, 10, 3); c.fill();
  ell(c, 0, -8, 11, 9); fs(c, '#ffe066', '#f0c020', 1.5); circ(c, 6, -18, 7); fs(c, '#ffe066', '#f0c020', 1.5);
  tri(c, 12, -19, 18, -17, 12, -15); fs(c, '#ff9f43'); c.fillStyle = '#3d2b3a'; circ(c, 8, -20, 1.6); c.fill();
  c.restore();
}

/* ---- Gegenstände, Zauberhelfer und Schmuck als kleine Bilder (Mitte x,y; s = ungefähre Größe) ---- */
const FLOWER_COL = { r: '#ff6b6b', y: '#ffd23f', b: '#5aa9ff' };
function drawThing(c, name, x, y, s) {
  if (PICS[name]) { drawPic(c, name, x, y, s); return; }
  if (ART[name]) { drawActor(c, name, x, y + s * 0.45, { size: s * 0.9, t: Game.time, noShadow: true }); return; }
  c.save(); c.translate(x, y); const k = s / 50; c.scale(k, k); c.lineJoin = 'round'; c.lineCap = 'round';
  switch (name) {
    case 'splitter': drawCrystal(c, 0, 0, 20, '#ff8fb1'); break;
    case 'rainbow': ['#ff7b9c', '#ffb65c', '#ffe066', '#7ddc8a', '#7db8ff'].forEach((col, i) => { c.strokeStyle = col; c.lineWidth = 5; c.beginPath(); c.arc(0, 14, 24 - i * 5, Math.PI, 0); c.stroke(); }); break;
    case 'gate': rr(c, -22, -12, 10, 30, 4); fs(c, '#fff3e0', '#e0cfb0', 1.5); rr(c, 12, -12, 10, 30, 4); fs(c, '#fff3e0', '#e0cfb0', 1.5); c.beginPath(); c.arc(0, -10, 24, Math.PI, 0); c.closePath(); fs(c, '#ff6b6b', '#d9435e', 2); c.fillStyle = '#fff'; circ(c, -10, -20, 3); c.fill(); circ(c, 8, -24, 3.5); c.fill(); break;
    case 'chick': drawChick(c, 0, 14, 0, 1.6); break;
    case 'glasses': c.strokeStyle = '#3d2b3a'; c.lineWidth = 4; circ(c, -12, 0, 10); c.stroke(); circ(c, 12, 0, 10); c.stroke(); line(c, -2, 0, 2, 0); c.fillStyle = 'rgba(158,203,255,0.4)'; circ(c, -12, 0, 8); c.fill(); circ(c, 12, 0, 8); c.fill(); break;
    case 'honey': rr(c, -16, -10, 32, 30, 10); fs(c, '#ffb347', '#e08a2a', 2); rr(c, -18, -16, 36, 9, 4); fs(c, '#fff3e0', '#e0cfb0', 1.5); c.fillStyle = '#e08a2a'; c.font = '800 12px system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('HONIG', 0, 6); break;
    case 'letter': case 'answer': rr(c, -20, -13, 40, 26, 4); fs(c, name === 'letter' ? '#fff' : '#ffe4ef', '#d6c7a6', 2); c.strokeStyle = '#d6c7a6'; c.lineWidth = 2; c.beginPath(); c.moveTo(-20, -13); c.lineTo(0, 2); c.lineTo(20, -13); c.stroke(); c.fillStyle = '#ff6b81'; heartPath(c, 0, 4, 6); c.fill(); break;
    case 'nut': drawPic(c, 'NUSS', 0, 0, 50); break;
    case 'flower_r': case 'flower_y': case 'flower_b': c.fillStyle = FLOWER_COL[name.slice(-1)]; for (let i = 0; i < 6; i++) { const a = i * TAU / 6; circ(c, Math.cos(a) * 11, Math.sin(a) * 11, 8.5); c.fill(); } circ(c, 0, 0, 7); fs(c, '#fff8c0'); break;
    case 'bush': drawBush(c, { x: 0, y: 18, shake: 0, peek: 0 }, 0); break;
    case 'feather': c.rotate(-0.6); ell(c, 0, 0, 9, 24); fs(c, '#fff', '#c9a5ff', 2); c.strokeStyle = '#a784e6'; c.lineWidth = 2; line(c, 0, -22, 0, 28); for (let i = -2; i <= 2; i++) { line(c, 0, i * 8, -7, i * 8 - 5); line(c, 0, i * 8, 7, i * 8 - 5); } break;
    case 'lens': c.strokeStyle = '#b98852'; c.lineWidth = 6; line(c, 10, 10, 22, 22); circ(c, -4, -4, 15); fs(c, 'rgba(158,203,255,0.5)', '#8a6ad8', 4); break;
    case 'lily': c.fillStyle = '#7ed56f'; c.beginPath(); c.moveTo(0, 4); c.arc(0, 4, 22, 0.4, TAU - 0.2); c.closePath(); c.fill(); c.fillStyle = '#ff9ecb'; sparklePath(c, 0, 0, 11); c.fill(); break;
    case 'slow': ell(c, 4, 10, 20, 6); fs(c, '#c9e88a'); circ(c, -2, -2, 14); fs(c, '#d9a5ff', '#b07fe0', 2); c.strokeStyle = '#b07fe0'; c.lineWidth = 2.5; c.beginPath(); c.arc(-2, -2, 7, 0, 5); c.stroke(); circ(c, 20, 0, 6); fs(c, '#c9e88a'); break;
    case 'acorn': drawHat(c, 'acorn', 0, 18, 1.2); break;
    case 'crown': drawHat(c, 'crown', 0, 18, 1.2); break;
    case 'flowers': for (let i = 0; i < 5; i++) { const a = Math.PI * (1.05 + i * 0.22); c.fillStyle = PASTEL[i]; circ(c, Math.cos(a) * 20, 10 + Math.sin(a) * 20, 7); c.fill(); } c.strokeStyle = '#7ed56f'; c.lineWidth = 3; c.beginPath(); c.arc(0, 10, 20, Math.PI, 0); c.stroke(); break;
    case 'bow': c.fillStyle = '#ff8fb1'; tri(c, 0, 0, -22, -14, -22, 14); c.fill(); tri(c, 0, 0, 22, -14, 22, 14); c.fill(); circ(c, 0, 0, 6); fs(c, '#f06a98'); break;
    case 'shop': rr(c, -20, -4, 40, 24, 6); fs(c, '#d9a066', '#a5672c', 2); c.strokeStyle = '#a5672c'; c.lineWidth = 3; c.beginPath(); c.arc(0, -4, 14, Math.PI, 0); c.stroke(); drawPic(c, 'NUSS', -8, 6, 18); starPath(c, 8, 6, 7); fs(c, '#ffe066'); break;
    case 'cloud': drawIcon(c, 'cloud', 0, 0, 50); break;
    case 'eye': ell(c, 0, 0, 24, 15); fs(c, '#fff', '#8a6ad8', 3); circ(c, 0, 0, 9); fs(c, '#5aa9ff'); circ(c, 0, 0, 4); fs(c, '#3d2b3a'); c.fillStyle = '#fff'; circ(c, 3, -3, 2); c.fill(); c.fillStyle = '#ffe066'; sparklePath(c, 20, -16, 6); c.fill(); break;
    case 'firefly': drawFirefly(c, 0, 0, Game.time, 'y', 1.8); break;
    case 'cards': c.save(); c.rotate(-0.2); rr(c, -22, -16, 24, 32, 5); fs(c, '#ffb65c', '#fff', 2.5); c.restore(); c.save(); c.rotate(0.15); rr(c, -2, -18, 24, 32, 5); fs(c, '#fff', '#e0cfb0', 2.5); c.restore(); c.fillStyle = '#ff6b81'; heartPath(c, 10, -1, 7); c.fill(); break;
    case 'berry': c.fillStyle = '#d9435e'; [[-7, 4], [7, 4], [0, -6]].forEach(q => { circ(c, q[0], q[1], 10); c.fill(); }); c.fillStyle = 'rgba(255,255,255,0.5)'; circ(c, -10, 0, 3); c.fill(); c.fillStyle = '#5fbf57'; ell(c, 4, -18, 7, 4, -0.4); c.fill(); break;
    case 'shroom': c.save(); c.translate(0, 18); c.scale(1.8, 1.8); drawMushroom(c, { x: 0, y: 0, col: '#ffcc33', squish: 0 }); c.restore(); break;
    case 'lantern': drawLantern(c, 0, 30, true, Game.time); break;
    case 'shroomhat': drawHat(c, 'shroom', 0, 18, 1.2); break;
    case 'wings': c.save(); c.scale(1.2, 1.2); c.translate(10, 40); drawWing(c, true, 0); c.restore(); break;
    case 'book': rr(c, -22, -18, 44, 36, 5); fs(c, '#b79cff', '#8a6ad8', 2.5); rr(c, -16, -12, 32, 24, 3); fs(c, '#fff'); c.fillStyle = '#ff8fb1'; heartPath(c, -6, 0, 6); c.fill(); starPath(c, 7, -1, 6); fs(c, '#ffe066'); break;
    case 'check': drawIcon(c, 'check', 0, 0, 50, '#5fd38d'); break;
    case 'compass': circ(c, 0, 0, 22); fs(c, '#fff', '#c9a46e', 4); c.save(); c.rotate(0.5); tri(c, 0, -17, -6, 0, 6, 0); fs(c, '#ff6b6b'); tri(c, 0, 17, -6, 0, 6, 0); fs(c, '#9a8fb5'); c.restore(); starPath(c, 15, -15, 7); fs(c, '#ffe066', '#f0b429', 1.5); break;
    case 'heart': heartPath(c, 0, 6, 24); fs(c, '#ff8fb1', '#f06a98', 2); break;
    case 'star': starPath(c, 0, 0, 20); fs(c, '#ffe066', '#f0b429', 2); break;
    default: drawIcon(c, name, 0, 0, 50);
  }
  c.restore();
}
// Hüte für T (auf dem Kopf, Kopfmitte bei 0,-72) und Schmuck fürs Einhorn
function drawHat(c, kind, x, y, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  if (kind === 'acorn') { c.beginPath(); c.ellipse(0, -14, 23, 15, 0, Math.PI, 0); c.closePath(); fs(c, '#c98a4a', '#a5672c', 2); c.strokeStyle = 'rgba(120,70,30,0.5)'; c.lineWidth = 1.5; for (let i = -16; i <= 16; i += 8) line(c, i, -14, i + 4, -24); c.strokeStyle = '#8a5528'; c.lineWidth = 4; line(c, 0, -28, 3, -36); }
  else if (kind === 'shroom') { c.beginPath(); c.ellipse(0, -14, 26, 18, 0, Math.PI, 0); c.closePath(); fs(c, '#ff6b6b', '#d9435e', 2); c.fillStyle = '#fff'; circ(c, -11, -22, 4); c.fill(); circ(c, 4, -27, 3.5); c.fill(); circ(c, 13, -17, 3); c.fill(); }
  else if (kind === 'crown') { c.beginPath(); c.moveTo(-18, -12); c.lineTo(-20, -34); c.lineTo(-9, -22); c.lineTo(0, -38); c.lineTo(9, -22); c.lineTo(20, -34); c.lineTo(18, -12); c.closePath(); fs(c, '#ffd23f', '#e0a800', 2); c.fillStyle = '#ff6b81'; circ(c, 0, -18, 3.5); c.fill(); c.fillStyle = '#5aa9ff'; circ(c, -11, -16, 2.5); c.fill(); circ(c, 11, -16, 2.5); c.fill(); }
  c.restore();
}
function drawUniAcc(c, kind) {
  if (kind === 'flowers') { for (let i = 0; i < 5; i++) { c.fillStyle = PASTEL[i]; circ(c, 22 + i * 6, -96 + Math.abs(i - 2) * 3, 5); c.fill(); c.fillStyle = '#fff8c0'; circ(c, 22 + i * 6, -96 + Math.abs(i - 2) * 3, 1.8); c.fill(); } }
  else if (kind === 'bow') { c.fillStyle = '#ff8fb1'; tri(c, -30, -50, -44, -60, -44, -40); c.fill(); tri(c, -30, -50, -16, -60, -16, -40); c.fill(); circ(c, -30, -50, 4); fs(c, '#f06a98'); }
}

/* ---- Pilztor am Südrand: zu bis zum Ende von Kapitel 1, danach glitzert es ---- */
function drawGate(c, x, y, open, t) {
  c.fillStyle = 'rgba(40,70,50,0.18)'; ell(c, x, y + 4, 90, 16); c.fill();
  if (open) { c.save(); c.beginPath(); c.ellipse(x, y - 52, 48, 56, 0, 0, TAU); c.clip(); for (let i = 0; i < 6; i++) { c.fillStyle = PASTEL[i]; circ(c, x + Math.cos(t * 2 + i) * 20, y - 52 + Math.sin(t * 2.6 + i) * 26, 30 - i * 3); c.fill(); } c.restore(); }
  else { c.fillStyle = '#5fb873'; ell(c, x, y - 48, 48, 52); c.fill(); c.fillStyle = '#74c985'; for (let i = 0; i < 7; i++) { circ(c, x - 34 + i * 11, y - 70 + (i % 2) * 18, 12); c.fill(); } }
  for (const s of [-1, 1]) { c.save(); c.translate(x + s * 62, y); c.scale(2.3, 2.3); drawMushroom(c, { x: 0, y: 0, col: s < 0 ? '#ff6b6b' : '#c98bff', squish: 0 }); c.restore(); }
  c.strokeStyle = '#ff6b6b'; c.lineWidth = 14; c.beginPath(); c.arc(x, y - 52, 58, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
  c.fillStyle = '#fff'; for (let i = 0; i < 5; i++) { const a = Math.PI * (1.15 + i * 0.17); circ(c, x + Math.cos(a) * 58, y - 52 + Math.sin(a) * 58, 3.5); c.fill(); }
  if (open) { c.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { const tw = Math.max(0, Math.sin(t * 4 + i * 1.7)); sparklePath(c, x - 40 + i * 26, y - 100 - (i % 2) * 14, 3 + tw * 6); c.fill(); } }
}

/* ---- Pilzdorf: Maus Mia (Bürgermeisterin), Igel Ida (Bäckerin), Pilzhäuser, Laternen ---- */
function drawMouse(c, t, o) {
  c.strokeStyle = '#ff9ecb'; c.lineWidth = 3.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(-14, -10); c.quadraticCurveTo(-36, -6, -32, -30 + Math.sin(t * 3) * 4); c.stroke();
  c.fillStyle = '#9a9aae'; ell(c, -8, -3, 8, 5); c.fill(); ell(c, 8, -3, 8, 5); c.fill();
  ell(c, 0, -24, 17, 22); fs(c, '#b8b8c8', '#9a9aae', 2);
  c.beginPath(); c.moveTo(-14, -38); c.lineTo(14, -12); c.lineTo(10, -8); c.lineTo(-16, -33); c.closePath(); fs(c, '#ff6b6b');   // Schärpe
  starPath(c, 2, -22, 5); fs(c, '#ffd23f');
  circ(c, -15, -66, 11); fs(c, '#b8b8c8', '#9a9aae', 2); circ(c, 15, -66, 11); fs(c, '#b8b8c8', '#9a9aae', 2);
  circ(c, -15, -66, 6); fs(c, '#ffc9da'); circ(c, 15, -66, 6); fs(c, '#ffc9da');
  ell(c, 0, -52, 16, 15); fs(c, '#b8b8c8', '#9a9aae', 2);
  c.fillStyle = '#3d2b3a'; if ((t % 3.6) < 0.12) { c.fillRect(-9, -54, 5, 1.6); c.fillRect(4, -54, 5, 1.6); } else { circ(c, -6, -54, 2.5); c.fill(); circ(c, 6, -54, 2.5); c.fill(); }
  c.fillStyle = '#ff9ecb'; circ(c, 0, -46, 3.5); c.fill();
  c.strokeStyle = '#7a7a8e'; c.lineWidth = 1; line(c, 3, -46, 16, -48); line(c, 3, -45, 16, -43); line(c, -3, -46, -16, -48); line(c, -3, -45, -16, -43);
  c.beginPath(); c.moveTo(-10, -66); c.lineTo(10, -66); c.lineTo(7, -80); c.lineTo(-7, -80); c.closePath(); fs(c, '#5a4a7a'); rr(c, -12, -68, 24, 4, 2); fs(c, '#5a4a7a');   // Hut
}
function drawHedgehog(c, t, o) {
  c.fillStyle = '#8a6a4a'; for (let i = 0; i < 13; i++) { const a = Math.PI * (0.75 + i * 0.12); tri(c, Math.cos(a - 0.1) * 22, -32 + Math.sin(a - 0.1) * 26, Math.cos(a) * 38, -32 + Math.sin(a) * 40, Math.cos(a + 0.1) * 22, -32 + Math.sin(a + 0.1) * 26); c.fill(); }
  c.fillStyle = '#6a4f36'; ell(c, -8, -3, 8, 5); c.fill(); ell(c, 8, -3, 8, 5); c.fill();
  ell(c, 0, -28, 22, 26); fs(c, '#8a6a4a');
  ell(c, 0, -26, 15, 20); fs(c, '#f3d7b0', '#d9b98f', 1.5);
  rr(c, -12, -30, 24, 22, 4); fs(c, '#fff', '#e3e3ee', 1.5);                                               // Schürze
  c.fillStyle = '#ff9ecb'; heartPath(c, 0, -18, 5); c.fill();
  ell(c, 0, -58, 16, 14); fs(c, '#f3d7b0', '#d9b98f', 1.5);
  c.fillStyle = '#3d2b3a'; circ(c, -6, -60, 2.5); c.fill(); circ(c, 6, -60, 2.5); c.fill(); circ(c, 0, -52, 3.5); c.fill();
  c.fillStyle = 'rgba(255,130,150,0.45)'; circ(c, -10, -55, 3); c.fill(); circ(c, 10, -55, 3); c.fill();
  c.fillStyle = '#fff'; c.strokeStyle = '#e3e3ee'; c.lineWidth = 1.5; rr(c, -11, -80, 22, 12, 3); c.fill(); c.stroke();   // Bäckermütze
  circ(c, -8, -84, 7); c.fill(); c.stroke(); circ(c, 0, -88, 8); c.fill(); c.stroke(); circ(c, 8, -84, 7); c.fill(); c.stroke();
}
function drawShroomHouse(c, h, t) {
  const r = h.r;
  c.fillStyle = 'rgba(40,60,60,0.18)'; ell(c, h.x, h.y + 2, r * 0.95, r * 0.3); c.fill();
  c.save(); c.translate(h.x, h.y);
  rr(c, -r * 0.55, -r * 1.05, r * 1.1, r * 1.05, r * 0.22); fs(c, '#fff3e0', '#e0cfb0', 2.5);                    // Stiel = Hauswand
  rr(c, -r * 0.16, -r * 0.5, r * 0.32, r * 0.5, r * 0.15); fs(c, '#b98852', '#96693d', 2);                      // Tür
  c.fillStyle = '#ffd23f'; circ(c, r * 0.09, -r * 0.24, 2.5); c.fill();
  const lit = h.lit ? '#fff3a0' : '#9ecbff';
  circ(c, -r * 0.34, -r * 0.7, r * 0.12); fs(c, lit, '#b98852', 2); circ(c, r * 0.34, -r * 0.7, r * 0.12); fs(c, lit, '#b98852', 2);
  c.beginPath(); c.moveTo(-r * 1.1, -r * 0.95); c.quadraticCurveTo(-r * 1.05, -r * 2.05, 0, -r * 2.1); c.quadraticCurveTo(r * 1.05, -r * 2.05, r * 1.1, -r * 0.95); c.quadraticCurveTo(0, -r * 0.75, -r * 1.1, -r * 0.95); c.closePath();
  fs(c, h.col, shade(h.col, -0.18), 2.5);
  c.fillStyle = 'rgba(255,255,255,0.9)'; [[-0.55, -1.45, 0.16], [0.1, -1.75, 0.13], [0.6, -1.35, 0.15], [-0.15, -1.2, 0.09]].forEach(d => { circ(c, d[0] * r, d[1] * r, d[2] * r); c.fill(); });
  if (h.chimney) { rr(c, r * 0.45, -r * 2.05, r * 0.18, r * 0.35, 3); fs(c, '#c99a6b'); c.fillStyle = 'rgba(255,255,255,0.6)'; circ(c, r * 0.54 + Math.sin(t) * 4, -r * 2.2 - (t * 20 % 30), 6); c.fill(); }
  c.restore();
}
function drawLantern(c, x, y, lit, t) {
  c.fillStyle = 'rgba(40,60,60,0.18)'; ell(c, x, y + 2, 12, 4); c.fill();
  c.strokeStyle = '#8a6a4a'; c.lineWidth = 5; c.lineCap = 'round'; line(c, x, y, x, y - 46);
  c.save(); c.translate(x, y - 50);
  if (lit) { c.fillStyle = 'rgba(255,236,140,' + (0.35 + Math.sin(t * 3 + x) * 0.1) + ')'; circ(c, 0, 0, 30); c.fill(); }
  ell(c, 0, 2, 11, 13); fs(c, lit ? '#fff3a0' : '#d6d0e0', '#c9a46e', 2);
  c.beginPath(); c.arc(0, -6, 16, Math.PI, 0); c.closePath(); fs(c, '#ff6b6b', '#d9435e', 2); c.fillStyle = '#fff'; circ(c, -6, -11, 2.5); c.fill(); circ(c, 5, -13, 2); c.fill();
  c.restore();
}
function drawBerryBush(c, x, y, ripe, t) {
  c.fillStyle = 'rgba(40,70,50,0.16)'; ell(c, x, y + 2, 26, 7); c.fill();
  c.fillStyle = '#4fa766'; circ(c, x - 12, y - 12, 14); c.fill(); circ(c, x + 12, y - 12, 14); c.fill(); circ(c, x, y - 22, 17); c.fill();
  if (ripe) { c.fillStyle = '#d9435e'; [[-10, -16], [6, -26], [14, -12], [-2, -10], [-14, -26]].forEach(p => { circ(c, x + p[0], y + p[1], 4.5); c.fill(); }); }
}
function drawGoldShroom(c, x, y, t) {
  c.fillStyle = 'rgba(255,230,120,' + (0.3 + Math.sin(t * 4) * 0.12) + ')'; circ(c, x, y - 14, 22); c.fill();
  c.save(); c.translate(x, y); c.scale(1.2, 1.2); drawMushroom(c, { x: 0, y: 0, col: '#ffcc33', squish: 0 }); c.restore();
}
function drawFirefly(c, x, y, t, col, s = 1) {
  const g = 0.6 + Math.sin(t * 5 + x) * 0.25;
  const rg = c.createRadialGradient(x, y, 2 * s, x, y, 20 * s), rgb = col === 'b' ? '140,200,255' : '255,240,110';
  rg.addColorStop(0, 'rgba(' + rgb + ',' + g + ')'); rg.addColorStop(1, 'rgba(' + rgb + ',0)'); c.fillStyle = rg; circ(c, x, y, 20 * s); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.7)'; ell(c, x - 5 * s, y - 6 * s, 5 * s, 3.5 * s, -0.5); c.fill(); ell(c, x + 5 * s, y - 6 * s, 5 * s, 3.5 * s, 0.5); c.fill();
  circ(c, x, y, 7 * s); fs(c, col === 'b' ? '#7db8ff' : '#ffe066', col === 'b' ? '#4f8fe0' : '#f0b429', 1.5);
  c.fillStyle = '#5a4a7a'; circ(c, x + 4 * s, y - 2 * s, 3.2 * s); c.fill();
}
function drawWing(c, near, t) {   // Flügel fürs Einhorn (ab Kapitel 2)
  const f = Math.sin(t * 3) * 0.12;
  c.save(); c.translate(near ? -4 : 4, -60); c.rotate(-0.55 + f + (near ? 0 : -0.15));
  const cols = near ? ['#ffffff', '#ffe4f3', '#e9ddff'] : ['#f3eefa', '#f3dbe9', '#ddd2f2'];
  [[34, 13], [28, 10], [20, 7]].forEach((d, i) => { c.beginPath(); c.ellipse(-d[0] * 0.55, -i * 7, d[0], d[1], -0.2, 0, TAU); fs(c, cols[i], '#e0d0ec', 1.5); });
  c.restore();
}
