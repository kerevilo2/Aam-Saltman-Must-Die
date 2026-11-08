// Boot chat, first-run tutorial, key rebinding, accessibility, graphics and the secret boss.
dt=1/60;let errs=0;const ck=(n,f)=>{try{f();console.log('ok  ',n)}catch(e){errs++;console.log('FAIL',n,e.stack.split('\n').slice(0,3).join(' | '))}};
const frame=()=>{upd();tides();fx();draw();ui(drawUI);hzDraw();tideDraw();ui(()=>{tutDraw();bootDraw();dealDraw();endDraw();cheatDraw();toastDraw()});tipDraw();shatterDraw()};
const play=n=>{for(let i=0;i<n;i++){if(S=='play'&&!CHO){upd();tides();cheatTick();tutTick();ghatTick()}fx();draw();ui(()=>{drawUI();tutDraw();bootDraw()})}};
ck('boot screen starts, plays, skips to disclaimer, then title',()=>{
 if(S!=='boot')throw Error('game should start on the boot screen, got '+S);
 for(let i=0;i<60*3;i++){draw();ui(bootDraw)}if(S!=='boot')throw Error('left boot too early');
 bootSkip();if(BOOT.t<BOOTEND)throw Error('skip did not finish the chat');
 for(let i=0;i<60*1.5;i++){draw();ui(bootDraw)}bootSkip();if(S!=='title')throw Error('disclaimer did not continue to title, S='+S)});
ck('first-run tutorial: move, shoot, dash, pulse, finish into wave 1',()=>{
 LS.tut=0;go();if(!TUT)throw Error('tutorial did not start');if(spawnQ.length)throw Error('wave should wait');
 for(let i=0;i<120&&TUT.st==0;i++){K[KB.right]=i<60;K[KB.left]=i>=60;play(1)}K[KB.right]=K[KB.left]=0;if(TUT.st!==1)throw Error('move step stuck');
 for(let i=0;i<600&&TUT.st==1;i++){const e=E[0];if(e){M.x=e.x;M.y=e.y;M.d=1}play(1)}M.d=0;if(TUT.st!==2)throw Error('shoot step stuck, enemies '+E.length);
 P.dash=0;K[KB.dash]=1;play(2);K[KB.dash]=0;play(30);if(TUT.st!==3)throw Error('dash step stuck');
 const hp=P.hp;play(5);K[KB.pulse]=1;play(2);K[KB.pulse]=0;play(5);if(TUT.st!==4)throw Error('pulse step stuck, pc='+P.pc);
 if(P.hp!==hp)throw Error('player was hurt during the tutorial');
 for(let i=0;i<60*7&&TUT;i++)play(1);if(TUT)throw Error('tutorial did not finish');if(!LS.tut)throw Error('tutorial not marked done');
 if(!spawnQ.length&&!E.length)throw Error('wave 1 did not start');
 go();if(TUT)throw Error('tutorial replayed after completion')});
ck('key rebinding moves, swaps and drives the game',()=>{
 S='keys';KBW='dash';kbSet({code:'KeyJ',preventDefault(){}});if(KB.dash!=='KeyJ')throw Error('dash not rebound');
 KBW='up';kbSet({code:'KeyJ',preventDefault(){}});if(KB.up!=='KeyJ'||KB.dash!=='KeyW')throw Error('conflict did not swap: '+JSON.stringify(KB));
 KBW='pulse';kbSet({code:'Escape',preventDefault(){}});if(KB.pulse!=='KeyQ')throw Error('escape should cancel');
 draw();ui(drawUI);go();P.dash=0;const y0=P.y;K.KeyJ=1;play(10);K.KeyJ=0;if(!(P.y<y0))throw Error('rebound up key did not move');
 KB=Object.assign({},KBD);CFG.kb={...KB}});
ck('accessibility options',()=>{
 CFG.cb=1;go();eb(100,100,0,100);const b=B[B.length-1];if(b.c!=='#F0E442')throw Error('colour-blind palette not applied: '+b.c);
 CFG.out=1;CFG.rm=1;CFG.big=1;shake=30;play(30);S='access';draw();ui(drawUI);
 CFG.spd=.7;go();last=0;for(let i=1;i<=60;i++)loop(i*1000/60);if(Math.abs(P.rt-.7)>.05)throw Error('game speed not applied: '+P.rt);if(Math.abs(tmul()-.5)>1e-9)throw Error('token multiplier should halve');
 Object.assign(CFG,{cb:0,out:0,rm:0,big:0,spd:1})});
ck('graphics: low mode and auto switching',()=>{
 CFG.gfx='low';LOWG=lowg();go();play(60);if(!LOWG)throw Error('low not applied');
 CFG.gfx='auto';AUTOLOW=0;LOWG=lowg();S='play';for(let i=0;i<300;i++)perfTick(.05);if(!AUTOLOW||!LOWG)throw Error('auto did not drop to low');
 CFG.gfx='high';LOWG=lowg();if(LOWG)throw Error('high should override');CFG.gfx='auto';AUTOLOW=0;LOWG=lowg()});
ck('secret boss: JAILBREAK only from loop 2, fight, then the run resumes',()=>{dt=1/60;
 const type=w=>{for(const ch of w)JBB=(JBB+ch).slice(-9);if(JBB=='JAILBREAK'&&S=='play'&&P&&!prac&&stage>=NB&&!boss&&!P.jb&&!TUT&&!(GHR>0)&&adv<=0)startGhat()};
 go();stage=3;wave=1;type('JAILBREAK');if(boss)throw Error('should not work on loop 1');
 stage=NB+1;wave=1;startWave();P.hp=P.mhp=99;type('JAILBREAK');if(!boss||boss.n!==10)throw Error('secret boss did not start');
 boss.intro=0;let ph=0;for(let i=0;i<60*40&&boss;i++){P.inv=.5;P.ih=.5;upd();tides();ghatTick();fx();draw();if(boss&&i%400==399){boss.sh=0;dmgBoss(boss.mhp*.3)}if(boss)ph=Math.max(ph,boss.ph)}
 if(boss)throw Error('boss did not die');if(!(GHR>0))throw Error('resume timer not set');
 for(let i=0;i<200;i++){upd();ghatTick()}if(wave!==1||!(spawnQ.length||E.length))throw Error('run did not resume its wave, wave='+wave);
 type('JAILBREAK');if(boss)throw Error('should only happen once per run');
 S='codex';sub=ENTS().findIndex(e=>e[0]=='b10');P=null;draw();ui(drawUI);console.log('     reached phase',ph+1,'; codex entry',sub>=0)});
console.log(errs?'ERRORS '+errs:'ALL PASS');
