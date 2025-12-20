const Showtime = require('../models/showtime.model');
const Movie = require('../models/movie.model');
const Room = require('../models/room.model');

// Crear una nueva función de cine
exports.createShowtime = async (req, res) => {
  try {
    const { movie_id, room_id, start_time, end_time } = req.body;

    // Validar que movie_id existe
    const movie = await Movie.findById(movie_id);
    if (!movie) {
      return res.status(400).json({ message: 'Movie does not exist' });
    }

    // Validar que room_id existe
    const room = await Room.findById(room_id);
    if (!room) {
      return res.status(400).json({ message: 'Room does not exist' });
    }

    // Normalizar fechas al inicio y fin del día (sin horas ni minutos)
    const startDate = new Date(start_time);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(end_time);
    endDate.setHours(23, 59, 59, 999);

    // Validar que start_date es futura o actual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
      return res.status(400).json({ message: 'Start date must be today or in the future' });
    }

    // Validar que end_date es mayor o igual que start_date
    if (endDate < startDate) {
      return res.status(400).json({ message: 'End date must be greater than or equal to start date' });
    }

    // Validar solapamiento de días en la misma sala
    const overlap = await Showtime.findOne({
      room_id: room_id,
      $or: [
        // Caso 1: El nuevo showtime empieza durante uno existente
        {
          start_time: { $lte: startDate },
          end_time: { $gte: startDate }
        },
        // Caso 2: El nuevo showtime termina durante uno existente
        {
          start_time: { $lte: endDate },
          end_time: { $gte: endDate }
        },
        // Caso 3: El nuevo showtime contiene completamente uno existente
        {
          start_time: { $gte: startDate },
          end_time: { $lte: endDate }
        }
      ]
    });

    if (overlap) {
      return res.status(400).json({ message: 'There is an overlapping showtime in this room for these dates' });
    }

    // Crear el showtime con el user_id del usuario autenticado y fechas normalizadas
    const showtimeData = {
      movie_id,
      room_id,
      start_time: startDate,
      end_time: endDate,
      user_id: req.userId // ID del usuario autenticado
    };
    const showtime = new Showtime(showtimeData);
    await showtime.save();
    res.status(201).json(showtime);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtener todas las funciones del usuario autenticado
exports.getShowtimes = async (req, res) => {
  try {
    const showtimes = await Showtime.find({ user_id: req.userId })
      .populate('movie_id', 'title')
      .populate('room_id', 'name');
    res.json(showtimes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener una función por ID (solo si pertenece al usuario autenticado)
exports.getShowtimeById = async (req, res) => {
  try {
    const showtime = await Showtime.findOne({ _id: req.params.id, user_id: req.userId })
      .populate('movie_id', 'title')
      .populate('room_id', 'name');
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found or unauthorized' });
    }
    res.json(showtime);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar una función
exports.updateShowtime = async (req, res) => {
  try {
    // Verificar que el showtime existe y pertenece al usuario
    const showtime = await Showtime.findOne({ _id: req.params.id, user_id: req.userId });
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found or unauthorized' });
    }

    const { movie_id, room_id, start_time, end_time } = req.body;

    // Si se proporciona movie_id, validar que existe
    if (movie_id) {
      const movie = await Movie.findById(movie_id);
      if (!movie) {
        return res.status(400).json({ message: 'Movie does not exist' });
      }
    }

    // Si se proporciona room_id, validar que existe
    if (room_id) {
      const room = await Room.findById(room_id);
      if (!room) {
        return res.status(400).json({ message: 'Room does not exist' });
      }
    }

    // Validar start_time si se proporciona - normalizar al inicio del día
    let newStartTime = showtime.start_time;
    if (start_time) {
      newStartTime = new Date(start_time);
      newStartTime.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (newStartTime < today) {
        return res.status(400).json({ message: 'Start date must be today or in the future' });
      }
    }

    // Validar end_time vs start_time - normalizar al fin del día
    let newEndTime = showtime.end_time;
    if (end_time) {
      newEndTime = new Date(end_time);
      newEndTime.setHours(23, 59, 59, 999);
    }

    if (newEndTime < newStartTime) {
      return res.status(400).json({ message: 'End date must be greater than or equal to start date' });
    }

    // Validar solapamiento (excluyendo el showtime actual)
    const newRoomId = room_id || showtime.room_id;
    const overlap = await Showtime.findOne({
      room_id: newRoomId,
      _id: { $ne: req.params.id },
      $or: [
        {
          start_time: { $lte: newStartTime },
          end_time: { $gte: newStartTime }
        },
        {
          start_time: { $lte: newEndTime },
          end_time: { $gte: newEndTime }
        },
        {
          start_time: { $gte: newStartTime },
          end_time: { $lte: newEndTime }
        }
      ]
    });

    if (overlap) {
      return res.status(400).json({ message: 'There is an overlapping showtime in this room for these dates' });
    }

    // Actualizar los campos con fechas normalizadas
    if (movie_id) { showtime.movie_id = movie_id; }
    if (room_id) { showtime.room_id = room_id; }
    if (start_time) { showtime.start_time = newStartTime; }
    if (end_time) { showtime.end_time = newEndTime; }

    await showtime.save();

    res.json(showtime);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar una función
exports.deleteShowtime = async (req, res) => {
  try {
    // Verificar que el showtime existe y pertenece al usuario
    const showtime = await Showtime.findOneAndDelete({ _id: req.params.id, user_id: req.userId });
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found or unauthorized' });
    }
    res.json({ message: 'Showtime deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};