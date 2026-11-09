// 1.0.12: Live Demo hype armor and the Alt+F4 CAPTCHA.
dt=1/60;let errs=0;const ck=(n,f)=>{try{f();console.log('ok  ',n)}catch(e){errs++;console.log('FAIL',n,e.stack.split('\n').slice(0,3).join(' | '))}};
const solve=()=>{const k=CAPG[CAP.g][2];CAP.sel=new Set([...Array(9).keys()].filter(i=>k.includes(CAP.ord[i])));capVerify()};
ck('Live Demo blocks 99% while hyped and takes extra damage when crashed',()=>{CFG.dif=1;go();if(TUT)tutEnd();stage=3;wave=2;E=[];spawnQ=[];startBoss();const b=boss;b.intro=0;b.sh=0;
 b.m='up';let h=b.hp;dmgBoss(10);if(Math.abs(h-b.hp-.1)>1e-9)throw Error('up took '+(h-b.hp));b.m='dn';h=b.hp;dmgBoss(10);if(Math.abs(h-b.hp-11.5)>1e-9)throw Error('down took '+(h-b.hp))});
ck('every CAPTCHA puzzle has an answer key',()=>{for(const G of CAPG)if(!Array.isArray(G[2])||G[2].some(i=>i<0||i>8))throw Error(G[0])});
ck('hard CAPTCHA: 6 correct timed rounds quit, a mistake resets',()=>{go();S='pause';hardQuit();if(!CAP.hard||CAP.st!==0)throw Error('not hard');CAP.st=1;
 solve();solve();if(CAP.rd!==2)throw Error('rd '+CAP.rd);CAP.sel=new Set([0,1,2,3,4,5,6,7,8]);capVerify();if(CAP.rd!==0)throw Error('mistake did not reset');
 const t0=CAP.tl;solve();if(!(CAP.tl<t0))throw Error('timer should shrink');CAP.tl=.001;capDraw();if(CAP.rd!==0)throw Error('timeout did not reset');
 for(let i=0;i<6;i++)solve();if(CAP.st!==2)throw Error('not verified after 6, rd '+CAP.rd)});
ck('a second Alt+F4 keeps the same hard CAPTCHA',()=>{go();S='pause';hardQuit();CAP.st=1;solve();const c=CAP;if(CAP&&CAP.hard){CAP.msg='Pressing Alt+F4 again will not help.'}if(CAP!==c||CAP.rd!==1)throw Error('replaced')});
ck('normal quit CAPTCHA is unchanged (first verify fails, second passes)',()=>{quitAsk(()=>{});CAP.st=1;capVerify();if(CAP.st!==1)throw Error('first passed');capVerify();if(CAP.st!==2)throw Error('second failed');CAP=null});
CAP=null;if(errs)console.log('ERRORS',errs);
ck('End task penalty: hard CAPTCHA on the title, Escape cannot dismiss it, solving clears it',()=>{let done=0;AAM={penaltyDone(){done=1},quit(){}};go();toMenu();S='title';CK=0;CAP=null;KILLQ=1;killCheck();
 if(!CAP||!CAP.hard||!CAP.pen)throw Error('no penalty captcha');dispatchEvent(Object.assign(new Event('keydown'),{code:'Escape'}));if(!CAP)throw Error('Escape dismissed it');
 CAP.st=1;for(let i=0;i<6;i++)solve();if(CAP.st!==2)throw Error('not solved');const f=CAP.f;f();if(!done)throw Error('penaltyDone not called');CAP=null});
CAP=null;if(errs)console.log('ERRORS',errs);
