const catchAsync = require("../auxiliares/catchAsync");
const AppError = require("../auxiliares/appError");
const ApiFeat = require("../auxiliares/apiFeat");

exports.crearUno = (Modelo) =>
  catchAsync(async (req, res, next) => {
    const doc = await Modelo.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.pedirUno = (Modelo, popOps) =>
  catchAsync(async (req, res, next) => {
    let query = Modelo.findById(req.params.id);
    if (popOps) query = query.populate(popOps);
    const doc = await query;

    //404 errors
    if (!doc) {
      next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        doc,
      },
    });
  });
exports.catalogo = (Modelo) =>
  catchAsync(async (req, res, next) => {
    //para permitir rutas anidadas
    let filter = {};
    if (req.params.id) filter = { product: req.params.id };
    //ejecutar query
    const features = new ApiFeat(Modelo.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query;

    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
exports.borrarUno = (Modelo) =>
  catchAsync(async (req, res, next) => {
    const doc = await Modelo.findByIdAndDelete(req.params.id);
    //404 errors
    if (!doc) {
      next(new AppError("No document found with that ID", 404));
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  });
exports.actualizarUno = (Modelo) =>
  catchAsync(async (req, res, next) => {
    const doc = await Modelo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    //404 errors
    if (!doc) {
      next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });
