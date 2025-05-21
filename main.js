const { app, BrowserWindow, ipcMain, screen, dialog } = require('electron');
const path = require('path');

const windows = new Set();

function createWindowConfig(customOptions = {}) {
  const baseConfig = {
    icon: path.join(__dirname, 'assets/icon.png'),
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      ...(customOptions.webPreferences || {})
    }
  };
  
  return { ...baseConfig, ...customOptions };
}

function createMainWindow() {
  const mainWindow = new BrowserWindow(createWindowConfig({
    width: 900,
    height: 850,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  }));
  
  mainWindow.loadFile('./renderer/index.html');
  return mainWindow;
}

function registerIPCHandlers() {
  ipcMain.handle('show-dialog', (event, options) => {
    return dialog.showMessageBoxSync(null, options);
  });

  ipcMain.on('open-preview', (event, { url, width, height }) => {
    const { height: maxHeight } = screen.getPrimaryDisplay().workAreaSize;
    const adjustedHeight = Math.min(height, maxHeight);
    const windowTitle = `Preview (${width}×${height}) - ${url}`;
    
    const previewWindow = new BrowserWindow(createWindowConfig({
      width: width,
      height: adjustedHeight,
      title: windowTitle
    }));

    previewWindow.setMinimumSize(width, adjustedHeight);
    previewWindow.setMaximumSize(width, adjustedHeight);
    previewWindow.loadURL(url);
    previewWindow.center();

    windows.add(previewWindow);
    previewWindow.on('closed', () => windows.delete(previewWindow));

    previewWindow.webContents.on('page-title-updated', (e) => {
      e.preventDefault();
      previewWindow.setTitle(windowTitle);
    });
  });
}


function setupWindowInterceptor() {
  app.on('web-contents-created', (event, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
      const win = new BrowserWindow(createWindowConfig());
      win.loadURL(url);
      return { action: 'deny' };
    });
    contents.on('new-window', (event, url) => {
      event.preventDefault();
      new BrowserWindow(createWindowConfig()).loadURL(url);
    });
  });
}

app.whenReady().then(() => {
  setupWindowInterceptor();
  registerIPCHandlers();
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