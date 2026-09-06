import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"

function Sidebar() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const user = JSON.parse(localStorage.getItem("user") || "null")

  const menuItems = [
    { name: "Dashboard", path: "/", icon: "🏠" },
    { name: "Notifications", path: "/notifications", icon: "🔔" },
    { name: "AI Quiz", path: "/ai-quiz", icon: "🤖" },
    { name: "Subjects", path: "/subjects", icon: "📚" },
    { name: "Study Planner", path: "/planner", icon: "📅" },
    { name: "Notes", path: "/notes", icon: "📝" },
    { name: "Quiz", path: "/quiz", icon: "🧠" },
    { name: "Quiz History", path: "/quiz-history", icon: "📜" },
    { name: "Progress", path: "/progress", icon: "📊" },
    { name: "Pomodoro", path: "/pomodoro", icon: "⏱️" },

    ...(user?.role === "admin"
      ? [
          {
            name: "Admin Panel",
            path: "/admin",
            icon: "⚙️",
          },
        ]
      : []),
  ]

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white flex items-center justify-between px-5 z-50 shadow-lg">
        <div>
          <h1 className="text-xl font-bold">
            Study<span className="text-blue-400">Sphere</span>
          </h1>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-50
          w-64 min-h-screen
          bg-slate-900 text-white
          p-5 flex flex-col shadow-xl
          transform transition-transform duration-300
          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* Logo */}
        <div className="mb-10 px-3">
          <h1 className="text-2xl font-bold">
            Study<span className="text-blue-400">Sphere</span>
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            Smart Study Management
          </p>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>

              <span className="font-medium">
                {item.name}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-slate-700 pt-4">
          <div className="flex items-center gap-3 px-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
              👤
            </div>

            <div className="min-w-0">
              <p className="font-medium truncate">
                {user?.name || "Student"}
              </p>

              <p className="text-xs text-slate-400">
                {user?.role === "admin" ? "Admin" : "Student"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 py-3 rounded-xl hover:bg-red-500 hover:text-white transition"
          >
            🚪 Logout
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar