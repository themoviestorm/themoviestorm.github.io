/**
 * Movie Storm — Live Azure Backend Test Suite
 * Tests all consumer, public, admin, and CORS endpoints against the live cloud deployment.
 * 
 * Usage:
 *   node scripts/test-live-api.mjs
 */

const BASE_URL = process.env.API_BASE_URL || 
  'https://movie-storm-function-eedbach7daeqd2h4.centralus-01.azurewebsites.net/api';
const ORIGIN = 'https://themoviestorm.github.io';

const results = [];

async function probe(name, method, endpoint, { body = null, headers = {}, expectedStatus = null } = {}) {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const start = Date.now();
  const reqHeaders = {
    'Origin': ORIGIN,
    'Accept': 'application/json',
    ...headers
  };
  if (body && typeof body === 'object') {
    reqHeaders['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(url, {
      method,
      headers: reqHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(30000)
    });
    const duration = Date.now() - start;
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}

    const corsOrigin = res.headers.get('access-control-allow-origin');
    const hasCors = corsOrigin === ORIGIN || corsOrigin === '*';

    const item = {
      name,
      method,
      endpoint,
      status: res.status,
      durationMs: duration,
      hasCors,
      success: json ? json.success : false,
      errorMsg: json?.error || (res.status >= 400 ? res.statusText : null),
      payload: json?.data ? (Array.isArray(json.data) ? `[${json.data.length} items]` : '{data}') : null,
      rawBody: text.length > 200 ? text.slice(0, 200) + '...' : text
    };
    results.push(item);
    return item;
  } catch (err) {
    const duration = Date.now() - start;
    const item = {
      name,
      method,
      endpoint,
      status: 0,
      durationMs: duration,
      hasCors: false,
      success: false,
      errorMsg: err.message,
      payload: null,
      rawBody: null
    };
    results.push(item);
    return item;
  }
}

async function runAllTests() {
  console.log('='.repeat(78));
  console.log(` Movie Storm — Live Azure Backend Verification Suite`);
  console.log(` Target Base URL: ${BASE_URL}`);
  console.log(` Origin Header:   ${ORIGIN}`);
  console.log('='.repeat(78));
  console.log('\n[1/5] Probing CORS & Preflight OPTIONS...');

  await probe('CORS Preflight on Search', 'OPTIONS', '/search', {
    headers: {
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'content-type'
    }
  });

  await probe('CORS Preflight on Auth Login', 'OPTIONS', '/auth/login', {
    headers: {
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type'
    }
  });

  console.log('\n[2/5] Testing Public Catalog Endpoints (DB Read Queries)...');
  await probe('Catalog Sync Version', 'GET', '/sync/version');
  await probe('Categories List', 'GET', '/categories');
  await probe('Tags List', 'GET', '/tags');
  await probe('Playlists List', 'GET', '/playlists');
  await probe('Search Content (Top Rated)', 'GET', '/search?sort=rating&limit=8');
  await probe('Search Content (Text Query)', 'GET', '/search?q=test');
  await probe('Sync Delta Feed', 'GET', '/sync/delta?since=0&limit=5');

  console.log('\n[3/5] Testing Consumer Authentication Endpoints...');
  await probe('Auth Login (Bad Credentials)', 'POST', '/auth/login', {
    body: { email: 'nonexistent_test@moviestorm.com', password: 'wrong_password_123' }
  });
  await probe('Auth Signup (Missing Required Fields)', 'POST', '/auth/signup', {
    body: { email: 'bad' }
  });
  await probe('Auth Refresh (Invalid Token)', 'POST', '/auth/refresh', {
    body: { refreshToken: 'invalid.test.token' }
  });
  await probe('Password Reset Request (Nonexistent User)', 'POST', '/auth/password/reset/request', {
    body: { email: 'unknown_user_999@moviestorm.com' }
  });

  console.log('\n[4/5] Testing Protected Consumer Routes (Auth Guard Check)...');
  await probe('User Profile (/users/me without token)', 'GET', '/users/me');
  await probe('User Favorites (/favorites without token)', 'GET', '/favorites');
  await probe('User History (/history without token)', 'GET', '/history');
  await probe('User Recommendations (/recommendations without token)', 'GET', '/recommendations');
  await probe('Chat Threads (/chat/threads without token)', 'GET', '/chat/threads');
  await probe('User Requests (/requests without token)', 'GET', '/requests');

  console.log('\n[5/5] Testing Admin / Management Routes...');
  await probe('Admin Login (/manage/auth/login Bad Credentials)', 'POST', '/manage/auth/login', {
    body: { email: 'admin_test@moviestorm.com', password: 'wrong_admin_pass' }
  });
  await probe('Admin Content List (/manage/content without token)', 'GET', '/manage/content');
  await probe('Admin Categories (/manage/categories without token)', 'GET', '/manage/categories');
  await probe('Admin Analytics (/manage/analytics/overview without token)', 'GET', '/manage/analytics/overview');

  console.log('\n' + '='.repeat(78));
  console.log(' TEST EXECUTION SUMMARY MATRIX');
  console.log('='.repeat(78));

  console.table(results.map(r => ({
    Endpoint: `${r.method} ${r.endpoint}`,
    Status: r.status,
    Time: `${r.durationMs}ms`,
    CORS: r.hasCors ? 'OK' : 'MISSING',
    Result: r.status === 200 ? 'PASS (200)' :
            (r.status === 401 ? 'PASS (Auth Guard 401)' :
            (r.status === 400 ? 'PASS (Bad Req 400)' :
            (r.status === 500 ? 'FAIL (500 Error)' : `HTTP ${r.status}`))),
    Details: r.errorMsg || r.payload || 'OK'
  })));

  // Diagnostics Breakdown
  const passCount = results.filter(r => r.status === 200 || r.status === 401 || r.status === 400 || r.status === 204).length;
  const fail500Count = results.filter(r => r.status === 500).length;
  const netFailCount = results.filter(r => r.status === 0).length;

  console.log('\n--- DIAGNOSTIC FINDINGS ---');
  console.log(`Total Endpoints Tested: ${results.length}`);
  console.log(`Functional (200 / Expected 401 Guard / 400): ${passCount}`);
  console.log(`Internal Server Errors (HTTP 500):           ${fail500Count}`);
  console.log(`Network / Timeout Failures (000):             ${netFailCount}`);

  if (fail500Count > 0) {
    console.log('\nEndpoints Failing with HTTP 500:');
    results.filter(r => r.status === 500).forEach(r => {
      console.log(`  - [${r.method} ${r.endpoint}] returned error: "${r.errorMsg}"`);
    });
  }
}

runAllTests().catch(console.error);
