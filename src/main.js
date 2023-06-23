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

    deleteImgs();
    
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
        const numFiles = args.numFiles;
        let info = await process();
        let converted;

        while(numFiles !== converted){
            converted = readFiles();
            if(numFiles === converted){
                event.sender.send("conversionFinish", info );
            }
        }
    }catch(error){
        event.sender.send('error', error);
        console.log(error);
    }

    function readFiles(){
        let imgArr = [];
        let imgs = fs.readdirSync(`${convertRoot}`)
        imgs.forEach( img => {
            let data = fs.statSync(`${convertRoot}${img}`);
            if(data.size > 0){
              imgArr.push(img);  
            }
        });

        return imgArr.length;
    }

    async function process(){
        const info = await processImg(args.files, args.format, args.compress);
        return info;
    }
    
});

//Ipc for download
ipcMain.on('download', async(event, payload)=>{
    try{
        const win = BrowserWindow.getFocusedWindow();

        dialog.showOpenDialog(win, {
            properties: ['openDirectory']
        }).then(result => {
            if(!result.canceled){
                const savePath = result.filePaths[0];
                let zip = new AdmZip();
                zip.addLocalFolder(`${convertRoot}`);
                zip.writeZip(`${savePath}/ejemplo.zip`);
                event.sender.send("done");
            }else{
                event.sender.send("cancelDownload");
            }
        }).catch(err => {
            event.sender.send('error', error);
            console.log(err)
        })

    }catch(error){
        event.sender.send('error', error);
        console.log(error);
    }
})

//Ipc for cancel conversion
ipcMain.on('modal-closed', (event, info)=>{
    try{
        deleteImgs();
    }catch(error){
        event.sender.send('error', error);
        console.log(error);
    }
});

//Delete converted img directory
function deleteImgs(){
    fs.readdir(`${convertRoot}`, (error, files)=>{
        if(error){
            console.log(error)
        }else{
            files.forEach( file =>{
                fs.rm(`${convertRoot}${file}`, (error, info)=>{
                    if(error){
                        console.log(error);
                    }else{
                        console.log(`Imagen ${file} borrada correctamente`);
                    }
                })
            })
        }
    })
}


module.exports = { createWindow };
