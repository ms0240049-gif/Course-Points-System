import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { StudentDto } from '../types/api';

export function StudentPicker({
  students,
  value,
  onChange,
  label,
}: {
  students: StudentDto[];
  value: string;
  onChange: (studentId: string) => void;
  label?: string;
}) {
  const { t } = useTranslation();
  const resolvedLabel = label ?? t('student');

  return (
    <FormControl fullWidth>
      <InputLabel>{resolvedLabel}</InputLabel>
      <Select label={resolvedLabel} value={value} onChange={(event) => onChange(event.target.value)}>
        {students.map((student) => (
          <MenuItem key={student.id} value={student.id}>
            {student.fullName} - {student.email}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
