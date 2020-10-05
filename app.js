const path = require("path");
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const compression = require("compression");
const cors = require("cors");

//falta el globalerrorhandler
const AppError = require("./auxiliares/appError");
const productRouter = require("./routes/product");
const userRouter = require("./routes/user");

const app = express();

app.use(express.static(path.join(__dirname, "public"))); //para acceder a los archivos dentro de la API

//middlewares
app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Muchos intentos desde ésta Ip, intente más tarde",
});
app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      "nombre",
      "articulo",
      "precio",
      "descripcion",
      "cantidad",
      "colores",
    ],
  })
);

app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);

app.all("*", (req, res, next) => {
  next(
    new AppError(`No se puede encontrar: ${req.originalUrl} en el servidor`)
  );
});
//importante activar
// app.use(globalErrorHandler);

module.exports = app;
