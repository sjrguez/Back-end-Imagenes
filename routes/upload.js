var express = require('express');
var multer = require('multer');
var router = express.Router();
const EASYIMAGE = require('easyimage')

const storage = multer.diskStorage({
    destination: './public/imagenes',
    filename: function (req, file, cb) {        
        // null as first argument means no error
        const archivo =  `${ new Date().getTime()}-${file.originalname}`  
        cb(null, archivo)
    }
})

const upload = multer({
    storage: storage, 
    fileFilter: function (req, file, cb) {
        sanitizeFile(file, cb);
    }
}).any()


/* POST saveblog router. */
router.post('/saveBlog',   function(req, res, next) {

    upload (req, res,async (err) => {
        if (err){ 
            res.status(500).json({
                msg: err
            })
        }else{
            // If file is not selected
            if (req.files.length === 0 ||  req.files === undefined) {
                res.status(400).json({
                    msg: 'No file selected!'
                })
            }
            else{
                const Imagenes = [];
                for(imagen of req.files){
                    
                    try {
                        let height = 500
                         let width
                        
                        const imageInfo = await EASYIMAGE.info(imagen.path);

                        if (imageInfo.height > height) {
                            let heightTemp = imageInfo.height - height
                             
                            let porcientoHeight = await generalPorcentaje(heightTemp, imageInfo.height)
                            
                            width = imageInfo.width - ((porcientoHeight * imageInfo.width)/100) 
                            let  x = porcientoHeight * imageInfo.width

                        } else {

                            let heightTemp = imageInfo.height + height
                             
                            let porcientoHeight = await generalPorcentaje(height, heightTemp)
                            console.log(imageInfo);
                            
                            console.log(heightTemp);
                            console.log(porcientoHeight);
                            
                            width = imageInfo.width + ((porcientoHeight * imageInfo.width)/100) 
                            console.log(width);
                        }

                        // console.log(height,width, "thumn");
                        // console.log(imageInfo.width, imageInfo.height, "original");
                        
                        
                        const thumbnailInfo = await EASYIMAGE.thumbnail({
                            src: imagen.path,
                            dst: `./public/thumbnail/${new Date().getTime()}.${imageInfo.name.split('.')[1].toLowerCase()}`,
                            width:  width,
                            height: height,
                        });
                        
                        console.log("Thumbnail is at: " + JSON.stringify(thumbnailInfo));
                    } catch (e) {
                        console.log("Error: ", e);
                    }

                    // Imagenes.push(`http://localhost:3000${imagen.path.replace('public','')}`)
                }

                res.status(200).json({
                    msg: 'File uploaded successfully!',
                    imagen: Imagenes
                })
            }
        }
    })
});

function generalPorcentaje(cantidad, total) {
    return new Promise((resolve, reject) => {
        let porciento = cantidad/total;
        porcentaje = porciento * 100
        
        resolve(porcentaje)
    })
}

function sanitizeFile(file, cb) {
    // Define the allowed extension
    let fileExts = ['png', 'jpg', 'jpeg', 'gif','ico']
    // Check allowed extensions
    let isAllowedExt = fileExts.includes(file.originalname.split('.')[1].toLowerCase());
    // Mime type must be an image
    let isAllowedMimeType = file.mimetype.startsWith("image/")
    if (isAllowedExt && isAllowedMimeType) {
        return cb(null, true) // no errors
    }
    else {
        // pass error msg to callback, which can be displaye in frontend
        cb({ok: false,error: "su dita madre"})
    }
}


module.exports = router;