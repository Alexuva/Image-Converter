const sharp = require('sharp');
const path = require('path');

async function processImg(files, format, compress, compressRange, finalPath){
    let newFiles = [];

    for await ( const file of files ){
        const picNameArr = file.name.split('.');
        const name = picNameArr[0];
        const path = file.path;
        let image = await convert(path, name, format, compress, compressRange, finalPath);
        newFiles.push(image);
    };

    return newFiles;
}


async function convert(path, name, format, compress, compressRange, finalPath){
    try{
        let image;
        console.log(compressRange, compress);
        switch (format) {
                
            case "png":
                
                let imagePng = await sharp(path).png({ quality: compressRange !== false ? compressRange : 100 }).toFile(`${finalPath}/${name}.png`);
                image = imagePng.size;
                return image;

            case "webp":

                let imageWebp = await sharp(path).webp({ quality: 100, quality: compressRange !== false ? compressRange : 100 }).toFile(`${finalPath}/${name}.webp`);
                image = imageWebp.size;
                return image;
            
            default:

                let imageInfo = await sharp(path).jpeg({ quality: 100, chromaSubsampling: '4:4:4', mozjpeg: compress === true ? true : false, quality: compressRange !== false ? compressRange : 100 }).toFile(`${finalPath}/${name}.jpg`);
                image = imageInfo.size
                return image;
        }
        

    }catch(error){
        console.log(error.message);
    }
    
}

module.exports = { processImg };