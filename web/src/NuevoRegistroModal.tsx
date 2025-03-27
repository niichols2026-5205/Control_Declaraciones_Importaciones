import React, { useState } from 'react';
import Modal from 'react-modal';
import './NuevoRegistroModal.css';
import { Typography } from '@mui/material';

Modal.setAppElement('#root'); // Necesario para accesibilidad

interface NuevoRegistroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NuevoRegistroModal: React.FC<NuevoRegistroModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content"
      overlayClassName="modal-overlay">
      <Typography variant="h6" gutterBottom color="text.primary">
        Nuevo Registro
      </Typography>
      <form>
        <label>Nombre:</label>
        <input type="text" placeholder="Ingrese nombre" />
        <label>Descripción:</label>
        <input type="text" placeholder="Ingrese descripción" />
        <label>Cargar archivo:</label>
        <input type="file" onChange={handleFileChange} />

        {selectedFile && <p>Archivo seleccionado: {selectedFile.name}</p>}

        <div className="modal-buttons">
          <button type="button" className="btn-cancelar" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-guardar">
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NuevoRegistroModal;
