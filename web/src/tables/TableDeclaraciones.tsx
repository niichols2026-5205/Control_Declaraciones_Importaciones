import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Tooltip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  IconButton,
  Chip,
  InputAdornment,
  Typography,
  Checkbox,
} from '@mui/material';

//  Icons
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EditIcon from '@mui/icons-material/Edit';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import GridOnIcon from '@mui/icons-material/GridOn';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import QrCode2Icon from '@mui/icons-material/QrCode2';

//  Modales
import EditarRegistroModal from '../modales/EditarRegistroModal';
import NuevoRegistroModal from '../modales/NuevoRegistroModal';
import ImportarExcelModal from '../modales/ImportarExcelModal';
import DescargarQRModal from '../modales/DescargarQRModal';

// Importacion de la interfaz
import { Declaracion } from '../types/types';

//  Librerias para exportar a excel
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';

const columns = [
  { id: 'createdAt', label: 'Fecha/Hora', minWidth: 185 },
  { id: 'importadoNacional', label: 'Tipo', minWidth: 110 },
  { id: 'numeroDeclaracion', label: 'No. Declaración', minWidth: 150 },
  { id: 'datosDeclaracion', label: 'Datos Declaración', minWidth: 200 },
  { id: 'pdfDeclaracion', label: 'PDF Decla.', minWidth: 95 },
  { id: 'archivoDeclaracion', label: 'Nombre Arch. Decla.', minWidth: 160 },
  { id: 'factura', label: 'Detalle Factura', minWidth: 200 },
  { id: 'nitProveedor', label: 'NIT Proveedor', minWidth: 130 },
  { id: 'proveedor', label: 'Proveedor', minWidth: 160 },
  { id: 'pais', label: 'País', minWidth: 130 },
  { id: 'observaciones', label: 'Observaciones', minWidth: 170 },
  { id: 'acciones', label: 'Acciones', minWidth: 175 },
];

const API_URL = `${import.meta.env.VITE_API_URL}/declaraciones`;

