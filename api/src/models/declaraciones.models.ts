import { Schema, model, Document } from 'mongoose';

export interface IDeclaraciones extends Document {
  fechaHora: string;
  numeroDeclaracion: string;
  datosDeclaracion: string;
  pdfDeclaracion: string;
  archivoDeclaracion: string;
  factura: string;
  proveedor: string;
  numeroFactura: string;
  pdfFactura: string;
  idDeclaracion: string;
}

const DeclaracionesSchema = new Schema<IDeclaraciones>({
  fechaHora: { type: String, required: true },
  numeroDeclaracion: { type: String, required: true },
  datosDeclaracion: { type: String, required: true },
  pdfDeclaracion: { type: String, required: true },
  archivoDeclaracion: { type: String, required: true },
  factura: { type: String, required: true },
  proveedor: { type: String, required: true },
  numeroFactura: { type: String, required: true },
  pdfFactura: { type: String, required: true },
  idDeclaracion: { type: String, required: true, unique: true },
});

export default model<IDeclaraciones>('Declaraciones', DeclaracionesSchema);
