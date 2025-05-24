import { useNavigate } from 'react-router-dom';
import './Heder.css';
import { FiLogOut } from 'react-icons/fi';
import { HiUserPlus } from 'react-icons/hi2';
import { useState } from 'react';
import CreateUserModal from '../newUser/CreateUserModal';

interface HeaderProps {
  username: string;
}

const Header: React.FC<HeaderProps> = ({ username }) => {
  console.log('homeusername: ', username);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate(); // Hook para la navegación

  const role = localStorage.getItem('roles') || '';

  const handleLogout = () => {
    localStorage.removeItem('token'); // Eliminar token de autenticación
    localStorage.removeItem('username');
    localStorage.removeItem('roles');
    navigate('/'); // Redirigir al Login
  };

  return (
    <header className="header">
      <div className="user-info">
        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="User"
          className="user-icon"
        />
        <span className="username">{username}</span>
        {/* Mostrar botón solo si el rol es admin */}
      </div>
      <h1 className="title">Sistema de Gestión de Declaraciones</h1>
      <div className="logout-container">
        {role === 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="create-user-btn"
            title="Nuevo usuario">
            <HiUserPlus size={22} />
          </button>
        )}
      </div>
      <div className="logout-container">
        <button onClick={handleLogout} className="logout-btn" title="Salir">
          <FiLogOut size={15} />
        </button>
      </div>
      {showModal && <CreateUserModal onClose={() => setShowModal(false)} />}
    </header>
  );
};

export default Header;
