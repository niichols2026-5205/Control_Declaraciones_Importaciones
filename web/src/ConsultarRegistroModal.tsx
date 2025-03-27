import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { Declaracion } from './types';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  registro: Declaracion | null;
}

const ConsultarRegistroModal: React.FC<ModalProps> = ({
  open,
  onClose,
  registro,
}) => {
  if (!registro) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Consultar Registro</DialogTitle>
      <DialogContent>
        <p>
          <strong>Fecha y Hora:</strong> {registro.fechaHora}
        </p>
        <p>
          <strong>Número Declaración:</strong> {registro.numeroDeclaracion}
        </p>
        <p>
          <strong>Datos Declaración:</strong> {registro.datosDeclaracion}
        </p>
        <p>
          <strong>Factura:</strong> {registro.factura}
        </p>
        <p>
          <strong>Proveedor:</strong> {registro.proveedor}
        </p>
        <p>
          <strong>Número Factura:</strong> {registro.numeroFactura}
        </p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConsultarRegistroModal;
