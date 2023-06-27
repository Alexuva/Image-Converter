const { BrowserWindow, Menu, app, ipcMain, dialog } = require('electron');
const { processImg } = require('./controllers/sharp.js');
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
const convertRoot = path.join(__dirname, ('/gui/public/assets/converted/'));

//Main window
function createWindow(){
    const mainWindow = new BrowserWindow({ 
        width: 800, 
        height: 600,
        icon: 'src/gui/public/assets/imgs/mini-logo.png',
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            nativeWindowOpen: true
        },
        
    });
    
    mainWindow.loadFile('src/gui/public/views/index.html');

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
                const savePath = result.filePaths[0];
                return savePath;
            }else{
                event.sender.send("cancelConversion");
            }
        }).then( savePath => {
            let info = async()=>{ return await processImg(args.files, args.format, args.compress, savePath) }
            return info();  
        }).then( info => {
            event.sender.send("conversionFinish");
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
