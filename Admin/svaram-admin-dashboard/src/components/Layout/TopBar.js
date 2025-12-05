import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  InputBase,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountIcon,
  ExitToApp as LogoutIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const TopBar = ({ onMenuClick, open }) => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        background: 'rgba(99, 102, 241, 0.1)',
        backdropFilter: 'blur(20px)',
        border: 'none',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 30px rgba(99, 102, 241, 0.15)',
        zIndex: theme.zIndex.drawer + 1,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      elevation={0}
    >
      <Toolbar sx={{ px: { xs: 2, md: 3 } }}>
        {/* Logo & Brand */}
        <Box display="flex" alignItems="center" sx={{ mr: 3 }}>
          <DashboardIcon 
            sx={{ 
              fontSize: '2rem',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              borderRadius: '8px',
              p: 0.5,
              color: 'white',
              mr: 1
            }}
          />
          <Typography
            variant="h5"
            noWrap
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}
          >
            SVARAM
          </Typography>
        </Box>

        {/* Search Bar */}
        <Box
          sx={{
            position: 'relative',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            },
            '&:focus-within': {
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.5)',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
            },
            ml: 1,
            mr: 2,
            width: { xs: '40%', md: '30%' },
            transition: 'all 0.3s ease',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: 1.5,
              pointerEvents: 'none',
            }}
          >
            <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
          </Box>
          <InputBase
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              color: 'white',
              width: '100%',
              pl: 6,
              pr: 2,
              py: 1,
              '& .MuiInputBase-input': {
                transition: 'width 0.3s ease',
                '&::placeholder': {
                  color: 'rgba(255, 255, 255, 0.6)',
                  opacity: 1,
                },
              },
            }}
          />
        </Box>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Action Buttons */}
        <Box display="flex" alignItems="center" gap={1}>
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              onClick={handleNotificationOpen}
              sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.2)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Settings */}
          <Tooltip title="Settings">
            <IconButton
              sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.2)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          {/* Profile */}
          <Tooltip title="Profile">
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{
                p: 0,
                ml: 1,
                '&:hover': {
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  fontWeight: 600,
                }}
              >
                {user?.name?.charAt(0) || 'A'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          sx={{
            '& .MuiPaper-root': {
              background: 'rgba(26, 31, 75, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              boxShadow: '0 8px 40px rgba(0, 0, 0, 0.3)',
              mt: 1,
              minWidth: 200,
            },
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              {user?.name || 'Admin User'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {user?.email || 'admin@svaram.com'}
            </Typography>
          </Box>
          <MenuItem
            onClick={handleProfileMenuClose}
            sx={{
              color: 'white',
              '&:hover': {
                background: 'rgba(99, 102, 241, 0.2)',
              },
            }}
          >
            <AccountIcon sx={{ mr: 2 }} />
            Profile
          </MenuItem>
          <MenuItem
            onClick={handleProfileMenuClose}
            sx={{
              color: 'white',
              '&:hover': {
                background: 'rgba(99, 102, 241, 0.2)',
              },
            }}
          >
            <SettingsIcon sx={{ mr: 2 }} />
            Settings
          </MenuItem>
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
          <MenuItem
            onClick={handleLogout}
            sx={{
              color: '#ef4444',
              '&:hover': {
                background: 'rgba(239, 68, 68, 0.1)',
              },
            }}
          >
            <LogoutIcon sx={{ mr: 2 }} />
            Logout
          </MenuItem>
        </Menu>

        {/* Notification Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          sx={{
            '& .MuiPaper-root': {
              background: 'rgba(26, 31, 75, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              boxShadow: '0 8px 40px rgba(0, 0, 0, 0.3)',
              mt: 1,
              minWidth: 300,
              maxWidth: 400,
            },
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              Notifications
            </Typography>
          </Box>
          {[1, 2, 3].map((notification) => (
            <MenuItem
              key={notification}
              onClick={handleNotificationClose}
              sx={{
                color: 'white',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                '&:hover': {
                  background: 'rgba(99, 102, 241, 0.1)',
                },
                py: 1.5,
              }}
            >
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  New user registered
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  John Doe just created an account
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  2 minutes ago
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;