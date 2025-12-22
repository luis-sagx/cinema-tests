const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const Room = require('../src/models/room.model');
const Showtime = require('../src/models/showtime.model');
const User = require('../src/models/user.model');
const jwt = require('jsonwebtoken');
const { connectTestDB } = require('../src/config/setupDB');

let token;
let user;

// Antes de todos los tests
beforeAll(async () => {
  await connectTestDB();

  await User.deleteMany({});
  await Room.deleteMany({});

  user = await User.create({
    name: 'Test User',
    email: 'testuser3@example.com',
    password: 'password123',
  });

  token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'testsecret', {
    expiresIn: '24h',
  });
});

beforeEach(async () => {
  await Room.deleteMany({});
  await Showtime.deleteMany({});
});

afterEach(() => {
  jest.restoreAllMocks();
});

afterAll(async () => {
  await Room.deleteMany({});
  await Showtime.deleteMany({});
  await mongoose.connection.close();
});

// Helper para requests autenticadas
const authRequest = (req) => req.set('Authorization', `Bearer ${token}`);

describe('Room API – full test coverage', () => {

  // ================= GET /api/rooms =================
  describe('GET /api/rooms', () => {
    test('returns an empty list initially', async () => {
      const res = await authRequest(request(app).get('/api/rooms'));
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    test('returns a list of rooms', async () => {
      await Room.create({ name: 'Room A', capacity: 50, type: '2D', user_id: user._id });
      const res = await authRequest(request(app).get('/api/rooms'));
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Room A');
    });

    test('returns 500 on DB error', async () => {
      jest.spyOn(Room, 'find').mockImplementationOnce(() => { throw new Error('boom'); });
      const res = await authRequest(request(app).get('/api/rooms'));
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Error retrieving rooms');
    });
  });

  // ================= POST /api/rooms =================
  describe('POST /api/rooms', () => {
    test('creates a room successfully', async () => {
      const res = await authRequest(request(app).post('/api/rooms').send({
        name: 'Main Room',
        capacity: 100,
        type: '3D',
        user_id: user._id,
      }));
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe('Main Room');
    });

    test('fails if name is missing', async () => {
      const res = await authRequest(request(app).post('/api/rooms').send({
        capacity: 50,
        type: '2D',
        user_id: user._id,
      }));
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Name is required');
    });

    test('fails if capacity is invalid', async () => {
      const res1 = await authRequest(request(app).post('/api/rooms').send({
        name: 'Test Room',
        type: '2D',
        user_id: user._id,
      }));
      expect(res1.statusCode).toBe(400);
      expect(res1.body.message).toBe('The capacity must be a positive number.');

      const res2 = await authRequest(request(app).post('/api/rooms').send({
        name: 'Test Room',
        capacity: -5,
        type: '2D',
        user_id: user._id,
      }));
      expect(res2.statusCode).toBe(400);
      expect(res2.body.message).toBe('The capacity must be a positive number.');
    });

    test('fails if type is missing or invalid', async () => {
      const res1 = await authRequest(request(app).post('/api/rooms').send({
        name: 'Test Room',
        capacity: 50,
        user_id: user._id,
      }));
      expect(res1.statusCode).toBe(400);
      expect(res1.body.message).toBe('Type is required');

      const res2 = await authRequest(request(app).post('/api/rooms').send({
        name: 'Test Room',
        capacity: 50,
        type: '4D',
        user_id: user._id,
      }));
      expect(res2.statusCode).toBe(400);
      expect(res2.body.message).toBe('Invalid type, must be 2D, 3D or VIP');
    });

    test('fails if room name is duplicated', async () => {
      await Room.create({ name: 'Duplicate', capacity: 80, type: '2D', user_id: user._id });
      const res = await authRequest(request(app).post('/api/rooms').send({
        name: 'Duplicate',
        capacity: 60,
        type: '3D',
        user_id: user._id,
      }));
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('The name of the room already exists');
    });

    test('fails if capacity is null', async () => {
      const res = await authRequest(request(app).post('/api/rooms').send({
        name: 'Null Capacity Room',
        capacity: null,
        type: '2D',
        user_id: user._id,
      }));
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Capacity is required');
    });

    test('returns 500 on unexpected DB error', async () => {
      jest.spyOn(Room, 'create').mockImplementationOnce(() => { throw new Error('boom'); });
      const res = await authRequest(request(app).post('/api/rooms').send({
        name: 'Main Room',
        capacity: 100,
        type: '3D',
        user_id: user._id,
      }));
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Error creating room');
    });
  });

  // ================= GET /api/rooms/:id =================
  describe('GET /api/rooms/:id', () => {
    test('returns a room by ID', async () => {
      const room = await Room.create({ name: 'Room GET', capacity: 60, type: 'VIP', user_id: user._id });
      const res = await authRequest(request(app).get(`/api/rooms/${room._id}`));
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Room GET');
    });

    test('returns 404 if room does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await authRequest(request(app).get(`/api/rooms/${fakeId}`));
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain('Room not found');
    });

    test('returns 400 for invalid ID', async () => {
      const res = await authRequest(request(app).get('/api/rooms/invalid-id'));
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid ID');
    });

    test('returns 500 on DB error', async () => {
      jest.spyOn(Room, 'findOne').mockImplementationOnce(() => { throw new Error('boom'); });
      const fakeId = new mongoose.Types.ObjectId();
      const res = await authRequest(request(app).get(`/api/rooms/${fakeId}`));
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Error retrieving room');
    });
  });

  // ================= PUT /api/rooms/:id =================
  describe('PUT /api/rooms/:id', () => {
    test('updates a room successfully', async () => {
      const room = await Room.create({ name: 'Old Room', capacity: 40, type: '2D', user_id: user._id });
      const res = await authRequest(request(app).put(`/api/rooms/${room._id}`).send({
        name: 'Updated Room',
        capacity: 45,
      }));
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Updated Room');
      expect(res.body.capacity).toBe(45);
    });

    test('fails if no fields are provided', async () => {
      const room = await Room.create({ name: 'Empty Update', capacity: 70, type: 'VIP', user_id: user._id });
      const res = await authRequest(request(app).put(`/api/rooms/${room._id}`).send({}));
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('At least one field (name, capacity, type) is required to update');
    });

    test('returns 404 if room does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await authRequest(request(app).put(`/api/rooms/${fakeId}`).send({ capacity: 90 }));
      expect(res.statusCode).toBe(404);
    });

    test('returns 400 for invalid ID', async () => {
      const res = await authRequest(request(app).put('/api/rooms/invalid-id').send({ capacity: 50 }));
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid ID');
    });

    test('returns 404 if update does not return the room (race condition)', async () => {
      const room = await Room.create({ name: 'Race Room', capacity: 40, type: '2D', user_id: user._id });
      jest.spyOn(Room, 'findByIdAndUpdate').mockImplementationOnce(() => null);
      const res = await authRequest(request(app).put(`/api/rooms/${room._id}`).send({ name: 'New Name' }));
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Room not found');
    });

    test('returns 500 on DB error during update', async () => {
      jest.spyOn(Room, 'findOne').mockImplementationOnce(() => { throw new Error('boom'); });
      const fakeId = new mongoose.Types.ObjectId();
      const res = await authRequest(request(app).put(`/api/rooms/${fakeId}`).send({ capacity: 90 }));
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Error updating the room');
    });
  });

  // ================= DELETE /api/rooms/:id =================
  describe('DELETE /api/rooms/:id', () => {
    test('deletes a room successfully', async () => {
      const room = await Room.create({ name: 'Delete Room', capacity: 50, type: '3D', user_id: user._id });
      const res = await authRequest(request(app).delete(`/api/rooms/${room._id}`));
      expect(res.statusCode).toBe(200);
    });

    test('returns 404 if room does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await authRequest(request(app).delete(`/api/rooms/${fakeId}`));
      expect(res.statusCode).toBe(404);
    });

    test('returns 400 for invalid ID', async () => {
      const res = await authRequest(request(app).delete('/api/rooms/invalid-id'));
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid ID');
    });

    test('cannot delete a room used in showtimes (movie_id check)', async () => {
      const room = await Room.create({ name: 'Used Room', capacity: 30, type: '2D', user_id: user._id });
      await Showtime.create({
        movie_id: room._id,
        room_id: room._id,
        start_time: new Date(),
        end_time: new Date(Date.now() + 3600000),
        user_id: user._id,
      });
      const res = await authRequest(request(app).delete(`/api/rooms/${room._id}`));
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Cannot delete room because it is being used in one or more showtimes');
    });

    test('returns 500 on DB error during delete', async () => {
      jest.spyOn(Room, 'findOne').mockImplementationOnce(() => { throw new Error('boom'); });
      const fakeId = new mongoose.Types.ObjectId();
      const res = await authRequest(request(app).delete(`/api/rooms/${fakeId}`));
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Error deleting room');
    });
  });
});
