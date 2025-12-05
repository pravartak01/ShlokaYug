import React, { useState } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

// Components
import Sidebar from './components/Layout/Sidebar';
import TopBar from './components/Layout/TopBar';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import GuruManagement from './pages/GuruManagement';
import ChallengeManagement from './pages/ChallengeManagement';
import CommunityManagement from './pages/CommunityManagement';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ApiTest from './pages/ApiTest';
import ContentModeration from './pages/ContentModeration';
import PaymentManagement from './pages/PaymentManagement';
import SystemManagement from './pages/SystemManagement';
import CourseManagement from './pages/CourseManagement';
import VideoManagement from './pages/VideoManagement';
import AssessmentManagement from './pages/AssessmentManagement';
import CertificateManagement from './pages/CertificateManagement';
import EnrollmentManagement from './pages/EnrollmentManagement';

// Services
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ApiProvider } from './contexts/ApiContext';

// Styles
import './App.css';

// Luxury Theme Configuration
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1',
      dark: '#4f46e5',
      light: '#8b5cf6',
    },
    secondary: {
      main: '#ec4899',
      dark: '#db2777',
      light: '#f9a8d4',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.125rem',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Main Layout Component
const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        collapsed={false}
        isDesktop={!isMobile}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          marginLeft: isMobile ? 0 : (sidebarOpen ? '280px' : '72px'),
          width: isMobile ? '100%' : `calc(100% - ${sidebarOpen ? '280px' : '72px'})`,
          minHeight: '100vh',
        }}
      >
        <TopBar onMenuClick={handleSidebarToggle} />
        <Box 
          sx={{ 
            p: { xs: 2, sm: 3, md: 4 },
            maxWidth: '100%',
            overflow: 'hidden',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

// App Component
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ApiProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute>
                  <MainLayout>
                    <UserManagement />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/gurus" element={
                <ProtectedRoute>
                  <MainLayout>
                    <GuruManagement />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/challenges" element={
                <ProtectedRoute>
                  <MainLayout>
                    <ChallengeManagement />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/community" element={
                <ProtectedRoute>
                  <MainLayout>
                    <CommunityManagement />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Analytics />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Settings />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/api-test" element={
                <ProtectedRoute>
                  <MainLayout>
                    <ApiTest />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/content-moderation" element={
                <ProtectedRoute>
                  <MainLayout>
                    <ContentModeration />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/payment-management" element={
                <ProtectedRoute>
                  <MainLayout>
                    <PaymentManagement />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/system-management" element={
                <ProtectedRoute>
                  <MainLayout>
                    <SystemManagement />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/course-management" element={
                <ProtectedRoute>
                  <MainLayout>
                    <CourseManagement />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/video-management" element={
                <ProtectedRoute>
                  <MainLayout>
                    <VideoManagement />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/assessment-management" element={
                <ProtectedRoute>
                  <MainLayout>
                    <AssessmentManagement />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/certificate-management" element={
                <ProtectedRoute>
                  <MainLayout>
                    <CertificateManagement />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/enrollment-management" element={
                <ProtectedRoute>
                  <MainLayout>
                    <EnrollmentManagement />
                  </MainLayout>
                </ProtectedRoute>
              } />
            </Routes>
          </Router>
        </ApiProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;