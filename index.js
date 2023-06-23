const { app } = require('electron');
const { createWindow } = require('./src/main');

app.whenReady().then(createWindow);