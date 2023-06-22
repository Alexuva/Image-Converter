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

//Form selectors
const form = document.querySelector('#img-converter-form');
const images = form.querySelector('#img-selector');
const format = form.querySelector('#format-select');
const compress = form.querySelector('#compressCheckBox');
const submit = form.querySelector('button');
const modal = new Modal('#imgConversion');
const modalElement = document.querySelector('#imgConversion');
const modalBody = document.querySelector('#imgConversionBody ul');
const download = modalElement.querySelector('#downloadImg');
let imgData = [];

//Listener to get files
images.addEventListener('change', (e)=>{
    e.preventDefault;
    imgData = [];
    for( const file of images.files ){
        let img = new Img(file.name, file.path, file.size, file.type);
        imgData.push(img)
    } 
})

//Listener for the submit event
submit.addEventListener('click', (e)=>{
    e.preventDefault;
    
    if(imgData.length > 0){
        
        let data = {
            files : imgData,
            format: format.value,
            compress: compress.checked ? "true" : "false",
            numFiles: imgData.length
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

//Listener for the model hidding
modalElement.addEventListener('hide.bs.modal', (e)=>{
    modalBody.innerHTML = "";
    ipcRenderer.send('modal-closed');
});

//Listener for the download button
download.addEventListener('click', (e)=>{
    e.preventDefault;
    let span = document.createElement('span');
    span.classList.add('spinner-border', 'spinner-border-md', 'text-light');
    span.setAttribute('role', 'status');
    download.disabled = true;
    download.innerHTML = "";
    download.appendChild(span);
    ipcRenderer.send('download');
})

//Ipc that catches the download done event
ipcRenderer.on("done", (event, args)=>{
    download.innerHTML = "¡Descargado!"
    setTimeout((e)=>{
        modal.hide();
        download.disabled = false;
        download.innerHTML = "Descargar"
    },1000)
})

//Ipc that catches de conversion finish event
ipcRenderer.on("conversionFinish", (event, args)=>{
    submit.innerHTML = "Convertir";
    submit.disabled = false;
    args.forEach(file => {
        let li = document.createElement("li");
        li.innerHTML = `${file.name}.${file.format}`;
        modalBody.appendChild(li);
    });

    modal.show();
})

//Ipc render on cancel download
ipcRenderer.on("cancelDownload", (event, args)=>{
    download.innerHTML = "Descargar"
    download.disabled = false;
})