export default function TableDeclaraciones() {
  const navigate = useNavigate();
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [registroSeleccionado, setRegistroSeleccionado] =
    useState<Declaracion | null>(null);
  const [rows, setRows] = useState<Declaracion[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [editarModalOpen, setEditarModalOpen] = useState<boolean>(false);
  const [importModalOpen, setImportModalOpen] = useState<boolean>(false);

  // Estados para selección múltiple y descarga de Códigos QR
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);
  const [qrModalDeclaraciones, setQrModalDeclaraciones] = useState<Declaracion[]>([]);
  const [qrModalSingle, setQrModalSingle] = useState<Declaracion | null>(null);

  const formatDate = (isoDate: string) => {
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

  const fetchDeclaraciones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_URL, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setRows(data);
      }
    } catch (error) {
      console.error('Error al obtener las declaraciones:', error);
    }
  };

  useEffect(() => {
    fetchDeclaraciones();
  }, []);

  const handleFilterChange = (columnId: string, value: string) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [columnId]: value.toLowerCase(),
    }));
    setPage(0);
  };

  const handleClearSingleFilter = (columnId: string) => {
    setFilters(prev => {
      const updated = { ...prev };
      delete updated[columnId];
      return updated;
    });
    setPage(0);
  };

  const handleClearAllFilters = () => {
    setFilters({});
    setPage(0);
  };

  const hasActiveFilters = Object.values(filters).some(val => Boolean(val && val.trim() !== ''));

  const handleDelete = async (registro: Declaracion) => {
    if (
      !window.confirm(
        `¿Estás seguro de que deseas eliminar la declaración ${registro.numeroDeclaracion}?`,
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/${registro._id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la declaración');
      }

      setRows(prevRows => prevRows.filter(row => row._id !== registro._id));
    } catch (error) {
      console.error('Error al eliminar el registro:', error);
    }
  };

  const handleSaveRegistroEditado = async () => {
    await fetchDeclaraciones();
  };

  const handleSaveRegistroNuevo = async () => {
    await fetchDeclaraciones();
  };

  const getFileIcon = (fileData?: string, _fileName?: string) => {
    if (!fileData) {
      return <Typography variant="caption" color="textSecondary">-</Typography>;
    }

    const handleOpenFile = () => {
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
      } else {
        console.error('El archivo no es válido o no está en Base64.');
      }
    };

    let icon = <InsertDriveFileIcon sx={{ fontSize: 18 }} />;
    let bgColor = '#f1f5f9';
    let iconColor = '#64748b';

    if (fileData.startsWith('data:application/pdf')) {
      icon = <PictureAsPdfIcon sx={{ fontSize: 18 }} />;
      bgColor = '#fef2f2';
      iconColor = '#ef4444';
    } else if (fileData.startsWith('data:image')) {
      icon = <ImageIcon sx={{ fontSize: 18 }} />;
      bgColor = '#f0fdf4';
      iconColor = '#10b981';
    } else if (fileData.startsWith('data:text/csv')) {
      icon = <GridOnIcon sx={{ fontSize: 18 }} />;
      bgColor = '#ecfdf5';
      iconColor = '#059669';
    } else if (fileData.startsWith('data:application/msword')) {
      icon = <DescriptionIcon sx={{ fontSize: 18 }} />;
      bgColor = '#eff6ff';
      iconColor = '#2563eb';
    }

    return (
      <Tooltip title="Abrir archivo adjunto">
        <IconButton
          onClick={handleOpenFile}
          aria-label="Abrir archivo"
          size="small"
          sx={{
            backgroundColor: bgColor,
            color: iconColor,
            borderRadius: '8px',
            padding: '6px',
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'scale(1.1)',
              backgroundColor: bgColor,
              filter: 'brightness(0.95)',
            },
          }}>
          {icon}
        </IconButton>
      </Tooltip>
    );
  };

  const exportToExcel = (data: Declaracion[], fileName: string) => {
    if (!data || data.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const columnMap = columns.reduce((acc, col) => {
      acc[col.id] = col.label;
      return acc;
    }, {} as Record<string, string>);

    const filteredData = data.map(
      ({ _id, pdfDeclaracion, pdfFactura, updatedAt, acciones, ...rest }) => {
        const newRow: Record<string, any> = {};
        Object.keys(rest).forEach(key => {
          newRow[columnMap[key] || key] = rest[key as keyof typeof rest];
        });
        return newRow;
      },
    );

    const worksheet = XLSX.utils.json_to_sheet(filteredData, {
      header: Object.values(columnMap),
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const excelBlob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });

    saveAs(excelBlob, `${fileName}.xlsx`);
  };

  const filteredRows = rows.filter(row =>
    Object.entries(filters).every(([columnId, filterValue]) => {
      if (!filterValue) return true;

      if (columnId === 'createdAt') {
        if (!row.createdAt) return false;
        // filterValue proviene del input type="date" en formato "YYYY-MM-DD"
        const isoPrefix = row.createdAt.slice(0, 10);
        const d = new Date(row.createdAt);
        const localYear = d.getFullYear();
        const localMonth = String(d.getMonth() + 1).padStart(2, '0');
        const localDay = String(d.getDate()).padStart(2, '0');
        const localDateString = `${localYear}-${localMonth}-${localDay}`;
        const formatted = formatDate(row.createdAt).toLowerCase();

        return (
          isoPrefix === filterValue ||
          localDateString === filterValue ||
          formatted.includes(filterValue)
        );
      }

      return (row as any)[columnId]?.toString().toLowerCase().includes(filterValue);
    }),
  );

  const handleOpenEditarModal = (registro: Declaracion) => {
    setRegistroSeleccionado(registro);
    setEditarModalOpen(true);
  };

  const handleCloseEditarModal = () => {
    setEditarModalOpen(false);
    setRegistroSeleccionado(null);
  };

  // Manejadores de selección múltiple
  const handleSelectAllToggle = () => {
    if (selectedIds.length === filteredRows.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRows.map(r => r._id));
    }
  };

  const handleSelectRowToggle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );
  };

  const handleOpenBulkQRSelected = () => {
    const selectedRows = rows.filter(r => selectedIds.includes(r._id));
    setQrModalDeclaraciones(selectedRows);
    setQrModalSingle(null);
    setQrModalOpen(true);
  };

  const handleOpenBulkQRAllFiltered = () => {
    setQrModalDeclaraciones(filteredRows);
    setQrModalSingle(null);
    setQrModalOpen(true);
  };

  const handleOpenSingleQR = (registro: Declaracion) => {
    setQrModalDeclaraciones([registro]);
    setQrModalSingle(registro);
    setQrModalOpen(true);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        backgroundColor: '#ffffff',
      }}>
      {/* Barra superior moderna de acciones */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          padding: '16px 20px',
          borderBottom: '1px solid #f1f5f9',
          backgroundColor: '#fafbfc',
        }}>
        {/* Título y contadores */}
        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
          <ReceiptLongIcon sx={{ color: '#0284c7', fontSize: 28 }} />
          <Typography variant="h6" fontWeight="700" color="#1e293b" fontSize="1.1rem">
            Declaraciones de Importación y Facturas
          </Typography>
          <Chip
            label={`${filteredRows.length} ${
              filteredRows.length === 1 ? 'registro' : 'registros'
            }`}
            size="small"
            sx={{
              backgroundColor: '#e0f2fe',
              color: '#0369a1',
              fontWeight: 600,
              fontSize: '0.78rem',
            }}
          />
          {selectedIds.length > 0 && (
            <Chip
              label={`${selectedIds.length} seleccionada${
                selectedIds.length === 1 ? '' : 's'
              }`}
              color="primary"
              size="small"
              onDelete={() => setSelectedIds([])}
              sx={{
                fontWeight: 700,
                fontSize: '0.78rem',
                backgroundColor: '#0284c7',
                color: '#ffffff',
              }}
            />
          )}
          {hasActiveFilters && (
            <Button
              size="small"
              variant="outlined"
              color="warning"
              startIcon={<FilterAltOffIcon fontSize="small" />}
              onClick={handleClearAllFilters}
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                fontSize: '0.8rem',
                padding: '3px 10px',
              }}>
              Limpiar filtros
            </Button>
          )}
        </Box>

        {/* Botones de acción */}
        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
          {/* Botón de descarga masiva de QRs */}
          {selectedIds.length > 0 ? (
            <Tooltip title="Descargar etiquetas PDF o archivo ZIP de las declaraciones seleccionadas">
              <Button
                variant="contained"
                onClick={handleOpenBulkQRSelected}
                startIcon={<QrCode2Icon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  boxShadow: '0 3px 10px rgba(2, 132, 199, 0.3)',
                  padding: '7px 18px',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0369a1 0%, #075985 100%)',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                  },
                }}>
                Descargar QRs ({selectedIds.length})
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="Descargar etiquetas PDF o archivo ZIP con códigos QR de las declaraciones filtradas">
              <Button
                variant="outlined"
                color="primary"
                onClick={handleOpenBulkQRAllFiltered}
                startIcon={<QrCode2Icon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '10px',
                  borderColor: '#0284c7',
                  color: '#0284c7',
                  padding: '7px 16px',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: '#f0f9ff',
                    borderColor: '#0369a1',
                  },
                }}>
                Descargar QRs
              </Button>
            </Tooltip>
          )}

          <Tooltip title="Cargar declaraciones masivamente desde un archivo Excel">
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setImportModalOpen(true)}
              startIcon={<UploadFileIcon />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '10px',
                borderColor: '#0284c7',
                color: '#0284c7',
                padding: '7px 16px',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: '#f0f9ff',
                  borderColor: '#0369a1',
                },
              }}>
              Importar Excel
            </Button>
          </Tooltip>

          <Tooltip title="Descargar reporte en formato Excel">
            <Button
              variant="outlined"
              color="success"
              onClick={() => exportToExcel(filteredRows, 'Declaraciones_Citymerk')}
              startIcon={<DownloadIcon />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '10px',
                borderColor: '#10b981',
                color: '#059669',
                padding: '7px 16px',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: '#ecfdf5',
                  borderColor: '#059669',
                },
              }}>
              Exportar a Excel
            </Button>
          </Tooltip>

          <Tooltip title="Crear nueva declaración">
            <Button
              variant="contained"
              onClick={() => setModalIsOpen(true)}
              startIcon={<AddIcon />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '10px',
                padding: '7px 18px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                boxShadow: '0 3px 10px rgba(2, 132, 199, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0369a1 0%, #075985 100%)',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                },
              }}>
              Nuevo Registro
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Contenedor de la tabla */}
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <TableContainer sx={{ maxHeight: 620 }}>
          <Table stickyHeader aria-label="tabla declaraciones">
            <TableHead>
              <TableRow>
                {/* Columna de Checkbox para selección múltiple */}
                <TableCell
                  padding="checkbox"
                  sx={{
                    width: 50,
                    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                    borderBottom: '2px solid #334155',
                    textAlign: 'center',
                    padding: '0 10px',
                  }}>
                  <Tooltip
                    title={
                      selectedIds.length === filteredRows.length && filteredRows.length > 0
                        ? 'Deseleccionar todos'
                        : 'Seleccionar todos los registros filtrados'
                    }>
                    <Checkbox
                      size="small"
                      indeterminate={
                        selectedIds.length > 0 && selectedIds.length < filteredRows.length
                      }
                      checked={
                        filteredRows.length > 0 && selectedIds.length === filteredRows.length
                      }
                      onChange={handleSelectAllToggle}
                      sx={{
                        color: 'rgba(255, 255, 255, 0.65)',
                        '&.Mui-checked': { color: '#38bdf8' },
                        '&.MuiCheckbox-indeterminate': { color: '#38bdf8' },
                      }}
                    />
                  </Tooltip>
                </TableCell>

                {columns.map(column => {
                  const isAcciones = column.id === 'acciones';
                  const currentFilterVal = filters[column.id] || '';

                  return (
                    <TableCell
                      key={column.id}
                      style={{
                        minWidth: column.minWidth,
                        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                        color: '#f8fafc',
                        padding: '12px 14px',
                        borderBottom: '2px solid #334155',
                        ...(isAcciones && {
                          position: 'sticky',
                          right: 0,
                          zIndex: 3,
                          textAlign: 'center',
                          boxShadow: '-4px 0 8px rgba(0,0,0,0.15)',
                        }),
                      }}>
                      {/* Label de la columna */}
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          color: '#e2e8f0',
                          fontSize: '0.74rem',
                          marginBottom: isAcciones ? '0px' : '8px',
                        }}>
                        {column.label}
                      </Typography>

                      {/* Input de filtro visualmente estilizado */}
                      {!isAcciones && (
                        column.id === 'createdAt' ? (
                          <TextField
                            type="date"
                            variant="outlined"
                            size="small"
                            value={currentFilterVal}
                            onChange={e => handleFilterChange(column.id, e.target.value)}
                            fullWidth
                            InputProps={{
                              endAdornment: currentFilterVal ? (
                                <InputAdornment position="end">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleClearSingleFilter(column.id)}
                                    sx={{ padding: '2px', color: 'rgba(255, 255, 255, 0.8)' }}>
                                    <ClearIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </InputAdornment>
                              ) : null,
                              sx: {
                                height: '30px',
                                fontSize: '0.75rem',
                                color: '#ffffff',
                                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                                borderRadius: '7px',
                                '& fieldset': { border: 'none' },
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                                },
                                '&.Mui-focused': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.24)',
                                  boxShadow: '0 0 0 1.5px rgba(56, 189, 248, 0.6)',
                                },
                                input: {
                                  padding: '4px 6px',
                                  color: '#ffffff',
                                  cursor: 'pointer',
                                  '&::-webkit-calendar-picker-indicator': {
                                    filter: 'invert(1)',
                                    cursor: 'pointer',
                                    opacity: 0.85,
                                  },
                                },
                              },
                            }}
                          />
                        ) : (
                          <TextField
                            variant="outlined"
                            size="small"
                            placeholder="Filtrar..."
                            value={currentFilterVal}
                            onChange={e => handleFilterChange(column.id, e.target.value)}
                            fullWidth
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 16 }} />
                                </InputAdornment>
                              ),
                              endAdornment: currentFilterVal ? (
                                <InputAdornment position="end">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleClearSingleFilter(column.id)}
                                    sx={{ padding: '2px', color: 'rgba(255, 255, 255, 0.7)' }}>
                                    <ClearIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </InputAdornment>
                              ) : null,
                              sx: {
                                height: '30px',
                                fontSize: '0.75rem',
                                color: '#ffffff',
                                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                                borderRadius: '7px',
                                '& fieldset': { border: 'none' },
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                                },
                                '&.Mui-focused': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.24)',
                                  boxShadow: '0 0 0 1.5px rgba(56, 189, 248, 0.6)',
                                },
                                input: {
                                  padding: '4px 0px',
                                  color: '#ffffff',
                                  '&::placeholder': {
                                    color: 'rgba(255, 255, 255, 0.55)',
                                    opacity: 1,
                                  },
                                },
                              },
                            }}
                          />
                        )
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 8 }}>
                    <Box display="flex" flexDirection="column" alignItems="center" gap={1.5}>
                      <FilterAltOffIcon sx={{ fontSize: 48, color: '#94a3b8' }} />
                      <Typography variant="h6" color="#475569" fontWeight="600">
                        No se encontraron registros
                      </Typography>
                      <Typography variant="body2" color="#94a3b8" maxWidth={400}>
                        {hasActiveFilters
                          ? 'No hay declaraciones que coincidan con los filtros aplicados.'
                          : 'Aún no hay declaraciones registradas en el sistema.'}
                      </Typography>
                      {hasActiveFilters && (
                        <Button
                          variant="text"
                          color="primary"
                          onClick={handleClearAllFilters}
                          sx={{ textTransform: 'none', fontWeight: 600, mt: 1 }}>
                          Restablecer todos los filtros
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, rowIndex) => {
                    const isEven = rowIndex % 2 === 0;
                    const isSelected = selectedIds.includes(row._id);

                    return (
                      <TableRow
                        hover
                        key={row._id || rowIndex}
                        sx={{
                          backgroundColor: isSelected
                            ? '#f0f9ff'
                            : isEven
                            ? '#ffffff'
                            : '#f8fafc',
                          transition: 'background-color 0.15s ease',
                          '&:hover': {
                            backgroundColor: isSelected
                              ? '#e0f2fe !important'
                              : '#f1f5f9 !important',
                          },
                        }}>
                        {/* Checkbox de fila */}
                        <TableCell
                          padding="checkbox"
                          sx={{
                            borderBottom: '1px solid #f1f5f9',
                            textAlign: 'center',
                            padding: '0 10px',
                            backgroundColor: isSelected
                              ? '#f0f9ff'
                              : isEven
                              ? '#ffffff'
                              : '#f8fafc',
                          }}>
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleSelectRowToggle(row._id)}
                            sx={{
                              color: '#94a3b8',
                              '&.Mui-checked': { color: '#0284c7' },
                            }}
                          />
                        </TableCell>

                        {columns.map(column => {
                          if (column.id === 'acciones') {
                            return (
                              <TableCell
                                key={column.id}
                                align="center"
                                sx={{
                                  position: 'sticky',
                                  right: 0,
                                  zIndex: 1,
                                  backgroundColor: isSelected
                                    ? '#f0f9ff'
                                    : isEven
                                    ? '#ffffff'
                                    : '#f8fafc',
                                  borderLeft: '1px solid #e2e8f0',
                                  boxShadow: '-4px 0 8px rgba(0,0,0,0.03)',
                                  padding: '8px 10px',
                                }}>
                                <Box display="flex" justifyContent="center" gap={0.5}>
                                  <Tooltip title="Consultar detalle completo">
                                    <IconButton
                                      size="small"
                                      onClick={() => navigate(`/home/detalle/${row._id}`)}
                                      sx={{
                                        color: '#0284c7',
                                        backgroundColor: '#e0f2fe',
                                        '&:hover': { backgroundColor: '#bae6fd' },
                                      }}>
                                      <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Ver y descargar código QR">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleOpenSingleQR(row)}
                                      sx={{
                                        color: '#0369a1',
                                        backgroundColor: '#e0f2fe',
                                        '&:hover': { backgroundColor: '#bae6fd' },
                                      }}>
                                      <QrCode2Icon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Editar declaración">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleOpenEditarModal(row)}
                                      sx={{
                                        color: '#ca8a04',
                                        backgroundColor: '#fefce8',
                                        '&:hover': { backgroundColor: '#fef9c3' },
                                      }}>
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Eliminar registro">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDelete(row)}
                                      sx={{
                                        color: '#dc2626',
                                        backgroundColor: '#fef2f2',
                                        '&:hover': { backgroundColor: '#fee2e2' },
                                      }}>
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            );
                          }

                          const value = (row as any)[column.id];

                          if (column.id === 'importadoNacional') {
                            const isImport = value === 'I' || value?.toString().toLowerCase().includes('imp');
                            return (
                              <TableCell key={column.id}>
                                <Chip
                                  label={isImport ? 'Importación' : 'Nacional'}
                                  size="small"
                                  sx={{
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    borderRadius: '6px',
                                    height: '22px',
                                    backgroundColor: isImport ? '#e0f2fe' : '#dcfce7',
                                    color: isImport ? '#0369a1' : '#15803d',
                                    border: isImport ? '1px solid #bae6fd' : '1px solid #bbf7d0',
                                  }}
                                />
                              </TableCell>
                            );
                          }

                          if (column.id === 'pdfDeclaracion') {
                            return (
                              <TableCell key={column.id} align="center">
                                {getFileIcon(row.pdfDeclaracion, row.archivoDeclaracion)}
                              </TableCell>
                            );
                          }

                          return (
                            <TableCell
                              key={column.id}
                              sx={{
                                fontSize: '0.84rem',
                                color: '#334155',
                                padding: '12px 14px',
                                borderBottom: '1px solid #f1f5f9',
                              }}>
                              {column.id === 'createdAt' ? (
                                <Box>
                                  <Typography variant="body2" sx={{ fontSize: '0.84rem', color: '#334155' }}>
                                    {formatDate(value)}
                                  </Typography>
                                  {row.createdByName && (
                                    <Typography
                                      variant="caption"
                                      sx={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>
                                      Por: {row.createdByName}
                                    </Typography>
                                  )}
                                  {row.updatedAt && row.updatedAt !== row.createdAt && (
                                    <Tooltip
                                      title={`Última modificación: ${formatDate(row.updatedAt)}${
                                        row.updatedByName ? ` por ${row.updatedByName}` : ''
                                      }`}>
                                      <Typography
                                        component="span"
                                        variant="caption"
                                        sx={{
                                          color: '#0284c7',
                                          fontSize: '0.72rem',
                                          fontWeight: 600,
                                          cursor: 'help',
                                          display: 'inline-block',
                                        }}>
                                        ✎ Modificado {row.updatedByName ? `(${row.updatedByName})` : ''}
                                      </Typography>
                                    </Tooltip>
                                  )}
                                </Box>
                              ) : column.id === 'numeroDeclaracion'
                                ? (
                                  <Typography
                                    component="span"
                                    sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.84rem' }}>
                                    {value || '-'}
                                  </Typography>
                                )
                                : column.id === 'factura' && typeof value === 'string'
                                ? `${value.substring(0, 40)}${value.length > 40 ? '...' : ''}`
                                : column.id === 'datosDeclaracion' && typeof value === 'string'
                                ? `${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`
                                : value || '-'}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Paginación */}
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={event => {
          setRowsPerPage(+event.target.value);
          setPage(0);
        }}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
        sx={{
          borderTop: '1px solid #f1f5f9',
          color: '#64748b',
          fontSize: '0.84rem',
        }}
      />

      {/* Modales */}
      <EditarRegistroModal
        open={editarModalOpen}
        onClose={handleCloseEditarModal}
        registro={registroSeleccionado}
        onSave={handleSaveRegistroEditado}
      />
      <NuevoRegistroModal
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        onSave={handleSaveRegistroNuevo}
      />
      <ImportarExcelModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSave={fetchDeclaraciones}
      />
      <DescargarQRModal
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        declaraciones={qrModalDeclaraciones}
        registroUnico={qrModalSingle}
      />
    </Paper>
  );
}

