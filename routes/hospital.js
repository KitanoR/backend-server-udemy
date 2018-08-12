var express = require("express");
var app = express();
var jwt = require("jsonwebtoken");
var mdAutenticacion = require("../middlewares/autenticacion");
var Hospital = require("../models/hospital");

//========================================================================
// Listar hospitales
//========================================================================
app.get('/', (req, res, next)=>{
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .exec((err, hospitales)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: "Error cargando hospitales",
                errors: err
            });
        }
        Hospital.count({}, (err, conteo)=>{
            res.status(200).json({
                ok: true,
                hospital: hospitales,
                total: conteo
            });
        });
        
    });
});

//========================================================================
// Obtener Hospital por ID
//========================================================================
app.get('/:id', (req, res)=>{
    var id = req.params.id;

    Hospital.findById(id)
    .populate('usuario', 'nombre img email')
    .exec((err, hospital)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al busccar hospital',
                errors: err
            });
        }
        if(!hospital){
            return res. status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + 'no existe',
                errors: {message: 'No existe un hospital con ese ID'}
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospital
        });
    });
});

//========================================================================
// Crear hospital
//========================================================================
app.post("/", mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardar)=>{
        if (err) {
          return res
            .status(400)
            .json({
              ok: false,
              mensaje: "Error al crear hospital",
              errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardar
        });
    });
    
});

//========================================================================
// Actualizar hospital
//========================================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res)=>{
    var id = req.params.id;
    var body = req.body;
    Hospital.findById(id ,(err, hospital)=>{
        if (err) {
          return res
            .status(500)
            .json({
              ok: false,
              mensaje: "Error al buscar hospital",
              errors: err
            });
        }
        if (!hospital) {
          return res
            .status(400)
            .json({
              ok: false,
              mensaje: "El hospital no existe",
              errors: { message: "No existe un hospital con este ID" }
            });
        }
        hospital.nombre = body.nombre;
        hospital.save((err, hospitalGuardado)=>{
            if (err) {
              return res
                .status(400)
                .json({
                  ok: false,
                  mensaje: "Error al actualizar hospital",
                  errors: err
                });
            }
            res
              .status(200)
              .json({ ok: true, hospital: hospitalGuardado });
        });
    });
});

//========================================================================
// Eliminar usuario por el id
//========================================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalGuardado) => {
        if (err) {
            return res
                .status(500)
                .json({
                    ok: false,
                    mensaje: "Error al borrar hospital",
                    errors: err
                });
        }
        if (!hospitalGuardado) {
          return res
            .status(400)
            .json({
              ok: false,
              mensaje: "No existe un hospital con ese id",
              errors: { message: "No existe un hospital con ese id" }
            });
        }
        res.status(200).json({
            ok: true,
            mensaje: 'Hospital borrado'
        });
    });
});
module.exports =app;