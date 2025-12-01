import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as ActivateIcon,
  Visibility as ViewIcon,
  EmojiEvents as TrophyIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useApi } from '../contexts/ApiContext';

const challengeTypes = [
  { value: 'shloka_recitation', label: 'Shloka Recitation' },
  { value: 'chandas_analysis', label: 'Chandas Analysis' },
  { value: 'translation', label: 'Translation' },
  { value: 'pronunciation', label: 'Pronunciation' },
  { value: 'memorization', label: 'Memorization' },
  { value: 'comprehension', label: 'Comprehension' },
  { value: 'practice_streak', label: 'Practice Streak' },
  { value: 'community_engagement', label: 'Community Engagement' },
];

const difficultyLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const categories = [
  { value: 'bhagavad_gita', label: 'Bhagavad Gita' },
  { value: 'ramayana', label: 'Ramayana' },
  { value: 'vedas', label: 'Vedas' },
  { value: 'upanishads', label: 'Upanishads' },
  { value: 'puranas', label: 'Puranas' },
  { value: 'general', label: 'General' },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'success';
    case 'draft': return 'default';
    case 'completed': return 'info';
    case 'cancelled': return 'error';
    default: return 'default';
  }
};

const ChallengeManagement = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const {
    getChallenges,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    activateChallenge,
  } = useApi();

  const [challengeForm, setChallengeForm] = useState({
    title: '',
    description: '',
    type: '',
    difficulty: 'beginner',
    category: 'general',
    startDate: '',
    endDate: '',
    rewards: {
      points: 100,
      badge: {
        name: '',
        description: '',
      },
    },
    requirements: {
      targetCount: 1,
      category: 'general',
      difficulty: 'beginner',
      minLevel: 1,
      estimatedDuration: 30,
    },
  });

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const response = await getChallenges();
      setChallenges(response.data || []);
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
      showSnackbar('Failed to fetch challenges', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (challenge = null) => {
    if (challenge) {
      setEditingChallenge(challenge);
      setChallengeForm({
        title: challenge.title || '',
        description: challenge.description || '',
        type: challenge.type || '',
        difficulty: challenge.difficulty || 'beginner',
        category: challenge.category || 'general',
        startDate: challenge.startDate ? new Date(challenge.startDate).toISOString().split('T')[0] : '',
        endDate: challenge.endDate ? new Date(challenge.endDate).toISOString().split('T')[0] : '',
        rewards: {
          points: challenge.rewards?.points || 100,
          badge: {
            name: challenge.rewards?.badge?.name || '',
            description: challenge.rewards?.badge?.description || '',
          },
        },
        requirements: {
          targetCount: challenge.requirements?.targetCount || 1,
          category: challenge.requirements?.category || 'general',
          difficulty: challenge.requirements?.difficulty || 'beginner',
          minLevel: challenge.requirements?.minLevel || 1,
          estimatedDuration: challenge.requirements?.estimatedDuration || 30,
        },
      });
    } else {
      setEditingChallenge(null);
      setChallengeForm({
        title: '',
        description: '',
        type: '',
        difficulty: 'beginner',
        category: 'general',
        startDate: '',
        endDate: '',
        rewards: {
          points: 100,
          badge: {
            name: '',
            description: '',
          },
        },
        requirements: {
          targetCount: 1,
          category: 'general',
          difficulty: 'beginner',
          minLevel: 1,
          estimatedDuration: 30,
        },
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingChallenge(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingChallenge) {
        await updateChallenge(editingChallenge._id, challengeForm);
        showSnackbar('Challenge updated successfully');
      } else {
        await createChallenge(challengeForm);
        showSnackbar('Challenge created successfully');
      }
      handleCloseDialog();
      fetchChallenges();
    } catch (error) {
      console.error('Failed to save challenge:', error);
      showSnackbar('Failed to save challenge', 'error');
    }
  };

  const handleDelete = async (challengeId) => {
    if (window.confirm('Are you sure you want to delete this challenge?')) {
      try {
        await deleteChallenge(challengeId);
        showSnackbar('Challenge deleted successfully');
        fetchChallenges();
      } catch (error) {
        console.error('Failed to delete challenge:', error);
        showSnackbar('Failed to delete challenge', 'error');
      }
    }
  };

  const handleActivate = async (challengeId) => {
    try {
      await activateChallenge(challengeId);
      showSnackbar('Challenge activated successfully');
      fetchChallenges();
    } catch (error) {
      console.error('Failed to activate challenge:', error);
      showSnackbar('Failed to activate challenge', 'error');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Challenge Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Challenge
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssignmentIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Challenges
                  </Typography>
                  <Typography variant="h6">
                    {challenges.length}
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
                <TrophyIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Challenges
                  </Typography>
                  <Typography variant="h6">
                    {challenges.filter(c => c.status === 'active').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Challenges Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Difficulty</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Rewards</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {challenges.map((challenge) => (
              <TableRow key={challenge._id}>
                <TableCell>{challenge.title}</TableCell>
                <TableCell>
                  <Chip 
                    label={challengeTypes.find(t => t.value === challenge.type)?.label || challenge.type}
                    size="small"
                  />
                </TableCell>
                <TableCell>{challenge.difficulty}</TableCell>
                <TableCell>
                  <Chip 
                    label={challenge.status}
                    color={getStatusColor(challenge.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {challenge.startDate ? new Date(challenge.startDate).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  {challenge.endDate ? new Date(challenge.endDate).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>{challenge.rewards?.points || 0} points</TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton 
                      size="small"
                      onClick={() => handleOpenDialog(challenge)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  {challenge.status === 'draft' && (
                    <Tooltip title="Activate">
                      <IconButton 
                        size="small"
                        onClick={() => handleActivate(challenge._id)}
                        color="success"
                      >
                        <ActivateIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Delete">
                    <IconButton 
                      size="small"
                      onClick={() => handleDelete(challenge._id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Challenge Title"
                value={challengeForm.title}
                onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={challengeForm.description}
                onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Challenge Type</InputLabel>
                <Select
                  value={challengeForm.type}
                  onChange={(e) => setChallengeForm({ ...challengeForm, type: e.target.value })}
                >
                  {challengeTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={challengeForm.difficulty}
                  onChange={(e) => setChallengeForm({ ...challengeForm, difficulty: e.target.value })}
                >
                  {difficultyLevels.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                value={challengeForm.startDate}
                onChange={(e) => setChallengeForm({ ...challengeForm, startDate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                InputLabelProps={{ shrink: true }}
                value={challengeForm.endDate}
                onChange={(e) => setChallengeForm({ ...challengeForm, endDate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Reward Points"
                value={challengeForm.rewards.points}
                onChange={(e) => setChallengeForm({
                  ...challengeForm,
                  rewards: { ...challengeForm.rewards, points: parseInt(e.target.value) }
                })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Target Count"
                value={challengeForm.requirements.targetCount}
                onChange={(e) => setChallengeForm({
                  ...challengeForm,
                  requirements: { ...challengeForm.requirements, targetCount: parseInt(e.target.value) }
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Badge Name"
                value={challengeForm.rewards.badge.name}
                onChange={(e) => setChallengeForm({
                  ...challengeForm,
                  rewards: {
                    ...challengeForm.rewards,
                    badge: { ...challengeForm.rewards.badge, name: e.target.value }
                  }
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingChallenge ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChallengeManagement;