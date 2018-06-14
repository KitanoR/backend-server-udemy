//Requires
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables
var app = express();


// conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res)=>{
    if (err) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m', ' on line');
});


// Rutas
app.get('/', (req,res,next)=>{
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});

// Excuchar peticiones
app.listen(3000, () =>{
    console.log('Server puerto 3000: \x1b[32m%s\x1b[0m',' on line');
});