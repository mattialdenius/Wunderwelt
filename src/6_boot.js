
/* ============ 7. START ============ */
function drawRotateHint(c) {
  // Hochformat: Bild "Handy drehen" (ohne Text)
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#aee3ff'; c.fillRect(0, 0, canvas.width, canvas.height);
  const s = Math.min(canvas.width, canvas.height) / 300, a = (Math.sin(Game.time * 2.4) * 0.5 + 0.5) * Math.PI / 2;
  c.translate(canvas.width / 2, canvas.height / 2); c.scale(s, s);
  c.save(); c.rotate(a); rr(c, -38, -66, 76, 132, 14); fs(c, '#fff', '#7a5cc9', 6); rr(c, -28, -50, 56, 96, 6); fs(c, '#ffd9f1'); c.fillStyle = '#ffd54a'; starPath(c, 0, -2, 18); c.fill(); c.restore();
  c.strokeStyle = '#7a5cc9'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.arc(0, 0, 104, -1.9, -0.5); c.stroke();
  tri(c, 91, -62, 104, -38, 78, -44); fs(c, '#7a5cc9', '#7a5cc9', 4);
}
let lastFrame = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, Math.max(0, (now - lastFrame) / 1000)); lastFrame = now;
  try {
    if (View.portrait) { Game.time += dt; drawRotateHint(ctx); return; }
    Game.update(dt);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#2b3a55'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(View.scale, 0, 0, View.scale, View.ox, View.oy);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, VW, VH); ctx.clip();
    Game.draw(ctx);
    ctx.restore();
  } catch (err) {
    // Ein Fehler soll das Spiel nie einfrieren: melden und weiterlaufen
    if (window.console) console.error(err);
    window.__zwErrors = (window.__zwErrors || 0) + 1;
    try { ctx.restore(); } catch (e) {}
  }
}
function boot() {
  Save.load(); Sprites.load(); Voice.init(); initInput();
  Game.scene = StartScene; StartScene.enter({});
  View.resize();
  window.addEventListener('resize', () => View.resize());
  window.addEventListener('orientationchange', () => setTimeout(() => View.resize(), 200));
  document.addEventListener('visibilitychange', () => { if (document.hidden) Voice.stop(); lastFrame = performance.now(); });
  window.ZW = { CONFIG, SPEECH, Game, Save, View, Input, World, StartScene, NamingScene, OwlGame, FoxGame, FrogGame, DragonGame, ReadGame, MathGame, CharScene, NPCS, Voice }; // zum Testen in der Konsole
  lastFrame = performance.now(); requestAnimationFrame(frame);
}
boot();
