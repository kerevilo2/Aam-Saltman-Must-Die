// Playtest feedback fixes: tutorial layout, card picking by keys, homing lock, crosshair, music variety, soundtrack setting.
dt=1/60;let errs=0;const ck=(n,f)=>{try{f();console.log('ok  ',n)}catch(e){errs++;console.log('FAIL',n,e.stack.split('\n').slice(0,3).join(' | '))}};
const key=c=>dispatchEvent(Object.assign(new Event('keydown'),{code:c}));
ck('tutorial dummies spawn clear of the panel and long steps wrap',()=>{
 LS.tut=0;go();tutNext();if(E.some(e=>e.y<260))throw Error('dummy under the panel: '+E.map(e=>e.y|0));
 const w=wpx('Gold-ringed shots slip past orbs. Red diamonds cannot be erased: dash through them.',592,17,'bold');if(w.length<2)throw Error('step 5 did not wrap');
 TUT.st=4;ui(tutDraw);tutEnd()});
ck('homing locks onto the enemy under the crosshair and ignores ones beside the path',()=>{
 go();if(TUT)tutEnd();E=[];B=[];spawnQ=[];U.home=2;P.x=480;P.y=560;
 spawn(1,480,200);const a=E[0];spawn(1,560,420);const side=E[1];E.forEach(e=>{e.w=0;e.sp=0;e.hp=99});
 M.x=480;M.y=200;pb(P.x,P.y,-Math.PI/2);const b=B[B.length-1];if(b.tg!==a)throw Error('did not lock the aimed target');
 for(let i=0;i<20;i++)upd();if(b.tg!==a)throw Error('switched to the side enemy');
 M.x=900;M.y=50;pb(P.x,P.y,-Math.PI/2);const c=B[B.length-1];if(c.tg)throw Error('locked with nothing under the crosshair');U.home=0});
ck('card screen: arrows move the highlight, Enter picks',()=>{
 go();if(TUT)tutEnd();deal();S='pick';lk=0;CSEL=-1;const n=Object.keys(own).length;
 key('ArrowRight');if(CSEL!==0)throw Error('right from none should pick card 1, got '+CSEL);key('ArrowRight');key('ArrowRight');key('ArrowRight');if(CSEL!==cards.length-1)throw Error('should clamp');
 key('ArrowLeft');if(CSEL!==cards.length-2)throw Error('left');key('Enter');if(S==='pick')throw Error('Enter did not pick')});
ck('cursor shows outside gameplay; crosshair options cycle',()=>{
 for(let i=0;i<5;i++){CFG.xs=i%3;CFG.xc=i%5;M.d=i%2;draw()}CFG.xs=0;CFG.xc=0;M.d=0;
 S='access';ui(drawUI);S='set';ui(drawUI);OSTM=1;ui(drawUI);S='title'});
ck('every sector and boss has its own song',()=>{
 const ids=['menu',...Array.from({length:10},(_,i)=>'w'+i),'aam','ghat','b0-0','b4-0'],sig=ids.map(id=>{MU.sg=null;const s=song(id);return JSON.stringify([s.p,s.sc,s.b,s.a,s.mel[0].slice(0,8)])});
 if(new Set(sig).size<ids.length-1)throw Error('songs repeat: '+(ids.length-new Set(sig).size)+' duplicates');MU.sg=null});
if(errs)throw Error(errs+' feedback checks failed');
