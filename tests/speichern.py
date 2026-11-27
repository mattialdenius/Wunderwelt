import time, json
from playwright.sync_api import sync_playwright
import os
URL='file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','index.html'))
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
    ctx=b.new_context(viewport={'width':800,'height':360},device_scale_factor=2)
    page=ctx.new_page(); ev=page.evaluate; page.goto(URL); time.sleep(0.5)
    ev("()=>{localStorage.clear();ZW.Save.reset();const S=ZW.Save.data;S.name='Wolke';S.nameId='wolke';S.player={gender:'boy',skin:2,hair:1,style:8,cloth:3,name:'Ben'};S.worldV=2;S.rideTold=true;S.story=5;S.wings=true;for(const k of ['owl','fox','frog','dragon','mouse','hedgehog']){S.crystals[k]=true;S.level[k]=1};S.partyN=8;ZW.Save.store();ZW.Game.go(ZW.World,{})}")
    time.sleep(1.2); ev("()=>{ZW.World.prankCool=1e9}")
    # Auftrag annehmen, eine Laterne anzünden, Glitzerstern einsammeln, dann irgendwo hinlaufen
    ev("()=>{ZW.World.acceptQuest('mouse')}"); time.sleep(0.5)
    ev("()=>{const W=ZW.World,it=W.qs('mouse').items[0];W.T.x=it.x;W.T.y=it.y}"); time.sleep(0.5)
    ev("()=>{const W=ZW.World,s=W.glitter[3];W.T.x=s.x;W.T.y=s.y}"); time.sleep(0.6)
    ev("()=>{const W=ZW.World;W.T.x=2400;W.T.y=4300;W.T.path=null}"); time.sleep(0.5)
    before=ev("()=>JSON.stringify({pos:[ZW.World.T.x,ZW.World.T.y],stars:ZW.Save.data.stars,wallet:ZW.Save.data.wallet,lamp:ZW.Save.data.quests.mouse,name:ZW.Save.data.player.name,story:ZW.Save.data.story})")
    page.close(run_before_unload=True); time.sleep(0.3)
    page=ctx.new_page(); ev=page.evaluate; page.goto(URL); time.sleep(0.8)
    page.screenshot(path='/tmp/v7_resume_start.png')
    S=json.loads(ev("()=>JSON.stringify(ZW.Save.data)"))
    ev("()=>ZW.Game.go(ZW.World,{back:true})"); time.sleep(1.2)
    after=ev("()=>JSON.stringify({pos:[ZW.World.T.x,ZW.World.T.y],stars:ZW.Save.data.stars,wallet:ZW.Save.data.wallet,lamp:ZW.Save.data.quests.mouse,name:ZW.Save.data.player.name,story:ZW.Save.data.story})")
    page.screenshot(path='/tmp/v7_resume_world.png')
    print('vorher ', before[:300]); print('nachher', after[:300])
    bp=json.loads(before); ap=json.loads(after)
    print('Ort gleich:', abs(bp['pos'][0]-ap['pos'][0])<30 and abs(bp['pos'][1]-ap['pos'][1])<30, '| Rest gleich:', {k:bp[k]==ap[k] for k in bp if k!='pos'})
    b.close()
