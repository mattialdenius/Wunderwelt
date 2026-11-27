import time
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
    page=b.new_context(viewport={'width':800,'height':360},device_scale_factor=2).new_page(); ev=page.evaluate; errs=[]
    page.on('pageerror', lambda e: errs.append(str(e)))
    css=lambda x,y: ev("([x,y])=>{const V=ZW.View;return [(x*V.scale+V.ox)/V.dpr,(y*V.scale+V.oy)/V.dpr]}",[x,y])
    page.goto('file://'+__import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','index.html'))); time.sleep(0.5)
    ev("()=>{localStorage.clear();ZW.Save.reset();const S=ZW.Save.data;S.name='Wolke';S.nameId='wolke';S.player={gender:'girl',skin:1,hair:1,style:5,cloth:1,name:'Lina'};S.worldV=2;S.rideTold=true;S.story=1;ZW.Save.store();ZW.Game.go(ZW.StartScene,{panel:true})}"); time.sleep(0.8)
    page.screenshot(path='/tmp/ton_all.png')
    B=ev("()=>ZW.StartScene.panelBtns()[3]")
    # Sfx-Aufrufe zählen
    ev("()=>{window.__sfx=0;const o=ZW.Sfx?null:null}")
    res=[]
    for _ in range(3):
        page.mouse.click(*css(B['x'],B['y'])); time.sleep(0.4); res.append(ev("()=>ZW.Save.data.sound"))
        if res[-1]=='off': page.screenshot(path='/tmp/ton_off.png')
    print('cycle', res)
    page.mouse.click(*css(B['x'],B['y'])); page.mouse.click(*css(B['x'],B['y'])); time.sleep(0.3)  # -> voice -> off
    print('now', ev("()=>ZW.Save.data.sound"))
    ev("()=>{ZW.Save.resetProgress();}"); print('after Kristalle neu', ev("()=>ZW.Save.data.sound"))
    ev("()=>{const S=ZW.Save.data;S.story=0;S.worldV=2;S.rideTold=true;ZW.Game.go(ZW.World,{})}"); time.sleep(1.2)
    ev("()=>{ZW.World.prankCool=1e9;ZW.World.talkTo('owl')}"); n=0
    for _ in range(60):
        d=ev("()=>{const W=ZW.World;if(!W.dlg)return null;const D=W.dlgLayout();return {t:W.dlg.t,bx:D.bx,by:D.by,ch:!!D.choice}}")
        if not d: break
        if d['ch']: break
        if d['t']>0.6: page.mouse.click(*css(d['bx'],d['by'])); n+=1
        time.sleep(0.15)
    print('dialog taps', n, 'scene', ev("()=>{for(const k in ZW) if(ZW[k]===ZW.Game.scene) return k}"), 'speaking', ev("()=>window.speechSynthesis.speaking"))
    ev("()=>{ZW.Save.reset()}"); print('after reset', ev("()=>ZW.Save.data.sound"))
    print('errors', errs); b.close()
