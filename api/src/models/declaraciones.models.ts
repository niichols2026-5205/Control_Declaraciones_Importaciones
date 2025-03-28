import { Schema, model, Document } from 'mongoose';

export interface IDeclaraciones extends Document {
  numeroDeclaracion: string;
  datosDeclaracion: string;
  pdfDeclaracion: string;
  archivoDeclaracion: string;
  factura: string;
  proveedor: string;
  numeroFactura: string;
  idDeclaracion: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const DeclaracionesSchema = new Schema<IDeclaraciones>(
  {
    numeroDeclaracion: { type: String, required: true },
    datosDeclaracion: { type: String, required: true },
    pdfDeclaracion: { type: String, required: true },
    archivoDeclaracion: { type: String, required: true },
    factura: { type: String, required: true },
    proveedor: { type: String, required: true },
    numeroFactura: { type: String, required: true },
    idDeclaracion: { type: String, required: true, unique: true },
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
