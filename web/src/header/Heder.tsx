import { useNavigate } from 'react-router-dom';
import './Heder.css';
import { FiLogOut } from 'react-icons/fi';
import { HiUserGroup } from 'react-icons/hi2';
import { useState } from 'react';
import GestionUsuariosModal from '../newUser/GestionUsuariosModal';

interface HeaderProps {
  username: string;
}

const Header: React.FC<HeaderProps> = ({ username }) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const role = localStorage.getItem('roles') || '';
  const companyName = localStorage.getItem('companyName') || '';
  const initial = username ? username.charAt(0).toUpperCase() : 'U';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('roles');
    localStorage.removeItem('companyName');
    localStorage.removeItem('companyId');
    navigate('/');
  };

  return (
    <header className="modern-header">
      {/* Lado izquierdo: Identidad del sistema */}
      <div className="header-brand">
        <div className="brand-logo-badge">CF</div>
        <div className="brand-texts">
          <h1 className="brand-title">Control de Facturación</h1>
          <span className="brand-subtitle">
            {companyName ? `Empresa: ${companyName}` : 'Citymerk • Gestión y Declaraciones'}
          </span>
        </div>
      </div>

      {/* Lado derecho: Perfil de usuario y botones de acción */}
      <div className="header-actions">
        {/* Información del usuario logueado */}
        <div className="user-profile-card">
          <div className="avatar-wrapper">
            <div className="user-avatar-initial">{initial}</div>
            <span className="status-indicator" title="En línea" />
          </div>
          <div className="user-details">
            <span className="user-name">{username}</span>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: '2px' }}>
              <span className={`user-role-badge ${role === 'admin' ? 'role-admin' : 'role-user'}`}>
                {role === 'admin' ? 'Administrador' : 'Operador'}
              </span>
              {companyName && (
                <span
                  style={{
                    backgroundColor: '#e0f2fe',
                    color: '#0369a1',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    border: '1px solid #bae6fd',
                  }}>
                  {companyName}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="header-divider" />

        {/* Botón para gestionar usuarios (Sólo si es admin) */}
        {role === 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="action-btn create-user-action"
            title="Gestión de usuarios y roles">
            <HiUserGroup className="btn-icon" />
            <span className="btn-text">Usuarios</span>
          </button>
        )}

        {/* Botón para cerrar sesión */}
        <button
          onClick={handleLogout}
          className="action-btn logout-action"
          title="Cerrar sesión">
          <FiLogOut className="btn-icon" />
          <span className="btn-text">Cerrar Sesión</span>
        </button>
      </div>

      {showModal && <GestionUsuariosModal open={showModal} onClose={() => setShowModal(false)} />}
    </header>
  );
};

export default Header;

