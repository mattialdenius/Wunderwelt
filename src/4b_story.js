
/* ============ 5b. GESCHICHTE, GESPRÄCHE, AUFTRÄGE, RUCKSACK, LADEN ============
   Alles hier hängt sich an World an. Neue Aufträge = neuer Eintrag in QUESTS (+ Sprachtexte q_<id>_offer/_remind/_done).
   Ein Gespräch ist eine Liste von Zeilen: [wer spricht, Sprachtext-Schlüssel, Bilder in der Blase, { vars, choice }]. */
const NPC_PITCH = { owl: 1.0, fox: 1.1, frog: 1.2, dragon: 1.7, snail: 1.25, squirrel: 1.45, duck: 1.3, bee: 1.6, bear: 0.75, mole: 0.95, bunny: 1.5, uni: 1.3, mouse: 1.4, hedgehog: 1.3, sheep: 1.15, bird: 1.65, puff: 1.55 };
const COS = { acorn: 't', crown: 't', shroomhat: 't', cloudhat: 't', flowers: 'uni', bow: 'uni', stars: 'uni' };          // Schmuck: für T oder fürs Einhorn
const SHOP = [{ id: 'feather', price: 3 }, { id: 'lens', price: 3 }, { id: 'lily', price: 3 }, { id: 'slow', price: 3 }, { id: 'eye', price: 3 }, { id: 'bow', price: 5, cos: true }, { id: 'crown', price: 8, cos: true }];
const COLOR_WORD = { r: 'rote', y: 'gelbe', b: 'blaue' };
const SPLITTERS_WALD = ['owl', 'fox', 'frog', 'dragon'];                       // Splitter aus Kapitel 1
const SPLITTERS = SPLITTERS_WALD.concat(['mouse', 'hedgehog', 'sheep', 'bird']);                 // alle bisher erreichbaren Splitter (8 insgesamt geplant)
const ALBUM = ['owl', 'fox', 'frog', 'dragon', 'snail', 'squirrel', 'duck', 'bee', 'bear', 'mole', 'bunny', 'mouse', 'hedgehog', 'sheep', 'bird', 'puff'];
const ITEM_VOICE = { chick: 'q_duck_item', nut: 'q_nut_found', lamp: 'q_lamp_item', berry: 'q_cake_item', shroom: 'q_cake_item', lamb: 'q_lamb_item', drop: 'q_drop_item' };
// Nebenaufgaben. bushes = Nummern in QUEST_BUSHES; reward: helper/n, item, tool, cos, shop. Jede erledigte Aufgabe gibt zusätzlich 2 Glitzersterne.
const QUESTS = {
  duck:     { type: 'collect', item: 'chick', n: 3, spots: [[2290, 2400], [1960, 2330], [2880, 2760]], follow: true, reward: { helper: 'lily', n: 2 }, show: ['chick', 'chick', 'chick'] },
  bee:      { type: 'sequence', reward: { item: 'honey' } },
  bear:     { type: 'deliver', item: 'honey', reward: { helper: 'feather', n: 3 }, show: ['honey'] },
  mole:     { type: 'collect', item: 'glasses', n: 1, hide: 'bush', bushes: [3, 4, 5], reward: { tool: 'compass' }, show: ['glasses', 'bush'] },
  bunny:    { type: 'collect', item: 'hoppel', n: 3, hide: 'bush', bushes: [0, 1, 2], seq: true, reward: { cos: 'flowers' }, show: ['bunny', 'bush'] },
  snail:    { type: 'errand', to: 'fox', give: 'letter', back: 'answer', needLv: 1, learn: true, reward: { helper: 'lens', n: 2 }, show: ['letter', 'fox'] },
  squirrel: { type: 'collect', item: 'nut', n: 6, hide: 'tree', needLv: 1, learn: true, reward: { cos: 'acorn', shop: true }, show: ['nut', 'BAUM'] },
  mouse:    { type: 'collect', item: 'lamp', n: 5, spots: LANTERNS.map(l => [l[0], l[1] + 26, 'lamp']), needLv: 1, reward: { cos: 'shroomhat' }, show: ['lantern'] },
  hedgehog: { type: 'collect', item: 'mix', n: 6, spots: CAKE_SPOTS.map(q => [q[0], q[1] + (q[2] === 'berry' ? 30 : 0), q[2]]), needLv: 1, reward: { helper: 'eye', n: 2 }, show: ['berry', 'shroom'] },
  sheep:    { type: 'collect', item: 'lamb', n: 3, spots: LAMB_SPOTS, needLv: 1, reward: { cos: 'cloudhat' }, show: ['lamb'] },
  puff:     { type: 'collect', item: 'drop', n: 5, spots: DROP_SPOTS, reward: { cos: 'stars' }, show: ['drop'] }
};
const questBush = i => World.bushes[2 + i];                                    // die festen Auftrags-Büsche stehen nach den zwei ersten Büschen

