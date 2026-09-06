import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function Dashboard() {
  const navigate = useNavigate()

  const [subjects, setSubjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const [subjectsRes, tasksRes] = await Promise.all([
        fetch("http://localhost:5000/api/subjects", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("http://localhost:5000/api/tasks", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ])

      const subjectsData = await subjectsRes.json()
      const tasksData = await tasksRes.json()

      setSubjects(Array.isArray(subjectsData) ? subjectsData : [])
      setTasks(Array.isArray(tasksData) ? tasksData : [])
    } catch (error) {
      console.error("Dashboard Error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const completedTasks = tasks.filter((task) => task.completed).length

  const pendingTasks = tasks.length - completedTasks

  const overallProgress =
    subjects.length > 0
      ? Math.round(
          subjects.reduce(
            (total, subject) => total + Number(subject.progress || 0),
            0
          ) / subjects.length
        )
      : 0

  const today = new Date()

  const todayTasks = tasks.filter((task) => {
    if (!task.dueDate) return false

    const taskDate = new Date(task.dueDate)

    return (
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear()
    )
  })

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const getGreeting = () => {
    const hour = new Date().getHours()

    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  const getInitial = () => {
    return user?.name?.charAt(0)?.toUpperCase() || "S"
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-indigo-200">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          <div>
            <p className="text-indigo-100 text-sm font-medium mb-2">
              {getGreeting()} 👋
            </p>

            <h1 className="text-3xl md:text-4xl font-bold">
              Welcome back, {user?.name || "Student"}!
            </h1>

            <p className="text-indigo-100 mt-2 max-w-xl">
              Stay focused, complete your tasks and keep improving your
              academic performance.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl md:text-3xl font-bold border border-white/20">
              {getInitial()}
            </div>

          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-7">

          <button
            onClick={() => navigate("/planner")}
            className="bg-white/15 hover:bg-white/25 border border-white/10 rounded-xl p-3 text-left transition"
          >
            <p className="text-lg">📅</p>
            <p className="font-semibold text-sm mt-1">Study Planner</p>
          </button>

          <button
            onClick={() => navigate("/notes")}
            className="bg-white/15 hover:bg-white/25 border border-white/10 rounded-xl p-3 text-left transition"
          >
            <p className="text-lg">📝</p>
            <p className="font-semibold text-sm mt-1">My Notes</p>
          </button>

          <button
            onClick={() => navigate("/ai-quiz")}
            className="bg-white/15 hover:bg-white/25 border border-white/10 rounded-xl p-3 text-left transition"
          >
            <p className="text-lg">🤖</p>
            <p className="font-semibold text-sm mt-1">AI Quiz</p>
          </button>

          <button
            onClick={() => navigate("/pomodoro")}
            className="bg-white/15 hover:bg-white/25 border border-white/10 rounded-xl p-3 text-left transition"
          >
            <p className="text-lg">⏱️</p>
            <p className="font-semibold text-sm mt-1">Focus Mode</p>
          </button>

        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Subjects */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">

          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-xl">
              📚
            </div>

            <span className="text-xs font-semibold text-slate-400 uppercase">
              Subjects
            </span>
          </div>

          <p className="text-3xl font-bold text-slate-800 mt-4">
            {subjects.length}
          </p>

          <p className="text-sm text-slate-500 mt-1">
            Active subjects
          </p>

        </div>

        {/* Tasks */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">

          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center text-xl">
              📋
            </div>

            <span className="text-xs font-semibold text-slate-400 uppercase">
              Tasks
            </span>
          </div>

          <p className="text-3xl font-bold text-slate-800 mt-4">
            {tasks.length}
          </p>

          <p className="text-sm text-slate-500 mt-1">
            {pendingTasks} pending
          </p>

        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">

          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">
              ✅
            </div>

            <span className="text-xs font-semibold text-slate-400 uppercase">
              Completed
            </span>
          </div>

          <p className="text-3xl font-bold text-slate-800 mt-4">
            {completedTasks}
          </p>

          <p className="text-sm text-slate-500 mt-1">
            Tasks completed
          </p>

        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">

          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center text-xl">
              📈
            </div>

            <span className="text-xs font-semibold text-slate-400 uppercase">
              Progress
            </span>
          </div>

          <p className="text-3xl font-bold text-slate-800 mt-4">
            {overallProgress}%
          </p>

          <p className="text-sm text-slate-500 mt-1">
            Overall progress
          </p>

        </div>

      </div>

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* LEFT - PROGRESS */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Overall Progress
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Track your subject-wise preparation
              </p>
            </div>

            <div className="text-2xl font-bold text-indigo-600">
              {overallProgress}%
            </div>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-700"
              style={{ width: `${overallProgress}%` }}
            />
          </div>

          {/* SUBJECT LIST */}
          <div className="mt-7 space-y-4">

            {subjects.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl">
                <div className="text-4xl mb-2">📚</div>

                <p className="font-semibold text-slate-700">
                  No subjects yet
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  Add your first subject to start tracking progress.
                </p>

                <button
                  onClick={() => navigate("/subjects")}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                >
                  Add Subject
                </button>
              </div>
            ) : (
              subjects.slice(0, 6).map((subject) => (
                <div key={subject._id}>

                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-slate-700">
                      {subject.name}
                    </span>

                    <span className="text-sm font-semibold text-indigo-600">
                      {subject.progress || 0}%
                    </span>
                  </div>

                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{
                        width: `${subject.progress || 0}%`,
                      }}
                    />
                  </div>

                </div>
              ))
            )}

          </div>

          {subjects.length > 6 && (
            <button
              onClick={() => navigate("/subjects")}
              className="mt-5 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View all subjects →
            </button>
          )}

        </div>

        {/* RIGHT - TODAY */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Today's Tasks
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                {todayTasks.length} tasks scheduled
              </p>
            </div>

            <span className="text-2xl">📅</span>

          </div>

          {todayTasks.length === 0 ? (
            <div className="text-center py-8">

              <div className="text-4xl mb-3">
                🎯
              </div>

              <p className="font-semibold text-slate-700">
                No tasks for today
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Great! You are all caught up.
              </p>

              <button
                onClick={() => navigate("/planner")}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
              >
                Open Planner
              </button>

            </div>
          ) : (
            <div className="space-y-3">

              {todayTasks.slice(0, 5).map((task) => (
                <div
                  key={task._id}
                  className={`p-3 rounded-xl border ${
                    task.completed
                      ? "bg-emerald-50 border-emerald-100"
                      : "bg-slate-50 border-slate-100"
                  }`}
                >

                  <div className="flex items-start gap-3">

                    <div
                      className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                        task.completed
                          ? "bg-emerald-500 text-white"
                          : "border-2 border-slate-300"
                      }`}
                    >
                      {task.completed && "✓"}
                    </div>

                    <div className="min-w-0">
                      <p
                        className={`font-medium text-sm ${
                          task.completed
                            ? "text-slate-400 line-through"
                            : "text-slate-700"
                        }`}
                      >
                        {task.title}
                      </p>

                      {task.description && (
                        <p className="text-xs text-slate-400 mt-1 truncate">
                          {task.description}
                        </p>
                      )}
                    </div>

                  </div>

                </div>
              ))}

              <button
                onClick={() => navigate("/planner")}
                className="w-full mt-2 py-2.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 text-sm font-semibold transition"
              >
                View all tasks →
              </button>

            </div>
          )}

        </div>

      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">

        <div className="flex items-center justify-between mb-6">

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Recent Tasks
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Your latest study activities
            </p>
          </div>

          <button
            onClick={() => navigate("/planner")}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View Planner →
          </button>

        </div>

        {recentTasks.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl">

            <div className="text-4xl mb-3">
              📝
            </div>

            <p className="font-semibold text-slate-700">
              No tasks available
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Create tasks from your Study Planner.
            </p>

          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">

            {recentTasks.map((task) => (
              <div
                key={task._id}
                className="flex items-center justify-between gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition"
              >

                <div className="flex items-center gap-3 min-w-0">

                  <div
                    className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${
                      task.completed
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-indigo-100 text-indigo-600"
                    }`}
                  >
                    {task.completed ? "✓" : "📚"}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`font-medium text-sm truncate ${
                        task.completed
                          ? "text-slate-400 line-through"
                          : "text-slate-700"
                      }`}
                    >
                      {task.title}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      {task.completed ? "Completed" : "In progress"}
                    </p>
                  </div>

                </div>

                <span
                  className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    task.completed
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {task.completed ? "Done" : "Pending"}
                </span>

              </div>
            ))}

          </div>
        )}

      </div>

      {/* BOTTOM CTA */}
      <div className="bg-slate-900 rounded-2xl p-6 md:p-7 text-white">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

          <div>
            <p className="text-indigo-400 text-sm font-semibold mb-1">
              KEEP GOING
            </p>

            <h2 className="text-xl md:text-2xl font-bold">
              Ready for your next study session?
            </h2>

            <p className="text-slate-400 text-sm mt-1">
              Use AI Quiz or Pomodoro to make your study session more
              productive.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={() => navigate("/ai-quiz")}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-sm transition"
            >
              🤖 Start AI Quiz
            </button>

            <button
              onClick={() => navigate("/pomodoro")}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-semibold text-sm transition"
            >
              ⏱️ Focus Session
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Dashboard