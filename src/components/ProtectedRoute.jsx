import { Navigate } from "react-router-dom"

function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("token")
  const user = localStorage.getItem("user")

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly) {
    const currentUser = user ? JSON.parse(user) : null

    if (currentUser?.role !== "admin") {
      return <Navigate to="/" replace />
    }
  }

  return children
}

export default ProtectedRoute