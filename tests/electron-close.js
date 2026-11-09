// Real-app check for the Alt+F4 guard: loads electron/main.js, closes the window the way
// Alt+F4 does (a window close request), and confirms the game shows the hard CAPTCHA instead of quitting.
// Usage: npx electron tests/electron-close.js
const {app,BrowserWindow}=require('electron'),fs=require('node:fs'),path=require('node:path');
require('../electron/main.js');
const out=path.join(__dirname,'shots');fs.mkdirSync(out,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
app.whenReady().then(async()=>{
 let win;for(let i=0;i<50&&!win;i++){await wait(100);win=BrowserWindow.getAllWindows()[0]}
 await new Promise(r=>win.webContents.isLoading()?win.webContents.once('did-finish-load',r):r());await wait(1500);
 const js=c=>win.webContents.executeJavaScript(c);
 await js("LS.tut=1;S='title';CK=0;0");await wait(300);
 win.close();await wait(600);
 const st=await js("JSON.stringify({open:!!CAP,hard:!!(CAP&&CAP.hard),st:CAP&&CAP.st})");
 fs.writeFileSync(path.join(out,'10-altf4.png'),(await win.webContents.capturePage()).toPNG());
 await js("CAP.st=1;0");await wait(300);fs.writeFileSync(path.join(out,'11-altf4-grid.png'),(await win.webContents.capturePage()).toPNG());
 win.close();await wait(400);const st2=await js("JSON.stringify({hard:!!(CAP&&CAP.hard),msg:CAP&&CAP.msg})");
 const s=JSON.parse(st),ok=!win.isDestroyed()&&s.open&&s.hard&&JSON.parse(st2).hard;
 console.log('after close:',st,'second close:',st2,ok?'GUARD OK':'GUARD FAILED');
 // solving it really quits: answer every round
 await js("CAP.st=1;for(let i=0;i<6;i++){const k=CAPG[CAP.g][2];CAP.sel=new Set([...Array(9).keys()].filter(i=>k.includes(CAP.ord[i])));capVerify()}0");
 const t0=Date.now();app.on('will-quit',()=>{console.log('quit after solving: OK ('+(Date.now()-t0)+' ms)');process.exitCode=ok?0:1});
 await wait(4000);console.log('did not quit after solving');app.exit(1);
});
