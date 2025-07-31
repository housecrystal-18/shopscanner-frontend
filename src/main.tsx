import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { SimpleApp } from './SimpleApp.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'

// Full Shop Scanner app with AuthProvider
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SimpleApp />
    </AuthProvider>
  </StrictMode>,
)
