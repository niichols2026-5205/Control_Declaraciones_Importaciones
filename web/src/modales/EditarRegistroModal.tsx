import React, { useEffect, useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
} from '@mui/material';
import { Declaracion } from '../types/types';

interface EditarRegistroModalProps {
  open: boolean;
  onClose: () => void;
  registro: Declaracion | null;
  onSave: (registroEditado: Declaracion) => void;
}

const API_URL = `${import.meta.env.VITE_API_URL}/declaraciones`;

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

  const handleFileChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (formData) {
          setFormData({
            ...formData,
            archivoFactura: file.name,
            pdfFactura: reader.result as string, // Guardamos el Base64
          });
        }
      };
    }
  };

  const handleUpdate = async () => {
    if (!formData) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/${formData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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
          width: 800,
          maxWidth: '92vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: { xs: 2.5, sm: 4 },
          borderRadius: 2,
        }}>
        <Typography variant="h6" gutterBottom color="text.primary">
          Editar Registro
        </Typography>
        {formData && (
          <>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Tipo"
                  name="importadoNacional"
                  value={formData.importadoNacional}
                  onChange={handleChange}
                  select>
                  <MenuItem value="I">Importado</MenuItem>
                  <MenuItem value="N">Nacional</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Número de Declaración"
                  name="numeroDeclaracion"
                  value={formData.numeroDeclaracion}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              margin="normal"
              label="Datos de Declaración"
              name="datosDeclaracion"
              value={formData.datosDeclaracion}
              onChange={handleChange}
              multiline
              minRows={2}
              maxRows={4}
              InputProps={{
                style: { fontFamily: 'monospace', whiteSpace: 'pre-wrap' },
              }}
            />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Cargar archivo Declaracion:
            </Typography>
            <input type="file" onChange={handleFileChange} />
            {formData.archivoDeclaracion && (
              <Typography variant="body2" sx={{ mt: 1, color: 'gray' }}>
                Archivo actual: {formData.archivoDeclaracion}
              </Typography>
            )}
            <TextField
              fullWidth
              margin="normal"
              label="Detalle Factura"
              name="factura"
              value={formData.factura}
              onChange={handleChange}
              multiline
              minRows={3}
              maxRows={6}
              InputProps={{
                style: { fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
              }}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Nit Proveedor"
                  name="nitProveedor"
                  value={formData.nitProveedor}
                  onChange={handleChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Proveedor"
                  name="proveedor"
                  value={formData.proveedor}
                  onChange={handleChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="País"
                  name="pais"
                  value={formData.pais || ''}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              margin="normal"
              label="Observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
            />
            <Box mt={2} justifyContent="flex-end" display="flex" gap={2}>
              <Button
                style={{ background: '#6c757d' }}
                variant="contained"
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
