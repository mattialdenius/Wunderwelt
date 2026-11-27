import sys, time
from playwright.sync_api import sync_playwright
W, H = (int(sys.argv[1]), int(sys.argv[2])) if len(sys.argv) > 2 else (800, 360)
OUT = '/home/claude/test/shots'; errs = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True, args=['--no-sandbox'])
    page = b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=2).new_page()
    page.on('console', lambda m: errs.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') else None)
    page.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    ev = page.evaluate
    css = lambda x, y: ev("([x,y])=>{const V=ZW.View;return [(x*V.scale+V.ox)/V.dpr,(y*V.scale+V.oy)/V.dpr]}", [x, y])
    tap = lambda x, y: page.mouse.click(*css(x, y))
    shot = lambda n: page.screenshot(path='%s/v5_%s_%dx%d.png' % (OUT, n, W, H))
    def wait(expr, t=30):
        end = time.time() + t
        while time.time() < end:
            if ev(expr): return
            time.sleep(0.08)
        raise Exception('timeout ' + expr)
    def scene(n): wait("()=>ZW.Game.scene===ZW.%s&&ZW.Game.fade<0.05" % n)
    def world_pos(x, y): return ev("([x,y])=>{const W=ZW.World;return [(x-W.cam.x)*W.zoom,(y-W.cam.y)*W.zoom]}", [x, y])
    def tp(x, y):  # T teleportieren (auf freie Stelle)
        ev("([x,y])=>{const W=ZW.World;let k=W.nearFree(x,y);W.T.x=(k%W.cols+.5)*20;W.T.y=(Math.floor(k/W.cols)+.5)*20;W.T.path=null;W.trail.length=0;W.U.x=W.T.x-50;W.U.y=W.T.y;W.camTo(1)}", [x, y]); time.sleep(0.25)
    def tap_npc(id):
        if id == 'dragon':
            ev("()=>{const W=ZW.World,D=W.dragon;let k=W.nearFree(D.x-140,D.y+90);W.T.x=(k%W.cols+.5)*20;W.T.y=(Math.floor(k/W.cols)+.5)*20;W.T.path=null;W.camTo(1)}"); time.sleep(0.25)
            tap(*ev("()=>{const W=ZW.World,D=W.dragon;return [(D.x-W.cam.x)*W.zoom,(D.y-70-W.cam.y)*W.zoom]}"))
        else:
            n = ev("(id)=>{const n=ZW.NPCS[id];return [n.x,n.y,n.size,n.lift]}", id)
            tp(n[0] - 120, n[1] + 110)
            tap(*world_pos(n[0], n[1] - n[2] * 0.45 - n[3]))
    def dialog_until_choice_or_end(choice=None, t=40):
        end = time.time() + t
        while time.time() < end:
            if not ev("()=>!!ZW.World.dlg"):
                if ev("()=>ZW.Game.scene===ZW.World&&!ZW.Game.pending"): time.sleep(0.15)
                if not ev("()=>!!ZW.World.dlg"): return
            d = ev("()=>{const W=ZW.World;if(!W.dlg)return null;const D=W.dlgLayout();return {t:W.dlg.t,choice:D.choice&&D.choice.map(q=>[q.x,q.y,q.c.icon]),bx:D.bx,by:D.by}}")
            if d and d['choice']:
                if d['t'] < 0.7: time.sleep(0.15); continue
                q = [q for q in d['choice'] if q[2] == choice][0] if choice else d['choice'][0]
                tap(q[0], q[1]); time.sleep(0.2); return
            if d and d['t'] > 0.6: tap(d['bx'], d['by'])
            time.sleep(0.15)
        raise Exception('dialog stuck')
    def talk(id, choice=None):
        tap_npc(id); wait("()=>!!ZW.World.dlg||ZW.Game.pending", 15); dialog_until_choice_or_end(choice)
    def settle(): wait("()=>ZW.Game.scene===ZW.World&&!ZW.World.blocked()&&!ZW.World.ev&&!ZW.World.storyDirty", 40)
    def exit_mini(): tap(*ev("()=>{const r=Math.max(ZW.View.btn/2-6,44);return [14+r,14+r]}")); scene('World'); time.sleep(0.3)

    page.goto('file://'+__import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','index.html'))); time.sleep(0.5)
    ev("()=>{localStorage.clear();ZW.Save.reset();const S=ZW.Save.data;S.name='Glitzer';S.nameId='glitzer';S.player={gender:'girl',skin:1,hair:3,style:4,cloth:1,name:'Mia'};S.worldV=2;S.rideTold=true;ZW.Save.store();ZW.Game.go(ZW.World,{first:true})}")
    scene('World'); ev("()=>{ZW.World.prankCool=1e9}")
    # --- Geschichte: Eule erzählt ---
    assert ev("()=>ZW.World.storyStep().npc==='owl'")
    tap_npc('owl'); wait("()=>!!ZW.World.dlg"); time.sleep(0.8); shot('dialog_owl')
    dialog_until_choice_or_end(); scene('OwlGame'); assert ev("()=>ZW.Save.data.story===1"); print('story 0 -> owl dialog -> owl game ok')
    exit_mini()
    # --- Aufträge annehmen: Ente, Biene, Maulwurf; dann ist der vierte zu viel ---
    talk('duck', 'heart'); talk('bee', 'heart'); dialog_until_choice_or_end(); settle(); talk('mole', 'heart'); settle()
    assert ev("()=>JSON.stringify(ZW.World.activeQuests())") == '["duck","bee","mole"]', ev("()=>JSON.stringify(ZW.World.activeQuests())")
    time.sleep(0.4); shot('quest_hud')
    tap_npc('bunny'); wait("()=>!!ZW.World.dlg"); assert ev("()=>ZW.World.dlg.lines[0][1]==='quest_full'"); dialog_until_choice_or_end(); settle(); print('max 3 quests ok')
    # Ente: drei Küken einsammeln, folgen T, zurückbringen
    for i in range(3):
        it = ev("(i)=>{const it=ZW.World.qs('duck').items[i];return [it.x,it.y]}", i); tp(it[0] - 30, it[1]); time.sleep(0.3)
    assert ev("()=>ZW.World.questReady('duck')"); time.sleep(0.5); shot('chicks_follow')
    talk('duck'); settle(); assert ev("()=>ZW.Save.data.quests.duck.s==='done'&&ZW.Save.data.helpers.lily===2&&ZW.Save.data.wallet===2"); print('duck ok')
    # Biene: falsche Blume, dann richtige Reihenfolge
    order = ev("()=>ZW.World.qs('bee').order")
    fl = ev("()=>BEE_FLOWERS")
    wrong = [f for f in fl if f['c'] != order[0]][0]
    tp(wrong['x'] - 100, wrong['y'] + 60); tap(*world_pos(wrong['x'], wrong['y'] - 26)); wait("()=>!ZW.World.T.path", 10); time.sleep(0.2)
    assert ev("()=>ZW.World.qs('bee').idx") == 0
    for c in order:
        f = [f for f in fl if f['c'] == c][0]; tp(f['x'] - 100, f['y'] + 60); tap(*world_pos(f['x'], f['y'] - 26)); wait("()=>!ZW.World.T.path", 10); time.sleep(0.2)
    assert ev("()=>ZW.World.questReady('bee')"); shot('bee_flowers')
    talk('bee'); settle(); assert ev("()=>ZW.Save.data.inv.honey===1"); print('bee ok')
    # Maulwurf: falscher Busch, richtiger Busch
    bi = ev("()=>ZW.World.qs('mole').items[0].bush"); cand = ev("()=>QUESTS.mole.bushes.map(i=>2+i)")
    wb = [x for x in cand if x != bi][0]
    for bb in (wb, bi):
        bp = ev("(i)=>{const b=ZW.World.bushes[i];return [b.x,b.y]}", bb); tp(bp[0] - 120, bp[1] + 60); tap(*world_pos(bp[0], bp[1] - 18)); time.sleep(0.3)
    assert ev("()=>ZW.World.questReady('mole')"); talk('mole'); settle(); assert ev("()=>ZW.Save.data.tools.compass"); print('mole ok')
    # Bär: Honig bringen (annehmen, dann abgeben)
    talk('bear', 'heart'); settle(); talk('bear'); settle(); assert ev("()=>ZW.Save.data.helpers.feather===3&&!ZW.Save.data.inv.honey"); print('bear ok')
    # Hase: dreimal finden
    talk('bunny', 'heart'); settle()
    for r in range(3):
        wait("()=>ZW.World.qs('bunny').cur!=null&&!(ZW.World.bunnyT>0)", 10)
        cur = ev("()=>ZW.World.qs('bunny').cur"); bp = ev("(i)=>{const b=ZW.World.bushes[i];return [b.x,b.y]}", cur)
        tp(bp[0] - 120, bp[1] + 60); tap(*world_pos(bp[0], bp[1] - 18)); time.sleep(0.4)
        if r == 0: shot('bunny_found')
    assert ev("()=>ZW.World.questReady('bunny')"); talk('bunny'); settle(); assert ev("()=>ZW.Save.data.wear.uni==='flowers'"); print('bunny ok')
    # Schnecke: Brief zum Fuchs und Antwort zurück
    ev("()=>{ZW.Save.data.level.snail=1;ZW.Save.data.crystals.snail=true}")
    talk('snail', 'heart'); settle(); assert ev("()=>ZW.Save.data.inv.letter===1")
    talk('fox'); settle(); assert ev("()=>ZW.Save.data.inv.answer===1&&ZW.Game.scene===ZW.World")
    talk('snail'); settle(); assert ev("()=>ZW.Save.data.helpers.lens===2"); print('snail errand ok')
    # Eichhörnchen: sechs Nüsse aus den Bäumen schütteln
    ev("()=>{ZW.Save.data.level.squirrel=1;ZW.Save.data.crystals.squirrel=true}")
    talk('squirrel', 'heart'); settle(); time.sleep(0.3); shot('nut_trees')
    for i in range(6):
        tr = ev("(i)=>{const W=ZW.World,it=W.qs('squirrel').items[i],tr=W.trees[it.tree];return [tr.x,tr.y,tr.s]}", i)
        tp(tr[0] - 80, tr[1] + 90); tap(*world_pos(tr[0], tr[1] - 80 * tr[2])); time.sleep(0.2)
        it = ev("(i)=>{const it=ZW.World.qs('squirrel').items[i];return [it.shown,it.x,it.y]}", i); assert it[0], 'nut %d not shown' % i
        tp(it[1] - 30, it[2]); time.sleep(0.3)
    assert ev("()=>ZW.World.questReady('squirrel')"); talk('squirrel'); settle()
    assert ev("()=>ZW.Save.data.shopOpen&&ZW.Save.data.wear.t==='acorn'"); print('squirrel ok, wallet', ev("()=>ZW.Save.data.wallet"))
    # Laden: Feder kaufen, Krone zu teuer
    talk('squirrel', 'shop'); wait("()=>ZW.World.overlay&&ZW.World.overlay.kind==='shop'"); time.sleep(0.4); shot('shop')
    g = ev("()=>ZW.World.shopLayout().goods.map(q=>[q.g.id,q.x,q.y])")
    w0 = ev("()=>ZW.Save.data.wallet"); tap(g[0][1], g[0][2]); time.sleep(0.2)
    assert ev("()=>ZW.Save.data.wallet") == w0 - 3 and ev("()=>ZW.Save.data.helpers.feather") == 4
    ev("()=>{ZW.Save.data.wallet=2}"); tap(g[5][1], g[5][2]); time.sleep(0.2); assert not ev("()=>ZW.Save.data.cos.includes('crown')")
    X = ev("()=>ZW.World.ovClose()"); tap(X['x'], X['y']); time.sleep(0.2); print('shop ok')
    # Rucksack: Schmuck an- und ausziehen
    pk = ev("()=>ZW.World.hud().pack"); tap(pk['x'], pk['y']); wait("()=>ZW.World.overlay&&ZW.World.overlay.kind==='pack'"); time.sleep(0.4); shot('pack')
    cs = ev("()=>ZW.World.packLayout().cos.map(q=>[q.id,q.x,q.y])"); ac = [q for q in cs if q[0] == 'acorn'][0]
    tap(ac[1], ac[2]); time.sleep(0.2); assert ev("()=>ZW.Save.data.wear.t===null"); tap(ac[1], ac[2]); time.sleep(0.2); assert ev("()=>ZW.Save.data.wear.t==='acorn'")
    X = ev("()=>ZW.World.ovClose()"); tap(X['x'], X['y']); time.sleep(0.2); print('pack ok')
    # Zauberhelfer: Feder bei der Eule, Seerose beim Frosch
    talk('owl'); scene('OwlGame'); wait("()=>ZW.OwlGame.state==='choose'"); hb = ev("()=>helperBtn()"); f0 = ev("()=>ZW.Save.data.helpers.feather")
    shot('helper_owl'); tap(hb['x'], hb['y']); wait("()=>ZW.OwlGame.state==='right'||ZW.OwlGame.state==='fly'", 5); assert ev("()=>ZW.Save.data.helpers.feather") == f0 - 1; exit_mini()
    talk('frog'); scene('FrogGame'); time.sleep(0.5); hb = ev("()=>helperBtn()"); tap(hb['x'], hb['y']); time.sleep(0.4)
    assert ev("()=>ZW.FrogGame.pl.some(p=>p.magic)&&ZW.Save.data.helpers.lily===1"); shot('helper_frog'); exit_mini(); print('helpers ok')
    # Geschichte weiter: Funki gesteht, dann schließt die Eule das Kapitel und das Pilztor öffnet sich
    ev("()=>{const S=ZW.Save.data;for(const k of ['owl','fox','frog']){S.crystals[k]=true;S.level[k]=Math.max(1,S.level[k])}S.dragon.state='done';S.dragonFriend=true;ZW.World.dragonHome();ZW.World.prankCool=1e9}")
    assert ev("()=>ZW.World.storyStep().npc==='dragon'")
    tap_npc('dragon'); wait("()=>!!ZW.World.dlg"); time.sleep(0.8); shot('dialog_funki'); dialog_until_choice_or_end(); scene('DragonGame'); exit_mini()
    ev("()=>{const S=ZW.Save.data;S.crystals.dragon=true;S.level.dragon=1;ZW.World.prankCool=1e9}"); settle()
    assert ev("()=>ZW.Save.data.story===2&&ZW.World.storyStep().npc==='owl'")
    talk('owl'); settle(); assert ev("()=>ZW.Save.data.story===3")
    tp(1500, 3560); time.sleep(0.6); shot('gate_open')
    print('story chapter 1 ok')
    page.reload(); time.sleep(0.6); ev("()=>{ZW.Game.go(ZW.StartScene,{})}"); time.sleep(0.8); shot('start_rainbow')
    assert ev("()=>ZW.Save.data.story===3&&ZW.Save.data.quests.bunny.s==='done'"), 'save after reload'
    print('loop errors:', ev("()=>window.__zwErrors||0"), 'errors:', errs)
    b.close()
