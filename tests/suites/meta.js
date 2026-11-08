dt=1/60;let errs=0;const ck=(n,f)=>{try{f();console.log('ok  ',n)}catch(e){errs++;console.log('FAIL',n,e.stack.split('\n').slice(0,3).join(' | '))}};
const frame=()=>{upd();tides();fx();draw();hzDraw();tideDraw();glitch();dealDraw();endDraw();cheatDraw();toastDraw();tipDraw()};
ck('menus ach/skin/codex all entries',()=>{P=null;for(const s of ['title','ach','skin','lore','set','prac']){S=s;draw()}S='codex';for(sub=0;sub<ENTS().length;sub++){for(const e of ENTS())see(e[0]);draw()}});
ck('every skin in game',()=>{newGame();S='play';for(const s of SKINS){SKN.eq=s.id;for(let i=0;i<5;i++){M.d=1;frame()}}SKN.eq='human'});
ck('every enemy type + boss deco',()=>{for(let n=0;n<10;n++){newGame();stage=n;wave=2;S='play';begin();boss.intro=0;for(let k=0;k<7;k++){spawn(k,100+k*100,300);E[E.length-1].w=0}P.hp=P.mhp=99;for(let i=0;i<120;i++){P.inv=.5;frame()}if(n==8){boss.hp=boss.mhp*.4;draw()}}});
ck('achievements fire',()=>{AG={};TOK=0;newGame();S='play';const e={k:0,x:1,y:1,c:'#ff4fa3',r:10};kill(e);console.log('     first:',!!AG.first,'tokens',TOK);
 newGame();stage=0;wave=2;S='play';begin();boss.intro=0;dmgBoss(1e6);for(let i=0;i<3;i++)boss&&dmgBoss(1e6);console.log('     b0:',!!AG.b0,'nohit',!!AG.nohit,'speed',!!AG.speed,'toasts',AQ.length);
 newGame();P.hp=1;P.inv=0;S='play';hurt();console.log('     dead:',!!AG.dead,'tokens earned shown',P.te);
 newGame();score=5000;fin();console.log('     tokens from 5000 score:',P.te);
 newGame();S='pick';cards=[SAC.find(s=>s[0]=='Accept All Cookies'),UP[0],UP[1]];PV=cards.map(preview);lk=0;choose(0);console.log('     cookies:',!!AG.cookies);
 console.log('     earned',Object.keys(AG).length,'TOK',TOK)});
ck('skin buy/equip',()=>{TOK=1000;AG={};SKN={own:{human:1},eq:'human'};S='skin';P=null;BT=[];M.x=300;M.y=180;draw();drawUI();const b=BT.find(b=>b.x==262&&b.y==104);b.f();console.log('     bought cursor:',!!SKN.own.cursor,SKN.eq,'TOK',TOK,'spend ach',!!AG.spend)});
ck('cheats block achievements',()=>{AG={};newGame();taint();kill({k:0,x:1,y:1,c:'#ff4fa3',r:10});console.log('     first while cheating:',!!AG.first);for(const k in CHS)CHS[k]=0;newGame()});
console.log(errs?'ERRORS '+errs:'ALL PASS');

