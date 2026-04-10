// In-memory store (use Google Calendar API in production)
function getDateStr(daysFromNow, hour) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

let appointments = [
  { id: 'a1', patientName: 'Alex Johnson', patientEmail: 'alex@example.com', type: 'video', status: 'scheduled', scheduledAt: getDateStr(1, 10), createdAt: '2026-04-08' },
  { id: 'a2', patientName: 'Maya Patel', patientEmail: 'maya@example.com', type: 'voice', status: 'scheduled', scheduledAt: getDateStr(1, 14), createdAt: '2026-04-07' },
];

export default async (req, context) => {
  const method = req.method;
  const url = new URL(req.url);
  const path = url.pathname;

  // GET /api/appointments — List all
  if (method === 'GET' && path === '/api/appointments') {
    return new Response(JSON.stringify(appointments), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // GET /api/appointments/slots?date=ISO — Get available slots
  if (method === 'GET' && path === '/api/appointments/slots') {
    const dateParam = url.searchParams.get('date') || new Date().toISOString();
    const d = new Date(dateParam);
    const slots = [];

    for (let h = 9; h <= 17; h++) {
      d.setHours(h, 0, 0, 0);
      const isBooked = appointments.some(
        a => a.status === 'scheduled' &&
             new Date(a.scheduledAt).getHours() === h &&
             new Date(a.scheduledAt).toDateString() === d.toDateString()
      );
      slots.push({
        time: d.toISOString(),
        hour: h,
        label: `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}`,
        available: !isBooked,
      });
    }

    return new Response(JSON.stringify(slots), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // POST /api/appointments — Book new
  if (method === 'POST' && path === '/api/appointments') {
    try {
      const body = await req.json();
      const { patientName, patientEmail, type, scheduledAt } = body;

      if (!patientEmail || !scheduledAt) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Check for conflict
      const conflict = appointments.find(
        a => a.status === 'scheduled' && a.scheduledAt === scheduledAt
      );
      if (conflict) {
        return new Response(JSON.stringify({ error: 'Time slot already booked' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const appointment = {
        id: 'a' + Date.now(),
        patientName: patientName || 'Patient',
        patientEmail,
        type: type || 'video',
        status: 'scheduled',
        scheduledAt,
        createdAt: new Date().toISOString().split('T')[0],
      };

      appointments.push(appointment);

      return new Response(JSON.stringify(appointment), {
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

  // PUT /api/appointments/cancel
  if (method === 'PUT' && path.includes('/cancel')) {
    try {
      const body = await req.json();
      const { id } = body;

      const appt = appointments.find(a => a.id === id);
      if (!appt) {
        return new Response(JSON.stringify({ error: 'Appointment not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      appt.status = 'cancelled';

      return new Response(JSON.stringify({ success: true }), {
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

  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const config = {
  path: ['/api/appointments', '/api/appointments/slots', '/api/appointments/*/cancel'],
};
