const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const esTelefono = (val) => {
  return /\d{2}-\d{4}-\d{4}/.test(val);
};

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "Un usuario debe tener un nombre."],
  },
  apellido: {
    type: String,
    required: [true, "Un usario debe tener un apellido."],
  },
  rol: {
    type: String,
    enum: ["cliente", "admin"],
    default: "cliente",
  },
  email: {
    type: String,
    required: [true, "Un usuario debe tener un email."],
    unique: true,
    validate: [validator.isEmail, "Por favor ingrese un email válido."],
  },
  calle: {
    type: String,
    required: [true, "Se debe ingresar una dirección."],
  },
  altura: {
    type: Number,
    required: [true, "Una calle debe contener una numeración."],
  },
  telefono: {
    type: Number,
    // validate: {
    //   validator: (val) => esTelefono(val),
    //   message: `El número ingresado no es válido.`,
    // },
    minlength: 10,
    required: [true, "Número de teléfono del usuario requerido."],
  },
  contraseña: {
    type: String,
    required: [true, "Por favor, ingrese una contraseña."],
    minlength: 8,
    select: false,
  },
  confContraseña: {
    type: String,
    required: [true, "Por favor confirme su contraseña."],
    validate: {
      validator: function (el) {
        return el === this.contraseña;
      },
      message: "La contraseña no coincide.",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  activo: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre(/^find/, function (next) {
  this.find({ activo: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = async function (JWTTimesStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimesStamp < changedTimeStamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
