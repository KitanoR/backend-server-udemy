var express = require("express");
var bcrypt = require("bcryptjs");
var Usuario = require("../models/usuario");
var jwt = require("jsonwebtoken");

var SEED =require('../config/config').SEED;

var app = express();

var mdAutenticacion = require('../middlewares/autenticacion');
// Google
var CLIENT_ID = require("../config/config").CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

//========================================================================
// Renovar token
//========================================================================
app.get('/renuevatoken', mdAutenticacion.verificaToken, (req,res)=>{
    var token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: 14400 }); // cuatro horas
    res.status(200).json({
        ok: true,
        token: token
    });
});
//========================================================================
// Autenticación por google
//========================================================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
app.post('/google',async (req, res)=>{
    var token = req.body.token;
    var googleUser= await verify(token)
                .catch(e=>{
                    return res.status(403).json({
                        ok: false,
                        mensaje: 'Token no válido'
                    });
                });

    Usuario.findOne({email: googleUser.email}, (err, usuarioDB)=>{
        if(err){
            return res.status(500).json({
                ok: true,
                mensaje: 'Error al buscar usuario'
            });
        }
        if(usuarioDB){
            if( usuarioDB.google == false){
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Debe de usar su autenticación normal'
                });
            }else{
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // cuatro horas
                res.status(200).json({
                    ok: true,
                    mensaje: 'login correcto',
                    body: usuarioDB,
                    token: token,
                    menu: obtenerMenu(usuarioDB.role),
                    id: usuarioDB._id
                });
            }
        }else{
            // el usuario no existe hay que crearlo
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB)=>{
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // cuatro horas
                res.status(200).json({
                    ok: true,
                    mensaje: 'login correcto',
                    body: usuarioDB,
                    token: token,
                    menu: obtenerMenu(usuarioDB.role),
                    id: usuarioDB._id
                });
            });
        }
    });
    
});

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
            menu: obtenerMenu(usuarioDB.role),
            id: usuarioDB._id
        });
    });

    
});

function obtenerMenu(ROLE) {
    var menu = [
        {
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'ProgressBar', url: '/progress' },
                { titulo: 'Gráficas', url: '/graficas1' },
                { titulo: 'RXjs', url: '/rxjs' },
                { titulo: 'Promesas', url: '/promesas' }
            ]
        },
        {
            titulo: 'Mantenimientos',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                // { titulo: 'Usuarios', url: '/usuarios' },
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Médicos', url: '/medicos' },
            ]
        }
    ];
    if(ROLE === 'ADMIN_ROLE'){
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
    }
    return menu;
}
module.exports = app;