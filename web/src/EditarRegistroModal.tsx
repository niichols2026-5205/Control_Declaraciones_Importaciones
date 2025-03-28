import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';
import { Declaracion } from './types';

interface EditarRegistroModalProps {
  open: boolean;
  onClose: () => void;
  registro: Declaracion | null;
  onSave: (registroEditado: Declaracion) => void;
}

const API_URL = 'http://localhost:5000/declaraciones';

const EditarRegistroModal: React.FC<EditarRegistroModalProps> = ({
  open,
  onClose,
  registro,
  onSave,
}) => {
  const [formData, setFormData] = useState<Declaracion | null>(registro);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(registro);
  }, [registro]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (formData) {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (formData) {
          setFormData({
            ...formData,
            archivoDeclaracion: file.name,
            pdfDeclaracion: reader.result as string, // Guardamos el Base64
          });
        }
      };
    }
  };

  const handleUpdate = async () => {
    if (!formData) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${formData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la declaración');
      }

      const updatedData = await response.json();
      console.log('Registro editado:', updatedData);
      onSave(updatedData);
      onClose();
    } catch (error) {
      console.error('Error al actualizar:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
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
          Editar Registro
        </Typography>
        {formData && (
          <>
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
                Archivo actual: {formData.archivoDeclaracion}
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
                onClick={handleUpdate}
                disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default EditarRegistroModal;
