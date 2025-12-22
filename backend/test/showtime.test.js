const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = require('../src/app');
const Movie = require('../src/models/movie.model');
const Room = require('../src/models/room.model');
const Showtime = require('../src/models/showtime.model');
const User = require('../src/models/user.model');
const { connectTestDB } = require('../src/config/setupDB');

let token;
let user;

beforeAll(async () => {
  await connectTestDB();

  await User.deleteMany({});
  await Movie.deleteMany({});
  await Room.deleteMany({});
  await Showtime.deleteMany({});

  user = await User.create({
    name: 'Test User',
    email: 'testuser1@example.com',
    password: 'password123',
  });

  token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || 'testsecret',
    { expiresIn: '24h' }
  );
});

beforeEach(async () => {
  await Movie.deleteMany({});
  await Room.deleteMany({});
  await Showtime.deleteMany({});
});

afterAll(async () => {
  await Movie.deleteMany({});
  await Room.deleteMany({});
  await Showtime.deleteMany({});
  await mongoose.connection.close();
});

describe('Showtime API (JWT protected)', () => {

  /* =========================
     POST
  ========================== */

  test('POST /api/showtimes creates a showtime', async () => {
    const movie = await Movie.create({
      title: 'Movie',
      duration: 120,
      release_year: 2024,
      user_id: user._id
    });

    const room = await Room.create({
      name: 'Room',
      capacity: 100,
      type: '2D',
      user_id: user._id
    });

    const res = await request(app)
      .post('/api/showtimes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movie_id: movie._id,
        room_id: room._id,
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end_time: new Date(Date.now() + 48 * 60 * 60 * 1000),
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.movie_id).toBe(movie._id.toString());
    expect(res.body.room_id).toBe(room._id.toString());
    expect(res.body.user_id).toBe(user._id.toString());
  });

  test('POST fails with non-existent movie', async () => {
    const room = await Room.create({
      name: 'Room',
      capacity: 50,
      type: '2D',
      user_id: user._id
    });

    const res = await request(app)
      .post('/api/showtimes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movie_id: new mongoose.Types.ObjectId(),
        room_id: room._id,
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end_time: new Date(Date.now() + 48 * 60 * 60 * 1000),
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Movie does not exist');
  });

  test('POST fails with past start_time', async () => {
    const movie = await Movie.create({
      title: 'Movie',
      duration: 120,
      release_year: 2024,
      user_id: user._id
    });

    const room = await Room.create({
      name: 'Room',
      capacity: 50,
      type: '2D',
      user_id: user._id
    });

    const res = await request(app)
      .post('/api/showtimes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movie_id: movie._id,
        room_id: room._id,
        start_time: new Date(Date.now() - 24 * 60 * 60 * 1000),
        end_time: new Date(Date.now() + 48 * 60 * 60 * 1000),
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Start date must be today or in the future');
  });

  /* =========================
     GET
  ========================== */

  test('GET /api/showtimes returns user showtimes', async () => {
    const movie = await Movie.create({
      title: 'Movie',
      duration: 120,
      release_year: 2024,
      user_id: user._id
    });

    const room = await Room.create({
      name: 'Room',
      capacity: 50,
      type: '2D',
      user_id: user._id
    });

    await request(app)
      .post('/api/showtimes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movie_id: movie._id,
        room_id: room._id,
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end_time: new Date(Date.now() + 48 * 60 * 60 * 1000),
      });

    const res = await request(app)
      .get('/api/showtimes')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  test('GET /api/showtimes/:id returns showtime', async () => {
    const movie = await Movie.create({
      title: 'Movie',
      duration: 120,
      release_year: 2024,
      user_id: user._id
    });

    const room = await Room.create({
      name: 'Room',
      capacity: 50,
      type: '2D',
      user_id: user._id
    });

    const createRes = await request(app)
      .post('/api/showtimes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movie_id: movie._id,
        room_id: room._id,
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end_time: new Date(Date.now() + 48 * 60 * 60 * 1000),
      });

    const res = await request(app)
      .get(`/api/showtimes/${createRes.body._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(createRes.body._id);
  });

  /* =========================
     PUT
  ========================== */

  test('PUT /api/showtimes/:id updates showtime', async () => {
    const movie = await Movie.create({
      title: 'Movie',
      duration: 120,
      release_year: 2024,
      user_id: user._id,
    });

    const room = await Room.create({
      name: 'Room',
      capacity: 50,
      type: '2D',
      user_id: user._id,
    });

    // Crear el showtime
    const createRes = await request(app)
      .post('/api/showtimes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movie_id: movie._id,
        room_id: room._id,
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),  // Un día después
        end_time: new Date(Date.now() + 48 * 60 * 60 * 1000),  // Dos días después
      });

    // Intentamos actualizar el showtime con una nueva fecha de inicio
    const newStartTime = new Date(Date.now() + 72 * 60 * 60 * 1000); // Tres días después

    const res = await request(app)
      .put(`/api/showtimes/${createRes.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        start_time: newStartTime,  // Actualizando la fecha
        end_time: new Date(newStartTime.getTime() + (movie.duration * 60 * 1000)) 
      });

    // Verificamos que la respuesta sea 200
    expect(res.statusCode).toBe(200);

    // Verificamos que el showtime se haya actualizado correctamente
    expect(res.body._id).toBe(createRes.body._id);
  });


  /* =========================
     DELETE
  ========================== */

  test('DELETE /api/showtimes/:id deletes showtime', async () => {
    const movie = await Movie.create({
      title: 'Movie',
      duration: 120,
      release_year: 2024,
      user_id: user._id
    });

    const room = await Room.create({
      name: 'Room',
      capacity: 50,
      type: '2D',
      user_id: user._id
    });

    const createRes = await request(app)
      .post('/api/showtimes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movie_id: movie._id,
        room_id: room._id,
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end_time: new Date(Date.now() + 48 * 60 * 60 * 1000),
      });

    const res = await request(app)
      .delete(`/api/showtimes/${createRes.body._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Showtime deleted successfully');
  });

  test('POST fails with non-existent room', async () => {
    const movie = await Movie.create({
      title: 'Movie',
      duration: 120,
      release_year: 2024,
      user_id: user._id
    });

    const res = await request(app)
      .post('/api/showtimes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movie_id: movie._id,
        room_id: new mongoose.Types.ObjectId(),
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end_time: new Date(Date.now() + 48 * 60 * 60 * 1000),
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Room does not exist');
  });

  test('POST fails when end_time is before start_time', async () => {
    const movie = await Movie.create({
      title: 'Movie',
      duration: 120,
      release_year: 2024,
      user_id: user._id
    });

    const room = await Room.create({
      name: 'Room',
      capacity: 50,
      type: '2D',
      user_id: user._id
    });

    const res = await request(app)
      .post('/api/showtimes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movie_id: movie._id,
        room_id: room._id,
        // start after end
        start_time: new Date(Date.now() + 72 * 60 * 60 * 1000),
        end_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('End date must be greater than or equal to start date');
  });

  test('POST fails with overlapping showtime', async () => {
    const movie = await Movie.create({
      title: 'Movie',
      duration: 120,
      release_year: 2024,
      user_id: user._id
    });

    const room = await Room.create({
      name: 'Room',
      capacity: 50,
      type: '2D',
      user_id: user._id
    });

    // Create initial showtime
    await request(app)
      .post('/api/showtimes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movie_id: movie._id,
        room_id: room._id,
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end_time: new Date(Date.now() + 48 * 60 * 60 * 1000),
      });

    // Try to create overlapping
    const res = await request(app)
      .post('/api/showtimes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movie_id: movie._id,
        room_id: room._id,
        start_time: new Date(Date.now() + 36 * 60 * 60 * 1000), // inside existing
        end_time: new Date(Date.now() + 60 * 60 * 60 * 1000),
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('There is an overlapping showtime in this room for these dates');
  });

  test('GET /api/showtimes/:id returns 404 when not found', async () => {
    const res = await request(app)
      .get(`/api/showtimes/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Showtime not found or unauthorized');
  });

  test('PUT /api/showtimes/:id returns 404 when not found', async () => {
    const res = await request(app)
      .put(`/api/showtimes/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ start_time: new Date(Date.now() + 24 * 60 * 60 * 1000) });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Showtime not found or unauthorized');
  });

  test('PUT fails with non-existent movie', async () => {
    const movie = await Movie.create({
      title: 'Movie',
      duration: 120,
      release_year: 2024,
      user_id: user._id,
    });

    const room = await Room.create({
      name: 'Room',
      capacity: 50,
      type: '2D',
      user_id: user._id,
    });

    const createRes = await request(app)
      .post('/api/showtimes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movie_id: movie._id,
        room_id: room._id,
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end_time: new Date(Date.now() + 48 * 60 * 60 * 1000),
      });

    const res = await request(app)
      .put(`/api/showtimes/${createRes.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ movie_id: new mongoose.Types.ObjectId() });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Movie does not exist');
  });

  test('PUT fails with non-existent room', async () => {
    const movie = await Movie.create({
      title: 'Movie',
      duration: 120,
      release_year: 2024,
      user_id: user._id,
    });

    const room = await Room.create({
      name: 'Room',
      capacity: 50,
      type: '2D',
      user_id: user._id,
    });

    const createRes = await request(app)
      .post('/api/showtimes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movie_id: movie._id,
        room_id: room._id,
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end_time: new Date(Date.now() + 48 * 60 * 60 * 1000),
      });

    const res = await request(app)
      .put(`/api/showtimes/${createRes.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ room_id: new mongoose.Types.ObjectId() });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Room does not exist');
  });

  test('PUT fails with past start_time', async () => {
    const movie = await Movie.create({
      title: 'Movie',
      duration: 120,
      release_year: 2024,
      user_id: user._id,
    });

    const room = await Room.create({
      name: 'Room',
      capacity: 50,
      type: '2D',
      user_id: user._id,
    });

    const createRes = await request(app)
      .post('/api/showtimes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movie_id: movie._id,
        room_id: room._id,
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end_time: new Date(Date.now() + 48 * 60 * 60 * 1000),
      });

    const res = await request(app)
      .put(`/api/showtimes/${createRes.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ start_time: new Date(Date.now() - 24 * 60 * 60 * 1000) });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Start date must be today or in the future');
  });

  test('PUT fails when end_time is before start_time', async () => {
    const movie = await Movie.create({
      title: 'Movie',
      duration: 120,
      release_year: 2024,
      user_id: user._id,
    });

    const room = await Room.create({
      name: 'Room',
      capacity: 50,
      type: '2D',
      user_id: user._id,
    });

    const createRes = await request(app)
      .post('/api/showtimes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movie_id: movie._id,
        room_id: room._id,
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end_time: new Date(Date.now() + 48 * 60 * 60 * 1000),
      });

    const res = await request(app)
      .put(`/api/showtimes/${createRes.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        start_time: new Date(Date.now() + 72 * 60 * 60 * 1000),
        end_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('End date must be greater than or equal to start date');
  });

  test('PUT fails with overlapping showtime', async () => {
    const movie = await Movie.create({
      title: 'Movie',
      duration: 120,
      release_year: 2024,
      user_id: user._id,
    });

    const room = await Room.create({
      name: 'Room',
      capacity: 50,
      type: '2D',
      user_id: user._id,
    });

    // Create first showtime
    const createRes1 = await request(app)
      .post('/api/showtimes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movie_id: movie._id,
        room_id: room._id,
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end_time: new Date(Date.now() + 48 * 60 * 60 * 1000),
      });

    // Create second showtime
    const createRes2 = await request(app)
      .post('/api/showtimes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movie_id: movie._id,
        room_id: room._id,
        start_time: new Date(Date.now() + 96 * 60 * 60 * 1000),
        end_time: new Date(Date.now() + 120 * 60 * 60 * 1000),
      });

    // Try to update second to overlap with first
    const res = await request(app)
      .put(`/api/showtimes/${createRes2.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        start_time: new Date(Date.now() + 36 * 60 * 60 * 1000),
        end_time: new Date(Date.now() + 60 * 60 * 60 * 1000),
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('There is an overlapping showtime in this room for these dates');
  });

  test('DELETE returns 404 when showtime not found', async () => {
    const res = await request(app)
      .delete(`/api/showtimes/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Showtime not found or unauthorized');
  });

  test('POST returns 400 when Movie.findById throws', async () => {
    const spy = jest.spyOn(Movie, 'findById').mockImplementation(() => { throw new Error('DB failure'); });

    const res = await request(app)
      .post('/api/showtimes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movie_id: new mongoose.Types.ObjectId(),
        room_id: new mongoose.Types.ObjectId(),
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end_time: new Date(Date.now() + 48 * 60 * 60 * 1000),
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('DB failure');
    spy.mockRestore();
  });

  test('GET /api/showtimes returns 500 when Showtime.find throws', async () => {
    const spy = jest.spyOn(Showtime, 'find').mockImplementation(() => { throw new Error('DB fail'); });

    const res = await request(app)
      .get('/api/showtimes')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('DB fail');
    spy.mockRestore();
  });

  test('GET /api/showtimes/:id returns 500 when Showtime.findOne throws', async () => {
    const spy = jest.spyOn(Showtime, 'findOne').mockImplementation(() => { throw new Error('DB fail'); });

    const res = await request(app)
      .get(`/api/showtimes/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('DB fail');
    spy.mockRestore();
  });

  test('PUT returns 400 when Showtime.findOne throws', async () => {
    const spy = jest.spyOn(Showtime, 'findOne').mockImplementation(() => { throw new Error('DB fail'); });

    const res = await request(app)
      .put(`/api/showtimes/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ start_time: new Date(Date.now() + 24 * 60 * 60 * 1000) });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('DB fail');
    spy.mockRestore();
  });

  test('DELETE returns 500 when Showtime.findOneAndDelete throws', async () => {
    const spy = jest.spyOn(Showtime, 'findOneAndDelete').mockImplementation(() => { throw new Error('DB fail'); });

    const res = await request(app)
      .delete(`/api/showtimes/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('DB fail');
    spy.mockRestore();
  });

  test('PUT updates movie and room when valid ids provided', async () => {
    const movie1 = await Movie.create({
      title: 'Movie1',
      duration: 100,
      release_year: 2024,
      user_id: user._id,
    });

    const movie2 = await Movie.create({
      title: 'Movie2',
      duration: 90,
      release_year: 2024,
      user_id: user._id,
    });

    const room1 = await Room.create({ name: 'Room1', capacity: 50, type: '2D', user_id: user._id });
    const room2 = await Room.create({ name: 'Room2', capacity: 60, type: '3D', user_id: user._id });

    const createRes = await request(app)
      .post('/api/showtimes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movie_id: movie1._id,
        room_id: room1._id,
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end_time: new Date(Date.now() + 48 * 60 * 60 * 1000),
      });

    const newStart = new Date(Date.now() + 72 * 60 * 60 * 1000);
    const newEnd = new Date(Date.now() + 96 * 60 * 60 * 1000);

    const res = await request(app)
      .put(`/api/showtimes/${createRes.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        movie_id: movie2._id,
        room_id: room2._id,
        start_time: newStart,
        end_time: newEnd,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.movie_id).toBe(movie2._id.toString());
    expect(res.body.room_id).toBe(room2._id.toString());
  });

});
