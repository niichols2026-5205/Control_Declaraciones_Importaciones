import { Request, Response } from 'express';
import { DeclaracionesService } from '../services/declaraciones.services';

const bulkCreateDeclaracion = async (
  req: Request,
  response: Response,
): Promise<any> => {
  try {
    const records = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      return response
        .status(400)
        .json({ error: 'Se debe enviar una lista no vacía de registros.' });
    }

    const res = await DeclaracionesService.bulkCreateDeclaraciones(records);
    return response.status(200).json({
      message: 'Registros creados exitosamente',
      count: res.length,
      data: res,
    });
  } catch (error: any) {
    console.error('Error en bulkCreateDeclaracion:', error);
    return response.status(400).json({
      name: error?.name,
      message: error?.message,
      code: error?.code,
    });
  }
};

export default bulkCreateDeclaracion;
