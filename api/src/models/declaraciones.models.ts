import { Schema, model, Document } from 'mongoose';

export interface IDeclaraciones extends Document {
  createdAt?: Date;
  importadoNacional?: string; //I | N
  numeroDeclaracion?: string; //numerico
  datosDeclaracion?: string;
  pdfDeclaracion?: string;
  archivoDeclaracion?: string;
  factura?: string; //text
  nitProveedor?: string;
  proveedor?: string;
  pais?: string;
  numeroFactura?: string;
  pdfFactura?: string;
  archivoFactura?: string;
  observaciones?: string;
  updatedAt?: Date;
}

const DeclaracionesSchema = new Schema<IDeclaraciones>(
  {
    importadoNacional: { type: String, required: true },
    numeroDeclaracion: { type: String, required: true },
    datosDeclaracion: { type: String, required: true },
    pdfDeclaracion: { type: String, required: false },
    archivoDeclaracion: { type: String, required: false },
    factura: { type: String, required: true },
    nitProveedor: { type: String, required: true },
    proveedor: { type: String, required: true },
    pais: { type: String, required: false },
    numeroFactura: { type: String, required: false },
    pdfFactura: { type: String, required: false },
    archivoFactura: { type: String, required: false },
    observaciones: { type: String, required: false, default: '' },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default model<IDeclaraciones>('Declaraciones', DeclaracionesSchema);
