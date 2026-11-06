// Drives the real desktop app and saves screenshots to tests/shots/.
// Usage: npx electron tests/electron-shot.js
// Uses a throwaway profile and never minimizes your other windows.
const {app,BrowserWindow}=require('electron');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'aam-test-')));
const out=path.join(__dirname,'shots');fs.mkdirSync(out,{recursive:true});
const errors=[];
app.on('browser-window-created',(_,win)=>{
 win.webContents.on('console-message',(e)=>{const level=e.level??e.params?.level;if(level==='error'||level===3)errors.push(e.message??e.params?.message)});
 win.webContents.on('preload-error',(_,p,err)=>errors.push('preload: '+err.message));
 win.webContents.once('did-finish-load',()=>run(win).catch(err=>{console.error('TEST FAILED',err);app.exit(1)}));
});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function shot(win,name){const img=await win.webContents.capturePage();fs.writeFileSync(path.join(out,name+'.png'),img.toPNG());const b=win.getBounds(),bm=img.toBitmap(),sz=img.getSize(),px=(x,y)=>{const i=(y*sz.width+x)*4;return bm[i+3]};console.log('shot',name,b.width+'x'+b.height,'corner alpha',px(4,sz.height-4),'mid-left alpha',px(20,sz.height>>1))}
const js=(win,code)=>win.webContents.executeJavaScript(code);
async function run(win){
 await wait(1200);await shot(win,'01-title');
 console.log('bridge:',await js(win,'NATV&&typeof AAM.desktop'));
 await js(win,"CFG.clr=0;CFG.dmode=1;go();CHS.god=1;taint();'ok'");
 await wait(2200);await shot(win,'02-run-overlay');
 console.log('desktop mode:',await js(win,'DMW+" panels "+DR.map(r=>r.k).join("")'));
 await js(win,"rs();stage=9;wave=2;begin();'ok'");
 await wait(250);await shot(win,'03-shatter-cracks');
 await wait(450);await shot(win,'04-shatter-shards');
 await wait(500);await shot(win,'05-shatter-late');
 await wait(1600);await shot(win,'06-aam-fight');
 console.log('shatter done:',await js(win,'SH===null&&!!boss&&boss.n'));
 await js(win,"dealOpen();lk=0;'ok'");await wait(400);await shot(win,'07a-deal');
 console.log('deal offer intact:',await js(win,'Array.isArray(DL)&&DL.length==2&&S'));await js(win,'takeDeal(0);"ok"');
 await js(win,"S='pause';'ok'");await wait(300);await shot(win,'07-pause');
 await js(win,"toMenu();'ok'");await wait(1500);await shot(win,'08-back-to-menu');
 console.log('menu restored:',await js(win,'"DMW="+DMW+" S="+S'),win.getBounds());
 await js(win,"CFG.dmode=0;go();'ok'");await wait(1200);
 console.log('classic run:',await js(win,'"DMW="+DMW'),win.getBounds());
 await js(win,"rs();stage=9;wave=2;begin();'ok'");await wait(750);await shot(win,'09-classic-shatter');
 await js(win,"toMenu();'ok'");
 console.log(errors.length?'RENDERER ERRORS:\n'+errors.join('\n'):'no renderer errors');
 app.exit(errors.length?1:0);
}
require('../electron/main.js');
