// Opt-in "real RAM requisition" helper. Runs as its own Node process (forked by
// electron/main.js) so killing it frees everything at once.
// It tries to own nearly ALL physical RAM (total minus 1.5 GB), which forces Windows
// to push other programs out to the page file, and keeps touching its memory so
// Windows cannot trim it back. Then it holds for `ms` and exits.
// Safety: never more than total RAM - 1.5 GB; on a FIXED-size page file it also stops
// 2 GB short of the commit limit (so other programs never fail to allocate); it stops
// filling after 12 s per 32 GB of RAM; and it always exits when its time is up or the game goes away.
// Usage: ramhog.js <holdMs> [capGB]   (capGB is for tests only)
const {Worker,isMainThread,parentPort,workerData}=require('node:worker_threads');
const GB=1024**3,CHUNK=128*1024**2,PAGE=4096;

if(!isMainThread){
 // Worker: allocate chunks until told to stop, then keep every page hot until told to quit.
 const st=new Int32Array(workerData.sab);const held=[];
 (function fill(){
  while(!Atomics.load(st,0)){
   let b;try{b=Buffer.allocUnsafeSlow(CHUNK);b.fill(0xA5)}catch(_){parentPort.postMessage({fail:1});break}
   held.push(b);parentPort.postMessage({add:CHUNK});
   if(held.length%2==0)return setImmediate(fill); // let the stop flag be seen promptly
  }
  let v=0;(function touch(){if(Atomics.load(st,1))return;v=(v+1)&255;for(const b of held)for(let i=0;i<b.length;i+=PAGE)b[i]=v;setImmediate(touch)})();
 })();
 return;
}

const os=require('node:os'),{execFile}=require('node:child_process');
const ms=Math.max(1000,Math.min(30000,Number(process.argv[2])||8400));
const cap=Number(process.argv[3])>0?Number(process.argv[3])*GB:Infinity;
// Scales UP with bigger PCs (more time and threads for 64 GB+), never below the 32 GB baseline.
const fillMs=Math.max(12000,12000*os.totalmem()/(32*GB));
const total=os.totalmem(),sab=new SharedArrayBuffer(8),st=new Int32Array(sab);
let got=0,done=false,full=false,workers=[];
const send=m=>{try{process.send&&process.send(m)}catch(_){}};
const quit=()=>{if(done)return;done=true;Atomics.store(st,0,1);Atomics.store(st,1,1);send({phase:'released'});setTimeout(()=>process.exit(0),50)};
process.on('disconnect',quit);process.on('SIGTERM',quit);
setTimeout(quit,2000+fillMs+ms).unref?.(); // absolute limit: setup + fill + hold
setInterval(()=>{},1000);

// Ask Windows about the page file once: automatic page files grow, fixed ones are a hard limit.
function pageInfo(){return new Promise(res=>{if(process.platform!=='win32')return res(null);
 execFile('powershell.exe',['-NoProfile','-NonInteractive','-Command','$o=Get-CimInstance Win32_OperatingSystem;$c=Get-CimInstance Win32_ComputerSystem;"$($c.AutomaticManagedPagefile) $($o.FreeVirtualMemory)"'],{windowsHide:true,timeout:2000},(e,out)=>{
  if(e)return res(null);const [a,f]=String(out).trim().split(/\s+/);res({auto:a==='True',commitFree:Number(f)*1024})})})}

function stopFill(){if(full)return;full=true;Atomics.store(st,0,1);send({phase:'full',gb:got/GB});setTimeout(quit,ms)}

pageInfo().then(pi=>{
 if(done)return;
 // Unknown page file: fall back to free RAM only. Fixed page file: respect the commit limit.
 let target=Math.min(cap,total-1.5*GB);
 if(!pi)target=Math.min(target,os.freemem()-1.5*GB);
 else if(!pi.auto)target=Math.min(target,pi.commitFree-2*GB);
 send({phase:'start',gb:0,target:Math.max(0,target)/GB});
 if(target<CHUNK)return stopFill();
 const n=Math.max(1,Math.min(Math.max(4,Math.round(total/(8*GB))),os.cpus().length-1));
 for(let i=0;i<n;i++){const w=new Worker(__filename,{workerData:{sab}});workers.push(w);
  w.on('message',m=>{if(m.add){got+=m.add;if(got+n*CHUNK>target)stopFill();else send({phase:'filling',gb:got/GB})}if(m.fail)stopFill()});
  w.on('error',()=>stopFill())}
 setTimeout(stopFill,fillMs); // 12 s per 32 GB, at least 12 s
});
