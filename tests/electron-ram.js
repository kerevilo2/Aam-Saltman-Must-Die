// Real-app check for the opt-in RAM attack, capped at 2 GB so the test does not lag the PC.
// Usage: npx electron tests/electron-ram.js
process.env.AAM_RAM_CAP_GB='2';
const {app,BrowserWindow}=require('electron'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
require('../electron/main.js');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
app.whenReady().then(async()=>{
 let win;for(let i=0;i<50&&!win;i++){await wait(100);win=BrowserWindow.getAllWindows()[0]}
 await new Promise(r=>win.webContents.isLoading()?win.webContents.once('did-finish-load',r):r());await wait(1200);
 const js=c=>win.webContents.executeJavaScript(c);
 const was=await js('CFG.ramx||0');
 await js("LS.tut=1;CK=0;S='title';CFG.dif=1;go();if(TUT)tutEnd();stage=9;wave=2;E=[];spawnQ=[];startBoss();boss.intro=0;boss.ph=1;CHS.god=1;CFG.ramx=1;boss.T.ram=0;0");
 const f0=os.freemem();await wait(2500);
 const mid=JSON.parse(await js('JSON.stringify(RAMX)'));const used=(f0-os.freemem())/2**30;
 fs.mkdirSync(path.join(__dirname,'shots'),{recursive:true});fs.writeFileSync(path.join(__dirname,'shots','13-real-ram.png'),(await win.webContents.capturePage()).toPNG());
 await wait(10000);const end=JSON.parse(await js('JSON.stringify(RAMX)'));
 await js('CFG.ramx='+was+';saveD();0'); // shares the installed game's save folder: never leave it switched on
 console.log('during:',JSON.stringify(mid),'free RAM dropped',used.toFixed(2),'GB · after:',JSON.stringify(end));
 console.log(mid&&mid.on&&mid.gb>=1.5&&end&&!end.on?'RAM ATTACK OK':'RAM ATTACK FAILED');app.exit(0);
});
