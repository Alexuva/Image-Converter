const { ipcRenderer } = require('electron');
const { Modal } = require('bootstrap');

//Nav
const nav = document.querySelector("#frame");
const minimize = document.querySelector("#minimize");
const expand = document.querySelector("#expand");
const close = document.querySelector("#close");

nav.style.webkitAppRegion = "drag";

minimize.addEventListener('click', (e)=>{
    e.preventDefault;
    ipcRenderer.send('minimize');
})

expand.addEventListener('click', (e)=>{
    e.preventDefault;
    ipcRenderer.send('expand');
})

close.addEventListener('click', (e)=>{
    e.preventDefault;
    ipcRenderer.send('close');
})

//Img structure
class Img{
    constructor(name, path, size, type){
        this.name = name,
        this.path = path,
        this.size = size,
        this.type = type
    }
}

const update = document.querySelector('#update-section #checkingUpdates');
const newUpdate = document.querySelector("#update-section #newUpdate")
let version = "0.0.1";

//Ipc render that catches updates
ipcRenderer.send("loadVersion");
ipcRenderer.on("downloadingVersion", (event, args)=>{
    update.innerHTML = "Descargando nueva version..."
});

ipcRenderer.on("newVersion", (event, args)=>{
    update.classList.add('d-none');
    newUpdate.classList.remove('d-none'); 
});

ipcRenderer.on("versionLoaded", (event, args)=>{
    let actualVersion = args ?? version;
    update.innerHTML = `v.${actualVersion}`;
});

//Form selectors
const form = document.querySelector('#img-converter-form');
const images = form.querySelector('#img-selector');
const format = form.querySelector('#format-select');
const submit = form.querySelector('button');
const modal = new Modal('#imgConversion');
const alert = form.querySelector("#alert");
const rangeBlock = form.querySelector("#rangeBlock");
const range = form.querySelector('#customRange');
const infoRange = form.querySelector("#info-range");
const compressCheckbox = form.querySelector("#compression-checkbox");

let imgData = [];

//Listener to get files
images.addEventListener('change', (e)=>{
    e.preventDefault;
    imgData = [];
    for( const file of images.files ){
        let fileArr = file.name.split('.');
        let fileExt = fileArr[1];
        let extPermitted = ["jpg", "png", "webp", "tiff", "jpeg"];
        if( extPermitted.includes(fileExt) ){
            alert.classList.add('d-none');
            images.classList.remove('border-2', 'border-danger', 'text-danger');
            submit.disabled = false;
            let img = new Img(file.name, file.path, file.size, file.type);
            imgData.push(img)
        }else{
            images.classList.add('border-2', 'border-danger', 'text-danger');
            submit.disabled = true;
            alert.classList.remove('d-none');
        }
        
    } 
})

//Listener to get the compression
compressCheckbox.addEventListener('input', (e)=>{
    rangeBlock.classList.toggle('opacity-100');
})

//Listener to get the range
range.addEventListener('input', (e)=>{
    infoRange.innerHTML=`${range.value}%`
})

//Listener for the submit event
submit.addEventListener('click', (e)=>{
    e.preventDefault;
    
    if(imgData.length > 0){
        
        let data = {
            files : imgData,
            format: format.value,
            compress: compressCheckbox.checked ? true : false,
            compressRange : compressCheckbox.checked ? 100 - parseInt(range.value) : false
        }

        let span = document.createElement('span');
        span.classList.add('spinner-border', 'spinner-border-md', 'text-light');
        span.setAttribute('role', 'status');
        submit.disabled = true;
        submit.innerHTML = "";
        submit.appendChild(span);
        ipcRenderer.send('img-converter', data);

    }
});

//Ipc that catches de conversion finish event
ipcRenderer.on("conversionFinish", (event, args)=>{
    submit.innerHTML = "Convertir";
    submit.disabled = false;
    modal.show();
    setTimeout((e)=>{
        modal.hide();
    },1250)
})

//Ipc that catches cancel conversion operation
ipcRenderer.on("cancelConversion", (event, args)=>{
    submit.innerHTML = "Convertir";
    submit.disabled = false;
})

//Ipc render that catches errors
ipcRenderer.on("error", (event, args)=>{
    console.log(args);
})




