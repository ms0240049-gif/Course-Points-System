import axios from 'axios';

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { title?: string; detail?: string; message?: string } | undefined;
    return data?.detail ?? data?.title ?? data?.message ?? error.message;
  }
  return error instanceof Error ? error.message : 'Something went wrong.';
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}

export function pointTypeLabel(type: number) {
  return {
    1: 'Attendance',
    2: 'Question',
    3: 'Mini contest',
    4: 'Manual',
  }[type] ?? 'Points';
}
