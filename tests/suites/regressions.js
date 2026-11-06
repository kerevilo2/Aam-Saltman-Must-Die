dt=1/60;S="play";newGame();begin();
// 1) hyperdrive bar spawner
const nb=BR.length;try{(typeof hbar=='function'?hbar:bar)()}catch(e){}
console.log('hyper bar spawns:',BR.length>nb);
// 2) unstoppable tide hurts a fresh player standing outside the gap
newGame();begin();S='play';E=[];spawnQ=[];P.hp=5;P.inv=0;
TD=[{h:true,s:1,t:2,p:0,u:1,g:600}];P.y=100;P.x=60;let hp0=P.hp;
for(let i=0;i<120;i++){P.inv=0;upd();tides();if(P.hp<hp0)break}
console.log('surge hurts fresh player:',P.hp<hp0);
// 3) scavenger with vampiric
newGame();begin();S='play';U.scav=1;U.vamp=1;P.pc=0;KC=0;
for(let i=0;i<10;i++){const e={k:0,x:500,y:300,c:'#ff4fa3',r:10};kill(e)}
console.log('scavenger fires with vampiric (KC=',KC,') pc=',P.pc.toFixed(1),'(expect >=105 incl kill charge 70)');
// 4) shooter cooldown at late stage
newGame();stage=10;S='play';E=[];spawn(1,480,100);const sh=E[0];sh.w=0;sh.cd=0;P.inv=99;upd();
console.log('stage 10 shooter cd after firing:',sh.cd.toFixed(2));
