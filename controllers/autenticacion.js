const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../models/user");
const catchAsync = require("../auxiliares/catchAsync");
const AppError = require("../auxiliares/appError");
const Email = require("../auxiliares/mail");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOps = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXP * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOps.secure = true;
  res.cookie("jwt", token, cookieOps);
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.registro = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    email: req.body.email,
    contraseña: req.body.contraseña,
    confContraseña: req.body.confContraseña,
    calle: req.body.calle,
    altura: req.body.altura,
    telefono: req.body.telefono,
  });
  const url = `${req.protocol}://${req.get("host")}/me`;
  //enviar email de bienvenida y confirmacion
  // await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);
});

exports.iniciarSesion = catchAsync(async (req, res, next) => {
  const { email, contraseña } = req.body;
  console.log(email + " " + contraseña);
  if (!email || !contraseña) {
    return next(new AppError("Por favor ingrese un email y contraseña.", 400));
  }
  const user = await User.findOne({ email }).select("+contraseña");
  console.log(user);
  if (!user || !(await user.correctPassword(contraseña, user.contraseña))) {
    console.log(user.correctPassword(contraseña, user.contraseña));
    return next(new AppError("Email o contraseña incorrectos.", 401));
  }
  createSendToken(user, 200, res);
});

exports.cerrarSesion = (req, res) => {
  res.cookie("jwt", "logged out", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
  });
};

exports.proteger = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bear")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token)
    return next(
      new AppError("Para realizar esta accion debe haber ingresado.", 401)
    );

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
    return next(new AppError("El usuario no existe.", 401));
  }
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "La contraseña fue cambiada recientemente, intente otra vez.",
        401
      )
    );
  }
  req.user = freshUser;
  res.locals.user = freshUser;
});

exports.restringir = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return next(
        new AppError("No tiene permiso para realizar esta acción.", 403)
      );
    }
    next();
  };
};

exports.contraseñaOlvidada = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(
      new AppError("El mail ingresado no corresponde a ningun usuario.", 404)
    );

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;
    // await new email corregir esto
    // await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: "succes",
      message: "Token enviado al email",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "Ocurrió un error enviando el email, por favor intente más tarde!",
        500
      )
    );
  }
});

exports.reingresarContraseña = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("Token expiró o no es válido.", 400));
  }

  user.contraseña = req.body.contraseña;
  user.confContraseña = req.body.confContraseña;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

exports.actualizarContr = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+contraseña");
  if (!(await user.correctPassword(req.body.confContraseña, user.contraseña))) {
    return next(new AppError("La contraseña ingresada es incorrecta.", 401));
  }
  user.contraseña = req.body.contraseña;
  user.confContraseña = req.body.confContraseña;
  await user.save();
  createSendToken(user, 200, res);
});

exports.sesionIniciada = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      const freshUser = await User.findById(decoded.id);
      if (!freshUser) {
        return next();
      }
      if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      res.locals.user = freshUser;
      return next();
    } catch (error) {
      return next();
    }
  }
  next();
};
