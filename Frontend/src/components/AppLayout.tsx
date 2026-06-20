import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Stack,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PasswordIcon from '@mui/icons-material/Password';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import ChecklistIcon from '@mui/icons-material/Checklist';
import QuizIcon from '@mui/icons-material/Quiz';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import EditNoteIcon from '@mui/icons-material/EditNote';
import EventIcon from '@mui/icons-material/Event';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import TranslateIcon from '@mui/icons-material/Translate';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';

const drawerWidth = 288;
const collapsedDrawerWidth = 86;

const adminLinks = [
  { to: '/admin', label: 'dashboard', icon: <DashboardIcon /> },
  { to: '/admin/courses', label: 'courses', icon: <SchoolIcon /> },
  { to: '/admin/students', label: 'students', icon: <PeopleIcon /> },
  { to: '/admin/instructors', label: 'instructors', icon: <PeopleIcon /> },
  { to: '/admin/assign-student', label: 'assignStudent', icon: <PeopleIcon /> },
  { to: '/admin/sessions', label: 'sessions', icon: <EventIcon /> },
  { to: '/admin/attendance', label: 'attendance', icon: <ChecklistIcon /> },
  { to: '/admin/question-points', label: 'questions', icon: <QuizIcon /> },
  { to: '/admin/contest-points', label: 'contests', icon: <MilitaryTechIcon /> },
  { to: '/admin/manual-points', label: 'manualPoints', icon: <EditNoteIcon /> },
  { to: '/admin/leaderboard', label: 'leaderboard', icon: <EmojiEventsIcon /> },
  { to: '/change-password', label: 'changePassword', icon: <PasswordIcon /> },
];

const instructorLinks = [
  { to: '/instructor', label: 'dashboard', icon: <DashboardIcon /> },
  { to: '/instructor/courses', label: 'myCourses', icon: <SchoolIcon /> },
  { to: '/instructor/students', label: 'students', icon: <PeopleIcon /> },
  { to: '/instructor/instructors', label: 'instructors', icon: <PeopleIcon /> },
  { to: '/instructor/assign-student', label: 'assignStudent', icon: <PeopleIcon /> },
  { to: '/instructor/attendance', label: 'bulkAttendance', icon: <ChecklistIcon /> },
  { to: '/instructor/question-points', label: 'questions', icon: <QuizIcon /> },
  { to: '/instructor/contest-points', label: 'contests', icon: <MilitaryTechIcon /> },
  { to: '/instructor/manual-points', label: 'manualPoints', icon: <EditNoteIcon /> },
  { to: '/instructor/leaderboard', label: 'leaderboard', icon: <EmojiEventsIcon /> },
  { to: '/change-password', label: 'changePassword', icon: <PasswordIcon /> },
];

