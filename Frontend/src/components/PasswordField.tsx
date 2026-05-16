import { useState } from 'react';
import { IconButton, InputAdornment, TextField, type TextFieldProps } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export function PasswordField(props: TextFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();

  return (
    <TextField
      {...props}
      type={showPassword ? 'text' : 'password'}
      dir={theme.direction}
      slotProps={{
        ...props.slotProps,
        input: {
          ...props.slotProps?.input,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                edge="end"
                onClick={() => setShowPassword((value) => !value)}
                onMouseDown={(event) => event.preventDefault()}
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
