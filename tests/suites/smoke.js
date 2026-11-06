const frame=()=>{upd();tides();fx();draw();hzDraw();tideDraw();glitch();dealDraw();endDraw();cheatDraw();tipDraw()};
let errs=0;const ck=(n,f)=>{try{f();console.log('ok  ',n)}catch(e){errs++;console.log('FAIL',n,e.stack.split('\n').slice(0,3).join(' | '))}};
dt=1/60;
ck('menus',()=>{for(const s of ['title','prac','codex','lore','set']){S=s;P=null;draw()}});
ck('waves 0..12',()=>{newGame();for(let st=0;st<13;st++){stage=st;wave=st%2;S='play';begin();P.hp=P.mhp=99;for(let i=0;i<400;i++){P.inv=.5;frame()}}});
for(let n=0;n<10;n++)ck('boss '+n,()=>{newGame();U.hyper=1;give(UP[2]);give(SAC[0]);stage=n;wave=2;S='play';begin();P.hp=P.mhp=999;let shots=0;
 for(let i=0;i<2400&&boss;i++){if(S=='deal')takeDeal(0),lk=0;if(S!='play'&&S!='deal')break;P.inv=i%90<40?0:.5;P.ih=P.inv;frame();if(boss&&i%300==299){boss.sh=0;dmgBoss(boss.mhp*.3)}}
 console.log('     state',S,'boss',boss?boss.name+' '+(boss.hp/boss.mhp).toFixed(2):'dead','BR',BR.length,'B',B.length)});
ck('aam deals + last stand + ending',()=>{newGame();stage=9;wave=2;S='play';begin();P.hp=P.mhp=999;let deals=0,ls=0;
 for(let i=0;i<4000&&S!='end';i++){if(S=='deal'){deals++;lk=0;takeDeal(1)}P.inv=.5;P.ih=.5;frame();if(boss&&boss.ls)ls=1;if(boss&&i%200==199){boss.sh=0;dmgBoss(boss.mhp*.12)}}
 console.log('     deals',deals,'laststand',ls,'state',S);for(let k=0;k<20;k++){EN&&(EN.t=99);endNext();frame()}console.log('     after ending: S',S,'stage',stage,'wave',wave)});
ck('specials',()=>{for(const sp of SPW){newGame();stage=4;wave=1;S='play';startWave();SR={k:sp.k,n:sp.n,mt:1};HZ=[];sp.f();P.hp=P.mhp=999;for(let i=0;i<600;i++){P.inv=i%2;frame()}}});
ck('pick screen + previews',()=>{newGame();for(let k=0;k<50;k++){deal();S='pick';lk=0;draw();choose(R()*3|0);S='play'}const k0=Object.keys(U0());for(const c of allc()){const b={...U};preview(c);for(const k of Object.keys(U))if(!k0.includes(k))throw 'stray key '+k+' from '+c[0]}});
ck('surge ignores dash, gap safe',()=>{newGame();S='play';E=[];spawnQ=[];P.hp=5;TD=[{h:true,s:1,t:2,p:0,u:1,g:600}];P.x=60;P.y=600;for(let i=0;i<150;i++){P.inv=1;upd();tides()}console.log('     hp in gap',P.hp);P.y=100;TD=[{h:true,s:1,t:2,p:0,u:1,g:600}];for(let i=0;i<150;i++){P.inv=1;upd();tides()}console.log('     hp outside gap while dashing',P.hp)});
ck('cheats',()=>{newGame();S='play';CHO=1;for(const m of CHM){if(m[0]=='Play ending cutscene'||m[0]=='Close')continue;m[1]();CHO=1;frame()}CHO=0;for(const k in CHS)CHS[k]=0;
 newGame();S='play';const w0=wave;CHM.find(m=>m[0]=='Upgrade picker')[1]();lk=0;choose(0);console.log('     picker mid-wave keeps wave:',wave==w0&&S=='play'&&spawnQ.length>0);
 CHM.find(m=>m[0]=='Play ending cutscene')[1]();for(let k=0;k<12;k++){EN&&(EN.t=99);endNext()}console.log('     cheat cutscene returns to',S,'wave',wave)});
ck('death + game over draw',()=>{newGame();S='play';P.hp=1;P.inv=0;hurt();draw();console.log('     S',S)});
ck('hp rows',()=>{newGame();P.mhp=15;P.hp=9;P.sh=2;S='play';draw()});
console.log(errs?'ERRORS '+errs:'ALL PASS');
