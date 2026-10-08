import { Schema, model, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    activo: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default model<ICompany>('Company', CompanySchema);
