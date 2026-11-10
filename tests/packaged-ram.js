// End-to-end check of the RAM attack in the PACKAGED app (dist/win-unpacked), where the
// helper runs from app.asar.unpacked. Build first: npx electron-builder --win dir --x64
// Checks fill -> extend (second attack) -> stop (fight over).
// Usage: node tests/packaged-ram.js   (capped at 2 GB; does not change saved settings)
const {spawn}=require('node:child_process'),path=require('node:path');
const exe=path.join(__dirname,'..','dist','win-unpacked','Aam Saltman Must Die.exe'),port=9339;
const app=spawn(exe,['--remote-debugging-port='+port],{env:{...process.env,AAM_RAM_CAP_GB:'2',AAM_NO_PENALTY:'1'},stdio:'ignore'});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const fail=m=>{console.log('PACKAGED RAM FAILED:',m);app.kill();process.exit(1)};
(async()=>{
 let page;for(let i=0;i<40&&!page;i++){await wait(500);try{page=(await (await fetch('http://127.0.0.1:'+port+'/json')).json()).find(t=>t.type=='page')}catch(_){}}
 if(!page)fail('no page (is the installed game running? it holds the single-instance lock)');
 const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pend={};
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(pend[m.id]){pend[m.id](m);delete pend[m.id]}};
 const ev=expr=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method:'Runtime.evaluate',params:{expression:expr,awaitPromise:true,returnByValue:true}}))});
 await wait(1500);
 const t0=Date.now();
 const r=await ev("ramxEnd=function(){};new Promise(res=>{const seen=[];AAM.onRam(m=>{seen.push(m.phase+':'+(m.gb||0).toFixed(2));if(m.phase=='full')AAM.ramHog(60000);if(m.phase=='extended')setTimeout(()=>AAM.ramStop(),500);if(m.phase=='released'||m.phase=='error')res(seen)});AAM.ramHog(60000);setTimeout(()=>res(seen.concat('TIMEOUT')),25000)})");
 const seen=r.result&&r.result.result&&r.result.result.value;console.log('phases:',JSON.stringify(seen),'in',Date.now()-t0,'ms');
 app.kill();
 if(!seen||!seen.some(s=>s.startsWith('full:'))||!seen.some(s=>s.startsWith('extended'))||!seen.some(s=>s.startsWith('released'))||seen.includes('TIMEOUT'))fail('unexpected phases');
 console.log('PACKAGED RAM OK');process.exit(0);
})().catch(e=>fail(e.message));
