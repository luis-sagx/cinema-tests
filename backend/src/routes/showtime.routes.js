const express = require('express');
const router = express.Router();
const showtimeController = require('../controllers/showtime.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Todas las rutas de showtime requieren autenticación
router.use(authMiddleware);

// Rutas privadas - el usuario solo ve sus propias funciones
router.get('/', showtimeController.getShowtimes);
router.get('/:id', showtimeController.getShowtimeById);
router.post('/', showtimeController.createShowtime);
router.put('/:id', showtimeController.updateShowtime);
router.delete('/:id', showtimeController.deleteShowtime);

module.exports = router;