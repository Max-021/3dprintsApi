const express = require("express");
const productController = require("../controllers/product");
const authController = require("../controllers/autenticacion");

const router = express.Router();

router
  .route("/")
  .get(productController.catalogo)
  .post(
    authController.proteger,
    authController.restringir("admin"),
    productController.crearProducto
  );
router
  .route("/:id")
  .get(productController.pedirProducto)
  .patch(
    authController.proteger,
    authController.restringir("admin"),
    productController.uploadImgProd,
    productController.resizeImg,
    productController.actualizarProd
  )
  .delete(
    authController.proteger,
    authController.restringir("admin"),
    productController.borrarProducto
  );

module.exports = router;
