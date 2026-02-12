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
  name: 'k6-showtime-user',
  email: 'k6showtime@test.com',
  password: 'password123',
};

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
    'login ok': (r) => r.status === 200,
  });

  const token = loginRes.json('token');

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // ---------- CREATE MOVIE (shared, cleaned later) ----------
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
    'movie created': (r) => r.status === 201 || r.status === 200,
  });

  return {
    token,
    movieId: movieRes.json('_id'),
  };
}

/* =========================
   TEST 
========================= */
export default function (data) {
  const headers = {
    Authorization: `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  /* ---------- CREATE ROOM ---------- */
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

  const dayOffset = (__VU * 10) + __ITER;

  const startDate = new Date();
  startDate.setUTCDate(startDate.getUTCDate() + dayOffset);
  startDate.setUTCHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setUTCHours(23, 59, 59, 999);

    /* ---------- CREATE SHOWTIME ---------- */
  const createRes = http.post(
    `${BASE_URL}/showtimes`,
    JSON.stringify({
      movie_id: data.movieId,
      room_id: roomId,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
    }),
    { headers }
  );

  check(createRes, {
    'showtime created': (r) => r.status === 201,
  });

  const showtimeId = createRes.json('_id');

  sleep(0.2);

  /* ---------- GET ALL SHOWTIMES  ---------- */
  const getAllRes = http.get(`${BASE_URL}/showtimes`, { headers });
  check(getAllRes, {
    'GET /showtimes → 200': (r) => r.status === 200,
  });

  sleep(0.2);

  /* ---------- GET SHOWTIME BY ID  ---------- */
  const getByIdRes = http.get(
    `${BASE_URL}/showtimes/${showtimeId}`,
    { headers }
  );

  check(getByIdRes, {
    'GET /showtimes/:id → 200': (r) => r.status === 200,
  });

  sleep(0.2);


  /* ---------- UPDATE SHOWTIME (new day, same logic) ---------- */
  const updatedStart = new Date(startDate);
  updatedStart.setUTCDate(updatedStart.getUTCDate() + 1);
  updatedStart.setUTCHours(0, 0, 0, 0);

  const updatedEnd = new Date(updatedStart);
  updatedEnd.setUTCHours(23, 59, 59, 999);

  const updateRes = http.put(
    `${BASE_URL}/showtimes/${showtimeId}`,
    JSON.stringify({
      start_time: updatedStart.toISOString(),
      end_time: updatedEnd.toISOString(),
    }),
    { headers }
  );

  check(updateRes, {
    'showtime updated': (r) => r.status === 200,
  });

  sleep(0.3);

  /* ---------- DELETE SHOWTIME ---------- */
  const deleteShowtimeRes = http.del(
    `${BASE_URL}/showtimes/${showtimeId}`,
    null,
    { headers }
  );

  check(deleteShowtimeRes, {
    'showtime deleted': (r) => r.status === 200 || r.status === 204,
  });

  sleep(0.2);

  /* ---------- DELETE ROOM ---------- */
  const deleteRoomRes = http.del(
    `${BASE_URL}/rooms/${roomId}`,
    null,
    { headers }
  );

  check(deleteRoomRes, {
    'room deleted': (r) => r.status === 200 || r.status === 204,
  });

  sleep(0.3);
}

/* =========================
   TEARDOWN 
========================= */
export function teardown(data) {
  const headers = {
    Authorization: `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  // Best effort: no fallar si ya no existe
  http.del(`${BASE_URL}/movies/${data.movieId}`, null, { headers });
}
