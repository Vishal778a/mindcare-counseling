import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import PatientDashboard from './pages/PatientDashboard';
import PatientsPage from './pages/PatientsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import EnrollPage from './pages/EnrollPage';
import BookingPage from './pages/BookingPage';
import SessionPage from './pages/SessionPage';
import FeedbackPage from './pages/FeedbackPage';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="page-wrapper">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminLoginPage />} />

            {/* Admin Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients"
              element={
                <ProtectedRoute requiredRole="admin">
                  <PatientsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AppointmentsPage />
                </ProtectedRoute>
              }
            />

            {/* Patient Routes */}
            <Route
              path="/patient/dashboard"
              element={
                <ProtectedRoute requiredRole="patient">
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/enroll"
              element={
                <ProtectedRoute requiredRole="patient">
                  <EnrollPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/book"
              element={
                <ProtectedRoute requiredRole="patient">
                  <BookingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feedback"
              element={
                <ProtectedRoute requiredRole="patient">
                  <FeedbackPage />
                </ProtectedRoute>
              }
            />

            {/* Session Room - Both roles */}
            <Route
              path="/session/:id"
              element={
                <ProtectedRoute>
                  <SessionPage />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="container page-wrapper text-center" style={{ padding: 'var(--space-20) 0' }}>
                  <div style={{ fontSize: '6rem', marginBottom: 'var(--space-4)' }}>🔍</div>
                  <h1>404 — Page Not Found</h1>
                  <p style={{ marginTop: 'var(--space-3)' }}>The page you&apos;re looking for doesn&apos;t exist.</p>
                  <a href="/" className="btn btn-primary" style={{ marginTop: 'var(--space-6)', display: 'inline-flex' }}>
                    Go Home →
                  </a>
                </div>
              }
            />
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
