// 1.0.20: boss segments, GHAT CPT fairness, token rerolls, Daily Standup, achievements page 2, run recap, End task penalty.
dt=1/60;let errs=0;const ck=(n,f)=>{try{f();console.log('ok  ',n)}catch(e){errs++;console.log('FAIL',n,e.stack.split('\n').slice(0,3).join(' | '))}};
const bossAt=n=>{CFG.dif=1;MOD='';prac=0;newGame();if(TUT)tutEnd();stage=n;wave=2;E=[];spawnQ=[];startBoss();boss.intro=0;P.hp=P.mhp=99;return boss};
const frames=n=>{for(let i=0;i<n&&boss;i++){P.inv=.5;P.ih=.5;if(S=='deal'){lk=0;takeDeal(0)}upd();tides();fx()}};
ck('segments: 3 for early bosses, 4 for bosses 7-9, 5 for Aam',()=>{for(let n=0;n<10;n++){const b=bossAt(n),want=n==9?5:n>=6?4:3;if(b.ns!==want)throw Error('boss '+n+' has '+b.ns)}});
ck('early bosses break exactly as before (66% and 33%)',()=>{const b=bossAt(1);b.hp=b.mhp*.67;dmgBoss(b.mhp*.02);if(b.ph!==1||b.sg!==1||b.tw)throw Error('first break');b.sh=0;b.hp=b.mhp*.34;dmgBoss(b.mhp*.02);if(b.ph!==2||b.sg!==2)throw Error('second break')});
ck('a 4-segment boss: twist at 75%, tiers at 50% and 25%',()=>{const b=bossAt(7);const cut=p=>{b.sh=0;b.hp=b.mhp*(p+.01);dmgBoss(b.mhp*.02)};
 cut(.75);if(b.sg!==1||b.ph!==0||!b.tw)throw Error('75%: sg '+b.sg+' ph '+b.ph+' tw '+b.tw);frames(120);if(b.tw||b.tv)throw Error('twist did not play out');
 cut(.5);if(b.sg!==2||b.ph!==1||b.tw)throw Error('50%');cut(.25);if(b.sg!==3||b.ph!==2)throw Error('25%');draw();ui(drawUI)});
ck('Aam: 5 segments, deals only at the two tier changes, twists at the other two',()=>{const b=bossAt(9);frames(5);let deals=0,tw=0;
 for(const p of [.8,.6,.4,.2]){b.sh=0;b.hp=b.mhp*(p+.005);dmgBoss(b.mhp*.01);if(b.tw)tw++;for(let i=0;i<10;i++){P.inv=.5;P.ih=.5;if(S=='deal'){deals++;lk=0;takeDeal(0)}upd();tides()}}
 if(deals!==2||tw!==2||b.ph!==2||b.sg!==4)throw Error('deals '+deals+' twists '+tw+' ph '+b.ph+' sg '+b.sg)});
ck('every twist runs without errors',()=>{for(const n of [6,7,8,9]){const b=bossAt(n);twist(b);frames(200)}});
ck('GHAT CPT: big attacks never start within 2.4 s of each other or during a tide',()=>{MOD='';go();if(TUT)tutEnd();stage=NB+1;wave=1;startWave();P.hp=P.mhp=99;startGhat();boss.intro=0;boss.hp=boss.mhp*.4;
 let last=-9,n=0,bad=0;const names=['c','h','xwv','xw','xtd','xsg'];
 for(let i=0;i<60*90;i++){P.inv=.5;P.ih=.5;const T0={};for(const k of names)T0[k]=boss.T[k];const td=TD.length;upd();tides();if(i%30==0)boss.hp=boss.mhp*.4;
  for(const k of names)if(T0[k]!=null&&boss.T[k]>T0[k]){n++;if(boss.t-last<2.39||td)bad++;last=boss.t}}
 if(n<12)throw Error('only '+n+' big attacks in 90 s');if(bad)throw Error(bad+' overlapping big attacks of '+n)});
ck('reroll: costs tokens, doubles each time, redraws the cards',()=>{MOD='';go();if(TUT)tutEnd();const t0=TOK;TOK=1000;deal();S='pick';lk=0;CPK=0;
 if(rrCost()!==50)throw Error('first cost');reroll();if(TOK!==950||P.rr!==1||S!='pick'||cards.length!==3)throw Error('first reroll');lk=0;if(rrCost()!==100)throw Error('second cost');
 TOK=10;reroll();if(TOK!==10||P.rr!==1)throw Error('rerolled without enough tokens');BT=[];draw();ui(drawUI);if(!BT.some(b=>String(b.l).startsWith('Reroll')))throw Error('no reroll button');
 CPK=1;if(rrOK())throw Error('reroll offered on a loot pick');CPK=0;MOD='daily';if(rrOK())throw Error('reroll offered in the daily');MOD='';TOK=t0;S='title'});
