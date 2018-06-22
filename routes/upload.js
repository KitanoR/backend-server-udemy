var express = require("express");
var fileUpload = require("express-fileupload");
var fs = require('fs');
var app = express();

// default options
app.use(fileUpload());

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.put("/:tipo/:id", (req, res, next) => {
  var tipo = req.params.tipo;
  var id = req.params.id;

  // tipos de colección
  var tiposValidos = ['hospitales','medicos','usuarios'];
  if(tiposValidos.indexOf(tipo)<0){
    return res.status(400).json({
      ok: false,
      mensaje: "Tipo de colección no es válida",
      errors: { message: 'Tipo de colección no es válida' }
    });
  }


  if(!req.files){
    return res.status(400).json({
      ok: false,
      mensaje: "No seleccionó nada",
      errors: {message:  'Debe de seleccionar una imagen'}
    });
  }
  // obtener nombre del archivo
  var archivo = req.files.imagen;
  var nombreCortado = archivo.name.split('.');
  var extensionArchivo = nombreCortado[nombreCortado.length -1];

  // validación de extenciones
  var extensionesValidas = ['png','jpg','gif','jpeg'];
  if(extensionesValidas.indexOf(extensionArchivo) <0){
    return res.status(400).json({
      ok: false,
      mensaje: "Extensión no válida",
      errors: { message: 'Solo se acepta fotografías' }
    });
  }
  // Nombre de archivo personalizado.
  var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

  // mover el archivo a un path
  var path = `./uploads/${tipo}/${nombreArchivo}`;
  archivo.mv(path, err=>{
    if(err){
      return res
        .status(500)
        .json({
          ok: false,
          mensaje: "Error al mover archivos",
          errors: err
        });
    }
    subirPorTipo(tipo, id, nombreArchivo, res);
    // res.status(200).json({
    //   ok: true,
    //   mensaje: "Archivo movido",
    //   extension: extensionArchivo
    // });
  });


  
});

function subirPorTipo(tipo, id, nombreArchivo, res){
  if(tipo ==='usuarios'){
    Usuario.findById(id, (err, usuario)=>{
      if(!usuario){
        return res.status(400).json({
          ok: false,
          mensaje: "Usuario no existe",
          errors: {message: 'Usuario no existe'} 
        });
      }
      var pathViejo = '.uploads/usuarios/'+ usuario.img;

      // si existe elimina la imagen anterior
      if(fs.existsSync(pathViejo)){
        fs.unlinkSync(pathViejo);
      } 
      usuario.img = nombreArchivo;
      usuario.save((err, usuarioActualizado)=>{
        usuarioActualizado.password = ":)";
       return  res.status(200).json({
                ok: true,
                mensaje: "Imagen de usuario actualizada",
                  usuario: usuarioActualizado
                });
      });


    });
  }
  // fin de la verificación de usuarios
  if(tipo === 'medicos'){
    Medico.findById(id ,(err, medico)=>{
      if (!medico) {
        return res.status(400).json({
          ok: false,
          mensaje: "Médico no existe",
          errors: { message: 'El médico no existe' }
        });
      }

      var pathViejo = '.uploads/medicos/' + medico.img;

      // si existe elimina la imagen anterior
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo, (err) => {
          console.log('Se ha borrado la imagen de doctor');
        });
      }
      medico.img = nombreArchivo;

      medico.save((err, medicoActualizado)=>{
        return res.status(200).json({
          ok: true,
          mensaje: "Imagen de médico actualizado",
          medico: medicoActualizado
        });
      });
    });
  }
  //Fin de la verificación de médicos
  if(tipo === 'hospitales'){
    Hospital.findById(id, (err, hospital)=>{
      if (!hospital) {
        return res
          .status(400)
          .json({
            ok: false,
            mensaje: "Hospital no existe",
            errors: { message: "El hospital no existe" }
          });
      }
      var pathViejo = '.uploads/hospitales/' + hospital.img;

      // si existe elimina la imagen anterior
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo, (err) => {

        });
      }
      hospital.img = nombreArchivo;

      hospital.save((err, hospitalActualizado)=>{
        return res.status(200).json({
          ok: true,
          mensaje: "Imagen de hospital actualizado",
          hospital: hospitalActualizado
        });
      });
    });
  }
  //fin verificación de hospitales
  // fin de la función 
}

module.exports = app;
