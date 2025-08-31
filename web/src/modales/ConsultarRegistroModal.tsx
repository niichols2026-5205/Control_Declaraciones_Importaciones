import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Declaracion } from '../types/types';
import { Button, CircularProgress } from '@mui/material';

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

const DetalleRegistroPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [registro, setRegistro] = useState<Declaracion | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRegistro = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/declaraciones/${id}`,
        );
        const data = await res.json();
        setRegistro(data);
      } catch (error) {
        console.error('Error al cargar registro:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistro();
  }, [id]);

  if (loading) return <CircularProgress />;
  if (!registro) return <p>Registro no encontrado.</p>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <h2>Consultar Registro</h2>
      <p>
        <strong>Fecha y Hora:</strong> {formatDate(registro.createdAt)}
      </p>
      <p>
        <strong>Tipo:</strong>{' '}
        {registro.importadoNacional === 'I' ? 'Importación' : 'Nacional'}
      </p>
      <p>
        <strong>Número Declaración:</strong> {registro.numeroDeclaracion}
      </p>
      <p>
        <strong>Datos Declaración:</strong> {registro.datosDeclaracion}
      </p>
      <p>
        <strong>Nombre Archivo Declaración:</strong>{' '}
        {registro.archivoDeclaracion}
      </p>
      <p>
        <strong>Detalle Factura:</strong> {registro.factura}
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

      <Button
        onClick={() => window.history.back()}
        color="info"
        style={{ backgroundColor: '#D7D7D7', marginTop: '1rem' }}>
        Volver
      </Button>
    </div>
  );
};

export default DetalleRegistroPage;
