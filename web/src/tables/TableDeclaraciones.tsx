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

//  Modales
import EditarRegistroModal from '../modales/EditarRegistroModal';
import NuevoRegistroModal from '../modales/NuevoRegistroModal';

// Importacion de la interfaz
import { Declaracion } from '../types/types';

//  Librerias para exportar a excel
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';

const columns = [
  { id: 'createdAt', label: 'Fecha/Hora', minWidth: 175 },
  { id: 'importadoNacional', label: 'Tipo', minWidth: 50 },
  { id: 'numeroDeclaracion', label: 'No.Declaracion', minWidth: 50 },
  { id: 'datosDeclaracion', label: 'Datos Declaracion', minWidth: 200 },
  { id: 'pdfDeclaracion', label: 'PDF Decla.', minWidth: 80 },
  { id: 'archivoDeclaracion', label: 'Nombre Arch.Decla.', minWidth: 150 },
  { id: 'factura', label: 'Detalle Factura', minWidth: 200 },
  { id: 'nitProveedor', label: 'Nit Proveedor', minWidth: 88 },
  { id: 'proveedor', label: 'Proveedor', minWidth: 150 },
  { id: 'numeroFactura', label: 'No.Factura', minWidth: 90 },
  { id: 'pdfFactura', label: 'PDF.Fact.', minWidth: 50 },
  { id: 'archivoFactura', label: 'Nombre Arch.Fact.', minWidth: 120 },
  { id: 'observaciones', label: 'Observaciones', minWidth: 150 },
  { id: 'acciones', label: 'Acciones', minWidth: 120 },
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
  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC', // fuerza UTC
    });
  };

  useEffect(() => {
    fetch(API_URL)
      .then(response => response.json())
      .then(data => setRows(data))
      .catch(error => console.error('Error al obtener los datos:', error));
  }, []);

  const handleFilterChange = (columnId: string, value: string) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [columnId]: value.toLowerCase(),
    }));
  };

  const handleDelete = async (registro: Declaracion) => {
    if (
      !window.confirm(
        `¿Estás seguro de que deseas eliminar la declaración ${registro.numeroDeclaracion}?`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${registro._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la declaración');
      }

      // Filtrar el estado para eliminar el registro
      setRows(prevRows => prevRows.filter(row => row._id !== registro._id));
    } catch (error) {
      console.error('Error al eliminar el registro:', error);
    }
  };

  const fetchDeclaraciones = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/declaraciones`,
      );
      const data = await response.json();
      setRows(data);
    } catch (error) {
      console.error('Error al obtener las declaraciones:', error);
    }
  };

  useEffect(() => {
    fetchDeclaraciones();
  }, []);

  // este se llama cuando se guarda en el modal
  const handleSaveRegistroEditado = async () => {
    await fetchDeclaraciones(); // recarga la tabla
  };

  // este se llama cuando se guarda en el modal
  const handleSaveRegistroNuevo = async () => {
    await fetchDeclaraciones(); // vuelve a cargar la tabla
  };

  const getFileIcon = (fileData: string, _fileName: string) => {
    const handleOpenFile = () => {
      if (fileData.startsWith('data:')) {
        // Convertir Base64 a Blob
        const byteCharacters = atob(fileData.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length)
          .fill(0)
          .map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: fileData.split(';')[0].split(':')[1],
        });

        // Crear una URL temporal y abrir el archivo
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
      } else {
        console.error('El archivo no es válido o no está en Base64.');
      }
    };

    let icon = <InsertDriveFileIcon color="disabled" />;
    if (fileData.startsWith('data:application/pdf'))
      icon = <PictureAsPdfIcon color="error" />;
    else if (fileData.startsWith('data:image'))
      icon = <ImageIcon color="primary" />;
    else if (fileData.startsWith('data:text/csv'))
      icon = <GridOnIcon color="success" />;
    else if (fileData.startsWith('data:application/msword'))
      icon = <DescriptionIcon color="primary" />;

    return (
      <IconButton onClick={handleOpenFile} aria-label="Abrir archivo">
        {icon}
      </IconButton>
    );
  };

  const exportToExcel = (data: Declaracion[], fileName: string) => {
    if (!data || data.length === 0) {
      console.error('No hay datos para exportar');
      return;
    }
    // Mapeo de ID de columna a su label
    const columnMap = columns.reduce((acc, col) => {
      acc[col.id] = col.label;
      return acc;
    }, {} as Record<string, string>);

    // Filtrar los datos para excluir la columna "pdfDeclaracion" y convertir IDs en labels
    const filteredData = data.map(
      ({ _id, pdfDeclaracion, pdfFactura, updatedAt, acciones, ...rest }) => {
        const newRow: Record<string, any> = {};
        Object.keys(rest).forEach(key => {
          newRow[columnMap[key] || key] = rest[key as keyof typeof rest]; // Usa el label si existe, si no deja el key
        });
        return newRow;
      },
    );

    // Crear la hoja con encabezados personalizados
    const worksheet = XLSX.utils.json_to_sheet(filteredData, {
      header: Object.values(columnMap), // Usa los labels como encabezados
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

    // Crear el archivo y descargarlo
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
    Object.entries(filters).every(([columnId, filterValue]) =>
      filterValue
        ? (row as any)[columnId]?.toString().toLowerCase().includes(filterValue)
        : true,
    ),
  );

  const handleOpenEditarModal = (registro: Declaracion) => {
    setRegistroSeleccionado(registro);
    setEditarModalOpen(true);
  };

  const handleCloseEditarModal = () => {
    setEditarModalOpen(false);
    setRegistroSeleccionado(null);
  };

  return (
    <Paper sx={{ width: '100%', overflowX: 'auto' }}>
      <Box display="flex" justifyContent="flex-end" paddingTop={1}>
        <div>
          <Tooltip title="Nuevo">
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setModalIsOpen(true)}
              startIcon={<AddIcon />}
              sx={{
                padding: '7px 10px',
                marginRight: 1,
                margin: '10px',
              }}>
              Nuevo
            </Button>
          </Tooltip>
        </div>
        <div>
          <Tooltip title="Exportar a Excel">
            <Button
              variant="outlined"
              color="success"
              onClick={() => exportToExcel(rows, 'Declaraciones')}
              sx={{
                padding: '9px 20px', // Ajusta el padding para mejor aspecto
                paddingRight: '10px',
                margin: '10px',
              }}
              startIcon={<DownloadIcon />}
            />
          </Tooltip>
        </div>
      </Box>
      <Box sx={{ minWidth: 1200 }}>
        <TableContainer sx={{ maxHeight: 570 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map(column => (
                  <TableCell
                    key={column.id}
                    style={{
                      minWidth: column.minWidth,
                      background: '#2092b2',
                      color: 'white',
                      ...(column.id === 'acciones' && {
                        position: 'sticky',
                        right: 0,
                        zIndex: 2, // zIndex más alto para que se vea sobre las filas
                        background: '#2092b2',
                        textAlign: 'center',
                      }),
                    }}>
                    {column.label}
                    {column.id !== 'acciones' && (
                      <TextField
                        variant="standard"
                        size="small"
                        placeholder="Filtrar..."
                        onChange={e =>
                          handleFilterChange(column.id, e.target.value)
                        }
                        fullWidth
                        InputProps={{
                          style: { color: 'white' },
                        }}
                      />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, rowIndex) => (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={rowIndex}
                    sx={{
                      backgroundColor: rowIndex % 2 === 0 ? '#f9f9f9' : 'white',
                    }}>
                    {columns.map(column => {
                      if (column.id === 'acciones') {
                        return (
                          <TableCell
                            key={column.id}
                            align="center"
                            sx={{
                              position: 'sticky',
                              right: 0,
                              backgroundColor: '#f9f9f9',
                              ...(rowIndex % 2 === 0 && {
                                backgroundColor: '#f9f9f9',
                              }),
                            }}>
                            <IconButton
                              color="primary"
                              aria-label="Editar"
                              onClick={() => handleOpenEditarModal(row)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="info"
                              aria-label="Consultar"
                              onClick={() =>
                                navigate(`/home/detalle/${row._id}`)
                              }>
                              <VisibilityIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              aria-label="Eliminar"
                              onClick={() => handleDelete(row)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        );
                      }
                      const value = (row as any)[column.id];
                      if (column.id === 'pdfDeclaracion') {
                        return (
                          <TableCell key={column.id} align="center">
                            {getFileIcon(
                              row.pdfDeclaracion,
                              row.archivoDeclaracion,
                            )}
                          </TableCell>
                        );
                      }
                      if (column.id === 'pdfFactura') {
                        return (
                          <TableCell key={column.id} align="center">
                            {getFileIcon(row.pdfFactura, row.archivoFactura)}
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell key={column.id}>
                          {column.id === 'createdAt'
                            ? formatDate(value)
                            : column.id === 'factura' &&
                              typeof value === 'string'
                            ? `${value.substring(0, 40)}${
                                value.length > 40 ? '...' : ''
                              }`
                            : column.id === 'datosDeclaracion' &&
                              typeof value === 'string'
                            ? `${value.substring(0, 50)}${
                                value.length > 50 ? '...' : ''
                              }`
                            : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={event => setRowsPerPage(+event.target.value)}
        labelRowsPerPage="Filas por página"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
      />
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
    </Paper>
  );
}
