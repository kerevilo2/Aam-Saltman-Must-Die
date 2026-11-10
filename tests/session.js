// Unit test for electron/session.js (the End task penalty marker). Usage: node tests/session.js
const assert=require('node:assert'),os=require('node:os'),path=require('node:path'),fs=require('node:fs');
const {createSession}=require('../electron/session');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'aam-session-')),file=path.join(dir,'session.lock');
let n=0;const ok=(name,fn)=>{fn();n++;console.log('  ok  '+name)};
try{
 ok('fresh start: not killed, no marker',()=>{const s=createSession({dir,enabled:true});assert.equal(s.wasKilled(),false);assert.ok(!fs.existsSync(file))});
 ok('sitting in menus then End task: no penalty',()=>{createSession({dir,enabled:true});assert.equal(createSession({dir,enabled:true}).wasKilled(),false)});
 ok('armed then clean quit: no penalty',()=>{const s=createSession({dir,enabled:true});s.arm(true);assert.ok(fs.existsSync(file));s.clean();assert.equal(createSession({dir,enabled:true}).wasKilled(),false)});
 ok('run finished (disarmed) then End task: no penalty',()=>{const s=createSession({dir,enabled:true});s.arm(true);s.arm(false);assert.equal(createSession({dir,enabled:true}).wasKilled(),false)});
 ok('End task during a run: penalty on the next launch',()=>{createSession({dir,enabled:true}).arm(true);assert.equal(createSession({dir,enabled:true}).wasKilled(),true)});
 ok('quitting or End task during the penalty does not dodge it',()=>{const s=createSession({dir,enabled:true});assert.equal(s.wasKilled(),true);s.arm(false);s.clean();assert.equal(createSession({dir,enabled:true}).wasKilled(),true)});
 ok('solving it clears it for good',()=>{const s=createSession({dir,enabled:true});s.penaltyDone();assert.equal(s.wasKilled(),false);assert.equal(createSession({dir,enabled:true}).wasKilled(),false)});
 ok('dev and test runs never write or read the marker',()=>{const s=createSession({dir,enabled:false});s.arm(true);assert.ok(!fs.existsSync(file));fs.writeFileSync(file,'armed');assert.equal(createSession({dir,enabled:false}).wasKilled(),false);fs.unlinkSync(file)});
 ok('a leftover 1.0.13 marker ("open") is ignored',()=>{fs.writeFileSync(file,'open');assert.equal(createSession({dir,enabled:true}).wasKilled(),false)});
 console.log('session: '+n+' tests passed');
}catch(e){console.error('session test FAILED:',e.message);process.exitCode=1}
finally{fs.rmSync(dir,{recursive:true,force:true})}
