import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
} from '@mui/material';

interface NuevoRegistroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const API_URL = `${import.meta.env.VITE_API_URL}/declaraciones`;

const NuevoRegistroModal: React.FC<NuevoRegistroModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    importadoNacional: '',
    numeroDeclaracion: '',
    datosDeclaracion: '',
    pdfDeclaracion: '',
    archivoDeclaracion: '',
    factura: '',
    nitProveedor: '',
    proveedor: '',
    numeroFactura: '',
    pdfFactura: '',
    archivoFactura: '',
    observaciones: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFile2, setSelectedFile2] = useState<File | null>(null);
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

  // Manejador de carga de archivos
  const handleFileChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile2(file);

      // Convertir archivo a Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setFormData(prevData => ({
          ...prevData,
          archivoFactura: file.name, // Guardamos solo el nombre
          pdfFactura: reader.result as string, // Guardamos el Base64
        }));
      };
    }
  };

  // Función para guardar los datos
  const handleSave = async () => {
    if (
      !formData.importadoNacional ||
      !formData.numeroDeclaracion ||
      !formData.datosDeclaracion ||
      // !formData.archivoDeclaracion ||
      !formData.factura ||
      !formData.nitProveedor ||
      !formData.proveedor ||
      !formData.numeroFactura ||
      // !formData.pdfFactura ||
      // !formData.archivoFactura ||
      !formData.observaciones
    ) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Error al guardar el registro');

      const newRegistro = await response.json();
      console.log('Registro guardado con éxito:', newRegistro);

      onSave(); // avisamos al padre
      onClose(); // cerramos modal
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setLoading(false);
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
          width: 800,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}>
        <Typography variant="h6" gutterBottom color="text.primary">
          Nuevo Registro
        </Typography>

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
        />

        <Typography variant="body1" sx={{ mt: 2 }}>
          Cargar archivo Declaracion:
        </Typography>
        <input type="file" onChange={handleFileChange} />
        {formData.archivoDeclaracion && (
          <Typography variant="body2" sx={{ mt: 1, color: 'gray' }}>
            Archivo seleccionado: {formData.archivoDeclaracion}
          </Typography>
        )}
        <TextField
          fullWidth
          margin="normal"
          label="Detalle Factura"
          name="factura"
          value={formData.factura}
          onChange={handleChange}
          rows={4}
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
              label="Numero Factura"
              name="numeroFactura"
              value={formData.numeroFactura}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        <Typography variant="body1" sx={{ mt: 2 }}>
          Cargar archivo Factura:
        </Typography>
        <input type="file" onChange={handleFileChange2} />
        {formData.archivoFactura && (
          <Typography variant="body2" sx={{ mt: 1, color: 'gray' }}>
            Archivo seleccionado: {formData.archivoFactura}
          </Typography>
        )}
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
