const multer = require("multer");
const sharp = require("sharp");
const Product = require("../models/product");
const funciones = require("./factoryHandler");
const AppError = require("../auxiliares/appError");
const catchAsync = require("../auxiliares/catchAsync");

const multerStorage = multer.memoryStorage();

exports.crearProducto = funciones.crearUno(Product);

exports.pedirProducto = funciones.pedirUno(Product); //--------------------------------
//-------------IMPORTANTE TERMINAR DE DEFINIR LA FUNCION DE PERDIR PRODUCTO PARA QUE SELECCIONE UNO POR ID-----------

exports.catalogo = funciones.catalogo(Product);

exports.borrarProducto = funciones.borrarUno(Product);

exports.actualizarProd = funciones.actualizarUno(Product);

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("El archivo elegido no es una imágen.", 404), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadImgProd = upload.single("foto");

exports.resizeImg = catchAsync(async (req, res, next) => {
  if (!req.file.foto) return next();

  req.body.foto = `prod-${req.params.id}-${Date.now()}-portada.jpeg`;
  await sharp(req.file.foto.buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 85 })
    .toFile(`public/images/${req.file.foto}`);

  next();
});
