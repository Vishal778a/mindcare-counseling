import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { mockApi } from '../services/api';

export default function BookingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sessionType, setSessionType] = useState('video');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    setLoading(true);
    setSelectedSlot(null);
    mockApi.getAvailableSlots(selectedDate.toISOString()).then(s => {
      setSlots(s);
      setLoading(false);
    });
  }, [selectedDate]);

  // Calendar generation
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        date: new Date(year, month - 1, daysInPrevMonth - i),
        otherMonth: true,
      });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        day: d,
        date: new Date(year, month, d),
        otherMonth: false,
      });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({
        day: d,
        date: new Date(year, month + 1, d),
        otherMonth: true,
      });
    }

    return days;
  }, [currentMonth]);

  const handleBook = async () => {
    if (!selectedSlot) return;
    setBooking(true);
    try {
      await mockApi.bookAppointment({
        patientName: user?.name || 'Patient',
        patientEmail: user?.email || 'patient@example.com',
        type: sessionType,
        scheduledAt: selectedSlot.time,
      });
      setSuccess(true);
      setTimeout(() => navigate('/patient/dashboard'), 2500);
    } catch (err) {
      alert(err.message);
    }
    setBooking(false);
  };

  if (success) {
    return (
      <div className="booking-page container animate-fade-in">
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="card text-center animate-scale-in" style={{ padding: 'var(--space-12)' }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🎉</div>
            <h2>Session Booked!</h2>
            <p style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
              Your {sessionType} session has been scheduled for
            </p>
            <p style={{ color: 'var(--color-accent-secondary)', fontWeight: 600, fontSize: 'var(--text-lg)' }}>
              {new Date(selectedSlot.time).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
              {' at '}
              {selectedSlot.label}
            </p>
            <div className="spinner spinner-sm" style={{ margin: 'var(--space-4) auto 0' }}></div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: 'var(--space-2)' }}>
              Redirecting to your dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="booking-page container animate-fade-in">
      <div className="dashboard-header">
        <h1>Book a <span className="text-gradient">Session</span></h1>
        <p>Choose a date and time for your counseling session.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)', alignItems: 'start' }}>
        {/* Calendar */}
        <div className="animate-fade-in-up delay-1">
          <div className="calendar-mini">
            <div className="calendar-header">
              <button
                className="calendar-nav-btn"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              >
                ←
              </button>
              <h4>
                {currentMonth.toLocaleDateString([], { month: 'long', year: 'numeric' })}
              </h4>
              <button
                className="calendar-nav-btn"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              >
                →
              </button>
            </div>

            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="calendar-day-header">{d}</div>
              ))}
              {calendarDays.map((d, i) => {
                const isToday = d.date.toDateString() === new Date().toDateString();
                const isSelected = d.date.toDateString() === selectedDate.toDateString();
                const isPast = d.date < today && !isToday;
                return (
                  <div
                    key={i}
                    className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${d.otherMonth ? 'other-month' : ''}`}
                    style={{ cursor: isPast || d.otherMonth ? 'not-allowed' : 'pointer', opacity: isPast ? 0.3 : undefined }}
                    onClick={() => {
                      if (!isPast && !d.otherMonth) setSelectedDate(d.date);
                    }}
                  >
                    {d.day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Slot Selection */}
        <div className="animate-fade-in-up delay-2">
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>
              Available Slots — {selectedDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)' }}>
              Select a time slot for your session.
            </p>

            {loading ? (
              <div className="spinner-overlay" style={{ minHeight: '150px' }}>
                <div className="spinner spinner-sm"></div>
              </div>
            ) : (
              <div className="time-slots-grid">
                {slots.map(slot => (
                  <div
                    key={slot.hour}
                    className={`time-slot ${!slot.available ? 'unavailable' : ''} ${selectedSlot?.hour === slot.hour ? 'selected' : ''}`}
                    onClick={() => slot.available && setSelectedSlot(slot)}
                  >
                    {slot.label}
                    {!slot.available && <span style={{ display: 'block', fontSize: 'var(--text-xs)', opacity: 0.6 }}>Booked</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Session Type */}
            <div style={{ marginTop: 'var(--space-6)' }}>
              <label className="form-label">Session Type</label>
              <div className="flex gap-3" style={{ marginTop: 'var(--space-2)' }}>
                <button
                  className={`btn ${sessionType === 'video' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSessionType('video')}
                  id="type-video"
                >
                  🎥 Video Call
                </button>
                <button
                  className={`btn ${sessionType === 'voice' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSessionType('voice')}
                  id="type-voice"
                >
                  🎤 Voice Call
                </button>
              </div>
            </div>

            {/* Confirm */}
            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 'var(--space-6)' }}
              disabled={!selectedSlot || booking}
              onClick={handleBook}
              id="confirm-booking"
            >
              {booking ? (
                <>
                  <div className="spinner spinner-sm" style={{ borderTopColor: 'white' }}></div>
                  Booking...
                </>
              ) : selectedSlot ? (
                `Book ${sessionType} session at ${selectedSlot.label} →`
              ) : (
                'Select a time slot'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile responsive override */}
      <style>{`
        @media (max-width: 768px) {
          .booking-page > div:last-of-type {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
