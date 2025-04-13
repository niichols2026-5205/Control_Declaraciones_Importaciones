import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Acceso denegado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Token inválido' });
  }
};
