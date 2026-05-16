import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { CourseDto } from '../types/api';

export function CoursePicker({
  courses,
  value,
  onChange,
  label,
}: {
  courses: CourseDto[];
  value: string;
  onChange: (courseId: string) => void;
  label?: string;
}) {
  const { t } = useTranslation();
  const resolvedLabel = label ?? t('course');
  const selectedCourse = courses.find((course) => course.id === value);
  const safeValue = selectedCourse ? value : '';

  return (
    <FormControl fullWidth>
      <InputLabel>{resolvedLabel}</InputLabel>
      <Select
        label={resolvedLabel}
        value={safeValue}
        onChange={(event) => onChange(event.target.value)}
        renderValue={(selected) => {
          const course = courses.find((item) => item.id === selected);
          return course ? `${course.code} - ${course.name}` : '';
        }}
      >
        {courses.map((course) => (
          <MenuItem key={course.id} value={course.id}>
            {course.code} - {course.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
