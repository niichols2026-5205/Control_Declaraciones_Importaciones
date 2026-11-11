import Declaraciones, { IDeclaraciones } from '../models/declaraciones.models';

export class DeclaracionesService {
  static async findAllDeclaraciones(filter: any = {}): Promise<IDeclaraciones[]> {
    return await Declaraciones.find(filter).sort({ createdAt: -1 });
  }

  static async createDeclaracion(
    data: IDeclaraciones,
  ): Promise<IDeclaraciones> {
    const nuevaDeclaracion = new Declaraciones(data);
    return await nuevaDeclaracion.save();
  }

  static async bulkCreateDeclaraciones(
    data: IDeclaraciones[],
  ): Promise<IDeclaraciones[]> {
    return await Declaraciones.insertMany(data);
  }

  static async findOneDeclaracion(id: string): Promise<IDeclaraciones | null> {
    return await Declaraciones.findById(id);
  }

  static async updateDeclaracion(
    id: string,
    data: Partial<IDeclaraciones>,
  ): Promise<IDeclaraciones | null> {
    const { _id, createdAt, ...updateFields } = data as any;
    updateFields.updatedAt = new Date();
    return await Declaraciones.findByIdAndUpdate(id, updateFields, { new: true });
  }

  static async deleteDeclaracion(id: string): Promise<IDeclaraciones | null> {
    return await Declaraciones.findByIdAndDelete(id);
  }

  static async toggleQrStatus(
    ids: string[],
    qrActivo: boolean,
    userName?: string,
    companyId?: string,
  ): Promise<any> {
    const filter: any = { _id: { $in: ids } };
    if (companyId) {
      filter.company = companyId;
    }

    const updateFields: any = {
      qrActivo,
      updatedAt: new Date(),
      updatedByName: userName,
    };

    if (!qrActivo) {
      updateFields.fechaInactivacion = new Date();
      updateFields.inactivadoPor = userName || 'Usuario';
    } else {
      updateFields.fechaInactivacion = null;
      updateFields.inactivadoPor = null;
    }

    return await Declaraciones.updateMany(filter, { $set: updateFields });
  }
}
