import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import declaracionesRoutes from './routes/declaraciones.routes';

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Conectar a MongoDB
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión:', err));

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));

// Rutas
app.use('/declaraciones', declaracionesRoutes);
