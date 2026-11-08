// 1.0.7: optional upgrades, Compute Shortage challenge, chatbot bounds, icons, animations.
dt=1/60;let errs=0;const ck=(n,f)=>{try{f();console.log('ok  ',n)}catch(e){errs++;console.log('FAIL',n,e.stack.split('\n').slice(0,3).join(' | '))}};
const key=c=>dispatchEvent(Object.assign(new Event('keydown'),{code:c}));
ck('skip declines the cards for +500 score, by click and by keys',()=>{
 go();if(TUT)tutEnd();deal();S='pick';lk=0;PKT=0;const sc=score,n=Object.keys(own).length;M.x=480;M.y=500;uiRun(click);
 if(S==='pick'||score!==sc+500||Object.keys(own).length!==n)throw Error('click skip failed S='+S+' score '+(score-sc));
 deal();S='pick';lk=0;CSEL=-1;key('ArrowDown');if(CSEL!==3)throw Error('down should select skip');key('ArrowUp');if(CSEL!==1)throw Error('up');key('ArrowDown');key('Enter');if(S==='pick')throw Error('Enter on skip')});
ck('Compute Shortage only offers upgrades after a boss',()=>{
 startChal('bossup');if(TUT)tutEnd();E=[];spawnQ=[];wave=0;advance();if(S==='pick')throw Error('offered cards after a normal wave');
 E=[];spawnQ=[];wave=2;advance();if(S!=='pick')throw Error('no cards after the boss, S='+S);if(!CHL.find(c=>c.id=='bossup'))throw Error('not listed')});
ck('chatbots cannot back off out of the arena',()=>{
 go();if(TUT)tutEnd();E=[];spawnQ=[];B=[];P.x=W/2;P.y=H-30;spawn(1,W/2,H-60);const e=E[0];e.w=0;for(let i=0;i<300;i++){P.x=W/2;P.y=H-40;P.inv=9;upd()}
 if(e.y>H-e.r-9||e.y<0||e.x<0||e.x>W)throw Error('chatbot left the arena: '+e.x+','+e.y)});
ck('no emoji left; icon tokens render',()=>{
 const src=[...UP,...SAC].map(c=>c[3]).join('');if(/\p{Extended_Pictographic}/u.test(src))throw Error('emoji in upgrade icons');
 if(!UP.every(c=>c[3][0]=='@'&&ICO[c[3].slice(1)]))throw Error('upgrade without an icon');T('@cookie We value @lock',100,100,16);T('@droplet 3 L',100,100,14,'#fff','right')});
ck('animations run without errors',()=>{
 go();if(TUT)tutEnd();for(let i=0;i<3;i++){spawn(0,200+i*50,200)}E.forEach(e=>e.w=0);kill(E[0]);P.dt=.1;P.dx=1;P.dy=0;for(let i=0;i<30;i++){upd();draw();ui(()=>{drawUI();satDraw()})}
 deal();S='pick';lk=0;for(let i=0;i<20;i++)ui(drawUI);choose(0);if(!FLY)throw Error('no fly-in');for(let i=0;i<60;i++)ui(satDraw);if(FLY)throw Error('fly-in never finished');
 S='title';for(let i=0;i<10;i++)ui(drawUI);S='set';for(let i=0;i<10;i++)ui(drawUI)});
if(errs)throw Error(errs+' v107 checks failed');
