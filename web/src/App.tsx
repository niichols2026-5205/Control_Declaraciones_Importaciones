import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import Home from "./Home";
import reactLogo from "./assets/react.svg";
import "./App.css";

function Login() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate(); // Hook para la navegación

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const handleLogin = () => {
    console.log("Usuario:", user);
    console.log("Contraseña:", password);
    navigate("/home"); // Redirige a Home después de iniciar sesión
  };

  return (
    <div className="container">
      <div className="card">
      <div className="headerLogin">
        <button onClick={() => setDarkMode(!darkMode)} className="toggle-theme">
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>
        <div className="logo-container">
          <a href="https://sysplus.com.co/" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1>Iniciar Sesión</h1>
        <input
          type="text"
          placeholder="Usuario"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="input-field"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
        />
        <button onClick={handleLogin} className="btn-login">
          Ingresar
        </button>
        <p className="register-text">
          ¿No tienes cuenta? <a href="#">Regístrate</a>
        </p>
      </div>
      <p className="footer-text">Derechos reservados ©</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
