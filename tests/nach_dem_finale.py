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
    shot = lambda n: page.screenshot(path='%s/v10_%s_%dx%d.png' % (OUT, n, W, H))
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
    ev("()=>{localStorage.clear();ZW.Save.reset();const S=ZW.Save.data;S.name='Wolke';S.nameId='wolke';S.player={gender:'boy',skin:3,hair:0,style:8,cloth:2,name:'Ben'};S.worldV=2;S.rideTold=true;S.story=9;S.wings=true;S.dragonFriend=true;S.dragon.state='done';for(const k of ['owl','fox','frog','dragon','mouse','hedgehog','sheep','bird','snail','squirrel']){S.crystals[k]=true;S.level[k]=3}S.partyN=10;S.goldN=10;for(const q of ['duck','bee','bear','mole'])S.quests[q]={s:'done'};S.stars=[0,1,2,3,4,5,6];ZW.Save.store();ZW.Game.go(ZW.World,{})}")
    scene('World'); ev("()=>{ZW.World.prankCool=1e9}")
    print('progress', ev("()=>JSON.stringify(ZW.World.progress())"))
    ev("()=>ZW.World.showHint()"); print('hint', ev("()=>JSON.stringify(ZW.World.hint.target)")); assert ev("()=>!!ZW.World.hint.target.quest")
    # durchs Pilztor
    tp(1500, 3420); ev("()=>{ZW.World.hint=null;ZW.World.walkTo(1500,3800)}"); wait("()=>ZW.World.T.y>3700", 15); print('village ok')
    # zu den Wolkeninseln
    tp(5250, 1650); ev("()=>ZW.World.walkTo(5390,1650)"); wait("()=>!!ZW.World.ev", 10); wait("()=>!ZW.World.ev&&ZW.World.T.x>5700", 10); print('sky ok')
    pk = ev("()=>ZW.World.hud().pack"); tap(pk['x'], pk['y']); time.sleep(0.4); ab = ev("()=>ZW.World.packLayout().album"); tap(ab['x'], ab['y']); time.sleep(0.6); shot('album_progress')
    print('errors:', errs); b.close()
