// 1.0.19: harder GHAT CPT (Aam's phase-3 kit echoes at half power), bigger win reward, 100% completion reward.
dt=1/60;let errs=0;const ck=(n,f)=>{try{f();console.log('ok  ',n)}catch(e){errs++;console.log('FAIL',n,e.stack.split('\n').slice(0,3).join(' | '))}};
const ghat=()=>{go();if(TUT)tutEnd();stage=NB+1;wave=1;startWave();P.hp=P.mhp=99;startGhat();boss.intro=0};
ck('Aam echoes through the whole GHAT CPT fight at half power',()=>{ghat();const seen=new Set();let tides=0,walls=0;
 for(let i=0;i<60*30;i++){P.inv=.5;P.ih=.5;const n0=B.length,t0=TD.length;upd();for(const q of B.slice(n0))seen.add(q.c);if(TD.length>t0)tides++;if(i%60==0)boss.hp=boss.mhp}
 for(const c of ['#ff2d55','#ff9ab0','#4aa8ff'])if(!seen.has(c))throw Error('no Aam bullets '+c+' at full GHAT HP');if(!tides)throw Error('no tides from the echo');
 const T=boss.T;if(!('xa' in T&&'xw' in T&&'xsg' in T))throw Error('echo timers missing');draw()});
ck('echo intervals are double Aam phase 3',()=>{ghat();boss.pc=1;let n=0;for(let i=0;i<60*34;i++){P.inv=.5;P.ih=.5;const k=boss.T.xa;upd();if(boss.T.xa>k)n++;boss.hp=boss.mhp}if(n<9||n>11)throw Error('aimed fans in 34 s: '+n+' (expect 10 at 3.4 s)')});
ck('beating GHAT CPT: +25000, +500 tokens, +2 max HP, then an evolved-card pick',()=>{ghat();const t0=TOK,m0=P.mhp,s0=score;CH=0;boss.sh=0;boss.ph=2;dmgBoss(1e9);
 if(score-s0<25000)throw Error('score '+(score-s0));if(TOK-t0<500)throw Error('tokens '+(TOK-t0));if(P.mhp!==m0+2)throw Error('max hp');
 for(let i=0;i<200&&S=='play';i++){upd();ghatTick()}if(S!='pick'||!CPK)throw Error('no loot pick, S='+S);
 const evs=Object.values(EV).map(v=>v[0]);if(!cards.length||!cards.every(c=>evs.includes(c)))throw Error('loot not all evolved');
 lk=0;choose(0);if(S!='play'||CPK)throw Error('did not return to the run after the pick');TOK=t0});
ck('100% completion: grand reward once, only with every achievement and skin',()=>{const sv=JSON.stringify({AG,TOK,SKN}),sn=S;CH=0;
 AG={};for(const a of ACH)AG[a[0]]=1;SKN={own:{human:1},eq:'human'};GRAND=null;fullCheck();if(AG.all||GRAND)throw Error('granted without skins');
 for(const s of SKINS)if(s.cost)SKN.own[s.id]=1;const t0=TOK;fullCheck();if(!AG.all||!GRAND||TOK-t0!==5000||SKN.eq!=='agi')throw Error('not granted at 100%');
 fullCheck();if(TOK-t0!==5000)throw Error('granted twice');
 S='title';BT=[];draw();ui(()=>{drawUI();grandDraw()});GRAND.t=3;BT=[];draw();ui(()=>{drawUI();grandDraw()});const b=BT.find(b=>b.l=='grand');if(!b)throw Error('no continue');b.f();if(GRAND)throw Error('not dismissed');
 S='skin';BT=[];draw();ui(drawUI);
 const o=JSON.parse(sv);AG=o.AG;TOK=o.TOK;SKN=o.SKN;S=sn;GRAND=null});
ck('celebration waits until you are out of a fight',()=>{GRAND={t:0};S='play';BT=[];grandDraw();if(GRAND.t)throw Error('drew mid-fight');GRAND=null;S='title'});
if(errs)console.log('ERRORS',errs);
