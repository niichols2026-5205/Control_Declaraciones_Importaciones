import Declaraciones, { IDeclaraciones } from '../models/declaraciones.models';

export class DeclaracionesService {
  static async findAllDeclaraciones(): Promise<IDeclaraciones[]> {
    return await Declaraciones.find().sort({ createdAt: -1 });
  }

  static async createDeclaracion(
    data: IDeclaraciones,
  ): Promise<IDeclaraciones> {
    const nuevaDeclaracion = new Declaraciones(data);
    return await nuevaDeclaracion.save();
  }

  static async findOneDeclaracion(id: string): Promise<IDeclaraciones | null> {
    return await Declaraciones.findById(id);
  }

  static async updateDeclaracion(
    id: string,
    data: Partial<IDeclaraciones>,
  ): Promise<IDeclaraciones | null> {
    return await Declaraciones.findByIdAndUpdate(id, data, { new: true });
  }

  static async deleteDeclaracion(id: string): Promise<IDeclaraciones | null> {
    return await Declaraciones.findByIdAndDelete(id);
  }
}
