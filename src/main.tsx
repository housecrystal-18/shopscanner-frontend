import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { SimpleApp } from './SimpleApp.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'

// Use SimpleApp with AuthProvider wrapper for now
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SimpleApp />
    </AuthProvider>
  </StrictMode>,
)
