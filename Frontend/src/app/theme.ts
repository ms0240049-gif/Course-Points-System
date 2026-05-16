import { alpha, createTheme } from '@mui/material/styles';

export const createAppTheme = (mode: 'light' | 'dark', direction: 'ltr' | 'rtl') => {
  const isLight = mode === 'light';
  const primary = '#2478b8';
  const secondary = '#0f9f88';

  return createTheme({
    direction,
    palette: {
      mode,
      primary: { main: primary, light: '#5ba3dc', dark: '#155786' },
      secondary: { main: secondary, light: '#4fd1bd', dark: '#087064' },
      success: { main: '#16a34a' },
      warning: { main: '#f59e0b' },
      error: { main: '#dc2626' },
      background: isLight
        ? { default: '#f3f7fb', paper: '#ffffff' }
        : { default: '#08111f', paper: '#101b2d' },
      text: isLight
        ? { primary: '#102033', secondary: '#5d6f85' }
        : { primary: '#f8fbff', secondary: '#b8c6d8' },
      divider: isLight ? 'rgba(15, 32, 51, 0.1)' : 'rgba(184, 198, 216, 0.16)',
    },
    typography: {
      fontFamily: ['Inter', 'Segoe UI', 'Tahoma', 'Arial', 'sans-serif'].join(','),
      h4: { fontWeight: 900, letterSpacing: 0 },
      h5: { fontWeight: 850, letterSpacing: 0 },
      h6: { fontWeight: 800, letterSpacing: 0 },
      button: { textTransform: 'none', fontWeight: 800, letterSpacing: 0 },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: isLight
              ? 'radial-gradient(circle at 10% 0%, rgba(36,120,184,0.10), transparent 28%), radial-gradient(circle at 95% 8%, rgba(15,159,136,0.10), transparent 24%)'
              : 'radial-gradient(circle at 10% 0%, rgba(91,163,220,0.16), transparent 28%), radial-gradient(circle at 95% 8%, rgba(79,209,189,0.12), transparent 24%)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${isLight ? 'rgba(15, 32, 51, 0.08)' : 'rgba(184, 198, 216, 0.14)'}`,
            backgroundImage: isLight
              ? 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.92))'
              : 'linear-gradient(180deg, rgba(16,27,45,0.98), rgba(13,23,39,0.94))',
            boxShadow: isLight
              ? '0 16px 42px rgba(15, 32, 51, 0.08)'
              : '0 18px 46px rgba(0, 0, 0, 0.34)',
            overflow: 'hidden',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 8, minHeight: 40, paddingInline: 18 },
          contained: {
            backgroundImage: `linear-gradient(135deg, ${primary}, ${secondary})`,
            color: '#ffffff',
            '&:hover': {
              backgroundImage: `linear-gradient(135deg, #155786, #087064)`,
            },
          },
          outlined: {
            borderColor: isLight ? 'rgba(36,120,184,0.35)' : 'rgba(91,163,220,0.55)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 800 },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            color: isLight ? '#334155' : '#dbeafe',
            fontWeight: 900,
            backgroundColor: isLight ? alpha(primary, 0.06) : alpha(primary, 0.16),
          },
          root: {
            borderBottomColor: isLight ? 'rgba(15, 32, 51, 0.08)' : 'rgba(184, 198, 216, 0.12)',
          },
        },
      },
      MuiTextField: {
        defaultProps: { fullWidth: true },
      },
      MuiFormControl: {
        defaultProps: { fullWidth: true },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? '#ffffff' : 'rgba(255,255,255,0.035)',
          },
          input: {
            minWidth: 0,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(18px)',
            backgroundColor: isLight ? 'rgba(255,255,255,0.82)' : 'rgba(8,17,31,0.78)',
          },
        },
      },
    },
  });
};
