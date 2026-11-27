
/* ============ 5. WELT: DER ZAUBERWALD (Ansicht von oben) ============
   Große, frei begehbare Karte (5600 × 3600) mit Zonen:
   Zauberwald (Mitte-West), Hügel (Nordwest), Blumenwiese mit Pilzkreis (Südwest),
   Fluss mit drei Brücken, Fuchslichtung (Nordost), Seerosensee (Südost), Drachenfelsen (Osten).
   Weitere Gebiete später: eigenes Objekt nach diesem Muster anlegen (Karte, NPCS, Wege). */
const WORLD = { w: 8000, h: 5000, cell: 20 };
const WOOD_W = 5600, SKY_X = 5700;                                         // bis WOOD_W Wald und Dorf, dahinter der Himmel mit den Wolkeninseln
const ISLES = [{ x: 6080, y: 1650, rx: 300, ry: 190 }, { x: 6820, y: 1000, rx: 330, ry: 210 }, { x: 7480, y: 1820, rx: 330, ry: 220 },
  { x: 6780, y: 2620, rx: 310, ry: 200 }, { x: 7420, y: 3420, rx: 290, ry: 190 }, { x: 6300, y: 3500, rx: 270, ry: 180 }];
const SKY_LINKS = [[0, 1], [1, 2], [0, 3], [3, 2], [3, 4], [3, 5]];        // Regenbogenbrücken
const SKY_PAD = { x: 5390, y: 1650 }, LAND_PAD = { x: 5900, y: 1660 };    // Startplatz im Wald, Landeplatz auf der ersten Insel
const ALTAR = { x: 4980, y: 640 };                                          // Kristallstein auf dem Drachenberg (Finale)
const LAMB_SPOTS = [[7380, 3500], [6360, 3560], [7580, 1960]];
const DROP_SPOTS = [[6020, 1580], [7000, 1090], [7350, 1720], [6900, 2700], [6200, 3450]];
const skyWalk = (x, y) => x > SKY_X && (ISLES.some(I => inEll(x, y, I, -14)) || SKY_LINKS.some(L => segDist(x, y, ISLES[L[0]].x, ISLES[L[0]].y, ISLES[L[1]].x, ISLES[L[1]].y) < 40));
const inSky = x => x > WOOD_W;
const HEDGE_Y = 3600;                                                      // Hecke zwischen Zauberwald (Norden) und Pilzdorf (Süden)
const riverX = y => 2500 + 170 * Math.sin(y / 420 + 0.4) + 50 * Math.sin(y / 150);
const BRIDGES = [900, 1950, 3050, 4400].map(y => ({ y, h: 96, w: 270, x: riverX(y) }));
const LAKE = { x: 3750, y: 2550, rx: 560, ry: 290 };
const POND = { x: 1750, y: 2250, rx: 125, ry: 72 };
const RING = { x: 620, y: 2880, r: 105 };       // Pilzkreis: jeder Pilz singt einen Ton
const WALK_SPEED = 230, RIDE_SPEED = 420;
const ZOOM_RIDE = 0.8, ZOOM_GALLOP = 0.68;   // Kamera zoomt beim Reiten heraus (1 = normal)
// NPCs: Position, Figur, Symbol in der Sprechblase, Begrüßungston. Das Minispiel steht in MINIGAMES (unten).
const NPCS = {
  owl:    { id: 'owl',    x: 1150, y: 1250, art: 'owl',    size: 92,  icon: 'gem',    lift: 30, sound: 'huhu',   hop: 0 },
  fox:    { id: 'fox',    x: 3420, y: 780,  art: 'fox',    size: 100, icon: 'shadow', lift: 0,  sound: 'hop',    hop: 0 },
  frog:   { id: 'frog',   x: 3250, y: 2860, art: 'frog',   size: 72,  icon: 'star',   lift: 10, sound: 'quak',   hop: 0 },
  dragon: { id: 'dragon', x: 4950, y: 1650, art: 'dragon', size: 78,  icon: 'heart',  lift: 20, sound: 'giggle', hop: 0 },
  // Lesen und Rechnen (im Eltern-Bereich abschaltbar, dann verschwinden die beiden)
  snail:    { id: 'snail',    x: 3620, y: 1990, art: 'snail',    size: 82, icon: 'abc',  lift: 0, sound: 'hop', hop: 0, learn: true },
  squirrel: { id: 'squirrel', x: 1040, y: 1780, art: 'squirrel', size: 88, icon: 'math', lift: 0, sound: 'hop', hop: 0, learn: true },
  // Pilzdorf (Kapitel 2)
  mouse:    { id: 'mouse',    x: 1600, y: 4170, art: 'mouse',    size: 76, icon: 'firefly', lift: 0, sound: 'squeak', hop: 0 },
  hedgehog: { id: 'hedgehog', x: 1220, y: 4440, art: 'hedgehog', size: 72, icon: 'cards',   lift: 0, sound: 'hop', hop: 0 },
  // Figuren mit Nebenaufgaben (kein Minispiel, keine Kristalle)
  duck:  { id: 'duck',  x: 3020, y: 2470, art: 'duckNpc', size: 70, icon: 'chick',   lift: 0, sound: 'quak', hop: 0, quest: true },
  bee:   { id: 'bee',   x: 1460, y: 2990, art: 'bee',     size: 64, icon: 'honey',   lift: 26, sound: 'flutter', hop: 0, quest: true },
  bear:  { id: 'bear',  x: 1650, y: 560,  art: 'bear',    size: 104, icon: 'honey',  lift: 0, sound: 'babble', hop: 0, quest: true },
  mole:  { id: 'mole',  x: 880,  y: 2700, art: 'mole',    size: 70, icon: 'glasses', lift: 0, sound: 'squeak', hop: 0, quest: true },
  bunny: { id: 'bunny', x: 1880, y: 1580, art: 'bunny',   size: 72, icon: 'bush',    lift: 0, sound: 'hop', hop: 0, quest: true },
  // Wolkeninseln (Kapitel 3)
  sheep: { id: 'sheep', x: 6860, y: 980,  art: 'sheep',   size: 98, icon: 'size',    lift: 0, sound: 'hop', hop: 0 },
  bird:  { id: 'bird',  x: 7520, y: 1800, art: 'bird',    size: 74, icon: 'note',    lift: 16, sound: 'flutter', hop: 0 },
  puff:  { id: 'puff',  x: 6760, y: 2600, art: 'cloudkid', size: 70, icon: 'drop',   lift: 22, sound: 'flutter', hop: 0, quest: true }
};
const QUEST_NPCS = ['duck', 'bee', 'bear', 'mole', 'bunny', 'puff'];
const GATE = { x: 1500, y: HEDGE_Y };                                      // Pilztor: einziger Durchgang durch die Hecke (offen ab Ende Kapitel 1)
// Pilzdorf
const PLAZA = { x: 1500, y: 4300, r: 150 };
const HOUSES = [{ x: 1760, y: 4060, r: 78, col: '#ff6b6b', chimney: true }, { x: 1080, y: 4330, r: 62, col: '#ff9f5a', chimney: true }, { x: 1900, y: 4450, r: 58, col: '#c98bff' },
  { x: 1800, y: 4780, r: 54, col: '#5aa9ff' }, { x: 1180, y: 4780, r: 56, col: '#ff7fb0' }, { x: 860, y: 4060, r: 52, col: '#ffd23f' }, { x: 2200, y: 4060, r: 54, col: '#5fd38d' }];
const LANTERNS = [[1370, 4190], [1640, 4200], [1500, 4480], [1000, 4560], [1990, 4580]];
const CAKE_SPOTS = [[700, 4450, 'berry'], [2350, 4650, 'berry'], [600, 4860, 'berry'], [2050, 4910, 'berry'], [850, 4530, 'shroom'], [2300, 4280, 'shroom']];
const BEE_FLOWERS = [{ x: 1320, y: 2920, c: 'r' }, { x: 1620, y: 2890, c: 'y' }, { x: 1480, y: 3120, c: 'b' }];
const QUEST_BUSHES = [[2060, 1470], [1740, 1420], [2010, 1730], [520, 3280], [770, 3380], [380, 3060]];
const NPC_ALL = ['owl', 'fox', 'frog', 'dragon', 'snail', 'squirrel', 'mouse', 'hedgehog', 'sheep', 'bird'];
const npcOrder = () => NPC_ALL.filter(id => Save.data.learn || !NPCS[id].learn);   // wer gerade mitspielt (Reihenfolge = Rucksack)
const walkers = () => npcOrder().filter(id => id !== 'dragon');
const visibleNpcs = () => walkers().concat(QUEST_NPCS);
const CRYSTAL_COL = { owl: '#b79cff', fox: '#ffb65c', frog: '#6fdc8c', dragon: '#ff8fb1', snail: '#5fd3e8', squirrel: '#ffd23f', mouse: '#7b8cff', hedgehog: '#e07a5f', sheep: '#8fe3ff', bird: '#ff9ecb' };
const START_POS = { x: 1500, y: 1850 };
const DRAGON_HOME = { x: NPCS.dragon.x, y: NPCS.dragon.y };
const BX = i => BRIDGES[i].x;
const PATHS = [
  [[1500, 1850], [1380, 1560], [1090, 1290]],                                                                          // Start – Eule
  [[1500, 1850], [1900, 1760], [2150, 1950], [BX(1) - 170, 1950], [BX(1) + 170, 1950], [2950, 1930], [3350, 1880]],    // Start – Brücke – Kreuzung
  [[3350, 1880], [3420, 1400], [3380, 1050], [3360, 810]],                                                              // Kreuzung – Fuchs
  [[3350, 1880], [3120, 2250], [3100, 2600], [3190, 2890]],                                                             // Kreuzung – Frosch
  [[3350, 1880], [3900, 1760], [4400, 1720], [4880, 1690]],                                                             // Kreuzung – Drachenfelsen
  [[1090, 1290], [1250, 900], [1750, 680], [2150, 860], [BX(0) - 170, 900], [BX(0) + 170, 900], [2950, 880], [3360, 810]], // Nordweg
  [[1500, 1850], [1480, 2350], [1250, 2800], [850, 3080], [1250, 3330], [1850, 3200], [2050, 2900], [1480, 2350]],      // Blumenwiese
  [[3350, 1880], [3480, 1950], [3556, 2020]],                                                                            // Kreuzung – Schnecke
  [[1500, 1850], [1260, 1830], [976, 1810]],                                                                             // Start – Eichhörnchen
  [[1250, 3330], [1500, 3520], [1500, 3680], [1500, 4170]],                                                              // Blumenwiese – Pilztor – Dorfplatz
  [[1380, 4330], [1220, 4470]], [[1640, 4360], [2300, 4400], [BX(3) - 170, 4400], [BX(3) + 170, 4400], [3200, 4450]],     // Dorf – Bäckerei, Dorf – Brücke
  [[1500, 4440], [1500, 4850]], [[1370, 4360], [900, 4600]], [[1630, 4250], [2200, 4150]],                                                                                          // Blumenwiese – Pilztor
  [[2050, 2900], [2200, 3050], [BX(2) - 170, 3050], [BX(2) + 170, 3050], [2950, 3080], [3500, 3020], [3900, 2950]]      // Südweg
];
// Versteckte Glitzersterne (werden beim Aufbau auf freie Stellen geschoben)
const GLITTER = [[600, 520], [1900, 430], [2950, 420], [4300, 520], [5250, 700], [5300, 2500], [4800, 3330], [3950, 3330],
  [2650, 3420], [420, 3420], [300, 2200], [650, 1500], [1950, 1200], [3950, 2120], [4250, 1150],
  [380, 4850], [2300, 4900], [3300, 4650], [4700, 4300], [5200, 4900], [7470, 3300], [6230, 3420]];   // die letzten fünf liegen südlich der Hecke
const uniMark = () => { const n = NAMES.find(n => n.id === Save.data.nameId); return n ? n.icon : null; };
const hopLift = (h, amp = 24) => h > 0 ? Math.sin((1 - clamp(h, 0, 1)) * Math.PI) * amp : 0;
function segDist(px, py, ax, ay, bx, by) { const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy; const t = l ? clamp(((px - ax) * dx + (py - ay) * dy) / l, 0, 1) : 0; return Math.hypot(px - ax - dx * t, py - ay - dy * t); }
function pathDist(x, y) { let m = 1e9; for (const P of PATHS) for (let i = 0; i < P.length - 1; i++) m = Math.min(m, segDist(x, y, P[i][0], P[i][1], P[i + 1][0], P[i + 1][1])); return m; }
const inEll = (x, y, e, m) => { const px = (x - e.x) / (e.rx + m), py = (y - e.y) / (e.ry + m); return px * px + py * py < 1; };
const onBridge = (x, y) => BRIDGES.some(b => Math.abs(y - b.y) < b.h / 2 - 12 && Math.abs(x - b.x) < b.w / 2 + 30);
const MUSH_COL = ['#ff6b6b', '#ff9f5a', '#c98bff', '#ff7fb0', '#5aa9ff', '#5fd38d', '#ffd23f'];
const RING_NOTES = [523, 587, 659, 698, 784, 880, 988, 1047];

