import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5m', target: 30 },   // ramp up to 30
    { duration: '1h', target: 30 },   // stay at 30 for 1 hour (soak)
    { duration: '5m', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // average response time < 1s
  },
};

// Same endpoints
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