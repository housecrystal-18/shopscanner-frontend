import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Minimal test component
function TestApp() {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">🎉 Shop Scanner Works!</h1>
        <p className="text-gray-700 mb-4">The deployment is successful and the app is loading correctly.</p>
        <div className="space-y-2 text-sm text-gray-600">
          <p>✅ React app initialized</p>
          <p>✅ Tailwind CSS working</p>
          <p>✅ Vercel deployment active</p>
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TestApp />
  </StrictMode>,
)
