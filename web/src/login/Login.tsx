import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import reactLogo from '../assets/react.svg';
import '../App.css';

const Login = () => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleLogin = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user, password }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token); // Guardar token
        localStorage.setItem('username', data.username); // Guardar username
        localStorage.setItem('roles', data.roles);
        localStorage.setItem('companyName', data.company?.name || '');
        localStorage.setItem('companyId', data.company?._id || '');
        navigate('/home'); // Redirigir a Home
      } else {
        alert(data.error || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error en la autenticación:', error);
      alert('Ocurrió un error. Intenta de nuevo.');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="headerLogin">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="toggle-theme">
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
        <div className="logo-container">
          <a href="https://sysplus.com.co/" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1>Conexión DK</h1>
        <h3>Iniciar Sesión</h3>
        <input
          type="text"
          placeholder="Usuario"
          value={user}
          onChange={e => setUser(e.target.value)}
          className="input-field"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="input-field"
        />
        <button onClick={handleLogin} className="btn-login">
          Ingresar
        </button>
        {/* <p className="register-text">
          ¿No tienes cuenta? <a href="#">Regístrate</a>
        </p> */}
      </div>
      <p className="footer-text">
        Copyright © Conexión DK - 2026. Todos los derechos reservados
      </p>
    </div>
  );
};

export default Login;
