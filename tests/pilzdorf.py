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
    shot = lambda n: page.screenshot(path='%s/v6_%s_%dx%d.png' % (OUT, n, W, H))
    def wait(expr, t=30):
        end = time.time() + t
        while time.time() < end:
            if ev(expr): return
            time.sleep(0.08)
        raise Exception('timeout ' + expr)
    def scene(n): wait("()=>ZW.Game.scene===ZW.%s&&ZW.Game.fade<0.05" % n)
    def world_pos(x, y): return ev("([x,y])=>{const W=ZW.World;return [(x-W.cam.x)*W.zoom,(y-W.cam.y)*W.zoom]}", [x, y])
    def tp(x, y):
        ev("([x,y])=>{const W=ZW.World;let k=W.nearFree(x,y);W.T.x=(k%W.cols+.5)*20;W.T.y=(Math.floor(k/W.cols)+.5)*20;W.T.path=null;W.trail.length=0;W.chickTrail.length=0;W.U.x=W.T.x-50;W.U.y=W.T.y;W.camTo(1)}", [x, y]); time.sleep(0.25)
    def tap_npc(id):
        n = ev("(id)=>{const n=ZW.NPCS[id];return [n.x,n.y,n.size,n.lift]}", id); tp(n[0] - 120, n[1] + 110); tap(*world_pos(n[0], n[1] - n[2] * 0.45 - n[3]))
    def dialog(choice=None, t=40):
        end = time.time() + t
        while time.time() < end:
            if not ev("()=>!!ZW.World.dlg"):
                time.sleep(0.15)
                if not ev("()=>!!ZW.World.dlg"): return
            d = ev("()=>{const W=ZW.World;if(!W.dlg)return null;const D=W.dlgLayout();return {t:W.dlg.t,choice:D.choice&&D.choice.map(q=>[q.x,q.y,q.c.icon]),bx:D.bx,by:D.by}}")
            if d and d['choice']:
                if d['t'] < 0.7: time.sleep(0.15); continue
                q = [q for q in d['choice'] if q[2] == choice][0] if choice else d['choice'][0]; tap(q[0], q[1]); time.sleep(0.2); return
            if d and d['t'] > 0.6: tap(d['bx'], d['by'])
            time.sleep(0.15)
        raise Exception('dialog stuck')
    def talk(id, choice=None): tap_npc(id); wait("()=>!!ZW.World.dlg||ZW.Game.pending", 15); dialog(choice)
    def settle(): wait("()=>ZW.Game.scene===ZW.World&&!ZW.World.blocked()&&!ZW.World.ev&&!ZW.World.storyDirty", 40)
    def exit_mini(): tap(*ev("()=>{const r=Math.max(ZW.View.btn/2-6,44);return [14+r,14+r]}")); scene('World'); time.sleep(0.3)
    def count_game(lv):
        assert ev("()=>ZW.CountGame.lv") == lv
        types = set()
        while not ev("()=>ZW.CountGame.winT>=0"):
            wait("()=>ZW.CountGame.state==='play'||ZW.CountGame.winT>=0")
            if ev("()=>ZW.CountGame.winT>=0"): break
            ty = ev("()=>ZW.CountGame.type")
            n = ev("()=>ZW.CountGame.type==='more'?null:ZW.CountGame.flies[0].filter(f=>ZW.CountGame.counts(f)).length")
            if n is not None: assert n == ev("()=>ZW.CountGame.ans"), 'count mismatch'
            if ty not in types:
                types.add(ty)
                if ty != 'more':   # mitzählen durch Antippen
                    f = ev("()=>{const f=ZW.CountGame.flies[0].find(f=>ZW.CountGame.counts(f));return [f.x,f.y]}"); tap(*f); time.sleep(0.2); assert ev("()=>ZW.CountGame.marks===1")
                time.sleep(0.3); shot('count_L%d_%s' % (lv, ty))
            if ty == 'more':
                j = ev("()=>{const J=ZW.CountGame.jars()[ZW.CountGame.ans];return [J.x,J.y]}"); tap(*j)
            else:
                o = ev("()=>{const G=ZW.CountGame,L=G.layout();return L.opts[G.opts.indexOf(G.ans)]}"); tap(o['x'], o['y'])
            wait("()=>ZW.CountGame.state==='right'||ZW.CountGame.winT>=0", 5); time.sleep(0.2)
        print('  count L%d ok %s' % (lv, sorted(types))); scene('World')
    def memo_game(lv):
        assert ev("()=>ZW.MemoryGame.lv") == lv; first = True
        while not ev("()=>ZW.MemoryGame.winT>=0"):
            wait("()=>ZW.MemoryGame.lock<=0&&ZW.MemoryGame.sel.length===0||ZW.MemoryGame.winT>=0")
            if ev("()=>ZW.MemoryGame.winT>=0"): break
            pr = ev("()=>{const G=ZW.MemoryGame,L=G.layout();const a=G.cards.findIndex(c=>!c.done);const b=G.cards.findIndex((c,i)=>i!==a&&!c.done&&c.pic===G.cards[a].pic);const w=G.cards.findIndex((c,i)=>i!==a&&!c.done&&c.pic!==G.cards[a].pic);return [L.pos[a],L.pos[b],w>=0?L.pos[w]:null]}")
            if first and pr[2]:   # erst ein falsches Paar
                tap(pr[0]['x'], pr[0]['y']); time.sleep(0.15); tap(pr[2]['x'], pr[2]['y']); time.sleep(0.35); shot('memo_L%d' % lv); first = False
                wait("()=>ZW.MemoryGame.sel.length===0", 5); continue
            tap(pr[0]['x'], pr[0]['y']); time.sleep(0.12); tap(pr[1]['x'], pr[1]['y']); time.sleep(0.3)
        print('  memory L%d ok' % lv); scene('World')

    page.goto('file://'+__import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','index.html'))+''); time.sleep(0.5)
    ev("()=>{localStorage.clear();ZW.Save.reset();const S=ZW.Save.data;S.name='Wolke';S.nameId='wolke';S.player={gender:'boy',skin:3,hair:0,style:8,cloth:2,name:'Ben'};S.worldV=2;S.rideTold=true;S.story=3;S.dragonFriend=true;S.dragon.state='done';for(const k of ['owl','fox','frog','dragon']){S.crystals[k]=true;S.level[k]=1}S.partyN=8;ZW.Save.store();ZW.Game.go(ZW.World,{})}")
    scene('World'); ev("()=>{ZW.World.prankCool=1e9}")
    assert ev("()=>ZW.World.gateOpen"), 'gate should be open'
    # Durch das Tor laufen
    tp(1500, 3420); ev("()=>ZW.World.walkTo(1500,3800)"); wait("()=>ZW.World.T.y>3700", 15); time.sleep(0.4)
    assert ev("()=>ZW.World.banner&&ZW.World.banner.name==='dorf'"); shot('gate_walk')
    # Mia erzählt, dann Zählen
    assert ev("()=>ZW.World.storyStep().npc==='mouse'")
    tp(1500, 4250); time.sleep(0.6); shot('village')
    tap_npc('mouse'); wait("()=>!!ZW.World.dlg"); time.sleep(0.8); shot('dialog_mia'); dialog(); scene('CountGame'); assert ev("()=>ZW.Save.data.story===4")
    count_game(0); settle()
    talk('hedgehog'); scene('MemoryGame'); memo_game(0); settle()
    # Kapitel 2 fertig: Flügel
    assert ev("()=>ZW.World.storyStep().npc==='mouse'"); talk('mouse'); settle()
    assert ev("()=>ZW.Save.data.story===5&&ZW.Save.data.wings"); time.sleep(0.5); shot('wings_village_lit')
    # Aufträge: Laternen und Kuchen
    talk('mouse', 'heart'); settle()
    for i in range(5):
        it = ev("(i)=>{const it=ZW.World.qs('mouse').items[i];return [it.x,it.y]}", i); tp(it[0] - 20, it[1]); time.sleep(0.3)
    assert ev("()=>ZW.World.questReady('mouse')"); talk('mouse'); settle(); assert ev("()=>ZW.Save.data.wear.t==='shroomhat'"); print('lanterns ok')
    talk('hedgehog', 'heart'); settle(); time.sleep(0.3)
    for i in range(6):
        it = ev("(i)=>{const it=ZW.World.qs('hedgehog').items[i];return [it.x,it.y]}", i); tp(it[0] - 20, it[1]); time.sleep(0.3)
        if i == 4: shot('gold_shroom')
    assert ev("()=>ZW.World.questReady('hedgehog')"); talk('hedgehog'); settle(); assert ev("()=>ZW.Save.data.helpers.eye===2"); print('cake ok')
    # Zauberauge im Memory, höhere Stufen
    for lv in (1, 2):
        talk('mouse', 'heart'); scene('CountGame'); count_game(lv); settle()
        talk('hedgehog'); scene('MemoryGame')
        if lv == 1:
            hb = ev("()=>helperBtn()"); tap(hb['x'], hb['y']); time.sleep(0.6); assert ev("()=>ZW.MemoryGame.peek>0&&ZW.Save.data.helpers.eye===1"); shot('memo_eye'); wait("()=>ZW.MemoryGame.peek<=0", 5)
        memo_game(lv); settle()
    print('levels', ev("()=>JSON.stringify([ZW.Save.data.level.mouse,ZW.Save.data.level.hedgehog])"))
    # Album
    pk = ev("()=>ZW.World.hud().pack"); tap(pk['x'], pk['y']); time.sleep(0.4)
    ab = ev("()=>ZW.World.packLayout().album"); tap(ab['x'], ab['y']); time.sleep(0.5); assert ev("()=>ZW.World.overlay.kind==='album'"); shot('album')
    X = ev("()=>ZW.World.ovClose()"); tap(X['x'], X['y']); time.sleep(0.2); assert ev("()=>ZW.World.overlay.kind==='pack'"); shot('pack_eye'); tap(X['x'], X['y']); time.sleep(0.2)
    # Karte zeigt das Dorf
    m = ev("()=>ZW.World.hud().map"); tap(m['x'], m['y']); time.sleep(0.5); shot('map_village'); ev("()=>{ZW.World.mapOpen=false}")
    # zurück in den Wald
    tp(1500, 3800); ev("()=>ZW.World.walkTo(1500,3420)"); wait("()=>ZW.World.T.y<3500", 15); assert ev("()=>ZW.World.banner.name==='wald'")
    ev("()=>ZW.Game.go(ZW.StartScene,{})"); time.sleep(0.9); shot('start_rainbow6')
    print('loop errors:', ev("()=>window.__zwErrors||0"), 'errors:', errs)
    b.close()
