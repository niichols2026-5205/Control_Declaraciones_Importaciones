import { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import ConsultarRegistroModal from './ConsultarRegistroModal';
import { Declaracion } from './types'; // Importamos la interfaz
import EditarRegistroModal from './EditarRegistroModal';

import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import GridOnIcon from '@mui/icons-material/GridOn';
import { CloudDownloadRounded } from '@mui/icons-material';

import { Box, Button, TextField, Tooltip } from '@mui/material';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const columns = [
  { id: 'createdAt', label: 'Fecha/Hora', minWidth: 100 },
  { id: 'numeroDeclaracion', label: 'No. Declaración', minWidth: 102 },
  { id: 'datosDeclaracion', label: 'Datos Declaración', minWidth: 200 },
  { id: 'pdfDeclaracion', label: 'Archivo', minWidth: 30 },
  { id: 'archivoDeclaracion', label: 'Nombre Archivo', minWidth: 50 },
  { id: 'factura', label: 'No.Factura', minWidth: 100 },
  { id: 'proveedor', label: 'Proveedor', minWidth: 120 },
  { id: 'idDeclaracion', label: 'Id.Declaración', minWidth: 80 },
  { id: 'acciones', label: 'Acciones', minWidth: 120, align: 'center' },
];

const API_URL = 'http://localhost:5000/declaraciones';

export default function TableDeclaraciones() {
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [registroSeleccionado, setRegistroSeleccionado] =
    useState<Declaracion | null>(null);
  const [rows, setRows] = useState<Declaracion[]>([]);

  const [filters, setFilters] = useState<{ [key: string]: string }>({});

  const handleFilterChange = (columnId: string, value: string) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [columnId]: value.toLowerCase(),
    }));
  };

  const filteredRows = rows.filter(row =>
    Object.entries(filters).every(([columnId, filterValue]) =>
      filterValue
        ? (row as any)[columnId]?.toString().toLowerCase().includes(filterValue)
        : true,
    ),
  );

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

  useEffect(() => {
    fetch(API_URL)
      .then(response => response.json())
      .then(data => setRows(data))
      .catch(error => console.error('Error al obtener los datos:', error));
  }, []);

  const handleOpenModal = (registro: Declaracion) => {
    setRegistroSeleccionado(registro);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setRegistroSeleccionado(null);
  };

  const [editarModalOpen, setEditarModalOpen] = useState<boolean>(false);

  const handleOpenEditarModal = (registro: Declaracion) => {
    setRegistroSeleccionado(registro);
    setEditarModalOpen(true);
  };

  const handleCloseEditarModal = () => {
    setEditarModalOpen(false);
    setRegistroSeleccionado(null);
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
      setRows(prevRows =>
        prevRows.filter(row => row.idDeclaracion !== registro.idDeclaracion),
      );
    } catch (error) {
      console.error('Error al eliminar el registro:', error);
    }
  };

  const handleSaveRegistroEditado = (registroEditado: Declaracion) => {
    console.log('Registro editado:', registroEditado);
    // Aquí podrías actualizar el estado o hacer una llamada a la API
  };

  const getFileIcon = (fileData: string, fileName: string) => {
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
      ({ pdfDeclaracion, _id, acciones, updatedAt, ...rest }) => {
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

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box display="flex" justifyContent="flex-end">
        <Tooltip title="Exportar a Excel">
          <Button
            variant="contained"
            color="inherit"
            onClick={() => exportToExcel(rows, 'Declaraciones')}
            sx={{
              padding: '10px 24px', // Ajusta el padding para mejor aspecto
              paddingRight: '15px',
            }}
            startIcon={<CloudDownloadRounded />}
          />
        </Tooltip>
      </Box>
      <TableContainer sx={{ maxHeight: 550 }}>
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
                  }}>
                  {column.label}
                  {column.id !== 'acciones' && ( // Evita filtros en la columna de acciones
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
                <TableRow hover role="checkbox" tabIndex={-1} key={rowIndex}>
                  {columns.map(column => {
                    if (column.id === 'acciones') {
                      return (
                        <TableCell key={column.id} align="center">
                          <IconButton
                            color="primary"
                            aria-label="Editar"
                            onClick={() => handleOpenEditarModal(row)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="info"
                            aria-label="Consultar"
                            onClick={() => handleOpenModal(row)}>
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

                    return (
                      <TableCell key={column.id}>
                        {column.id === 'createdAt' ? formatDate(value) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={event => setRowsPerPage(+event.target.value)}
      />
      <ConsultarRegistroModal
        open={modalOpen}
        onClose={handleCloseModal}
        registro={registroSeleccionado}
      />
      <EditarRegistroModal
        open={editarModalOpen}
        onClose={handleCloseEditarModal}
        registro={registroSeleccionado}
        onSave={handleSaveRegistroEditado}
      />
    </Paper>
  );
}
