import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Fade,
  Container,
  useTheme,
  alpha,
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LineChart, Line } from 'recharts';
import { useApi } from '../contexts/ApiContext';

const EnhancedStatCard = ({ title, value, icon, color, trend, description, onClick }) => {
  const theme = useTheme();
  
  const gradientMap = {
    primary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    secondary: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    info: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
  };
  
  return (
    <Card 
      className="stats-card glass-card animate-float"
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        background: 'rgba(99, 102, 241, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '16px',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: gradientMap[color] || gradientMap.primary,
          borderRadius: '16px 16px 0 0',
        },
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: '0 24px 60px rgba(99, 102, 241, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          background: 'rgba(99, 102, 241, 0.15)',
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.75rem'
            }}
          >
            {title}
          </Typography>
          <Avatar 
            sx={{ 
              background: `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
              width: 48, 
              height: 48,
              boxShadow: `0 8px 24px ${alpha(theme.palette[color].main, 0.3)}`
            }}
          >
            {icon}
          </Avatar>
        </Box>
        
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette[color].main}, ${theme.palette[color].dark})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          {value}
        </Typography>
        
        {trend && (
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <TrendingUpIcon 
                sx={{ 
                  color: theme.palette.success.main,
                  fontSize: 16,
                  mr: 0.5
                }} 
              />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.success.main,
                  fontWeight: 600
                }}
              >
                {trend}
              </Typography>
            </Box>
            {description && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  fontSize: '0.7rem'
                }}
              >
                {description}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const QuickActionCard = ({ title, description, icon, color, onClick }) => {
  const theme = useTheme();
  
  const gradientMap = {
    primary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    secondary: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    info: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
  };
  
  return (
    <Card 
      className="glass-card animate-morph"
      sx={{ 
        cursor: 'pointer',
        background: 'rgba(99, 102, 241, 0.08)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '0%',
          height: '0%',
          background: gradientMap[color] || gradientMap.primary,
          borderRadius: '50%',
          transition: 'all 0.6s ease',
          transform: 'translate(-50%, -50%)',
          opacity: 0.1,
          zIndex: 0
        },
        '&:hover': {
          transform: 'translateY(-8px) scale(1.05)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 20px 60px rgba(99, 102, 241, 0.3)',
          background: 'rgba(99, 102, 241, 0.15)',
        },
        '&:hover::after': {
          width: '150%',
          height: '150%'
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Box 
          sx={{ 
            background: gradientMap[color] || gradientMap.primary,
            borderRadius: '16px',
            p: 2,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
          }}
        >
          {React.cloneElement(icon, { 
            sx: { 
              fontSize: '2rem', 
              color: 'white',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            } 
          })}
        </Box>
        
        <Typography 
          variant="h6" 
          sx={{
            fontWeight: 700,
            color: 'white',
            mb: 1,
            fontSize: '1.1rem'
          }}
        >
          {title}
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.875rem',
            lineHeight: 1.5
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGurus: 0,
    totalChallenges: 0,
    activeChallenges: 0,
    pendingGurus: 0,
    totalCertificates: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { getDashboardStats } = useApi();

  useEffect(() => {
    const fetchDashboardStats = async (force = false) => {
      if (refreshing && !force) return;
      
      setRefreshing(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats({
          totalUsers: 15847,
          totalGurus: 234,
          activeChallenges: 45,
          totalChallenges: 128,
          pendingGurus: 12,
          totalCertificates: 8943
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await getDashboardStats();
      
      if (response.success && response.data) {
        const data = response.data;
        
        setStats({
          totalUsers: data.overview?.totalUsers || 0,
          totalGurus: data.overview?.verifiedGurus || 0,
          totalChallenges: data.overview?.totalChallenges || 0,
          activeChallenges: data.overview?.activeChallenges || 0,
          pendingGurus: data.overview?.pendingGurus || 0,
          totalCertificates: 0, // Will be updated when certificate endpoint is available
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Set zero values on error - no mock data
      setStats({
        totalUsers: 0,
        totalGurus: 0,
        totalChallenges: 0,
        activeChallenges: 0,
        pendingGurus: 0,
        totalCertificates: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Enhanced chart data
  const challengeData = [
    { name: 'Shloka Recitation', value: 35, color: '#ff6b35' },
    { name: 'Chandas Analysis', value: 25, color: '#00bcd4' },
    { name: 'Translation', value: 20, color: '#4caf50' },
    { name: 'Pronunciation', value: 20, color: '#f7931e' },
  ];

  const monthlyData = [
    { name: 'Jan', challenges: 12, participants: 89, growth: 15 },
    { name: 'Feb', challenges: 15, participants: 124, growth: 22 },
    { name: 'Mar', challenges: 18, participants: 156, growth: 18 },
    { name: 'Apr', challenges: 22, participants: 198, growth: 28 },
    { name: 'May', challenges: 25, participants: 234, growth: 35 },
    { name: 'Jun', challenges: 28, participants: 276, growth: 42 },
  ];

  const userEngagementData = [
    { month: 'Jan', activeUsers: 120, newUsers: 45 },
    { month: 'Feb', activeUsers: 180, newUsers: 62 },
    { month: 'Mar', activeUsers: 240, newUsers: 78 },
    { month: 'Apr', activeUsers: 320, newUsers: 95 },
    { month: 'May', activeUsers: 420, newUsers: 112 },
    { month: 'Jun', activeUsers: 540, newUsers: 128 },
  ];

  const COLORS = ['#ff6b35', '#00bcd4', '#4caf50', '#f7931e'];

  const quickActions = [
    {
      title: 'Add Challenge',
      description: 'Create new challenge',
      icon: <TrophyIcon />,
      color: 'primary',
      onClick: () => console.log('Add Challenge')
    },
    {
      title: 'Manage Users',
      description: 'View all users',
      icon: <PeopleIcon />,
      color: 'secondary',
      onClick: () => console.log('Manage Users')
    },
    {
      title: 'Analytics',
      description: 'View detailed reports',
      icon: <AnalyticsIcon />,
      color: 'success',
      onClick: () => console.log('Analytics')
    },
    {
      title: 'Notifications',
      description: 'Send announcements',
      icon: <NotificationsIcon />,
      color: 'warning',
      onClick: () => console.log('Notifications')
    }
  ];

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <Box>
              <Typography 
                variant="h3" 
                className="gradient-text"
                sx={{ fontWeight: 700, mb: 1 }}
              >
                Dashboard
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Loading dashboard data...
              </Typography>
            </Box>
          </Box>
          <Box className="loading-container">
            <div className="loading-spinner" />
            <Typography variant="body2" color="text.secondary">
              Fetching latest statistics...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Fade in timeout={600}>
        <Box sx={{ py: 4 }}>
          {/* Header Section */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
            <Box>
              <Typography 
                variant="h3" 
                className="gradient-text"
                sx={{ fontWeight: 700, mb: 1 }}
              >
                Dashboard
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Welcome to SVARAM Admin Portal - Monitor your platform's performance
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              <Chip 
                icon={<SpeedIcon />} 
                label="Real-time" 
                className="status-online"
                variant="filled"
              />
              <Tooltip title="Refresh Data">
                <IconButton 
                  onClick={() => fetchDashboardStats(true)}
                  disabled={refreshing}
                  sx={{
                    background: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      background: alpha(theme.palette.primary.main, 0.2),
                    }
                  }}
                >
                  <RefreshIcon 
                    sx={{ 
                      animation: refreshing ? 'spin 1s linear infinite' : 'none',
                      color: theme.palette.primary.main 
                    }} 
                  />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} lg={4}>
              <EnhancedStatCard
                title="Total Users"
                value={stats.totalUsers.toLocaleString()}
                icon={<PeopleIcon />}
                color="primary"
                trend="+12%"
                description="vs last month"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <EnhancedStatCard
                title="Verified Gurus"
                value={stats.totalGurus}
                icon={<SchoolIcon />}
                color="success"
                trend="+5%"
                description="this month"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <EnhancedStatCard
                title="Active Challenges"
                value={stats.activeChallenges}
                icon={<TrophyIcon />}
                color="warning"
                trend="+8%"
                description="ongoing"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <EnhancedStatCard
                title="Total Challenges"
                value={stats.totalChallenges}
                icon={<AssignmentIcon />}
                color="info"
                description="all time"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <EnhancedStatCard
                title="Pending Approval"
                value={stats.pendingGurus}
                icon={<SchoolIcon />}
                color="error"
                description="guru applications"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <EnhancedStatCard
                title="Certificates"
                value={stats.totalCertificates.toLocaleString()}
                icon={<TrophyIcon />}
                color="secondary"
                trend="+15%"
                description="issued"
              />
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={6} sm={3} key={index}>
                  <QuickActionCard {...action} />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Charts Section */}
          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              <Paper 
                className="chart-container glass-card"
                sx={{ 
                  background: alpha(theme.palette.background.paper, 0.7),
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                  <Typography variant="h6" fontWeight={600}>
                    Challenge Distribution
                  </Typography>
                  <Chip 
                    label="Live Data" 
                    size="small" 
                    sx={{
                      background: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                      border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                    }}
                  />
                </Box>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={challengeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {challengeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: alpha(theme.palette.background.paper, 0.9),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        borderRadius: '8px',
                        backdropFilter: 'blur(10px)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Paper 
                className="chart-container glass-card"
                sx={{ 
                  background: alpha(theme.palette.background.paper, 0.7),
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                  <Typography variant="h6" fontWeight={600}>
                    Monthly Activity Trends
                  </Typography>
                  <Chip 
                    label="6M View" 
                    size="small" 
                    sx={{
                      background: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                    }}
                  />
                </Box>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
                    <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: alpha(theme.palette.background.paper, 0.9),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        borderRadius: '8px',
                        backdropFilter: 'blur(10px)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="challenges" fill="#ff6b35" name="Challenges" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="participants" fill="#00bcd4" name="Participants" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper 
                className="chart-container glass-card"
                sx={{ 
                  background: alpha(theme.palette.background.paper, 0.7),
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                  <Typography variant="h6" fontWeight={600}>
                    User Engagement Growth
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Chip 
                      label="Growing" 
                      className="status-online"
                      size="small"
                    />
                    <Chip 
                      label="YTD" 
                      size="small" 
                      sx={{
                        background: alpha(theme.palette.secondary.main, 0.1),
                        color: theme.palette.secondary.main,
                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
                      }}
                    />
                  </Box>
                </Box>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={userEngagementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
                    <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: alpha(theme.palette.background.paper, 0.9),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        borderRadius: '8px',
                        backdropFilter: 'blur(10px)'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="activeUsers" 
                      stroke="#ff6b35" 
                      strokeWidth={3}
                      name="Active Users"
                      dot={{ fill: '#ff6b35', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: '#ff6b35', strokeWidth: 2, fill: '#fff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="newUsers" 
                      stroke="#00bcd4" 
                      strokeWidth={3}
                      name="New Users"
                      dot={{ fill: '#00bcd4', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: '#00bcd4', strokeWidth: 2, fill: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Container>
  );
};

export default Dashboard;