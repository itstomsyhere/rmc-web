import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { router } from './router'
import './index.css'
import './test-bridge'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <Toaster position="top-center" richColors closeButton toastOptions={{ className: 'font-sans', duration: 3800 }} />
  </React.StrictMode>,
)
