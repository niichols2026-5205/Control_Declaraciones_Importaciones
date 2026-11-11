import { Request, Response } from 'express';
import { DeclaracionesService } from '../services/declaraciones.services';

const toggleQrDeclaracion = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { ids, qrActivo } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: 'Se debe proporcionar una lista de IDs' });
    }

    if (typeof qrActivo !== 'boolean') {
      return res
        .status(400)
        .json({ message: 'El campo qrActivo debe ser booleano' });
    }

    const companyId = (req as any).user?.companyId;
    const userName = (req as any).user?.username || 'Usuario';

    const result = await DeclaracionesService.toggleQrStatus(
      ids,
      qrActivo,
      userName,
      companyId,
    );

    return res.status(200).json({
      message: qrActivo
        ? `Se reactivaron ${result.modifiedCount} códigos QR exitosamente`
        : `Se inactivaron ${result.modifiedCount} códigos QR exitosamente`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error: any) {
    console.error('Error al cambiar estado de QR:', error);
    return res
      .status(500)
      .json({ message: error.message || 'Error del servidor' });
  }
};

export default toggleQrDeclaracion;
