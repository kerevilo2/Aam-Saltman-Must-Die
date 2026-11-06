// The only bridge the game page gets. No Node access in the renderer.
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('AAM',{
 native:true,
 desktop:enabled=>ipcRenderer.invoke('aam:desktop',!!enabled),
 clearDesktop:()=>ipcRenderer.invoke('aam:clear-desktop'),
 present:()=>ipcRenderer.send('aam:present'),
 minimize:()=>ipcRenderer.send('aam:minimize'),
 fullscreen:()=>ipcRenderer.send('aam:fullscreen'),
 quit:()=>ipcRenderer.send('aam:quit'),
 displays:()=>ipcRenderer.invoke('aam:displays'),
 selectDisplay:id=>ipcRenderer.invoke('aam:display-select',id),
 onDisplays:callback=>ipcRenderer.on('aam:displays',(_,state)=>callback(state)),
 updateState:()=>ipcRenderer.invoke('aam:update-state'),
 checkUpdates:()=>ipcRenderer.invoke('aam:update-check'),
 setAutoUpdates:value=>ipcRenderer.invoke('aam:update-auto',!!value),
 installUpdate:()=>ipcRenderer.invoke('aam:update-install'),
 openReleases:()=>ipcRenderer.send('aam:open-releases'),
 onUpdate:callback=>ipcRenderer.on('aam:update',(_,state)=>callback(state))
});
