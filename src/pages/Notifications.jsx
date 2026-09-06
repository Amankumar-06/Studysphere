import { useEffect, useState } from "react"

function Notifications() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined"
      ? Notification.permission
      : "unsupported"
  )

  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/tasks",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await res.json()

      setTasks(
        Array.isArray(data)
          ? data
          : data.tasks || []
      )
    } catch (error) {
      console.error("Notification tasks error:", error)
    } finally {
      setLoading(false)
    }
  }

  const enableNotifications = async () => {
    if (!("Notification" in window)) {
      alert("Your browser does not support notifications.")
      return
    }

    const result = await Notification.requestPermission()

    setPermission(result)

    if (result === "granted") {
      new Notification("StudySphere 🔔", {
        body: "Study reminders are now enabled!",
      })
    }
  }

  const today = new Date()
    .toISOString()
    .split("T")[0]

  const todayTasks = tasks.filter(
    (task) =>
      task.date === today &&
      !task.completed
  )

  const upcomingTasks = tasks.filter(
    (task) =>
      task.date > today &&
      !task.completed
  )

  const overdueTasks = tasks.filter(
    (task) =>
      task.date < today &&
      !task.completed
  )

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-slate-500">
            Loading reminders...
          </p>
        </div>
      </div>
    )
  }

  const TaskCard = ({ task, type }) => {
    const styles = {
      today: {
        bg: "bg-blue-50",
        border: "border-blue-100",
        icon: "📅",
        text: "text-blue-600",
      },
      upcoming: {
        bg: "bg-green-50",
        border: "border-green-100",
        icon: "⏰",
        text: "text-green-600",
      },
      overdue: {
        bg: "bg-red-50",
        border: "border-red-100",
        icon: "⚠️",
        text: "text-red-600",
      },
    }

    const style = styles[type]

    return (
      <div
        className={`p-4 rounded-xl ${style.bg} border ${style.border}`}
      >
        <div className="flex items-center gap-4">

          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm">
            {style.icon}
          </div>

          <div className="flex-1 min-w-0">

            <p className="font-semibold text-slate-800 truncate">
              {task.title}
            </p>

            <p className={`text-sm mt-1 ${style.text}`}>
              {task.date}
            </p>

          </div>

          {task.completed && (
            <span className="text-green-600 text-sm font-semibold">
              Completed
            </span>
          )}

        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* Header */}

      <div>
        <p className="text-blue-600 font-semibold text-sm mb-2">
          SMART REMINDERS
        </p>

        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          Notifications
        </h1>

        <p className="text-slate-500 mt-2">
          Stay on top of your study schedule and never miss an important task.
        </p>
      </div>

      {/* Notification Permission */}

      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 md:p-8 text-white shadow-xl">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          <div>

            <div className="flex items-center gap-2 text-blue-100 text-sm mb-3">
              🔔 BROWSER NOTIFICATIONS
            </div>

            <h2 className="text-2xl font-bold">
              Never miss a study reminder
            </h2>

            <p className="text-blue-100 mt-2 max-w-xl">
              Enable browser notifications to receive StudySphere reminders.
            </p>

          </div>

          <button
            onClick={enableNotifications}
            disabled={permission === "granted"}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              permission === "granted"
                ? "bg-green-500 text-white cursor-default"
                : "bg-white text-blue-600 hover:bg-blue-50"
            }`}
          >
            {permission === "granted"
              ? "✓ Notifications Enabled"
              : "Enable Notifications"}
          </button>

        </div>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Today's Tasks
          </p>

          <p className="text-3xl font-bold text-blue-600 mt-2">
            {todayTasks.length}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Upcoming
          </p>

          <p className="text-3xl font-bold text-green-600 mt-2">
            {upcomingTasks.length}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Overdue
          </p>

          <p className="text-3xl font-bold text-red-600 mt-2">
            {overdueTasks.length}
          </p>
        </div>

      </div>

      {/* Today's Tasks */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">
            Today's Reminders
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Tasks that need your attention today
          </p>
        </div>

        {todayTasks.length > 0 ? (
          <div className="space-y-3">
            {todayTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                type="today"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">
              🎉
            </div>

            <p className="font-semibold text-slate-800">
              No pending tasks today
            </p>

            <p className="text-sm text-slate-500 mt-1">
              You're all caught up!
            </p>
          </div>
        )}

      </div>

      {/* Overdue */}

      {overdueTasks.length > 0 && (
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">

          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">
              Overdue Tasks
            </h2>

            <p className="text-sm text-red-500 mt-1">
              These tasks need your attention.
            </p>
          </div>

          <div className="space-y-3">
            {overdueTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                type="overdue"
              />
            ))}
          </div>

        </div>
      )}

      {/* Upcoming */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">
            Upcoming Tasks
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Plan ahead and stay consistent.
          </p>
        </div>

        {upcomingTasks.length > 0 ? (
          <div className="space-y-3">
            {upcomingTasks.slice(0, 8).map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                type="upcoming"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400">
            No upcoming tasks.
          </div>
        )}

      </div>

    </div>
  )
}

export default Notifications