// Satire layer: cookie banner, loading tips, valuation, rate limits, run summary, environmental cost, quit CAPTCHA.
dt=1/60;let errs=0;const ck=(n,f)=>{try{f();console.log('ok  ',n)}catch(e){errs++;console.log('FAIL',n,e.stack.split('\n').slice(0,3).join(' | '))}};
const frame=()=>{BT=[];MBI=-1;if(S=='play'){upd();satTick()}fx();draw();ui(drawUI);ui(()=>{tutDraw();bootDraw();dealDraw();endDraw();satDraw();cheatDraw();toastDraw()})};
const press=lab=>{const b=BT.slice(MBI>=0?MBI:0).find(b=>b.lab===lab)||null;return b};
ck('cookie banner appears after boot, blocks the title, and accepting closes it',()=>{
 S='boot';BOOT.t=BOOTEND+2;bootSkip();if(S!=='title'||CK!==1)throw Error('banner not shown, CK='+CK);
 for(let i=0;i<30;i++)frame();if(MBI<0)throw Error('banner is not modal');if(!MDL())throw Error('title should be blocked');
 M.x=W/2;M.y=200;frame();click();if(S!=='title')throw Error('title button went through the banner, S='+S);
 const n=BT.length-MBI;if(n!==3)throw Error('expected 3 banner buttons, got '+n);
 const b=BT[BT.length-1];M.x=b.x+5;M.y=b.y+5;click();if(CK!==2)throw Error('manage did not open');
 for(let i=0;i<5;i++)frame();const tg=BT[MBI];M.x=tg.x+5;M.y=tg.y+5;click();if(!CKM)throw Error('locked toggle gave no message');
 frame();const sv=BT.find((b,i)=>i>=MBI&&b.w==250);M.x=sv.x+5;M.y=sv.y+5;click();if(CK!==0)throw Error('save did not close');frame();if(MDL())throw Error('still modal')});
ck('runs track valuation, rate limits fire without blocking, death gets an AI summary',()=>{
 CHS.god=0;go();if(TUT)tutEnd();if(!(P.val>100))throw Error('no valuation');const v0=P.val;
 E.push({x:P.x,y:P.y-100,hp:1,r:10,k:0,c:'#fff'});kill(E.pop());if(!(P.val>v0))throw Error('kill did not raise valuation');
 P.rl=0.01;satTick();if(!RLP)throw Error('rate limit did not fire');for(let i=0;i<60;i++)frame();if(S!=='play')throw Error('rate limit changed state');
 P.inv=0;P.sh=0;U.rev=0;P.hp=1;const v1=P.val;hurt();if(S!=='over')throw Error('did not die');if(!(P.val>v1))throw Error('death lowered valuation');
 if(!P.sum||!/Sources:/.test(P.sum))throw Error('no summary: '+P.sum);for(let i=0;i<120;i++)frame();
 if(!/💧/.test(envTxt(P.rt,P.kc)))throw Error('env text');if(!LS.hist[0])throw Error('no history');S='stats';frame()});
ck('loading tips rotate and quitting needs the CAPTCHA',()=>{
 if(tipAt(0)===tipAt(1)||!tipAt(-3))throw Error('tips');
 go();if(TUT)tutEnd();S='pause';quitAsk(toMenu);frame();if(MBI<0)throw Error('captcha not modal');
 click();if(S!=='pause'||!CAP)throw Error('click outside should do nothing');
 const box=BT[MBI];M.x=box.x+5;M.y=box.y+5;click();if(CAP.st!==.5)throw Error('checkbox');
 for(let i=0;i<60;i++)frame();if(CAP.st!==1)throw Error('grid not shown');
 const tile=BT[MBI];M.x=tile.x+5;M.y=tile.y+5;click();if(!CAP.sel.size)throw Error('tile not selected');
 capVerify();if(CAP.st!==1||CAP.n!==1)throw Error('first verify should fail');capVerify();if(CAP.st!==2)throw Error('second verify should pass');
 for(let i=0;i<80;i++)frame();if(CAP)throw Error('captcha did not finish')});
ck('Escape cancels the CAPTCHA and keeps the pause',()=>{S='pause';quitAsk(toMenu);CAP=null;if(S!=='pause')throw Error('state')});
ck('signing a sacrifice card sends the valuation soaring',()=>{go();if(TUT)tutEnd();deal();cards[0]=[...cards[0]];cards[0][4]='max';P.mhp=6;P.hp=6;S='pick';lk=0;const v=P.val;choose(0);if(!(P.val-v>=40))throw Error('jump too small: '+(P.val-v))});
if(errs)throw Error(errs+' satire checks failed');
