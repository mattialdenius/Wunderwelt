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
    shot = lambda n: page.screenshot(path='%s/v9_%s_%dx%d.png' % (OUT, n, W, H))
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

    page.goto('file://'+__import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','index.html'))); time.sleep(0.5)
    ev("()=>{localStorage.clear();ZW.Save.reset();const S=ZW.Save.data;S.name='Wolke';S.nameId='wolke';S.player={gender:'girl',skin:1,hair:2,style:3,cloth:4,name:'Lina'};S.worldV=2;S.rideTold=true;S.story=7;S.wings=true;S.dragonFriend=true;S.dragon.state='done';for(const k of ['owl','fox','frog','dragon','mouse','hedgehog','sheep','bird']){S.crystals[k]=true;S.level[k]=1}S.partyN=10;S.wallet=3;ZW.Save.store();ZW.Game.go(ZW.World,{})}")
    scene('World')
    ev("()=>ZW.World.showHint()"); assert ev("()=>ZW.World.hint.target.npc==='dragon'"), 'hint to funki'
    ev("()=>{ZW.World.hint=null}")
    D = ev("()=>[ZW.World.dragon.x,ZW.World.dragon.y]"); tp(D[0] - 120, D[1] + 80)
    tap(*world_pos(D[0], D[1] - 60)); wait("()=>!!ZW.World.dlg", 15); dialog()
    assert ev("()=>ZW.Save.data.story===8")
    wait("()=>ZW.World.dragon.mode==='visit'&&Math.abs(ZW.World.dragon.x-5090)<5", 20); print('funki at altar')
    ev("()=>ZW.World.showHint()"); assert ev("()=>ZW.World.hint.target.npc==='dragon'"); ev("()=>{ZW.World.hint=null}")
    tp(4980, 900); ev("()=>ZW.World.walkTo(4980,730)"); time.sleep(2.0); shot('berg')
    assert ev("()=>ZW.World.area==='berg'")
    D = ev("()=>[ZW.World.dragon.x,ZW.World.dragon.y]"); tap(*world_pos(D[0], D[1] - 50)); wait("()=>!!ZW.World.dlg", 15); dialog()
    scene('FinaleScene'); time.sleep(0.6); shot('fin_build')
    for i in range(8):
        q = ev("(i)=>{const p=ZW.FinaleScene.pieces[i],t=ZW.FinaleScene.t;return [p.x,p.y+Math.sin(t*2+p.ph)*8]}", i); tap(*q); time.sleep(0.25)
        if i == 4: time.sleep(0.3); shot('fin_half')
    wait("()=>ZW.FinaleScene.phase==='shine'", 10); time.sleep(3); shot('fin_shine')
    wait("()=>ZW.FinaleScene.phase==='fest'", 12); time.sleep(1.5); tap(300, 120); tap(500, 90); time.sleep(0.4); shot('fest')
    wait("()=>ZW.FinaleScene.phase==='cert'", 15); time.sleep(1); shot('cert')
    h = ev("()=>ZW.FinaleScene.homeBtn()"); tap(h['x'], h['y']); scene('World'); time.sleep(1)
    assert ev("()=>ZW.Save.data.story===9&&ZW.Save.data.wallet===13"), 'finale reward'
    assert ev("()=>ZW.World.area==='berg'&&ZW.World.dragon.mode==='home'")
    tp(4980, 900); time.sleep(0.6); shot('berg_rainbow')
    ev("()=>ZW.World.showHint()"); print('hint after finale:', ev("()=>JSON.stringify(ZW.World.hint&&ZW.World.hint.target)"))
    ev("()=>{ZW.World.hint=null}")
    pk = ev("()=>ZW.World.hud().pack"); tap(pk['x'], pk['y']); time.sleep(0.4); shot('pack_cert')
    cb = ev("()=>ZW.World.packLayout().cert"); tap(cb['x'], cb['y']); scene('FinaleScene'); assert ev("()=>ZW.FinaleScene.again&&ZW.FinaleScene.phase==='fest'")
    wait("()=>ZW.FinaleScene.phase==='cert'", 10); h = ev("()=>ZW.FinaleScene.homeBtn()"); tap(h['x'], h['y']); scene('World')
    assert ev("()=>ZW.Save.data.wallet===13"), 'no double reward'
    ev("()=>ZW.Game.go(ZW.StartScene,{})"); time.sleep(0.9); shot('start_final')
    print('loop errors:', ev("()=>window.__zwErrors||0"), 'errors:', errs)
    b.close()
