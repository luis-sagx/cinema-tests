const request = require('supertest');
const app = require('../src/app');

describe('App.js - configuración general', () => {

  // ---------- 404 ----------
  test('Debe responder 404 para rutas no existentes', async () => {
    // Act
    const res = await request(app).get('/ruta-inexistente');

    // Assert
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: 'Route not found'
    });
  });

  // ---------- CORS ----------
  describe('CORS', () => {

    test('Permite requests sin Origin', async () => {
      // Act
      const res = await request(app).options('/api/movies');

      // Assert
      expect(res.statusCode).toBe(204); // preflight OK
    });

    test('Permite origin válido', async () => {
      // Act
      const res = await request(app)
        .options('/api/movies')
        .set('Origin', 'http://localhost:4200')
        .set('Access-Control-Request-Method', 'GET');

      // Assert
      expect(res.statusCode).toBe(204);
    });

    test('Bloquea origin no permitido', async () => {
      // Act
      const res = await request(app)
        .options('/api/movies')
        .set('Origin', 'https://evil.com')
        .set('Access-Control-Request-Method', 'GET');

      // Assert
      expect(res.statusCode).toBe(500);
    });

  });

});
