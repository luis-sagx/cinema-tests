const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./../src/app');
const User = require('./../src/models/user.model');
const { connectTestDB } = require('../src/config/setupDB');

// Aumentar timeout por si la conexión a la DB es lenta
jest.setTimeout(30000);

beforeAll(async () => {
  await connectTestDB();
  // Asegurarnos de empezar con una colección limpia
  await User.deleteMany({});
});

beforeEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('User API – full test coverage', () => {

  /* ===========================
     GET /api/users
  ============================ */
  describe('GET /api/users', () => {
    test('returns empty array initially', async () => {
      // Forzar limpieza local por si otros suites crean usuarios en paralelo
      const res = await request(app).get('/api/users');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('does not expose passwords', async () => {
      await request(app).post('/api/users').send({
        name: 'Ana',
        email: 'ana@mail.com',
        password: 'secret123'
      });

      const res = await request(app).get('/api/users');

      expect(res.statusCode).toBe(200);
      res.body.forEach(user => {
        expect(user).not.toHaveProperty('password');
      });
    });
  });

  /* ===========================
     POST /api/users
  ============================ */
  describe('POST /api/users', () => {
    test('creates user successfully', async () => {
      const res = await request(app).post('/api/users').send({
        name: 'Luis',
        email: 'luis@mail.com',
        password: 'secret123'
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        name: 'Luis',
        email: 'luis@mail.com'
      });
      expect(res.body).toHaveProperty('id');
      expect(res.body).not.toHaveProperty('password');
    });

    test('fails with missing fields', async () => {
      const res = await request(app).post('/api/users').send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    test('fails with duplicate email', async () => {
      await request(app).post('/api/users').send({
        name: 'A',
        email: 'dup@mail.com',
        password: 'secret123'
      });

      const res = await request(app).post('/api/users').send({
        name: 'B',
        email: 'dup@mail.com',
        password: 'secret123'
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Email already exists');
    });

    test('handles ValidationError from create', async () => {
      const findSpy = jest.spyOn(User, 'findOne').mockResolvedValue(null);
      const err = new Error('validation');
      err.name = 'ValidationError';
      err.errors = { name: { message: 'Name required' } };
      const createSpy = jest.spyOn(User, 'create').mockRejectedValue(err);

      try {
        const res = await request(app).post('/api/users').send({
          name: 'X', email: 'x@mail.com', password: 'secret123'
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Name required');
      } finally {
        findSpy.mockRestore();
        createSpy.mockRestore();
      }
    });

    test('handles duplicate key thrown by create', async () => {
      const findSpy = jest.spyOn(User, 'findOne').mockResolvedValue(null);
      const err = new Error('dup');
      err.code = 11000;
      const createSpy = jest.spyOn(User, 'create').mockRejectedValue(err);

      try {
        const res = await request(app).post('/api/users').send({
          name: 'Y', email: 'y@mail.com', password: 'secret123'
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Email already exists');
      } finally {
        findSpy.mockRestore();
        createSpy.mockRestore();
      }
    });

    test('handles unexpected error and returns 500', async () => {
      const findSpy = jest.spyOn(User, 'findOne').mockResolvedValue(null);
      const createSpy = jest.spyOn(User, 'create').mockRejectedValue(new Error('boom'));

      try {
        const res = await request(app).post('/api/users').send({
          name: 'Z', email: 'z@mail.com', password: 'secret123'
        });

        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('message');
      } finally {
        findSpy.mockRestore();
        createSpy.mockRestore();
      }
    });
  });

  /* ===========================
     POST /api/users/register
  ============================ */
  describe('POST /api/users/register', () => {
    test('registers user and returns token', async () => {
      const res = await request(app).post('/api/users/register').send({
        name: 'Alba',
        email: 'alba@mail.com',
        password: 'secret123'
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toMatchObject({
        email: 'alba@mail.com'
      });
    });

    test('rejects short password', async () => {
      const res = await request(app).post('/api/users/register').send({
        name: 'Test',
        email: 'test@mail.com',
        password: '123'
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Password must be at least 6 characters');
    });

    test('rejects duplicate email', async () => {
      await request(app).post('/api/users/register').send({
        name: 'One',
        email: 'dup2@mail.com',
        password: 'secret123'
      });

      const res = await request(app).post('/api/users/register').send({
        name: 'Two',
        email: 'dup2@mail.com',
        password: 'secret123'
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Email already exists');
    });

    test('rejects missing fields', async () => {
      const res = await request(app).post('/api/users/register').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Name, email and password are required');
    });

    test('handles ValidationError from create', async () => {
      const findSpy = jest.spyOn(User, 'findOne').mockResolvedValue(null);
      const err = new Error('validation');
      err.name = 'ValidationError';
      err.errors = { email: { message: 'Invalid email' } };
      const createSpy = jest.spyOn(User, 'create').mockRejectedValue(err);

      try {
        const res = await request(app).post('/api/users/register').send({
          name: 'X', email: 'x@mail.com', password: 'secret123'
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid email');
      } finally {
        findSpy.mockRestore();
        createSpy.mockRestore();
      }
    });

    test('handles duplicate key error thrown by create', async () => {
      const findSpy = jest.spyOn(User, 'findOne').mockResolvedValue(null);
      const err = new Error('dup');
      err.code = 11000;
      const createSpy = jest.spyOn(User, 'create').mockRejectedValue(err);

      try {
        const res = await request(app).post('/api/users/register').send({
          name: 'Y', email: 'y@mail.com', password: 'secret123'
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Email already exists');
      } finally {
        findSpy.mockRestore();
        createSpy.mockRestore();
      }
    });

    test('handles unexpected errors and returns 500', async () => {
      const findSpy = jest.spyOn(User, 'findOne').mockResolvedValue(null);
      const createSpy = jest.spyOn(User, 'create').mockRejectedValue(new Error('boom'));

      try {
        const res = await request(app).post('/api/users/register').send({
          name: 'Z', email: 'z@mail.com', password: 'secret123'
        });

        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('message');
      } finally {
        findSpy.mockRestore();
        createSpy.mockRestore();
      }
    });

  });

  /* ===========================
     POST /api/users/login
  ============================ */
  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/users/register').send({
        name: 'LoginUser',
        email: 'login@mail.com',
        password: 'secret123'
      });
    });

    test('logs in successfully', async () => {
      const res = await request(app).post('/api/users/login').send({
        email: 'login@mail.com',
        password: 'secret123'
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('login@mail.com');
    });

    test('fails with wrong password', async () => {
      const res = await request(app).post('/api/users/login').send({
        email: 'login@mail.com',
        password: 'wrong'
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });

    test('fails with missing fields', async () => {
      const res = await request(app).post('/api/users/login').send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Email and password are required');
    });

    test('fails when user does not exist', async () => {
      const res = await request(app).post('/api/users/login').send({
        email: 'noone@mail.com', password: 'whatever'
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });

    test('handles DB error and returns 500', async () => {
      const spy = jest.spyOn(User, 'findOne').mockRejectedValue(new Error('DB fail'));

      try {
        const res = await request(app).post('/api/users/login').send({
          email: 'login@mail.com', password: 'secret123'
        });

        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('message');
      } finally {
        spy.mockRestore();
      }
    });
  });

  /* ===========================
     GET /api/users/:id
  ============================ */
  describe('GET /api/users/:id', () => {
    test('returns a user', async () => {
      const create = await request(app).post('/api/users').send({
        name: 'Maria',
        email: 'maria@mail.com',
        password: 'secret123'
      });

      const res = await request(app).get(`/api/users/${create.body.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe('maria@mail.com');
      expect(res.body).not.toHaveProperty('password');
    });

    test('returns 404 for non-existing user', async () => {
      const id = new mongoose.Types.ObjectId();

      const res = await request(app).get(`/api/users/${id}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('User not found');
    });

    test('returns 404 for invalid id format', async () => {
      const res = await request(app).get('/api/users/invalid-id');
      expect(res.statusCode).toBe(404);
    });

    test('handles DB error and returns 500', async () => {
      const selectSpy = jest.fn().mockRejectedValue(new Error('DB error'));
      const spy = jest.spyOn(User, 'findById').mockReturnValue({ select: selectSpy });

      try {
        const id = new mongoose.Types.ObjectId();
        const res = await request(app).get(`/api/users/${id}`);
        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('message');
      } finally {
        spy.mockRestore();
      }
    });
  });

  /* ===========================
     PUT /api/users/:id
  ============================ */
  describe('PUT /api/users/:id', () => {
    test('updates user successfully', async () => {
      const create = await request(app).post('/api/users').send({
        name: 'Old',
        email: 'old@mail.com',
        password: 'secret123'
      });

      const res = await request(app)
        .put(`/api/users/${create.body.id}`)
        .send({ name: 'New', email: 'new@mail.com' });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('New');
      expect(res.body.email).toBe('new@mail.com');
    });

    test('rejects duplicate email', async () => {
      await request(app).post('/api/users').send({
        name: 'A',
        email: 'a@mail.com',
        password: 'secret123'
      });

      const b = await request(app).post('/api/users').send({
        name: 'B',
        email: 'b@mail.com',
        password: 'secret123'
      });

      const res = await request(app)
        .put(`/api/users/${b.body.id}`)
        .send({ name: 'B', email: 'a@mail.com' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Email already exists');
    });

    test('rejects short password on update', async () => {
      const create = await request(app).post('/api/users').send({
        name: 'Test',
        email: 'test@mail.com',
        password: 'secret123'
      });

      const res = await request(app)
        .put(`/api/users/${create.body.id}`)
        .send({
          name: 'Test',
          email: 'test@mail.com',
          password: '123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Password must be at least 6 characters');
    });

    test('rejects missing name/email', async () => {
      const create = await request(app).post('/api/users').send({
        name: 'Need', email: 'need@mail.com', password: 'secret123'
      });

      const res = await request(app)
        .put(`/api/users/${create.body.id}`)
        .send({ name: '', email: '' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Name and email are required');
    });

    test('updates password and hits hashing branch', async () => {
      const create = await request(app).post('/api/users').send({
        name: 'Pwd', email: 'pwd@mail.com', password: 'secret123'
      });

      const res = await request(app)
        .put(`/api/users/${create.body.id}`)
        .send({ name: 'Pwd', email: 'pwd@mail.com', password: 'newsecret' });

      expect(res.statusCode).toBe(200);
      expect(res.body).not.toHaveProperty('password');
    });

    test('returns 404 when updating non-existing user', async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await request(app).put(`/api/users/${id}`).send({ name: 'X', email: 'x@mail.com' });
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('User not found');
    });

    test('returns 404 for invalid id format (CastError)', async () => {
      const res = await request(app).put('/api/users/invalid-id').send({ name: 'X', email: 'x@mail.com' });
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('User not found');
    });

    test('handles ValidationError thrown from findByIdAndUpdate', async () => {
      const err = Object.assign(new Error('v'), { name: 'ValidationError', errors: { email: { message: 'Invalid' } } });
      const selectSpy = jest.fn().mockRejectedValueOnce(err);
      const spy = jest.spyOn(User, 'findByIdAndUpdate').mockReturnValue({ select: selectSpy });

      try {
        const id = new mongoose.Types.ObjectId();
        const res = await request(app).put(`/api/users/${id}`).send({ name: 'X', email: 'x@mail.com' });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid');
      } finally {
        spy.mockRestore();
      }
    });

    test('handles duplicate key thrown from findByIdAndUpdate', async () => {
      const err = Object.assign(new Error('dup'), { code: 11000 });
      const selectSpy = jest.fn().mockRejectedValueOnce(err);
      const spy = jest.spyOn(User, 'findByIdAndUpdate').mockReturnValue({ select: selectSpy });

      try {
        const id = new mongoose.Types.ObjectId();
        const res = await request(app).put(`/api/users/${id}`).send({ name: 'X', email: 'x@mail.com' });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Email already exists');
      } finally {
        spy.mockRestore();
      }
    });

    test('handles unexpected error during update and returns 500', async () => {
      const selectSpy = jest.fn().mockRejectedValueOnce(new Error('boom'));
      const spy = jest.spyOn(User, 'findByIdAndUpdate').mockReturnValue({ select: selectSpy });

      try {
        const id = new mongoose.Types.ObjectId();
        const res = await request(app).put(`/api/users/${id}`).send({ name: 'X', email: 'x@mail.com' });
        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('message');
      } finally {
        spy.mockRestore();
      }
    });

  });

  /* ===========================
     DELETE /api/users/:id
  ============================ */
  describe('DELETE /api/users/:id', () => {
    test('deletes user successfully', async () => {
      const create = await request(app).post('/api/users').send({
        name: 'Delete',
        email: 'delete@mail.com',
        password: 'secret123'
      });

      const res = await request(app).delete(`/api/users/${create.body.id}`);
      expect(res.statusCode).toBe(204);

      const get = await request(app).get(`/api/users/${create.body.id}`);
      expect(get.statusCode).toBe(404);
    });

    test('returns 404 for invalid id', async () => {
      const res = await request(app).delete('/api/users/invalid-id');
      expect(res.statusCode).toBe(404);
    });

    test('returns 404 when deleting non-existing user', async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/users/${id}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('User not found');
    });

    test('handles DB error and returns 500 on delete', async () => {
      const spy = jest.spyOn(User, 'findByIdAndDelete').mockRejectedValue(new Error('DB fail'));

      try {
        const id = new mongoose.Types.ObjectId();
        const res = await request(app).delete(`/api/users/${id}`);
        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('message');
      } finally {
        spy.mockRestore();
      }
    });
  });

  /* ===========================
     Database error handling
  ============================ */
  test('handles database errors and returns 500', async () => {
    const spy = jest.spyOn(User, 'find').mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('DB error'))
    });

    try {
      const res = await request(app).get('/api/users');

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message');
    } finally {
      spy.mockRestore();
    }
  });

});
