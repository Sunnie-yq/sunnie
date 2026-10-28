const { app, BrowserWindow, ipcMain, screen } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
let win, expanded = false, positionTimer;
const dimensions = { compact: [76, 76], expanded: [410, 610] };
function positionFile() { return path.join(app.getPath('userData'), 'position.json'); }
function resize(open) {
  expanded = open;
  const [width, height] = dimensions[open ? 'expanded' : 'compact'];
  const bounds = win.getBounds();
  const area = screen.getDisplayMatching(bounds).workArea;
  win.setBounds({ x: Math.max(area.x, Math.min(bounds.x, area.x + area.width - width)), y: Math.max(area.y, Math.min(bounds.y, area.y + area.height - height)), width, height });
}
app.whenReady().then(() => {
  let position = {};
  try { position = JSON.parse(fs.readFileSync(positionFile(), 'utf8')); } catch {}
  const area = screen.getPrimaryDisplay().workArea;
  const x = Number.isFinite(position.x) ? position.x : area.x + area.width - 100;
  const y = Number.isFinite(position.y) ? position.y : area.y + 120;
  win = new BrowserWindow({ x, y, width:76, height:76, transparent:true, frame:false, resizable:false, alwaysOnTop:true, skipTaskbar:true, hasShadow:false, backgroundColor:'#00000000', webPreferences:{ preload:path.join(__dirname,'preload.cjs'), contextIsolation:true, nodeIntegration:false, sandbox:true } });
  win.setAlwaysOnTop(true, 'floating');
  win.setVisibleOnAllWorkspaces(true, {visibleOnFullScreen:true});
  resize(false);
  if (process.argv.includes('--smoke-test')) {
    const timer = setTimeout(() => { console.error('SMOKE timeout'); app.exit(1); }, 20000);
    win.webContents.once('did-finish-load', async () => {
      try {
        const ready = await win.webContents.executeJavaScript("Boolean(document.querySelector('#orb') && document.querySelector('#title') && typeof window.desktop?.expand === 'function')");
        if (!ready) throw new Error('Renderer or preload did not initialize');
        console.log('SUNNIE_SMOKE_OK');
        clearTimeout(timer);
        app.exit(0);
      } catch (error) { console.error(error); app.exit(1); }
    });
    win.webContents.once('did-fail-load', () => app.exit(1));
  }
  win.loadFile(path.join(__dirname,'index.html'));
  win.on('move', () => { clearTimeout(positionTimer); positionTimer = setTimeout(() => { const {x,y} = win.getBounds(); fs.writeFile(positionFile(), JSON.stringify({x,y}), () => {}); }, 250); });
  win.webContents.setWindowOpenHandler(() => ({action:'deny'}));
  win.webContents.on('will-navigate', event => event.preventDefault());
  if (process.platform === 'darwin') app.dock.hide();
});
ipcMain.on('expand', (event, open) => { if (event.sender === win?.webContents && typeof open === 'boolean') resize(open); });
ipcMain.on('move-widget', (event, delta) => {
  if (event.sender !== win?.webContents || !Number.isFinite(delta?.x) || !Number.isFinite(delta?.y)) return;
  const b = win.getBounds(); const area = screen.getDisplayNearestPoint({x:Math.round(delta.x),y:Math.round(delta.y)}).workArea;
  win.setPosition(Math.max(area.x,Math.min(Math.round(delta.x),area.x+area.width-b.width)), Math.max(area.y,Math.min(Math.round(delta.y),area.y+area.height-b.height)));
});
ipcMain.handle('widget-position', event => event.sender === win?.webContents ? win.getPosition() : [0,0]);
ipcMain.on('quit', event => { if (event.sender === win?.webContents) app.quit(); });
app.on('window-all-closed', () => app.quit());
