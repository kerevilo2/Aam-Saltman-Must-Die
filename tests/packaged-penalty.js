// End-to-end check of the End task penalty in the PACKAGED app (dist/win-unpacked).
// It runs against a throwaway save folder (--user-data-dir), so the installed game's saves and its
// single-instance lock are never touched. Kills only the process it started.
// Usage: node tests/packaged-penalty.js   (build first: npx electron-builder --win dir --x64)
const {spawn}=require('node:child_process'),path=require('node:path'),fs=require('node:fs'),os=require('node:os');
const exe=path.join(__dirname,'..','dist','win-unpacked','Aam Saltman Must Die.exe'),port=9340;
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'aam-penalty-')),lock=path.join(dir,'session.lock');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let app=null;const env={...process.env};delete env.AAM_NO_PENALTY;
const done=(ok,m)=>{console.log(ok?'PACKAGED PENALTY OK':'PACKAGED PENALTY FAILED: '+m);try{app&&app.kill()}catch(_){}setTimeout(()=>{try{fs.rmSync(dir,{recursive:true,force:true})}catch(_){}process.exit(ok?0:1)},1500)};
async function launch(){app=spawn(exe,['--remote-debugging-port='+port,'--user-data-dir='+dir],{env,stdio:'ignore'});
 let page;for(let i=0;i<40&&!page;i++){await wait(500);try{page=(await (await fetch('http://127.0.0.1:'+port+'/json')).json()).find(t=>t.type=='page')}catch(_){}}
 if(!page)throw Error('no page');const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pend={};
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(pend[m.id]){pend[m.id](m);delete pend[m.id]}};
 return expr=>new Promise(r=>{const i=++id;pend[i]=m=>r(m.result&&m.result.result&&m.result.result.value);ws.send(JSON.stringify({id:i,method:'Runtime.evaluate',params:{expression:expr,awaitPromise:true,returnByValue:true}}))})}
const kill=async()=>{app.kill();await wait(2500)};
(async()=>{
 let ev=await launch();await wait(2000);
 // Safety: only go on if the app really is using the throwaway folder.
 if(fs.readdirSync(dir).length===0)return done(false,'app ignored --user-data-dir; refusing to touch real saves');
 if(await ev('AAM.wasKilled()'))return done(false,'fresh folder reports a kill');
 if(fs.existsSync(lock))return done(false,'marker exists while sitting at the title');
 await kill();ev=await launch();await wait(1500);
 if(await ev('AAM.wasKilled()'))return done(false,'End task from the menus was punished');
 // Start a run (the game arms itself), then End task.
 await ev("LS.tut=1;CK=0;S='title';go();if(TUT)tutEnd();0");await wait(1500);
 if(!fs.existsSync(lock))return done(false,'no marker during a run');
 await kill();ev=await launch();await wait(1500);
 if(!(await ev('AAM.wasKilled()')))return done(false,'End task during a run was not remembered');
 await ev("CK=0;S='title';0");await wait(1500);
 if(!(await ev('!!(CAP&&CAP.pen&&CAP.hard)')))return done(false,'penalty CAPTCHA not shown at the title');
 // Quit from the penalty: it must come back.
 await kill();ev=await launch();await wait(1500);
 if(!(await ev('AAM.wasKilled()')))return done(false,'End task during the penalty dodged it');
 await ev('AAM.penaltyDone();0');await wait(800);
 if(fs.existsSync(lock))return done(false,'marker left after the CAPTCHA was solved');
 await kill();ev=await launch();await wait(1500);
 if(await ev('AAM.wasKilled()'))return done(false,'penalty repeated after it was solved');
 done(true);
})().catch(e=>done(false,e.message));
