import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 5 },
    { duration: '40s', target: 5 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<600'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = 'https://cinema-tests.onrender.com/api';

const USER = {
  name: 'k6-showtime-user',
  email: 'k6showtime@test.com',
  password: 'password123',
};

// ================== SETUP ==================
export function setup() {
  // ---------- LOGIN / REGISTER ----------
  let loginRes = http.post(
    `${BASE_URL}/users/login`,
    JSON.stringify({
      email: USER.email,
      password: USER.password,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (loginRes.status === 401 || loginRes.status === 404) {
    http.post(
      `${BASE_URL}/users/register`,
      JSON.stringify(USER),
      { headers: { 'Content-Type': 'application/json' } }
    );

    loginRes = http.post(
      `${BASE_URL}/users/login`,
      JSON.stringify({
        email: USER.email,
        password: USER.password,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  check(loginRes, {
    'login ok (200)': (r) => r.status === 200,
  });

  const token = JSON.parse(loginRes.body).token;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // ---------- CREATE MOVIE (COMPARTIDA) ----------
  const movieRes = http.post(
    `${BASE_URL}/movies`,
    JSON.stringify({
      title: `k6-movie-${Date.now()}`,
      duration: 120,
      release_year: 2024,
    }),
    { headers }
  );

  check(movieRes, {
    'movie created': (r) => r.status === 200 || r.status === 201,
  });

  const movieId = movieRes.json('_id');

  return { token, movieId };
}

// ================== TEST ==================
export default function (data) {
  const headers = {
    Authorization: `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  // ---------- GET ALL SHOWTIMES ----------
  let res = http.get(`${BASE_URL}/showtimes`, { headers });
  check(res, {
    'GET /showtimes → 200': (r) => r.status === 200,
  });

  sleep(0.3);

  // ---------- CREATE ROOM (POR ITERACIÓN) ----------
  const roomRes = http.post(
    `${BASE_URL}/rooms`,
    JSON.stringify({
      name: `k6-room-${__VU}-${__ITER}-${Date.now()}`,
      capacity: 100,
      type: '2D',
    }),
    { headers }
  );

  check(roomRes, {
    'room created': (r) => r.status === 201,
  });

  const roomId = roomRes.json('_id');

  sleep(0.2);

  // ---------- UNIQUE TIMES ----------
  const baseTime =
    Date.now() +
    (__VU * 60 * 60 * 1000) +
    (__ITER * 10 * 60 * 1000);

  const startTime = new Date(baseTime);
  const endTime = new Date(baseTime + 60 * 60 * 1000);

  // ---------- CREATE SHOWTIME ----------
  const createRes = http.post(
    `${BASE_URL}/showtimes`,
    JSON.stringify({
      movie_id: data.movieId,
      room_id: roomId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
    }),
    { headers }
  );

  check(createRes, {
    'POST /showtimes → 201': (r) => r.status === 201,
  });

  const showtimeId = createRes.json('_id');

  sleep(0.3);

  // ---------- UPDATE SHOWTIME ----------
  const updatedStart = new Date(baseTime + 2 * 60 * 60 * 1000);
  const updatedEnd = new Date(baseTime + 3 * 60 * 60 * 1000);

  const updateRes = http.put(
    `${BASE_URL}/showtimes/${showtimeId}`,
    JSON.stringify({
      start_time: updatedStart.toISOString(),
      end_time: updatedEnd.toISOString(),
    }),
    { headers }
  );

  check(updateRes, {
    'PUT /showtimes/:id → 200': (r) => r.status === 200,
  });

  sleep(0.3);

  // ---------- DELETE SHOWTIME ----------
  const deleteRes = http.del(
    `${BASE_URL}/showtimes/${showtimeId}`,
    null,
    { headers }
  );

  check(deleteRes, {
    'DELETE /showtimes/:id → 200': (r) => r.status === 200,
  });

  sleep(0.2);

  // ---------- DELETE ROOM ----------
  http.del(`${BASE_URL}/rooms/${roomId}`, null, { headers });

  sleep(0.4);
}

// ================== TEARDOWN ==================
export function teardown(data) {
  const headers = {
    Authorization: `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  // ---------- DELETE MOVIE ----------
  http.del(`${BASE_URL}/movies/${data.movieId}`, null, { headers });
}
