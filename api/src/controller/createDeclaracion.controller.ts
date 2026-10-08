import { Request, Response } from 'express';
import { DeclaracionesService } from '../services/declaraciones.services';

const crearDeclaracion = async (
  req: Request,
  response: Response,
): Promise<any> => {
  try {
    const user = (req as any).user;
    const data = {
      ...req.body,
      company: user?.companyId,
      companyName: user?.companyName,
      createdBy: user?.id,
      createdByName: user?.username,
    };
    const res = await DeclaracionesService.createDeclaracion(data);
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
