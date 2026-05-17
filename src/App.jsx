// import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'react-hot-toast'


// Pages
import ControlPage from './pages/controlPage'
import Home from './pages/home'
import LoginPage from './pages/login'
import ForgetPasswordPage from './pages/forgetPassword'

// Components
export default function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forget" element={<ForgetPasswordPage />} />
            <Route path="/control/*" element={<ControlPage />} />
            <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  )
}
