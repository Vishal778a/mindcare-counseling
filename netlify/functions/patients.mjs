// In-memory store (use Google Sheets API in production)
let patients = [
  { id: '1', name: 'Alex Johnson', email: 'alex@example.com', phone: '+1-555-0101', enrollDate: '2025-12-15', status: 'active', notes: '' },
  { id: '2', name: 'Maya Patel', email: 'maya@example.com', phone: '+1-555-0102', enrollDate: '2026-01-08', status: 'active', notes: 'Prefers morning sessions' },
  { id: '3', name: 'James Wilson', email: 'james@example.com', phone: '+1-555-0103', enrollDate: '2026-02-20', status: 'blocked', notes: 'Missed 3 appointments' },
];

export default async (req, context) => {
  const method = req.method;
  const url = new URL(req.url);
  const path = url.pathname;

  // GET /api/patients — List all patients
  if (method === 'GET' && path === '/api/patients') {
    return new Response(JSON.stringify(patients), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // POST /api/patients/enroll — Enroll new patient
  if (method === 'POST' && path === '/api/patients/enroll') {
    try {
      const body = await req.json();
      const { name, email, phone } = body;

      if (!name || !email || !phone) {
        return new Response(JSON.stringify({ error: 'Name, email, and phone are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Check duplicate
      if (patients.find(p => p.email === email)) {
        return new Response(JSON.stringify({ error: 'Patient already enrolled' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const patient = {
        id: String(Date.now()),
        name,
        email,
        phone,
        enrollDate: new Date().toISOString().split('T')[0],
        status: 'active',
        notes: '',
      };

      patients.push(patient);

      return new Response(JSON.stringify(patient), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // PUT /api/patients/block or /api/patients/unblock
  if (method === 'PUT') {
    const isBlock = path.endsWith('/block');
    const isUnblock = path.endsWith('/unblock');

    if (isBlock || isUnblock) {
      try {
        const body = await req.json();
        const { email } = body;

        const patient = patients.find(p => p.email === email);
        if (!patient) {
          return new Response(JSON.stringify({ error: 'Patient not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        patient.status = isBlock ? 'blocked' : 'active';

        return new Response(JSON.stringify({ success: true, patient }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Invalid request' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
  }

  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const config = {
  path: ['/api/patients', '/api/patients/enroll', '/api/patients/*/block', '/api/patients/*/unblock'],
};
