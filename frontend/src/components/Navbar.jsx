import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../features/authSlice'

export default function Navbar() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow p-4 flex justify-between">
      <div className="text-xl font-semibold">
        Task Manager
      </div>
      <div className="space-x-4">
        <Link to="/" className="hover:underline">Dashboard</Link>
        {user ? (
          <button onClick={handleLogout} className="px-3 py-1 border rounded">
            Logout
          </button>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  )
}
