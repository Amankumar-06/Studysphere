import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function QuizHistory() {
  const navigate = useNavigate()

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const token = localStorage.getItem("token")

  useEffect(() => {
    const fetchQuizHistory = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await fetch(
          "https://studysphere-5i7u.onrender.com/api/quiz-results",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to fetch quiz history"
          )
        }

        setResults(
          Array.isArray(data)
            ? data
            : Array.isArray(data.results)
            ? data.results
            : []
        )
      } catch (error) {
        console.error("Quiz History Error:", error)
        setError("Unable to load quiz history.")
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchQuizHistory()
    } else {
      setLoading(false)
      setError("Please login again.")
    }
  }, [token])

  const getPercentage = (score, total) => {
    if (!total) return 0
    return Math.round((score / total) * 100)
  }

  const getScoreColor = (percentage) => {
    if (percentage >= 80) {
      return {
        text: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        bar: "bg-emerald-500",
      }
    }

    if (percentage >= 50) {
      return {
        text: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-100",
        bar: "bg-amber-500",
      }
    }

    return {
      text: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-100",
      bar: "bg-red-500",
    }
  }

  const getScoreLabel = (percentage) => {
    if (percentage >= 80) return "Excellent"
    if (percentage >= 50) return "Good"
    return "Needs Practice"
  }

  const averageScore =
    results.length > 0
      ? Math.round(
          results.reduce(
            (sum, result) =>
              sum +
              getPercentage(
                result.score,
                result.totalQuestions
              ),
            0
          ) / results.length
        )
      : 0

  const bestScore =
    results.length > 0
      ? Math.max(
          ...results.map((result) =>
            getPercentage(
              result.score,
              result.totalQuestions
            )
          )
        )
      : 0

  const totalQuestions = results.reduce(
    (sum, result) => sum + (result.totalQuestions || 0),
    0
  )

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />

            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin" />
          </div>

          <p className="mt-5 text-slate-500 font-medium">
            Loading your quiz history...
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Please wait a moment
          </p>
        </div>
      </div>
    )
  }

  // ================= ERROR =================

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="relative overflow-hidden bg-white border border-red-100 rounded-3xl p-8 md:p-12 text-center shadow-sm">

          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500" />

          <div className="w-20 h-20 mx-auto rounded-2xl bg-red-50 flex items-center justify-center text-4xl mb-5">
            ⚠️
          </div>

          <h2 className="text-2xl font-bold text-slate-800">
            Something went wrong
          </h2>

          <p className="text-slate-500 mt-2">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-7 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">

      {/* ================= HERO ================= */}

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-700 text-white shadow-xl">

        {/* Decorative circles */}

        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl" />

        <div className="absolute -bottom-24 left-1/3 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl" />

        <div className="relative p-6 md:p-8">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div>

              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-indigo-100 text-xs font-semibold">
                  Performance Center
                </span>

                <span className="text-indigo-200 text-sm">
                  • {results.length} attempt
                  {results.length !== 1 ? "s" : ""}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Quiz History
              </h1>

              <p className="text-indigo-100 mt-2 max-w-xl">
                Review your previous attempts, track accuracy,
                and identify where you can improve.
              </p>

            </div>

            <button
              onClick={() => navigate("/quiz")}
              className="shrink-0 bg-white text-indigo-600 px-6 py-3.5 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg flex items-center justify-center gap-2"
            >
              <span>🧠</span>
              Take New Quiz
              <span>→</span>
            </button>

          </div>

        </div>
      </div>

      {/* ================= STATS ================= */}

      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Attempts */}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500 font-medium">
                  Total Attempts
                </p>

                <p className="text-3xl font-bold text-slate-800 mt-1">
                  {results.length}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-xl">
                📚
              </div>

            </div>
          </div>

          {/* Average */}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500 font-medium">
                  Average Accuracy
                </p>

                <p className="text-3xl font-bold text-slate-800 mt-1">
                  {averageScore}%
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-xl">
                📈
              </div>

            </div>
          </div>

          {/* Best */}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500 font-medium">
                  Best Score
                </p>

                <p className="text-3xl font-bold text-slate-800 mt-1">
                  {bestScore}%
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-xl">
                🏆
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ================= EMPTY STATE ================= */}

      {results.length === 0 ? (

        <div className="relative overflow-hidden bg-white rounded-3xl border border-slate-200 p-10 md:p-16 text-center shadow-sm">

          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />

          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-5xl mb-6">
            🧠
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
            No quiz attempts yet
          </h2>

          <p className="text-slate-500 mt-3 max-w-md mx-auto leading-relaxed">
            Take your first quiz and your scores, accuracy,
            and detailed performance will appear here.
          </p>

          <button
            onClick={() => navigate("/quiz")}
            className="mt-7 px-7 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20"
          >
            Start Your First Quiz →
          </button>

        </div>

      ) : (

        <div className="space-y-5">

          {/* ================= SECTION HEADER ================= */}

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">

            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                Previous Attempts
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Your latest quiz attempts are shown first.
              </p>
            </div>

            <div className="text-sm text-slate-400">
              {totalQuestions} questions attempted
            </div>

          </div>

          {/* ================= RESULTS ================= */}

          <div className="space-y-4">

            {results.map((result) => {

              const percentage = getPercentage(
                result.score,
                result.totalQuestions
              )

              const scoreStyle = getScoreColor(percentage)

              return (
                <div
                  key={result._id}
                  className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all duration-300 overflow-hidden"
                >

                  <div className="p-5 md:p-6">

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                      {/* ================= QUIZ INFO ================= */}

                      <div className="flex items-start gap-4 min-w-0">

                        <div className="relative shrink-0">

                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                            🧠
                          </div>

                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white shadow flex items-center justify-center text-xs">
                            ✓
                          </div>

                        </div>

                        <div className="min-w-0">

                          <h3 className="font-bold text-slate-800 text-lg md:text-xl truncate">
                            {result.topic || "Quiz"}
                          </h3>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">

                            <span className="text-sm text-slate-500">
                              {result.totalQuestions} questions
                            </span>

                            <span className="text-slate-300">
                              •
                            </span>

                            <span className="text-xs text-slate-400">
                              {result.createdAt
                                ? new Date(
                                    result.createdAt
                                  ).toLocaleString()
                                : "Recent attempt"}
                            </span>

                          </div>

                          <div className="mt-3">

                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${scoreStyle.text} ${scoreStyle.bg} ${scoreStyle.border}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {getScoreLabel(percentage)}
                            </span>

                          </div>

                        </div>

                      </div>

                      {/* ================= SCORE AREA ================= */}

                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-7">

                        <div className="flex items-center gap-7">

                          {/* Score */}

                          <div>
                            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">
                              Score
                            </p>

                            <p className="text-xl font-bold text-slate-800 mt-1">
                              {result.score}
                              <span className="text-slate-400 text-sm font-medium">
                                /{result.totalQuestions}
                              </span>
                            </p>
                          </div>

                          {/* Accuracy */}

                          <div>
                            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">
                              Accuracy
                            </p>

                            <span
                              className={`inline-flex mt-1 px-3 py-1.5 rounded-lg text-sm font-bold ${scoreStyle.text} ${scoreStyle.bg}`}
                            >
                              {percentage}%
                            </span>
                          </div>

                        </div>

                        <button
                          onClick={() =>
                            navigate(
                              `/quiz-result/${result._id}`
                            )
                          }
                          className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-sm group-hover:shadow-md"
                        >
                          View Details →
                        </button>

                      </div>

                    </div>

                    {/* ================= PROGRESS ================= */}

                    <div className="mt-6">

                      <div className="flex items-center justify-between mb-2">

                        <span className="text-xs font-medium text-slate-400">
                          Performance
                        </span>

                        <span className="text-xs font-bold text-slate-500">
                          {percentage}%
                        </span>

                      </div>

                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">

                        <div
                          className={`h-full ${scoreStyle.bar} rounded-full transition-all duration-700`}
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>

                  </div>

                </div>
              )
            })}

          </div>

        </div>
      )}

    </div>
  )
}

export default QuizHistory