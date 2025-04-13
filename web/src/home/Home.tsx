import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../header/Heder';
import '../header/Heder.css';
import TableDeclaraciones from '../tables/TableDeclaraciones';

function Home() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');

    if (!token) {
      navigate('/'); // Redirigir al Login si no hay token
    } else {
      setUsername(storedUsername); // Cargar el username
    }
  }, [navigate]);

  return (
    <div className="containerHome">
      <Header username={username || 'Usuario'} />
      <div className="table-container">
        <TableDeclaraciones />
      </div>
    </div>
  );
}

export default Home;
