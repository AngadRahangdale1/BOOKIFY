import React from 'react'
import {Routes, Route, useLocation, Navigate} from 'react-router-dom'
import { useFirebase } from './context/Firebase'

// pages
import Register from './pages/Register'
import LoginPage from './pages/LoginPage'
import List from './pages/List'
import Home from './pages/Home'
import Detail from './pages/Detail'
import About from './pages/About'
import Reader from './pages/Reader'
import Profile from './pages/Profile'

// components
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function ProtectedRoute({ children }) {
  const { isLoggedIn, authLoading } = useFirebase()

  if (authLoading) {
    return <div className='mx-auto mt-6 max-w-6xl px-4 text-slate-700'>Checking authentication...</div>
  }

  if (!isLoggedIn) {
    return <Navigate to='/login' replace />
  }

  return children
}

function App() {
  const location = useLocation()

  return (
    <div>
      <Navbar />

      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/about' element={<About />} />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/list' element={<ProtectedRoute><List /></ProtectedRoute>} />
        <Route path='/book/browse/:id' element={<ProtectedRoute><Detail/></ProtectedRoute>} />
        <Route path='/book/read/:id' element={<ProtectedRoute><Reader/></ProtectedRoute>} />
        <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>

      {location.pathname === '/' ? <Footer /> : null}
    </div>
  )
}

export default App