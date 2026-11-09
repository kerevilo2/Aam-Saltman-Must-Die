// Unit test for electron/updater.js with a fake electron-updater. Usage: node tests/updater.js
const assert=require('node:assert'),os=require('node:os'),path=require('node:path'),fs=require('node:fs'),{EventEmitter}=require('node:events');
const {createUpdateService}=require('../electron/updater');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function fake(){const u=new EventEmitter();u.latest='1.0.0';u.fail=0;u.downloads=[];u.installs=0;
 u.checkForUpdates=async()=>{u.emit('checking-for-update');if(u.fail>0){u.fail--;const e=new Error('net');u.emit('error',e);throw e}
  const avail=u.latest!=='1.0.0';if(avail)u.emit('update-available',{version:u.latest});else u.emit('update-not-available',{});return{isUpdateAvailable:avail,updateInfo:{version:u.latest}}};
 u.downloadUpdate=async()=>{u.downloads.push(u.latest);u.emit('download-progress',{percent:50});u.emit('update-downloaded',{version:u.latest})};
 u.quitAndInstall=()=>{u.installs++};return u}
const app={getVersion:()=>'1.0.0',getPath:()=>os.tmpdir()};
const mk=(u,o={})=>createUpdateService({app,updater:u,supported:true,autoStart:false,preferencesPath:path.join(os.tmpdir(),'aam-upd-test-'+process.pid+'.json'),retry:[30,30,30],...o});
(async()=>{
 let n=0;const ok=(name,fn)=>fn().then(()=>{n++;console.log('  ok  '+name)});
 await ok('no update -> current',async()=>{const u=fake(),s=mk(u);assert.equal((await s.check()).phase,'current');s.dispose()});
 await ok('update downloads and is ready',async()=>{const u=fake();u.latest='1.0.1';const s=mk(u);const st=await s.check();assert.equal(st.phase,'ready');assert.equal(st.version,'1.0.1');assert.deepEqual(u.downloads,['1.0.1']);assert.ok(s.install());assert.equal(u.installs,1);s.dispose()});
 await ok('a failed check retries by itself',async()=>{const u=fake();u.latest='1.0.1';u.fail=2;const s=mk(u);assert.equal((await s.check()).phase,'error');await wait(150);assert.equal(s.getState().phase,'ready');s.dispose()});
 await ok('re-check while ready stays quiet',async()=>{const u=fake();u.latest='1.0.1';const seen=[];const s=mk(u,{notify:x=>seen.push(x.phase)});await s.check();seen.length=0;const st=await s.check();assert.equal(st.phase,'ready');assert.deepEqual(seen,[]);assert.equal(u.downloads.length,1);s.dispose()});
 await ok('a newer release replaces a stale ready one',async()=>{const u=fake();u.latest='1.0.1';const s=mk(u);await s.check();u.latest='1.0.2';const st=await s.check();assert.equal(st.phase,'ready');assert.equal(st.version,'1.0.2');assert.deepEqual(u.downloads,['1.0.1','1.0.2']);s.dispose()});
 await ok('a failure while ready keeps the ready update',async()=>{const u=fake();u.latest='1.0.1';const s=mk(u);await s.check();u.fail=1;assert.equal((await s.check()).phase,'ready');s.dispose()});
 await ok('auto updates off: no retry',async()=>{const u=fake();u.fail=5;const s=mk(u);s.setAutomatic(false);await wait(10);await s.check();const left=u.fail;await wait(120);assert.equal(u.fail,left);s.dispose()});
 await ok('periodic checks run on the interval',async()=>{const u=fake();let c=0;const o=u.checkForUpdates;u.checkForUpdates=async()=>{c++;return o()};const s=mk(u,{autoStart:true,every:40});s.setAutomatic(true);await wait(5200+120);assert.ok(c>=3,'checks: '+c);s.dispose()});
 try{fs.unlinkSync(path.join(os.tmpdir(),'aam-upd-test-'+process.pid+'.json'))}catch(_){}
 console.log('updater: '+n+' tests passed')
})().catch(e=>{console.error('updater test FAILED:',e.message);process.exit(1)});