ck('daily: same day gives the same waves and cards, another day differs',()=>{const run=()=>{startDaily();if(TUT)tutEnd();const w=spawnQ.map(q=>q.k).join('');deal();const c=cards.map(c=>c[0]).join('|');for(let i=0;i<50;i++)Math.random();return w+'#'+c};
 const a=run(),b=run();if(a!==b)throw Error('not repeatable: '+a+' vs '+b);const dk=dayKey;const D=Date;let seen=new Set([a]);
 for(let k=1;k<=4;k++){const o=DRS;MOD='daily';newGame();DRS=20260101+k;startWave();deal();seen.add(spawnQ.map(q=>q.k).join('')+'#'+cards.map(c=>c[0]).join('|'))}if(seen.size<4)throw Error('seeds do not vary');
 MOD='';go();const u=spawnQ.length;if(R!==Math.random)throw Error('R was left seeded');S='title'});
ck('daily: the run is recorded and shown on the title',()=>{const sv=JSON.stringify(LS),ag=JSON.stringify(AG),tk0=TOK;CH=0;startDaily();if(TUT)tutEnd();score=1234;recRun('died');
 if(!dayRec()||dayRec().b!==1234||!AG.daily)throw Error('not recorded');if(runTag().indexOf('Daily Standup')<0)throw Error('tag '+runTag());
 P=null;boss=null;S='title';BT=[];draw();ui(drawUI);if(!BT.some(b=>String(b.l).startsWith('Daily')))throw Error('no Daily button');S='stats';draw();ui(drawUI);
 LS=JSON.parse(sv);AG=JSON.parse(ag);TOK=tk0;MOD='';S='title'});
ck('achievements: 40 on two pages, new ones unlock',()=>{if(ACH.length!==40)throw Error('count '+ACH.length);if(new Set(ACH.map(a=>a[0])).size!==40)throw Error('duplicate ids');
 S='ach';APG=0;BT=[];draw();ui(drawUI);const b=BT.find(b=>String(b.l).startsWith('Page'));if(!b)throw Error('no page button');b.f();if(APG!==1)throw Error('page');draw();ui(drawUI);b.f();if(APG!==0)throw Error('wrap');
 const ag=JSON.stringify(AG),ls=JSON.stringify(LS),tk0=TOK;CH=0;const bb=bossAt(0);own={};bb.sh=0;bb.ph=2;bb.sg=2;dmgBoss(1e9);if(!AG.boot)throw Error('boot not granted');
 MOD='rush';const b9=bossAt(0);MOD='rush';b9.sh=0;b9.sg=2;dmgBoss(1e9);if(!(LS.cbd&&LS.cbd.rush)||!AG.beta)throw Error('challenge boss not tracked');
 AG=JSON.parse(ag);LS=JSON.parse(ls);TOK=tk0;MOD='';GRAND=null;S='title'});
ck('game over shows the run recap',()=>{const b=bossAt(7);b.hp=b.mhp*.42;P.rt=95;P.kc=37;S='over';lk=0;const seen=[];const oT=T;T=function(s){seen.push(String(s));return oT.apply(this,arguments)};try{draw();ui(drawUI)}finally{T=oT}
 const l=seen.find(s=>s.startsWith('Time '));if(!l||l.indexOf('37 bots deleted')<0||l.indexOf('killed by THE SCRAPER at 42% health')<0)throw Error('recap: '+l);S='title';P=null;boss=null});
ck('End task penalty: armed only during a run or the Alt+F4 CAPTCHA, CAPTCHA shown at the title',()=>{const arms=[];let done=0,quits=0;NATV=true;const o=typeof AAM=='undefined'?{}:AAM;AAM={...o,arm(a){arms.push(a)},penaltyDone(){done++},quit(){quits++}};
 ARMD=0;P=null;boss=null;S='title';CAP=null;CK=0;killCheck();if(arms.length)throw Error('armed at the title');
 MOD='';go();if(TUT)tutEnd();killCheck();if(arms.join()!=='1')throw Error('not armed in a run: '+arms);S='over';killCheck();if(arms.join()!=='1,0')throw Error('not disarmed at game over');
 P=null;S='title';hardQuit();killCheck();if(arms.join()!=='1,0,1')throw Error('not armed in the Alt+F4 CAPTCHA');CAP=null;killCheck();
 KILLQ=1;CK=1;killCheck();if(CAP)throw Error('shown over the cookie banner');CK=0;killCheck();if(!CAP||!CAP.pen||!CAP.hard)throw Error('penalty CAPTCHA not shown');
 dispatchEvent(Object.assign(new Event('keydown'),{code:'Escape'}));if(!CAP)throw Error('Escape dodged the penalty');draw();ui(()=>{drawUI();satDraw()});
 const f=CAP.f;f();if(done!==1)throw Error('solve did not clear the penalty');CAP=null;AAM=o;NATV=false;ARMD=0;KILLQ=0});
if(errs)console.log('ERRORS',errs);
