// One transparent native window. Menus use a 960x640 frame; runs in
// multi-window mode stretch it over the work area and the game draws panels.
const {app,BrowserWindow,ipcMain,screen,shell,powerMonitor}=require('electron');
const path=require('node:path'),fs=require('node:fs'),os=require('node:os');
const {createUpdateService}=require('./updater');
const {createDisplays}=require('./displays');

// Alt+F4 / taskbar close is intercepted: the game asks for a (very hard) CAPTCHA first.
// Real quits (the in-game Quit, update installs, Windows shutdown, a crashed page) set allowClose.
let allowClose=false,closeAsks=0,main=null,desktop=false,menuBounds=null,updates=null,arena={w:960,h:640};
const displays=createDisplays({app,screen,getWindow:()=>main,isDesktop:()=>desktop,getArena:()=>arena,onSelected:d=>{if(!desktop)menuBounds=displays.menuRect(d.workArea)}});
// Restoring after "minimize all" can leave a frameless window at a tiny size,
// so the overlay is always put back over the whole work area.
function fillWorkArea(){if(!main||main.isDestroyed()||!desktop)return;const wa=displays.current().workArea,b=main.getBounds();if(b.x!==wa.x||b.y!==wa.y||b.width!==wa.width||b.height!==wa.height)main.setBounds(wa,false)}
const trusted=e=>main&&!main.isDestroyed()&&e.sender===main.webContents;

function createMain(){
 const d=displays.current();
 main=new BrowserWindow({...displays.menuRect(d.workArea),frame:false,transparent:true,backgroundColor:'#00000000',hasShadow:false,thickFrame:false,
  resizable:false,maximizable:false,fullscreenable:true,show:false,title:'Aam Saltman Must Die',autoHideMenuBar:true,icon:path.join(__dirname,'icon.png'),
  webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true,backgroundThrottling:false}});
 main.setMenu(null);
 main.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 main.webContents.on('will-navigate',e=>e.preventDefault());
 main.once('ready-to-show',()=>main.show());
 main.on('page-title-updated',e=>e.preventDefault());
 main.on('restore',()=>{fillWorkArea();setTimeout(fillWorkArea,150)});
 main.on('close',e=>{if(allowClose||!main.webContents||main.webContents.isCrashed())return;e.preventDefault();closeAsks++;
  if(main.isMinimized())main.restore();if(!main.isVisible())main.show();main.focus();main.webContents.send('aam:close-request',closeAsks)});
 main.on('session-end',()=>{allowClose=true});
 main.webContents.on('render-process-gone',()=>{allowClose=true});
 main.webContents.on('unresponsive',()=>{allowClose=true});
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
// Windows ignores minimize while a mouse button is still held on a frameless window, so retry briefly.
ipcMain.on('aam:minimize',event=>{if(!trusted(event))return;let n=0;const go=()=>{if(!main||main.isDestroyed()||main.isMinimized())return;main.minimize();if(++n<6)setTimeout(go,120)};go()});
ipcMain.on('aam:fullscreen',event=>{if(trusted(event)&&!desktop)main.setFullScreen(!main.isFullScreen())});
// Opt-in real RAM requisition (Settings, two confirmations). One helper at a time, hard-killed after its time.
let hog=null,hogKill=null;
// Packaged builds keep the helper outside app.asar (build.asarUnpack) so it can run as its own process.
// Same formula as ramhog.js: 12 s to fill per 32 GB of RAM, never less than 12 s.
const fillLimit=()=>Math.max(12000,12000*os.totalmem()/(32*1024**3));
function hogScript(){const p=path.join(__dirname,'ramhog.js'),u=p.replace('app.asar'+path.sep,'app.asar.unpacked'+path.sep);return u!==p&&fs.existsSync(u)?u:p}
function hogStop(){if(hog){try{hog.kill()}catch(_){}hog=null}}
ipcMain.on('aam:ram-hog',(event,ms)=>{
 if(!trusted(event))return;ms=Math.max(1000,Math.min(120000,+ms||60000));
 if(hog){try{hog.send({extend:ms})}catch(_){}clearTimeout(hogKill);const c=hog;hogKill=setTimeout(()=>{if(hog===c)hogStop()},ms+fillLimit()+5000);return}
 const child=require('node:child_process').fork(hogScript(),[String(ms),...(process.env.AAM_RAM_CAP_GB?[process.env.AAM_RAM_CAP_GB]:[])],{stdio:['ignore','ignore','ignore','ipc']});hog=child;
 const tell=m=>{if(main&&!main.isDestroyed())main.webContents.send('aam:ram',m)};
 child.on('message',tell);child.on('exit',()=>{if(hog===child)hog=null;tell({phase:'released'})});child.on('error',()=>{if(hog===child)hog=null;tell({phase:'error'})});
 clearTimeout(hogKill);hogKill=setTimeout(()=>{if(hog===child)hogStop()},ms+fillLimit()+5000).unref?.();
});
ipcMain.on('aam:ram-stop',event=>{if(trusted(event))hogStop()});
ipcMain.on('aam:quit',event=>{if(trusted(event)){allowClose=true;app.quit()}});
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
  powerMonitor.on('shutdown',()=>{allowClose=true});
  updates=createUpdateService({app,notify:state=>{if(main&&!main.isDestroyed())main.webContents.send('aam:update',state)}});
  const sync=()=>displays.sync();
  screen.on('display-metrics-changed',sync);screen.on('display-removed',sync);screen.on('display-added',sync);
 });
}
app.on('before-quit',()=>{allowClose=true;hogStop();updates?.dispose()});
app.on('window-all-closed',()=>app.quit());
