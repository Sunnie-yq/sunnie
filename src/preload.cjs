const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('desktop', {
  expand: open => ipcRenderer.send('expand', open),
  position: () => ipcRenderer.invoke('widget-position'),
  move: (x,y) => ipcRenderer.send('move-widget', {x,y}),
  quit: () => ipcRenderer.send('quit')
});
