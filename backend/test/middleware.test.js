require('dotenv').config();
const jwt = require('jsonwebtoken');
const request = require('supertest'); // For simulating HTTP requests
const express = require('express');
const authMiddleware = require('../src/middleware/auth.middleware'); // Make sure to have the correct path
const User = require('../src/models/user.model');
const mongoose = require('mongoose');
const { connectTestDB } = require('../src/config/setupDB');

// Express app setup for testing
const app = express();
app.use(express.json());
app.use(authMiddleware); // Use the middleware

// Define a protected route to test
app.get('/protected', (req, res) => {
  res.status(200).json({ message: 'Success', userId: req.userId });
});

describe('AuthMiddleware', () => {
  let token;
  let user;

  beforeAll(async () => {
    await connectTestDB();
    await User.deleteMany({});
    user = await User.create({
      name: 'Test User',
      email: 'testuser5@example.com',
      password: 'password123',
    });

    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'testsecret', {
      expiresIn: '24h',
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('should return 401 if no token is provided', async () => {
    const response = await request(app).get('/protected');
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  test('should return 403 if the token is invalid', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalidtoken');
    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Invalid token');
  });

  test('should return 200 if the token is valid', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Success');
    expect(response.body.userId).toBe(user._id.toString()); // Ensure that the userId is correct
  });
});
