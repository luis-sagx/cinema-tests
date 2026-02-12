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

const BASE_USER = {
  name: 'k6-user',
  email: 'k6user@test.com',
  password: 'password123',
};

// ================== SETUP ==================
export function setup() {
  // ---------- REGISTER ----------
  const registerRes = http.post(
    `${BASE_URL}/users/register`,
    JSON.stringify(BASE_USER),
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (registerRes.status !== 201 && registerRes.status !== 400) {
    throw new Error(`Unexpected register status: ${registerRes.status}`);
  }

  // ---------- LOGIN ----------
  const loginRes = http.post(
    `${BASE_URL}/users/login`,
    JSON.stringify({
      email: BASE_USER.email,
      password: BASE_USER.password,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(loginRes, {
    'login ok (200)': (r) => r.status === 200,
    'token present': (r) => JSON.parse(r.body).token !== undefined,
  });

  const body = JSON.parse(loginRes.body);

  return {
    token: body.token,
    userId: body.user.id,
  };
}

// ================== TEST ==================
export default function (data) {
  const headers = {
    Authorization: `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  /* ---------- GET ALL USERS ---------- */
  const getAllRes = http.get(`${BASE_URL}/users`, { headers });
  check(getAllRes, {
    'GET /users → 200': (r) => r.status === 200,
  });

  sleep(0.2);

  /* ---------- GET USER BY ID ---------- */
  const getByIdRes = http.get(
    `${BASE_URL}/users/${data.userId}`,
    { headers }
  );
  check(getByIdRes, {
    'GET /users/:id → 200': (r) => r.status === 200,
  });

  sleep(0.3);

  /* ---------- CONTROLLED WRITES ---------- */
  if (__ITER % 5 === 0) {
    const uniqueEmail = `k6temp_${__VU}_${Date.now()}@test.com`;
    
    /* ----------- CREATE USERS ----------- */
    const createRes = http.post(
      `${BASE_URL}/users`,
      JSON.stringify({
        name: 'k6-temp-user',
        email: uniqueEmail,
        password: 'password123',
      }),
      { headers }
    );

    check(createRes, {
      'POST /users → 201': (r) => r.status === 201,
    });

    const createdUserId = createRes.json('id');

    sleep(0.2);

    /* ----------- UPDATE USERS ----------- */
    const updateRes = http.put(
      `${BASE_URL}/users/${createdUserId}`,
      JSON.stringify({
        name: 'k6-updated-user',
        email: uniqueEmail,
      }),
      { headers }
    );

    check(updateRes, {
      'PUT /users/:id → 200': (r) => r.status === 200,
    });

    sleep(0.2);

    /* ----------- DELETE USERS ----------- */
    const deleteRes = http.del(
      `${BASE_URL}/users/${createdUserId}`,
      null,
      { headers }
    );

    check(deleteRes, {
      'DELETE /users/:id → 204': (r) => r.status === 204,
    });
  }

  sleep(0.4);
}
