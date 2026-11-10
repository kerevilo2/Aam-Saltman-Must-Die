// End-task penalty marker.
// End task (taskbar / Task Manager) kills the process and cannot be intercepted, so it is punished on the
// next launch instead. Unlike the first attempt (1.0.13), the marker only exists while the game says it is
// "armed": a run is in progress or the Alt+F4 CAPTCHA is open. Sitting in menus, update installs, crashes of
// the page, Windows shutdown and normal quits never leave it behind, and dev/test runs never write it.
const fs=require('node:fs'),path=require('node:path');
function createSession({dir,enabled}){
 const file=path.join(dir,'session.lock');let killed=false;
 if(enabled){try{killed=fs.readFileSync(file,'utf8')==='armed'}catch(_){}}
 const rm=()=>{try{fs.unlinkSync(file)}catch(_){}};
 return{
  wasKilled:()=>killed,
  // While a penalty is pending the marker stays, so quitting (or End task again) does not dodge it.
  arm(on){if(!enabled||killed)return;if(on){try{fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(file,'armed')}catch(_){}}else rm()},
  clean(){if(enabled&&!killed)rm()},
  penaltyDone(){killed=false;rm()}
 };
}
module.exports={createSession};
