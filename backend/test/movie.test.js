const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const Movie = require('../src/models/movie.model');
const User = require('../src/models/user.model');
const Showtime = require('../src/models/showtime.model');
const movieController = require('../src/controllers/movie.controller');
const jwt = require('jsonwebtoken');
const { connectTestDB } = require('../src/config/setupDB');

let token;
let user;

// Antes de todos los tests
beforeAll(async () => {
  await connectTestDB();
  await User.deleteMany({});
  await Movie.deleteMany({});

  user = await User.create({
    name: 'Test User',
    email: 'testuser2@example.com',
    password: 'password123',
  });

  token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'testsecret', {
    expiresIn: '24h',
  });
});

beforeEach(async () => {
  await Movie.deleteMany({});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Después de todos los tests
afterAll(async () => {
  await Movie.deleteMany({});
  await mongoose.connection.close();
});

describe('Movie API – full test coverage', () => {

  describe('GET /api/movies', () => {
    test('returns an empty list initially', async () => {
      const res = await request(app)
        .get('/api/movies')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('POST /api/movies', () => {
    test('creates a movie successfully', async () => {
      const res = await request(app)
        .post('/api/movies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Interstellar',
          duration: 169,
          release_year: 2014,
          user_id: user._id
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toBe('Interstellar');
      expect(res.body.duration).toBe(169);
      expect(res.body.release_year).toBe(2014);

    });

    test('fails if title is missing', async () => {
      const res = await request(app)
        .post('/api/movies')
        .set('Authorization', `Bearer ${token}`)
        .send({ duration: 100, user_id: user._id });
      expect(res.statusCode).toBe(400);
    });

    test('fails if duration is not positive', async () => {
      const res = await request(app)
        .post('/api/movies')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Movie', duration: -10, user_id: user._id });
      expect(res.statusCode).toBe(400);
    });

    test('fails if release_year is not provided', async () => {
      const res = await request(app)
        .post('/api/movies')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Movie', duration: 100, user_id: user._id });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Release year is required');
    });

    test('fails if release_year is a future year', async () => {
      const futureYear = new Date().getFullYear() + 1; // Año futuro
      const res = await request(app)
        .post('/api/movies')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Future Movie', duration: 120, release_year: futureYear, user_id: user._id });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Release year cannot be in the future');
    });
  });

  describe('GET /api/movies/:id', () => {
    test('returns a movie by ID', async () => {
      const movie = await Movie.create({
        title: 'Interstellar',
        duration: 169,
        user_id: user._id,
      });
      const res = await request(app)
        .get(`/api/movies/${movie._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe(movie.title);
    });

    test('returns 404 if movie does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/movies/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(404);
    });

    test('returns 404 for invalid ID format', async () => {
      const res = await request(app)
        .get('/api/movies/invalid-id')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/movies/:id', () => {
    test('updates a movie successfully', async () => {
      const movie = await Movie.create({
        title: 'Interstellar',
        duration: 169,
        user_id: user._id,
      });
      const res = await request(app)
        .put(`/api/movies/${movie._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'New Title', duration: 120, user_id: user._id });

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('New Title');
      expect(res.body.duration).toBe(120);
    });

    test('fails if title is missing', async () => {
      const movie = await Movie.create({
        title: 'Interstellar',
        duration: 169,
        user_id: user._id,
      });
      const res = await request(app)
        .put(`/api/movies/${movie._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ duration: 100, user_id: user._id });
      expect(res.statusCode).toBe(400);
    });

    test('returns 404 if movie does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/movies/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated', duration: 120, user_id: user._id });
      expect(res.statusCode).toBe(404);
    });

    test('returns 404 for invalid ID format', async () => {
      const res = await request(app)
        .put('/api/movies/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test', duration: 120, user_id: user._id });
      expect(res.statusCode).toBe(404);
    });

    test('fails if duration is not positive (PUT)', async () => {
      const movie = await Movie.create({
        title: 'Interstellar',
        duration: 169,
        user_id: user._id,
      });

      const res = await request(app)
        .put(`/api/movies/${movie._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Interstellar', duration: -5, user_id: user._id });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Duration must be a positive number');
    });
  });

  describe('DELETE /api/movies/:id', () => {
    test('deletes a movie successfully', async () => {
      const movie = await Movie.create({
        title: 'Interstellar',
        duration: 169,
        user_id: user._id,
      });
      const res = await request(app)
        .delete(`/api/movies/${movie._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(204);
    });

    test('returns 404 if movie does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/movies/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(404);
    });

    test('returns 404 for invalid ID format', async () => {
      const res = await request(app)
        .delete('/api/movies/invalid-id')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(404);
    });

    test('fails if the movie does not belong to the authenticated user', async () => {
      const movie = await Movie.create({
        title: 'The Dark Knight',
        duration: 152,
        user_id: user._id,
      });

      // Crear un segundo usuario
      const secondUser = await User.create({
        name: 'Second User',
        email: 'seconduser@example.com',
        password: 'password123',
      });

      const secondUserToken = jwt.sign({ id: secondUser._id }, process.env.JWT_SECRET || 'testsecret', { expiresIn: '24h' });

      const res = await request(app)
        .delete(`/api/movies/${movie._id}`)
        .set('Authorization', `Bearer ${secondUserToken}`);

      expect(res.statusCode).toBe(404); 
      expect(res.body.message).toBe('Movie not found or unauthorized');
    });
  });

  describe('Error and edge cases', () => {
    test('GET /api/movies returns 500 when DB error occurs', async () => {
      jest.spyOn(Movie, 'find').mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .get('/api/movies')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Error fetching movies');
    });

    test('GET /api/movies/:id returns 500 when DB error occurs', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      jest.spyOn(Movie, 'findById').mockRejectedValueOnce(new Error('DB failure'));

      const res = await request(app)
        .get(`/api/movies/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Error fetching movie');
    });

    test('POST /api/movies returns 400 when Mongoose ValidationError occurs', async () => {
      const err = new Error();
      err.name = 'ValidationError';
      err.errors = { title: { message: 'Custom title error' } };
      jest.spyOn(Movie, 'create').mockRejectedValueOnce(err);

      const res = await request(app)
        .post('/api/movies')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'X', duration: 100, release_year: 2000, user_id: user._id });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Custom title error');
    });

    test('POST /api/movies returns 500 when unknown error occurs', async () => {
      jest.spyOn(Movie, 'create').mockRejectedValueOnce(new Error('DB crashed'));

      const res = await request(app)
        .post('/api/movies')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'X', duration: 100, release_year: 2000, user_id: user._id });

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Error creating movie');
    });

    test('PUT /api/movies/:id returns 400 when ValidationError during update', async () => {
      const movie = await Movie.create({ title: 'Interstellar', duration: 169, user_id: user._id });

      const err = new Error();
      err.name = 'ValidationError';
      err.errors = { duration: { message: 'Invalid duration' } };
      jest.spyOn(Movie, 'findByIdAndUpdate').mockRejectedValueOnce(err);

      const res = await request(app)
        .put(`/api/movies/${movie._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'New', duration: 120, user_id: user._id });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid duration');
    });

    test('DELETE /api/movies/:id returns 400 if movie used in showtimes', async () => {
      const movie = await Movie.create({ title: 'Interstellar', duration: 169, user_id: user._id });

      await Showtime.create({
        movie_id: movie._id,
        room_id: new mongoose.Types.ObjectId(),
        start_time: new Date(),
        end_time: new Date(Date.now() + 3600000),
        user_id: user._id,
      });

      const res = await request(app)
        .delete(`/api/movies/${movie._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Cannot delete movie because it is being used in one or more showtimes');
    });

    test('DELETE /api/movies/:id returns 500 when DB error occurs', async () => {
      const movie = await Movie.create({ title: 'Interstellar', duration: 169, user_id: user._id });

      jest.spyOn(Movie, 'findOne').mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .delete(`/api/movies/${movie._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Error deleting movie');
    });
  });

  describe('Controller unit tests for uncovered branches', () => {
    test('getAllMovies handles DB error (direct call)', async () => {
      jest.spyOn(Movie, 'find').mockRejectedValueOnce(new Error('DB error'));

      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await movieController.getAllMovies(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Error fetching movies' }));
    });

    test('getMovieById returns 404 on CastError (direct call)', async () => {
      const req = { params: { id: 'invalid' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      jest.spyOn(Movie, 'findById').mockRejectedValueOnce({ name: 'CastError' });

      await movieController.getMovieById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Movie not found' });
    });

    test('createMovie returns 400 when Mongoose ValidationError (direct call)', async () => {
      const req = { body: { title: 'X', duration: 100, release_year: 2000 }, userId: user._id };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      const err = new Error();
      err.name = 'ValidationError';
      err.errors = { title: { message: 'Controller validation error' } };
      jest.spyOn(Movie, 'create').mockRejectedValueOnce(err);

      await movieController.createMovie(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Controller validation error' });
    });

    test('updateMovie returns 400 when ValidationError during update (direct call)', async () => {
      const id = new mongoose.Types.ObjectId();
      const req = { params: { id }, body: { title: 'New', duration: 120, release_year: 2000 }, userId: user._id };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      jest.spyOn(Movie, 'findOne').mockResolvedValueOnce({ _id: id, user_id: user._id });
      const err = new Error();
      err.name = 'ValidationError';
      err.errors = { duration: { message: 'Invalid duration' } };
      jest.spyOn(Movie, 'findByIdAndUpdate').mockRejectedValueOnce(err);

      await movieController.updateMovie(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid duration' });
    });

    test('deleteMovie returns 400 when movie used in showtimes (direct call)', async () => {
      const id = new mongoose.Types.ObjectId();
      const req = { params: { id }, userId: user._id };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };

      jest.spyOn(Movie, 'findOne').mockResolvedValueOnce({ _id: id, user_id: user._id });
      jest.spyOn(Showtime, 'countDocuments').mockResolvedValueOnce(2);

      await movieController.deleteMovie(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Cannot delete movie because it is being used in one or more showtimes' }));
    });
  });
});
