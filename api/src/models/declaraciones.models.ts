import { Schema, model, Document } from 'mongoose';

export interface IDeclaraciones extends Document {
  createdAt?: Date;
  importadoNacional?: string; //I | N
  numeroDeclaracion: string; //numerico
  datosDeclaracion: string;
  pdfDeclaracion: string;
  archivoDeclaracion: string;
  factura: string; //text
  nitProveedor: string;
  proveedor: string;
  numeroFactura: string;
  pdfFactura: string;
  archivoFactura: string;
  observaciones: string;
  updatedAt?: Date;
}

const DeclaracionesSchema = new Schema<IDeclaraciones>(
  {
    importadoNacional: { type: String, required: true },
    numeroDeclaracion: { type: String, required: true },
    datosDeclaracion: { type: String, required: true },
    pdfDeclaracion: { type: String, required: true },
    archivoDeclaracion: { type: String, required: true },
    factura: { type: String, required: true },
    nitProveedor: { type: String, required: true },
    proveedor: { type: String, required: true },
    numeroFactura: { type: String, required: true },
    pdfFactura: { type: String, required: true },
    archivoFactura: { type: String, required: true },
    observaciones: { type: String, required: true, unique: true },
  },
  {
    timestamps: {
      currentTime: () => {
        const now = new Date();
        return new Date(now.getTime() - 5 * 60 * 60 * 1000);
      },
    },
    versionKey: false,
  },
);

export default model<IDeclaraciones>('Declaraciones', DeclaracionesSchema);
