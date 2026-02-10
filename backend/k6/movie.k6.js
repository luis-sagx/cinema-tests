import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 5 },
    { duration: '40s', target: 5 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = 'https://cinema-tests.onrender.com/api';

const USER = {
  name: 'k6-movie-user',
  email: 'k6movie@test.com',
  password: 'password123',
};

// ================== SETUP ==================
export function setup() {
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
    'login success (200)': (r) => r.status === 200,
    'token received': (r) => JSON.parse(r.body).token !== undefined,
  });

  return { token: JSON.parse(loginRes.body).token };
}

// ================== TEST ==================
export default function (data) {
  const headers = {
    Authorization: `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  // ---------- GET ALL ----------
  let res = http.get(`${BASE_URL}/movies`, { headers });
  check(res, {
    'GET /movies → 200': (r) => r.status === 200,
  });

  sleep(0.3);

  // ---------- CREATE ----------
  const createRes = http.post(
    `${BASE_URL}/movies`,
    JSON.stringify({
      title: `Load Test Movie ${__VU}-${Date.now()}`,
      duration: 120,
      release_year: 2024,
    }),
    { headers }
  );

  check(createRes, {
    'POST /movies → 201 or 200': (r) =>
      r.status === 201 || r.status === 200,
  });

  const movieId = createRes.json('_id');

  sleep(0.3);

  // ---------- UPDATE ----------
  const updateRes = http.put(
    `${BASE_URL}/movies/${movieId}`,
    JSON.stringify({
      title: 'Updated Movie',
      duration: 130,
      release_year: 2024,
    }),
    { headers }
  );

  check(updateRes, {
    'PUT /movies/:id → 200': (r) => r.status === 200,
  });

  sleep(0.3);

  // ---------- DELETE ----------
  const deleteRes = http.del(
    `${BASE_URL}/movies/${movieId}`,
    null,
    { headers }
  );

  check(deleteRes, {
    'DELETE /movies/:id → 204 or 200': (r) =>
      r.status === 204 || r.status === 200,
  });

  sleep(0.5);
}
