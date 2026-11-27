import time, sys
from playwright.sync_api import sync_playwright
W,H=(int(sys.argv[1]),int(sys.argv[2])) if len(sys.argv)>2 else (800,360)
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
    page=b.new_context(viewport={'width':W,'height':H},device_scale_factor=2,has_touch=False).new_page()
    page.on('console',lambda m: errs.append(m.type+': '+m.text) if m.type in('error','warning') else None)
    page.on('pageerror',lambda e: errs.append('pageerror: '+str(e)))
    ev=page.evaluate
    css=lambda x,y: ev("([x,y])=>{const V=ZW.View;return [(x*V.scale+V.ox)/V.dpr,(y*V.scale+V.oy)/V.dpr]}",[x,y])
    tap=lambda x,y: page.mouse.click(*css(x,y))
    shot=lambda n: page.screenshot(path='/home/claude/test/shots/v4_%s_%dx%d.png'%(n,W,H))
    def wait(expr,t=30):
        end=time.time()+t
        while time.time()<end:
            if ev(expr): return
            time.sleep(0.08)
        raise Exception('timeout '+expr)
    page.goto('file:///home/claude/index.html'); time.sleep(0.6)
    ev("()=>{localStorage.clear()}"); page.reload(); time.sleep(0.6)
    s=ev("()=>ZW.StartScene.btn()"); tap(s['x'],s['y'])
    wait("()=>ZW.Game.scene===ZW.CharScene&&ZW.Game.fade<0.05"); time.sleep(0.4); shot('char_start')
    # Name eingeben über die Handy-Tastatur (hier: echte Tastatur)
    nb=ev("()=>ZW.CharScene.layout().nameBox"); tap(nb['x'],nb['y']); time.sleep(0.3)
    assert ev("()=>!!document.querySelector('input')"), 'no input'
    page.keyboard.type('Mia'); page.keyboard.press('Enter'); time.sleep(0.3)
    assert ev("()=>ZW.CharScene.name==='Mia'&&!document.querySelector('input')"), 'name'
    # Junge, Frisur Wuschel, Haar blond, Haut dunkel, Kleidung grün
    D=lambda: ev("()=>{const L=ZW.CharScene.layout();return {cats:L.cats,opt:[0,1,2,3,4,5,6,7].map(k=>L.opt(k)),ok:L.ok}}")
    d=D()
    for cat,opt in [(0,1),(1,1),(2,4),(3,4),(4,3)]:
        tap(d['cats'][cat]['x'],d['cats'][cat]['y']); time.sleep(0.15); tap(d['opt'][opt]['x'],d['opt'][opt]['y']); time.sleep(0.15)
        if cat==1: shot('char_style')
    look=ev("()=>ZW.CharScene.look"); print('look',look)
    assert look=={'gender':'boy','skin':4,'hair':4,'style':6,'cloth':3}, look
    shot('char_boy')
    tap(d['ok']['x'],d['ok']['y'])
    wait("()=>ZW.Game.scene===ZW.NamingScene&&ZW.Game.fade<0.05"); print('player saved', ev("()=>JSON.stringify(ZW.Save.data.player)"))
    # Einhorn benennen
    time.sleep(1.3); L=ev("()=>ZW.NamingScene.layout()"); tap(L['btns'][0]['x'],L['btns'][0]['y']); time.sleep(0.3); tap(L['ok']['x'],L['ok']['y'])
    wait("()=>ZW.Game.scene===ZW.World&&ZW.Game.fade<0.05"); time.sleep(0.5)
    ev("()=>{ZW.World.prankCool=1e9;ZW.World.tipT=0;ZW.Save.data.story=3;ZW.Save.data.quests={snail:{s:'done'},squirrel:{s:'done'}}}")
    def go(id, game):
        ev("(id)=>{const W=ZW.World,n=ZW.NPCS[id];W.T.x=n.x-120;W.T.y=n.y+110;if(!W.free(W.T.x,W.T.y)){const k=W.nearFree(W.T.x,W.T.y);W.T.x=(k%W.cols+.5)*20;W.T.y=(Math.floor(k/W.cols)+.5)*20}W.T.path=null;W.trail.length=0;W.camTo(1)}",id); time.sleep(0.3)
        if id=='squirrel': shot('world_squirrel')
        tap(*ev("(id)=>{const W=ZW.World,n=ZW.NPCS[id];return [(n.x-W.cam.x)*W.zoom,(n.y-45-W.cam.y)*W.zoom]}",id))
        wait("()=>ZW.Game.scene===ZW.%s&&ZW.Game.fade<0.05"%game,20)
    def read(lv):
        go('snail','ReadGame'); assert ev("()=>ZW.ReadGame.lv")==lv
        types=set(); wrong_done=False
        while not ev("()=>ZW.ReadGame.winT>=0"):
            wait("()=>ZW.ReadGame.state==='play'||ZW.ReadGame.winT>=0")
            if ev("()=>ZW.ReadGame.winT>=0"): break
            ty=ev("()=>ZW.ReadGame.type")
            if ty not in types: types.add(ty); time.sleep(0.3); shot('read_L%d_%s'%(lv,ty))
            if ty=='build':
                while ev("()=>ZW.ReadGame.state==='play'&&ZW.ReadGame.type==='build'"):
                    o=ev("()=>{const G=ZW.ReadGame,L=G.layout();const i=G.tiles.findIndex(q=>!q.used&&q.ch===G.word[G.filled]);return L.opts[i]}"); tap(o['x'],o['y']); time.sleep(0.12)
            else:
                if not wrong_done:
                    o=ev("()=>{const G=ZW.ReadGame,L=G.layout();return L.opts[(G.ansIndex()+1)%3]}"); tap(o['x'],o['y']); time.sleep(0.3); wrong_done=True
                    assert ev("()=>ZW.ReadGame.state==='play'")
                o=ev("()=>{const G=ZW.ReadGame,L=G.layout();return L.opts[G.ansIndex()]}"); tap(o['x'],o['y'])
            wait("()=>ZW.ReadGame.state==='right'||ZW.ReadGame.winT>=0",5); time.sleep(0.2)
        print('  read L%d ok, types %s'%(lv,sorted(types)))
        wait("()=>ZW.Game.scene===ZW.World&&ZW.Game.fade<0.05",15)
    def math(lv):
        go('squirrel','MathGame'); assert ev("()=>ZW.MathGame.lv")==lv
        n=0
        while not ev("()=>ZW.MathGame.winT>=0"):
            wait("()=>ZW.MathGame.state==='play'||ZW.MathGame.winT>=0")
            if ev("()=>ZW.MathGame.winT>=0"): break
            t=ev("()=>{const T=ZW.MathGame.task;return [T.a,T.op,T.b,T.total,T.ans]}")
            a,op,bb,tot,ans=t
            assert (op=='+' and a+bb==ans) or (op=='-' and a-bb==ans) or (op=='fill' and a+ans==tot), t
            assert 0<=ans<=20 and (op!='fill' or tot<=20) and (op!='+' or a+bb<=20), t
            if n==1: time.sleep(0.3); shot('math_L%d'%lv)
            if n==2 and lv==2:   # falsche Antwort -> Hilfe zeigt Nüsse
                o=ev("()=>{const G=ZW.MathGame,L=G.layout();return L.opts[(G.opts.indexOf(G.task.ans)+1)%G.opts.length]}"); tap(o['x'],o['y']); time.sleep(0.2); tap(o['x'],o['y']); time.sleep(0.4)
                assert ev("()=>ZW.MathGame.help"); shot('math_help')
            o=ev("()=>{const G=ZW.MathGame,L=G.layout();return L.opts[G.opts.indexOf(G.task.ans)]}"); tap(o['x'],o['y']); n+=1
            wait("()=>ZW.MathGame.state==='right'||ZW.MathGame.winT>=0",5); time.sleep(0.2)
        print('  math L%d ok'%lv)
        wait("()=>ZW.Game.scene===ZW.World&&ZW.Game.fade<0.05",15)
    def settle():
        wait("()=>!ZW.World.blocked()&&!ZW.World.ev&&!ZW.World.storyDirty",30)
    for lv in range(3):
        read(lv); settle(); math(lv); settle()
    print('levels', ev("()=>JSON.stringify(ZW.Save.data.level)"))
    shot('world_hud6')
    # Lesen & Rechnen abschalten: Figuren verschwinden, Rucksack hat 4 Plätze
    ev("()=>{ZW.Save.data.learn=false}"); time.sleep(0.3); shot('world_learn_off')
    print('npcs off:', ev("()=>JSON.stringify(npcOrder())"))
    ev("()=>{ZW.Save.data.learn=true;ZW.Game.go(ZW.StartScene,{})}"); time.sleep(1); shot('start_named')
    # Eltern-Bereich: Schalter
    g=css(*ev("()=>{const g=ZW.StartScene.gear();return [g.x,g.y]}")); page.mouse.move(*g); page.mouse.down(); time.sleep(1.8); page.mouse.up(); time.sleep(0.2)
    B=ev("()=>ZW.StartScene.panelBtns()"); tap(B[2]['x'],B[2]['y']); time.sleep(0.2); shot('panel4')
    assert ev("()=>ZW.Save.data.learn===false"); tap(B[2]['x'],B[2]['y']); assert ev("()=>ZW.Save.data.learn===true")
    tap(B[3]['x'],B[3]['y']); time.sleep(0.2)
    # Figur später ändern: Knopf oben links
    cb=ev("()=>ZW.StartScene.charBtn()"); tap(cb['x'],cb['y']); wait("()=>ZW.Game.scene===ZW.CharScene&&ZW.Game.fade<0.05")
    assert ev("()=>ZW.CharScene.name==='Mia'&&ZW.CharScene.look.gender==='boy'")
    d=D(); tap(d['ok']['x'],d['ok']['y']); wait("()=>ZW.Game.scene===ZW.StartScene&&ZW.Game.fade<0.05"); print('edit flow ok')
    print('loop errors',ev("()=>window.__zwErrors||0"),'errors',errs)
    b.close()
