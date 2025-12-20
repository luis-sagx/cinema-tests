const express = require('express');
const router = express.Router();
const {
    createRoom,
    getRooms,
    getRoomById,
    updateRoom,
    deleteRoom
} = require('../controllers/room.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación (el user es administrador)
router.post('/', authMiddleware, createRoom);
router.get('/', authMiddleware, getRooms);
router.get('/:id', authMiddleware, getRoomById);
router.put('/:id', authMiddleware, updateRoom);
router.delete('/:id', authMiddleware, deleteRoom);

module.exports = router;
