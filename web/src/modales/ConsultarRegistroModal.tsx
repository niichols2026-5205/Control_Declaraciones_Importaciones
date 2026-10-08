import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Declaracion } from '../types/types';
import {
  Button,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  Divider,
  Chip,
  Box,
  Grid,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import DescargarQRModal from './DescargarQRModal';

const formatDate = (isoDate?: string) => {
  if (!isoDate) return '-';
  try {
    return new Date(isoDate).toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Bogota',
      hour12: true,
    });
  } catch {
    return String(isoDate);
  }
};

const DetalleRegistroPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [registro, setRegistro] = useState<Declaracion | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedFactura, setCopiedFactura] = useState<boolean>(false);
  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);

  const handleCopyFactura = () => {
    if (registro?.factura) {
      navigator.clipboard.writeText(registro.factura);
      setCopiedFactura(true);
      setTimeout(() => setCopiedFactura(false), 2000);
    }
  };

  // Determinar si el usuario tiene sesión activa o es un visitante por QR
  const isAuthenticated = Boolean(localStorage.getItem('token'));

  useEffect(() => {
    const fetchRegistro = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/declaraciones/${id}`,
        );
        if (!res.ok) {
          throw new Error('No se pudo encontrar el registro');
        }
        const data = await res.json();
        setRegistro(data);
      } catch (error) {
        console.error('Error al cargar registro:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRegistro();
    }
  }, [id]);

  const handleOpenFile = (fileData?: string) => {
    if (!fileData) return;
    if (fileData.startsWith('data:')) {
      const byteCharacters = atob(fileData.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length)
        .fill(0)
        .map((_, i) => byteCharacters.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: fileData.split(';')[0].split(':')[1],
      });
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, '_blank');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!registro) {
    return (
      <Box textAlign="center" padding="3rem">
        <Typography variant="h5" color="error" gutterBottom>
          Registro no encontrado
        </Typography>
        <Typography variant="body2" color="textSecondary">
          El código QR o enlace escaneado no corresponde a ninguna declaración registrada.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: { xs: '0.75rem', sm: '1.25rem' },
        maxWidth: '850px',
        margin: 'auto',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
      }}>
      <Card
        elevation={4}
        sx={{
          width: '100%',
          maxHeight: 'calc(100vh - 30px)',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
        }}>
        {/* Cabecera compacta */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
            color: 'white',
            padding: { xs: '1rem 1.25rem', sm: '1.1rem 1.5rem' },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
            flexShrink: 0,
          }}>
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.15rem' }}>
              Consulta de Registro
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
              Control de Facturación - Declaración
            </Typography>
          </Box>
          <Chip
            icon={<CheckCircleOutlineIcon style={{ color: '#fff' }} />}
            label={isAuthenticated ? 'Usuario Autenticado' : 'Consulta Pública QR'}
            size="small"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        </Box>

        {/* Contenido con scroll interno si excede la pantalla */}
        <CardContent
          sx={{
            padding: { xs: '1rem', sm: '1.25rem 1.5rem' },
            overflowY: 'auto',
            flex: 1,
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: '#cbd5e1', borderRadius: '4px' },
          }}>
          <Grid container spacing={1.5}>
            {/* Fecha y Tipo */}
            <Grid size={{ xs: 12, sm: registro.updatedAt && registro.updatedAt !== registro.createdAt ? 4 : 6 }}>
              <Typography variant="caption" color="textSecondary" display="block">
                Fecha y Hora de Creación
              </Typography>
              <Typography variant="body2" fontWeight="500">
                {formatDate(registro.createdAt)}
              </Typography>
              {registro.createdByName && (
                <Typography variant="caption" sx={{ color: '#0369a1', fontWeight: 600, display: 'block' }}>
                  Por: {registro.createdByName}
                </Typography>
              )}
            </Grid>

            {registro.updatedAt && registro.updatedAt !== registro.createdAt && (
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="textSecondary" display="block">
                  Última Modificación
                </Typography>
                <Typography variant="body2" fontWeight="500" sx={{ color: '#0284c7' }}>
                  {formatDate(registro.updatedAt)}
                </Typography>
                {registro.updatedByName && (
                  <Typography variant="caption" sx={{ color: '#0369a1', fontWeight: 600, display: 'block' }}>
                    Por: {registro.updatedByName}
                  </Typography>
                )}
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: registro.updatedAt && registro.updatedAt !== registro.createdAt ? 4 : 6 }}>
              <Typography variant="caption" color="textSecondary" display="block">
                Tipo de Operación
              </Typography>
              <Box display="flex" gap={0.75} alignItems="center" mt={0.25} flexWrap="wrap">
                <Chip
                  label={registro.importadoNacional === 'I' ? 'Importación' : 'Nacional'}
                  color={registro.importadoNacional === 'I' ? 'primary' : 'success'}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 'bold', height: '22px', fontSize: '0.72rem' }}
                />
                {registro.companyName && (
                  <Chip
                    label={`🏢 ${registro.companyName}`}
                    size="small"
                    sx={{
                      backgroundColor: '#e0f2fe',
                      color: '#0369a1',
                      fontWeight: 700,
                      height: '22px',
                      fontSize: '0.72rem',
                    }}
                  />
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 0.25 }} />
            </Grid>

            {/* Datos Declaración */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="textSecondary" display="block">
                Número de Declaración
              </Typography>
              <Typography variant="body2" fontWeight="600" color="primary.main">
                {registro.numeroDeclaracion || '-'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="textSecondary" display="block">
                Datos Declaración
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                {registro.datosDeclaracion || '-'}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="textSecondary" display="block">
                Archivo Declaración
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={0.25}>
                <Typography variant="body2">
                  {registro.archivoDeclaracion || 'Sin archivo adjunto'}
                </Typography>
                {registro.pdfDeclaracion && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={() => handleOpenFile(registro.pdfDeclaracion)}
                    sx={{ py: 0.25, fontSize: '0.75rem', textTransform: 'none' }}>
                    Ver Documento
                  </Button>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 0.25 }} />
            </Grid>

            {/* Datos Proveedor y Factura */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="textSecondary" display="block">
                Proveedor
              </Typography>
              <Typography variant="body2" fontWeight="500">
                {registro.proveedor || '-'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="textSecondary" display="block">
                NIT Proveedor
              </Typography>
              <Typography variant="body2">
                {registro.nitProveedor || '-'}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="textSecondary" display="block">
                País
              </Typography>
              <Typography variant="body2" fontWeight="500">
                {registro.pais || '-'}
              </Typography>
            </Grid>

            {/* Detalle Factura compacto con scroll vertical dedicado */}
            <Grid size={{ xs: 12 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.25}>
                <Typography variant="caption" color="textSecondary" fontWeight="600">
                  Detalle Factura
                </Typography>
                {registro.factura && (
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<ContentCopyIcon sx={{ fontSize: 13 }} />}
                    onClick={handleCopyFactura}
                    sx={{ textTransform: 'none', fontSize: '0.72rem', py: 0 }}>
                    {copiedFactura ? '¡Copiado!' : 'Copiar detalle'}
                  </Button>
                )}
              </Box>
              <Box
                sx={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  maxHeight: '95px',
                  overflowY: 'auto',
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: '0.78rem',
                  lineHeight: 1.4,
                  color: '#334155',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.04)',
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#f1f5f9',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#94a3b8',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: '#64748b',
                  },
                }}>
                {registro.factura || 'Sin detalle de factura registrado.'}
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="textSecondary" display="block">
                Observaciones
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  maxHeight: '55px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '0.8rem',
                  '&::-webkit-scrollbar': { width: '5px' },
                  '&::-webkit-scrollbar-thumb': { backgroundColor: '#cbd5e1', borderRadius: '4px' },
                }}>
                {registro.observaciones || 'Sin observaciones registradas.'}
              </Typography>
            </Grid>
          </Grid>

          {/* Botones de acción */}
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5} mt={2} pt={1}>
            <Box display="flex" gap={1} alignItems="center">
              {isAuthenticated && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate('/home')}
                  sx={{ textTransform: 'none', borderRadius: '8px', px: 2, py: 0.75 }}>
                  Volver al Panel
                </Button>
              )}
              <Button
                variant="contained"
                size="small"
                color="primary"
                startIcon={<QrCode2Icon />}
                onClick={() => setQrModalOpen(true)}
                sx={{
                  textTransform: 'none',
                  borderRadius: '8px',
                  px: 2,
                  py: 0.75,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                }}>
                Ver / Descargar Código QR
              </Button>
            </Box>

            {!isAuthenticated && (
              <Typography variant="caption" color="textSecondary">
                ℹ️ Esta es una vista pública de solo lectura. No se permiten modificaciones.
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Modal para descargar o ver el código QR */}
      {registro && (
        <DescargarQRModal
          open={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          declaraciones={[registro]}
          registroUnico={registro}
        />
      )}
    </Box>
  );
};

export default DetalleRegistroPage;

