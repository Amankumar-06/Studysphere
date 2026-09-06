import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

function StudentDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem("token")

  const fetchDetails = async () => {
    try {
      setLoading(true)

      const response = await fetch(
        `http://localhost:5000/api/admin/users/${id}/details`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to load student"
        )
      }

      setData(result)
    } catch (error) {
      console.error(error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetails()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto" />

          <p className="mt-5 font-semibold text-slate-700">
            Loading Student Profile
          </p>

          <p className="text-sm text-slate-400 mt-1">
            Fetching learning activity...
          </p>
        </div>
      </div>
    )
  }

  if (!data?.user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center bg-white border border-slate-200 rounded-3xl p-10 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl mx-auto">
            👤
          </div>

          <h2 className="text-xl font-bold text-slate-800 mt-5">
            Student Not Found
          </h2>

          <p className="text-sm text-slate-400 mt-2">
            The requested student profile could not be loaded.
          </p>

          <button
            onClick={() => navigate("/admin")}
            className="mt-6 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            ← Back to Admin
          </button>
        </div>
      </div>
    )
  }

  const {
    user,
    subjects = [],
    tasks = [],
    notes = [],
    quizResults = [],
  } = data

  // ===============================
  // CALCULATIONS
  // ===============================

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length

  const pendingTasks = tasks.length - completedTasks

  const taskProgress =
    tasks.length > 0
      ? Math.round(
          (completedTasks / tasks.length) * 100
        )
      : 0

  const totalQuizScore = quizResults.reduce(
    (sum, quiz) => sum + (quiz.score || 0),
    0
  )

  const totalQuizQuestions = quizResults.reduce(
    (sum, quiz) => sum + (quiz.totalQuestions || 0),
    0
  )

  const quizAverage =
    totalQuizQuestions > 0
      ? Math.round(
          (totalQuizScore / totalQuizQuestions) * 100
        )
      : 0

  const averageSubjectProgress =
    subjects.length > 0
      ? Math.round(
          subjects.reduce(
            (sum, subject) =>
              sum + (subject.progress || 0),
            0
          ) / subjects.length
        )
      : 0

  // ===============================
  // MAIN UI
  // ===============================

  return (
    <div className="max-w-7xl mx-auto space-y-7">

      {/* ================= HEADER ================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>

          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition mb-3"
          >
            ← Back to Admin
          </button>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Student Profile
          </h1>

          <p className="text-slate-500 mt-2">
            Detailed learning activity and performance overview.
          </p>

        </div>

        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-sm font-medium text-slate-600">
            Profile Active
          </span>
        </div>

      </div>

      {/* ================= PROFILE HERO ================= */}

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-7 md:p-9 text-white shadow-xl">

        <div className="absolute -right-20 -top-20 w-56 h-56 rounded-full bg-blue-500/20 blur-2xl" />

        <div className="absolute -bottom-24 right-40 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center gap-6">

          {/* Avatar */}

          <div className="w-24 h-24 rounded-3xl bg-white/10 border border-white/10 flex items-center justify-center text-4xl font-bold shadow-lg shrink-0">
            {user.name
              ?.charAt(0)
              ?.toUpperCase()}
          </div>

          {/* User Info */}

          <div className="flex-1 min-w-0">

            <div className="flex flex-wrap items-center gap-3">

              <h2 className="text-2xl md:text-3xl font-bold">
                {user.name}
              </h2>

              <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/20 text-blue-200 text-xs font-bold uppercase">
                {user.role || "student"}
              </span>

            </div>

            <p className="text-slate-300 mt-2 break-all">
              {user.email}
            </p>

            <div className="flex flex-wrap gap-3 mt-5">

              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 text-sm text-slate-200">
                📅
                Joined{" "}
                {user.createdAt
                  ? new Date(
                      user.createdAt
                    ).toLocaleDateString("en-IN")
                  : "-"}
              </span>

              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 text-sm text-slate-200">
                🎓
                Student Account
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* ================= STATS ================= */}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

        <ProfileStat
          title="Subjects"
          value={subjects.length}
          icon="📚"
          color="blue"
        />

        <ProfileStat
          title="Total Tasks"
          value={tasks.length}
          icon="📋"
          color="orange"
        />

        <ProfileStat
          title="Completed"
          value={completedTasks}
          icon="✅"
          color="green"
        />

        <ProfileStat
          title="Notes"
          value={notes.length}
          icon="📝"
          color="purple"
        />

        <ProfileStat
          title="Quiz Attempts"
          value={quizResults.length}
          icon="🧠"
          color="indigo"
        />

      </div>

      {/* ================= PERFORMANCE ================= */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* TASK PERFORMANCE */}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              ✅
            </div>

            <div>
              <h2 className="font-bold text-slate-800">
                Task Performance
              </h2>

              <p className="text-xs text-slate-400">
                Completion rate
              </p>
            </div>

          </div>

          <div className="flex justify-center py-6">

            <ProgressCircle
              percentage={taskProgress}
              label="Tasks"
              type="task"
            />

          </div>

          <div className="grid grid-cols-2 gap-3">

            <div className="p-3 rounded-xl bg-green-50">
              <p className="text-xs text-slate-500">
                Completed
              </p>

              <p className="text-xl font-bold text-green-600 mt-1">
                {completedTasks}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-yellow-50">
              <p className="text-xs text-slate-500">
                Pending
              </p>

              <p className="text-xl font-bold text-yellow-600 mt-1">
                {pendingTasks}
              </p>
            </div>

          </div>

        </div>

        {/* QUIZ PERFORMANCE */}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              🧠
            </div>

            <div>
              <h2 className="font-bold text-slate-800">
                Quiz Performance
              </h2>

              <p className="text-xs text-slate-400">
                Overall quiz accuracy
              </p>
            </div>

          </div>

          <div className="flex justify-center py-6">

            <ProgressCircle
              percentage={quizAverage}
              label="Accuracy"
              type="quiz"
            />

          </div>

          <div className="p-4 rounded-xl bg-blue-50">

            <div className="flex justify-between items-center">

              <span className="text-sm text-slate-500">
                Total Correct
              </span>

              <span className="font-bold text-blue-600">
                {totalQuizScore}/{totalQuizQuestions}
              </span>

            </div>

          </div>

        </div>

        {/* SUBJECT PERFORMANCE */}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              📚
            </div>

            <div>
              <h2 className="font-bold text-slate-800">
                Subject Progress
              </h2>

              <p className="text-xs text-slate-400">
                Average subject completion
              </p>
            </div>

          </div>

          <div className="flex justify-center py-6">

            <ProgressCircle
              percentage={averageSubjectProgress}
              label="Progress"
              type="subject"
            />

          </div>

          <div className="p-4 rounded-xl bg-purple-50">

            <div className="flex justify-between">

              <span className="text-sm text-slate-500">
                Subjects
              </span>

              <span className="font-bold text-purple-600">
                {subjects.length}
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* ================= SUBJECTS ================= */}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <div>

            <h2 className="text-xl font-bold text-slate-800">
              Subjects
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Current progress across all subjects.
            </p>

          </div>

          <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
            {subjects.length} Subjects
          </span>

        </div>

        {subjects.length > 0 ? (

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

            {subjects.map((subject) => {

              const progress = subject.progress || 0

              return (
                <div
                  key={subject._id}
                  className="group p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition"
                >

                  <div className="flex items-center justify-between gap-3">

                    <div className="flex items-center gap-3 min-w-0">

                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                        📖
                      </div>

                      <h3 className="font-semibold text-slate-800 truncate">
                        {subject.name}
                      </h3>

                    </div>

                    <span className="text-sm font-bold text-blue-600">
                      {progress}%
                    </span>

                  </div>

                  <div className="h-2.5 bg-slate-200 rounded-full mt-4 overflow-hidden">

                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                      style={{
                        width: `${progress}%`,
                      }}
                    />

                  </div>

                  <div className="flex justify-between mt-2">

                    <span className="text-xs text-slate-400">
                      Progress
                    </span>

                    <span
                      className={`text-xs font-semibold ${
                        progress >= 80
                          ? "text-green-600"
                          : progress >= 50
                          ? "text-blue-600"
                          : "text-orange-600"
                      }`}
                    >
                      {progress >= 80
                        ? "Excellent"
                        : progress >= 50
                        ? "In Progress"
                        : "Needs Focus"}
                    </span>

                  </div>

                </div>
              )
            })}

          </div>

        ) : (

          <EmptyState
            icon="📚"
            title="No Subjects"
            description="This student has not added any subjects yet."
          />

        )}

      </div>

      {/* ================= RECENT TASKS ================= */}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <div>

            <h2 className="text-xl font-bold text-slate-800">
              Recent Tasks
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Latest study tasks created by the student.
            </p>

          </div>

          <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
            Latest {Math.min(tasks.length, 8)}
          </span>

        </div>

        {tasks.length > 0 ? (

          <div className="mt-6 space-y-3">

            {tasks.slice(0, 8).map((task) => (

              <div
                key={task._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition"
              >

                <div className="flex items-center gap-3 min-w-0">

                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      task.completed
                        ? "bg-green-100"
                        : "bg-yellow-100"
                    }`}
                  >
                    {task.completed
                      ? "✓"
                      : "⏳"}
                  </div>

                  <div className="min-w-0">

                    <p
                      className={`font-semibold truncate ${
                        task.completed
                          ? "text-slate-500 line-through"
                          : "text-slate-800"
                      }`}
                    >
                      {task.title}
                    </p>

                    {task.date && (
                      <p className="text-xs text-slate-400 mt-1">
                        📅{" "}
                        {new Date(
                          task.date
                        ).toLocaleDateString("en-IN")}
                      </p>
                    )}

                  </div>

                </div>

                <span
                  className={`self-start sm:self-auto px-3 py-1.5 rounded-full text-xs font-bold ${
                    task.completed
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {task.completed
                    ? "Completed"
                    : "Pending"}
                </span>

              </div>

            ))}

          </div>

        ) : (

          <EmptyState
            icon="📋"
            title="No Tasks"
            description="This student has not created any study tasks yet."
          />

        )}

      </div>

      {/* ================= QUIZ HISTORY ================= */}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="p-6 border-b border-slate-200">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div>

              <h2 className="text-xl font-bold text-slate-800">
                Quiz History
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Recent quiz attempts and scores.
              </p>

            </div>

            <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
              {quizResults.length} Attempts
            </span>

          </div>

        </div>

        {quizResults.length > 0 ? (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[650px]">

              <thead>

                <tr className="bg-slate-50 border-b border-slate-200">

                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Quiz
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Score
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Accuracy
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Date
                  </th>

                </tr>

              </thead>

              <tbody>

                {quizResults
                  .slice(0, 10)
                  .map((quiz) => {

                    const accuracy =
                      quiz.totalQuestions > 0
                        ? Math.round(
                            (quiz.score /
                              quiz.totalQuestions) *
                              100
                          )
                        : 0

                    return (
                      <tr
                        key={quiz._id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition"
                      >

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                              🧠
                            </div>

                            <div className="min-w-0">

                              <p className="font-semibold text-slate-800 truncate max-w-[260px]">
                                {quiz.topic || "Quiz"}
                              </p>

                            </div>

                          </div>

                        </td>

                        <td className="px-6 py-4">

                          <span className="font-bold text-blue-600">
                            {quiz.score}/
                            {quiz.totalQuestions}
                          </span>

                        </td>

                        <td className="px-6 py-4">

                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                              accuracy >= 80
                                ? "bg-green-100 text-green-700"
                                : accuracy >= 50
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {accuracy}%
                          </span>

                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">

                          {quiz.createdAt
                            ? new Date(
                                quiz.createdAt
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}

                        </td>

                      </tr>
                    )
                  })}

              </tbody>

            </table>

          </div>

        ) : (

          <div className="p-6">
            <EmptyState
              icon="🧠"
              title="No Quiz Attempts"
              description="This student has not attempted any quizzes yet."
            />
          </div>

        )}

      </div>

    </div>
  )
}

// ===============================
// PROFILE STAT
// ===============================

function ProfileStat({
  title,
  value,
  icon,
  color,
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition">

      <div className="flex items-center justify-between gap-3">

        <div>

          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {title}
          </p>

          <p className="text-2xl font-bold text-slate-800 mt-2">
            {value}
          </p>

        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${
            colors[color]
          }`}
        >
          {icon}
        </div>

      </div>

    </div>
  )
}

// ===============================
// PROGRESS CIRCLE
// ===============================

function ProgressCircle({
  percentage,
  label,
  type,
}) {
  const safePercentage = Math.min(
    Math.max(percentage, 0),
    100
  )

  const ringColor =
    type === "task"
      ? "#22c55e"
      : type === "quiz"
      ? "#2563eb"
      : "#9333ea"

  return (
    <div
      className="w-36 h-36 rounded-full flex items-center justify-center"
      style={{
        background: `conic-gradient(${ringColor} ${safePercentage}%, #e2e8f0 ${safePercentage}% 100%)`,
      }}
    >
      <div className="w-28 h-28 rounded-full bg-white flex flex-col items-center justify-center shadow-inner">

        <span className="text-2xl font-bold text-slate-800">
          {safePercentage}%
        </span>

        <span className="text-xs text-slate-400 mt-1">
          {label}
        </span>

      </div>
    </div>
  )
}

// ===============================
// EMPTY STATE
// ===============================

function EmptyState({
  icon,
  title,
  description,
}) {
  return (
    <div className="py-10 text-center">

      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-xl mx-auto">
        {icon}
      </div>

      <p className="font-semibold text-slate-700 mt-4">
        {title}
      </p>

      <p className="text-sm text-slate-400 mt-1">
        {description}
      </p>

    </div>
  )
}

export default StudentDetails