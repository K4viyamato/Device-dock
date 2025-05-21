const { app, BrowserWindow, ipcMain, screen, dialog } = require('electron');
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

function registerIPCHandlers() {
    ipcMain.handle('show-dialog', (event, options) => {
        return dialog.showMessageBoxSync(null, options);
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
        previewWindow.center();

        windows.add(previewWindow);

        previewWindow.on('closed', () => {
            windows.delete(previewWindow);
        });

        previewWindow.webContents.on('page-title-updated', (e) => {
            e.preventDefault();
            previewWindow.setTitle(windowTitle);
        });
    });
}

app.whenReady().then(() => {
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