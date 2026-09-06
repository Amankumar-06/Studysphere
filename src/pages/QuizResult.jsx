import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

function QuizResult() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = localStorage.getItem("token")

        const response = await fetch(
          `http://localhost:5000/api/quiz-results/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch result")
        }

        setResult(data)
      } catch (error) {
        console.error("Quiz Result Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResult()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin" />
          </div>

          <p className="mt-5 text-slate-500 font-medium">
            Loading quiz result...
          </p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="max-w-3xl mx-auto py-16">
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm">

          <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-4xl mb-5">
            😕
          </div>

          <h1 className="text-2xl font-bold text-slate-800">
            Quiz Result Not Found
          </h1>

          <p className="text-slate-500 mt-2">
            This quiz result could not be loaded.
          </p>

          <button
            onClick={() => navigate("/quiz-history")}
            className="mt-7 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20"
          >
            ← Back to Quiz History
          </button>

        </div>
      </div>
    )
  }

  const percentage = result.totalQuestions
    ? Math.round(
        (result.score / result.totalQuestions) * 100
      )
    : 0

  const correctCount = result.questions
    ? result.questions.filter((q) => q.isCorrect).length
    : result.score

  const wrongCount = result.questions
    ? result.questions.filter((q) => !q.isCorrect).length
    : Math.max(result.totalQuestions - result.score, 0)

  const unansweredCount = result.questions
    ? result.questions.filter(
        (q) => !q.selectedAnswer
      ).length
    : 0

  const getPerformance = () => {
    if (percentage >= 80) {
      return {
        label: "Excellent",
        text: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        bar: "bg-emerald-500",
        message:
          "Great work! You have a strong understanding of this topic.",
      }
    }

    if (percentage >= 50) {
      return {
        label: "Good",
        text: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-100",
        bar: "bg-amber-500",
        message:
          "Good attempt! A little more practice can improve your score.",
      }
    }

    return {
      label: "Needs Practice",
      text: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-100",
      bar: "bg-red-500",
      message:
        "Keep practicing. Reviewing the incorrect answers will help you improve.",
    }
  }

  const performance = getPerformance()

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">

      {/* ================= HERO ================= */}

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-700 text-white shadow-xl">

        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-2xl" />

        <div className="absolute -bottom-28 left-1/3 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl" />

        <div className="relative p-6 md:p-8">

          <button
            onClick={() => navigate("/quiz-history")}
            className="inline-flex items-center gap-2 text-indigo-100 hover:text-white text-sm font-medium mb-6 transition"
          >
            ← Back to Quiz History
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

            <div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-semibold mb-3">
                <span>📊</span>
                Quiz Performance
              </div>

              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {result.topic || "Quiz Result"}
              </h1>

              <p className="text-indigo-100 mt-2">
                Detailed review of your quiz attempt and performance.
              </p>

            </div>

            <div className="flex items-center gap-4">

              <div className="text-right">
                <p className="text-xs text-indigo-200 uppercase tracking-wider">
                  Accuracy
                </p>

                <p className="text-4xl font-bold">
                  {percentage}%
                </p>
              </div>

              <div className="w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center bg-white/10">
                <span className="text-2xl">
                  {percentage >= 80
                    ? "🏆"
                    : percentage >= 50
                    ? "⭐"
                    : "💪"}
                </span>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* ================= STATS ================= */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                Score
              </p>

              <p className="text-2xl font-bold text-slate-800 mt-2">
                {result.score}
                <span className="text-sm text-slate-400">
                  /{result.totalQuestions}
                </span>
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
              🎯
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                Correct
              </p>

              <p className="text-2xl font-bold text-emerald-600 mt-2">
                {correctCount}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
              ✓
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                Wrong
              </p>

              <p className="text-2xl font-bold text-red-600 mt-2">
                {wrongCount}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
              ✕
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                Attempted On
              </p>

              <p className="text-sm font-bold text-slate-800 mt-2">
                {result.createdAt
                  ? new Date(
                      result.createdAt
                    ).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">
              📅
            </div>
          </div>
        </div>

      </div>

      {/* ================= PERFORMANCE ================= */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <div className="flex items-center gap-3">

              <h2 className="text-xl font-bold text-slate-800">
                Performance Summary
              </h2>

              <span
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${performance.text} ${performance.bg} ${performance.border}`}
              >
                {performance.label}
              </span>

            </div>

            <p className="text-slate-500 mt-2">
              {performance.message}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase font-bold">
              Accuracy
            </p>

            <p className={`text-2xl font-bold ${performance.text}`}>
              {percentage}%
            </p>
          </div>

        </div>

        <div className="mt-5">

          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Performance</span>
            <span>{percentage}%</span>
          </div>

          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">

            <div
              className={`h-full ${performance.bar} rounded-full transition-all duration-1000`}
              style={{
                width: `${percentage}%`,
              }}
            />

          </div>

        </div>

        {unansweredCount > 0 && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-500">
            ℹ️ {unansweredCount} question
            {unansweredCount !== 1 ? "s were" : " was"} left unanswered.
          </div>
        )}

      </div>

      {/* ================= QUESTION REVIEW ================= */}

      <div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">

          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Question Review
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Check your answers and learn from your mistakes.
            </p>
          </div>

          {result.questions?.length > 0 && (
            <span className="text-sm text-slate-400">
              {result.questions.length} questions
            </span>
          )}

        </div>

        {result.questions?.length > 0 ? (

          <div className="space-y-4">

            {result.questions.map((question, index) => {

              const isCorrect = question.isCorrect

              return (
                <div
                  key={index}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                    isCorrect
                      ? "border-emerald-100"
                      : "border-red-100"
                  }`}
                >

                  {/* Question top bar */}

                  <div
                    className={`h-1 ${
                      isCorrect
                        ? "bg-emerald-500"
                        : "bg-red-500"
                    }`}
                  />

                  <div className="p-5 md:p-6">

                    {/* Header */}

                    <div className="flex items-start gap-4">

                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                          isCorrect
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="flex-1 min-w-0">

                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                          <h3 className="text-base md:text-lg font-bold text-slate-800 leading-relaxed">
                            {question.question}
                          </h3>

                          <span
                            className={`shrink-0 inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-bold ${
                              isCorrect
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {isCorrect
                              ? "✓ Correct"
                              : "✕ Wrong"}
                          </span>

                        </div>

                      </div>

                    </div>

                    {/* Options */}

                    <div className="mt-6 space-y-2.5">

                      {question.options?.map(
                        (option, optionIndex) => {

                          const isSelected =
                            question.selectedAnswer === option

                          const isCorrectOption =
                            question.correctAnswer === option

                          let optionStyle =
                            "border-slate-200 bg-slate-50 text-slate-600"

                          let badgeStyle =
                            "bg-white text-slate-500 border border-slate-200"

                          if (isCorrectOption) {
                            optionStyle =
                              "border-emerald-200 bg-emerald-50 text-emerald-700"

                            badgeStyle =
                              "bg-emerald-500 text-white"
                          } else if (isSelected) {
                            optionStyle =
                              "border-red-200 bg-red-50 text-red-700"

                            badgeStyle =
                              "bg-red-500 text-white"
                          }

                          return (
                            <div
                              key={optionIndex}
                              className={`flex items-center gap-3 p-3.5 rounded-xl border transition ${optionStyle}`}
                            >

                              <span
                                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${badgeStyle}`}
                              >
                                {String.fromCharCode(
                                  65 + optionIndex
                                )}
                              </span>

                              <span className="flex-1 text-sm font-medium">
                                {option}
                              </span>

                              {isCorrectOption && (
                                <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                                  ✓ Correct Answer
                                </span>
                              )}

                              {isSelected &&
                                !isCorrectOption && (
                                  <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-red-600">
                                    ✕ Your Answer
                                  </span>
                                )}

                            </div>
                          )
                        }
                      )}

                    </div>

                    {/* Answer Summary */}

                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">

                        <p className="text-xs uppercase tracking-wider font-bold text-slate-400">
                          Your Answer
                        </p>

                        <p
                          className={`text-sm font-semibold mt-1 ${
                            isCorrect
                              ? "text-emerald-600"
                              : question.selectedAnswer
                              ? "text-red-600"
                              : "text-slate-500"
                          }`}
                        >
                          {question.selectedAnswer ||
                            "Not answered"}
                        </p>

                      </div>

                      {!isCorrect && (
                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">

                          <p className="text-xs uppercase tracking-wider font-bold text-emerald-500">
                            Correct Answer
                          </p>

                          <p className="text-sm font-semibold text-emerald-700 mt-1">
                            {question.correctAnswer}
                          </p>

                        </div>
                      )}

                    </div>

                  </div>
                </div>
              )
            })}

          </div>

        ) : (

          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">

            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-3xl mb-4">
              📋
            </div>

            <h3 className="text-lg font-bold text-slate-800">
              Detailed questions unavailable
            </h3>

            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              This quiz was saved before detailed answer tracking was enabled.
            </p>

          </div>
        )}

      </div>

      {/* ================= BOTTOM ACTIONS ================= */}

      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 md:p-6 text-white">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

          <div>
            <h3 className="font-bold text-lg">
              Ready for another challenge?
            </h3>

            <p className="text-slate-400 text-sm mt-1">
              Keep practicing to improve your accuracy.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">

            <button
              onClick={() => navigate("/quiz")}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition"
            >
              🧠 Take New Quiz
            </button>

            <button
              onClick={() => navigate("/quiz-history")}
              className="px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-xl font-bold transition"
            >
              📜 Quiz History
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}

export default QuizResult