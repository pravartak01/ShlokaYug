import React, { useState, useEffect } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { CheckCircle, Error, Wifi } from '@mui/icons-material';
import apiService from '../services/apiService';

const ConnectionStatus = () => {
  const [status, setStatus] = useState('checking'); // 'connected', 'disconnected', 'checking'
  const [backendInfo, setBackendInfo] = useState(null);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    try {
      const response = await apiService.get('/auth/health');
      setStatus('connected');
      setBackendInfo(response.data);
    } catch (error) {
      setStatus('disconnected');
      setBackendInfo(null);
    }
  };

  const getStatusProps = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <CheckCircle />,
          label: 'Connected',
          color: 'success'
        };
      case 'disconnected':
        return {
          icon: <Error />,
          label: 'Disconnected',
          color: 'error'
        };
      default:
        return {
          icon: <Wifi />,
          label: 'Checking...',
          color: 'warning'
        };
    }
  };

  const statusProps = getStatusProps();

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Chip
        icon={statusProps.icon}
        label={statusProps.label}
        color={statusProps.color}
        size="small"
        variant="outlined"
      />
      {backendInfo && (
        <Typography variant="caption" color="textSecondary">
          Backend: v{backendInfo.version} | Port: {backendInfo.port}
        </Typography>
      )}
    </Box>
  );
};

export default ConnectionStatus;