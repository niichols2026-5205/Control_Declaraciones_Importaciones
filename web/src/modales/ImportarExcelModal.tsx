import React, { useState, useRef } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface ImportarExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface ParsedRecord {
  importadoNacional: string;
  numeroDeclaracion: string;
  datosDeclaracion: string;
  factura: string;
  nitProveedor: string;
  proveedor: string;
  pais?: string;
  observaciones?: string;
  isValid: boolean;
  errors: string[];
}

const API_URL = `${import.meta.env.VITE_API_URL}/declaraciones`;

const ImportarExcelModal: React.FC<ImportarExcelModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Descargar plantilla Excel oficial
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Tipo (I/N)': 'I',
        'No. Declaracion': 'DEC-2025-001',
        'Datos Declaracion': 'Repuestos y accesorios de maquinaria',
        'Detalle Factura': 'COD: 10452 VALVULA DE PRESION 1/2',
        'NIT Proveedor': '900543210-1',
        'Proveedor': 'TECH GLOBAL IMPORTS SAS',
        'Pais': 'Alemania',
        'Observaciones': 'Registro cargado por lote'
      },
      {
        'Tipo (I/N)': 'N',
        'No. Declaracion': 'DEC-2025-002',
        'Datos Declaracion': 'Dotación y uniformes industriales',
        'Detalle Factura': '15 BOTAS DE SEGURIDAD TALLA 40',
        'NIT Proveedor': '890123456-7',
        'Proveedor': 'DISTRIBUCIONES NACIONALES SAS',
        'Pais': 'Colombia',
        'Observaciones': 'Entrega inmediata en bodega'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Ajustar anchos de columna para mejor visualización
    worksheet['!cols'] = [
      { wch: 14 }, // Tipo
      { wch: 20 }, // No. Declaracion
      { wch: 35 }, // Datos Declaracion
      { wch: 40 }, // Detalle Factura
      { wch: 18 }, // NIT Proveedor
      { wch: 30 }, // Proveedor
      { wch: 16 }, // Pais
      { wch: 35 }, // Observaciones
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla_Declaraciones');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(blob, 'Plantilla_Carga_Declaraciones.xlsx');
  };

  // Normalizar llaves para leer sin importar tildes, mayúsculas o variaciones
  const normalizeKey = (key: string): string => {
    return key
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  };

  // Procesar archivo Excel
  const processExcelFile = (uploadedFile: File) => {
    setFile(uploadedFile);
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
          defval: '',
        });

        if (!rawJson || rawJson.length === 0) {
          alert('El archivo Excel no contiene filas con datos.');
          setParsedData([]);
          return;
        }

        const formattedRows: ParsedRecord[] = rawJson.map(row => {
          // Mapeo dinámico de campos
          const normalizedRow: Record<string, any> = {};
          Object.keys(row).forEach(originalKey => {
            normalizedRow[normalizeKey(originalKey)] = row[originalKey];
          });

          // Obtener valores con múltiples nombres posibles
          const rawTipo = String(
            normalizedRow['tipo'] ||
            normalizedRow['tipoin'] ||
            normalizedRow['importadonacional'] ||
            'I',
          ).trim();

          const importadoNacional =
            rawTipo.toUpperCase().startsWith('N') || rawTipo.toUpperCase() === 'NACIONAL'
              ? 'N'
              : 'I';

          const numeroDeclaracion = String(
            normalizedRow['nodeclaracion'] ||
            normalizedRow['numerodeclaracion'] ||
            normalizedRow['declaracion'] ||
            '',
          ).trim();

          const datosDeclaracion = String(
            normalizedRow['datosdeclaracion'] ||
            normalizedRow['datos'] ||
            normalizedRow['descripciondeclaracion'] ||
            '',
          ).trim();

          const factura = String(
            normalizedRow['detallefactura'] ||
            normalizedRow['factura'] ||
            normalizedRow['detalle'] ||
            normalizedRow['articulos'] ||
            '',
          ).trim();

          const nitProveedor = String(
            normalizedRow['nitproveedor'] ||
            normalizedRow['nit'] ||
            '',
          ).trim();

          const proveedor = String(
            normalizedRow['proveedor'] ||
            normalizedRow['nombreproveedor'] ||
            '',
          ).trim();

          const pais = String(
            normalizedRow['pais'] ||
            normalizedRow['origen'] ||
            '',
          ).trim();

          const observaciones = String(
            normalizedRow['observaciones'] ||
            normalizedRow['observacion'] ||
            '',
          ).trim();

          // Validar campos indispensables
          const errors: string[] = [];
          if (!numeroDeclaracion) errors.push('Falta No. Declaración');
          if (!proveedor) errors.push('Falta Proveedor');
          if (!factura) errors.push('Falta Detalle Factura');

          return {
            importadoNacional,
            numeroDeclaracion,
            datosDeclaracion: datosDeclaracion || 'Sin datos de declaración',
            factura,
            nitProveedor: nitProveedor || 'Sin NIT',
            proveedor,
            pais: pais || (importadoNacional === 'N' ? 'Colombia' : 'Exterior'),
            observaciones,
            isValid: errors.length === 0,
            errors,
          };
        });

        setParsedData(formattedRows);
      } catch (error) {
        console.error('Error al procesar el archivo Excel:', error);
        alert('Hubo un error al leer el archivo Excel. Verifica el formato e intenta nuevamente.');
      }
    };

    reader.readAsArrayBuffer(uploadedFile);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processExcelFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processExcelFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  // Enviar los registros válidos al backend
  const handleImportSubmit = async () => {
    const validRecords = parsedData.filter(item => item.isValid);

    if (validRecords.length === 0) {
      alert('No hay registros válidos para importar.');
      return;
    }

    try {
      setLoading(true);

      const recordsToSend = validRecords.map(
        ({ isValid, errors, ...recordData }) => ({
          ...recordData,
          pdfDeclaracion: '',
          archivoDeclaracion: '',
          numeroFactura: '',
          pdfFactura: '',
          archivoFactura: '',
        }),
      );

      const response = await fetch(`${API_URL}/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recordsToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar los registros masivos');
      }

      const resJson = await response.json();
      alert(`¡Carga exitosa! Se importaron ${resJson.count || validRecords.length} declaraciones.`);

      // Limpiar y cerrar
      setFile(null);
      setParsedData([]);
      onSave(); // recarga la tabla principal
      onClose();
    } catch (error: any) {
      console.error('Error durante la importación:', error);
      alert(`Ocurrió un error al importar: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validCount = parsedData.filter(d => d.isValid).length;
  const invalidCount = parsedData.length - validCount;

  return (
    <Modal open={isOpen} onClose={loading ? undefined : onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 880,
          maxWidth: '94vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: '16px',
          overflow: 'hidden',
          outline: 'none',
        }}>
        {/* Cabecera del Modal */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Box>
            <Typography variant="h6" fontWeight="700">
              Importar Declaraciones desde Excel
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Carga masiva de datos (sin archivos adjuntos)
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            disabled={loading}
            sx={{ color: '#ffffff' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Cuerpo del Modal */}
        <Box sx={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {/* Paso 1: Descargar Plantilla */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '12px',
              padding: '14px 18px',
              mb: 2.5,
              flexWrap: 'wrap',
              gap: 1.5,
            }}>
            <Box>
              <Typography variant="subtitle2" fontWeight="700" color="#0369a1">
                ¿No tienes la plantilla oficial?
              </Typography>
              <Typography variant="body2" color="#0c4a6e" fontSize="0.82rem">
                Descarga el formato modelo con los encabezados y datos de ejemplo para evitar errores.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#0284c7',
                color: '#0284c7',
                '&:hover': {
                  backgroundColor: '#e0f2fe',
                  borderColor: '#0369a1',
                },
              }}>
              Descargar Plantilla Excel
            </Button>
          </Box>

          {/* Paso 2: Zona de Carga de Archivo */}
          {!file ? (
            <Box
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              sx={{
                border: '2px dashed',
                borderColor: dragOver ? '#0284c7' : '#cbd5e1',
                backgroundColor: dragOver ? '#f0f9ff' : '#fafbfc',
                borderRadius: '14px',
                padding: '36px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#0284c7',
                  backgroundColor: '#f8fafc',
                },
              }}
              onClick={() => fileInputRef.current?.click()}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
              />
              <CloudUploadIcon sx={{ fontSize: 48, color: '#0284c7', mb: 1 }} />
              <Typography variant="body1" fontWeight="600" color="#1e293b">
                Arrastra tu archivo Excel aquí o haz clic para seleccionarlo
              </Typography>
              <Typography variant="caption" color="textSecondary" display="block" mt={0.5}>
                Formatos compatibles: .xlsx o .xls
              </Typography>
            </Box>
          ) : (
            <Box>
              {/* Información del archivo cargado */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '10px 16px',
                  mb: 2,
                }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircleOutlineIcon sx={{ color: '#10b981' }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight="600" color="#1e293b">
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {parsedData.length} filas leídas •{' '}
                      <span style={{ color: '#10b981', fontWeight: 600 }}>
                        {validCount} válidas
                      </span>
                      {invalidCount > 0 && (
                        <span style={{ color: '#ef4444', fontWeight: 600 }}>
                          {' '}• {invalidCount} con errores
                        </span>
                      )}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  size="small"
                  color="inherit"
                  onClick={handleReset}
                  disabled={loading}
                  sx={{ textTransform: 'none', fontSize: '0.8rem' }}>
                  Cambiar archivo
                </Button>
              </Box>

              {invalidCount > 0 && (
                <Alert severity="warning" sx={{ mb: 2, fontSize: '0.82rem' }}>
                  Se omitirán {invalidCount} filas que no tienen los campos requeridos (No. Declaración o Proveedor).
                </Alert>
              )}

              {/* Vista Previa de Filas */}
              <Typography variant="subtitle2" fontWeight="700" color="#334155" mb={1}>
                Vista Previa de Registros a Importar ({parsedData.length})
              </Typography>
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  maxHeight: 250,
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  overflowY: 'auto',
                }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>Estado</TableCell>
                      <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>Tipo</TableCell>
                      <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>No. Declaración</TableCell>
                      <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>Proveedor</TableCell>
                      <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>País</TableCell>
                      <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>Detalle Factura</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parsedData.map((row, idx) => (
                      <TableRow
                        key={idx}
                        sx={{
                          backgroundColor: row.isValid ? '#ffffff' : '#fef2f2',
                        }}>
                        <TableCell>
                          {row.isValid ? (
                            <Chip label="Listo" size="small" color="success" sx={{ height: 20, fontSize: '0.7rem' }} />
                          ) : (
                            <Chip
                              icon={<ErrorOutlineIcon sx={{ fontSize: '14px !important' }} />}
                              label={row.errors[0]}
                              size="small"
                              color="error"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={row.importadoNacional === 'I' ? 'Imp' : 'Nac'}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{row.numeroDeclaracion || '-'}</TableCell>
                        <TableCell>{row.proveedor || '-'}</TableCell>
                        <TableCell>{row.pais || '-'}</TableCell>
                        <TableCell sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {row.factura || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>

        <Divider />

        {/* Acciones del Modal */}
        <Box
          sx={{
            padding: '14px 24px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1.5,
            backgroundColor: '#fafbfc',
          }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            sx={{ textTransform: 'none', borderRadius: '8px' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleImportSubmit}
            disabled={loading || validCount === 0}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0369a1 0%, #075985 100%)',
              },
            }}>
            {loading ? 'Importando...' : `Importar ${validCount} Declaraciones`}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ImportarExcelModal;
