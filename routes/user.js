const express = require("express");
const userController = require("../controllers/user");
const authController = require("../controllers/autenticacion");

const router = express.Router();

router.post("/registro", authController.registro);
router.post("/ingresar", authController.iniciarSesion);
router.get("/cerrarSesion", authController.cerrarSesion);
router.post("/contraseñaOlvidada", authController.contraseñaOlvidada);
router.patch("/olvideContr", authController.reingresarContraseña);

//para proteger las rutas debajo, esta funcion siempre se ejecuta previamente
router.use(authController.proteger);

router.patch("actualizarContr", authController.actualizarContr);
router.get("/me", userController.getMe, userController.usuario);
router.patch("/actualizarme", userController.actualizarUsuario);
router.patch("/eliminarme", userController.borrame);

//middlewares que estan restringidos al admin
router.use(authController.restringir("admin"));

router.route("/").get(userController.listaUsuarios);

router
  .route("/:id")
  .get(userController.usuario)
  .patch(userController.actualizarUsuario)
  .delete(userController.borrarUsuario);

module.exports = router;
