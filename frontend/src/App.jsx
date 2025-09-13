import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './components/Login'
import Signup from './components/Signup'
import TasksPage from './components/TasksPage'
import PrivateRoute from './components/PrivateRoute'
import { useDispatch } from 'react-redux'
import { setCredentials } from './features/authSlice'

export default function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    // Load auth info from localStorage
    const token = localStorage.getItem('access_token')
    const user = JSON.parse(localStorage.getItem('user') || 'null')

    if (token && user) {
      dispatch(setCredentials({ user, accessToken: token }))
    }
  }, [dispatch])

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<PrivateRoute><TasksPage /></PrivateRoute>} />
        </Routes>
      </div>
    </div>
  )
}
