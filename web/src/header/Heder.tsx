import { useNavigate } from 'react-router-dom';
import './Heder.css';
import { FiLogOut } from 'react-icons/fi';

interface HeaderProps {
  username: string;
}

const Header: React.FC<HeaderProps> = ({ username }) => {
  console.log('homeusername: ', username);

  const navigate = useNavigate(); // Hook para la navegación

  const handleLogout = () => {
    localStorage.removeItem('token'); // Eliminar token de autenticación
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
      </div>
      <h1 className="title">Sistema de Gestión de Declaraciones</h1>
      <div className="logout-container">
        <button onClick={handleLogout} className="logout-btn">
          <FiLogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
