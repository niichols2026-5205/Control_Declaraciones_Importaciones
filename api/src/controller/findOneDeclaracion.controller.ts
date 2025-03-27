import { Request, Response } from 'express';
import { DeclaracionesService } from '../services/declaraciones.services';

const findOneDeclaracion = async (
  req: Request,
  response: Response,
): Promise<any> => {
  try {
    const { id } = req.params;
    const res = await DeclaracionesService.findOneDeclaracion(id);
    if (!res) {
      return response
        .status(404)
        .json({ message: 'Declaración no encontrada' });
    }
    return response.status(200).json(res);
  } catch (error) {
    console.log(error);
    return response.status(400).json({
      name: error.name,
      message: error.message,
      code: error.code,
    });
  }
};

export default findOneDeclaracion;
