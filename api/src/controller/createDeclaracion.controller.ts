import { Request, Response } from 'express';
import { DeclaracionesService } from '../services/declaraciones.services';

const crearDeclaracion = async (
  req: Request,
  response: Response,
): Promise<any> => {
  try {
    const res = await DeclaracionesService.createDeclaracion(req.body);
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

export default crearDeclaracion;
