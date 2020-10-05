const User = require("../models/user");
const funciones = require("./factoryHandler");
const catchAsync = require("../auxiliares/catchAsync");

exports.listaUsuarios = funciones.catalogo(User);

exports.usuario = funciones.pedirUno(User);

exports.actualizarUsuario = funciones.actualizarUno(User);

exports.borrarUsuario = funciones.borrarUno(User);

exports.borrame = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { activo: false });

  res.status(204).json({
    status: "succes",
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
