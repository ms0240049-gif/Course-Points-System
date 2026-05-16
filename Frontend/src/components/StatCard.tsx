import type { ReactNode } from 'react';
import { Card, CardContent, Stack, Typography } from '@mui/material';

export function StatCard({ title, value, icon }: { title: string; value: ReactNode; icon?: ReactNode }) {
  return (
    <Card sx={{ position: 'relative' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }} spacing={2}>
          <div>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ mt: 0.5 }}>
              {value}
            </Typography>
          </div>
          {icon && (
            <Stack
              sx={{
                width: 58,
                height: 58,
                borderRadius: 2,
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'action.hover',
                color: 'primary.main',
              }}
            >
              {icon}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
