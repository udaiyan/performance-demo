import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 20 },   // normal traffic
    { duration: '10s', target: 300 }, // sudden spike to 300
    { duration: '1m', target: 300 },  // stay at spike
    { duration: '10s', target: 20 },  // drop back
    { duration: '1m', target: 20 },   // recover
  ],
};

// Same endpoint logic (copy from load-test)
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
  sleep(Math.random() * 1);
}