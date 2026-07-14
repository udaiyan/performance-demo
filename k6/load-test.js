import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // ramp up to 50 users
    { duration: '2m', target: 50 },   // stay at 50
    { duration: '30s', target: 0 },   // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete under 500ms
    http_req_failed: ['rate<0.01'],   // error rate < 1%
  },
};

const endpoints = [
  { name: 'home', path: '/', weight: 1 },
  { name: 'data', path: '/api/data', weight: 2 },
  { name: 'slow', path: '/api/slow', weight: 1 },
  { name: 'cpu', path: '/api/cpu', weight: 1 },
];

export default function () {
  // Weighted random selection
  let totalWeight = endpoints.reduce((sum, e) => sum + e.weight, 0);
  let rand = Math.random() * totalWeight;
  let chosen = endpoints[0];
  for (let e of endpoints) {
    rand -= e.weight;
    if (rand <= 0) {
      chosen = e;
      break;
    }
  }

  const url = `http://localhost:3000${chosen.path}`;
  const res = http.get(url);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 3000ms': (r) => r.timings.duration < 3000,
  });

  // Add a small random sleep to simulate user think time
  sleep(Math.random() * 2);
}