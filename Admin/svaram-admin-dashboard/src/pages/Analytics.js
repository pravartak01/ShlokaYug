import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  EmojiEvents as TrophyIcon,
  Forum as ForumIcon,
} from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('last30days');
  const [userStats, setUserStats] = useState({});
  const [challengeStats, setChallengeStats] = useState({});
  const [loading, setLoading] = useState(true);

  const { getDashboardStats } = useApi();

  // Real data will be populated from API calls
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [challengeCompletionData, setChallengeCompletionData] = useState([]);
  const [engagementData, setEngagementData] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await getDashboardStats();
      if (response.success && response.data) {
        setUserStats({
          totalUsers: response.data.overview?.totalUsers || 0,
          activeUsers: response.data.overview?.activeStudents || 0,
          newUsers: 0, // Real calculation needed
          retentionRate: 0 // Real calculation needed
        });
        setChallengeStats({
          totalChallenges: response.data.overview?.totalChallenges || 0,
          activeChallenges: response.data.overview?.activeChallenges || 0,
          completedChallenges: 0, // Real calculation needed
          averageCompletion: 0 // Real calculation needed
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Set zero values on error - no mock data
      setUserStats({
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
        retentionRate: 0
      });
      setChallengeStats({
        totalChallenges: 0,
        activeChallenges: 0,
        completedChallenges: 0,
        averageCompletion: 0
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Analytics & Reports
        </Typography>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
          >
            <MenuItem value="last7days">Last 7 Days</MenuItem>
            <MenuItem value="last30days">Last 30 Days</MenuItem>
            <MenuItem value="last90days">Last 90 Days</MenuItem>
            <MenuItem value="lastyear">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h5">
                    {userStats.totalUsers || 0}
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    +{userStats.newUsers || 0} this month
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Users
                  </Typography>
                  <Typography variant="h5">
                    {userStats.activeUsers || 0}
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    {userStats.retentionRate || 0}% retention
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrophyIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Challenges Completed
                  </Typography>
                  <Typography variant="h5">
                    {challengeStats.completedChallenges || 0}
                  </Typography>
                  <Typography variant="caption" color="warning.main">
                    {challengeStats.completionRate || 0}% success rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ForumIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Average Score
                  </Typography>
                  <Typography variant="h5">
                    {challengeStats.averageScore || 0}%
                  </Typography>
                  <Typography variant="caption" color="info.main">
                    Performance metric
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Growth Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#8884d8" name="Total Users" />
                  <Line type="monotone" dataKey="active" stroke="#82ca9d" name="Active Users" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Community Engagement
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={engagementData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {engagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Challenge Completion Rates
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={challengeCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
                  <Bar dataKey="total" fill="#8884d8" name="Total Attempts" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Performers
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell align="right">Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topPerformers.map((performer, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2">
                            {performer.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {performer.challenges} challenges
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            {performer.score}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;