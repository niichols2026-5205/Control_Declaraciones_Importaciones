import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';
import { Declaracion } from './types';

interface EditarRegistroModalProps {
  open: boolean;
  onClose: () => void;
  registro: Declaracion | null;
  onSave: (registroEditado: Declaracion) => void;
}

const EditarRegistroModal: React.FC<EditarRegistroModalProps> = ({
  open,
  onClose,
  registro,
  onSave,
}) => {
  const [formData, setFormData] = useState<Declaracion | null>(registro);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSave = () => {
    if (formData) {
      onSave(formData);
      onClose();
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
              label="Proveedor"
              name="proveedor"
              value={formData.proveedor}
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

            {/* Campo para seleccionar archivo */}
            <Typography variant="body1" sx={{ mt: 2 }}>
              Cargar archivo:
            </Typography>
            <input type="file" onChange={handleFileChange} />
            {selectedFile && (
              <Typography variant="body2" sx={{ mt: 1, color: 'gray' }}>
                Archivo seleccionado: {selectedFile.name}
              </Typography>
            )}

            <Box mt={2} display="flex" justifyContent="space-between">
              <Button variant="contained" color="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button variant="contained" color="primary" onClick={handleSave}>
                Guardar
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default EditarRegistroModal;
