import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

export default function PrivateRoute({ children }) {
  const { accessToken } = useSelector((state) => state.auth)

  // If no token → redirect to login
  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  // Otherwise, render the page
  return children
}
