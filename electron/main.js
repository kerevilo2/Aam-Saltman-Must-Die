// One transparent native window. Menus use a 960x640 frame; runs in
// multi-window mode stretch it over the work area and the game draws panels.
const {app,BrowserWindow,ipcMain,screen,shell}=require('electron');
const path=require('node:path');
const {createUpdateService}=require('./updater');
const {createDisplays}=require('./displays');

let main=null,desktop=false,menuBounds=null,updates=null,arena={w:960,h:640};
const displays=createDisplays({app,screen,getWindow:()=>main,isDesktop:()=>desktop,getArena:()=>arena,onSelected:d=>{if(!desktop)menuBounds=displays.menuRect(d.workArea)}});
// Restoring after "minimize all" can leave a frameless window at a tiny size,
// so the overlay is always put back over the whole work area.
function fillWorkArea(){if(!main||main.isDestroyed()||!desktop)return;const wa=displays.current().workArea,b=main.getBounds();if(b.x!==wa.x||b.y!==wa.y||b.width!==wa.width||b.height!==wa.height)main.setBounds(wa,false)}
const trusted=e=>main&&!main.isDestroyed()&&e.sender===main.webContents;

function createMain(){
 const d=displays.current();
 main=new BrowserWindow({...displays.menuRect(d.workArea),frame:false,transparent:true,backgroundColor:'#00000000',hasShadow:false,thickFrame:false,
  resizable:false,maximizable:false,fullscreenable:true,show:false,title:'Aam Saltman Must Die',autoHideMenuBar:true,
  webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true,backgroundThrottling:false}});
 main.setMenu(null);
 main.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 main.webContents.on('will-navigate',e=>e.preventDefault());
 main.once('ready-to-show',()=>main.show());
 main.on('page-title-updated',e=>e.preventDefault());
 main.on('closed',()=>{main=null;app.quit()});
 main.loadFile(path.join(__dirname,'..','index.html'));
}

ipcMain.handle('aam:desktop',(event,enabled)=>{
 if(!trusted(event))throw new Error('Unknown window');
 const d=displays.current();
 if(main.isFullScreen())main.setFullScreen(false);
 main.hide();
 if(enabled){if(!desktop)menuBounds=main.getBounds();desktop=true;main.setBounds(d.workArea,false)}
 else{
  desktop=false;const a=d.workArea,b=menuBounds||displays.menuRect(a);
  const width=Math.min(b.width,a.width),height=Math.min(b.height,a.height);
  main.setBounds({x:Math.max(a.x,Math.min(b.x,a.x+a.width-width)),y:Math.max(a.y,Math.min(b.y,a.y+a.height-height)),width,height},false);
 }
 return main.getBounds();
});
ipcMain.handle('aam:clear-desktop',async event=>{
 if(!trusted(event)||process.platform!=='win32')return false;
 return new Promise(resolve=>{
  require('node:child_process').execFile('powershell.exe',['-NoProfile','-NonInteractive','-Command','(New-Object -ComObject Shell.Application).MinimizeAll()'],{windowsHide:true,timeout:5000},error=>{
   if(main&&!main.isDestroyed()){main.restore();fillWorkArea();main.show();main.focus();setTimeout(fillWorkArea,150)}resolve(!error)});
 });
});
ipcMain.on('aam:present',event=>{if(!trusted(event))return;fillWorkArea();if(!main.isVisible()){main.show();main.focus()}});
ipcMain.on('aam:arena',(event,w,h)=>{
 if(!trusted(event))return;w=Math.round(+w);h=Math.round(+h);if(!(w>=320&&w<=4000&&h>=320&&h<=4000)||(w===arena.w&&h===arena.h))return;
 arena={w,h};if(!desktop&&!main.isFullScreen()){menuBounds=displays.menuRect(displays.current().workArea);main.setBounds(menuBounds,false)}
});
ipcMain.on('aam:minimize',event=>{if(trusted(event))main.minimize()});
ipcMain.on('aam:fullscreen',event=>{if(trusted(event)&&!desktop)main.setFullScreen(!main.isFullScreen())});
ipcMain.on('aam:quit',event=>{if(trusted(event))app.quit()});
ipcMain.handle('aam:displays',event=>trusted(event)?displays.list():null);
ipcMain.handle('aam:display-select',(event,id)=>{if(!trusted(event))throw new Error('Unknown window');return displays.select(id)});
ipcMain.handle('aam:update-state',event=>trusted(event)?updates?.getState():null);
ipcMain.handle('aam:update-check',event=>trusted(event)?updates?.check():null);
ipcMain.handle('aam:update-auto',(event,value)=>trusted(event)?updates?.setAutomatic(value):null);
ipcMain.handle('aam:update-install',event=>trusted(event)?updates?.install():false);
ipcMain.on('aam:open-releases',event=>{if(trusted(event))shell.openExternal(require('../package.json').homepage+'/releases/latest')});

if(!app.requestSingleInstanceLock())app.quit();
else{
 app.on('second-instance',()=>{if(main){if(main.isMinimized())main.restore();main.focus()}});
 app.whenReady().then(()=>{
  createMain();
  updates=createUpdateService({app,notify:state=>{if(main&&!main.isDestroyed())main.webContents.send('aam:update',state)}});
  const sync=()=>displays.sync();
  screen.on('display-metrics-changed',sync);screen.on('display-removed',sync);screen.on('display-added',sync);
 });
}
app.on('before-quit',()=>updates?.dispose());
app.on('window-all-closed',()=>app.quit());
