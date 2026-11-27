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
    shot = lambda n: page.screenshot(path='%s/v3_%s.png' % (OUT, n))
    def wait(expr, t=30):
        end = time.time() + t
        while time.time() < end:
            if ev(expr): return
            time.sleep(0.08)
        raise Exception('timeout ' + expr)
    def in_world(): wait("()=>ZW.Game.scene===ZW.World&&ZW.Game.fade<0.05")
    def settle():
        for _ in range(6):
            wait("()=>!ZW.World.blocked()&&!ZW.World.ev&&!ZW.World.storyDirty", 40)
            if ev("()=>!!ZW.World.crystalGround"):
                g = ev("()=>{const W=ZW.World,g=W.crystalGround;return [g.x-W.cam.x,g.y-16-W.cam.y]}"); tap(*g)
                wait("()=>ZW.Save.data.dragon.state==='done'", 20); continue
            time.sleep(0.3)
            if ev("()=>!ZW.World.blocked()&&!ZW.World.ev&&!ZW.World.storyDirty&&!ZW.World.crystalGround"): return
    def no_pranks(): ev("()=>{const W=ZW.World;W.prankCool=1e9;if(W.prank){W.dragonHome();W.prankCool=1e9}}")
    def go_npc(id, game):
        no_pranks()
        if id == 'dragon':
            ev("()=>{const W=ZW.World,D=W.dragon;W.T.x=D.x-140;W.T.y=D.y+90;W.T.path=null;W.trail.length=0;W.camTo(1)}"); time.sleep(0.25)
            tap(*ev("()=>{const W=ZW.World,D=W.dragon;return [D.x-W.cam.x,D.y-70-W.cam.y]}"))
        else:
            ev("(id)=>{const W=ZW.World,n=ZW.NPCS[id];W.T.x=n.x-120;W.T.y=n.y+110;if(!W.free(W.T.x,W.T.y)){const k=W.nearFree(W.T.x,W.T.y);W.T.x=(k%W.cols+.5)*20;W.T.y=(Math.floor(k/W.cols)+.5)*20}W.T.path=null;W.trail.length=0;W.camTo(1)}", id); time.sleep(0.25)
            tap(*ev("(id)=>{const W=ZW.World,n=ZW.NPCS[id];return [n.x-W.cam.x,n.y-45-n.lift-W.cam.y]}", id))
        wait("()=>ZW.Game.scene===ZW.%s&&ZW.Game.fade<0.05" % game)
    def owl(lv):
        go_npc('owl', 'OwlGame'); assert ev("()=>ZW.OwlGame.lv") == lv
        k = 0
        while not ev("()=>ZW.OwlGame.winT>=0"):
            wait("()=>ZW.OwlGame.state==='choose'||ZW.OwlGame.winT>=0")
            if ev("()=>ZW.OwlGame.winT>=0"): break
            if ev("()=>ZW.OwlGame.gaps.length>1&&ZW.OwlGame.gi===0") and not k: shot('owl2gaps_L%d' % lv); k = 1
            c = ev("()=>{const G=ZW.OwlGame,L=G.layout();return L.opts[G.opts.indexOf(G.ans)]}"); tap(c['x'], c['y']); time.sleep(0.6)
        in_world()
    def fox(lv):
        go_npc('fox', 'FoxGame')
        for r in range(2):
            wait("()=>ZW.FoxGame.round===%d&&ZW.FoxGame.nextT<0" % r); time.sleep(0.5)
            n = ev("()=>ZW.FoxGame.n")
            if r == 1: shot('fox_L%d_r2' % lv)
            if ev("()=>ZW.FoxGame.m>ZW.FoxGame.n"):   # erst auf den Täusch-Schatten ziehen
                q = ev("()=>{const G=ZW.FoxGame,L=G.layout();const j=G.slots.indexOf(-1);return [G.items[0].x,G.items[0].y,L.slot[j].x,L.slot[j].y]}")
                a = css(q[0], q[1]); d = css(q[2], q[3]); page.mouse.move(*a); page.mouse.down(); page.mouse.move(*d, steps=6); page.mouse.up(); time.sleep(0.5)
                assert not ev("()=>ZW.FoxGame.items[0].placed"), 'decoy accepted'
            for i in range(n):
                q = ev("(i)=>{const G=ZW.FoxGame,L=G.layout();const j=G.slots.indexOf(i);return [G.items[i].x,G.items[i].y,L.slot[j].x,L.slot[j].y]}", i)
                a = css(q[0], q[1]); d = css(q[2], q[3]); page.mouse.move(*a); page.mouse.down(); page.mouse.move(*d, steps=6); page.mouse.up(); time.sleep(0.4)
                assert ev("(i)=>ZW.FoxGame.items[i].placed", i), 'fox item %d round %d' % (i, r)
        in_world()
    def frog(lv):
        go_npc('frog', 'FrogGame'); assert ev("()=>ZW.FrogGame.lv") == lv
        ev("""()=>{const G=ZW.FrogGame,K=ZW.Input.keys;window.__bot=setInterval(()=>{if(ZW.Game.scene!==G||G.winT>=0){K.delete('ArrowRight');K.delete('Space');clearInterval(window.__bot);return}
          K.add('ArrowRight');const p=G.p;const pl=G.pl.find(q=>p.x>q.x-10&&p.x<q.x+q.w+10&&Math.abs(p.y-q.y)<2);
          if(pl&&p.ground&&p.x>pl.x+pl.w-30&&pl!==G.pl[G.pl.length-1])K.add('Space');else K.delete('Space');
          const s=G.stars.find(s=>!s.got&&Math.abs(s.x-p.x)<26&&s.y<p.y-100&&s.y>p.y-200);if(s&&p.ground)K.add('Space');},8)}""")
        time.sleep(6); shot('frog_L%d' % lv)
        wait("()=>ZW.FrogGame.winT>=0", 180)
        print('  frog L%d: platforms %d stars %s/%s falls %s springs %d' % (lv, ev("()=>ZW.FrogGame.pl.length"), ev("()=>ZW.FrogGame.got"), ev("()=>ZW.FrogGame.stars.length"), ev("()=>ZW.FrogGame.falls"), ev("()=>ZW.FrogGame.pl.filter(p=>p.spring).length")))
        in_world()
    def dragon(lv):
        go_npc('dragon', 'DragonGame'); assert ev("()=>ZW.DragonGame.lv") == lv
        shotted = False; bunnies = 0; t0 = time.time()
        while not ev("()=>ZW.DragonGame.winT>=0"):
            o = ev("()=>{const G=ZW.DragonGame,L=G.layout();for(const o of G.pops){if(!o.caught&&G.popP(o)>0.8){const s=L.spots[o.spot];return [o.who,s.x,s.y-72*s.s]}}return null}")
            if o:
                if o[0] == 'bunny' and bunnies < 1: bunnies += 1; tap(o[1], o[2]); time.sleep(0.1); continue
                if o[0] == 'dragon':
                    if not shotted: shot('dragon_L%d' % lv); shotted = True
                    tap(o[1], o[2]); time.sleep(0.15)
            time.sleep(0.05)
            assert time.time() - t0 < 120, 'dragon game too long'
        print('  dragon L%d: got %d in %.0fs, slow %.2f' % (lv, ev("()=>ZW.DragonGame.got"), time.time() - t0, ev("()=>ZW.DragonGame.slow")))
        in_world()

    page.goto('file:///home/claude/index.html'); time.sleep(0.6)
    # alter Spielstand (kleine Welt, Kristall gerade geklaut) wird sauber übernommen
    ev("()=>{localStorage.setItem('zauberwald_save_v1',JSON.stringify({name:'Wolke',nameId:'wolke',crystals:{owl:true,fox:true,frog:false},level:{owl:1,fox:1,frog:0},dragon:{state:'dropped',x:300,y:400,who:'owl'},celebrated:false,pos:{x:420,y:700}}))}")
    page.reload(); time.sleep(0.6)
    s = ev("()=>ZW.StartScene.btn()"); tap(s['x'], s['y'])
    wait("()=>ZW.Game.scene===ZW.CharScene&&ZW.Game.fade<0.05"); ok = ev("()=>ZW.CharScene.layout().ok"); tap(ok['x'], ok['y'])   # alter Stand: erst Figur anlegen
    in_world(); time.sleep(0.5)
    assert ev("()=>ZW.Save.data.dragon.state==='done'&&ZW.Save.data.dragonFriend&&!ZW.World.crystalGround&&ZW.World.T.x===1500"), 'migration'
    print('migration ok')
    ev("()=>{ZW.Save.reset();ZW.Save.data.name='Wolke';ZW.Save.data.nameId='wolke';ZW.Save.data.worldV=2;ZW.Save.data.learn=false;ZW.Save.data.story=3;ZW.Save.data.player={gender:'girl',skin:2,hair:0,style:5,cloth:2,name:'Test'};ZW.Save.store()}")
    page.reload(); time.sleep(0.5); s = ev("()=>ZW.StartScene.btn()"); tap(s['x'], s['y']); in_world()

    # Reiten, Karte, Glitzerstern
    ev("()=>{ZW.World.tipT=0}"); no_pranks()
    u = ev("()=>{const W=ZW.World;return [W.U.x-W.cam.x,W.U.y-45-W.cam.y]}"); tap(*u); time.sleep(0.4)
    assert ev("()=>ZW.World.ride"), 'ride'
    m = ev("()=>ZW.World.hud().map"); tap(m['x'], m['y']); time.sleep(0.4); assert ev("()=>ZW.World.mapOpen"); shot('map')
    tgt = ev("()=>{const M=ZW.World.mapRect();return [M.x+3300*M.m,M.y+1880*M.m]}"); tap(*tgt); time.sleep(0.3)
    assert ev("()=>!ZW.World.mapOpen&&!!ZW.World.T.path"), 'map travel'
    wait("()=>!ZW.World.T.path", 30); print('map travel ok ->', ev("()=>[Math.round(ZW.World.T.x),Math.round(ZW.World.T.y)]"))
    shot('ride_bridge')
    tap(*ev("()=>{const W=ZW.World;return [(W.T.x-W.cam.x)*W.zoom,(W.T.y-55-W.cam.y)*W.zoom]}")); time.sleep(0.3); assert not ev("()=>ZW.World.ride"), 'dismount'
    wait("()=>ZW.World.zoom===1", 10)
    ev("()=>{const W=ZW.World,s=W.glitter[13];W.T.x=s.x-80;W.T.y=s.y;W.camTo(1)}"); time.sleep(0.2)
    tap(*ev("()=>{const W=ZW.World,s=W.glitter[13];return [s.x-W.cam.x,s.y-20-W.cam.y]}")); wait("()=>ZW.World.starsFound()===1", 10); print('glitter star ok')

    for lv in range(3):
        owl(lv); settle(); fox(lv); settle()
        if lv == 0:
            assert ev("()=>ZW.Save.data.dragonFriend"), 'dragon story did not happen'
            # Streiche: Anmalen, Verstecken, Besuch
            ev("()=>{const W=ZW.World;W.T.x=1500;W.T.y=1850;W.T.path=null;W.camTo(1);W.prank=W.prankPaint();W.dragon.mode='away';W.dragon.fly=true}")
            time.sleep(2.2); shot('prank_paint'); wait("()=>!ZW.World.prank", 20)
            ev("()=>{const W=ZW.World,b=W.bushes.find(b=>!W.trees.some(tr=>tr.y>b.y-10&&tr.y-b.y<115&&Math.abs(tr.x-b.x)<60)&&W.free(b.x-260,b.y));W.T.x=b.x-260;W.T.y=b.y;W.T.path=null;W.camTo(1)}"); time.sleep(0.3)
            ev("()=>{const W=ZW.World;W.prank=W.prankHide();W.dragon.mode='away';W.dragon.fly=true}")
            wait("()=>ZW.World.prank&&ZW.World.prank.kind==='hide'&&ZW.World.prank.bush.dragon", 15); time.sleep(1.5); shot('prank_hide')
            bb = ev("()=>{const W=ZW.World,b=W.prank.bush;return [b.x-W.cam.x,b.y-18-W.cam.y]}"); tap(*bb); time.sleep(0.5)
            assert ev("()=>ZW.World.hint&&ZW.World.hint.target.star"), 'dragon gift hint'
            wait("()=>!ZW.World.prank", 20)
            ev("()=>{const W=ZW.World;W.prank=W.prankVisit();W.dragon.mode='away';W.dragon.fly=true}")
            wait("()=>ZW.World.dragon.mode==='visit'", 15); time.sleep(0.6); shot('prank_visit')
            d = ev("()=>{const W=ZW.World,D=W.dragon;return [D.x-W.cam.x,D.y-50-W.cam.y]}"); tap(*d)
            wait("()=>ZW.Game.scene===ZW.DragonGame&&ZW.Game.fade<0.05", 15); print('visit -> dragon game ok')
            e = ev("()=>miniExit()") if False else None
            tap(*ev("()=>{const r=Math.max(ZW.View.btn/2-6,44);return [14+r,14+r]}")); in_world(); settle()
            ev("()=>{const W=ZW.World;W.stoleOnce=false;W.prankCool=0;W.T.x=1500;W.T.y=1850;W.camTo(1)}")
            ev("()=>{const W=ZW.World;W.queue.push(()=>W.evDragon(true));W.stoleOnce=true}")
            wait("()=>!!ZW.World.crystalGround&&!ZW.World.blocked()", 20); settle(); print('second steal ok')
        frog(lv); settle(); dragon(lv)
        time.sleep(2.5); shot('world_after_L%d' % lv); settle()
        print('level', lv, '->', ev("()=>JSON.stringify(ZW.Save.data.level)"), 'party', ev("()=>ZW.Save.data.partyN"), 'gold', ev("()=>ZW.Save.data.goldN"))
    assert ev("()=>ZW.Save.data.goldN===4&&ZW.World.packLv('dragon')===3")
    print('loop errors:', ev("()=>window.__zwErrors||0"), 'errors:', errs)
    b.close()