Object.assign(World, {
  qs(id) { return Save.data.quests[id]; },
  questAvail(id) { const q = QUESTS[id]; if (!q) return false; if (q.learn && !Save.data.learn) return false; if (q.needLv && (Save.data.level[id] || 0) < q.needLv) return false; return true; },
  activeQuests() { return Object.keys(QUESTS).filter(id => { const s = this.qs(id); return s && s.s === 'active' && (!QUESTS[id].learn || Save.data.learn); }); },
  questReady(id) {
    const q = QUESTS[id], s = this.qs(id), inv = Save.data.inv; if (!s || s.s !== 'active') return false;
    if (q.type === 'collect') return s.n >= q.n;
    if (q.type === 'sequence') return s.idx >= 3;
    if (q.type === 'deliver') return (inv[q.item] || 0) > 0;
    return (inv[q.back] || 0) > 0;
  },
  npcHidden(id) { return id === 'bunny' && this.qs('bunny') && this.qs('bunny').s === 'active' && !this.questReady('bunny'); },   // Hoppel versteckt sich gerade

  /* ---- Geschichte ---- */
  storyStep() {
    const S = Save.data;
    if (S.story === 0) return { npc: 'owl', lines: [['owl', 'story_owl1', ['rainbow']], ['owl', 'story_owl2', ['splitter', 'splitter', 'splitter']], ['owl', 'story_owl3', ['owl', 'fox', 'frog', 'dragon']]],
      after: () => { S.story = 1; Save.store(); this.startNpc('owl'); } };
    if (S.story === 1 && S.dragonFriend && this.dragonReady()) return { npc: 'dragon', lines: [['dragon', 'story_funki1', ['heart']], ['dragon', 'story_funki2', ['rainbow', 'splitter']], ['dragon', 'story_funki3', ['heart', 'dragon']]],
      after: () => { S.story = 2; Save.store(); this.startNpc('dragon'); } };
    if (S.story === 2 && SPLITTERS_WALD.every(id => S.crystals[id])) return { npc: 'owl', lines: [['owl', 'story_owl4', ['rainbow', 'splitter']], ['owl', 'story_owl5', ['gate']]],
      after: () => { S.story = 3; Save.store(); this.setGate(true); Sfx.play('fanfare'); ScreenFx.confetti(VW, 60); this.fx.burst(GATE.x, GATE.y - 60, 30, { g: 60 }); this.hint = { t: 10, target: { x: GATE.x, y: GATE.y + 40, gate: true }, path: this.findPath(this.T.x, this.T.y, GATE.x, GATE.y + 40) || [{ x: GATE.x, y: GATE.y + 40 }] }; } };
    if (S.story === 3) return { npc: 'mouse', lines: [['mouse', 'story_mia1', ['mouse', 'shroom']], ['mouse', 'story_mia2', ['lantern', 'rainbow']], ['mouse', 'story_mia3', ['splitter', 'mouse', 'hedgehog']]],
      after: () => { S.story = 4; Save.store(); this.startNpc('mouse'); } };
    if (S.story === 4 && S.crystals.mouse && S.crystals.hedgehog) return { npc: 'mouse', lines: [['mouse', 'story_mia4', ['rainbow', 'lantern']], ['mouse', 'story_mia5', ['unicorn', 'wings']], ['uni', 'story_uni_wings', ['wings', 'cloud']]],
      after: () => { S.story = 5; S.wings = true; Save.store(); Sfx.play('fanfare'); ScreenFx.confetti(VW, 70); this.U.hop = 1; delete SIL.unicorn; this.fx.burst(this.U.x, this.U.y - 60, 30, { g: 40 }); } };
    if (S.story === 5) return { npc: 'sheep', lines: [['sheep', 'story_wolli1', ['sheep', 'cloud']], ['sheep', 'story_wolli2', ['splitter', 'sheep', 'bird']], ['sheep', 'story_wolli3', ['size']]],
      after: () => { S.story = 6; Save.store(); this.startNpc('sheep'); } };
    if (S.story === 6 && S.crystals.sheep && S.crystals.bird) return { npc: 'bird', lines: [['bird', 'story_stella1', ['rainbow', 'note']], ['bird', 'story_stella2', ['splitter', 'dragon']]],
      after: () => { S.story = 7; Save.store(); Sfx.play('fanfare'); ScreenFx.confetti(VW, 90); this.U.hop = 1; } };
    if (S.story === 7) return { npc: 'dragon', lines: [['dragon', 'story_funki4', ['splitter', 'dragon', 'gem']]],
      after: () => { S.story = 8; Save.store(); this.queue.push(() => this.evDragonToAltar()); } };
    if (S.story === 8 && this.dragon && this.dragon.mode === 'visit' && dist(this.dragon.x, this.dragon.y, ALTAR.x, ALTAR.y) < 200) return { npc: 'dragon', lines: [['dragon', 'story_funki5', ['gem', 'rainbow']], ['dragon', 'story_funki6', ['splitter', 'heart']]],
      after: () => { Save.data.pos = { x: ALTAR.x, y: ALTAR.y + 90 }; Game.go(FinaleScene, {}); } };
    return null;
  },
  storyQuestTarget() {
    const st = this.storyStep();
    if (st) { const s = st.npc === 'dragon' ? this.dragonSpot() : this.npcSpot(NPCS[st.npc]); return { x: s.x, y: s.y, npc: st.npc, story: true }; }
    const act = this.activeQuests().sort((a, b) => this.questReady(b) - this.questReady(a));
    for (const id of act) { const tg = this.questTarget(id); if (tg) return tg; }
    return null;
  },
  questTarget(id) {
    const q = QUESTS[id], s = this.qs(id), S = Save.data, giver = () => { const p = this.npcSpot(NPCS[id]); return { x: p.x, y: p.y, npc: id, quest: id }; };
    if (this.questReady(id)) return giver();
    if (q.type === 'collect') {
      if (q.seq) { const b = this.bushes[s.cur]; return b ? { x: b.x, y: b.y + 40, quest: id } : null; }
      let best = null, bd = 1e9;
      for (const it of s.items) { if (it.got) continue; const p = this.itemPos(it); const d = dist(p.x, p.y, this.T.x, this.T.y); if (d < bd) { bd = d; best = p; } }
      return best ? { x: best.x, y: best.y + (best.hidden ? 40 : 0), quest: id } : giver();
    }
    if (q.type === 'sequence') { const f = BEE_FLOWERS.find(f => f.c === s.order[s.idx]); return { x: f.x, y: f.y + 30, quest: id }; }
    if (q.type === 'deliver') { const p = this.npcSpot(NPCS.bee); return { x: p.x, y: p.y, npc: 'bee', quest: id }; }
    if (q.type === 'errand' && S.inv[q.give]) { const p = this.npcSpot(NPCS[q.to]); return { x: p.x, y: p.y, npc: q.to, quest: id }; }
    return giver();
  },
  itemPos(it) {
    if (it.shown) return { x: it.x, y: it.y };
    if (it.tree != null) { const tr = this.trees[it.tree]; return { x: tr.x, y: tr.y, hidden: true }; }
    if (it.bush != null) { const b = this.bushes[it.bush]; return { x: b.x, y: b.y, hidden: true }; }
    return { x: it.x, y: it.y };
  },

  /* ---- Gespräche ---- */
  say(lines, done) { this.dlg = { lines, i: 0, t: 0, done, heard: false }; this.T.path = null; this.T.onArrive = null; this.startLine(); },
  startLine() {
    const d = this.dlg, L = d.lines[d.i], o = L[3] || {}; d.t = 0; d.heard = false;
    const e = SPEECH[L[1]], txt = e ? (Array.isArray(e.text) ? e.text[0] : e.text) : '';
    d.est = clamp(txt.length * 0.065 + 1.2, 2.2, 10);
    Voice.say(L[1], { vars: o.vars, pitch: NPC_PITCH[L[0]] || 1.15 });
    const sp = this.speakerPos(L[0]); if (sp && sp.n) sp.n.hop = 1;
  },
  nextLine() {
    const d = this.dlg; if (!d) return;
    d.i++;
    if (d.i >= d.lines.length) { this.dlg = null; this.idle = 0; if (d.done) d.done(); return; }
    this.startLine();
  },
  updateDialog(dt) {
    const d = this.dlg, L = d.lines[d.i]; d.t += dt;
    if ((L[3] || {}).choice) return;                                          // wartet auf eine Auswahl
    const busy = Voice.busy(); if (busy) d.heard = true;
    if (d.t > d.est * 1.4 || (d.heard && !busy && d.t > 1.0) || (!d.heard && d.t > d.est)) this.nextLine();
  },
  speakerPos(who) {
    if (who === 'dragon') { const D = this.dragon; return { x: D.x, y: D.y - 78 - (D.mode === 'home' ? 20 : 0), n: D }; }
    if (who === 'uni') return { x: this.U.x, y: this.U.y - 90, n: this.U };
    const n = NPCS[who]; return n ? { x: n.x, y: n.y - n.size - n.lift, n } : { x: this.T.x, y: this.T.y - 90 };
  },
  dlgLayout() {
    const d = this.dlg, L = d.lines[d.i], icons = L[2] || [], sp = this.speakerPos(L[0]), z = this.zoom;
    const sx = (sp.x - this.cam.x) * z, sy = (sp.y - this.cam.y) * z, w = Math.max(150, icons.length * 70 + 40), h = 96;
    const above = sy > 190, bx = clamp(sx, w / 2 + 12, VW - w / 2 - 12), by = above ? sy - 24 - h / 2 : sy + 120 + h / 2;
    const ch = (L[3] || {}).choice, r = Math.max(View.btn / 2, 48);
    return { L, icons, sx, sy, w, h, bx, by, above, choice: ch ? ch.map((c, k) => ({ x: bx + (k - (ch.length - 1) / 2) * (r * 2 + 30), y: clamp(by + h / 2 + r + 18, r + 10, VH - r - 10), r, c })) : null };
  },
  drawDialog(c, t) {
    const d = this.dlg, D = this.dlgLayout(), k = easeOut(d.t / 0.25);
    c.save(); c.globalAlpha = k;
    c.fillStyle = 'rgba(60,40,80,0.15)'; rr(c, D.bx - D.w / 2 + 3, D.by - D.h / 2 + 5, D.w, D.h, 26); c.fill();
    c.beginPath(); const tx = clamp(D.sx, D.bx - D.w / 2 + 30, D.bx + D.w / 2 - 30);
    if (D.above) { c.moveTo(tx - 14, D.by + D.h / 2 - 2); c.lineTo(clamp(D.sx, tx - 30, tx + 30), D.by + D.h / 2 + 20); c.lineTo(tx + 14, D.by + D.h / 2 - 2); }
    else { c.moveTo(tx - 14, D.by - D.h / 2 + 2); c.lineTo(clamp(D.sx, tx - 30, tx + 30), D.by - D.h / 2 - 20); c.lineTo(tx + 14, D.by - D.h / 2 + 2); }
    c.closePath(); fs(c, '#fff');
    rr(c, D.bx - D.w / 2, D.by - D.h / 2, D.w, D.h, 26); fs(c, '#fff', '#e8dff5', 3);
    D.icons.forEach((ic, i) => drawThing(c, ic, D.bx + (i - (D.icons.length - 1) / 2) * 70, D.by + Math.sin(t * 3 + i) * 2, 56));
    if (!D.choice) for (let i = 0; i < d.lines.length; i++) { c.fillStyle = i <= d.i ? '#b79cff' : '#e8dff5'; circ(c, D.bx + (i - (d.lines.length - 1) / 2) * 14, D.by + D.h / 2 - 12, 4); c.fill(); }
    c.restore();
    if (D.choice && d.t > 0.6) D.choice.forEach((q, i) => drawRoundBtn(c, q.x, q.y, q.r, { color: q.c.icon === 'heart' ? '#c9f2d6' : '#fff7ea', pulse: q.c.icon === 'heart', stroke: '#fff' }) || drawThing(c, q.c.icon, q.x, q.y, q.r * 1.15));
  },
  dialogDown(p) {
    const d = this.dlg, D = this.dlgLayout();
    if (D.choice) { if (d.t < 0.6) return; for (const q of D.choice) if (hit(p, q.x, q.y, q.r + 10)) { this.dlg = null; Sfx.play('pop'); q.c.cb(); return; } return; }
    if (d.t > 0.5) { Sfx.play('tap'); this.nextLine(); }
  },

  /* ---- Mit einer Figur sprechen: Geschichte, Botengang, Auftrag, Laden oder Minispiel ---- */
  talkTo(id) {
    const S = Save.data, n = id === 'dragon' ? this.dragon : NPCS[id], P = NPC_PITCH[id];
    if (n) n.hop = 1; this.T.face = 1;
    if (this.ride) { this.ride = false; this.U.x = this.T.x - 60; this.U.y = this.T.y; this.trail.length = 0; }
    const st = this.storyStep(); if (st && st.npc === id) { this.say(st.lines, st.after); return; }
    for (const qid of this.activeQuests()) { const q = QUESTS[qid]; if (q.type === 'errand' && q.to === id && S.inv[q.give]) { S.inv[q.give] = 0; S.inv[q.back] = 1; Save.store(); Sfx.play('good'); this.say([[id, 'q_fox_letter', ['letter', 'answer']]]); return; } }
    const q = QUESTS[id], qs = this.qs(id), mini = () => { if (MINIGAMES[id] && (id !== 'dragon' || this.dragonReady())) this.startNpc(id); };
    if (q && this.questAvail(id) && (!qs || qs.s !== 'done')) {
      if (qs && this.questReady(id)) { this.completeQuest(id); return; }
      if (qs) { this.say([[id, this.remindKey(id), this.questIcons(id), { vars: this.questVars(id) }]], mini); return; }
      if (this.activeQuests().length >= 3) { this.say([[id, 'quest_full', ['check', 'check', 'check']]], mini); return; }
      this.say([[id, 'q_' + id + '_offer', this.questIcons(id), { choice: [{ icon: 'heart', cb: () => this.acceptQuest(id) }, { icon: 'cloud', cb: () => { Voice.say('quest_later', { pitch: P }); } }] }]]);
      return;
    }
    if (id === 'squirrel' && S.shopOpen && Save.data.learn) { this.say([[id, 'flink_choice', ['math', 'shop'], { choice: [{ icon: 'math', cb: () => this.startNpc(id) }, { icon: 'shop', cb: () => this.openShop() }] }]]); return; }
    if (MINIGAMES[id]) { mini(); return; }
    this.say([[id, 'npc_thanks', ['heart']]]);
  },
  remindKey(id) { if (id === 'bunny') return 'q_bunny_hide'; if (id === 'snail') return Save.data.inv.letter ? 'q_snail_remind' : 'q_snail_remind2'; return 'q_' + id + '_remind'; },
  questIcons(id) { if (id === 'bee') { const s = this.qs('bee'); return (s ? s.order : ['r', 'y', 'b']).map(c => 'flower_' + c); } return QUESTS[id].show || []; },
  questVars(id) { const s = this.qs(id); if (id === 'bee' && s) return { f1: COLOR_WORD[s.order[0]], f2: COLOR_WORD[s.order[1]], f3: COLOR_WORD[s.order[2]] }; return {}; },
  acceptQuest(id) {
    const q = QUESTS[id], S = Save.data, st = { s: 'active', n: 0 };
    if (q.type === 'collect' && !q.seq) st.items = this.makeQuestItems(q);
    if (q.type === 'sequence') { st.order = shuffle(['r', 'y', 'b']); st.idx = 0; }
    if (q.type === 'errand') S.inv[q.give] = 1;
    S.quests[id] = st; Save.store(); Sfx.play('good');
    if (id === 'bee') this.say([[id, 'q_bee_remind', this.questIcons(id), { vars: this.questVars(id) }]]);
    else if (id === 'bunny') { NPCS.bunny.hop = 1; this.fx.burst(NPCS.bunny.x, NPCS.bunny.y - 40, 10, { g: 60 }); this.hideBunny(); }
    else Voice.say('quest_accept', { pitch: NPC_PITCH[id] });
  },
  makeQuestItems(q) {
    if (q.spots) return q.spots.map(p => { const k = this.nearFree(p[0], p[1]); return { x: (k % this.cols + 0.5) * WORLD.cell, y: (Math.floor(k / this.cols) + 0.5) * WORLD.cell, shown: true, got: false, k: p[2] || q.item }; });
    if (q.hide === 'bush') return [{ bush: 2 + pick(q.bushes), shown: false, got: false }];
    // Nüsse: in sechs Bäumen rund um Flink
    const g = NPCS.squirrel, near = this.trees.map((tr, i) => ({ i, d: dist(tr.x, tr.y, g.x, g.y) })).filter(o => o.d > 140 && o.d < 900 && this.trees[o.i].y > 220 && this.trees[o.i].x > 140).sort((a, b) => a.d - b.d).slice(0, 10);
    return shuffle(near).slice(0, q.n).map(o => ({ tree: o.i, shown: false, got: false }));
  },
  hideBunny() {
    const st = this.qs('bunny'), opts = QUESTS.bunny.bushes.map(i => 2 + i).filter(b => b !== st.cur);
    st.cur = pick(opts); Save.store(); this.bushes[st.cur].shake = 1; Voice.say('q_bunny_hide', { pitch: NPC_PITCH.bunny });
  },
  completeQuest(id) {
    const q = QUESTS[id], S = Save.data, st = this.qs(id), r = q.reward;
    if (q.type === 'deliver') S.inv[q.item] = 0;
    if (q.type === 'errand') S.inv[q.back] = 0;
    st.s = 'done';
    if (r.helper) S.helpers[r.helper] = (S.helpers[r.helper] || 0) + r.n;
    if (r.item) S.inv[r.item] = 1;
    if (r.tool) S.tools[r.tool] = true;
    if (r.cos) { if (!S.cos.includes(r.cos)) S.cos.push(r.cos); S.wear[COS[r.cos]] = r.cos; delete SIL.t; delete SIL.unicorn; }
    if (r.shop) S.shopOpen = true;
    S.wallet = (S.wallet || 0) + 2; Save.store();
    Sfx.play('win'); ScreenFx.confetti(VW, 40); const n = NPCS[id]; this.fx.burst(n.x, n.y - n.size, 24, { shape: 'heart', color: '#ff8fb1', g: -30 });
    const gift = r.helper || r.item || r.tool || r.cos;
    this.say([[id, 'q_' + id + '_done', [gift, 'star', 'star']]]);
  },

  /* ---- Antippen in der Welt, das zu Aufträgen gehört ---- */
  questTap(x, y) {
    const S = Save.data;
    if (!this.gateOpen && dist(x, y, GATE.x, GATE.y - 50) < 90) { Sfx.play('crystal'); this.fx.burst(GATE.x, GATE.y - 60, 12, { g: 40 }); Voice.say('gate_closed'); return true; }
    for (const id of this.activeQuests()) {
      const q = QUESTS[id], st = this.qs(id);
      if (q.type === 'collect' && !q.seq) for (const it of st.items) if (it.shown && !it.got && dist(x, y, it.x, it.y - 12) < 46) { Sfx.play('tap'); this.walkTo(it.x, it.y); return true; }
      if (q.type === 'sequence' && st.idx < 3) for (let i = 0; i < BEE_FLOWERS.length; i++) { const f = BEE_FLOWERS[i]; if (dist(x, y, f.x, f.y - 26) < 56) { Sfx.play('tap'); this.walkTo(f.x, f.y + 34, () => this.beeVisit(i)); return true; } }
      if (q.hide === 'bush') {
        const cand = q.bushes.map(i => 2 + i);
        for (const bi of cand) { const b = this.bushes[bi]; if (dist(x, y, b.x, b.y - 18) > 52 || b.dragon) continue;
          b.shake = 1; Sfx.play('rustle');
          if (q.seq ? st.cur === bi && !this.questReady(id) : st.items.some(it => it.bush === bi && !it.got)) this.questFound(id, bi);
          else Voice.say('q_bunny_wrong', { pitch: NPC_PITCH[id] });
          return true; }
      }
      if (q.hide === 'tree') for (const it of st.items) {
        if (it.shown || it.got) continue; const tr = this.trees[it.tree];
        if (dist(x, y, tr.x, tr.y - 80 * tr.s) < 46 * tr.s) { tr.shake = 1; Sfx.play('rustle'); Sfx.play('plop'); it.shown = true; it.x = tr.x + 34; it.y = tr.y + 24; if (!this.free(it.x, it.y)) { const k = this.nearFree(it.x, it.y); it.x = (k % this.cols + 0.5) * WORLD.cell; it.y = (Math.floor(k / this.cols) + 0.5) * WORLD.cell; } this.fx.burst(it.x, it.y - 60, 8, { shape: 'dot', color: '#84d48f', g: 260, sp1: 100 }); Save.store(); return true; }
      }
    }
    return false;
  },
  questFound(id, bi) {
    const st = this.qs(id), q = QUESTS[id], b = this.bushes[bi];
    st.n++; Sfx.play('star');
    if (id === 'bunny') { b.peek = 1; this.fx.burst(b.x, b.y - 40, 10, { shape: 'heart', color: '#ff9ecb', g: -40, sp1: 70 }); Voice.say(st.n >= q.n ? 'q_bunny_ready' : 'q_bunny_found', { pitch: NPC_PITCH.bunny }); if (st.n < q.n) this.bunnyT = 2.2; }
    else { const it = st.items.find(it => it.bush === bi); it.got = true; this.fx.burst(b.x, b.y - 30, 14, { g: 80 }); Voice.say('q_mole_found'); }
    Save.store();
  },
  beeVisit(i) {
    const st = this.qs('bee'); if (!st || st.s !== 'active' || st.idx >= 3) return;
    const f = BEE_FLOWERS[i]; NPCS.bee.hop = 1;
    if (f.c === st.order[st.idx]) { st.idx++; Sfx.play('note', 600 + st.idx * 120); this.fx.burst(f.x, f.y - 30, 12, { g: 40, color: FLOWER_COL[f.c] }); Voice.say(st.idx >= 3 ? 'q_bee_ready' : 'q_bee_good', { pitch: NPC_PITCH.bee }); }
    else { st.idx = 0; Sfx.play('wrong'); Voice.say('q_bee_wrong', { pitch: NPC_PITCH.bee }); }
    Save.store();
  },
  updateQuests(dt) {
    const T = this.T, last = this.chickTrail[this.chickTrail.length - 1];
    if (!last || dist(T.x, T.y, last.x, last.y) > 14) { this.chickTrail.push({ x: T.x, y: T.y }); if (this.chickTrail.length > 60) this.chickTrail.shift(); }
    if (this.bunnyT > 0) { this.bunnyT -= dt; if (this.bunnyT <= 0 && this.qs('bunny') && !this.questReady('bunny')) this.hideBunny(); }
    for (const id of this.activeQuests()) {
      const q = QUESTS[id], st = this.qs(id);
      if (id === 'bunny' && !this.questReady(id) && Math.sin(this.time * 2) > 0.995) { const b = this.bushes[st.cur]; if (b && b.shake <= 0) b.shake = 0.4; }   // Busch zittert ein wenig
      if (q.type !== 'collect' || q.seq || this.blocked()) continue;
      for (const it of st.items) if (it.shown && !it.got && dist(T.x, T.y, it.x, it.y) < 46) {
        it.got = true; st.n++; Save.store(); Sfx.play('star'); this.fx.burst(it.x, it.y - 20, 10, { g: 80 });
        Voice.say(st.n >= q.n ? 'q_ready_generic' : ITEM_VOICE[it.k || q.item] || 'q_nut_found', { pitch: q.item === 'chick' ? 1.8 : 1.15 });
      }
    }
  },
  questDrawables(c, add, inView, t) {
    if (inView(GATE.x, GATE.y, 200)) add(GATE.y, () => drawGate(c, GATE.x, GATE.y, Save.data.story >= 3, t));
    const bee = this.qs('bee');
    BEE_FLOWERS.forEach(f => { if (!inView(f.x, f.y, 80)) return; add(f.y, () => {
      const done = bee && bee.s === 'active' && bee.order.indexOf(f.c) < bee.idx;
      if (done) { c.fillStyle = 'rgba(255,240,140,0.55)'; circ(c, f.x, f.y - 30, 40); c.fill(); }
      c.strokeStyle = '#5fbf57'; c.lineWidth = 5; line(c, f.x, f.y - 20, f.x, f.y); c.fillStyle = '#7ed56f'; ell(c, f.x + 10, f.y - 8, 10, 5, -0.5); c.fill();
      drawThing(c, 'flower_' + f.c, f.x, f.y - 30 + Math.sin(t * 2 + f.x) * 2, 52);
      if (done) { circ(c, f.x + 22, f.y - 50, 11); fs(c, '#5fd38d', '#fff', 2); drawIcon(c, 'check', f.x + 22, f.y - 50, 12); } }); });
    for (const id of this.activeQuests()) {
      const q = QUESTS[id], st = this.qs(id);
      if (q.type !== 'collect' || q.seq) continue;
      for (const it of st.items) {
        if (it.got) continue;
        if (it.shown) { if (!inView(it.x, it.y, 40) || it.k === 'lamp' || it.k === 'berry') continue; add(it.y, () => { if (it.k === 'shroom') drawGoldShroom(c, it.x, it.y, t); else if (q.item === 'lamb') drawActor(c, 'sheep', it.x, it.y, { size: 46, t: t + it.x, bell: false, lift: Math.abs(Math.sin(t * 3 + it.x)) * 8 }); else if (q.item === 'drop') { c.fillStyle = 'rgba(125,184,255,0.3)'; circ(c, it.x, it.y - 18, 22); c.fill(); drawDrop(c, it.x, it.y - 18 - Math.abs(Math.sin(t * 2.5 + it.x)) * 6, 1.3); } else if (q.item === 'chick') drawChick(c, it.x, it.y, t + it.x, 1.4); else if (q.item === 'nut') { c.fillStyle = 'rgba(255,240,140,0.4)'; circ(c, it.x, it.y - 14, 22); c.fill(); drawThing(c, 'nut', it.x, it.y - 14 - Math.abs(Math.sin(t * 3)) * 4, 30); } }); }
        else if (it.tree != null) { const tr = this.trees[it.tree]; if (inView(tr.x, tr.y, 150)) add(tr.y + 0.5, () => drawThing(c, 'nut', tr.x + 16 * tr.s, tr.y - 70 * tr.s + Math.sin(t * 3 + it.tree) * 2, 20)); }
      }
      if (q.follow) { let k = 0; const tr = this.chickTrail; for (const it of st.items) if (it.got) { const p = tr[Math.max(0, tr.length - 1 - 5 * (k + 1))] || this.T; k++; add(p.y, () => drawChick(c, p.x, p.y, t * 1.3 + k, 1.3)); } }
    }
  },
  /* Sprechblase über einer Figur: gold = Geschichte, blau = Auftrag zu vergeben, grün = Auftrag fertig, sonst Minispiel */
  npcBubble(c, id, x, y, i, t, mini) {
    if (this.npcHidden(id)) return;
    const st = this.storyStep(), q = QUESTS[id], qs = this.qs(id), isHint = !mini && this.hint && this.hint.target.npc === id;
    let style = null, icon = null;
    if (st && st.npc === id) { style = 'gold'; icon = 'splitter'; }
    else if (q && this.questAvail(id) && qs && this.questReady(id)) { style = 'green'; icon = 'check'; }
    else if (q && this.questAvail(id) && !qs) { style = 'blue'; icon = this.questIcons(id)[0]; }
    if (!style) { if (MINIGAMES[id]) this.drawBubble(c, x, y, NPCS[id].icon, Save.data.level[id], isHint, i, t); return; }
    const col = { gold: '#ffd54a', blue: '#5aa9ff', green: '#5fd38d' }[style], s = (isHint ? 1.15 + Math.sin(t * 8) * 0.08 : 1) * (style === 'gold' ? 1.08 + Math.sin(t * 4) * 0.05 : 1);
    c.save(); c.translate(x, y + Math.sin(t * 3 + i) * 5); c.scale(s, s);
    if (style === 'gold') { c.fillStyle = 'rgba(255,213,74,' + (0.3 + Math.sin(t * 5) * 0.15) + ')'; circ(c, 0, 0, 46); c.fill(); }
    c.beginPath(); c.arc(0, 0, 33, Math.PI * 0.62, Math.PI * 0.38); c.lineTo(0, 46); c.closePath(); fs(c, '#fff', col, 5);
    drawThing(c, icon, 0, 0, 40);
    c.restore();
  },

  /* ---- Auftragszettel unter dem Einhorn-Knopf ---- */
  questHud() { const H = this.hud(); return this.activeQuests().slice(0, 3).map((id, k) => ({ id, x: 16, y: H.hint.y + H.hint.r + 12 + k * 64, w: 176, h: 56 })); },
  drawQuestHud(c, t) {
    for (const q of this.questHud()) {
      const def = QUESTS[q.id], st = this.qs(q.id), ready = this.questReady(q.id), S = Save.data;
      rr(c, q.x, q.y, q.w, q.h, 18); fs(c, 'rgba(255,255,255,0.85)', ready ? '#5fd38d' : '#e8dff5', ready ? 4 : 2.5);
      c.save(); circ(c, q.x + 28, q.y + 28, 22); c.clip(); c.fillStyle = '#fff7ea'; c.fill(); const n = NPCS[q.id]; drawActor(c, n.art, q.x + 28, q.y + 28 + 22 * 0.9, { size: 46 * 70 / Math.max(64, n.size), t: 1, noShadow: true }); c.restore();
      if (ready) { circ(c, q.x + 80, q.y + 28, 15); fs(c, '#5fd38d', '#fff', 2.5); drawIcon(c, 'check', q.x + 80, q.y + 28, 17); continue; }
      if (def.type === 'collect') {
        drawThing(c, def.show ? def.show[0] : def.item, q.x + 72, q.y + 28, 30);
        const sp = Math.min(13, 80 / def.n); for (let k = 0; k < def.n; k++) { circ(c, q.x + 96 + k * sp + 4, q.y + 28, 5); fs(c, k < st.n ? '#ffd54a' : '#fff', '#c9b8e0', 1.5); }
      } else if (def.type === 'sequence') st.order.forEach((col, k) => { drawThing(c, 'flower_' + col, q.x + 72 + k * 32, q.y + 28, 26); if (k < st.idx) { circ(c, q.x + 82 + k * 32, q.y + 18, 7); fs(c, '#5fd38d'); } });
      else if (def.type === 'deliver') { c.globalAlpha = S.inv[def.item] ? 1 : 0.35; drawThing(c, def.item, q.x + 76, q.y + 28, 30); c.globalAlpha = 1; drawThing(c, 'bear', q.x + 120, q.y + 28, 34); }
      else { drawThing(c, S.inv[def.give] ? def.give : def.back, q.x + 76, q.y + 28, 30); drawThing(c, S.inv[def.give] ? def.to : 'snail', q.x + 122, q.y + 28, 34); }
    }
  },
  questHudDown(p) {
    for (const q of this.questHud()) if (p.x > q.x && p.x < q.x + q.w && p.y > q.y && p.y < q.y + q.h) {
      Sfx.play('tap'); const tg = this.questTarget(q.id); this.idle = 0;
      if (tg) this.hint = { t: 8, target: tg, path: this.findPath(this.T.x, this.T.y, tg.x, tg.y) || [tg] };
      Voice.say(this.questReady(q.id) ? 'q_ready_generic' : this.remindKey(q.id), { vars: this.questVars(q.id), pitch: NPC_PITCH[q.id] });
      return true;
    }
    return false;
  },

  /* ---- Rucksack und Laden ---- */
  openPack() { this.overlay = { kind: 'pack', t: 0, shake: {} }; Sfx.play('pop'); const n = npcOrder().filter(id => this.inPack(id)).length, m = npcOrder().length; Voice.say(Save.data.cos.length ? 'pack_open' : n === 0 ? 'backpack_0' : n === m ? 'backpack_all' : 'backpack_n', { vars: { n, m } }); },
  openShop() { this.overlay = { kind: 'shop', t: 0, shake: {} }; Sfx.play('pop'); Voice.say('shop_hello', { pitch: NPC_PITCH.squirrel }); },
  panelRect() { const w = Math.min(VW - 50, 860), h = Math.min(VH - 30, 500); return { x: (VW - w) / 2, y: (VH - h) / 2, w, h }; },
  ovClose() { const R = this.panelRect(), r = Math.max(View.btn / 2 - 6, 42); return { x: R.x + R.w - r - 8, y: R.y + r + 8, r }; },
  packLayout() {
    const R = this.panelRect(), S = Save.data, r = clamp(R.h / 11, 34, 46), row = k => R.y + 92 + k * (R.h - 120) / 3 + 20;
    const helpers = ['feather', 'lens', 'lily', 'slow', 'eye'].map((h, i) => ({ id: h, x: R.x + 150 + i * (r * 2 + 40), y: row(1), r }));
    const cos = S.cos.map((cid, i) => ({ id: cid, x: R.x + 150 + i * (r * 2 + 40), y: row(2), r }));
    return { R, r, rowY: row, helpers, cos, album: { x: R.x + 320, y: R.y + 45, r: Math.max(View.btn / 2 - 4, 40) }, cert: S.story >= 9 ? { x: R.x + 420, y: R.y + 45, r: Math.max(View.btn / 2 - 4, 40) } : null };
  },
  shopLayout() {
    const R = this.panelRect(), r = clamp(R.h / 10, 36, 50), cols = 4, cw = (R.w - 140) / cols;
    return { R, r, goods: SHOP.map((g, i) => ({ g, x: R.x + 80 + cw * (i % cols + 0.5), y: R.y + 140 + Math.floor(i / cols) * (R.h - 160) / 2, r })) };
  },
  drawOverlay(c, t) {
    const o = this.overlay, R = this.panelRect(), S = Save.data;
    o.t += 1 / 60;
    c.fillStyle = 'rgba(40,40,70,0.5)'; c.fillRect(0, 0, VW, VH);
    rr(c, R.x, R.y, R.w, R.h, 30); fs(c, '#fffaf2', '#fff', 4);
    // Glitzersterne (Geld)
    rr(c, R.x + 20, R.y + 18, 128, 54, 27); fs(c, '#fff3c4', '#ffd54a', 3); starPath(c, R.x + 48, R.y + 45, 17); fs(c, '#ffe066', '#f0b429', 2.5);
    c.font = '800 30px system-ui, sans-serif'; c.fillStyle = '#7a5cc9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(S.wallet || 0), R.x + 104, R.y + 46);
    const X = this.ovClose(); drawRoundBtn(c, X.x, X.y, X.r, { color: '#9ecbff', icon: 'x', iconScale: 0.8 });
    if (o.kind === 'pack') {
      const L = this.packLayout();
      drawBackpack(c, R.x + 220, R.y + 45, 46);
      drawRoundBtn(c, L.album.x, L.album.y, L.album.r, { color: '#f3e8ff', pulse: true }); drawThing(c, 'book', L.album.x, L.album.y, L.album.r * 1.15);
      if (L.cert) { drawRoundBtn(c, L.cert.x, L.cert.y, L.cert.r, { color: '#fff3c4', pulse: true }); drawThing(c, 'scroll', L.cert.x, L.cert.y, L.cert.r * 1.15); }
      // Kristalle
      drawCrystal(c, R.x + 60, L.rowY(0), 16, '#d6cfe6');
      npcOrder().forEach((id, i) => { const x = R.x + 150 + i * 80, y = L.rowY(0), lv = this.packLv(id);
        if (lv > 0) { if (lv >= 3) { c.fillStyle = 'rgba(255,213,74,0.5)'; circ(c, x, y, 34); c.fill(); } drawCrystal(c, x, y, 14 + lv * 6, CRYSTAL_COL[id]); }
        else { c.setLineDash([5, 5]); circ(c, x, y, 20); c.strokeStyle = 'rgba(150,130,180,0.6)'; c.lineWidth = 2.5; c.stroke(); c.setLineDash([]); } });
      // Zauberhelfer
      drawThing(c, 'feather', R.x + 60, L.rowY(1), 40);
      for (const h of L.helpers) { const n = S.helpers[h.id] || 0; c.globalAlpha = n ? 1 : 0.35; drawRoundBtn(c, h.x, h.y, h.r, { color: '#f3e8ff' }); drawThing(c, h.id, h.x, h.y, h.r * 1.15); c.globalAlpha = 1;
        circ(c, h.x + h.r * 0.75, h.y + h.r * 0.7, 15); fs(c, n ? '#8a6ad8' : '#c9c0d8', '#fff', 2); c.font = '800 16px system-ui, sans-serif'; c.fillStyle = '#fff'; c.fillText(String(n), h.x + h.r * 0.75, h.y + h.r * 0.7 + 1); }
      // Schmuck
      drawThing(c, 'bow', R.x + 60, L.rowY(2), 40);
      if (!L.cos.length) { c.setLineDash([6, 6]); circ(c, R.x + 150, L.rowY(2), L.r); c.strokeStyle = 'rgba(150,130,180,0.5)'; c.lineWidth = 3; c.stroke(); c.setLineDash([]); }
      for (const q of L.cos) { const worn = S.wear[COS[q.id]] === q.id; drawRoundBtn(c, q.x, q.y, q.r, { color: worn ? '#eafbe9' : '#fff7ea', stroke: worn ? '#5fd38d' : '#fff' }); drawThing(c, q.id, q.x, q.y, q.r * 1.2);
        if (worn) { circ(c, q.x + q.r * 0.7, q.y - q.r * 0.7, 13); fs(c, '#5fd38d', '#fff', 2.5); drawIcon(c, 'check', q.x + q.r * 0.7, q.y - q.r * 0.7, 14); } }
      // T und Einhorn mit ihrem Schmuck
      drawActor(c, 'unicorn', R.x + R.w - 120, R.y + R.h - 40, { size: 120, t, mark: uniMark() });
      drawActor(c, 't', R.x + R.w - 220, R.y + R.h - 40, { size: 110, t });
    } else if (o.kind === 'album') {
      drawThing(c, 'book', R.x + 220, R.y + 45, 50);
      { const P = this.progress(), items = [['check', P.qDone, P.qAll], ['star', P.stars, P.starsAll], ['gem', P.gold, P.goldAll]], x0 = R.x + 290, w = Math.min(150, (R.w - 420) / 3);
        c.font = '800 22px system-ui, sans-serif'; c.textBaseline = 'middle';
        items.forEach((it, i) => { const x = x0 + i * (w + 10), full = it[1] >= it[2]; rr(c, x, R.y + 22, w, 46, 23); fs(c, full ? '#eafbe9' : '#fff7ea', full ? '#5fd38d' : '#f0d9a8', 3); drawThing(c, it[0], x + 26, R.y + 45, 30); c.fillStyle = '#5a4a7a'; c.fillText(it[1] + '/' + it[2], x + 62, R.y + 47); });
        c.textBaseline = 'alphabetic'; }
      for (const q of this.albumLayout()) {
        const f = this.isFriend(q.id), gold = (Save.data.level[q.id] || 0) >= 3;
        circ(c, q.x, q.y, q.r); fs(c, f ? '#fff7ea' : '#efeaf4', gold ? '#ffd54a' : f ? '#ff8fb1' : '#e0d8ea', gold ? 6 : 4);
        c.save(); circ(c, q.x, q.y, q.r - 3); c.clip();
        const n = NPCS[q.id], sz = q.r * 1.6 * Math.min(1.2, 76 / n.size);
        if (f) drawActor(c, n.art, q.x, q.y + q.r * 0.85, { size: sz, t: 1, noShadow: true }); else { c.globalAlpha = 0.5; drawSilhouette(c, n.art, q.x, q.y + q.r * 0.85, sz); c.globalAlpha = 1; }
        c.restore();
        if (f && gold) { starPath(c, q.x + q.r * 0.7, q.y - q.r * 0.7, 10); fs(c, '#ffe066', '#f0b429', 2); }
      }
    } else {
      const L = this.shopLayout();
      drawActor(c, 'squirrel', R.x + R.w - 70, R.y + R.h - 20, { size: 110, t, flip: true });
      drawThing(c, 'shop', R.x + 220, R.y + 45, 54);
      for (const q of L.goods) {
        const owned = q.g.cos && S.cos.includes(q.g.id), can = !owned && (S.wallet || 0) >= q.g.price, sh = o.shake[q.g.id] > 0 ? Math.sin(o.shake[q.g.id] * 30) * 8 * o.shake[q.g.id] : 0;
        if (o.shake[q.g.id] > 0) o.shake[q.g.id] -= 1 / 40;
        c.globalAlpha = can || owned ? 1 : 0.45;
        drawRoundBtn(c, q.x + sh, q.y, q.r, { color: can ? '#fff7ea' : '#f2eef6', stroke: can ? '#ffd54a' : '#fff', pulse: can });
        drawThing(c, q.g.id, q.x + sh, q.y, q.r * 1.15);
        for (let k = 0; k < q.g.price; k++) { const sx = q.x - (Math.min(4, q.g.price) - 1) * 9 + (k % 4) * 18, sy = q.y + q.r + 20 + Math.floor(k / 4) * 18; starPath(c, sx, sy, 7.5); fs(c, '#ffe066', '#f0b429', 1.5); }
        c.globalAlpha = 1;
        if (owned) { circ(c, q.x + q.r * 0.7, q.y - q.r * 0.7, 13); fs(c, '#5fd38d', '#fff', 2.5); drawIcon(c, 'check', q.x + q.r * 0.7, q.y - q.r * 0.7, 14); }
      }
    }
    c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  },
  progress() {
    const S = Save.data, qs = Object.keys(QUESTS).filter(id => !QUESTS[id].learn || S.learn), all = npcOrder();
    return { qDone: qs.filter(id => S.quests[id] && S.quests[id].s === 'done').length, qAll: qs.length, stars: (S.stars || []).length, starsAll: GLITTER.length,
      gold: all.filter(id => (S.level[id] || 0) >= 3).length, goldAll: all.length };
  },
  isFriend(id) { const S = Save.data; return !!(S.crystals[id] || (S.quests[id] && S.quests[id].s === 'done')); },
  albumLayout() { const R = this.panelRect(), cols = 7, r = clamp(Math.min((R.w - 80) / cols / 2 - 8, (R.h - 150) / 3 / 2 - 12), 28, 50), cw = (R.w - 60) / cols;
    return ALBUM.map((id, i) => ({ id, x: R.x + 30 + cw * (i % cols + 0.5), y: R.y + 100 + r + Math.floor(i / cols) * (r * 2 + 20), r })); },
  overlayDown(p) {
    const o = this.overlay, S = Save.data, X = this.ovClose();
    if (hit(p, X.x, X.y, X.r + 10)) { this.overlay = o.kind === 'album' ? { kind: 'pack', t: 0, shake: {} } : null; Sfx.play('tap'); return; }
    if (o.kind === 'album') { for (const q of this.albumLayout()) if (hit(p, q.x, q.y, q.r + 6)) { const f = this.isFriend(q.id); Sfx.play(f ? 'pop' : 'tap'); Voice.say(f ? 'npc_thanks' : 'album_unknown', { pitch: f ? NPC_PITCH[q.id] : 1.15 }); if (f) ScreenFx.burst(q.x, q.y, 12, { shape: 'heart', color: '#ff8fb1', g: -40 }); return; } return; }
    if (o.kind === 'pack') {
      const CB = this.packLayout().cert; if (CB && hit(p, CB.x, CB.y, CB.r + 8)) { this.overlay = null; Sfx.play('pop'); Save.data.pos = { x: Math.round(this.T.x), y: Math.round(this.T.y) }; Game.go(FinaleScene, { cert: true }); return; }
      const AB = this.packLayout().album; if (hit(p, AB.x, AB.y, AB.r + 8)) { this.overlay = { kind: 'album', t: 0, shake: {} }; Sfx.play('pop'); Voice.say('album_open'); return; }
      for (const q of this.packLayout().cos) if (hit(p, q.x, q.y, q.r + 8)) { const slot = COS[q.id]; S.wear[slot] = S.wear[slot] === q.id ? null : q.id; Save.store(); delete SIL.t; delete SIL.unicorn; Sfx.play('pop'); if (S.wear[slot]) Voice.say('wear_on'); return; }
      return;
    }
    for (const q of this.shopLayout().goods) if (hit(p, q.x, q.y, q.r + 10)) {
      const g = q.g;
      if (g.cos && S.cos.includes(g.id)) { Voice.say('shop_owned', { pitch: NPC_PITCH.squirrel }); return; }
      if ((S.wallet || 0) < g.price) { o.shake[g.id] = 1; Sfx.play('wrong'); Voice.say('shop_poor', { pitch: NPC_PITCH.squirrel }); return; }
      S.wallet -= g.price;
      if (g.cos) { S.cos.push(g.id); S.wear[COS[g.id]] = g.id; delete SIL.t; delete SIL.unicorn; } else S.helpers[g.id] = (S.helpers[g.id] || 0) + 1;
      Save.store(); Sfx.play('crystal'); ScreenFx.burst(q.x, q.y, 18, { g: 120 }); Voice.say('shop_buy', { pitch: NPC_PITCH.squirrel });
      return;
    }
  }
});
