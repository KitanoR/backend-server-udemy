//Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
// Inicializar variables
var app = express();


// Cors

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});



//body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());


// importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');


// conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res)=>{
    if (err) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m', ' on line');
});


// Rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use("/upload", uploadRoutes);
app.use("/img", imagenesRoutes);
app.use('/', appRoutes);

// Excuchar peticiones
app.listen(3000, () =>{
    console.log('Server puerto 3000: \x1b[32m%s\x1b[0m',' on line');
});