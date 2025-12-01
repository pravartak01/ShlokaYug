import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  EmojiEvents as TrophyIcon,
  Forum as ForumIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useApi } from '../contexts/ApiContext';

const StatCard = ({ title, value, icon, color, trend }) => (
  <Card elevation={2}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="h2">
            {value}
          </Typography>
          {trend && (
            <Box display="flex" alignItems="center" mt={1}>
              <TrendingUpIcon color="success" fontSize="small" />
              <Typography variant="body2" color="success.main" ml={0.5}>
                {trend}
              </Typography>
            </Box>
          )}
        </Box>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGurus: 0,
    totalChallenges: 0,
    activeChallenges: 0,
    pendingGurus: 0,
    totalCertificates: 0,
  });
  const [loading, setLoading] = useState(true);
  const { getDashboardStats } = useApi();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
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
    }
  };

  // Mock data for charts
  const challengeData = [
    { name: 'Shloka Recitation', value: 35 },
    { name: 'Chandas Analysis', value: 25 },
    { name: 'Translation', value: 20 },
    { name: 'Pronunciation', value: 20 },
  ];

  const monthlyData = [
    { name: 'Jan', challenges: 12, participants: 89 },
    { name: 'Feb', challenges: 15, participants: 124 },
    { name: 'Mar', challenges: 18, participants: 156 },
    { name: 'Apr', challenges: 22, participants: 198 },
    { name: 'May', challenges: 25, participants: 234 },
    { name: 'Jun', challenges: 28, participants: 276 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Welcome to SVARAM Admin Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={<PeopleIcon />}
            color="primary.main"
            trend="+12%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Active Gurus"
            value={stats.totalGurus}
            icon={<SchoolIcon />}
            color="success.main"
            trend="+5%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Challenges"
            value={stats.totalChallenges}
            icon={<TrophyIcon />}
            color="warning.main"
            trend="+8%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Active Challenges"
            value={stats.activeChallenges}
            icon={<AssignmentIcon />}
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Pending Gurus"
            value={stats.pendingGurus}
            icon={<SchoolIcon />}
            color="error.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Certificates Issued"
            value={stats.totalCertificates.toLocaleString()}
            icon={<TrophyIcon />}
            color="secondary.main"
            trend="+15%"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Challenge Types Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={challengeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {challengeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Activity
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="challenges" fill="#8884d8" name="Challenges" />
                <Bar dataKey="participants" fill="#82ca9d" name="Participants" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;