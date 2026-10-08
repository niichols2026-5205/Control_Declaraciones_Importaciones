import express from 'express';
import crearteDeclaracion from '../controller/createDeclaracion.controller';
import bulkCreateDeclaracion from '../controller/bulkCreateDeclaracion.controller';
import findOneDeclaracion from '../controller/findOneDeclaracion.controller';
import findAllDeclaraciones from '../controller/findAllDeclaracion.controller';
import updateDeclaracion from '../controller/updateDeclaracion.controller';
import deleteDeclaracion from '../controller/deleteDeclaracion.controller';

import { verifyToken } from '../middlewares/authMiddleware';

const router = express.Router();

router
  .route('/')
  .post(verifyToken, crearteDeclaracion)
  .get(verifyToken, findAllDeclaraciones);

router.post('/bulk', verifyToken, bulkCreateDeclaracion);

router
  .route('/:id')
  .get(findOneDeclaracion) // Público para permitir consulta mediante escaneo de código QR
  .put(verifyToken, updateDeclaracion)
  .delete(verifyToken, deleteDeclaracion);

export default router;
