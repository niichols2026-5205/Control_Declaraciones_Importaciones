import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';

interface NuevoRegistroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_URL = 'http://localhost:5000/declaraciones';

const NuevoRegistroModal: React.FC<NuevoRegistroModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    numeroDeclaracion: '',
    datosDeclaracion: '',
    archivoDeclaracion: '',
    pdfDeclaracion: '',
    numeroFactura: '',
    factura: '',
    proveedor: '',
    idDeclaracion: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Manejador de cambios en inputs de texto
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejador de carga de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Convertir archivo a Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setFormData(prevData => ({
          ...prevData,
          archivoDeclaracion: file.name, // Guardamos solo el nombre
          pdfDeclaracion: reader.result as string, // Guardamos el Base64
        }));
      };
    }
  };

  // Función para guardar los datos
  const handleSave = async () => {
    if (
      !formData.numeroDeclaracion ||
      !formData.datosDeclaracion ||
      !formData.archivoDeclaracion ||
      !formData.numeroFactura ||
      !formData.factura ||
      !formData.proveedor ||
      !formData.idDeclaracion ||
      !formData.pdfDeclaracion
    ) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Error al guardar el registro');

      console.log('Registro guardado con éxito');
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}>
        <Typography variant="h6" gutterBottom color="text.primary">
          Nuevo Registro
        </Typography>

        <TextField
          fullWidth
          margin="normal"
          label="Número de Declaración"
          name="numeroDeclaracion"
          value={formData.numeroDeclaracion}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Datos de Declaración"
          name="datosDeclaracion"
          value={formData.datosDeclaracion}
          onChange={handleChange}
        />

        <Typography variant="body1" sx={{ mt: 2 }}>
          Cargar archivo:
        </Typography>
        <input type="file" onChange={handleFileChange} />
        {formData.archivoDeclaracion && (
          <Typography variant="body2" sx={{ mt: 1, color: 'gray' }}>
            Archivo seleccionado: {formData.archivoDeclaracion}
          </Typography>
        )}
        {formData.pdfDeclaracion && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            <a
              href={formData.pdfDeclaracion}
              target="_blank"
              rel="noopener noreferrer">
              Ver archivo
            </a>
          </Typography>
        )}
        <TextField
          fullWidth
          margin="normal"
          label="Factura"
          name="factura"
          value={formData.factura}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Número Factura"
          name="numeroFactura"
          value={formData.numeroFactura}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Proveedor"
          name="proveedor"
          value={formData.proveedor}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="ID Declaración"
          name="idDeclaracion"
          value={formData.idDeclaracion}
          onChange={handleChange}
        />

        <Box mt={2} display="flex" justifyContent="space-between">
          <Button
            variant="contained"
            color="secondary"
            onClick={onClose}
            disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default NuevoRegistroModal;
