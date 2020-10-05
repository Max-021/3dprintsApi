const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "Un producto debe tener un nombre."],
      unique: true,
      trim: true,
    },
    slug: String, // Comentado por si es necesario
    articulo: {
      type: String,
      required: [true, "Un producto debe tener un articulo."],
      minlength: [8, "Un artículo debe tener 8 caracteres."], //REVISAR SI SE PUEDE PONER UNA LONGITUD FIJA
      maxlength: [8, "Un artículo debe tener 8 caracteres."],
    },
    precio: {
      type: Number,
      required: [true, "Un producto debe tener un precio"],
    },
    descripcion: {
      type: String,
      trim: true,
      required: [true, "Un producto debe contener una descrición."],
    },
    cantidad: {
      type: Number,
      default: 1,
    },
    colores: [String],
    foto: {
      type: String,
      required: [true, "Un producto debe tener una imágen."], //REVISAR, PONER UNA IMAGEN DEFAULT EN CASO DE QUE NO SE HAYA CARGADO
    },
    creado: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
