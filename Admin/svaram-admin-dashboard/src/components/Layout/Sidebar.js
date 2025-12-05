import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Avatar,
  Chip,
  Tooltip,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  EmojiEvents as TrophyIcon,
  Forum as ForumIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Gavel as ModerationIcon,
  Payment as PaymentIcon,
  Computer as SystemIcon,
  MenuBook as CourseIcon,
  VideoLibrary as VideoIcon,
  Quiz as AssessmentIcon,
  EmojiEvents as CertificateIcon,
  PersonAdd as EnrollmentIcon,
  Api as ApiIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const menuItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
    color: '#6366f1',
  },
  {
    text: 'User Management',
    icon: <PeopleIcon />,
    path: '/users',
    color: '#8b5cf6',
  },
  {
    text: 'Guru Management',
    icon: <SchoolIcon />,
    path: '/gurus',
    color: '#06b6d4',
  },
  {
    text: 'Course Management',
    icon: <CourseIcon />,
    path: '/courses',
    color: '#3b82f6',
  },
  {
    text: 'Video Management',
    icon: <VideoIcon />,
    path: '/videos',
    color: '#10b981',
  },
  {
    text: 'Challenge Management',
    icon: <TrophyIcon />,
    path: '/challenges',
    color: '#f59e0b',
  },
  {
    text: 'Community Management',
    icon: <ForumIcon />,
    path: '/community',
    color: '#00bcd4',
  },
  {
    text: 'Assessment Management',
    icon: <AssessmentIcon />,
    path: '/assessments',
    color: '#ff5722',
  },
  {
    text: 'Certificate Management',
    icon: <CertificateIcon />,
    path: '/certificates',
    color: '#ffc107',
  },
  {
    text: 'Enrollment Management',
    icon: <EnrollmentIcon />,
    path: '/enrollments',
    color: '#795548',
  },
  {
    text: 'Payment Management',
    icon: <PaymentIcon />,
    path: '/payments',
    color: '#4caf50',
  },
  {
    text: 'Content Moderation',
    icon: <ModerationIcon />,
    path: '/moderation',
    color: '#f44336',
  },
  {
    text: 'Analytics',
    icon: <AnalyticsIcon />,
    path: '/analytics',
    color: '#607d8b',
  },
  {
    text: 'System Management',
    icon: <SystemIcon />,
    path: '/system',
    color: '#3f51b5',
  },
  {
    text: 'API Testing',
    icon: <ApiIcon />,
    path: '/api-test',
    color: '#00e676',
  },
  {
    text: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
    color: '#757575',
  },
];

const Sidebar = ({ open, collapsed, onClose, isDesktop }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();

  const drawerWidth = collapsed ? 72 : 280;

  const handleNavigation = (path) => {
    navigate(path);
    if (!isDesktop) {
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box
      sx={{
        width: drawerWidth,
        height: '100%',
        background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
        borderRight: '1px solid rgba(99, 102, 241, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: collapsed ? 1 : 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
          minHeight: 64,
          background: 'rgba(99, 102, 241, 0.05)',
        }}
      >
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                mr: 2,
                fontSize: '1.2rem',
              }}
            >
              🕉️
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '1.1rem',
                }}
              >
                SVARAM
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                Admin Portal
              </Typography>
            </Box>
          </Box>
        )}
        
        {isDesktop && (
          <IconButton
            onClick={() => {}}
            sx={{ 
              color: '#6366f1',
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
              }
            }}
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
      </Box>

      {/* User Info */}
      {!collapsed && (
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
            background: 'rgba(99, 102, 241, 0.03)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar
              src={user?.avatar}
              sx={{
                width: 32,
                height: 32,
                mr: 2,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              }}
            >
              {user?.firstName?.[0] || 'A'}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: '#1e293b',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.firstName || 'Admin'} {user?.lastName || 'User'}
              </Typography>
              <Chip
                label="Admin"
                size="small"
                sx={{
                  fontSize: '0.7rem',
                  height: 20,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            </Box>
          </Box>
        </Box>
      )}

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, px: 1, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Tooltip
              key={item.text}
              title={collapsed ? item.text : ''}
              placement="right"
              disableHoverListener={!collapsed}
            >
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 48,
                    px: collapsed ? 1.5 : 2,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    background: isActive
                      ? `linear-gradient(135deg, ${item.color}20 0%, ${item.color}10 100%)`
                      : 'transparent',
                    border: isActive
                      ? `1px solid ${item.color}40`
                      : '1px solid transparent',
                    '&:hover': {
                      background: `linear-gradient(135deg, ${item.color}15 0%, ${item.color}05 100%)`,
                      border: `1px solid ${item.color}30`,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? 0 : 40,
                      justifyContent: 'center',
                      color: isActive ? item.color : '#64748b',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? item.color : '#334155',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      {/* Logout Button */}
      <Box sx={{ p: 1 }}>
        <Tooltip title={collapsed ? 'Logout' : ''} placement="right">
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              minHeight: 48,
              px: collapsed ? 1.5 : 2,
              justifyContent: collapsed ? 'center' : 'flex-start',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              '&:hover': {
                background: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid rgba(244, 67, 54, 0.5)',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: collapsed ? 0 : 40,
                justifyContent: 'center',
                color: '#f44336',
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#f44336',
                }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  if (isDesktop) {
    return (
      <Drawer
        variant="persistent"
        anchor="left"
        open={true}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            border: 'none',
            background: 'transparent',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          border: 'none',
          background: 'transparent',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;