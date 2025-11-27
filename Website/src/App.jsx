import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GuruAuthProvider, useGuruAuth } from './context/GuruAuthContext';
import GuruLogin from './pages/auth/GuruLogin';
import GuruRegister from './pages/auth/GuruRegister';
import GuruDashboard from './pages/dashboard/GuruDashboard';
import MyCourses from './pages/courses/MyCourses';
import CreateCourse from './pages/courses/CreateCourse';
import EditCourse from './pages/courses/EditCourse';
import './styles/vintage.css';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useGuruAuth();
  
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontFamily: 'Georgia, serif'
      }}>
        <div>Loading...</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <GuruAuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<GuruLogin />} />
          <Route path="/register" element={<GuruRegister />} />
          
          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <GuruDashboard />
            </ProtectedRoute>
          } />
          
          {/* Protected Course Routes */}
          <Route path="/courses" element={
            <ProtectedRoute>
              <MyCourses />
            </ProtectedRoute>
          } />
          <Route path="/courses/create" element={
            <ProtectedRoute>
              <CreateCourse />
            </ProtectedRoute>
          } />
          <Route path="/courses/:id/edit" element={
            <ProtectedRoute>
              <EditCourse />
            </ProtectedRoute>
          } />
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </GuruAuthProvider>
  );
};

export default App;