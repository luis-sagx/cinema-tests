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

// Todas las rutas requieren autenticación (el user es administrador)
router.get('/', authMiddleware, getAllMovies);
router.get('/:id', authMiddleware, getMovieById);
router.post('/', authMiddleware, createMovie);
router.put('/:id', authMiddleware, updateMovie);
router.delete('/:id', authMiddleware, deleteMovie);

module.exports = router;
