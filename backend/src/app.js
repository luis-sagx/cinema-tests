require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
const movieRoutes = require('./routes/movie.routes');
const roomRoutes = require('./routes/room.routes');
const showtimeRoutes = require('./routes/showtime.routes');

const app = express(); // Crea una instancia de la aplicación Express

// Configurar CORS para permitir peticiones desde el frontend Angular
const allowedOrigins = [
  'http://localhost:4200', // Desarrollo local
  'https://cinema-tests.vercel.app', // Producción Vercel (ajusta al tuyo)
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);

    // Verificar si el origin está permitido
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Middleware para parsear JSON del cuerpo de las solicitudes
app.use(express.json());

// Ruta base para los usuarios
app.use('/api/users', userRoutes);

// Ruta base para las películas
app.use('/api/movies', movieRoutes);

// Ruta base para las salas
app.use('/api/rooms', roomRoutes);

// Ruta base para las funciones de cine
app.use('/api/showtimes', showtimeRoutes);

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});


// Exportamos app para poder usarla en tests o en un archivo de servidor separado
module.exports = app;