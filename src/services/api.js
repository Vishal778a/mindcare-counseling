const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const user = localStorage.getItem('mindcare_user');
  if (user) {
    try {
      const parsed = JSON.parse(user);
      config.headers.Authorization = `Bearer ${parsed.token || 'demo-token'}`;
    } catch {
      // ignore
    }
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, data) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

// ========================
// Mock Data Layer
// (Used until Google APIs are configured)
// ========================

let mockPatients = [
  { id: '1', name: 'Alex Johnson', email: 'alex@example.com', phone: '+1-555-0101', enrollDate: '2025-12-15', status: 'active', notes: '' },
  { id: '2', name: 'Maya Patel', email: 'maya@example.com', phone: '+1-555-0102', enrollDate: '2026-01-08', status: 'active', notes: 'Prefers morning sessions' },
  { id: '3', name: 'James Wilson', email: 'james@example.com', phone: '+1-555-0103', enrollDate: '2026-02-20', status: 'blocked', notes: 'Missed 3 appointments' },
  { id: '4', name: 'Sofia Rodriguez', email: 'sofia@example.com', phone: '+1-555-0104', enrollDate: '2026-03-05', status: 'active', notes: '' },
  { id: '5', name: 'Ethan Kim', email: 'ethan@example.com', phone: '+1-555-0105', enrollDate: '2026-03-22', status: 'active', notes: 'New patient' },
];

let mockAppointments = [
  { id: 'a1', patientName: 'Alex Johnson', patientEmail: 'alex@example.com', type: 'video', status: 'scheduled', scheduledAt: getDateStr(1, 10), createdAt: '2026-04-08' },
  { id: 'a2', patientName: 'Maya Patel', patientEmail: 'maya@example.com', type: 'voice', status: 'scheduled', scheduledAt: getDateStr(1, 14), createdAt: '2026-04-07' },
  { id: 'a3', patientName: 'Sofia Rodriguez', patientEmail: 'sofia@example.com', type: 'video', status: 'scheduled', scheduledAt: getDateStr(2, 11), createdAt: '2026-04-09' },
  { id: 'a4', patientName: 'Alex Johnson', patientEmail: 'alex@example.com', type: 'voice', status: 'completed', scheduledAt: getDateStr(-1, 15), createdAt: '2026-04-01' },
  { id: 'a5', patientName: 'Ethan Kim', patientEmail: 'ethan@example.com', type: 'video', status: 'scheduled', scheduledAt: getDateStr(3, 9), createdAt: '2026-04-10' },
];

let mockAbout = {
  name: 'Dr. Sarah Mitchell',
  title: 'Licensed Mental Health Counselor',
  bio: 'With over 15 years of experience in mental health counseling, I specialize in cognitive-behavioral therapy, mindfulness-based approaches, and trauma-informed care. My practice is built on empathy, trust, and evidence-based methods.',
  credentials: 'PhD Clinical Psychology, Licensed MHC, CBT Certified, EMDR Trained',
  approach: 'I believe in creating a safe, non-judgmental space where you can explore your thoughts and feelings. Together, we will develop personalized strategies to help you navigate challenges and build resilience.',
  email: 'sarah@mindcare.com',
  phone: '+1-555-CARE',
};

function getDateStr(daysFromNow, hour) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

// Mock API functions
export const mockApi = {
  // Patients
  getPatients: () => Promise.resolve([...mockPatients]),
  
  enrollPatient: (data) => {
    const patient = {
      id: String(Date.now()),
      ...data,
      enrollDate: new Date().toISOString().split('T')[0],
      status: 'active',
      notes: '',
    };
    mockPatients.push(patient);
    return Promise.resolve(patient);
  },

  blockPatient: (email) => {
    mockPatients = mockPatients.map(p =>
      p.email === email ? { ...p, status: 'blocked' } : p
    );
    return Promise.resolve({ success: true });
  },

  unblockPatient: (email) => {
    mockPatients = mockPatients.map(p =>
      p.email === email ? { ...p, status: 'active' } : p
    );
    return Promise.resolve({ success: true });
  },

  // Appointments
  getAppointments: () => Promise.resolve([...mockAppointments]),

  getMyAppointments: (email) =>
    Promise.resolve(mockAppointments.filter(a => a.patientEmail === email)),

  getAvailableSlots: (date) => {
    const slots = [];
    const d = new Date(date);
    for (let h = 9; h <= 17; h++) {
      d.setHours(h, 0, 0, 0);
      const isoStr = d.toISOString();
      const isBooked = mockAppointments.some(
        a => a.status === 'scheduled' && new Date(a.scheduledAt).getHours() === h &&
             new Date(a.scheduledAt).toDateString() === d.toDateString()
      );
      slots.push({
        time: isoStr,
        hour: h,
        label: `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}`,
        available: !isBooked,
      });
    }
    return Promise.resolve(slots);
  },

  bookAppointment: (data) => {
    const appointment = {
      id: 'a' + Date.now(),
      ...data,
      status: 'scheduled',
      createdAt: new Date().toISOString().split('T')[0],
    };
    mockAppointments.push(appointment);
    return Promise.resolve(appointment);
  },

  cancelAppointment: (id) => {
    mockAppointments = mockAppointments.map(a =>
      a.id === id ? { ...a, status: 'cancelled' } : a
    );
    return Promise.resolve({ success: true });
  },

  // About
  getAbout: () => Promise.resolve({ ...mockAbout }),
  
  updateAbout: (data) => {
    mockAbout = { ...mockAbout, ...data };
    return Promise.resolve(mockAbout);
  },
};
