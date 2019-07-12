var express = require('express');
var multer = require('multer');
var router = express.Router();
const EASYIMAGE = require('easyimage')

const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function(req, file, cb) {
        // null as first argument means no error
        let remane = file.originalname.split('-')

        const archivo = `${ new Date().getTime()}-${remane[1]}-${remane[2]}`
        cb(null, archivo)
    }
})

const upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb) {
        sanitizeFile(file, cb);
    }
}).any()

var fs = require('fs');

/* POST saveblog router. */
router.post('/saveBlog', async function(req, res, next) {

    upload(req, res, async(err) => {

        if (err) {
            return res.status(500).json({
                ok: false
            })
        } else {
            // If file is not selected
            if (req.files.length === 0 || req.files === undefined) {
                return res.status(400).json({
                    ok: false
                })
            } else {
                const Imagenes = [];
                for (imagen of req.files) {
                    let normal
                    try {
                        normal = await GeneralImagen(imagen, 600, req)
                        const thumbs = await GeneralImagen(imagen, 200, req)

                        Imagenes.push({
                            img: `http://localhost:3000${normal.replace('public','')}`,
                            thumb: `http://localhost:3000${thumbs.replace('./public','')}`
                        })
                    } catch (error) {
                        await fs.unlinkSync(imagen.path)
                        if (error.height === 200) await fs.unlinkSync(normal)
                    }

                }


                res.status(200).json({
                    imagen: Imagenes
                })
            }
        }
    })
});

function GeneralImagen(imagen, height, req) {
    return new Promise(async(resolve, reject) => {
        thumbnailInfo = null
        try {
            let width

            const imageInfo = await EASYIMAGE.info(imagen.path);

            if (imageInfo.height > height) {
                let heightTemp = imageInfo.height - height

                let porcientoHeight = await generalPorcentaje(heightTemp, imageInfo.height)

                width = imageInfo.width - ((porcientoHeight * imageInfo.width) / 100)
                    // let  x = porcientoHeight * imageInfo.width

            } else {

                let heightTemp = imageInfo.height + height

                let porcientoHeight = await generalPorcentaje(height, heightTemp)

                width = imageInfo.width + ((porcientoHeight * imageInfo.width) / 100)
            }
            console.log(req.body);

            let destino = `Normal/${new Date().getTime()}.${imageInfo.name.split('.')[1].toLowerCase()}`
            if (height === 200) {
                let destino = `Thumbnail/${new Date().getTime()}-thumb.${imageInfo.name.split('.')[1].toLowerCase()}`
            }
            thumbnailInfo = await EASYIMAGE.thumbnail({
                src: imagen.path,
                dst: `./public/thumbnail/}`,
                width: width,
                height: height,
            });

            resolve(thumbnailInfo.path)
        } catch (e) {
            reject({
                height
            })
        }

    })
}





function generalPorcentaje(cantidad, total) {
    return new Promise((resolve, reject) => {
        let porciento = cantidad / total;
        porcentaje = porciento * 100

        resolve(porcentaje)
    })
}

function sanitizeFile(file, cb) {
    // Define the allowed extension
    let fileExts = ['png', 'jpg', 'jpeg', 'gif', 'ico']
        // Check allowed extensions
    let ext = file.originalname.split('.')
    let isAllowedExt = fileExts.includes(file.originalname.split('.')[ext.length - 1].toLowerCase());
    // Mime type must be an image
    let isAllowedMimeType = file.mimetype.startsWith("image/")
    if (isAllowedExt && isAllowedMimeType) {
        return cb(null, true) // no errors
    } else {
        // pass error msg to callback, which can be displaye in frontend
        cb({ ok: false, error: "su dita madre" })
    }
}


module.exports = router;