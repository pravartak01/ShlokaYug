import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { useApi } from '../contexts/ApiContext';
import apiService from '../services/apiService';

const ApiTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [customEndpoint, setCustomEndpoint] = useState('/health');

  const testEndpoints = [
    { name: 'Health Check', endpoint: '/auth/health', method: 'GET' },
    { name: 'Admin Login', endpoint: '/auth/login', method: 'POST', 
      body: { identifier: 'michtohadmin@svaram.com', password: '123456789' } },
    { name: 'Dashboard Stats', endpoint: '/admin/dashboard/stats', method: 'GET' },
    { name: 'Get Users', endpoint: '/admin/users', method: 'GET' },
    { name: 'Get Pending Gurus', endpoint: '/admin/gurus/pending', method: 'GET' },
    { name: 'Get Challenges', endpoint: '/admin/challenges', method: 'GET' },
    { name: 'Create Test Challenge', endpoint: '/admin/challenges', method: 'POST',
      body: {
        title: 'Test Challenge from Admin',
        description: 'A test challenge created from the admin dashboard',
        type: 'shloka_recitation',
        difficulty: 'beginner',
        points: 100,
        instructions: 'Please complete this test challenge to verify the system is working'
      }
    }
  ];

  const testEndpoint = async (endpoint, method = 'GET', data = null) => {
    try {
      let response;
      switch (method) {
        case 'POST':
          response = await apiService.post(endpoint, data);
          break;
        case 'PUT':
          response = await apiService.put(endpoint, data);
          break;
        case 'DELETE':
          response = await apiService.delete(endpoint);
          break;
        default:
          response = await apiService.get(endpoint);
      }
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return { 
        success: false, 
        error: error.message, 
        status: error.response?.status,
        details: error.response?.data
      };
    }
  };

  const runTest = async (testName, endpoint, method = 'GET', data = null) => {
    setLoading(true);
    const result = await testEndpoint(endpoint, method, data);
    setTestResults(prev => ({
      ...prev,
      [testName]: result
    }));
    setLoading(false);
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestResults({});
    
    for (const test of testEndpoints) {
      const result = await testEndpoint(test.endpoint, test.method, test.data);
      setTestResults(prev => ({
        ...prev,
        [test.name]: result
      }));
    }
    setLoading(false);
  };

  const testCustomEndpoint = async () => {
    setLoading(true);
    const result = await testEndpoint(customEndpoint);
    setTestResults(prev => ({
      ...prev,
      'Custom Test': result
    }));
    setLoading(false);
  };

  useEffect(() => {
    // Auto-run health check on load
    testEndpoint('/health').then(result => {
      setTestResults({ 'Health Check': result });
    });
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Backend API Test Panel
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Tests
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Button 
                variant="contained" 
                onClick={runAllTests}
                disabled={loading}
              >
                Run All Tests
              </Button>
              {testEndpoints.map((test) => (
                <Button
                  key={test.name}
                  variant="outlined"
                  size="small"
                  onClick={() => runTest(test.name, test.endpoint, test.method, test.data)}
                  disabled={loading}
                >
                  {test.name}
                </Button>
              ))}
            </Box>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Custom Test
            </Typography>
            <Box display="flex" gap={1}>
              <TextField
                label="Endpoint"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                placeholder="/health"
                size="small"
                fullWidth
              />
              <Button 
                variant="outlined"
                onClick={testCustomEndpoint}
                disabled={loading}
              >
                Test
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Test Results
          </Typography>
          {Object.entries(testResults).map(([testName, result]) => (
            <Card key={testName} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {testName}
                  </Typography>
                  <Chip 
                    label={result.success ? 'Success' : 'Failed'}
                    color={result.success ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                
                {result.status && (
                  <Typography variant="body2" color="textSecondary">
                    Status: {result.status}
                  </Typography>
                )}
                
                {result.success ? (
                  <Box>
                    <Typography variant="body2" color="success.main">
                      ✓ Connection successful
                    </Typography>
                    {result.data && (
                      <Box mt={1}>
                        <Typography variant="caption">Response:</Typography>
                        <pre style={{ 
                          fontSize: '12px', 
                          background: '#f5f5f5', 
                          padding: '8px', 
                          borderRadius: '4px',
                          maxHeight: '200px',
                          overflow: 'auto'
                        }}>
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body2" color="error.main">
                      ✗ {result.error}
                    </Typography>
                    {result.details && (
                      <Box mt={1}>
                        <Typography variant="caption">Error Details:</Typography>
                        <pre style={{ 
                          fontSize: '12px', 
                          background: '#ffebee', 
                          padding: '8px', 
                          borderRadius: '4px',
                          maxHeight: '200px',
                          overflow: 'auto'
                        }}>
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Backend Configuration:</strong><br />
          • Base URL: {process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1'}<br />
          • Admin Credentials: michtohadmin@svaram.com / 123456789<br />
          • Make sure your backend server is running on port 5000
        </Typography>
      </Alert>
    </Box>
  );
};

export default ApiTest;