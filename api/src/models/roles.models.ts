import { Schema, model, Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
}

const RoleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default model<IRole>('roles', RoleSchema);
