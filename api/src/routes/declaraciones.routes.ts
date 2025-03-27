import express from 'express';
import crearteDeclaracion from '../controller/createDeclaracion.controller';
import findOneDeclaracion from '../controller/findOneDeclaracion.controller';
import findAllDeclaraciones from '../controller/findAllDeclaracion.controller';
import updateDeclaracion from '../controller/updateDeclaracion.controller';
import deleteDeclaracion from '../controller/deleteDeclaracion.controller';

const router = express.Router();

router.route('/').post(crearteDeclaracion).get(findAllDeclaraciones);

router
  .route('/:id')
  .get(findOneDeclaracion)
  .put(updateDeclaracion)
  .delete(deleteDeclaracion);

export default router;
