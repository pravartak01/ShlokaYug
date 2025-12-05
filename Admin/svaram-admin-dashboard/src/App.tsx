import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { ApiProvider } from './contexts/ApiContext';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import GuruManagement from './pages/GuruManagement';
import CourseManagement from './pages/CourseManagement';
import VideoManagement from './pages/VideoManagement';
import ChallengeManagement from './pages/ChallengeManagement';
import CommunityManagement from './pages/CommunityManagement';
import PaymentManagement from './pages/PaymentManagement';
import ContentModeration from './pages/ContentModeration';
import Analytics from './pages/Analytics';
import AssessmentManagement from './pages/AssessmentManagement';
import CertificateManagement from './pages/CertificateManagement';
import EnrollmentManagement from './pages/EnrollmentManagement';
import SystemManagement from './pages/SystemManagement';
import Settings from './pages/Settings';
import ApiTest from './pages/ApiTest';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

// Create a modern dark theme for admin dashboard
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff6b35', // Saffron orange
      light: '#ff8a65',
      dark: '#e64a19',
    },
    secondary: {
      main: '#00bcd4', // Cyan
      light: '#4dd0e1',
      dark: '#0097a7',
    },
    background: {
      default: '#0a0e1a',
      paper: '#1a1f2e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b9c9',
    },
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    error: {
      main: '#f44336',
    },
    info: {
      main: '#2196f3',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.125rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          backdropFilter: 'blur(10px)',
          background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(0, 188, 212, 0.1) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ApiProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/*"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/users" element={<UserManagement />} />
                        <Route path="/gurus" element={<GuruManagement />} />
                        <Route path="/courses" element={<CourseManagement />} />
                        <Route path="/videos" element={<VideoManagement />} />
                        <Route path="/challenges" element={<ChallengeManagement />} />
                        <Route path="/community" element={<CommunityManagement />} />
                        <Route path="/payments" element={<PaymentManagement />} />
                        <Route path="/moderation" element={<ContentModeration />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/assessments" element={<AssessmentManagement />} />
                        <Route path="/certificates" element={<CertificateManagement />} />
                        <Route path="/enrollments" element={<EnrollmentManagement />} />
                        <Route path="/system" element={<SystemManagement />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/api-test" element={<ApiTest />} />
                      </Routes>
                    </Layout>
                  </PrivateRoute>
                }
              />
            </Routes>
          </Router>
        </ApiProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
