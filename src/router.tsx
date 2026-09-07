import { createHashRouter, Navigate } from 'react-router-dom'
import { Shell } from '@/components/layout/Shell'
import { LandingPage } from '@/pages/Landing'
import { RegisterPage } from '@/pages/Register'
import { LoginPage } from '@/pages/Login'
import { ChangePasswordPage } from '@/pages/ChangePassword'
import { ProfilePage } from '@/pages/Profile'
import { CheckoutPage } from '@/pages/Checkout'
import { OrderStatusPage } from '@/pages/OrderStatus'
import { AdminPage } from '@/pages/Admin'

/* Hash router: static Vercel deploy needs no rewrites, and the CRM iframe (Member Card (RMC) → Golden Privilege) embeds `#/admin?embed=1`. */
export const router = createHashRouter([
  {
    element: <Shell />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/change-password', element: <ChangePasswordPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '/order/:id', element: <OrderStatusPage /> },
    ],
  },
  { path: '/admin', element: <AdminPage /> },
  { path: '*', element: <Navigate to="/" replace /> },
])
