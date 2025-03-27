import { useState } from 'react';
import { FaPrint } from 'react-icons/fa';
import Header from './Heder';

import NuevoRegistroModal from './NuevoRegistroModal'; // Importar el modal
import './Home.css';
import TableDeclaraciones from './TableDeclaraciones';

function Home() {
  const username: string = 'Admin'; // Usuario de prueba
  const [modalIsOpen, setModalIsOpen] = useState(false);

  return (
    <div>
      <Header username={username} />
      <div className="containerHome">
        <div className="button-container-nuevo">
          <input type="search" placeholder="Buscar" className="input-search" />
          <button className="btn-home">Buscar</button>
          <button className="btn-home" onClick={() => setModalIsOpen(true)}>
            Nuevo
          </button>
          <button className="btn-imprimir">
            <FaPrint size={20} />
          </button>
        </div>
        <div className="table-container">
          <TableDeclaraciones />
        </div>
      </div>

      {/* Modal de Nuevo Registro */}
      <NuevoRegistroModal
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
      />
    </div>
  );
}

export default Home;
