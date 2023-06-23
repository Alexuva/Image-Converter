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
        height: 800,
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
        let fileNames = [];
        let converted;

        args.files.forEach( file => {
            let fileArr = file.name.split('.');
            let fileName = fileArr[0];
            fileNames.push(`${fileName}.${args.format}`);
        });

        dialog.showOpenDialog(win, {
            properties: ['openDirectory']
        }).then(result => {
            if(!result.canceled){
                const savePath = result.filePaths[0];
                const numFiles = args.numFiles;
                process(savePath, numFiles);
                while(numFiles !== converted){
                    converted = readFiles(savePath, fileNames);
                    if(numFiles === converted){
                        event.sender.send("conversionFinish");
                    }
                }

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

    function readFiles(path, fileNames){
        let imgArr = [];
        let files = fs.readdirSync(`${path}`)
        files.forEach( file => {
            if(fileNames.includes(file)){
                let data = fs.statSync(`${path}/${file}`);
                if(data.size > 0){
                    imgArr.push(file);  
                }
            }
        });
        return imgArr.length;
    }
    
    async function process(path){
        const info = await processImg(args.files, args.format, args.compress, path);
    }
    
});

module.exports = { createWindow };
