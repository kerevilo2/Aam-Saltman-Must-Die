// Dev console tabs and the non-cheat Reset data page.
dt=1/60;let errs=0;const ck=(n,f)=>{try{f();console.log('ok  ',n)}catch(e){errs++;console.log('FAIL',n,e.stack.split('\n').slice(0,3).join(' | '))}};
ck('console draws every tab on the title and in a run',()=>{
 S='title';P=null;CHO=1;for(CTB=0;CTB<CTABS.length;CTB++)ui(cheatDraw);CHO=0;
 go();if(TUT)tutEnd();CHO=1;for(CTB=0;CTB<CTABS.length;CTB++){CHP=1;ui(cheatDraw);if(!BT.length)throw Error('no buttons on tab '+CTABS[CTB].n)}CHO=0;toMenu()});
ck('cheat unlocks are session-only and never saved',()=>{
 S='title';P=null;CH=0;SNAP=null;const tok=TOK;CTABS[4].items.find(i=>i[0]=='+1000 tokens')[1]();if(TOK!==tok+1000||!CH)throw Error('unlock did not apply/taint');
 CTABS[4].items.find(i=>i[0]=='Unlock all skins')[1]();go();if(TUT)tutEnd();if(TOK!==tok)throw Error('tokens kept after a clean run: '+TOK);if(CH)throw Error('still tainted');
 if(Object.keys(SKN.own).length>1&&!SKINS.every(s=>SKN.own[s.id])){}else if(SKINS.length>1&&SKINS.every(s=>SKN.own[s.id]))throw Error('cheat skins survived');toMenu()});
ck('data resets work without cheating, even in a cheated session',()=>{
 S='title';P=null;CH=0;SNAP=null;AG.first=1;TOK=500;LS.runs=7;LS.mx=4;SEEN.e0=3;CFG.vol=0;
 rsDo(0);if(AG.first)throw Error('achievements kept');if(CH)throw Error('reset tainted the game');
 rsDo(1);if(TOK!==0)throw Error('tokens kept');rsDo(2);if(LS.runs||LS.mx!==4)throw Error('stats reset wrong: '+JSON.stringify(LS));
 rsDo(3);if('e0' in SEEN)throw Error('codex kept');rsDo(4);if(CFG.vol!==1)throw Error('settings kept');
 TOK=50;taint();TOK+=1000;rsDo(1);if(TOK!==0)throw Error('cheated session: reset not applied');untaint();if(TOK!==0)throw Error('untaint brought tokens back: '+TOK);
 LS.mx=4;rsDo(5);if(LS.mx)throw Error('everything should drop challenge unlocks');
 S='reset';ui(drawUI);S='title'});
if(errs)throw Error(errs+' console checks failed');
