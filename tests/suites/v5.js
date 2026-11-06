dt=1/60;let errs=0;const ck=(n,f)=>{try{f();console.log('ok  ',n)}catch(e){errs++;console.log('FAIL',n,e.stack.split('\n').slice(0,3).join(' | '))}};
const frame=()=>{upd();tides();fx();draw();hzDraw();tideDraw();glitch();dealDraw();endDraw();cheatDraw();toastDraw();tipDraw();mus()};
ck('difficulties',()=>{for(let d=0;d<3;d++){CFG.dif=d;newGame();stage=3;wave=2;S='play';begin();console.log('     ',DF().n,'mhp',P.mhp,'boss hp',boss.hp,'pc',boss.pc.toFixed(2));for(let i=0;i<120;i++){P.inv=.5;frame()}}CFG.dif=1});
ck('challenges',()=>{for(const c of CHL){startChal(c.id);P.hp=P.mhp=99;const s0=S,w0=wave;for(let i=0;i<400;i++){P.inv=.5;P.ih=.5;frame();if(S=='pick'){lk=0;choose(0)}}
 let extra='';if(c.id=='rush'){if(boss){boss.sh=0;dmgBoss(1e9)}for(let i=0;i<200;i++){frame();if(S=='pick'){extra='cards:'+cards.length;lk=0;choose(0);extra+=' next wave='+wave+' stage='+stage;break}}}
 if(c.id=='terms'){deal();extra='sac cards '+cards.filter(x=>x[4]).length}
 if(c.id=='nodash'){const d0=P.dash;K.Space=1;upd();K.Space=0;extra='dash blocked '+(P.dt<=0)}
 console.log('     ',c.n,'state',S,'wave',w0,'mhp',c.id=='php'?'(start 1)':'',extra,'tmul',tmul())}MOD=''});
ck('history + stats',()=>{LS={k:0,sp:{}};CH=0;go();score=1234;stage=4;P.inv=0;P.hp=1;hurt();go();score=99;toMenu();S='stats';draw();console.log('     runs',LS.runs,'hist',LS.hist.length,LS.hist.map(h=>h.c).join(' | '))});
ck('content farm posts',()=>{go();stage=1;wave=2;begin();boss.intro=0;P.hp=P.mhp=99;let posts=0,viral=0;const oe=eb;for(let i=0;i<60*20&&boss;i++){P.inv=.5;frame();posts=Math.max(posts,E.filter(e=>e.k==7).length)}console.log('     max posts alive',posts)});
ck('keynote spotlight',()=>{go();stage=4;wave=2;begin();boss.intro=0;boss.hp=boss.mhp*.6;P.hp=P.mhp=99;let sp=0,hp0=P.hp;for(let i=0;i<60*15;i++){P.inv=0;P.ih=0;LZ=[];B=[];frame();if(boss.spot)sp=Math.max(sp,boss.spot.length)}console.log('     spots',sp,'hits from spot/other',hp0-P.hp)});
ck('foundation sampling',()=>{go();stage=5;wave=2;begin();boss.intro=0;P.hp=P.mhp=99;for(let i=0;i<20;i++)sample(boss);for(let i=0;i<300;i++){P.inv=.5;frame()}console.log('     bullets',B.length,'laser colours',[...new Set(LZ.map(z=>z.c))].join(','))});
ck('menus',()=>{P=null;for(const s of ['title','chal','stats','ach','skin','set','codex']){S=s;draw()}});
ck('upgrade names in cards',()=>{const names=allc().map(c=>c[0]);console.log('     ',names.length,'cards; sample:',names.slice(0,6).join(', '))});
console.log(errs?'ERRORS '+errs:'ALL PASS');
