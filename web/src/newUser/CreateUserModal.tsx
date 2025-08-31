import { useState } from 'react';
import './CreateUserModal.css'; // crea este archivo para estilos opcionales

interface Props {
  onClose: () => void;
}

const CreateUserModal: React.FC<Props> = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [roleError, setRoleError] = useState(false);

  const handleCreateUser = async () => {
    if (!username || !password || !role) {
      setRoleError(true);
      alert('Por favor completa todos los campos');
      return;
    }
    setRoleError(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username, password, role }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        alert('Usuario creado exitosamente');
        onClose(); // cerrar modal
      } else {
        alert(data.error || 'Error al crear usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Ocurrió un error al crear el usuario');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Crear Nuevo Usuario</h2>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <select value={role} onChange={e => setRole(e.target.value)} required>
          <option value="">Seleccionar rol</option>
          <option value="user">Asesor</option>
          <option value="admin">Administrador</option>
        </select>
        {roleError && (
          <p style={{ color: 'red', fontSize: '0.9em' }}>
            Por favor registrar todos los campos
          </p>
        )}
        <div className="modal-actions">
          <button onClick={handleCreateUser}>Crear</button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;
