import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()

    if (!name || !email || !password) {
      alert("Please fill all fields")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || "Registration failed")
      }

      alert("Account created successfully!")
      navigate("/login")
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-indigo-100 flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl shadow-slate-300/50 overflow-hidden grid md:grid-cols-2 border border-white">

        {/* LEFT SIDE */}
        <div className="hidden md:flex relative bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white p-10 flex-col justify-between overflow-hidden">

          {/* Background decoration */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl" />

          <div className="relative z-10">

            <h1 className="text-3xl font-extrabold tracking-tight">
              Study<span className="text-purple-200">Sphere</span>
            </h1>

            <p className="text-purple-100 mt-2 text-sm">
              Smart Study Management System
            </p>

          </div>

          <div className="relative z-10">

            <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-5xl mb-7 shadow-xl">
              🚀
            </div>

            <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
              Start your
              <br />
              learning journey.
            </h2>

            <p className="text-purple-100 mt-5 leading-relaxed max-w-md">
              Create your account and get access to smart study planning,
              AI quizzes, notes, performance analytics and more.
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-2 mt-7">

              <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-medium">
                📚 Study Planner
              </span>

              <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-medium">
                🤖 AI Quizzes
              </span>

              <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-medium">
                📊 Analytics
              </span>

            </div>

          </div>

          <div className="relative z-10 text-xs text-purple-200">
            © 2026 StudySphere • Learn. Track. Improve.
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="p-7 sm:p-10 md:p-12 flex items-center">

          <div className="w-full max-w-md mx-auto">

            {/* MOBILE LOGO */}
            <div className="md:hidden text-center mb-9">

              <div className="inline-flex w-16 h-16 rounded-2xl bg-indigo-100 items-center justify-center text-3xl mb-3">
                🚀
              </div>

              <h1 className="text-3xl font-extrabold text-slate-900">
                Study<span className="text-blue-600">Sphere</span>
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Smart Study Management
              </p>

            </div>

            {/* HEADER */}
            <div className="mb-8">

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold tracking-wide mb-3">
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                GET STARTED
              </div>

              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Create your account
              </h2>

              <p className="text-slate-500 mt-2">
                Join StudySphere and study smarter.
              </p>

            </div>

            {/* FORM */}
            <form onSubmit={handleRegister} className="space-y-5">

              {/* NAME */}
              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                    👤
                  </span>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    autoComplete="name"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition placeholder:text-slate-400"
                  />

                </div>

              </div>

              {/* EMAIL */}
              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                    ✉️
                  </span>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition placeholder:text-slate-400"
                  />

                </div>

              </div>

              {/* PASSWORD */}
              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                    🔒
                  </span>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition placeholder:text-slate-400"
                  />

                </div>

              </div>

              {/* REGISTER BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-indigo-300 disabled:to-purple-300 text-white py-3.5 rounded-xl font-bold transition-all duration-200 shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:shadow-indigo-600/25 active:scale-[0.98]"
              >

                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Create Account
                    <span className="group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </span>
                )}

              </button>

            </form>

            {/* LOGIN */}
            <div className="flex items-center gap-4 my-7">

              <div className="h-px bg-slate-200 flex-1" />

              <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                ALREADY A MEMBER?
              </span>

              <div className="h-px bg-slate-200 flex-1" />

            </div>

            <Link
              to="/login"
              className="group flex items-center justify-center gap-2 w-full border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700 hover:text-blue-600 py-3.5 rounded-xl font-semibold transition-all duration-200"
            >
              Sign in to StudySphere

              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>

            {/* FOOTER */}
            <p className="text-center text-xs text-slate-400 mt-7">
              Create your account and start learning smarter
            </p>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Register