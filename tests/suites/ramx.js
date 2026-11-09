// 1.0.15: opt-in real RAM attack (desktop only, two confirmations).
dt=1/60;let errs=0;const ck=(n,f)=>{try{f();console.log('ok  ',n)}catch(e){errs++;console.log('FAIL',n,e.stack.split('\n').slice(0,3).join(' | '))}};
let hogs=[];NATV=true;AAM={ramHog(ms){hogs.push(ms)},updateState(){return Promise.resolve(null)},checkUpdates(){return Promise.resolve(null)}};
const press=l=>{BT=[];draw();ui(drawUI);const b=BT.find(b=>String(b.l).startsWith(l));if(!b)throw Error("no button "+l+" on "+S);b.f()};
ck('off by default: the RAM attack does not touch real memory',()=>{CFG.ramx=0;RAMX=null;ramxGo();if(hogs.length)throw Error('hogged while off')});
ck('turning it on takes two confirmations and the second is locked for 2 s',()=>{CFG.ramx=0;S='set';press('Real RAM attack');if(S!='ramx'||RXS!==0)throw Error('no confirm page, S='+S);
 press('I understand');if(RXS!==1)throw Error('first confirm');press('Wait');if(CFG.ramx)throw Error('second confirm was not locked');
 RXT=2.1;press('Yes, let him');if(!CFG.ramx||S!='set')throw Error('not enabled after 2nd confirm')});
ck('one click turns it off',()=>{CFG.ramx=1;S='set';press('Real RAM attack');if(CFG.ramx)throw Error('still on')});
ck('when on, each RAM attack (re)starts a 60 s hold',()=>{CFG.ramx=1;RAMX=null;hogs=[];ramxGo();ramxGo();if(hogs.length!==2||hogs.some(h=>h!==60000))throw Error(JSON.stringify(hogs));RAMX.on=0;CFG.ramx=0});
ck('RAM is given back when the Aam fight ends',()=>{let st=0;AAM.ramStop=()=>st++;CFG.ramx=1;go();if(TUT)tutEnd();stage=9;wave=2;E=[];spawnQ=[];startBoss();RAMX=null;ramxGo();ramxEnd();if(st)throw Error('stopped mid-fight');S='pause';ramxEnd();if(st)throw Error('stopped on pause');S='over';ramxEnd();if(st!==1||RAMX.on)throw Error('not released at game over');CFG.ramx=0;S='title'});
ck('cancel on either page leaves it off',()=>{CFG.ramx=0;S='ramx';RXS=0;press('No thanks');if(S!='set'||CFG.ramx)throw Error('page 1 cancel');S='ramx';RXS=1;RXT=5;press('No, take me back');if(S!='set'||CFG.ramx)throw Error('page 2 cancel')});
NATV=false;if(errs)console.log('ERRORS',errs);
