import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './home/Home';
import Login from './login/Login'; // Importamos el nuevo archivo

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
