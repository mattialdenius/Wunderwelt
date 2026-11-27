import time
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
    page=b.new_context(viewport={'width':800,'height':360},device_scale_factor=2).new_page(); ev=page.evaluate
    page.on('pageerror',lambda e: errs.append(str(e)))
    css=lambda x,y: ev("([x,y])=>{const V=ZW.View;return [(x*V.scale+V.ox)/V.dpr,(y*V.scale+V.oy)/V.dpr]}",[x,y])
    page.goto('file:///home/claude/index.html'); time.sleep(0.5)
    ev("()=>{const S=ZW.Save.data;S.name='W';S.nameId='wolke';S.player={gender:'girl',skin:1,hair:1,style:1,cloth:1,name:'Mia'};S.worldV=2;S.crystals.owl=true;S.level.owl=2;S.rideTold=true;ZW.Save.store();ZW.Game.go(ZW.World,{})}"); time.sleep(1.3)
    m=css(*ev("()=>{const M=ZW.World.hud().menu;return [M.x,M.y]}"))
    page.mouse.click(*m); time.sleep(0.4); print('short tap opens nothing:', ev("()=>ZW.Game.scene===ZW.World"))
    page.mouse.move(*m); page.mouse.down(); time.sleep(0.9); page.screenshot(path='/home/claude/test/shots/menu_hold.png'); time.sleep(0.9); page.mouse.up(); time.sleep(0.9)
    print('menu open:', ev("()=>ZW.Game.scene===ZW.StartScene&&ZW.StartScene.panel")); page.screenshot(path='/home/claude/test/shots/menu_panel.png')
    B=ev("()=>ZW.StartScene.panelBtns()"); tap=lambda q: page.mouse.click(*css(q['x'],q['y']))
    tap(B[1]); time.sleep(0.2); tap(B[1]); time.sleep(0.3)
    print('all reset:', ev("()=>ZW.Save.data.player===null&&ZW.Save.data.name===null&&!ZW.Save.data.crystals.owl"))
    s=ev("()=>ZW.StartScene.btn()"); page.mouse.click(*css(s['x'],s['y'])); time.sleep(1); print('new game starts with figure:', ev("()=>ZW.Game.scene===ZW.CharScene"))
    print('errors',errs, ev("()=>window.__zwErrors||0"))
    b.close()
