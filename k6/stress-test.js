import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 10 },   // warm-up
    { duration: '5m', target: 100 },  // ramp up to 100
    { duration: '2m', target: 200 },  // ramp up to 200 (overload)
    { duration: '3m', target: 200 },  // stay at peak
    { duration: '2m', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],   // allow 5% errors during stress
  },
};

// Reuse the same endpoint list and default function as load-test
// (Copy the weighted selection and HTTP call from load-test.js)
// To avoid duplication, you could import, but for simplicity we repeat.
const endpoints = [
  { name: 'home', path: '/', weight: 1 },
  { name: 'data', path: '/api/data', weight: 2 },
  { name: 'slow', path: '/api/slow', weight: 1 },
  { name: 'cpu', path: '/api/cpu', weight: 1 },
];

export default function () {
  let totalWeight = endpoints.reduce((sum, e) => sum + e.weight, 0);
  let rand = Math.random() * totalWeight;
  let chosen = endpoints[0];
  for (let e of endpoints) {
    rand -= e.weight;
    if (rand <= 0) { chosen = e; break; }
  }
  const url = `http://localhost:3000${chosen.path}`;
  const res = http.get(url);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(Math.random() * 2);
}