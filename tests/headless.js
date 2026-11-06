// Headless test runner: evaluates the game script from index.html with a fake
// canvas/DOM, then runs every suite in tests/suites. Usage: npm test
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const game=html.match(/<script>([\s\S]*)<\/script>/)[1];
let failed=0;
for(const file of fs.readdirSync(path.join(__dirname,'suites')).filter(f=>f.endsWith('.js'))){
 const ctx=new Proxy(function(){},{get:(t,k)=>k=='measureText'?()=>({width:10}):ctx,set:()=>true,apply:()=>ctx});
 const el=()=>({getContext:()=>ctx,style:{},addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:960,height:640})});
 const logs=[];
 const sandbox={console:{log:(...a)=>logs.push(a.join(' ')),error:(...a)=>logs.push('error: '+a.join(' '))},setTimeout,clearTimeout,Date,Math,JSON,Set,Map,Proxy,Number,String,Object,Array,
  document:{getElementById:el,createElement:el,addEventListener(){},hidden:false,documentElement:{classList:{add(){},remove(){}}}},
  localStorage:{getItem:()=>null,setItem(){},removeItem(){}},addEventListener(){},innerWidth:960,innerHeight:640,devicePixelRatio:1,
  requestAnimationFrame(){},navigator:{getGamepads:()=>[]},AudioContext:function(){throw 1}};
 sandbox.window=sandbox;
 const code=game+';\n'+fs.readFileSync(path.join(__dirname,'suites',file),'utf8');
 try{vm.runInNewContext(code,sandbox,{filename:file})}catch(e){logs.push('ERR '+e.stack.split('\n').slice(0,3).join(' | '))}
 const bad=logs.some(l=>/^(FAIL|ERR|ERRORS)/.test(l.trim()));if(bad)failed++;
 console.log((bad?'FAIL ':'ok   ')+file);if(bad||process.env.VERBOSE)console.log(logs.map(l=>'   '+l).join('\n'));
}
if(failed){console.log(failed+' suite(s) failed');process.exit(1)}else console.log('all suites passed');
