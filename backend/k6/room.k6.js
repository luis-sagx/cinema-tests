import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 5 },
    { duration: '40s', target: 5 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = 'https://cinema-tests.onrender.com/api';

const USER = {
  name: 'k6-room-user',
  email: 'k6room@test.com',
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

  return { token };
}

// ================== TEST ==================
export default function (data) {
  const headers = {
    Authorization: `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  /* ---------- GET ALL ROOMS ---------- */
  const getAllRes = http.get(`${BASE_URL}/rooms`, { headers });
  check(getAllRes, {
    'GET /rooms → 200': (r) => r.status === 200,
  });

  sleep(0.3);

  /* ---------- CREATE ROOM ---------- */
  const createRes = http.post(
    `${BASE_URL}/rooms`,
    JSON.stringify({
      name: `k6-room-${__VU}-${__ITER}-${Date.now()}`,
      capacity: 100,
      type: '2D',
    }),
    { headers }
  );

  check(createRes, {
    'POST /rooms → 201': (r) => r.status === 201,
  });

  const roomId = createRes.json('_id');

  sleep(0.2);

  /* ---------- GET ROOM BY ID (NEW) ---------- */
  const getByIdRes = http.get(
    `${BASE_URL}/rooms/${roomId}`,
    { headers }
  );

  check(getByIdRes, {
    'GET /rooms/:id → 200': (r) => r.status === 200,
  });

  sleep(0.2);

  /* ---------- UPDATE ROOM ---------- */
  const updateRes = http.put(
    `${BASE_URL}/rooms/${roomId}`,
    JSON.stringify({
      name: `k6-room-updated-${__VU}-${__ITER}`,
      capacity: 120,
      type: '3D',
    }),
    { headers }
  );

  check(updateRes, {
    'PUT /rooms/:id → 200': (r) => r.status === 200,
  });

  sleep(0.3);

  /* ---------- DELETE ROOM ---------- */
  const deleteRes = http.del(
    `${BASE_URL}/rooms/${roomId}`,
    null,
    { headers }
  );

  check(deleteRes, {
    'DELETE /rooms/:id → 200 or 204': (r) =>
      r.status === 200 || r.status === 204,
  });

  sleep(0.5);
}
