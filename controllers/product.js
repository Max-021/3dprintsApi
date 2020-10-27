const multer = require("multer");
const sharp = require("sharp");
const Product = require("../models/product");
const funciones = require("./factoryHandler");
const AppError = require("../auxiliares/appError");
const catchAsync = require("../auxiliares/catchAsync");

const multerStorage = multer.memoryStorage();

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
  console.log(req.file);
  if (!req.file) return next();

  req.body.foto = `prod-${req.body.articulo}-${Date.now()}-portada.jpeg`; 
  await sharp(req.file.buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 85 })
    .toFile(`public/images/${req.body.foto}`);

  next();
});

exports.crearProducto = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const doc = await Product.create({
    nombre: req.body.nombre,
    articulo: req.body.articulo,
    precio: req.body.precio,
    descripcion: req.body.descripcion,
    cantidad: req.body.cantidad,
    colores: req.body.colores,
    foto: req.body.foto
  });

  res.status(201).json({
    status: "success",
    data: {
      data: doc,
    },
  });
})

exports.pedirProducto = funciones.pedirUno(Product); //--------------------------------
//-------------IMPORTANTE TERMINAR DE DEFINIR LA FUNCION DE PERDIR PRODUCTO PARA QUE SELECCIONE UNO POR ID-----------

exports.catalogo = funciones.catalogo(Product);

exports.borrarProducto = funciones.borrarUno(Product);

exports.actualizarProd = funciones.actualizarUno(Product);
