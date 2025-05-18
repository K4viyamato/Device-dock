const { app, BrowserWindow, ipcMain ,screen} = require('electron');
const path = require('path');

const windows = new Set();

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 850,
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.loadFile('./renderer/index.html');

  return mainWindow;
}

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('open-preview', (event, { url, width, height }) => {
  const { height: maxHeight, width: maxWidth } = screen.getPrimaryDisplay().workAreaSize;
  const adjustedHeight = Math.min(height, maxHeight);
  const windowTitle = `Preview (${width}×${height}) - ${url}`;
  const previewWindow = new BrowserWindow({
    width: width,
    height: adjustedHeight,
    title: windowTitle,
    icon: path.join(__dirname, 'assets/icon.png'),
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  previewWindow.setMinimumSize(width, adjustedHeight);
  previewWindow.setMaximumSize(width, adjustedHeight);

  previewWindow.loadURL(url);

  windows.add(previewWindow);
  
  previewWindow.on('closed', () => {
    windows.delete(previewWindow);
  });

  previewWindow.center();

  previewWindow.webContents.on('page-title-updated', (e) => {
    e.preventDefault();
    previewWindow.setTitle(windowTitle);
  });
});