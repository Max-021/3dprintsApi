# 3dprintsApi

Api creada como modelo para gestión de una página web, conectada a una base de datos remota. Puede crear usuarios y
productos, cada cuenta de usuario se valida mediante la confirmacion del email provisto y se autentican usando un Json
web token, tambien cuenta con dos roles de usuario que son admin y cliente que determinan los permisos que tiene cada uno
para poder interactuar con la base de datos. Además tanto los usuarios como los productos se pueden modificar y/o borrar.

## Para iniciar el programa desde la ubicación del archivo: npm start

## [Link para colección en Postman](https://www.getpostman.com/collections/a4420fce05d6e82eb648)

Algunas funciones no estan completamente implementadas en la colección porque están pensadas para interactuar con una página web desarrollada en React.

### Detalle colección Postman

El link lleva a una colección en el programa Postman que contiene una lista de acciones para las que está preparada esta API, cuenta con parámetros ya cargados para probar su correcto funcionamiento de una manera rápida y eficiente.

## Usuarios para iniciar sesión

**Admin**
email: admin1@sadasd.com
contraseña: asdf2121
**Cliente**
email: client1@sadasd.com
contraseña: qwer7878
