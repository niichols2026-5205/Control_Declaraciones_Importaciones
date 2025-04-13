import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { Declaracion } from '../types/types';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  registro: Declaracion | null;
}

const formatDate = (isoDate: string) => {
  return new Date(isoDate).toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const ConsultarRegistroModal: React.FC<ModalProps> = ({
  open,
  onClose,
  registro,
}) => {
  if (!registro) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Consultar Registro</DialogTitle>
      <DialogContent>
        <p>
          <strong>Fecha y Hora:</strong> {formatDate(registro.createdAt)}
        </p>
        <p>
          <strong>Tipo:</strong>{' '}
          {registro.importadoNacional === 'I' ? 'Importacion' : 'Nacional'}
        </p>
        <p>
          <strong>Número Declaración:</strong> {registro.numeroDeclaracion}
        </p>
        <p>
          <strong>Datos Declaración:</strong> {registro.datosDeclaracion}
        </p>
        <p>
          <strong>Nombre Archivo Declaracion:</strong>{' '}
          {registro.archivoDeclaracion}
        </p>
        <p>
          <strong>Detalle factura:</strong> {registro.factura}
        </p>
        <p>
          <strong>Nit Proveedor:</strong> {registro.nitProveedor}
        </p>
        <p>
          <strong>Proveedor:</strong> {registro.proveedor}
        </p>
        <p>
          <strong>Número Factura:</strong> {registro.numeroFactura}
        </p>
        <p>
          <strong>Nombre Archivo Factura:</strong> {registro.archivoFactura}
        </p>
        <p>
          <strong>Observaciones:</strong> {registro.observaciones}
        </p>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="info"
          style={{ backgroundColor: '#D7D7D7' }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConsultarRegistroModal;
