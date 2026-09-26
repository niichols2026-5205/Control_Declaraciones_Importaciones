import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  LinearProgress,
  TextField,
  Alert,
  Divider,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TuneIcon from '@mui/icons-material/Tune';

import { Declaracion } from '../types/types';
import {
  getDeclarationQrUrl,
  generateQRCodeDataUrl,
  downloadSingleQRPng,
  exportBulkQRToZip,
  exportBulkQRToStickersPdf,
} from '../utils/qrUtils';

interface DescargarQRModalProps {
  open: boolean;
  onClose: () => void;
  /**
   * Si viene una lista (masivo), se usa bulk mode.
   * Si viene solo un registro, se puede pasar en la lista [registro] o en registroUnico.
   */
  declaraciones: Declaracion[];
  registroUnico?: Declaracion | null;
}

export default function DescargarQRModal({
  open,
  onClose,
  declaraciones,
  registroUnico,
}: DescargarQRModalProps) {
  // Determinar si es modo individual o masivo
  const targetDeclaraciones = registroUnico
    ? [registroUnico]
    : declaraciones;

  const isSingle = targetDeclaraciones.length === 1;
  const singleItem = targetDeclaraciones[0];

  const [customBaseUrl, setCustomBaseUrl] = useState<string>('');
  const [singleQrPreview, setSingleQrPreview] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });
  const [actionError, setActionError] = useState<string | null>(null);

  // Inicializar baseUrl con el origin actual
  useEffect(() => {
    if (open) {
      setCustomBaseUrl(window.location.origin);
      setActionError(null);
      setProgress({ current: 0, total: 0 });
    }
  }, [open]);

  // Cargar preview para el modo individual
  useEffect(() => {
    if (open && isSingle && singleItem) {
      const url = getDeclarationQrUrl(singleItem._id, customBaseUrl);
      generateQRCodeDataUrl(url, 280)
        .then(dataUrl => setSingleQrPreview(dataUrl))
        .catch(err => console.error('Error generando preview QR:', err));
    }
  }, [open, isSingle, singleItem, customBaseUrl]);

  const handleCopyLink = () => {
    if (!singleItem) return;
    const url = getDeclarationQrUrl(singleItem._id, customBaseUrl);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadSingle = async () => {
    if (!singleItem) return;
    try {
      setLoading(true);
      await downloadSingleQRPng(singleItem, customBaseUrl);
    } catch (err: any) {
      setActionError(err.message || 'Error al descargar el código QR');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setLoading(true);
      setActionError(null);
      setProgress({ current: 0, total: targetDeclaraciones.length });
      await exportBulkQRToStickersPdf(
        targetDeclaraciones,
        customBaseUrl,
        (current, total) => {
          setProgress({ current, total });
        },
      );
    } catch (err: any) {
      setActionError(err.message || 'Error al generar el PDF de etiquetas');
    } finally {
      setLoading(false);
    }
  };

  const handleExportZip = async () => {
    try {
      setLoading(true);
      setActionError(null);
      setProgress({ current: 0, total: targetDeclaraciones.length });
      await exportBulkQRToZip(
        targetDeclaraciones,
        customBaseUrl,
        (current, total) => {
          setProgress({ current, total });
        },
      );
    } catch (err: any) {
      setActionError(err.message || 'Error al generar el archivo ZIP');
    } finally {
      setLoading(false);
    }
  };

  const percent =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxWidth: '680px',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.15)',
        },
      }}>
      {/* Cabecera del Modal */}
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          color: '#ffffff',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Box display="flex" alignItems="center" gap={1.2}>
          <QrCode2Icon sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight="700" lineHeight={1.2}>
              {isSingle
                ? `Código QR - Declaración ${singleItem?.numeroDeclaracion || ''}`
                : 'Descarga Masiva de Códigos QR'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85, display: 'block' }}>
              {isSingle
                ? 'Acceso público para consulta de documentos y detalles'
                : `${targetDeclaraciones.length} declaraciones seleccionadas`}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          disabled={loading}
          size="small"
          sx={{
            color: '#ffffff',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
          }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: '20px 24px', backgroundColor: '#fafbfc' }}>
        {actionError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
            {actionError}
          </Alert>
        )}

        {/* MODO INDIVIDUAL */}
        {isSingle && singleItem && (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                backgroundColor: '#ffffff',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                maxWidth: '320px',
                width: '100%',
              }}>
              <Chip
                label={singleItem.importadoNacional === 'I' ? 'Importación' : 'Nacional'}
                size="small"
                color={singleItem.importadoNacional === 'I' ? 'primary' : 'success'}
                sx={{ mb: 1.5, fontWeight: 700, fontSize: '0.72rem' }}
              />

              {singleQrPreview ? (
                <Box
                  component="img"
                  src={singleQrPreview}
                  alt="QR Preview"
                  sx={{
                    width: '210px',
                    height: '210px',
                    margin: '0 auto',
                    display: 'block',
                    borderRadius: '8px',
                    border: '1px solid #f1f5f9',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: '210px',
                    height: '210px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                  }}>
                  Generando QR...
                </Box>
              )}

              <Typography variant="h6" fontWeight="700" color="#0f172a" sx={{ mt: 1.5 }}>
                {singleItem.numeroDeclaracion || 'Sin Número'}
              </Typography>
              <Typography variant="body2" color="#64748b" noWrap>
                {singleItem.proveedor || 'Sin proveedor'}
              </Typography>
            </Paper>

            {/* Enlace y botón copiar */}
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1.2,
                borderRadius: '10px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
              }}>
              <Typography
                variant="caption"
                sx={{
                  flex: 1,
                  fontFamily: 'monospace',
                  color: '#334155',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                {getDeclarationQrUrl(singleItem._id, customBaseUrl)}
              </Typography>
              <Button
                size="small"
                variant={copiedLink ? 'contained' : 'outlined'}
                color={copiedLink ? 'success' : 'primary'}
                startIcon={copiedLink ? <CheckCircleIcon /> : <ContentCopyIcon />}
                onClick={handleCopyLink}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  whiteSpace: 'nowrap',
                }}>
                {copiedLink ? 'Copiado' : 'Copiar'}
              </Button>
            </Box>

            {/* Acciones para registro individual */}
            <Box display="flex" gap={1.5} width="100%" justifyContent="center" sx={{ mt: 1 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDownloadSingle}
                disabled={loading}
                startIcon={<DownloadIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '10px',
                  flex: 1,
                  py: 1,
                }}>
                Descargar Imagen QR (PNG)
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                component="a"
                href={getDeclarationQrUrl(singleItem._id, customBaseUrl)}
                target="_blank"
                rel="noreferrer"
                startIcon={<OpenInNewIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '10px',
                  color: '#475569',
                  borderColor: '#cbd5e1',
                }}>
                Abrir Consulta
              </Button>
            </Box>
          </Box>
        )}

        {/* MODO MASIVO */}
        {!isSingle && (
          <Box display="flex" flexDirection="column" gap={2}>
            <Alert severity="info" sx={{ borderRadius: '12px', fontSize: '0.84rem' }}>
              Has seleccionado <strong>{targetDeclaraciones.length}</strong> declaraciones.
              Los códigos QR generados contienen el enlace de <strong>consulta pública</strong>{' '}
              para que cualquier operario o cliente pueda escanearlos en el producto sin iniciar sesión.
            </Alert>

            {/* Tarjeta Opción 1: PDF de Etiquetas */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 2.2 },
                borderRadius: '14px',
                border: '1px solid #bae6fd',
                backgroundColor: '#f0f9ff',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                justifyContent: 'space-between',
                gap: 2.5,
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#0284c7',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.12)',
                },
              }}>
              <Box display="flex" alignItems="center" gap={1.8} sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    backgroundColor: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                  <PictureAsPdfIcon sx={{ fontSize: 26 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight="700" color="#0369a1" fontSize="0.95rem">
                    Plancha de Etiquetas en PDF (Para Imprimir)
                  </Typography>
                  <Typography variant="caption" color="#475569" display="block" sx={{ mt: 0.25, lineHeight: 1.4 }}>
                    Organiza 8 etiquetas por hoja tamaño Carta con QR, No. de Declaración, Proveedor y Fecha.
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                onClick={handleExportPdf}
                disabled={loading}
                startIcon={<DownloadIcon />}
                sx={{
                  backgroundColor: '#0284c7',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  borderRadius: '10px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  minWidth: { xs: '100%', sm: '170px' },
                  px: 3,
                  py: 1.2,
                  boxShadow: '0 3px 10px rgba(2, 132, 199, 0.25)',
                  '&:hover': {
                    backgroundColor: '#0369a1',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                  },
                }}>
                Descargar PDF
              </Button>
            </Paper>

            {/* Tarjeta Opción 2: Archivo ZIP */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 2.2 },
                borderRadius: '14px',
                border: '1px solid #bbf7d0',
                backgroundColor: '#f0fdf4',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                justifyContent: 'space-between',
                gap: 2.5,
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#10b981',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.12)',
                },
              }}>
              <Box display="flex" alignItems="center" gap={1.8} sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                  <FolderZipIcon sx={{ fontSize: 26 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight="700" color="#15803d" fontSize="0.95rem">
                    Paquete ZIP (Imágenes PNG Individuales)
                  </Typography>
                  <Typography variant="caption" color="#475569" display="block" sx={{ mt: 0.25, lineHeight: 1.4 }}>
                    Descarga un archivo .zip con cada código QR nombrado por su No. de Declaración.
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                onClick={handleExportZip}
                disabled={loading}
                startIcon={<DownloadIcon />}
                sx={{
                  backgroundColor: '#16a34a',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  borderRadius: '10px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  minWidth: { xs: '100%', sm: '170px' },
                  px: 3,
                  py: 1.2,
                  boxShadow: '0 3px 10px rgba(22, 163, 74, 0.25)',
                  '&:hover': {
                    backgroundColor: '#15803d',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                  },
                }}>
                Descargar ZIP
              </Button>
            </Paper>

            {/* Barra de progreso si está procesando */}
            {loading && (
              <Box sx={{ mt: 1, p: 2, borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" fontWeight="600" color="#1e293b">
                    Procesando códigos QR...
                  </Typography>
                  <Typography variant="body2" fontWeight="600" color="#0284c7">
                    {progress.current} / {progress.total} ({percent}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={percent}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#f1f5f9',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      backgroundColor: '#0284c7',
                    },
                  }}
                />
              </Box>
            )}
          </Box>
        )}

        {/* Configuración de URL pública base */}
        <Divider sx={{ my: 2 }} />
        <Accordion
          elevation={0}
          sx={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px !important',
            '&:before': { display: 'none' },
          }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon fontSize="small" />}>
            <Box display="flex" alignItems="center" gap={1}>
              <TuneIcon sx={{ fontSize: 18, color: '#64748b' }} />
              <Typography variant="caption" fontWeight="600" color="#64748b">
                Configuración del dominio/URL para escaneo
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <Typography variant="caption" color="#64748b" paragraph sx={{ mb: 1.5 }}>
              Por defecto, el código QR utiliza el dominio actual (<code>{window.location.origin}</code>).
              Si estás en desarrollo local (localhost) y deseas probar escaneando desde un teléfono en la misma red Wi-Fi,
              puedes ingresar tu IP local (ej: <code>http://192.168.1.50:5173</code>).
            </Typography>
            <TextField
              size="small"
              fullWidth
              label="URL Base para los códigos QR"
              value={customBaseUrl}
              onChange={e => setCustomBaseUrl(e.target.value)}
              placeholder="http://tu-dominio.com o http://192.168.X.X:5173"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                },
              }}
            />
          </AccordionDetails>
        </Accordion>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5, backgroundColor: '#fafbfc', borderTop: '1px solid #f1f5f9' }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ textTransform: 'none', fontWeight: 600, color: '#64748b' }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
