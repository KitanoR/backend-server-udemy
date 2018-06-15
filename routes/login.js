var express = require("express");
var bcrypt = require("bcryptjs");
var Usuario = require("../models/usuario");
var jwt = require("jsonwebtoken");

var SEED =require('../config/config').SEED;

var app = express();

//========================================================================
// Login
//========================================================================

app.post('/', (req, res)=>{
    var body = req.body;
    Usuario.findOne({email: body.email}, (err, usuarioDB)=>{
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario",
                errors: err
            });
        }
        if(!usuarioDB){
            return res
              .status(400)
              .json({
                ok: false,
                mensaje: "Credenciales incorrectas",
                errors: err
              });
        }
        if(!bcrypt.compareSync(body.password, usuarioDB.password)){
            return res
                .status(400)
                .json({
                    ok: false,
                    mensaje: "Credenciales incorrectas",
                    errors: err
                });
        }
        // Crear un token !
        usuarioDB.password = ':)';
        var token = jwt.sign({usuario: usuarioDB},SEED,{expiresIn: 14400}); // cuatro horas
        res.status(200).json({
            ok: true,
            mensaje: 'login correcto',
            body: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    });

    
});


module.exports = app;