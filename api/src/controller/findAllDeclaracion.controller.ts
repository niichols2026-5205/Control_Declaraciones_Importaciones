import { Request, Response } from 'express';
import { DeclaracionesService } from '../services/declaraciones.services';

const findAllDeclaraciones = async (
  req: Request,
  response: Response,
): Promise<any> => {
  try {
    const user = (req as any).user;
    const filter: any = {};
    if (user && user.companyId) {
      filter.company = user.companyId;
    }
    const res = await DeclaracionesService.findAllDeclaraciones(filter);
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

export default findAllDeclaraciones;
