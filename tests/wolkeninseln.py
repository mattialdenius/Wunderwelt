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
    shot = lambda n: page.screenshot(path='%s/v8_%s_%dx%d.png' % (OUT, n, W, H))
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


    def size_game(lv):
        assert ev("()=>ZW.SizeGame.lv") == lv; seen=set()
        while not ev("()=>ZW.SizeGame.winT>=0"):
            wait("()=>ZW.SizeGame.state==='play'||ZW.SizeGame.winT>=0")
            if ev("()=>ZW.SizeGame.winT>=0"): break
            k = ev("()=>ZW.SizeGame.plan[ZW.SizeGame.round]")
            if k not in seen:
                seen.add(k); time.sleep(0.4)
                w = ev("()=>{const G=ZW.SizeGame,i=G.order[G.order.length-1],p=G.pos(G.clouds[i]);return [p.x,p.y]}"); tap(*w); time.sleep(0.2)
                assert ev("()=>ZW.SizeGame.next===0"), 'wrong pick accepted'
                shot('size_L%d_%d' % (lv, k))
            while ev("()=>ZW.SizeGame.state==='play'"):
                q = ev("()=>{const G=ZW.SizeGame,c=G.clouds[G.order[G.next]],p=G.pos(c);return [p.x,p.y]}"); tap(*q); time.sleep(0.15)
            time.sleep(0.2)
        print('  size L%d ok' % lv, sorted(seen)); scene('World')
    def melody_game(lv):
        assert ev("()=>ZW.MelodyGame.lv") == lv; first = True
        while not ev("()=>ZW.MelodyGame.winT>=0"):
            wait("()=>ZW.MelodyGame.state==='you'||ZW.MelodyGame.winT>=0", 30)
            if ev("()=>ZW.MelodyGame.winT>=0"): break
            S = ev("()=>ZW.MelodyGame.stars().map(s=>[s.x,s.y])"); seq = ev("()=>ZW.MelodyGame.seq")
            if first:
                shot('melody_L%d' % lv); first = False
                tap(*S[(seq[0] + 1) % len(S)]); time.sleep(0.2); assert ev("()=>ZW.MelodyGame.state==='listen'"), 'wrong note not replayed'; continue
            for i in seq: tap(*S[i]); time.sleep(0.12)
            wait("()=>ZW.MelodyGame.state==='right'||ZW.MelodyGame.winT>=0", 5)
        print('  melody L%d ok' % lv); scene('World')

    page.goto('file://'+__import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','index.html'))); time.sleep(0.5)
    ev("()=>{localStorage.clear();ZW.Save.reset();const S=ZW.Save.data;S.name='Wolke';S.nameId='wolke';S.player={gender:'girl',skin:1,hair:2,style:3,cloth:4,name:'Lina'};S.worldV=2;S.rideTold=true;S.story=4;S.dragonFriend=true;S.dragon.state='done';for(const k of ['owl','fox','frog','dragon','mouse','hedgehog']){S.crystals[k]=true;S.level[k]=1}S.partyN=10;ZW.Save.store();ZW.Game.go(ZW.World,{})}")
    scene('World'); ev("()=>{ZW.World.prankCool=1e9}")
    # ohne Flügel: Startplatz sagt Bescheid
    tp(5250, 1650); ev("()=>ZW.World.walkTo(5390,1650)"); time.sleep(1.5); assert ev("()=>ZW.World.T.x<5600&&!ZW.World.ev"); shot('pad_no_wings')
    ev("()=>{const S=ZW.Save.data;S.story=5;S.wings=true;ZW.Save.store()}")
    # Hinweis führt zum Startplatz
    tp(4600, 2000); ev("()=>ZW.World.showHint()"); assert ev("()=>ZW.World.hint&&ZW.World.hint.target.pad"), 'hint not to pad'
    tp(5250, 1650); ev("()=>{ZW.World.hint=null;ZW.World.walkTo(5390,1650)}"); wait("()=>!!ZW.World.ev", 10); time.sleep(1.6); shot('flying')
    wait("()=>!ZW.World.ev&&ZW.World.T.x>5700", 10); time.sleep(0.5); assert ev("()=>ZW.World.banner&&ZW.World.banner.name==='wolken'"); shot('land')
    ev("()=>ZW.World.showHint()"); assert ev("()=>ZW.World.hint&&ZW.World.hint.target.npc==='sheep'"), 'hint not to sheep'
    tp(6600, 1000); time.sleep(0.5); shot('isle_sheep')
    tap_npc('sheep'); wait("()=>!!ZW.World.dlg"); time.sleep(0.8); shot('dialog_wolli'); dialog(); scene('SizeGame'); assert ev("()=>ZW.Save.data.story===6")
    size_game(0); settle()
    talk('bird'); scene('MelodyGame'); melody_game(0); settle()
    assert ev("()=>ZW.World.storyStep().npc==='bird'"); talk('bird'); settle(); assert ev("()=>ZW.Save.data.story===7"); print('story 7 ok')
    # Aufträge: Lämmchen und Regentropfen
    talk('sheep', 'heart'); settle()
    for i in range(3):
        it = ev("(i)=>{const it=ZW.World.qs('sheep').items[i];return [it.x,it.y]}", i); tp(it[0] - 20, it[1]); time.sleep(0.35)
        if i == 0: pass
    assert ev("()=>ZW.World.questReady('sheep')"); talk('sheep'); settle(); assert ev("()=>ZW.Save.data.wear.t==='cloudhat'"); print('lambs ok')
    talk('puff', 'heart'); settle()
    for i in range(5):
        it = ev("(i)=>{const it=ZW.World.qs('puff').items[i];return [it.x,it.y]}", i)
        if i == 2: tp(it[0] - 90, it[1]); time.sleep(0.4); shot('drop')
        tp(it[0] - 20, it[1]); time.sleep(0.35)
    assert ev("()=>ZW.World.questReady('puff')"); talk('puff'); settle(); assert ev("()=>ZW.Save.data.wear.uni==='stars'"); print('drops ok')
    tp(6900, 2700); time.sleep(0.6); shot('hats')
    for lv in (1, 2):
        talk('sheep'); scene('SizeGame'); size_game(lv); settle()
        talk('bird'); scene('MelodyGame')
        if lv == 1: hb = ev("()=>helperBtn()"); tap(hb['x'], hb['y']) if ev("()=>ZW.Save.data.helpers.feather>0") else None
        melody_game(lv); settle()
    print('levels', ev("()=>JSON.stringify([ZW.Save.data.level.sheep,ZW.Save.data.level.bird])"))
    m = ev("()=>ZW.World.hud().map"); tap(m['x'], m['y']); time.sleep(0.5); shot('map_sky'); ev("()=>{ZW.World.mapOpen=false}")
    pk = ev("()=>ZW.World.hud().pack"); tap(pk['x'], pk['y']); time.sleep(0.4); ab = ev("()=>ZW.World.packLayout().album"); tap(ab['x'], ab['y']); time.sleep(0.5); shot('album3'); ev("()=>{ZW.World.overlay=null}")
    # Rückflug
    tp(6050, 1660); ev("()=>ZW.World.walkTo(5900,1660)"); wait("()=>!!ZW.World.ev", 10); wait("()=>!ZW.World.ev&&ZW.World.T.x<5600", 10); time.sleep(0.4); assert ev("()=>ZW.World.banner.name==='wald'"); shot('back_forest')
    ev("()=>ZW.Game.go(ZW.StartScene,{})"); time.sleep(0.9); shot('start_rainbow8')
    print('loop errors:', ev("()=>window.__zwErrors||0"), 'errors:', errs)
    b.close()