const studentLinks = [
  { to: '/student', label: 'dashboard', icon: <DashboardIcon /> },
  { to: '/student/my-points', label: 'myPoints', icon: <SchoolIcon /> },
  { to: '/student/leaderboard', label: 'leaderboard', icon: <EmojiEventsIcon /> },
  { to: '/change-password', label: 'changePassword', icon: <PasswordIcon /> },
];

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
  const { user, refreshToken, clearAuth } = useAuthStore();
  const { t, i18n } = useTranslation();
  const mode = useUiStore((state) => state.mode);
  const toggleMode = useUiStore((state) => state.toggleMode);
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const drawerAnchor = theme.direction === 'rtl' ? 'right' : 'left';
  const links = user?.role === 'Admin' ? adminLinks : user?.role === 'Instructor' ? instructorLinks : studentLinks;

  const logout = async () => {
    try {
      if (refreshToken) await authApi.logout({ refreshToken });
    } finally {
      clearAuth();
      toast.success(t('signedOut'));
      navigate('/login', { replace: true });
    }
  };

  const isRtl = theme.direction === 'rtl';
  const activeDrawerWidth = collapsed ? collapsedDrawerWidth : drawerWidth;

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      localStorage.setItem('sidebarCollapsed', String(!value));
      return !value;
    });
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: collapsed ? 1.5 : 2.25, py: 2 }}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', minWidth: 0 }}>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Box
            component="img"
            src="/it-club-logo.jpg"
            alt="IT Club"
            sx={{
              width: 58,
              height: 58,
              objectFit: 'contain',
              borderRadius: 2,
              bgcolor: '#eef2f7',
              p: 0.5,
              boxShadow: '0 10px 24px rgba(36, 120, 184, 0.18)',
            }}
          />
          {!collapsed && <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ lineHeight: 1.1, whiteSpace: 'nowrap' }}>IT Club</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', whiteSpace: 'nowrap' }}>{t('brandSubtitle')}</Typography>
          </Box>}
          </Stack>
          {isDesktop && (
            <IconButton size="small" onClick={toggleCollapsed} sx={{ bgcolor: 'action.hover' }}>
              {collapsed
                ? (isRtl ? <ChevronLeftIcon /> : <ChevronRightIcon />)
                : (isRtl ? <ChevronRightIcon /> : <ChevronLeftIcon />)}
            </IconButton>
          )}
        </Stack>
      </Box>
      <Divider />
      <List sx={{ px: collapsed ? 1 : 1.5, py: 2, flex: 1 }}>
        {links.map((link) => (
          <ListItemButton
            key={link.to}
            component={NavLink}
            to={link.to}
            end={link.label === 'dashboard'}
            onClick={() => setMobileOpen(false)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              minHeight: 48,
              px: collapsed ? 0 : 1.25,
              justifyContent: collapsed ? 'center' : 'flex-start',
              alignItems: 'center',
              transition: 'all 160ms ease',
              '&:hover': { transform: isRtl ? 'translateX(-3px)' : 'translateX(3px)', bgcolor: 'action.hover' },
              '&.active': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                boxShadow: '0 12px 24px rgba(36, 120, 184, 0.24)',
                '& .MuiListItemIcon-root': { color: 'inherit' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? 0 : 38, color: 'text.secondary', justifyContent: 'center' }}>{link.icon}</ListItemIcon>
            {!collapsed && <ListItemText
              primary={(
                <Typography sx={{ fontSize: 14, fontWeight: 800, lineHeight: 1.35, overflowWrap: 'anywhere' }}>
                  {t(link.label)}
                </Typography>
              )}
            />}
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ p: 2 }}>
        {collapsed ? (
          <IconButton color="inherit" onClick={logout} sx={{ width: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <LogoutIcon />
          </IconButton>
        ) : (
          <Button fullWidth variant="outlined" color="inherit" startIcon={<LogoutIcon />} onClick={logout}>
            {t('logout')}
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        color="inherit"
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
          width: { md: `calc(100% - ${activeDrawerWidth}px)` },
          ...(isRtl
            ? { right: { xs: 0, md: `${activeDrawerWidth}px` }, left: 0 }
            : { left: { xs: 0, md: `${activeDrawerWidth}px` }, right: 0 }),
        }}
      >
        <Toolbar sx={{ gap: { xs: 1, sm: 1.5 }, flexWrap: { xs: 'wrap', sm: 'nowrap' }, py: { xs: 1, sm: 0 } }}>
          {!isDesktop && (
            <IconButton onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ flex: '1 1 180px', minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: { xs: 'none', sm: 'block' } }}>
              {user?.email}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flex: { xs: '1 1 100%', sm: '0 0 auto' }, justifyContent: { xs: 'space-between', sm: 'flex-start' }, minWidth: 0 }}>
            <Chip label={user?.role ? t(`role${user.role}`) : ''} color={user?.role === 'Admin' ? 'primary' : user?.role === 'Instructor' ? 'warning' : 'secondary'} sx={{ maxWidth: 110 }} />
            <IconButton
              aria-label={t('language')}
              onClick={() => {
                const language = i18n.language === 'ar' ? 'en' : 'ar';
                localStorage.setItem('language', language);
                void i18n.changeLanguage(language);
              }}
              sx={{ bgcolor: 'action.hover' }}
            >
              <TranslateIcon />
            </IconButton>
            <Chip label={i18n.language === 'ar' ? 'AR' : 'EN'} variant="outlined" sx={{ minWidth: 46, justifyContent: 'center' }} />
            <IconButton onClick={toggleMode} aria-label={t('theme')} sx={{ bgcolor: 'action.hover' }}>
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
            <Avatar sx={{ width: 36, height: 36 }}>{user?.fullName?.charAt(0) ?? 'U'}</Avatar>
          </Stack>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { md: activeDrawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer anchor={drawerAnchor} variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth, maxWidth: '86vw' } }}>
          {drawer}
        </Drawer>
        <Drawer
          anchor={drawerAnchor}
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: activeDrawerWidth,
              borderColor: 'divider',
              transition: theme.transitions.create('width', { duration: theme.transitions.duration.shorter }),
              overflowX: 'hidden',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          minWidth: 0,
          p: { xs: 2, md: 3 },
          pt: { xs: 14, sm: 11, md: 12 },
          width: { xs: '100%', md: `calc(100% - ${activeDrawerWidth}px)` },
          transition: theme.transitions.create(['margin', 'width'], { duration: theme.transitions.duration.shorter }),
          ...(isRtl ? { mr: { md: `${activeDrawerWidth}px` } } : { ml: { md: `${activeDrawerWidth}px` } }),
        }}
      >
        <Box className="page-shell">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
