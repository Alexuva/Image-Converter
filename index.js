const { app, ipcMain } = require('electron');
const { createWindow } = require('./src/main');
const { autoUpdater, AppUpdater } = require('electron-updater');

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

app.whenReady()
.then(()=>{
    createWindow();
});