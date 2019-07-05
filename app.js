const EXPRESS = require('express');


// Inicializar variables
const APP = EXPRESS();

APP.use(EXPRESS.static(__dirname + '/public'));


const UPLOADROUTER = require('./routes/upload');


APP.use('/upload', UPLOADROUTER);


// Escuchar peticiones
APP.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});