const express = require('express');
const {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
} = require('../controllers/movie.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Rutas públicas (GET) - cualquiera puede ver el catálogo de películas
router.get('/', getAllMovies);
router.get('/:id', getMovieById);

// Rutas protegidas (requieren autenticación) - solo administradores pueden crear/editar/eliminar
router.post('/', authMiddleware, createMovie);
router.put('/:id', authMiddleware, updateMovie);
router.delete('/:id', authMiddleware, deleteMovie);

module.exports = router;
