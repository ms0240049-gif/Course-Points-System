import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import App from './App.tsx'
import { createAppTheme } from './app/theme.ts'
import './app/i18n.ts'
import { useUiStore } from './store/uiStore.ts'
import { useTranslation } from 'react-i18next'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function Root() {
  const mode = useUiStore((state) => state.mode)
  const { i18n } = useTranslation()
  const direction = i18n.language === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.dir = direction
  document.documentElement.lang = i18n.language
  const theme = createAppTheme(mode, direction)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <App />
        <ToastContainer position={direction === 'rtl' ? 'top-left' : 'top-right'} autoClose={2500} rtl={direction === 'rtl'} />
      </QueryClientProvider>
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
