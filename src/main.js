const { BrowserWindow, Menu, app, ipcMain, dialog } = require('electron');
const { autoUpdater, AppUpdater } = require('electron-updater');
const { processImg } = require('./controllers/sharp.js');
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
const convertRoot = path.join(__dirname, ('/gui/public/assets/converted/'));

//Main window
function createWindow(){
    const mainWindow = new BrowserWindow({ 
        width: 800, 
        height: 725,
        icon: 'src/gui/public/assets/imgs/mini-logo.png',
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            nativeWindowOpen: true
        },
        
    });

    mainWindow.setMinimumSize(800, 725);
    
    autoUpdater.checkForUpdates();
    
    mainWindow.loadFile('src/gui/public/views/index.html');

    ipcMain.on("loadVersion", (event, args)=>{
        try{
            autoUpdater.on("update-available", (info)=>{
                autoUpdater.downloadUpdate();
                event.sender.send('downloadingVersion');
            });

            autoUpdater.on("update-downloaded", (info)=>{
                event.sender.send('newVersion');
            })

            autoUpdater.on("update-not-available", (info)=>{
                event.sender.send('versionLoaded', app.getVersion());
            })

            autoUpdater.on("error", (info)=>{
                event.sender.send("error", info)
                console.log(info);
            })

        }catch(error){
            event.sender.send("error", error);
            console.log(error);
        }
        
    })

    ipcMain.on("minimize", (e, args)=>{
        mainWindow.minimize();
    });

    ipcMain.on("expand", (e, args)=>{
        if(mainWindow.isMaximized()){
            mainWindow.unmaximize();
        }else{
            mainWindow.maximize();
        }
        
    })

    ipcMain.on("close", (e, args)=>{
        mainWindow.close();
    })

}

//IPC for conversion
ipcMain.on('img-converter', async(event, args)=>{
    try{
        const win = BrowserWindow.getFocusedWindow();

        dialog.showOpenDialog(win, {
            title: "Selecciona el directorio de destino",
            buttonLabel: "Guardar",
            properties: ['openDirectory']
        }).then(result => {
            if(!result.canceled){
                let savePath = result.filePaths[0];
                return savePath;
            }else{
                let savePath = false;
                return savePath
            }
        }).then( savePath => {
            if(savePath){
                let info = async()=>{ return await processImg(args.files, args.format, args.compress, args.compressRange, savePath) }
                return info();
            }else{
                let info = false;
                return info
            }
        }).then( info => {
            if(info){
                event.sender.send("conversionFinish");
            }else{
                event.sender.send("cancelConversion");
            }
        }).catch(error => {
            event.sender.send('error', error);
            console.log(error)
        })
        
    }catch(error){
        event.sender.send('error', error);
        console.log(error);
    }
    
    async function process(path){
        const info = await processImg(args.files, args.format, args.compress, path);
        return info
    }
    
});

module.exports = { createWindow };
