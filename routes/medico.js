var express = require("express");
var app = express();
var bcrypt = require("bcryptjs");

var Medico = require('../models/medico');
var jwt = require("jsonwebtoken");
var mdAutenticacion = require("../middlewares/autenticacion");

var SEED = require('../config/config').SEED;
//========================================================================
// Obtener todos los médicos
//=======================================================================
app.get("/", (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario','nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error cargando médicos",
                        errors: err
                    });
                }
                Medico.count({}, (err, conteo)=>{
                    res.status(200).json({ ok: true, medicos: medicos, total: conteo });
                });
            });


});



//========================================================================
// Actualizar médico
//========================================================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res
                .status(500)
                .json({
                    ok: false,
                    mensaje: "Error al buscar médico",
                    errors: err
                });
        }
        if (!medico) {
            return res
                .status(400)
                .json({
                    ok: false,
                    mensaje: "El médico no existe",
                    errors: { message: 'No existe un médico con ese ID' }
                });
        }
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar medico",
                    errors: err
                });
            }
            medicoGuardado.password = ':)';
            res.status(200).json({ ok: true, medico: medicoGuardado });
        });
    });
});
//========================================================================
// Crear un nuevo medico
//========================================================================  

app.post("/", mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var hospital = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    hospital.save((err, hospitalGuardar) => {
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
// Eliminar medico por el id
//========================================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res
                .status(500)
                .json({
                    ok: false,
                    mensaje: "Error al borrar medico",
                    errors: err
                });
        }
        if (!medicoBorrado) {
            return res
                .status(400)
                .json({
                    ok: false,
                    mensaje: "No existe un medico con ese id",
                    errors: { message: 'No existe un medico con ese id' }
                });
        }
        res.status(200).json({
            ok: true,
            mensaje: 'Medico borrado'
        });
    });
});
module.exports = app;
