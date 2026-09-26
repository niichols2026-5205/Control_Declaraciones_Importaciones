import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './home/Home';
import Login from './login/Login';
import ConsultarRegistroModal from './modales/ConsultarRegistroModal';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router basename="/controlfacturas">
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Login />} />
        {/* Ambas rutas permiten consultar el QR sin pedir login */}
        <Route path="/home/detalle/:id" element={<ConsultarRegistroModal />} />
        <Route path="/consulta/:id" element={<ConsultarRegistroModal />} />

        {/* Rutas Privadas (Requieren token) */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Cualquier otra ruta no autorizada redirige */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