const World = {
  built: false, time: 0,

  /* ---- Karte einmalig aufbauen (fester Zufall: sieht jedes Mal gleich aus) ---- */
  spacing(x, y) {
    if (y > HEDGE_Y) return x > 550 && x < 2550 && y > 3740 ? 600 : 125;   // Pilzdorf: fast keine Bäume, außen herum Wald
    if (y > 2620 && x < 2250) return 330;          // Blumenwiese: weit und offen
    if (y < 760 && x < 2250) return 190;            // Hügel im Norden
    if (x > 4400) return 260;                       // Drachenfelsen: mehr Felsen als Bäume
    if (x > riverX(y)) return 125;                  // Osten
    return 100;                                     // Zauberwald: dicht
  },
  terrainOK(x, y, m) {
    if (Math.abs(y - HEDGE_Y) < 40 + m) return false;
    if (x < 90 + m || x > WOOD_W - 90 - m || y < 140 + m || y > WORLD.h - 100 - m) return false;
    if (Math.abs(x - riverX(y)) < 64 + m) return false;
    if (inEll(x, y, LAKE, 16 + m) || inEll(x, y, POND, 16 + m)) return false;
    return true;
  },
  build() {
    this.built = true;
    const R = seeded(20261224), W = WORLD;
    this.trees = []; this.bushes = []; this.mushrooms = []; this.flowers = []; this.butterflies = []; this.patches = []; this.rocks = []; this.hills = [];
    // Belegungs-Raster für das Verteilen (damit nichts übereinander steht)
    const occ = new Map(), BK = 160, key = (i, j) => i * 10000 + j;
    const addOcc = (x, y, s) => { const k = key(Math.floor(x / BK), Math.floor(y / BK)); if (!occ.has(k)) occ.set(k, []); occ.get(k).push({ x, y, s }); };
    const occOK = (x, y, s) => { const i0 = Math.floor(x / BK), j0 = Math.floor(y / BK); for (let i = i0 - 2; i <= i0 + 2; i++) for (let j = j0 - 2; j <= j0 + 2; j++) { const a = occ.get(key(i, j)); if (a) for (const o of a) if (dist(x, y, o.x, o.y) < (s + o.s) / 2) return false; } return true; };
    const keep = [[START_POS.x, START_POS.y, 190], [RING.x, RING.y, 210], [DRAGON_HOME.x, DRAGON_HOME.y, 260], [NPCS.fox.x, NPCS.fox.y, 330]];
    for (const k in NPCS) keep.push([NPCS[k].x, NPCS[k].y, 200]);
    keep.push([SKY_PAD.x, SKY_PAD.y, 170], [ALTAR.x, ALTAR.y - 120, 300], [GATE.x, GATE.y, 150], [PLAZA.x, PLAZA.y, PLAZA.r + 60]); for (const h of HOUSES) keep.push([h.x, h.y - h.r, h.r + 80]); for (const l of LANTERNS) keep.push([l[0], l[1], 50]); for (const q of CAKE_SPOTS) keep.push([q[0], q[1], 60]); for (const f of BEE_FLOWERS) keep.push([f.x, f.y, 90]); for (const q of QUEST_BUSHES) keep.push([q[0], q[1], 80]);
    for (const b of BRIDGES) { keep.push([b.x - 200, b.y, 170]); keep.push([b.x + 200, b.y, 170]); }
    const free0 = (x, y, m, pm) => this.terrainOK(x, y, m) && pathDist(x, y) > pm && keep.every(k => dist(x, y, k[0], k[1]) > k[2]);
    const tree = (x, y, s, sp) => { this.trees.push({ x, y, s: s || 0.95 + R() * 0.3, kind: R() < 0.22 ? 1 : R() < 0.5 ? 2 : 0, shake: 0 }); addOcc(x, y, sp || 100); };
    // Waldrand rundherum
    for (let x = 20; x < WOOD_W; x += 76) {
      const xa = x + R() * 30, xb = x + R() * 30;
      if (Math.abs(xa - riverX(40)) > 110) tree(xa, 70 + R() * 22, 1.25);
      if (Math.abs(xb - riverX(W.h)) > 110) tree(xb, W.h + 8 + R() * 12, 1.25);
    }
    for (let y = 160; y < W.h - 30; y += 82) { tree(18 + R() * 26, y + R() * 20, 1.2); tree(WOOD_W - 18 - R() * 26, y + R() * 20, 1.2); }
    // Hügel im Norden (nur Bild, begehbar)
    for (let i = 0; i < 9; i++) this.hills.push({ x: 250 + R() * 2000, y: 250 + R() * 450, rx: 180 + R() * 160, ry: 80 + R() * 60 });
    // Felsen: viele am Drachenfelsen, ein paar am Fluss
    for (let i = 0, n = 0; i < 3000 && n < 46; i++) { const x = 4420 + R() * 1050, y = 420 + R() * 2900, r = 26 + R() * 32; if (free0(x, y, r, 70) && occOK(x, y, r * 2 + 60)) { this.rocks.push({ x, y, r, wob: 0, moss: R() < 0.5 }); addOcc(x, y, r * 2 + 60); n++; } }
    for (let i = 0, n = 0; i < 2000 && n < 12; i++) { const y = 300 + R() * 3000, x = riverX(y) + (R() < 0.5 ? -1 : 1) * (110 + R() * 60), r = 22 + R() * 16; if (free0(x, y, r, 70) && occOK(x, y, r * 2 + 50)) { this.rocks.push({ x, y, r, wob: 0, moss: true }); addOcc(x, y, r * 2 + 50); n++; } }
    // Bäume je nach Zone mehr oder weniger dicht
    for (let i = 0; i < 16000; i++) { const x = R() * WOOD_W, y = R() * W.h, sp = this.spacing(x, y); if (free0(x, y, 50, 72) && occOK(x, y, sp)) tree(x, y, 0, sp); }
    // Büsche (manchmal mit Hase), Pilze, Blumen, Schmetterlinge
    const bush = (x, y) => { this.bushes.push({ x, y, shake: 0, peek: 0, dragon: false }); addOcc(x, y, 90); };
    bush(1250, 1950); bush(1700, 1600); for (const q of QUEST_BUSHES) bush(q[0], q[1]);
    for (let i = 0, n = 0; i < 4000 && n < 46; i++) { const x = R() * WOOD_W, y = R() * W.h; if (free0(x, y, 40, 60) && occOK(x, y, 110)) { bush(x, y); n++; } }
    const mush = (x, y, o) => this.mushrooms.push(Object.assign({ x, y, col: MUSH_COL[this.mushrooms.length % 4], squish: 0 }, o || {}));
    mush(1330, 1700); mush(1650, 2000); mush(1180, 1460);
    for (let i = 0, n = 0; i < 4000 && n < 60; i++) { const x = R() * WOOD_W, y = R() * W.h; if (free0(x, y, 20, 40) && occOK(x, y, 60)) { mush(x, y); addOcc(x, y, 40); n++; } }
    RING_NOTES.forEach((f, i) => { const a = i / 8 * TAU - Math.PI / 2; mush(RING.x + Math.cos(a) * RING.r, RING.y + Math.sin(a) * RING.r * 0.62, { col: MUSH_COL[i % 7], note: f, ring: i }); });
    const FC = ['#ff9ecb', '#fff', '#ffd27f', '#c9a5ff', '#9ecbff', '#ff8a8a'];
    for (let i = 0; i < 2600; i++) {
      const meadow = i < 900, x = meadow ? 140 + R() * 2100 : 80 + R() * (WOOD_W - 160), y = meadow ? 2650 + R() * 860 : 150 + R() * (W.h - 220);
      if (this.terrainOK(x, y, 6) && pathDist(x, y) > 30) this.flowers.push({ x, y, col: FC[i % FC.length], r: R() * 6 });
    }
    for (let i = 0; i < 220; i++) this.patches.push({ x: R() * WOOD_W, y: R() * W.h, rx: 60 + R() * 130, ry: 30 + R() * 60, light: R() < 0.5 });
    const BC = ['#ff9ecb', '#ffd27f', '#9ecbff', '#c9a5ff', '#fff38a'];
    const bf = (x, y) => this.butterflies.push({ hx: x, hy: y, x, y, ph: this.butterflies.length * 1.7, col: BC[this.butterflies.length % BC.length], away: 0, off: 0, dir: this.butterflies.length * 2.1 });
    [[1450, 1650], [1750, 1950], [1250, 2150]].forEach(p => bf(p[0], p[1]));
    for (let i = 0; i < 12; i++) bf(300 + R() * 1900, 2700 + R() * 750);          // viele auf der Blumenwiese
    for (let i = 0; i < 12; i++) bf(300 + R() * 5000, 300 + R() * 3000);
    // Enten auf dem See
    this.ducks = [0, 1, 2].map(i => ({ a: i * 2.1, sp: 0.12 + i * 0.03, k: 0.45 + i * 0.15, splash: 0 }));
    // Lauf-Raster für die Wegsuche: erst Gelände, dann Hindernisse aufstempeln
    this.cols = Math.ceil(W.w / W.cell); this.rows = Math.ceil(W.h / W.cell);
    this.grid = new Uint8Array(this.cols * this.rows);
    for (let j = 0; j < this.rows; j++) for (let i = 0; i < this.cols; i++) {
      const x = (i + 0.5) * W.cell, y = (j + 0.5) * W.cell;
      if (x > WOOD_W - 60) { this.grid[j * this.cols + i] = skyWalk(x, y) ? 0 : 1; continue; }
      const solid = x < 60 || y < 110 || y > W.h - 64 || Math.abs(y - HEDGE_Y) < 28 || (!onBridge(x, y) && Math.abs(x - riverX(y)) < 64) || inEll(x, y, LAKE, 16) || inEll(x, y, POND, 16);
      this.grid[j * this.cols + i] = solid ? 1 : 0;
    }
    for (const t of this.trees) this.stamp(t.x, t.y - 4, 31);
    for (const b of this.bushes) this.stamp(b.x, b.y - 6, 30);
    for (const r of this.rocks) this.stamp(r.x, r.y - r.r * 0.3, r.r * 0.9);
    for (const k in NPCS) if (!NPCS[k].learn) this.stamp(NPCS[k].x, NPCS[k].y - 6, k === 'dragon' ? 44 : 36);
    this.stamp(NPCS.fox.x + 86, NPCS.fox.y - 8, 40);     // Fuchsbau
    this.stamp(ALTAR.x, ALTAR.y - 170, 115); this.stamp(ALTAR.x, ALTAR.y - 16, 40);   // Drachenberg und Kristallstein
    this.stamp(GATE.x - 62, GATE.y - 10, 30); this.stamp(GATE.x + 62, GATE.y - 10, 30);   // Pfeiler vom Pilztor
    for (const h of HOUSES) this.stamp(h.x, h.y - h.r * 0.3, h.r * 0.62);
    this.setGate(Save.data.story >= 3);
    this.gs = new Float32Array(this.grid.length); this.came = new Int32Array(this.grid.length); this.st = new Uint8Array(this.grid.length);
    // Glitzersterne auf freie Stellen schieben
    this.glitter = GLITTER.map(p => { const k = this.nearFree(p[0], p[1]); return { x: (k % this.cols + 0.5) * W.cell, y: (Math.floor(k / this.cols) + 0.5) * W.cell }; });
    const RS = seeded(777); this.skyPuffs = [];   // ferne Wölkchen im Himmel (nur Bild)
    for (let i = 0; i < 70; i++) { const x = WOOD_W + 120 + RS() * (W.w - WOOD_W - 160), y = 120 + RS() * (W.h - 240); if (!ISLES.some(I => inEll(x, y, I, 120))) this.skyPuffs.push({ x, y, s: 0.5 + RS() * 0.9, ph: RS() * 6 }); }
    this.renderMinimap();
  },
  setGate(open) {   // Durchgang im Pilztor frei oder zu
    const C = WORLD.cell; for (let j = Math.floor((HEDGE_Y - 28) / C); j <= Math.floor((HEDGE_Y + 28) / C); j++) for (let i = Math.floor((GATE.x - 34) / C); i <= Math.floor((GATE.x + 34) / C); i++) { const y = (j + 0.5) * C, x = (i + 0.5) * C; if (Math.abs(y - HEDGE_Y) < 28 && Math.abs(x - GATE.x) < 34) this.grid[j * this.cols + i] = open ? 0 : 1; }
    this.gateOpen = open;
  },
  stamp(x, y, r) {
    const C = WORLD.cell;
    for (let j = Math.floor((y - r) / C); j <= Math.floor((y + r) / C); j++) for (let i = Math.floor((x - r) / C); i <= Math.floor((x + r) / C); i++) {
      if (i < 0 || j < 0 || i >= this.cols || j >= this.rows) continue;
      if (dist(x, y, (i + 0.5) * C, (j + 0.5) * C) < r) this.grid[j * this.cols + i] = 1;
    }
  },
  /* Übersichtskarte einmal vorzeichnen */
  renderMinimap() {
    const k = 0.16, cv = document.createElement('canvas'); cv.width = Math.ceil(WORLD.w * k); cv.height = Math.ceil(WORLD.h * k);
    const c = cv.getContext('2d'); c.scale(k, k);
    c.fillStyle = '#a9e2a2'; c.fillRect(0, 0, WORLD.w, WORLD.h);
    c.fillStyle = 'rgba(255,236,190,0.45)'; rr(c, 60, 2620, 2200, 960, 200); c.fill();
    c.fillStyle = '#c4eeb4'; for (const h of this.hills) { ell(c, h.x, h.y, h.rx, h.ry); c.fill(); }
    c.fillStyle = 'rgba(190,190,210,0.5)'; rr(c, 4380, 380, 1150, 3000, 260); c.fill();
    c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#f6e8c4'; c.lineWidth = 70;
    for (const P of PATHS) { c.beginPath(); P.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); }
    c.strokeStyle = '#8fd0f0'; c.lineWidth = 150; c.beginPath(); for (let y = 0; y <= WORLD.h; y += 40) c.lineTo(riverX(y), y); c.stroke();
    c.fillStyle = '#8fd0f0'; ell(c, LAKE.x, LAKE.y, LAKE.rx, LAKE.ry); c.fill(); ell(c, POND.x, POND.y, POND.rx, POND.ry); c.fill();
    c.fillStyle = '#c08f5c'; for (const b of BRIDGES) { rr(c, b.x - b.w / 2, b.y - b.h / 2 - 10, b.w, b.h + 20, 20); c.fill(); }
    c.fillStyle = '#a8a8b8'; for (const r of this.rocks) { circ(c, r.x, r.y, r.r * 1.2); c.fill(); }
    for (const t of this.trees) { c.fillStyle = t.kind === 1 ? '#f2a3c3' : t.kind === 2 ? '#4eaa6c' : '#62b874'; circ(c, t.x, t.y - 30, 40); c.fill(); }
    c.fillStyle = '#ff9ecb'; for (const m of this.mushrooms) if (m.ring != null) { circ(c, m.x, m.y, 22); c.fill(); }
    c.fillStyle = '#3f9a58'; c.fillRect(60, HEDGE_Y - 26, WOOD_W - 120, 52);
    c.fillStyle = '#cfe8ff'; c.fillRect(WOOD_W - 10, 0, WORLD.w, WORLD.h);
    c.lineCap = 'round'; c.lineWidth = 80; c.strokeStyle = '#ffc2d6'; for (const L of SKY_LINKS) { const A = ISLES[L[0]], B = ISLES[L[1]]; line(c, A.x, A.y, B.x, B.y); }
    c.fillStyle = '#fff'; for (const I of ISLES) { ell(c, I.x, I.y, I.rx, I.ry); c.fill(); }
    c.fillStyle = '#b7aed6'; c.beginPath(); c.moveTo(ALTAR.x - 270, ALTAR.y - 70); c.lineTo(ALTAR.x + 60, ALTAR.y - 430); c.lineTo(ALTAR.x + 270, ALTAR.y - 70); c.closePath(); c.fill();
    c.fillStyle = '#c9a5ff'; circ(c, SKY_PAD.x, SKY_PAD.y, 60); c.fill(); circ(c, LAND_PAD.x, LAND_PAD.y, 60); c.fill();
    c.fillStyle = '#e8d6b0'; circ(c, PLAZA.x, PLAZA.y, PLAZA.r); c.fill();
    for (const h of HOUSES) { c.fillStyle = h.col; circ(c, h.x, h.y - h.r * 0.9, h.r * 1.05); c.fill(); }
    this.minimap = cv;
  },
  free(x, y) { const i = Math.floor(x / WORLD.cell), j = Math.floor(y / WORLD.cell); return i >= 0 && j >= 0 && i < this.cols && j < this.rows && !this.grid[j * this.cols + i]; },
  nearFree(x, y) {
    const C = WORLD.cell, ci = clamp(Math.floor(x / C), 0, this.cols - 1), cj = clamp(Math.floor(y / C), 0, this.rows - 1);
    if (!this.grid[cj * this.cols + ci]) return cj * this.cols + ci;
    let best = -1, bd = 1e9;
    for (let r = 1; r <= 20 && best < 0; r++) for (let j = cj - r; j <= cj + r; j++) for (let i = ci - r; i <= ci + r; i++) {
      if (i < 0 || j < 0 || i >= this.cols || j >= this.rows || this.grid[j * this.cols + i]) continue;
      const d = dist(x, y, (i + 0.5) * C, (j + 0.5) * C); if (d < bd) { bd = d; best = j * this.cols + i; }
    }
    return best;
  },
  los(ax, ay, bx, by) { const n = Math.ceil(dist(ax, ay, bx, by) / 7); for (let k = 1; k <= n; k++) if (!this.free(lerp(ax, bx, k / n), lerp(ay, by, k / n))) return false; return true; },
  /* Wegsuche (A*) – T läuft so automatisch um Bäume herum und über die Brücken */
  findPath(sx, sy, tx, ty) {
    const C = WORLD.cell, cols = this.cols, rows = this.rows, grid = this.grid;
    const s = this.nearFree(sx, sy), g = this.nearFree(tx, ty); if (s < 0 || g < 0) return null;
    const exact = this.free(tx, ty), cen = k => ({ x: (k % cols + 0.5) * C, y: (Math.floor(k / cols) + 0.5) * C });
    const goal = exact ? { x: tx, y: ty } : cen(g);
    if (s === g) return [goal];
    const G = this.gs, came = this.came, st = this.st; G.fill(1e9); st.fill(0);
    const hI = [], hF = [];
    const push = (i, f) => { let k = hI.length; hI.push(i); hF.push(f); while (k > 0) { const p = (k - 1) >> 1; if (hF[p] <= f) break; hI[k] = hI[p]; hF[k] = hF[p]; k = p; } hI[k] = i; hF[k] = f; };
    const pop = () => { const top = hI[0], li = hI.pop(), lf = hF.pop(), n = hI.length; if (n) { let k = 0; for (;;) { let ch = 2 * k + 1; if (ch >= n) break; if (ch + 1 < n && hF[ch + 1] < hF[ch]) ch++; if (hF[ch] >= lf) break; hI[k] = hI[ch]; hF[k] = hF[ch]; k = ch; } hI[k] = li; hF[k] = lf; } return top; };
    const gi = g % cols, gj = Math.floor(g / cols);
    const H = k => { const dx = Math.abs(k % cols - gi), dy = Math.abs(Math.floor(k / cols) - gj); return Math.max(dx, dy) + 0.414 * Math.min(dx, dy); };
    G[s] = 0; came[s] = -1; push(s, H(s));
    let found = false;
    while (hI.length) {
      const cur = pop(); if (st[cur] === 2) continue; st[cur] = 2;
      if (cur === g) { found = true; break; }
      const ci = cur % cols, cj = Math.floor(cur / cols);
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue;
        const ni = ci + di, nj = cj + dj; if (ni < 0 || nj < 0 || ni >= cols || nj >= rows) continue;
        const nk = nj * cols + ni; if (grid[nk] || st[nk] === 2) continue;
        if (di && dj && (grid[cj * cols + ni] || grid[nj * cols + ci])) continue;
        const ng = G[cur] + (di && dj ? 1.414 : 1);
        if (ng < G[nk]) { G[nk] = ng; came[nk] = cur; push(nk, ng + H(nk)); }
      }
    }
    if (!found) return null;
    const raw = []; for (let k = g; k !== -1; k = came[k]) raw.push(cen(k)); raw.reverse(); raw[raw.length - 1] = goal;
    const out = []; let ax = sx, ay = sy, i = 0;
    while (i < raw.length) { let j = i; for (let k = Math.min(raw.length - 1, i + 60); k > i; k--) if (this.los(ax, ay, raw[k].x, raw[k].y)) { j = k; break; } out.push(raw[j]); ax = raw[j].x; ay = raw[j].y; i = j + 1; }
    return out;
  },
  pathLen(p, x, y) { let l = 0; for (const q of p) { l += dist(x, y, q.x, q.y); x = q.x; y = q.y; } return l; },

  /* ---- Szene ---- */
  enter(o) {
    if (!this.built) this.build();
    const S = Save.data;
    if (S.worldV !== 2) {           // Spielstand aus der kleinen Welt übernehmen
      S.pos = null; if (S.dragon.state === 'dropped') S.dragon.state = 'done';
      S.worldV = 2; Save.store();
    }
    if (S.dragon.state === 'done') S.dragonFriend = true;
    this.fx = new Fx(); this.ev = null; this.queue = []; this.hint = null; this.idle = 0; this.pending = null; this.packWig = 0; this.marker = null; this.party = 0; this.lastPathT = 0;
    this.dlg = null; this.overlay = null; this.chickTrail = []; this.lastWallet = Save.data.wallet || 0; this.menuHold = null; this.menuT = 0; this.prank = null; this.prankCool = rnd(25, 40); this.stoleOnce = false; this.ride = false; this.mapOpen = false; this.tipT = o.first ? 9 : 4; this.starPop = 0;
    const d = S.dragon;
    this.grabbed = d.state === 'dropped'; this.crystalGround = d.state === 'dropped' ? { x: d.x, y: d.y, who: d.who } : null;
    this.dragon = { x: DRAGON_HOME.x, y: DRAGON_HOME.y, vis: d.state !== 'waiting', fly: false, carry: null, flip: true, hop: 0, mode: 'home', sc: 1 };
    if (S.story === 8) Object.assign(this.dragon, { x: ALTAR.x + 110, y: ALTAR.y + 30, mode: 'visit' });
    let pos = START_POS;
    if (S.pos && this.free(S.pos.x, S.pos.y)) pos = S.pos; else if (o.from && NPCS[o.from]) pos = this.npcSpot(NPCS[o.from]);
    this.T = { x: pos.x, y: pos.y, face: 1, walk: false, path: null, onArrive: null, hop: 0 };
    this.U = { x: pos.x - 70, y: pos.y + 14, face: 1, walk: false, hop: 0 }; this.trail = [];
    if (!this.free(this.U.x, this.U.y)) { this.U.x = pos.x; this.U.y = pos.y; }
    this.zoom = 1; this.cam = { x: 0, y: 0 }; this.camTo(1); this.area = null; this.banner = null; this.setGate(S.story >= 3);
    if (o.reward) { this.lastReward = o.reward; this.queue.push(() => this.evReward(o.reward)); }
    this.storyDirty = true;
    if (o.first) Voice.say('world_intro'); else if (o.back) Voice.say('welcome_back');
  },
  leave() { Save.data.pos = { x: Math.round(this.T.x), y: Math.round(this.T.y) }; Save.store(); },
  npcSpot(n) { return { x: n.x - 64, y: n.y + 30 }; },   // T stellt sich links neben die Figur
  dragonSpot() { const D = this.dragon; return { x: D.x - 64, y: D.y + 30 }; },
  vw() { return VW / this.zoom; }, vh() { return VH / this.zoom; },
  toWorld(p) { return { x: p.x / this.zoom + this.cam.x, y: p.y / this.zoom + this.cam.y }; },
  camTo(k) { const tx = clamp(this.T.x - this.vw() / 2, 0, WORLD.w - this.vw()), ty = clamp(this.T.y - this.vh() / 2 - 30 / this.zoom, 0, WORLD.h - this.vh()); this.cam.x = lerp(this.cam.x, tx, k); this.cam.y = lerp(this.cam.y, ty, k); },
  hud() { const r = Math.max(View.btn / 2, 48); return { pack: { x: VW - 16 - r, y: 16 + r, r }, hint: { x: 16 + r, y: 16 + r, r }, map: { x: VW - 16 - r, y: VH - 16 - r, r }, menu: { x: 46, y: VH - 46, r: 28 } }; },
  slotScreen(id) { const h = this.hud(), n = npcOrder().length, i = npcOrder().indexOf(id); return { x: h.pack.x - h.pack.r - 30 - (n - 1 - i) * 46, y: h.pack.y }; },
  slotWorld(id) { return this.toWorld(this.slotScreen(id)); },
  // Stufe des Kristalls, wie er gerade im Rucksack liegt (0 = nicht da, 1–3 = klein, groß, golden)
  packLv(id) { const d = Save.data.dragon; if (d.state === 'dropped' && d.who === id && this.grabbed) return 0; return Math.max(0, (Save.data.level[id] || 0) - (this.pending === id ? 1 : 0)); },
  inPack(id) { return this.packLv(id) > 0; },
  earned() { return npcOrder().filter(id => Save.data.crystals[id]).length; },
  blocked() { return !!(this.ev && this.ev.block) || this.queue.length > 0 || !!this.dlg || !!this.overlay; },
  starsFound() { return (Save.data.stars || []).length; },

  checkStory() {
    const S = Save.data, d = S.dragon, base = ['owl', 'fox', 'frog'].filter(id => S.crystals[id]).length;
    if (base >= 2 && d.state === 'waiting') { this.queue.push(() => this.evWait(0.7)); this.queue.push(() => this.evDragon(false)); return; }
    if (d.state === 'dropped') return;
    const all = npcOrder();
    if (all.every(id => S.crystals[id]) && (S.partyN || 0) < all.length) { this.queue.push(() => this.evWait(0.5)); this.queue.push(() => this.evParty(false)); return; }
    if (all.every(id => S.level[id] >= 3) && (S.goldN || 0) < all.length) { this.queue.push(() => this.evWait(0.5)); this.queue.push(() => this.evParty(true)); }
  },
  walkTo(x, y, cb) {
    const p = this.findPath(this.T.x, this.T.y, x, y);
    this.T.path = p; this.T.onArrive = p ? cb || null : null;
    if (p && p.length) { const e = p[p.length - 1]; this.marker = { x: e.x, y: e.y, t: 0.6 }; }
    return !!p;
  },
  startNpc(id) {
    const n = id === 'dragon' ? this.dragon : NPCS[id]; n.hop = 1; Sfx.play(NPCS[id].sound); this.T.path = null; this.T.face = 1;
    if (this.ride) { this.ride = false; this.U.x = this.T.x - 60; this.U.y = this.T.y; }
    Game.go(MINIGAMES[id], {});
  },
  dragonReady() { const D = this.dragon; return Save.data.dragonFriend && D.vis && !D.fly && (D.mode === 'home' || D.mode === 'visit'); },
  nearestStar() { let best = -1, bd = 1e9; this.glitter.forEach((s, i) => { if ((Save.data.stars || []).includes(i) || (inSky(s.x) && !Save.data.wings) || (s.y > HEDGE_Y && Save.data.story < 3 && !inSky(s.x))) return; const d = dist(s.x, s.y, this.T.x, this.T.y); if (d < bd) { bd = d; best = i; } }); return best; },
  hintTarget() { const t = this.hintTarget0(); return t && !this.viaPad(t) ? this.hintTargetNear() : this.viaPad(t); },
  hintTargetNear() { const si = this.nearestStar(); return si >= 0 ? { x: this.glitter[si].x, y: this.glitter[si].y, star: true } : null; },
  hintTarget0() {
    if (this.crystalGround) return { x: this.crystalGround.x, y: this.crystalGround.y, crystal: true };
    const sq = this.storyQuestTarget(); if (sq) return sq;   // erst Geschichte, dann Aufträge
    const av = npcOrder().filter(id => (id !== 'dragon' || this.dragonReady()) && (Save.data.wings || !inSky(NPCS[id].x)) && (Save.data.story >= 3 || NPCS[id].y < HEDGE_Y));
    const id = av.sort((a, b) => Save.data.level[a] - Save.data.level[b])[0];   // wer hat die niedrigste Stufe?
    if (id && Save.data.level[id] < 3) { const s = id === 'dragon' ? this.dragonSpot() : this.npcSpot(NPCS[id]); return { x: s.x, y: s.y, npc: id }; }
    const si = this.nearestStar(); if (si >= 0) return { x: this.glitter[si].x, y: this.glitter[si].y, star: true };
    return null;
  },
  showHint() {
    this.idle = 0; this.U.hop = 1; Sfx.play('hint');
    const t = this.hintTarget(); if (!t) { Voice.say('uni_tap'); this.fx.burst(this.U.x, this.U.y - 50, 10, { g: 60 }); return; }
    this.hint = { t: 8, target: t, path: this.findPath(this.T.x, this.T.y, t.x, t.y) || [t] };
    Voice.say(t.crystal ? 'world_hint_crystal' : t.star ? 'world_hint_star' : t.pad ? 'world_hint_pad' : 'world_hint');
  },
  pickDropSpot() {
    const T = this.T, cam = this.cam;
    for (const d of [230, 180, 290, 130]) for (const a of [0.35, 2.75, -0.6, 3.7, 1.3, -1.4, 2.0, 0, Math.PI]) {
      const x = T.x + Math.cos(a) * d, y = T.y + Math.sin(a) * d * 0.7;
      if (x < cam.x + 130 || x > cam.x + this.vw() - 130 || y < cam.y + 170 || y > cam.y + this.vh() - 70 || !this.free(x, y) || !this.free(x, y - 20)) continue;
      const p = this.findPath(T.x, T.y, x, y); if (p && this.pathLen(p, T.x, T.y) < d * 2.2) return { x, y };
    }
    return { x: T.x + 50, y: T.y + 10 };
  },

  /* ---- Reiten ---- */
  mount() {
    if (this.ride) return; const T = this.T;
    this.ride = true; T.hop = 1; this.U.hop = 1; this.trail.length = 0; Sfx.play('hop'); Sfx.play('pop'); this.fx.burst(T.x, T.y - 60, 12, { g: 60 }); Voice.say('uni_ride_on');
  },
  dismount() {
    if (!this.ride) return; const T = this.T, U = this.U;
    this.ride = false; U.x = T.x; U.y = T.y; U.face = T.face; T.path = null;
    const nx = T.x + 50 * T.face; if (this.free(nx, T.y)) T.x = nx; else if (this.free(T.x - 50 * T.face, T.y)) T.x -= 50 * T.face;
    T.hop = 1; this.trail.length = 0; Sfx.play('hop'); Voice.say('uni_ride_off');
  },

  evDragonToAltar() {
    const D = this.dragon, W = this; this.prank = null; D.carry = null; D.fly = true; D.vis = true; D.mode = 'away'; Sfx.play('whoosh');
    const e = { block: false, t: 0 };
    e.update = dt => { e.t += dt; if (W.dFly(D, ALTAR.x + 110, ALTAR.y + 30, dt, 360)) { D.fly = false; D.mode = 'visit'; D.hop = 1; D.flip = true; Sfx.play('land'); return true; } return false; };
    return e;
  },
  /* ---- Fliegen zu den Wolkeninseln ---- */
  usePad(P) {
    if (!Save.data.wings) { this.U.hop = 1; Voice.say('sky_need_wings'); return; }
    this.queue.push(() => this.evFly(P, P === SKY_PAD ? LAND_PAD : SKY_PAD));
  },
  evFly(A, B) {
    const T = this.T, U = this.U, up = B === LAND_PAD; T.path = null; T.onArrive = null; this.hint = null;
    this.ride = true; T.hop = 1; U.hop = 1; Sfx.play('flutter'); Sfx.play('fanfare'); Voice.say(up ? 'sky_fly' : 'sky_back');
    const k = this.nearFree(B.x + (up ? 110 : -110), B.y + 10), ex = (k % this.cols + 0.5) * WORLD.cell, ey = (Math.floor(k / this.cols) + 0.5) * WORLD.cell, sx = T.x, sy = T.y;
    const e = { block: true, t: 0, dur: 3.4 };
    e.update = dt => {
      e.t += dt; const u = clamp(e.t / e.dur, 0, 1), m = u * u * (3 - 2 * u);
      T.x = lerp(sx, ex, m); T.y = lerp(sy, ey, m); T.face = ex > sx ? 1 : -1; T.walk = false; U.x = T.x; U.y = T.y; U.face = T.face;
      this.flyLift = Math.sin(u * Math.PI) * 170;
      if (Math.random() < dt * 24) this.fx.add({ x: T.x - T.face * rnd(20, 60), y: T.y - this.flyLift - rnd(20, 60), vy: -20, life: 0.8, size: rnd(4, 9), color: PASTEL[ri(0, 5)] });
      if (u < 1) return false;
      this.flyLift = 0; this.ride = false; U.x = T.x - 60 * T.face; U.y = T.y; if (!this.free(U.x, U.y)) U.x = T.x; this.trail.length = 0; T.hop = 1; Sfx.play('pop'); this.fx.burst(T.x, T.y - 30, 16, { g: 60 });
      Save.data.pos = { x: Math.round(T.x), y: Math.round(T.y) }; Save.store(); this.onPad = false; return true;
    };
    return e;
  },
  viaPad(tg) {   // Ziel auf der anderen Seite (Himmel/Wald)? Dann erst zum Startplatz
    if (!tg || inSky(tg.x) === inSky(this.T.x)) return tg;
    if (!Save.data.wings) return null;
    const P = inSky(this.T.x) ? LAND_PAD : SKY_PAD; return { x: P.x, y: P.y, pad: true };
  },

  /* ---- Ereignisse: Belohnung, Drache, Feier ---- */
  evWait(s) { const e = { block: true, t: 0 }; e.update = dt => (e.t += dt) >= s; return e; },
  evReward(id) {
    const W = this, lv = Save.data.level[id], big = 24 + lv * 8, n = id === 'dragon' ? W.dragon : NPCS[id]; W.pending = id; n.hop = 1; Voice.say(lv >= 3 ? 'reward_gold' : lv === 2 ? 'reward_up' : 'reward'); Sfx.play('crystal');
    const bx = W.T.x + 30, by = W.T.y - 160;
    const e = { block: true, t: 0, x: bx, y: by, s: 0 };
    e.update = dt => {
      e.t += dt; const slot = W.slotWorld(id);
      if (e.t < 1.6) { e.s = easeOut(e.t / 0.5); e.x = bx; e.y = by - Math.sin(e.t * 4) * 6; if (Math.random() < dt * 22) W.fx.add({ x: e.x + rnd(-30, 30), y: e.y + rnd(-34, 34), vy: -20, life: 0.7, size: rnd(5, 11), color: pick(PASTEL) }); }
      else if (e.t < 2.5) { const u = ease((e.t - 1.6) / 0.9); e.x = lerp(bx, slot.x, u); e.y = lerp(by, slot.y, u) - Math.sin(u * Math.PI) * 50; e.s = lerp(1, 0.5, u); }
      else { W.pending = null; W.packWig = 1; W.U.hop = 1; Sfx.play('good'); return true; }
      return false;
    };
    e.draw = c => { if (lv >= 3) { c.fillStyle = 'rgba(255,213,74,0.45)'; circ(c, e.x, e.y, big * 1.3 * e.s); c.fill(); } drawCrystal(c, e.x, e.y, big * e.s, CRYSTAL_COL[id]); };
    return e;
  },
  evDragon(again) {
    const W = this, T = W.T, D = W.dragon; T.path = null; T.onArrive = null; W.hint = null; W.prank = null;
    const got = ['owl', 'fox', 'frog'].filter(id => again ? W.inPack(id) : Save.data.crystals[id]);
    const who = !again && W.lastReward && got.includes(W.lastReward) ? W.lastReward : again ? pick(got) : got[got.length - 1];
    const spot = W.pickDropSpot();
    Save.data.dragon = { state: 'dropped', x: Math.round(spot.x), y: Math.round(spot.y), who }; Save.store();
    W.grabbed = false; D.vis = true; D.fly = true; D.mode = 'away'; D.carry = null; D.x = W.cam.x + W.vw() + 140; D.y = W.cam.y - 40; Sfx.play('whoosh');
    const e = { block: true, t: 0, ph: 0, from: { x: D.x, y: D.y }, fall: null };
    const next = () => { e.ph++; e.t = 0; e.from = { x: D.x, y: D.y }; };
    const fly = (x, y) => { if (Math.abs(x - D.x) > 0.5) D.flip = x < D.x; D.x = x; D.y = y; };
    e.update = dt => {
      e.t += dt; const slot = W.slotWorld(who);
      if (e.ph === 0) { const u = ease(e.t / 1.5); fly(lerp(e.from.x, slot.x, u), lerp(e.from.y, slot.y + 36, u) + Math.sin(u * Math.PI) * 50); if (e.t >= 1.5) { W.grabbed = true; D.carry = who; W.packWig = 1; Sfx.play('giggle'); Voice.say('dragon_steal', { pitch: 1.7 }); next(); } }
      else if (e.ph === 1) {
        const a = -Math.PI / 2 + e.t / 2.4 * TAU * 1.25, k = ease(e.t / 0.7);
        fly(lerp(e.from.x, T.x + Math.cos(a) * 170, k), lerp(e.from.y, T.y - 60 + Math.sin(a) * 75, k));
        if (Math.random() < dt * 16) W.fx.add({ x: D.x, y: D.y - 20, life: 0.6, size: rnd(5, 10), color: pick(PASTEL) });
        if (e.t >= 2.4) { Sfx.play('giggle'); if (!again) Voice.say('dragon_oh', { queue: true }); next(); }
      }
      else if (e.ph === 2) { const u = ease(e.t / 1.1); fly(lerp(e.from.x, spot.x, u), lerp(e.from.y, spot.y - 80, u)); if (e.t >= 1.1) { D.carry = null; e.fall = { y: D.y + 6, vy: 0 }; next(); } }
      else if (e.ph === 3) {
        const f = e.fall; f.vy += 1100 * dt; f.y += f.vy * dt;
        if (f.y > spot.y - 16) { f.y = spot.y - 16; if (f.vy > 120) { f.vy = -f.vy * 0.4; Sfx.play('plop'); } else f.vy = 0; }
        if (e.t >= 0.9) { W.crystalGround = { x: spot.x, y: spot.y, who }; e.fall = null; W.fx.burst(spot.x, spot.y - 16, 14, { g: 80 }); Sfx.play('giggle'); next(); }
      }
      else { const u = ease(e.t / 1.7); fly(lerp(e.from.x, DRAGON_HOME.x, u), lerp(e.from.y, DRAGON_HOME.y - 18, u) - Math.sin(u * Math.PI) * 90); if (e.t >= 1.7) { W.dragonHome(); Voice.say('dragon_dropped'); W.showHintQuiet(); return true; } }
      return false;
    };
    e.draw = c => { if (e.fall) drawCrystal(c, spot.x, e.fall.y, 18, CRYSTAL_COL[who]); };
    return e;
  },
  showHintQuiet() { const t = this.hintTarget(); if (t) this.hint = { t: 9, target: t, path: this.findPath(this.T.x, this.T.y, t.x, t.y) || [t] }; this.idle = 0; },
  collectCrystal() {
    const W = this, g = W.crystalGround; W.crystalGround = null; W.hint = null; Sfx.play('crystal'); W.fx.burst(g.x, g.y - 16, 16, { g: 80 });
    W.queue.push(() => {
      const e = { block: true, t: 0, x: g.x, y: g.y - 16 };
      e.update = dt => {
        e.t += dt; const s = W.slotWorld(g.who), u = ease(e.t / 0.9); e.x = lerp(g.x, s.x, u); e.y = lerp(g.y - 16, s.y, u) - Math.sin(u * Math.PI) * 70;
        if (e.t >= 0.9) {
          const first = !Save.data.dragonFriend; Save.data.dragon.state = 'done'; Save.data.dragonFriend = true; Save.store();
          W.grabbed = false; W.packWig = 1; W.U.hop = 1; Sfx.play('good'); Voice.say(first ? 'dragon_back' : 'dragon_back2'); W.prankCool = first ? 45 : rnd(50, 80);
          return true;
        }
        return false;
      };
      e.draw = c => drawCrystal(c, e.x, e.y, 18, CRYSTAL_COL[g.who]);
      return e;
    });
  },
  evParty(gold) {
    const W = this, S = Save.data; S.celebrated = true; if (gold) S.goldN = npcOrder().length; else S.partyN = npcOrder().length; Save.store(); Sfx.play('fanfare'); Voice.say(gold ? 'all_gold' : 'all_done'); W.party = 1;
    const e = { block: false, t: 0, n: 0 };
    e.update = dt => { e.t += dt; if (e.t > e.n * 0.5 && e.n < 12) { e.n++; ScreenFx.confetti(VW, 26); if (e.n % 3 === 0) Sfx.play('star'); } if (e.t > 7) { W.party = 0; return true; } return false; };
    e.drawScreen = c => {
      c.save(); c.globalAlpha = clamp(Math.min(e.t, 7 - e.t), 0, 1) * 0.75; c.lineWidth = 16;
      ['#ff7b9c', '#ffb65c', '#ffe066', '#7ddc8a', '#7db8ff', '#c9a5ff'].forEach((col, i) => { c.strokeStyle = col; c.beginPath(); c.arc(VW / 2, VH + 120, VH * 1.05 - i * 16, Math.PI, Math.PI + Math.PI * ease(e.t / 1.5)); c.stroke(); });
      c.restore();
    };
    return e;
  },

  /* ---- Der Drache als Dauergast: kleine Streiche, während T frei herumläuft ---- */
  dFly(D, tx, ty, dt, sp = 520) {
    const d = dist(D.x, D.y, tx, ty); if (d < sp * dt + 1) { D.x = tx; D.y = ty; return true; }
    if (Math.abs(tx - D.x) > 2) D.flip = tx < D.x; D.x += (tx - D.x) / d * sp * dt; D.y += (ty - D.y) / d * sp * dt;
    if (Math.random() < dt * 8) this.fx.add({ x: D.x, y: D.y - 20, vy: 20, life: 0.6, size: rnd(4, 8), color: pick(PASTEL) });
    return false;
  },
  offscreen() { return { x: this.cam.x + this.vw() + 160, y: this.cam.y + 60 }; },
  dragonHome() { const D = this.dragon; D.x = DRAGON_HOME.x; D.y = DRAGON_HOME.y; D.fly = false; D.vis = true; D.mode = 'home'; D.flip = true; D.sc = 1; D.carry = null; this.prank = null; this.prankCool = rnd(50, 85); },
  startPrank() {
    const D = this.dragon, kinds = ['paint', 'paint', 'hide', 'hide', 'hide', 'visit', 'visit'];
    if (!this.stoleOnce && ['owl', 'fox', 'frog'].some(id => this.inPack(id))) kinds.push('steal');
    const k = pick(kinds);
    if (k === 'steal') { this.stoleOnce = true; this.queue.push(() => this.evDragon(true)); return; }
    const o = this.offscreen(); D.mode = 'away'; D.fly = true; D.vis = true; D.x = o.x; D.y = o.y; Sfx.play('whoosh');   // kommt vom Bildschirmrand
    this.prank = k === 'paint' ? this.prankPaint() : k === 'hide' ? this.prankHide() : this.prankVisit();
  },
  paintAround(x, y) {
    let i = 0;
    for (const m of this.mushrooms) if (m.ring == null && dist(x, y, m.x, m.y) < 700) { m.col = MUSH_COL[(i++ + Math.floor(this.time)) % MUSH_COL.length]; m.squish = 1; this.fx.burst(m.x, m.y - 20, 6, { g: 60, sp1: 90 }); }
    for (const f of this.flowers) if (dist(x, y, f.x, f.y) < 380) f.col = pick(PASTEL);
    for (const tr of this.trees) if (dist(x, y, tr.x, tr.y) < 330 && Math.random() < 0.5) { tr.kind = 1; tr.shake = 1; }
  },
  prankPaint() {
    const W = this, D = W.dragon; let ph = 0, t = 0, a = 0, done = false;
    return { kind: 'paint', update(dt) {
      t += dt; const T = W.T;
      if (ph === 0) { if (W.dFly(D, T.x + 170, T.y - 110, dt)) { ph = 1; t = 0; Sfx.play('giggle'); } }
      else if (ph === 1) {
        a += dt * 2.6; D.x = T.x + Math.cos(a) * 170; D.y = T.y - 110 + Math.sin(a) * 70; D.flip = Math.sin(a) > 0;
        if (Math.random() < dt * 20) W.fx.add({ x: D.x, y: D.y - 30, vy: 40, g: 80, life: 0.9, size: rnd(5, 10), color: pick(PASTEL) });
        if (t > 1.2 && !done) { done = true; W.paintAround(T.x, T.y); Sfx.play('win'); Voice.say('dragon_paint', { pitch: 1.7 }); }
        if (t > 3.2) ph = 2;
      }
      else if (W.dFly(D, W.offscreen().x, W.offscreen().y, dt, 620)) { W.dragonHome(); return true; }
      return false;
    } };
  },
  prankHide() {
    const W = this, D = W.dragon, T = W.T, cam = W.cam;
    const cands = W.bushes.filter(b => b.x > cam.x + 90 && b.x < cam.x + W.vw() - 90 && b.y > cam.y + 150 && b.y < cam.y + W.vh() - 40 && dist(b.x, b.y, T.x, T.y) > 140
      && !W.trees.some(tr => tr.y > b.y - 10 && tr.y - b.y < 115 && Math.abs(tr.x - b.x) < 60));   // nicht hinter einem Baum
    if (!cands.length) return W.prankPaint();
    const b = pick(cands); let ph = 0, t = 0, wig = 0;
    const o = { kind: 'hide', bush: b, found: false, update(dt) {
      t += dt;
      if (ph === 0) { if (W.dFly(D, b.x, b.y - 90, dt)) { ph = 1; t = 0; } }
      else if (ph === 1) { D.y = b.y - 90 + ease(t / 0.35) * 70; D.sc = 1 - ease(t / 0.35) * 0.6; if (t > 0.35) { D.vis = false; D.sc = 1; b.dragon = true; b.shake = 1; Sfx.play('rustle'); Voice.say('dragon_hide', { pitch: 1.7 }); ph = 2; t = 0; wig = 0; } }
      else if (ph === 2) {
        if (t - wig > 1.6) { wig = t; b.shake = 0.8; W.fx.burst(b.x + 20, b.y - 50, 3, { shape: 'heart', color: '#ff8fb1', g: -50, sp0: 20, sp1: 60, s0: 8, s1: 12 }); if (Math.random() < 0.6) Sfx.play('giggle'); }
        if (o.found || t > 40) {
          b.dragon = false; D.vis = true; D.fly = true; D.x = b.x; D.y = b.y - 60; b.shake = 1; Sfx.play('pop'); W.fx.burst(b.x, b.y - 50, 16, { g: 100 });
          if (o.found) W.dragonGift(); ph = 3; t = 0;
        }
      }
      else if (ph === 3) { if (t < 1.2) D.y = b.y - 60 - Math.abs(Math.sin(t * 8)) * 26; else if (W.dFly(D, W.offscreen().x, W.offscreen().y, dt, 620)) { W.dragonHome(); return true; } }
      return false;
    } };
    return o;
  },
  dragonGift() {
    const si = this.nearestStar(), D = this.dragon;
    if (si >= 0) { const s = this.glitter[si]; Voice.say('dragon_star_tip', { pitch: 1.6 }); this.hint = { t: 16, target: { x: s.x, y: s.y, star: true }, path: this.findPath(this.T.x, this.T.y, s.x, s.y) || [s] }; }
    else Voice.say('dragon_found', { pitch: 1.6 });
    this.fx.burst(D.x, D.y - 60, 10, { shape: 'heart', color: '#ff8fb1', g: -40, sp1: 90 });
  },
  prankVisit() {
    const W = this, D = W.dragon, spot = W.pickDropSpot(); let ph = 0, t = 0;
    const o = { kind: 'visit', stay: false, update(dt) {
      t += dt;
      if (ph === 0) { if (W.dFly(D, spot.x, spot.y - 70, dt)) { ph = 1; t = 0; } }
      else if (ph === 1) { D.y = spot.y - 70 + ease(t / 0.4) * 70; if (t >= 0.4) { D.y = spot.y; D.fly = false; D.mode = 'visit'; D.hop = 1; Sfx.play('land'); Voice.say('dragon_visit', { pitch: 1.6 }); ph = 2; t = 0; } }
      else if (ph === 2) { if (t > 25 && !o.stay) { D.fly = true; D.mode = 'away'; Sfx.play('giggle'); ph = 3; } }
      else if (W.dFly(D, W.offscreen().x, W.offscreen().y, dt, 620)) { W.dragonHome(); return true; }
      return false;
    } };
    return o;
  },
  collectStar(i) {
    Save.data.wallet = (Save.data.wallet || 0) + 1;
    const s = this.glitter[i]; Save.data.stars = (Save.data.stars || []).concat([i]); Save.store();
    Sfx.play('star'); Sfx.play('crystal'); this.fx.burst(s.x, s.y - 20, 22, { g: 60, color: '#ffe066' }); this.starPop = 1; this.T.hop = 1; this.hint = null;
    if (this.starsFound() >= this.glitter.length) { Voice.say('stars_all'); ScreenFx.confetti(VW, 70); Sfx.play('fanfare'); } else Voice.say('star_found');
  },

  /* ---- Ablauf ---- */
  update(dt) {
    this.autoSave = (this.autoSave || 0) + dt; if (this.autoSave > 5 && !this.ev) { this.autoSave = 0; Save.data.pos = { x: Math.round(this.T.x), y: Math.round(this.T.y) }; Save.store(); }   // alle 5 s Standort sichern
    this.time += dt; const T = this.T, U = this.U, D = this.dragon;
    // Eltern-Menü: drei Punkte unten links 1,5 s gedrückt halten
    if (this.menuHold != null) { this.menuT += dt; if (this.menuT > 1.5) { this.menuHold = null; Sfx.play('pop'); Game.go(StartScene, { panel: true }); } }
    if (this.dlg) this.updateDialog(dt);
    if (this.ev) { if (this.ev.update(dt)) { this.ev = null; this.storyDirty = true; } }
    else if (this.queue.length) this.ev = this.queue.shift()();
    else if (this.storyDirty) { this.storyDirty = false; this.checkStory(); }
    if (this.prank && this.prank.update(dt)) this.prank = null;
    else if (!this.prank && !this.ev && !this.dlg && !this.overlay && !this.queue.length && Save.data.dragonFriend && Save.data.dragon.state === 'done' && !this.mapOpen && Save.data.story !== 8 && Save.data.story !== 7) {
      this.prankCool -= dt;
      if (this.prankCool <= 0) { if (dist(T.x, T.y, DRAGON_HOME.x, DRAGON_HOME.y) < 700 || inSky(T.x)) this.prankCool = 12; else this.startPrank(); }
    }
    if (this.tipT > 0 && !this.blocked()) { this.tipT -= dt; if (this.tipT <= 0 && !Save.data.rideTold) { Save.data.rideTold = true; Save.store(); U.hop = 1; Voice.say('uni_ride_tip'); } }

    let moving = false; const spd = (this.ride ? RIDE_SPEED : WALK_SPEED) * dt;
    if (!this.blocked() && !this.mapOpen) {
      const K = Input.keys, kx = (K.has('ArrowRight') ? 1 : 0) - (K.has('ArrowLeft') ? 1 : 0), ky = (K.has('ArrowDown') ? 1 : 0) - (K.has('ArrowUp') ? 1 : 0);
      if (kx || ky) {
        T.path = null; T.onArrive = null; this.idle = 0;
        const n = Math.hypot(kx, ky), nx = T.x + kx / n * spd, ny = T.y + ky / n * spd;
        if (this.free(nx, T.y)) T.x = nx; if (this.free(T.x, ny)) T.y = ny;
        if (kx) T.face = kx; moving = true;
      }
    }
    if (T.path && T.path.length) {
      const wp = T.path[0], d = dist(T.x, T.y, wp.x, wp.y);
      if (d <= spd) { T.x = wp.x; T.y = wp.y; T.path.shift(); if (!T.path.length) { const cb = T.onArrive; T.onArrive = null; T.path = null; if (cb) cb(); } }
      else { if (Math.abs(wp.x - T.x) > 3) T.face = wp.x > T.x ? 1 : -1; T.x += (wp.x - T.x) / d * spd; T.y += (wp.y - T.y) / d * spd; }
      moving = true;
    }
    T.walk = moving;
    if (this.ride) { U.x = T.x; U.y = T.y; U.face = T.face; U.walk = T.walk; this.trail.length = 0; }
    else {
      // Einhorn läuft T auf derselben Spur hinterher
      const tr = this.trail, last = tr[tr.length - 1];
      if (!last || dist(T.x, T.y, last.x, last.y) > 10) tr.push({ x: T.x, y: T.y });
      U.walk = false; let budget = 300 * dt;
      while (tr.length > 8 && budget > 0) { const q = tr[0], d = dist(U.x, U.y, q.x, q.y); if (d <= budget) { U.x = q.x; U.y = q.y; tr.shift(); budget -= d; } else { if (Math.abs(q.x - U.x) > 1) U.face = q.x > U.x ? 1 : -1; U.x += (q.x - U.x) / d * budget; U.y += (q.y - U.y) / d * budget; budget = 0; } U.walk = true; }
      if (tr.length > 60) { tr.splice(0, tr.length - 30); U.x = tr[0].x; U.y = tr[0].y; }
      if (!U.walk && !T.walk && Math.abs(T.x - U.x) > 12) U.face = T.x > U.x ? 1 : -1;
    }
    for (const o of [T, U, D].concat(visibleNpcs().map(k => NPCS[k]))) if (o.hop > 0) o.hop -= dt * 2;
    this.updateQuests(dt);
    const area = inSky(T.x) ? 'wolken' : dist(T.x, T.y, ALTAR.x, ALTAR.y) < 480 ? 'berg' : T.y > HEDGE_Y ? 'dorf' : 'wald';
    if (this.area && area !== this.area) { this.banner = { name: area, t: 0 }; Sfx.play('win'); Voice.say('area_' + area); }
    const P = inSky(T.x) ? LAND_PAD : SKY_PAD, onP = dist(T.x, T.y, P.x, P.y) < 48;   // auf den Startplatz gelaufen?
    if (onP && !this.onPad && !this.blocked() && !this.ev) this.usePad(P);
    this.onPad = onP;
    this.area = area; if (this.banner && (this.banner.t += dt) > 3) this.banner = null;
    if ((Save.data.wallet || 0) !== this.lastWallet) { this.lastWallet = Save.data.wallet || 0; this.starPop = 1; }
    const zt = this.ride ? (T.walk ? ZOOM_GALLOP : ZOOM_RIDE) : 1;
    if (Math.abs(this.zoom - zt) > 0.001) {   // Zoom um T herum ändern, damit T an derselben Stelle bleibt
      const sx = (T.x - this.cam.x) * this.zoom, sy = (T.y - this.cam.y) * this.zoom;
      this.zoom = lerp(this.zoom, zt, Math.min(1, dt * 1.6));
      this.cam.x = T.x - sx / this.zoom; this.cam.y = T.y - sy / this.zoom;
    } else this.zoom = zt;
    this.camTo(Math.min(1, dt * 5));

    for (const t of this.trees) if (t.shake > 0) t.shake -= dt * 2;
    for (const b of this.bushes) { if (b.shake > 0) b.shake -= dt * 2; if (b.peek > 0) b.peek -= dt * 0.8; }
    for (const m of this.mushrooms) if (m.squish > 0) m.squish -= dt * 1.6;
    for (const r of this.rocks) if (r.wob > 0) r.wob -= dt * 2;
    for (const d of this.ducks) { d.a += dt * d.sp; if (d.splash > 0) d.splash -= dt * 2; }
    for (const b of this.butterflies) {
      if (b.away > 0) b.away -= dt;
      b.off = lerp(b.off, b.away > 2 ? 1 : 0, Math.min(1, dt * (b.away > 2 ? 3 : 1.2)));
      b.x = b.hx + Math.sin(this.time * 0.9 + b.ph) * 34 + Math.cos(b.dir) * b.off * 460; b.y = b.hy - 34 + Math.sin(this.time * 1.3 + b.ph * 2) * 20 + (Math.sin(b.dir) * 0.6 - 0.6) * b.off * 460;
    }
    if (this.marker && (this.marker.t -= dt) <= 0) this.marker = null;
    if (this.packWig > 0) this.packWig -= dt * 1.5;
    if (this.starPop > 0) this.starPop -= dt * 1.5;
    this.fx.update(dt);

    const g = this.crystalGround;
    if (g && !this.blocked() && dist(T.x, T.y, g.x, g.y) < 44) this.collectCrystal();
    if (g && Math.random() < dt * 5) this.fx.add({ x: g.x + rnd(-22, 22), y: g.y - 16 + rnd(-26, 20), vy: -25, life: 0.8, size: rnd(4, 9), color: '#fff7b0' });
    if (!this.blocked()) { const found = Save.data.stars || []; for (let i = 0; i < this.glitter.length; i++) if (!found.includes(i) && dist(T.x, T.y, this.glitter[i].x, this.glitter[i].y) < 50) { this.collectStar(i); break; } }

    if (this.hint) { this.hint.t -= dt; if (this.hint.t <= 0 || dist(T.x, T.y, this.hint.target.x, this.hint.target.y) < 60) { this.hint = null; this.idle = 0; } }
    else if (!this.blocked() && !this.ev && !T.walk && !this.mapOpen) { this.idle += dt; if (this.idle >= CONFIG.hintDelay) this.showHint(); }
  },

  /* ---- Zeichnen ---- */
  drawBubble(c, x, y, icon, lv, isHint, i, t) {
    const done = lv >= 3, s = (done ? 0.8 : 1) * (isHint ? 1.15 + Math.sin(t * 8) * 0.08 : 1);
    c.save(); c.translate(x, y + Math.sin(t * 3 + i) * 5); c.scale(s, s); c.globalAlpha = done ? 0.85 : 1;
    c.fillStyle = 'rgba(60,40,80,0.15)'; circ(c, 0, 3, 34); c.fill();
    c.beginPath(); c.arc(0, 0, 33, Math.PI * 0.62, Math.PI * 0.38); c.lineTo(0, 46); c.closePath(); fs(c, '#fff', isHint ? '#ffd54a' : '#e8dff5', isHint ? 5 : 3);
    drawThing(c, icon, 0, 0, 40);
    if (lv > 0) for (let k = 0; k < 3; k++) { starPath(c, -20 + k * 20, -46, 9); fs(c, k < lv ? '#ffd54a' : '#fff', k < lv ? '#f0b429' : '#d6cfe6', 2); }   // Stufen-Sterne
    c.restore();
  },
  draw(c) {
    const cam = this.cam, t = this.time, T = this.T, U = this.U, D = this.dragon;
    const z = this.zoom, VWz = this.vw(), VHz = this.vh();
    const inView = (x, y, m) => x > cam.x - m && x < cam.x + VWz + m && y > cam.y - m && y < cam.y + VHz + m + 60;
    c.fillStyle = '#a9e2a2'; c.fillRect(0, 0, VW, VH);
    c.save(); c.scale(z, z); c.translate(-cam.x, -cam.y);
    if (cam.x + VWz > WOOD_W - 80) {   // Himmel mit Wolkeninseln hinter dem Waldrand
      const sg = c.createLinearGradient(0, 0, 0, WORLD.h); sg.addColorStop(0, '#bfe3ff'); sg.addColorStop(0.55, '#dcecff'); sg.addColorStop(1, '#f6e4ff');
      c.fillStyle = sg; c.fillRect(WOOD_W - 30, cam.y - 10, WORLD.w - WOOD_W + 40, VHz + 20);
      for (const p of this.skyPuffs) if (inView(p.x, p.y, 120)) { c.globalAlpha = 0.55; drawPuffCloud(c, p.x + Math.sin(t * 0.3 + p.ph) * 20, p.y, p.s, '#fff', false); c.globalAlpha = 1; }
      c.fillStyle = '#a9e2a2'; for (let y = Math.floor((cam.y - 40) / 40) * 40; y < cam.y + VHz + 40; y += 40) { circ(c, WOOD_W - 30, y, 28 + (y / 40 % 2) * 6); c.fill(); }
      c.strokeStyle = '#86c98a'; c.lineWidth = 4; c.beginPath(); for (let y = Math.floor((cam.y - 40) / 40) * 40; y < cam.y + VHz + 40; y += 40) c.arc(WOOD_W - 30, y, 28 + (y / 40 % 2) * 6, -1.1, 1.1); c.stroke();
      for (const I of ISLES) if (inView(I.x, I.y, I.rx + 60)) drawIsle(c, I, t);
      for (const L of SKY_LINKS) { const A = ISLES[L[0]], B = ISLES[L[1]]; if (!inView((A.x + B.x) / 2, (A.y + B.y) / 2, 700)) continue;   // Brücke von Inselrand zu Inselrand
        const dx = B.x - A.x, dy = B.y - A.y, l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l, edge = I => Math.sqrt(1 / ((ux / I.rx) ** 2 + (uy / I.ry) ** 2)) - 26;
        const ka = edge(A), kb = edge(B); drawSkyBridge(c, { x: A.x + ux * ka, y: A.y + uy * ka }, { x: B.x - ux * kb, y: B.y - uy * kb }, t); }
    }
    // Bodenzonen: Blumenwiese etwas heller, Felsen etwas grauer, Hügel im Norden
    c.fillStyle = 'rgba(255,240,200,0.35)'; rr(c, 60, 2620, 2200, 960, 200); c.fill();
    c.fillStyle = 'rgba(200,200,215,0.35)'; rr(c, 4380, 380, 1150, 3000, 260); c.fill();
    for (const h of this.hills) if (inView(h.x, h.y, 360)) { ell(c, h.x, h.y + 10, h.rx, h.ry); fs(c, 'rgba(110,190,120,0.35)'); ell(c, h.x, h.y, h.rx, h.ry); fs(c, '#bfe9b3'); ell(c, h.x - h.rx * 0.25, h.y - h.ry * 0.3, h.rx * 0.45, h.ry * 0.35); fs(c, 'rgba(255,255,255,0.25)'); }
    for (const p of this.patches) if (inView(p.x, p.y, 200)) { c.fillStyle = p.light ? 'rgba(200,245,180,0.5)' : 'rgba(130,205,140,0.35)'; ell(c, p.x, p.y, p.rx, p.ry); c.fill(); }
    // Wege
    c.lineCap = 'round'; c.lineJoin = 'round';
    for (const pass of [0, 1]) for (const P of PATHS) { c.strokeStyle = pass ? '#f6e8c4' : '#e3d2a4'; c.lineWidth = pass ? 40 : 50; c.beginPath(); c.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length - 1; i++) c.quadraticCurveTo(P[i][0], P[i][1], (P[i][0] + P[i + 1][0]) / 2, (P[i][1] + P[i + 1][1]) / 2); c.lineTo(P[P.length - 1][0], P[P.length - 1][1]); c.stroke(); }
    // Fluss
    const y0 = Math.floor((cam.y - 60) / 20) * 20, y1 = cam.y + VHz + 60;
    if (riverX(cam.y) > cam.x - 200 && riverX(cam.y) < cam.x + VWz + 200 || riverX(cam.y + VHz) > cam.x - 200 && riverX(cam.y + VHz) < cam.x + VWz + 200) {
      for (const s of [['#86c98a', 120], ['#8fd0f0', 104], ['#a9e1fb', 90]]) { c.strokeStyle = s[0]; c.lineWidth = s[1]; c.beginPath(); for (let y = y0; y <= y1; y += 20) c.lineTo(riverX(y), y); c.stroke(); }
      c.strokeStyle = 'rgba(255,255,255,0.65)'; c.lineWidth = 3;
      for (let y = Math.floor((cam.y - 60) / 70) * 70; y < y1; y += 70) { const yy = y + (t * 34) % 70, xx = riverX(yy) + Math.sin(y * 1.7) * 24; c.beginPath(); c.arc(xx, yy, 9, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
    }
    // See und Teich
    for (const L of [LAKE, POND]) if (inView(L.x, L.y, L.rx + 40)) {
      ell(c, L.x, L.y, L.rx, L.ry); fs(c, '#a9e1fb', '#86c98a', 9);
      ell(c, L.x, L.y + L.ry * 0.12, L.rx * 0.8, L.ry * 0.7); fs(c, 'rgba(143,208,240,0.45)');
      c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 3;
      for (let k = 0; k < (L === LAKE ? 6 : 1); k++) { c.beginPath(); c.arc(L.x - L.rx * 0.5 + k * L.rx * 0.2 + 40, L.y - 10 + Math.sin(t + k) * 3 + (k % 2) * 60 - 30, 16, Math.PI * 1.1, Math.PI * 1.7); c.stroke(); }
      const pads = L === LAKE ? [[-380, 60], [-260, -120], [-60, 150], [180, -60], [330, 110], [420, -140], [40, -10], [-200, 30]] : [[-60, 10], [20, 34], [70, -24]];
      pads.forEach((p, i) => { c.fillStyle = '#7ed56f'; c.beginPath(); c.moveTo(L.x + p[0], L.y + p[1]); c.arc(L.x + p[0], L.y + p[1], 20 + (i % 3) * 5, 0.4, TAU - 0.2); c.closePath(); c.fill(); if (i % 3 === 1) { c.fillStyle = '#ff9ecb'; sparklePath(c, L.x + p[0], L.y + p[1], 9); c.fill(); } });
    }
    if (inView(LAKE.x, LAKE.y, LAKE.rx + 40)) for (const d of this.ducks) { const x = LAKE.x + Math.cos(d.a) * LAKE.rx * d.k, y = LAKE.y + Math.sin(d.a) * LAKE.ry * d.k; d.x = x; d.y = y; drawDuck(c, x, y + Math.sin(t * 3 + d.a) * 2, -Math.sin(d.a) < 0, d.splash); }
    // Brücken
    for (const B of BRIDGES) if (inView(B.x, B.y, 200)) {
      const bx = B.x - B.w / 2, by = B.y - B.h / 2;
      c.fillStyle = 'rgba(40,60,80,0.15)'; rr(c, bx + 4, by + 8, B.w, B.h, 10); c.fill();
      rr(c, bx, by, B.w, B.h, 10); fs(c, '#d9a871', '#b98852', 3);
      c.strokeStyle = '#b98852'; c.lineWidth = 2; for (let x = bx + 22; x < bx + B.w - 4; x += 22) line(c, x, by + 4, x, by + B.h - 4);
      rr(c, bx - 6, by - 6, B.w + 12, 13, 6); fs(c, '#c08f5c', '#a3764a', 2); rr(c, bx - 6, by + B.h - 7, B.w + 12, 13, 6); fs(c, '#c08f5c', '#a3764a', 2);
    }
    if (inView(PLAZA.x, PLAZA.y, PLAZA.r + 40)) {   // Dorfplatz mit Brunnen
      circ(c, PLAZA.x, PLAZA.y, PLAZA.r); fs(c, '#ecdcbc', '#d9c49c', 6);
      c.strokeStyle = 'rgba(200,180,140,0.6)'; c.lineWidth = 2; for (let r2 = 40; r2 < PLAZA.r; r2 += 34) { circ(c, PLAZA.x, PLAZA.y, r2); c.stroke(); }
    }
    if (inView(RING.x, RING.y, 160)) { ell(c, RING.x, RING.y, RING.r + 30, RING.r * 0.62 + 22); fs(c, 'rgba(200,245,180,0.7)'); c.fillStyle = 'rgba(255,240,150,' + (0.25 + Math.sin(t * 2) * 0.1) + ')'; ell(c, RING.x, RING.y, RING.r * 0.7, RING.r * 0.4); c.fill(); }
    for (const f of this.flowers) if (inView(f.x, f.y, 20)) drawFlower(c, f);
    if (this.marker) { const m = this.marker, u = 1 - m.t / 0.6; c.strokeStyle = 'rgba(255,255,255,' + (1 - u) + ')'; c.lineWidth = 4; ell(c, m.x, m.y, 10 + u * 22, (10 + u * 22) * 0.5); c.stroke(); }

    // Alles, was steht, nach y sortiert (wer weiter unten steht, verdeckt)
    const items = [], add = (y, f) => items.push({ y, f });
    const ph = this.party ? i => Math.abs(Math.sin(t * 7 + i)) * 18 : () => 0;
    const g = this.crystalGround;
    const hidden = (tr, o) => o.y < tr.y && tr.y - o.y < 135 * tr.s && Math.abs(o.x - tr.x) < 52 * tr.s;
    for (const tr of this.trees) if (inView(tr.x, tr.y, 150)) add(tr.y, () => drawTree(c, tr, t, hidden(tr, T) || (g && hidden(tr, g)) ? 0.4 : 0));
    for (const b of this.bushes) if (inView(b.x, b.y, 60)) add(b.y, () => { drawBush(c, b, t); if (b.dragon) drawDragonTail(c, b.x + 30, b.y - 12, t); });
    for (const m of this.mushrooms) if (inView(m.x, m.y, 40)) add(m.y, () => drawMushroom(c, m));
    for (const r of this.rocks) if (inView(r.x, r.y, 80)) add(r.y, () => drawRock(c, r, t));
    const found = Save.data.stars || [];
    this.glitter.forEach((s, i) => { if (!found.includes(i) && inView(s.x, s.y, 40)) add(s.y, () => drawGlitter(c, s.x, s.y, t + i)); });
    this.questDrawables(c, add, inView, t);
    visibleNpcs().forEach((id, i) => {
      const n = NPCS[id]; if (!inView(n.x, n.y, 200) || this.npcHidden(id)) return;
      add(n.y, () => {
        if (id === 'owl') { c.fillStyle = 'rgba(40,70,50,0.16)'; ell(c, n.x, n.y + 2, 34, 10); c.fill(); rr(c, n.x - 24, n.y - 30, 48, 32, 8); fs(c, '#b98852', '#96693d', 2); ell(c, n.x, n.y - 30, 24, 8); fs(c, '#e5c08e', '#96693d', 2); }
        if (id === 'frog') { c.fillStyle = 'rgba(40,70,50,0.16)'; ell(c, n.x, n.y + 2, 40, 11); c.fill(); ell(c, n.x, n.y - 4, 36, 13); fs(c, '#c9c9d6', '#a8a8b8', 2); }
        if (id === 'fox') drawDen(c, n.x + 86, n.y - 4);
        drawActor(c, n.art, n.x, n.y, { size: n.size, t, lift: n.lift + hopLift(n.hop) + ph(i), happy: n.hop > 0 || this.party, noShadow: n.lift > 0 });
        if (id === 'mole' && Save.data.quests.mole && Save.data.quests.mole.s === 'done') drawGlassesOn(c, n.x, n.y, n.size);
        this.npcBubble(c, id, n.x, n.y - n.size - n.lift - 44, i, t);
      });
    });
    if (inView(DRAGON_HOME.x, DRAGON_HOME.y, 160)) add(DRAGON_HOME.y - 1, () => { c.fillStyle = 'rgba(40,70,50,0.16)'; ell(c, DRAGON_HOME.x, DRAGON_HOME.y + 2, 48, 13); c.fill(); ell(c, DRAGON_HOME.x, DRAGON_HOME.y - 8, 44, 20); fs(c, '#c9c9d6', '#a8a8b8', 2); ell(c, DRAGON_HOME.x - 12, DRAGON_HOME.y - 16, 16, 6); fs(c, 'rgba(255,255,255,0.4)'); });
    if (D.vis && !D.fly && inView(D.x, D.y, 160)) add(D.y, () => {
      const home = D.mode === 'home';
      drawActor(c, 'dragon', D.x, D.y, { size: 78, t, lift: (home ? 20 : 0) + hopLift(D.hop) + ph(5), flip: D.flip, noShadow: home });
      if (Save.data.dragonFriend) this.npcBubble(c, 'dragon', D.x, D.y - 78 - (home ? 20 : 0) - 44, 4, t);
    });
    if (g) add(g.y, () => { c.fillStyle = 'rgba(255,247,160,' + (0.35 + Math.sin(t * 5) * 0.15) + ')'; circ(c, g.x, g.y - 16, 34 + Math.sin(t * 5) * 4); c.fill(); c.fillStyle = 'rgba(40,70,50,0.2)'; ell(c, g.x, g.y + 2, 14, 5); c.fill(); drawCrystal(c, g.x, g.y - 16 - Math.abs(Math.sin(t * 3)) * 5, 18, CRYSTAL_COL[g.who]); });
    if (this.ride) add(T.y + 0.1, () => {
      drawActor(c, 'unicorn', T.x + 6 * T.face, T.y, { size: 92, t, walk: T.walk || this.flyLift > 0, flip: T.face < 0, lift: hopLift(U.hop, 30) + ph(3) + (this.flyLift || 0), mark: uniMark(), glow: !!this.hint });
      drawActor(c, 't', T.x - 4 * T.face, T.y, { size: 74, t, sit: true, flip: T.face < 0, noShadow: true, lift: 36 + hopLift(U.hop, 30) + hopLift(T.hop, 12) + (T.walk ? Math.abs(Math.sin(t * 13)) * 4 : 0) + ph(4) + (this.flyLift || 0) });
    });
    else {
      add(U.y, () => drawActor(c, 'unicorn', U.x, U.y, { size: 88, t, walk: U.walk, flip: U.face < 0, lift: hopLift(U.hop, 34) + ph(3), mark: uniMark(), glow: !!this.hint }));
      add(T.y + 0.1, () => drawActor(c, 't', T.x, T.y, { size: 84, t, walk: T.walk, flip: T.face < 0, lift: hopLift(T.hop) + ph(4) }));
    }
    // Hecke mit Lücke für das Pilztor (und für den Fluss)
    if (cam.y + VHz > HEDGE_Y - 80 && cam.y < HEDGE_Y + 80) add(HEDGE_Y + 14, () => {
      const rx = riverX(HEDGE_Y);
      for (let x = Math.floor((cam.x - 60) / 44) * 44; x < Math.min(cam.x + VWz + 60, WOOD_W - 40); x += 44) {
        if (Math.abs(x - GATE.x) < 96 || Math.abs(x - rx) < 70) continue;
        const k = (x / 44) % 2 ? 1 : 0;
        c.fillStyle = '#4fa766'; circ(c, x, HEDGE_Y - 8 + k * 6, 30); c.fill(); c.fillStyle = '#5fb873'; circ(c, x + 10, HEDGE_Y - 24 + k * 6, 22); c.fill(); c.fillStyle = '#74c985'; circ(c, x - 6, HEDGE_Y - 32 + k * 6, 13); c.fill();
      }
    });
    if (inView(ALTAR.x, ALTAR.y - 200, 420)) {
      add(ALTAR.y - 60, () => { if (Save.data.story >= 9) drawBigRainbow(c, ALTAR.x, ALTAR.y - 60, 330, 1); drawMountain(c, ALTAR.x, ALTAR.y - 70, t); });
      add(ALTAR.y, () => drawAltar(c, ALTAR.x, ALTAR.y, t, Save.data.story >= 9));
    }
    for (const P of [SKY_PAD, LAND_PAD]) if (inView(P.x, P.y, 120)) add(P.y, () => drawSkyPad(c, P.x, P.y, t, !!Save.data.wings));
    const lit = Save.data.story >= 5, mq = this.qs('mouse');
    for (const h of HOUSES) if (inView(h.x, h.y - h.r, h.r * 2.4)) add(h.y, () => drawShroomHouse(c, Object.assign(h, { lit }), t));
    LANTERNS.forEach((l, i) => { if (inView(l[0], l[1], 60)) add(l[1], () => drawLantern(c, l[0], l[1], lit || (mq && (mq.s === 'done' || (mq.items && mq.items[i].got))), t)); });
    const hq = this.qs('hedgehog');
    CAKE_SPOTS.forEach((q, i) => { if (q[2] === 'berry' && inView(q[0], q[1], 50)) add(q[1], () => drawBerryBush(c, q[0], q[1], !(hq && (hq.s === 'done' || (hq.items && hq.items[i].got))), t)); });
    items.sort((a, b) => a.y - b.y); for (const it of items) it.f();
    if (!lit && cam.y + VHz > HEDGE_Y) {   // Abendstimmung im Pilzdorf, bis Kapitel 2 geschafft ist
      c.fillStyle = 'rgba(40,30,100,0.28)'; c.fillRect(cam.x - 10, HEDGE_Y + 30, VWz + 20, WORLD.h);
      c.save(); c.globalCompositeOperation = 'lighter';
      LANTERNS.forEach((l, i) => { if (mq && (mq.s === 'done' || (mq.items && mq.items[i].got)) && inView(l[0], l[1], 120)) { c.fillStyle = 'rgba(255,220,120,0.16)'; circ(c, l[0], l[1] - 40, 110); c.fill(); circ(c, l[0], l[1] - 45, 55); c.fill(); } });
      c.restore();
    }

    // Hinweis: Sternenspur von T zum Ziel
    if (this.hint) {
      let px = T.x, py = T.y, acc = 34, n = 0;
      for (const q of this.hint.path) { const d = dist(px, py, q.x, q.y); while (acc < d && n < 30) { const k = acc / d, tw = Math.max(0, Math.sin(t * 5 - n * 0.6)); starPath(c, lerp(px, q.x, k), lerp(py, q.y, k) - tw * 6, 9 + tw * 6); fs(c, '#ffe066', '#fff', 2.5); acc += 50; n++; } acc -= d; px = q.x; py = q.y; }
    }
    for (const b of this.butterflies) if (inView(b.x, b.y, 30)) drawSmallButterfly(c, b.x, b.y, t + b.ph, b.col);
    if (this.ev && this.ev.draw) this.ev.draw(c);
    if (D.vis && D.fly) { drawActor(c, 'dragon', D.x, D.y, { size: 78 * (D.sc || 1), t, fly: true, flip: D.flip, noShadow: true }); if (D.carry) drawCrystal(c, D.x, D.y + 8, 16, CRYSTAL_COL[D.carry]); }
    this.fx.draw(c);
    c.restore();

    // Pfeil am Bildschirmrand, wenn das Hinweis-Ziel nicht zu sehen ist
    if (this.hint) {
      const hx = (this.hint.target.x - cam.x) * z, hy = (this.hint.target.y - cam.y) * z;
      if (hx < 30 || hx > VW - 30 || hy < 30 || hy > VH - 30) {
        const ax = clamp(hx, 70, VW - 70), ay = clamp(hy, 150, VH - 70), a = Math.atan2(hy - ay, hx - ax), b = Math.sin(t * 7) * 8;
        c.save(); c.translate(ax + Math.cos(a) * b, ay + Math.sin(a) * b); circ(c, 0, 0, 30); fs(c, '#ffd54a', '#fff', 4); c.rotate(a); drawIcon(c, 'right', 0, 0, 34); c.restore();
      }
    }
    if (this.ev && this.ev.drawScreen) this.ev.drawScreen(c);
    if (this.banner) {   // Gebietsname beim Betreten (nur zur Freude, nicht zum Spielen nötig)
      const b = this.banner, a = clamp(Math.min(b.t / 0.4, (3 - b.t) / 0.6), 0, 1), B = { dorf: ['Pilzdorf', '#ff6b6b', 'shroom'], wald: ['Zauberwald', '#5fbf57', 'BAUM'], wolken: ['Wolkeninseln', '#7db8ff', 'cloud'], berg: ['Drachenberg', '#a98bff', 'dragon'] }[b.name];
      c.save(); c.globalAlpha = a; c.font = '800 34px system-ui, sans-serif'; const w = c.measureText(B[0]).width + 110;
      rr(c, VW / 2 - w / 2, 22, w, 64, 32); fs(c, 'rgba(255,255,255,0.9)', B[1], 4);
      drawThing(c, B[2], VW / 2 - w / 2 + 38, 54, 40);
      c.fillStyle = '#5a4a7a'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(B[0], VW / 2 + 22, 56); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      c.restore();
    }
    // Anzeige: Rucksack mit Kristallen, Glitzersterne, Einhorn-Hilfeknopf, Karte
    const H = this.hud(), s0 = this.slotScreen(npcOrder()[0]);
    rr(c, s0.x - 30, H.pack.y - 27, H.pack.x - s0.x + 30, 54, 27); fs(c, 'rgba(255,255,255,0.75)');
    for (const id of npcOrder()) { const s = this.slotScreen(id); const pl = this.packLv(id); if (pl > 0) { if (pl >= 3) { c.fillStyle = 'rgba(255,213,74,' + (0.5 + Math.sin(t * 4) * 0.2) + ')'; circ(c, s.x, s.y, 24); c.fill(); } drawCrystal(c, s.x, s.y, 10 + pl * 4, CRYSTAL_COL[id]); } else { c.setLineDash([5, 5]); circ(c, s.x, s.y, 15); c.strokeStyle = 'rgba(150,130,180,0.6)'; c.lineWidth = 2.5; c.stroke(); c.setLineDash([]); } }
    c.save(); c.translate(H.pack.x, H.pack.y); c.rotate(this.packWig > 0 ? Math.sin(this.packWig * 22) * 0.2 * this.packWig : 0);
    circ(c, 0, 0, H.pack.r); fs(c, '#fff7ea', '#fff', 4); drawBackpack(c, 0, 4, H.pack.r * 1.05);
    if (Save.data.celebrated) { c.fillStyle = '#ffd54a'; sparklePath(c, H.pack.r * 0.6, -H.pack.r * 0.6, 9 + Math.sin(t * 5) * 3); c.fill(); }
    c.restore();
    const sy = H.pack.y + H.pack.r + 26, sx = H.pack.x + H.pack.r - 92, sp = 1 + Math.sin(clamp(this.starPop, 0, 1) * Math.PI) * 0.3;
    rr(c, sx, sy - 20, 92, 40, 20); fs(c, 'rgba(255,255,255,0.75)');
    c.save(); c.translate(sx + 22, sy); c.scale(sp, sp); starPath(c, 0, 0, 15); fs(c, '#ffe066', '#f0b429', 2.5); c.restore();
    c.fillStyle = '#7a5cc9'; c.font = '800 22px system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(Save.data.wallet || 0), sx + 62, sy + 1); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    drawRoundBtn(c, H.hint.x, H.hint.y, H.hint.r, { color: '#fff7ea', glow: !!this.hint });
    c.save(); circ(c, H.hint.x, H.hint.y, H.hint.r - 3); c.clip(); drawActor(c, 'unicorn', H.hint.x - 10, H.hint.y + H.hint.r * 0.78, { size: H.hint.r * 1.35, t: 1, noShadow: true, mark: uniMark() }); c.restore();
    drawRoundBtn(c, H.map.x, H.map.y, H.map.r, { color: '#fff7ea', icon: 'map', iconScale: 1.1 });
    const M = H.menu; c.globalAlpha = 0.6; c.fillStyle = '#fff'; circ(c, M.x, M.y, M.r); c.fill(); c.fillStyle = '#7a8a9a'; for (let i = 0; i < 3; i++) { circ(c, M.x - 10 + i * 10, M.y, 3); c.fill(); } c.globalAlpha = 1;
    if (this.menuHold != null) { c.strokeStyle = '#ff8fb1'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.arc(M.x, M.y, M.r + 6, -Math.PI / 2, -Math.PI / 2 + TAU * this.menuT / 1.5); c.stroke(); }
    if (this.mapOpen) this.drawMap(c, t);
    else this.drawQuestHud(c, t);
    if (this.overlay) this.drawOverlay(c, t);
    if (this.dlg) this.drawDialog(c, t);
  },
  mapRect() { const m = Math.min((VW - 170) / WORLD.w, (VH - 50) / WORLD.h), w = WORLD.w * m, h = WORLD.h * m; return { x: (VW - w) / 2 - 30, y: (VH - h) / 2, w, h, m }; },
  mapClose() { const r = Math.max(View.btn / 2 - 4, 46); return { x: VW - 16 - r, y: 16 + r, r }; },
  drawMap(c, t) {
    const M = this.mapRect();
    c.fillStyle = 'rgba(40,40,70,0.55)'; c.fillRect(0, 0, VW, VH);
    rr(c, M.x - 12, M.y - 12, M.w + 24, M.h + 24, 22); fs(c, '#fff3d6', '#d9b98a', 5);
    c.save(); rr(c, M.x, M.y, M.w, M.h, 14); c.clip(); c.drawImage(this.minimap, M.x, M.y, M.w, M.h); c.restore();
    const P = (x, y) => [M.x + x * M.m, M.y + y * M.m];
    if (Save.data.tools && Save.data.tools.compass) this.glitter.forEach((s, i) => { if ((Save.data.stars || []).includes(i)) return; const [x, y] = P(s.x, s.y); starPath(c, x, y, 7 + Math.sin(t * 5 + i) * 1.5); fs(c, '#ffe066', '#fff', 1.5); });   // Glitzer-Kompass
    { const [gx, gy] = P(GATE.x, GATE.y); drawThing(c, 'gate', gx, gy - 6, 30); }
    for (const Q of [SKY_PAD, LAND_PAD]) { const [px, py] = P(Q.x, Q.y); drawThing(c, 'wings', px, py - 8, 26); }
    { const [ax, ay] = P(ALTAR.x, ALTAR.y); drawCrystal(c, ax, ay - 12, 10, Save.data.story >= 9 ? '#ffd23f' : '#c9c0e6'); }
    visibleNpcs().forEach((id, i) => { const [x, y] = P(NPCS[id].x, NPCS[id].y); c.save(); c.translate(x, y - 18); c.scale(0.62, 0.62); this.npcBubble(c, id, 0, 0, i, t, true); c.restore(); });
    const D = this.dragon;
    if (D.vis) { const [x, y] = P(D.x, D.y); drawActor(c, 'dragon', x, y + 6, { size: 34, t, noShadow: true, flip: true }); }
    if (this.crystalGround) { const [x, y] = P(this.crystalGround.x, this.crystalGround.y); drawCrystal(c, x, y - 6, 9 + Math.sin(t * 6) * 2, CRYSTAL_COL[this.crystalGround.who]); }
    const [tx, ty] = P(this.T.x, this.T.y), pul = 1 + Math.sin(t * 5) * 0.12;
    c.fillStyle = 'rgba(255,143,177,0.45)'; circ(c, tx, ty - 14, 24 * pul); c.fill();
    drawActor(c, 't', tx, ty + 6, { size: 40, t, noShadow: true });
    const X = this.mapClose(); drawRoundBtn(c, X.x, X.y, X.r, { color: '#9ecbff', icon: 'x', iconScale: 0.8 });
  },

  /* ---- Eingabe ---- */
  down(p) {
    const H = this.hud();
    if (this.overlay) { this.overlayDown(p); return; }
    if (this.dlg) { this.dialogDown(p); return; }
    if (this.mapOpen) {
      const X = this.mapClose(), M = this.mapRect();
      if (hit(p, X.x, X.y, X.r + 8)) { this.mapOpen = false; Sfx.play('tap'); return; }
      if (p.x > M.x && p.x < M.x + M.w && p.y > M.y && p.y < M.y + M.h) {
        const wx = (p.x - M.x) / M.m, wy = (p.y - M.y) / M.m; this.mapOpen = false; Sfx.play('pop');
        if (!this.ride) this.mount();
        this.walkTo(wx, wy); this.idle = 0;
      }
      return;
    }
    if (!this.mapOpen && hit(p, H.menu.x, H.menu.y, H.menu.r + 14)) { this.menuHold = p.id; this.menuT = 0; return; }
    if (hit(p, H.pack.x, H.pack.y, H.pack.r + 6)) { this.packWig = 1; if (this.blocked()) { Sfx.play('tap'); return; } this.openPack(); return; }
    if (!this.blocked() && this.questHudDown(p)) return;
    if (this.blocked()) return;
    this.idle = 0;
    if (hit(p, H.hint.x, H.hint.y, H.hint.r + 6)) { this.showHint(); return; }
    if (hit(p, H.map.x, H.map.y, H.map.r + 6)) { this.mapOpen = true; this.T.path = null; Sfx.play('pop'); Voice.say('map_open'); return; }
    const w0 = this.toWorld(p), x = w0.x, y = w0.y, T = this.T, U = this.U, t = this.time, D = this.dragon;
    this.dragTap = false;
    const g = this.crystalGround; if (g && dist(x, y, g.x, g.y - 16) < 62) { Sfx.play('tap'); this.walkTo(g.x, g.y); return; }
    for (const id of visibleNpcs()) { const n = NPCS[id]; if (this.npcHidden(id)) continue; if (dist(x, y, n.x, n.y - n.size * 0.45 - n.lift) < Math.max(60, n.size * 0.75) || dist(x, y, n.x, n.y - n.size - n.lift - 44) < 48) { n.hop = 1; Sfx.play('tap'); const s = this.npcSpot(n); this.walkTo(s.x, s.y, () => this.talkTo(id)); return; } }
    if (D.vis && !D.fly) {
      const lift = D.mode === 'home' ? 20 : 0;
      if (dist(x, y, D.x, D.y - 50 - lift) < 66 || (Save.data.dragonFriend && dist(x, y, D.x, D.y - 78 - lift - 44) < 48)) {
        D.hop = 1; Sfx.play('giggle'); this.fx.burst(D.x - 30, D.y - 80, 6, { shape: 'heart', color: '#ff8fb1', g: -60, sp1: 80 });
        if (this.dragonReady()) { if (this.prank && this.prank.kind === 'visit') this.prank.stay = true; const s = this.dragonSpot(); this.walkTo(s.x, s.y, () => this.talkTo('dragon')); }
        else Voice.say('dragon_tap', { pitch: 1.7 });
        return;
      }
    }
    for (const b of this.bushes) if (b.dragon && dist(x, y, b.x, b.y - 18) < 70) { this.prank.found = true; Sfx.play('giggle'); return; }
    if (this.ride && dist(x, y, T.x, T.y - 55) < 66) { this.dismount(); return; }
    if (!this.ride && dist(x, y, U.x, U.y - 45) < 56) { if (dist(T.x, T.y, U.x, U.y) < 240) { this.mount(); } else { U.hop = 1; Sfx.play('hop'); Voice.say('uni_tap'); } return; }
    if (!this.ride && dist(x, y, T.x, T.y - 45) < 44) { T.hop = 1; Sfx.play('hop'); return; }
    for (const s of this.glitter) if (dist(x, y, s.x, s.y - 20) < 50) { Sfx.play('star'); this.walkTo(s.x, s.y); return; }
    for (const b of this.butterflies) if (b.away <= 0 && dist(x, y, b.x, b.y) < 52) { b.away = 7; b.dir = rnd(TAU); Sfx.play('flutter'); this.fx.burst(b.x, b.y, 6, { g: 40, sp1: 90, s1: 8 }); return; }
    for (const d of this.ducks) if (d.x != null && dist(x, y, d.x, d.y - 10) < 46) { d.splash = 1; Sfx.play('quak'); this.fx.burst(d.x, d.y, 10, { shape: 'dot', color: '#e6f7ff', g: 300, up: 80, sp1: 110, s1: 8 }); return; }
    if (this.questTap(x, y)) return;
    for (const m of this.mushrooms) if (dist(x, y, m.x, m.y - 12) < 44) {
      m.squish = 1;
      if (m.note) { Sfx.play('note', m.note); this.fx.add({ x: m.x, y: m.y - 40, vy: -60, g: 0, life: 1, size: 14, color: m.col, shape: 'heart' }); }
      else { Sfx.play('squeak'); this.fx.burst(m.x, m.y - 26, 7, { shape: 'dot', color: '#fff', g: -30, sp1: 70, s1: 7 }); }
      return;
    }
    for (const r of this.rocks) if (dist(x, y, r.x, r.y - r.r * 0.45) < r.r + 8) { r.wob = 1; Sfx.play('land'); this.fx.burst(r.x, r.y - r.r, 5, { shape: 'dot', color: '#d8d8e4', g: 200, sp1: 80, s1: 6 }); return; }
    for (const b of this.bushes) if (dist(x, y, b.x, b.y - 18) < 48) { b.shake = 1; b.peek = 1; Sfx.play('rustle'); this.fx.burst(b.x, b.y - 24, 8, { shape: 'dot', color: '#74c985', g: 260, sp1: 120, s1: 8 }); return; }
    for (const tr of this.trees) if (dist(x, y, tr.x, tr.y - 80 * tr.s) < 42 * tr.s) { tr.shake = 1; Sfx.play('rustle'); this.fx.burst(tr.x, tr.y - 80 * tr.s, 9, { shape: 'dot', color: tr.kind === 1 ? '#f7a8c8' : '#84d48f', g: 220, sp1: 100, s1: 9 }); break; }
    if (Math.abs(x - riverX(y)) < 46 && !onBridge(x, y) || inEll(x, y, LAKE, 0) || inEll(x, y, POND, 0)) { Sfx.play('plop'); this.fx.burst(x, y, 8, { shape: 'dot', color: '#e6f7ff', g: 300, up: 80, sp1: 110, s1: 8 }); }
    this.dragTap = true; this.lastPathT = t; this.walkTo(x, y);
  },
  move(p) {
    // Finger gedrückt halten und ziehen: T läuft dem Finger nach
    if (this.mapOpen || !this.dragTap || this.blocked() || this.time - this.lastPathT < 0.22 || dist(p.x, p.y, p.sx, p.sy) < 30) return;
    this.lastPathT = this.time; this.idle = 0; const w0 = this.toWorld(p); this.walkTo(w0.x, w0.y);
  },
  up(p) { this.dragTap = false; if (p && this.menuHold === p.id) this.menuHold = null; },
  key(k) {
    if (k === 'KeyM') { this.mapOpen = !this.mapOpen; return; }
    if (this.blocked() || this.mapOpen) return;
    if (k === 'KeyR') { this.ride ? this.dismount() : this.mount(); return; }
    if (k !== 'Space' && k !== 'Enter') return;
    let best = null, bd = 150; for (const id of visibleNpcs()) { const d = dist(this.T.x, this.T.y, NPCS[id].x, NPCS[id].y); if (d < bd) { bd = d; best = id; } }
    if (best) { const s = this.npcSpot(NPCS[best]); this.walkTo(s.x, s.y, () => this.talkTo(best)); }
    else if (this.dragonReady() && dist(this.T.x, this.T.y, this.dragon.x, this.dragon.y) < 170) this.talkTo('dragon');
  }
};
