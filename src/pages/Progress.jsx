import { useEffect, useState } from "react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

function Progress() {
  const [subjects, setSubjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [quizResults, setQuizResults] = useState([])

  const [weakTopics, setWeakTopics] = useState([])
  const [strongTopics, setStrongTopics] = useState([])
  const [totalAttempts, setTotalAttempts] = useState(0)

  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      }

      const [
        subjectsRes,
        tasksRes,
        quizRes,
        weakTopicsRes,
      ] = await Promise.all([
        fetch("https://studysphere-5i7u.onrender.com/api/subjects", { headers }),
        fetch("https://studysphere-5i7u.onrender.com/api/tasks", { headers }),
        fetch("https://studysphere-5i7u.onrender.com/api/quiz-results", { headers }),
        fetch("https://studysphere-5i7u.onrender.com/api/weak-topics", { headers }),
      ])

      const subjectsData = await subjectsRes.json()
      const tasksData = await tasksRes.json()
      const quizData = await quizRes.json()
      const weakData = await weakTopicsRes.json()

      setSubjects(
        Array.isArray(subjectsData)
          ? subjectsData
          : subjectsData.subjects || []
      )

      setTasks(
        Array.isArray(tasksData)
          ? tasksData
          : tasksData.tasks || []
      )

      setQuizResults(
        Array.isArray(quizData)
          ? quizData
          : quizData.results || []
      )

      setWeakTopics(
        Array.isArray(weakData.weakTopics)
          ? weakData.weakTopics
          : []
      )

      setStrongTopics(
        Array.isArray(weakData.strongTopics)
          ? weakData.strongTopics
          : []
      )

      setTotalAttempts(weakData.totalAttempts || 0)
    } catch (error) {
      console.error("Progress data error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin" />
          </div>

          <p className="mt-5 text-slate-500 font-medium">
            Loading your analytics...
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Preparing your study performance
          </p>
        </div>
      </div>
    )
  }

  // ================= CALCULATIONS =================

  const overallProgress =
    subjects.length > 0
      ? Math.round(
          subjects.reduce(
            (sum, subject) =>
              sum + Number(subject.progress || 0),
            0
          ) / subjects.length
        )
      : 0

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length

  const taskProgress =
    tasks.length > 0
      ? Math.round(
          (completedTasks / tasks.length) * 100
        )
      : 0

  const validQuizResults = quizResults.filter(
    (quiz) =>
      quiz.totalQuestions > 0 &&
      typeof quiz.score === "number"
  )

  const quizAverage =
    validQuizResults.length > 0
      ? Math.round(
          validQuizResults.reduce(
            (sum, quiz) =>
              sum +
              (quiz.score / quiz.totalQuestions) * 100,
            0
          ) / validQuizResults.length
        )
      : 0

  const bestQuiz =
    validQuizResults.length > 0
      ? Math.max(
          ...validQuizResults.map(
            (quiz) =>
              (quiz.score / quiz.totalQuestions) * 100
          )
        )
      : 0

  const subjectChartData = subjects.map((subject) => ({
    name:
      subject.name.length > 12
        ? subject.name.substring(0, 12) + "..."
        : subject.name,
    progress: Number(subject.progress || 0),
  }))

  const quizChartData = quizResults
    .slice()
    .reverse()
    .slice(-7)
    .map((quiz, index) => ({
      name: `Quiz ${index + 1}`,
      score:
        quiz.totalQuestions > 0
          ? Math.round(
              (quiz.score / quiz.totalQuestions) * 100
            )
          : 0,
    }))

  const getLast7Days = () => {
    const days = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      const dateString =
        date.toISOString().split("T")[0]

      const completed = tasks.filter(
        (task) =>
          task.date === dateString &&
          task.completed
      ).length

      const total = tasks.filter(
        (task) => task.date === dateString
      ).length

      days.push({
        day: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        completed,
        total,
      })
    }

    return days
  }

  const weeklyData = getLast7Days()

  const weakSubjects = [...subjects]
    .filter(
      (subject) =>
        Number(subject.progress || 0) < 60
    )
    .sort(
      (a, b) =>
        Number(a.progress || 0) -
        Number(b.progress || 0)
    )

  let learningMessage =
    "Keep practicing to build your performance data."

  if (weakTopics.length > 0) {
    learningMessage = `Your main focus should be ${weakTopics[0].topic}. Your current accuracy is ${weakTopics[0].accuracy}%.`
  } else if (strongTopics.length > 0) {
    learningMessage =
      "Great work! Your quiz performance is strong. Keep practicing to maintain consistency."
  } else if (quizResults.length === 0) {
    learningMessage =
      "Take some AI quizzes to unlock personalized weak-topic analysis."
  }

  const getProgressLabel = (value) => {
    if (value >= 80) return "Excellent"
    if (value >= 60) return "Good"
    if (value >= 40) return "Average"
    return "Needs Focus"
  }

  const getProgressStyle = (value) => {
    if (value >= 80) {
      return "text-emerald-600 bg-emerald-50 border-emerald-100"
    }

    if (value >= 60) {
      return "text-blue-600 bg-blue-50 border-blue-100"
    }

    if (value >= 40) {
      return "text-amber-600 bg-amber-50 border-amber-100"
    }

    return "text-red-600 bg-red-50 border-red-100"
  }

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-10">

      {/* ================= HEADER ================= */}

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 text-white shadow-xl">

        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

        <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-cyan-300/10 rounded-full blur-3xl" />

        <div className="relative p-6 md:p-8">

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">

            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-bold tracking-wide">
                📊 PERFORMANCE ANALYTICS
              </span>

              <h1 className="text-3xl md:text-4xl font-bold mt-4">
                Your Progress
              </h1>

              <p className="text-blue-100 mt-2 max-w-2xl">
                Track your study performance, quiz accuracy,
                subject progress, and areas that need attention.
              </p>
            </div>

            <div className="hidden md:block text-6xl">
              📈
            </div>

          </div>

        </div>
      </div>

      {/* ================= MAIN STATS ================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* Overall */}

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                Overall Progress
              </p>

              <p className="text-3xl font-bold text-slate-800 mt-2">
                {overallProgress}%
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-xl">
              📈
            </div>

          </div>

          <div className="mt-5 h-2.5 bg-slate-100 rounded-full overflow-hidden">

            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-700"
              style={{
                width: `${overallProgress}%`,
              }}
            />

          </div>

          <p className="text-xs text-slate-400 mt-2">
            Across {subjects.length} subject
            {subjects.length !== 1 ? "s" : ""}
          </p>

        </div>

        {/* Tasks */}

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                Task Completion
              </p>

              <p className="text-3xl font-bold text-slate-800 mt-2">
                {taskProgress}%
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-xl">
              ✅
            </div>

          </div>

          <div className="mt-5 h-2.5 bg-slate-100 rounded-full overflow-hidden">

            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{
                width: `${taskProgress}%`,
              }}
            />

          </div>

          <p className="text-xs text-slate-400 mt-2">
            {completedTasks} of {tasks.length} completed
          </p>

        </div>

        {/* Quiz */}

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                Quiz Average
              </p>

              <p className="text-3xl font-bold text-slate-800 mt-2">
                {quizAverage}%
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-xl">
              🧠
            </div>

          </div>

          <div className="mt-5 h-2.5 bg-slate-100 rounded-full overflow-hidden">

            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-700"
              style={{
                width: `${quizAverage}%`,
              }}
            />

          </div>

          <p className="text-xs text-slate-400 mt-2">
            {quizResults.length} quiz attempt
            {quizResults.length !== 1 ? "s" : ""}
          </p>

        </div>

        {/* Best */}

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                Best Quiz Score
              </p>

              <p className="text-3xl font-bold text-slate-800 mt-2">
                {Math.round(bestQuiz)}%
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-xl">
              🏆
            </div>

          </div>

          <div className="mt-5">

            <span
              className={`inline-flex px-3 py-1 rounded-lg border text-xs font-bold ${getProgressStyle(
                Math.round(bestQuiz)
              )}`}
            >
              {getProgressLabel(Math.round(bestQuiz))}
            </span>

          </div>

        </div>

      </div>

      {/* ================= AI ANALYSIS ================= */}

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white shadow-xl">

        <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-white/10 blur-2xl" />

        <div className="relative p-6 md:p-8">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div>

              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm font-bold">
                🤖 AI PERFORMANCE ANALYSIS
              </span>

              <h2 className="text-2xl md:text-3xl font-bold mt-4">
                Personalized Learning Insights
              </h2>

              <p className="text-blue-100 mt-2 max-w-2xl leading-relaxed">
                {learningMessage}
              </p>

            </div>

            <div className="hidden lg:flex w-24 h-24 rounded-3xl bg-white/10 items-center justify-center text-5xl border border-white/10">
              🧠
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-7">

            <div className="bg-white/10 border border-white/10 rounded-2xl p-5">
              <p className="text-blue-100 text-sm">
                Quiz Attempts
              </p>

              <p className="text-3xl font-bold mt-2">
                {totalAttempts}
              </p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-5">
              <p className="text-blue-100 text-sm">
                Weak Topics
              </p>

              <p className="text-3xl font-bold mt-2">
                {weakTopics.length}
              </p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-5">
              <p className="text-blue-100 text-sm">
                Strong Topics
              </p>

              <p className="text-3xl font-bold mt-2">
                {strongTopics.length}
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* ================= WEAK + STRONG TOPICS ================= */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Weak */}

        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">

          <div className="flex items-center justify-between mb-6">

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Weak Topics
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Topics that need more practice
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-xl">
              ⚠️
            </div>

          </div>

          {weakTopics.length > 0 ? (

            <div className="space-y-3">

              {weakTopics.slice(0, 5).map((item) => (

                <div
                  key={item.topic}
                  className="p-4 rounded-xl bg-red-50/70 border border-red-100"
                >

                  <div className="flex items-center justify-between gap-4">

                    <div className="min-w-0">

                      <p className="font-bold text-slate-800 truncate">
                        {item.topic}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        {item.attempts} attempt
                        {item.attempts !== 1 ? "s" : ""}
                      </p>

                    </div>

                    <span className="text-lg font-bold text-red-600 shrink-0">
                      {item.accuracy}%
                    </span>

                  </div>

                  <div className="mt-3 h-2 bg-red-100 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{
                        width: `${item.accuracy}%`,
                      }}
                    />

                  </div>

                  <p className="text-xs text-red-600 mt-2">
                    💡 Revise this topic and try another quiz.
                  </p>

                </div>

              ))}

            </div>

          ) : (

            <div className="py-10 text-center">

              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center text-3xl">
                🎉
              </div>

              <p className="font-bold text-slate-800 mt-4">
                No weak quiz topics!
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Keep practicing to maintain your performance.
              </p>

            </div>

          )}

        </div>

        {/* Strong */}

        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">

          <div className="flex items-center justify-between mb-6">

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Strong Topics
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Topics where you're performing well
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-xl">
              💪
            </div>

          </div>

          {strongTopics.length > 0 ? (

            <div className="space-y-3">

              {strongTopics.slice(0, 5).map((item) => (

                <div
                  key={item.topic}
                  className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100"
                >

                  <div className="flex items-center justify-between gap-4">

                    <div className="min-w-0">

                      <p className="font-bold text-slate-800 truncate">
                        {item.topic}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        {item.attempts} attempt
                        {item.attempts !== 1 ? "s" : ""}
                      </p>

                    </div>

                    <span className="text-lg font-bold text-emerald-600 shrink-0">
                      {item.accuracy}%
                    </span>

                  </div>

                  <div className="mt-3 h-2 bg-emerald-100 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${item.accuracy}%`,
                      }}
                    />

                  </div>

                </div>

              ))}

            </div>

          ) : (

            <div className="py-10 text-center">

              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl">
                📚
              </div>

              <p className="font-bold text-slate-800 mt-4">
                No strong topics yet
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Complete more quizzes to build your profile.
              </p>

            </div>

          )}

        </div>

      </div>

      {/* ================= CHARTS ================= */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Weekly */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

          <div className="flex items-start justify-between mb-5">

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Weekly Study Activity
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Completed tasks during the last 7 days
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              📅
            </div>

          </div>

          <div className="h-72">

            <ResponsiveContainer width="100%" height="100%">

              <LineChart data={weeklyData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="day"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* Quiz Performance */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

          <div className="flex items-start justify-between mb-5">

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Quiz Performance
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Your latest quiz scores
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              🧠
            </div>

          </div>

          <div className="h-72">

            {quizChartData.length > 0 ? (

              <ResponsiveContainer width="100%" height="100%">

                <BarChart data={quizChartData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="score"
                    fill="#7c3aed"
                    radius={[7, 7, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            ) : (

              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
                  🧠
                </div>

                <p className="text-slate-500 font-medium mt-3">
                  No quiz attempts yet
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Complete a quiz to see your performance.
                </p>
              </div>

            )}

          </div>

        </div>

      </div>

      {/* ================= SUBJECT PROGRESS ================= */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6">

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Subject Progress
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Compare your progress across subjects
            </p>
          </div>

          <span className="text-sm text-slate-400">
            {subjects.length} subject
            {subjects.length !== 1 ? "s" : ""}
          </span>

        </div>

        {subjectChartData.length > 0 ? (

          <div className="h-80">

            <ResponsiveContainer width="100%" height="100%">

              <BarChart data={subjectChartData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="name"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip />

                <Bar
                  dataKey="progress"
                  fill="#4f46e5"
                  radius={[7, 7, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        ) : (

          <div className="py-14 text-center">

            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl">
              📚
            </div>

            <p className="font-bold text-slate-800 mt-4">
              No subjects added yet
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Add subjects to start tracking your progress.
            </p>

          </div>

        )}

      </div>

      {/* ================= WEAK SUBJECTS ================= */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

        <div className="flex items-center justify-between mb-6">

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Areas That Need Attention
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Subjects where you should focus more
            </p>
          </div>

          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-xl">
            🎯
          </div>

        </div>

        {weakSubjects.length > 0 ? (

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {weakSubjects.slice(0, 6).map((subject) => (

              <div
                key={subject._id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-100"
              >

                <div className="flex items-center justify-between mb-2">

                  <span className="font-bold text-slate-800">
                    {subject.name}
                  </span>

                  <span className="text-sm font-bold text-red-500">
                    {subject.progress}%
                  </span>

                </div>

                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-red-400 rounded-full"
                    style={{
                      width: `${subject.progress}%`,
                    }}
                  />

                </div>

                <div className="flex justify-between items-center mt-2">

                  <span className="text-xs text-slate-400">
                    Needs attention
                  </span>

                  <span className="text-xs font-semibold text-red-500">
                    {60 - Number(subject.progress || 0)}% to target
                  </span>

                </div>

              </div>

            ))}

          </div>

        ) : (

          <div className="text-center py-10">

            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center text-3xl">
              🎉
            </div>

            <p className="font-bold text-slate-800 mt-4">
              Great job!
            </p>

            <p className="text-sm text-slate-500 mt-1">
              No weak subjects detected.
            </p>

          </div>

        )}

      </div>

      {/* ================= RECENT QUIZZES ================= */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6">

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Recent Quiz Attempts
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Your latest quiz performance
            </p>
          </div>

          <span className="text-sm text-slate-400">
            Latest 5 attempts
          </span>

        </div>

        {quizResults.length > 0 ? (

          <div className="space-y-3">

            {quizResults
              .slice(0, 5)
              .map((quiz) => {

                const percentage =
                  quiz.totalQuestions > 0
                    ? Math.round(
                        (quiz.score /
                          quiz.totalQuestions) *
                          100
                      )
                    : 0

                const style = getProgressStyle(percentage)

                return (

                  <div
                    key={quiz._id}
                    className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-sm transition"
                  >

                    <div className="flex items-center gap-3 min-w-0">

                      <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                        🧠
                      </div>

                      <div className="min-w-0">

                        <p className="font-bold text-slate-800 truncate">
                          {quiz.topic}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          {quiz.createdAt
                            ? new Date(
                                quiz.createdAt
                              ).toLocaleDateString()
                            : "Recent attempt"}
                          {" • "}
                          {quiz.score}/{quiz.totalQuestions}
                        </p>

                      </div>

                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">

                      <span
                        className={`px-3 py-1.5 rounded-lg border text-sm font-bold ${style}`}
                      >
                        {percentage}%
                      </span>

                    </div>

                  </div>

                )
              })}

          </div>

        ) : (

          <div className="py-12 text-center">

            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
              🧠
            </div>

            <p className="font-bold text-slate-800 mt-4">
              No quiz attempts yet
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Complete a quiz to start tracking performance.
            </p>

          </div>

        )}

      </div>

    </div>
  )
}

export default Progress