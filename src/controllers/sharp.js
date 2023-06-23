const sharp = require('sharp');
const path = require('path');

async function processImg(files, format, compress, finalPath){
    let newFiles = [];

    await files.forEach( async function(file){
        const picNameArr = file.name.split('.');
        const name = picNameArr[0];
        const fileExt = picNameArr[1];
        const path = file.path;
        const size = file.size;
        const type = file.type;

        await convert(path, name, format, compress, finalPath);
        newFiles.push({ name: name, path: `${finalPath}/${name}.${format}`, format: format });
    });

    return newFiles;
}


async function convert(path, name, format, compress, finalPath){
    try{
        switch (format) {
                
            case "png":

                sharp(path).png({ quality: 100 }).toFile(`${finalPath}/${name}.png`, (error, info) => {
                    if (error) {
                        console.log(`Ha ocurrido un error ${error.message}`);
                    } else {
                        const fileSize = info.size / 1000000;
                        console.log(`Imagen convertida ${fileSize} MB`);
                    }
                });

                break;

            case "webp":

                sharp(path).webp({ quality: 100, lossless: compress === "false" ? true : false }).toFile(`${finalPath}/${name}.webp`, (error, info) => {
                    if (error) {
                        console.log(`Ha ocurrido un error ${error.message}`);
                    } else {
                        const fileSize = info.size / 1000000;
                        console.log(`Imagen convertida ${fileSize} MB`);
                    }
                });

                break;
            
            default:

                sharp(path).jpeg({ quality: 100, chromaSubsampling: '4:4:4', mozjpeg: compress === "true" ? true : false }).toFile(`${finalPath}/${name}.jpg`, (error, info) => {
                    if (error) {
                        console.log(`Ha ocurrido un error ${error.message}`);
                    } else {
                        const fileSize = info.size / 1000000;
                        console.log(`Imagen convertida ${fileSize} MB`);
                    }
                });

                break;
        }
        

    }catch(error){
        console.log(error.message);
    }
    
}

module.exports = { processImg };