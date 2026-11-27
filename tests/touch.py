import time
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
    ctx=b.new_context(viewport={'width':780,'height':360},device_scale_factor=3,has_touch=True,is_mobile=True)
    page=ctx.new_page()
    page.on('console',lambda m: errs.append(m.type+': '+m.text) if m.type=='error' else None)
    page.on('pageerror',lambda e: errs.append('pageerror: '+str(e)))
    page.goto('file:///home/claude/index.html'); time.sleep(0.8)
    css=lambda x,y: page.evaluate("([x,y])=>{const V=ZW.View;return [(x*V.scale+V.ox)/V.dpr,(y*V.scale+V.oy)/V.dpr]}",[x,y])
    s=page.evaluate("()=>ZW.StartScene.btn()"); page.touchscreen.tap(*css(s['x'],s['y'])); time.sleep(1.5)
    print('scene naming:',page.evaluate("()=>ZW.Game.scene===ZW.NamingScene"))
    # direkt ins Froschspiel, zwei Finger gleichzeitig: rechts halten + springen
    page.evaluate("()=>{ZW.Save.data.name='Wolke';ZW.Save.data.nameId='wolke';ZW.Game.go(ZW.FrogGame,{})}"); time.sleep(1.2)
    B=page.evaluate("()=>ZW.FrogGame.btns()"); r=css(B['r']['x'],B['r']['y']); j=css(B['j']['x'],B['j']['y'])
    cdp=ctx.new_cdp_session(page)
    x0=page.evaluate("()=>ZW.FrogGame.p.x")
    cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':r[0],'y':r[1],'id':1}]}); time.sleep(0.5)
    cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':r[0],'y':r[1],'id':1},{'x':j[0],'y':j[1],'id':2}]}); time.sleep(0.15)
    air=page.evaluate("()=>!ZW.FrogGame.p.ground"); x1=page.evaluate("()=>ZW.FrogGame.p.x")
    cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]}); time.sleep(0.6)
    x2=page.evaluate("()=>ZW.FrogGame.p.x"); time.sleep(0.3); x3=page.evaluate("()=>ZW.FrogGame.p.x")
    print('moved while holding:',x1>x0+60,'| jumped with 2nd finger:',air,'| stops after release:',abs(x3-x2)<1, '| pointers left:',page.evaluate("()=>ZW.Input.pointers.size"))
    # Hochformat: Dreh-Hinweis, kein Fehler
    page.set_viewport_size({'width':360,'height':780}); time.sleep(0.5); print('portrait flag:',page.evaluate("()=>ZW.View.portrait")); page.screenshot(path='test/shots/portrait.png')
    page.set_viewport_size({'width':780,'height':360}); time.sleep(0.4)
    # ohne Sprachausgabe / ohne localStorage darf nichts kaputtgehen
    page.evaluate("()=>{ZW.Voice.synth=null;ZW.Voice.say('good');ZW.CONFIG.saveKey='x';Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}});ZW.Save.store();ZW.Save.load();}")
    print('loop errors:',page.evaluate("()=>window.__zwErrors||0"),'errors:',errs)
    b.close()
