// Monitor selection. The choice is saved in userData/display.json and falls
// back to an available display when the selected one is unplugged.
const fs=require('node:fs'),path=require('node:path');
function createDisplays({app,screen,getWindow,isDesktop,getArena=()=>({w:960,h:640}),onSelected=()=>{}}){
 let preferred=null;const file=()=>path.join(app.getPath('userData'),'display.json');
 try{const saved=JSON.parse(fs.readFileSync(file(),'utf8'));if(Number.isSafeInteger(saved.id))preferred=saved.id}catch{}
 const available=()=>screen.getAllDisplays();
 // The menu window matches the game's arena shape (set by the screen-ratio option).
 const menuRect=area=>{const a=getArena(),k=Math.min(1,area.width*.96/a.w,area.height*.94/a.h),width=Math.round(a.w*k),height=Math.round(a.h*k);return{x:area.x+Math.round((area.width-width)/2),y:area.y+Math.round((area.height-height)/2),width,height}};
 const save=()=>{try{fs.writeFileSync(file(),JSON.stringify({id:preferred}))}catch{}};
 function current(){const win=getWindow();return available().find(d=>d.id===preferred)||(win?screen.getDisplayMatching(win.getBounds()):screen.getDisplayNearestPoint(screen.getCursorScreenPoint()))}
 function list(){const d=current();return{selected:d.id,displays:available().map((s,i)=>({id:s.id,name:s.label||'Monitor '+(i+1),width:Math.round(s.size.width*(s.scaleFactor||1)),height:Math.round(s.size.height*(s.scaleFactor||1))}))}}
 function notify(){const win=getWindow();if(win&&!win.isDestroyed())win.webContents.send('aam:displays',list())}
 function place(target){const win=getWindow();if(win&&!win.isDestroyed())win.setBounds(isDesktop()?target.workArea:menuRect(target.workArea),false)}
 function select(id){const target=available().find(d=>d.id===id);if(!target)throw new Error('Monitor is no longer connected');preferred=id;save();place(target);onSelected(target);notify();return list()}
 function sync(){const win=getWindow();if(!win||win.isDestroyed())return;const found=available().find(d=>d.id===preferred);const target=found||screen.getDisplayMatching(win.getBounds());if(preferred!==null&&!found){preferred=target.id;save()}if(isDesktop()||!found)place(target);onSelected(target);notify()}
 return{current,list,select,sync,menuRect};
}
module.exports={createDisplays};
