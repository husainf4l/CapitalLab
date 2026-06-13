import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000']
  },
  scenarios: {
    smoke: {
      executor: 'constant-vus',
      vus: Number(__ENV.K6_VUS || 5),
      duration: __ENV.K6_DURATION || '1m'
    }
  }
};

const apiBaseUrl = __ENV.API_BASE_URL || 'http://localhost:5001';

export default function () {
  const live = http.get(`${apiBaseUrl}/health/live`);
  check(live, {
    'live health ok': response => response.status >= 200 && response.status < 500
  });

  const ready = http.get(`${apiBaseUrl}/health/ready`);
  check(ready, {
    'ready health ok': response => response.status >= 200 && response.status < 500
  });

  sleep(1);
}
