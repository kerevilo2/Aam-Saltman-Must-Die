// 1.0.11: boss HP rebalance. Intern/Employee use the new table, Founder keeps the old numbers.
dt=1/60;let errs=0;const ck=(n,f)=>{try{f();console.log('ok  ',n)}catch(e){errs++;console.log('FAIL',n,e.stack.split('\n').slice(0,3).join(' | '))}};
const bossAt=(k,d)=>{CFG.dif=d;go();if(TUT)tutEnd();stage=k;wave=2;E=[];spawnQ=[];startBoss();return boss.mhp};
ck('Employee bosses use the new HP table',()=>{for(let k=0;k<10;k++){const h=bossAt(k,1);if(h!==BSN[k])throw Error('boss '+(k+1)+' hp '+h+' want '+BSN[k])}});
ck('Founder keeps the original boss HP',()=>{for(let k=0;k<10;k++){const h=bossAt(k,2);if(h!==Math.round(BS[k][2]*1.25))throw Error('boss '+(k+1)+' hp '+h)}});
ck('late bosses are clearly lighter than before on Employee',()=>{for(const k of [7,8,9])if(BSN[k]>BS[k][2]*.8)throw Error('boss '+(k+1)+' barely changed')});
ck('pierce no longer inflates boss HP on Employee',()=>{const a=bossAt(9,1);U.pierce=4;stage=9;wave=2;startBoss();if(boss.mhp!==a)throw Error(a+' -> '+boss.mhp);U.pierce=0});
ck('damage upgrades still scale boss HP, but at half weight',()=>{go();if(TUT)tutEnd();U.dmg=3;stage=9;wave=2;startBoss();if(boss.mhp!==Math.round(500*(1+2*.5)))throw Error(boss.mhp)});
CFG.dif=1;
if(errs)console.log('ERRORS',errs);
