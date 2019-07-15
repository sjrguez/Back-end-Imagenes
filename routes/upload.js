var express = require('express');
var multer = require('multer');
var router = express.Router();
const EASYIMAGE = require('easyimage')

const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function(req, file, cb) {
        // null as first argument means no error
        file.originalname = file.originalname.replace(/ /gi, '-')
        let remane = file.originalname.split('-')
        const archivo = `${ new Date().getTime()}-${remane[0]}-${remane[1]}`
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
                            img: `http://192.168.0.105:3000${normal.replace('./public','')}`,
                            thumb: `http://192.168.0.105:3000${thumbs.replace('./public','')}`
                        })
                    } catch (error) {

                        if (error.height === 200) await fs.unlinkSync(normal)
                    }
                    await fs.unlinkSync(imagen.path)

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
            let width = 0

            const imageInfo = await EASYIMAGE.info(imagen.path);

            if (imageInfo.height > height) {

                let heightTemp = imageInfo.height - height
                let porcientoHeight = await generalPorcentaje(heightTemp, imageInfo.height)
                width = imageInfo.width - ((porcientoHeight * imageInfo.width) / 100)

            } else {

                let heightTemp = imageInfo.height + height
                let porcientoHeight = await generalPorcentaje(height, heightTemp)
                width = imageInfo.width + ((porcientoHeight * imageInfo.width) / 100)
            }
            width = Number(width).toFixed()

            const ruta = req.body.direccion
            const id = req.body.id

            let destino = `Images/${ruta}/${id}/${width}x${height}-${imageInfo.name}`
            if (height === 200) {
                destino = `Thumbnail/${ruta}/${id}/${width}x${height}-thumb-${imageInfo.name}`
            }
            thumbnailInfo = await EASYIMAGE.thumbnail({
                src: imagen.path,
                dst: `./public/${destino}`,
                width: width,
                height: height,
            });

            resolve(thumbnailInfo.path)
        } catch (e) {

            reject({
                error: e
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