// Screen ratio: the arena resizes, menus stay 960x640 and clicks still land.
dt=1/60;let errs=0;const ck=(n,f)=>{try{f();console.log('ok  ',n)}catch(e){errs++;console.log('FAIL',n,e.stack.split('\n').slice(0,3).join(' | '))}};
const frame=()=>{upd();tides();fx();draw();ui(drawUI);hzDraw();tideDraw();ui(()=>{dealDraw();endDraw();cheatDraw();toastDraw()});tipDraw();shatterDraw()};
for(const [r,ew,eh] of [['1.7778',1138,640],['2.3333',1494,640],['1.3333',960,720],['1.5',960,640]])ck('ratio '+r,()=>{
 P=null;CFG.ratio=r;setRatio();if(W!==ew||H!==eh)throw Error('arena '+W+'x'+H+' expected '+ew+'x'+eh);
 S='title';BT=[];draw();ui(drawUI);const b=BT.find(b=>b.y==256);if(!b||b.x!==330)throw Error('start button not in UI space');
 M.x=b.x+UOX+10;M.y=b.y+UOY+10;click();if(S!=='play'||!P)throw Error('title click did not start the run');
 if(W!==ew)throw Error('click changed W');P.hp=P.mhp=99;
 for(let st of [0,5,9]){stage=st;wave=2;begin();boss.intro=0;for(let i=0;i<240;i++){P.inv=.5;P.ih=.5;frame()}}
 deal();S='pick';lk=0;draw();ui(drawUI);M.x=45+300+100+UOX;M.y=300+UOY;const n0=Object.keys(own).length;click();if(S!=='play')throw Error('card click missed');
 console.log('     arena',W+'x'+H,'cards picked',Object.keys(own).length-n0);toMenu()});
CFG.ratio='1.5';setRatio();
console.log(errs?'ERRORS '+errs:'ALL PASS');
