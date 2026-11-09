// Real-app check for the End task penalty. Run after the app was force-killed (taskkill /F),
// e.g. via scripts in the release notes: it expects the hard CAPTCHA on the title screen,
// solves it, quits, and the session marker must then be gone. Usage: npx electron tests/electron-killed.js
const {app,BrowserWindow}=require('electron'),fs=require('node:fs'),path=require('node:path');
require('../electron/main.js');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
app.whenReady().then(async()=>{
 let win;for(let i=0;i<50&&!win;i++){await wait(100);win=BrowserWindow.getAllWindows()[0]}
 await new Promise(r=>win.webContents.isLoading()?win.webContents.once('did-finish-load',r):r());await wait(1200);
 const js=c=>win.webContents.executeJavaScript(c);
 await js("LS.tut=1;S='title';CK=0;0");await wait(500);
 const st=JSON.parse(await js("JSON.stringify({open:!!CAP,pen:!!(CAP&&CAP.pen)})"));
 await js("CAP&&(CAP.st=1);0");await wait(300);fs.mkdirSync(path.join(__dirname,'shots'),{recursive:true});
 fs.writeFileSync(path.join(__dirname,'shots','12-endtask.png'),(await win.webContents.capturePage()).toPNG());
 console.log('after End task:',JSON.stringify(st),st.pen?'PENALTY OK':'NO PENALTY');
 await js("for(let i=0;i<6;i++){const k=CAPG[CAP.g][2];CAP.sel=new Set([...Array(9).keys()].filter(i=>k.includes(CAP.ord[i])));capVerify()}0");await wait(1600);
 const f=path.join(app.getPath('userData'),'session.lock');app.on('will-quit',()=>setImmediate(()=>console.log('marker after solve+quit:',fs.existsSync(f)?'STILL THERE':'cleared')));
 await js("AAM.quit();0");
});
