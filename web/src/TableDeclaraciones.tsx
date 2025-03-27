import { useState } from 'react';
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

const columns = [
  { id: 'fechaHora', label: 'Fecha/Hora', minWidth: 50 },
  { id: 'numeroDeclaracion', label: 'No. Declaración', minWidth: 50 },
  { id: 'datosDeclaracion', label: 'Datos Declaración', minWidth: 50 },
  { id: 'pdfDeclaracion', label: 'PDF', minWidth: 50 },
  { id: 'archivoDeclaracion', label: 'Archivo Declaración', minWidth: 50 },
  { id: 'factura', label: 'Factura', minWidth: 50 },
  { id: 'proveedor', label: 'Proveedor', minWidth: 50 },
  { id: 'numeroFactura', label: 'Número Factura', minWidth: 50 },
  { id: 'pdfFactura', label: 'PDF Factura', minWidth: 50 },
  { id: 'idDeclaracion', label: 'ID Declaración', minWidth: 50 },
  { id: 'acciones', label: 'Acciones', minWidth: 120, align: 'center' },
];

const rows: Declaracion[] = [
  {
    fechaHora: '2024-03-08 10:30',
    numeroDeclaracion: '12345',
    datosDeclaracion: 'Declaración ABC',
    pdfDeclaracion: 'ver PDF',
    archivoDeclaracion: 'archivo.pdf',
    factura: '98765',
    proveedor: 'Empresa XYZ',
    numeroFactura: '54321',
    pdfFactura: 'ver PDF',
    idDeclaracion: 'D001',
  },
  {
    fechaHora: '2024-03-08 10:30',
    numeroDeclaracion: '12345',
    datosDeclaracion: 'Declaración ABC',
    pdfDeclaracion: 'ver PDF',
    archivoDeclaracion: 'archivo.pdf',
    factura: '98765',
    proveedor: 'Empresa XYZ',
    numeroFactura: '54321',
    pdfFactura: 'ver PDF',
    idDeclaracion: 'D001',
  },
  {
    fechaHora: '2024-03-08 10:30',
    numeroDeclaracion: '12345',
    datosDeclaracion: 'Declaración ABC',
    pdfDeclaracion: 'ver PDF',
    archivoDeclaracion: 'archivo.pdf',
    factura: '98765',
    proveedor: 'Empresa XYZ',
    numeroFactura: '54321',
    pdfFactura: 'ver PDF',
    idDeclaracion: 'D001',
  },
  {
    fechaHora: '2024-03-08 10:30',
    numeroDeclaracion: '12345',
    datosDeclaracion: 'Declaración ABC',
    pdfDeclaracion: 'ver PDF',
    archivoDeclaracion: 'archivo.pdf',
    factura: '98765',
    proveedor: 'Empresa XYZ',
    numeroFactura: '54321',
    pdfFactura: 'ver PDF',
    idDeclaracion: 'D001',
  },
  {
    fechaHora: '2024-03-08 10:30',
    numeroDeclaracion: '12345',
    datosDeclaracion: 'Declaración ABC',
    pdfDeclaracion: 'ver PDF',
    archivoDeclaracion: 'archivo.pdf',
    factura: '98765',
    proveedor: 'Empresa XYZ',
    numeroFactura: '54321',
    pdfFactura: 'ver PDF',
    idDeclaracion: 'D001',
  },
  {
    fechaHora: '2024-03-08 10:30',
    numeroDeclaracion: '12345',
    datosDeclaracion: 'Declaración ABC',
    pdfDeclaracion: 'ver PDF',
    archivoDeclaracion: 'archivo.pdf',
    factura: '98765',
    proveedor: 'Empresa XYZ',
    numeroFactura: '54321',
    pdfFactura: 'ver PDF',
    idDeclaracion: 'D001',
  },
  {
    fechaHora: '2024-03-08 10:30',
    numeroDeclaracion: '12345',
    datosDeclaracion: 'Declaración ABC',
    pdfDeclaracion: 'ver PDF',
    archivoDeclaracion: 'archivo.pdf',
    factura: '98765',
    proveedor: 'Empresa XYZ',
    numeroFactura: '54321',
    pdfFactura: 'ver PDF',
    idDeclaracion: 'D001',
  },
  {
    fechaHora: '2024-03-08 10:30',
    numeroDeclaracion: '12345',
    datosDeclaracion: 'Declaración ABC',
    pdfDeclaracion: 'ver PDF',
    archivoDeclaracion: 'archivo.pdf',
    factura: '98765',
    proveedor: 'Empresa XYZ',
    numeroFactura: '54321',
    pdfFactura: 'ver PDF',
    idDeclaracion: 'D001',
  },
  {
    fechaHora: '2024-03-08 10:30',
    numeroDeclaracion: '12345',
    datosDeclaracion: 'Declaración ABC',
    pdfDeclaracion: 'ver PDF',
    archivoDeclaracion: 'archivo.pdf',
    factura: '98765',
    proveedor: 'Empresa XYZ',
    numeroFactura: '54321',
    pdfFactura: 'ver PDF',
    idDeclaracion: 'D001',
  },
  {
    fechaHora: '2024-03-08 10:30',
    numeroDeclaracion: '12345',
    datosDeclaracion: 'Declaración ABC',
    pdfDeclaracion: 'ver PDF',
    archivoDeclaracion: 'archivo.pdf',
    factura: '98765',
    proveedor: 'Empresa XYZ',
    numeroFactura: '54321',
    pdfFactura: 'ver PDF',
    idDeclaracion: 'D001',
  },
  {
    fechaHora: '2024-03-08 10:30',
    numeroDeclaracion: '12345',
    datosDeclaracion: 'Declaración ABC',
    pdfDeclaracion: 'ver PDF',
    archivoDeclaracion: 'archivo.pdf',
    factura: '98765',
    proveedor: 'Empresa XYZ',
    numeroFactura: '54321',
    pdfFactura: 'ver PDF',
    idDeclaracion: 'D001',
  },
];

export default function TableDeclaraciones() {
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [registroSeleccionado, setRegistroSeleccionado] =
    useState<Declaracion | null>(null);

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

  const handleSaveRegistroEditado = (registroEditado: Declaracion) => {
    console.log('Registro editado:', registroEditado);
    // Aquí podrías actualizar el estado o hacer una llamada a la API
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
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
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
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
                          <IconButton color="error" aria-label="Eliminar">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      );
                    }
                    return (
                      <TableCell key={column.id}>
                        {(row as any)[column.id]}
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
