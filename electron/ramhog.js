// Opt-in "real RAM requisition" helper. Runs as its own Node process (forked by
// electron/main.js) so the game stays smooth and killing it frees everything at once.
// It fills free RAM down to a safety margin, holds it, then exits. It can never
// outlive its time limit or the game: it exits on a timer and when the parent goes away.
const os=require('node:os');
const ms=Math.max(1000,Math.min(30000,Number(process.argv[2])||8400));
const GB=1024**3,CHUNK=256*1024**2;
// Leave Windows and the game some room so nothing crashes: max(1.5 GB, 8% of total RAM).
const margin=Math.max(1.5*GB,os.totalmem()*.08);
// Optional cap in GB (tests only; the game never passes it).
const cap=Number(process.argv[3])>0?Number(process.argv[3])*GB:Infinity;
const held=[];let done=false;
const send=m=>{try{process.send&&process.send(m)}catch(_){}};
const quit=()=>{if(done)return;done=true;held.length=0;send({phase:'released'});setTimeout(()=>process.exit(0),50)};
setTimeout(quit,ms).unref?.();
process.on('disconnect',quit);process.on('SIGTERM',quit);
let got=0;
function step(){
 if(done)return;
 const free=os.freemem();
 if(free-CHUNK<margin||got+CHUNK>cap){send({phase:'full',gb:got/GB});return}
 try{const b=Buffer.allocUnsafe(CHUNK);b.fill(0xA5);held.push(b);got+=CHUNK}catch(_){send({phase:'full',gb:got/GB});return}
 send({phase:'filling',gb:got/GB});setImmediate(step);
}
send({phase:'start',gb:0,free:os.freemem()/GB,margin:margin/GB});
step();
// keep the process alive while holding memory
setInterval(()=>{},1000);
