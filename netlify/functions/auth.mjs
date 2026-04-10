export default async (req, context) => {
  const method = req.method;
  const url = new URL(req.url);

  // POST /api/auth/login — Exchange credentials for session
  if (method === 'POST') {
    try {
      const body = await req.json();
      const { email, name, picture } = body;

      if (!email) {
        return new Response(JSON.stringify({ error: 'Email is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Determine role (admin = counsellor email)
      const adminEmail = Netlify.env.get('ADMIN_EMAIL') || 'counsellor@mindcare.com';
      const role = email === adminEmail ? 'admin' : 'patient';

      // In production, validate Google OAuth token here
      const user = {
        email,
        name: name || email.split('@')[0],
        picture: picture || null,
        role,
        token: `session_${Date.now()}`,
      };

      return new Response(JSON.stringify(user), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // GET /api/auth/me — Get current user
  if (method === 'GET') {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // In production, validate JWT/session token here
    return new Response(JSON.stringify({ message: 'Session valid' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const config = {
  path: ['/api/auth/login', '/api/auth/me'],
};
