import { useEffect, useState } from "react"

function Planner() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [date, setDate] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem("token")

  const fetchTasks = async () => {
    try {
      setLoading(true)

      const res = await fetch("http://localhost:5000/api/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()
      setTasks(data.tasks || [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim() || !subject.trim() || !date) {
      alert("Please fill all fields")
      return
    }

    try {
      const url = editingId
        ? `http://localhost:5000/api/tasks/${editingId}`
        : "http://localhost:5000/api/tasks"

      const method = editingId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          subject,
          date,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to save task")
      }

      setTitle("")
      setSubject("")
      setDate("")
      setEditingId(null)

      fetchTasks()
    } catch (error) {
      console.error(error)
      alert("Something went wrong")
    }
  }

  const handleEdit = (task) => {
    setTitle(task.title)
    setSubject(task.subject)
    setDate(task.date)
    setEditingId(task._id)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    )

    if (!confirmDelete) return

    try {
      const res = await fetch(
        `http://localhost:5000/api/tasks/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) {
        throw new Error("Delete failed")
      }

      fetchTasks()
    } catch (error) {
      console.error(error)
      alert("Unable to delete task")
    }
  }

  const toggleComplete = async (task) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/tasks/${task._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: task.title,
            subject: task.subject,
            date: task.date,
            completed: !task.completed,
          }),
        }
      )

      if (!res.ok) {
        throw new Error("Update failed")
      }

      fetchTasks()
    } catch (error) {
      console.error(error)
      alert("Unable to update task")
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setTitle("")
    setSubject("")
    setDate("")
  }

  const today = new Date().toISOString().split("T")[0]

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length

  const pendingCount = tasks.filter(
    (task) => !task.completed
  ).length

  const todayCount = tasks.filter(
    (task) => task.date === today
  ).length

  const completionRate =
    tasks.length > 0
      ? Math.round((completedCount / tasks.length) * 100)
      : 0

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed
    if (filter === "pending") return !task.completed
    if (filter === "today") return task.date === today
    return true
  })

  const sortedTasks = [...filteredTasks].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  )

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString)

    return dateObj.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-3">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
            STUDY PLANNING
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Study Planner
          </h1>

          <p className="text-slate-500 mt-2">
            Plan your study tasks and stay organized.
          </p>
        </div>

        <div className="flex gap-3">

          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">
            <p className="text-xs text-slate-400 font-semibold uppercase">
              Tasks
            </p>

            <p className="text-2xl font-bold text-slate-800 mt-0.5">
              {tasks.length}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">
            <p className="text-xs text-slate-400 font-semibold uppercase">
              Completion
            </p>

            <p className="text-2xl font-bold text-blue-600 mt-0.5">
              {completionRate}%
            </p>
          </div>

        </div>

      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Tasks
              </p>

              <p className="text-3xl font-extrabold text-slate-800 mt-2">
                {tasks.length}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-xl">
              📋
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Completed
              </p>

              <p className="text-3xl font-extrabold text-emerald-600 mt-2">
                {completedCount}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-xl">
              ✅
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Pending
              </p>

              <p className="text-3xl font-extrabold text-amber-500 mt-2">
                {pendingCount}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-xl">
              ⏳
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Today's Tasks
              </p>

              <p className="text-3xl font-extrabold text-purple-600 mt-2">
                {todayCount}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-xl">
              📅
            </div>
          </div>
        </div>

      </div>

      {/* ADD / EDIT TASK */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/10 flex items-center justify-center text-2xl">
              {editingId ? "✏️" : "➕"}
            </div>

            <div>
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Study Task" : "Create Study Task"}
              </h2>

              <p className="text-blue-100 text-sm mt-1">
                {editingId
                  ? "Update your task details"
                  : "Add a task to your study plan"}
              </p>
            </div>

          </div>

        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5"
        >

          {/* TITLE */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Task Title
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                📝
              </span>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Complete DBMS chapter 3"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* SUBJECT */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Subject
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                📚
              </span>

              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. DBMS"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* DATE */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Study Date
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                📅
              </span>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="md:col-span-3 flex flex-wrap gap-3 pt-1">

            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
              {editingId ? "Update Task" : "Add Task"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
              >
                Cancel
              </button>
            )}

          </div>

        </form>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">

        <div className="flex items-center gap-3 mb-3">
          <span className="text-lg">🔎</span>

          <p className="font-bold text-slate-700">
            Filter Tasks
          </p>
        </div>

        <div className="flex flex-wrap gap-2">

          {[
            { value: "all", label: "All Tasks", icon: "📋" },
            { value: "today", label: "Today", icon: "📅" },
            { value: "pending", label: "Pending", icon: "⏳" },
            { value: "completed", label: "Completed", icon: "✅" },
          ].map((item) => (

            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                filter === item.value
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {item.icon} {item.label}
            </button>

          ))}

        </div>
      </div>

      {/* TASK LIST */}
      {loading ? (

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-14 text-center">

          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-slate-500 font-medium">
            Loading tasks...
          </p>

        </div>

      ) : sortedTasks.length === 0 ? (

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center">

          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5">
            📝
          </div>

          <h2 className="text-xl font-bold text-slate-800">
            No tasks found
          </h2>

          <p className="text-slate-500 mt-2 max-w-md mx-auto">
            Add a study task above to start planning your study schedule.
          </p>

        </div>

      ) : (

        <div className="space-y-4">

          {sortedTasks.map((task) => (

            <div
              key={task._id}
              className={`group bg-white rounded-2xl p-5 border shadow-sm hover:shadow-lg transition-all duration-300 ${
                task.completed
                  ? "border-emerald-100"
                  : "border-slate-200"
              }`}
            >

              <div className="flex flex-col md:flex-row md:items-center gap-4">

                {/* COMPLETE */}
                <button
                  onClick={() => toggleComplete(task)}
                  className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl font-bold transition ${
                    task.completed
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-slate-100 text-slate-400 hover:bg-blue-100 hover:text-blue-600"
                  }`}
                  title={
                    task.completed
                      ? "Mark as pending"
                      : "Mark as completed"
                  }
                >
                  {task.completed ? "✓" : "○"}
                </button>

                {/* TASK INFO */}
                <div className="flex-1 min-w-0">

                  <div className="flex flex-wrap items-center gap-2">

                    <h3
                      className={`font-bold text-lg break-words ${
                        task.completed
                          ? "text-slate-400 line-through"
                          : "text-slate-800"
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.date === today && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-bold">
                        Today
                      </span>
                    )}

                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">

                    <span className="text-slate-500">
                      📚 {task.subject}
                    </span>

                    <span className="text-slate-500">
                      📅 {formatDate(task.date)}
                    </span>

                  </div>

                </div>

                {/* STATUS */}
                <span
                  className={`self-start md:self-center text-xs font-bold px-3 py-1.5 rounded-full ${
                    task.completed
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {task.completed ? "Completed" : "Pending"}
                </span>

                {/* ACTIONS */}
                <div className="flex gap-2">

                  <button
                    onClick={() => handleEdit(task)}
                    className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                    title="Edit"
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() => handleDelete(task._id)}
                    className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition"
                    title="Delete"
                  >
                    🗑️
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  )
}

export default Planner