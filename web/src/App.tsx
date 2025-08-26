import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './home/Home';
import Login from './login/Login'; // Importamos el nuevo archivo
import ConsultarRegistroModal from './modales/ConsultarRegistroModal';

function App() {
  return (
    <Router basename="/controlfacturas">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/home/detalle/:id" element={<ConsultarRegistroModal />} />
      </Routes>
    </Router>
  );
}

export default App;
