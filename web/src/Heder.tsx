import { Link } from 'react-router-dom';
import './Heder.css';
import { FiLogOut } from 'react-icons/fi'; // Icono de cerrar sesión

interface HeaderProps {
  username: string;
}

const Header: React.FC<HeaderProps> = ({ username }) => {
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
        <Link to="/" className="logout-btn">
          <FiLogOut size={20} />
        </Link>
      </div>
    </header>
  );
};

export default Header;
