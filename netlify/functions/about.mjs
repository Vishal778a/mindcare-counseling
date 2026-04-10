// In-memory store (use Google Sheets in production)
let aboutData = {
  name: 'Dr. Sarah Mitchell',
  title: 'Licensed Mental Health Counselor',
  bio: 'With over 15 years of experience in mental health counseling, I specialize in cognitive-behavioral therapy, mindfulness-based approaches, and trauma-informed care.',
  credentials: 'PhD Clinical Psychology, Licensed MHC, CBT Certified, EMDR Trained',
  approach: 'I believe in creating a safe, non-judgmental space where you can explore your thoughts and feelings.',
  email: 'sarah@mindcare.com',
  phone: '+1-555-CARE',
};

export default async (req, context) => {
  const method = req.method;

  // GET /api/about
  if (method === 'GET') {
    return new Response(JSON.stringify(aboutData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // PUT /api/about
  if (method === 'PUT') {
    try {
      const body = await req.json();
      aboutData = { ...aboutData, ...body };

      return new Response(JSON.stringify(aboutData), {
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

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const config = {
  path: '/api/about',
};
