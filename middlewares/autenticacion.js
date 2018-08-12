var jwt = require("jsonwebtoken");

var SEED = require("../config/config").SEED;
//========================================================================
// Verificar el token
//========================================================================
exports.verificaToken = function(req,res, next) {
    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({
            ok: false,
            mensaje: "Token no válido",
            errors: err
          });
      }
      req.usuario = decoded.usuario;
      next();
        // return res
        //   .status(201)
        //   .json({
        //     ok: false,
        //     mensaje: "todo correcto",
        //     decoded: decoded
        //   });
    });   
}
//========================================================================
// Verificar el admin
//========================================================================
exports.verificaAdmin = function (req, res, next) {
  var usuario = req.usuario;
  if(usuario.role ==='ADMIN_ROLE'){
    next();
    return;
  }else{
    return res
      .status(401)
      .json({
        ok: false,
        mensaje: "Token no válido- No es administrador",
        errors: {message: 'No es administrador, no puede hacer eso'}
      });
  }

}
//========================================================================
// Verificar el admin o mismo usuario
//========================================================================
exports.verificaAdmin_o_mismousuario = function (req, res, next) {
  var usuario = req.usuario;
  var id = req.params.id;
  if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
    next();
    return;
  } else {
    return res
      .status(401)
      .json({
        ok: false,
        mensaje: "Token no válido- No es administrador ni mismo usuario",
        errors: { message: 'No es administrador, no puede hacer eso, no mismo usuario' }
      });
  }

}