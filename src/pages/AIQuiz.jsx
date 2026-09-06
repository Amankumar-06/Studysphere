import { useState } from "react"

function AIQuiz() {
  const [topic, setTopic] = useState("")
  const [difficulty, setDifficulty] = useState("Medium")
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [answers, setAnswers] = useState([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [finished, setFinished] = useState(false)
  const [error, setError] = useState("")

  // Generate AI Quiz
  const generateQuiz = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic first.")
      return
    }

    setLoading(true)
    setError("")
    setQuestions([])
    setCurrentQuestion(0)
    setScore(0)
    setAnswers([])
    setFinished(false)
    setSelectedAnswer("")
    setShowFeedback(false)

    try {
      const token = localStorage.getItem("token")

      const response = await fetch(
        "https://studysphere-5i7u.onrender.com/api/generate-quiz",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            topic,
            difficulty,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to generate quiz"
        )
      }

      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("No questions were generated.")
      }

      setQuestions(data.questions)
    } catch (err) {
      setError(err.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  // Select answer
  const handleAnswer = (answer) => {
    if (showFeedback) return

    const question = questions[currentQuestion]
    const isCorrect = answer === question.answer

    setSelectedAnswer(answer)
    setShowFeedback(true)

    // Save answer locally
    setAnswers((prev) => {
      const updated = [...prev]

      updated[currentQuestion] = {
        question: question.question,
        options: question.options,
        correctAnswer: question.answer,
        selectedAnswer: answer,
        isCorrect,
      }

      return updated
    })

    if (isCorrect) {
      setScore((prev) => prev + 1)
    }
  }

  // Save result in database
  const saveQuizResult = async (finalScore, finalAnswers) => {
    try {
      setSaving(true)

      const token = localStorage.getItem("token")

      const response = await fetch(
        "https://studysphere-5i7u.onrender.com/api/quiz-results",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            topic: `AI Quiz - ${topic}`,
            score: finalScore,
            totalQuestions: questions.length,
            questions: finalAnswers,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Failed to save quiz result"
        )
      }

      return true
    } catch (error) {
      console.error("Failed to save quiz result:", error)
      return false
    } finally {
      setSaving(false)
    }
  }

  // Next question / finish quiz
  const nextQuestion = async () => {
    if (!selectedAnswer) return

    const question = questions[currentQuestion]

    const currentAnswer = {
      question: question.question,
      options: question.options,
      correctAnswer: question.answer,
      selectedAnswer: selectedAnswer,
      isCorrect: selectedAnswer === question.answer,
    }

    // Make sure latest answer is included
    const finalAnswers = [...answers]
    finalAnswers[currentQuestion] = currentAnswer

    if (currentQuestion + 1 < questions.length) {
      setAnswers(finalAnswers)

      setCurrentQuestion((prev) => prev + 1)
      setSelectedAnswer("")
      setShowFeedback(false)
    } else {
      // Calculate final score from all answers
      const finalScore = finalAnswers.reduce(
        (total, answer) => {
          return total + (answer?.isCorrect ? 1 : 0)
        },
        0
      )

      setAnswers(finalAnswers)
      setScore(finalScore)
      setFinished(true)

      await saveQuizResult(finalScore, finalAnswers)
    }
  }

  // Restart
  const restartQuiz = () => {
    setQuestions([])
    setCurrentQuestion(0)
    setSelectedAnswer("")
    setAnswers([])
    setShowFeedback(false)
    setScore(0)
    setFinished(false)
    setError("")
  }

  const backToGenerator = () => {
    setQuestions([])
    setCurrentQuestion(0)
    setSelectedAnswer("")
    setAnswers([])
    setShowFeedback(false)
    setScore(0)
    setFinished(false)
    setError("")
  }

  const progress =
    questions.length > 0
      ? ((currentQuestion + 1) / questions.length) * 100
      : 0

  // =========================
  // FINISHED SCREEN
  // =========================

  if (finished) {
    const percentage =
      questions.length > 0
        ? Math.round((score / questions.length) * 100)
        : 0

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 text-center text-white">
            <div className="text-6xl mb-4">
              {percentage >= 80
                ? "🏆"
                : percentage >= 50
                ? "🎉"
                : "💪"}
            </div>

            <h1 className="text-3xl font-bold">
              Quiz Completed!
            </h1>

            <p className="text-blue-100 mt-2">
              Your AI quiz performance has been saved.
            </p>
          </div>

          <div className="p-8">

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

              <div className="bg-blue-50 rounded-2xl p-6 text-center">
                <p className="text-sm text-slate-500">
                  Score
                </p>

                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {score}/{questions.length}
                </p>
              </div>

              <div className="bg-green-50 rounded-2xl p-6 text-center">
                <p className="text-sm text-slate-500">
                  Accuracy
                </p>

                <p className="text-3xl font-bold text-green-600 mt-2">
                  {percentage}%
                </p>
              </div>

              <div className="bg-purple-50 rounded-2xl p-6 text-center">
                <p className="text-sm text-slate-500">
                  Difficulty
                </p>

                <p className="text-2xl font-bold text-purple-600 mt-2">
                  {difficulty}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-8">

              <div className="flex justify-between mb-2">
                <span className="font-medium text-slate-700">
                  Overall Performance
                </span>

                <span className="font-bold text-slate-900">
                  {percentage}%
                </span>
              </div>

              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* Save status */}
            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700">
              ✓ Your detailed quiz result has been saved successfully.
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">

              <button
                onClick={restartQuiz}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold transition"
              >
                Generate Another Quiz
              </button>

              <button
                onClick={backToGenerator}
                className="flex-1 border border-slate-300 hover:bg-slate-50 text-slate-700 py-3.5 rounded-xl font-semibold transition"
              >
                Back to AI Quiz
              </button>
            </div>

            {saving && (
              <p className="text-center text-sm text-slate-400 mt-4">
                Saving result...
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // =========================
  // QUIZ SCREEN
  // =========================

  if (questions.length > 0) {
    const question = questions[currentQuestion]

    return (
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">

          <div>
            <p className="text-sm text-blue-600 font-semibold">
              AI GENERATED QUIZ
            </p>

            <h1 className="text-3xl font-bold text-slate-900 mt-1">
              {topic}
            </h1>
          </div>

          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
            <span className="font-bold text-blue-600">
              {currentQuestion + 1}
            </span>

            <span className="text-slate-400">
              {" "}
              / {questions.length}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-slate-200 h-2 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">

          {/* Question Header */}
          <div className="flex items-center gap-3 mb-6">

            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-xl">
              🧠
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Question {currentQuestion + 1}
              </p>

              <p className="text-xs text-slate-400">
                Difficulty: {difficulty}
              </p>
            </div>
          </div>

          {/* Question */}
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-relaxed mb-8">
            {question.question}
          </h2>

          {/* Options */}
          <div className="space-y-4">

            {question.options.map((option, index) => {

              const isSelected = selectedAnswer === option
              const isCorrect = option === question.answer

              let optionClass =
                "border-slate-200 hover:border-blue-400 hover:bg-blue-50"

              if (showFeedback && isCorrect) {
                optionClass =
                  "border-green-500 bg-green-50 text-green-800"
              } else if (
                showFeedback &&
                isSelected &&
                !isCorrect
              ) {
                optionClass =
                  "border-red-500 bg-red-50 text-red-800"
              } else if (isSelected) {
                optionClass =
                  "border-blue-600 bg-blue-50 text-blue-800"
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${optionClass}`}
                >
                  <div className="flex items-center gap-4">

                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold shrink-0">
                      {String.fromCharCode(65 + index)}
                    </div>

                    <span className="font-medium">
                      {option}
                    </span>

                    {showFeedback && isCorrect && (
                      <span className="ml-auto text-green-600 text-xl">
                        ✓
                      </span>
                    )}

                    {showFeedback &&
                      isSelected &&
                      !isCorrect && (
                        <span className="ml-auto text-red-600 text-xl">
                          ✕
                        </span>
                      )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div
              className={`mt-6 p-5 rounded-2xl ${
                selectedAnswer === question.answer
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >

              <p
                className={`font-bold ${
                  selectedAnswer === question.answer
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {selectedAnswer === question.answer
                  ? "✓ Correct Answer!"
                  : "✕ Wrong Answer"}
              </p>

              {selectedAnswer !== question.answer && (
                <p className="text-slate-600 mt-2">
                  Correct answer:{" "}
                  <span className="font-semibold text-slate-900">
                    {question.answer}
                  </span>
                </p>
              )}
            </div>
          )}

          {/* Next */}
          {showFeedback && (
            <button
              onClick={nextQuestion}
              disabled={saving}
              className="w-full mt-6 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white py-4 rounded-xl font-semibold transition"
            >
              {saving
                ? "Saving Quiz..."
                : currentQuestion + 1 === questions.length
                ? "Finish Quiz"
                : "Next Question →"}
            </button>
          )}
        </div>

        {/* Score */}
        <div className="mt-5 text-center text-sm text-slate-500">
          Current Score:{" "}
          <span className="font-bold text-slate-800">
            {score}
          </span>
        </div>
      </div>
    )
  }

  // =========================
  // GENERATOR SCREEN
  // =========================

  return (
    <div className="max-w-5xl mx-auto">

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 md:p-10 text-white shadow-xl mb-8">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          <div>

            <div className="inline-flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full text-sm mb-4">
              🤖 Powered by AI
            </div>

            <h1 className="text-3xl md:text-4xl font-bold">
              AI Quiz Generator
            </h1>

            <p className="text-blue-100 mt-3 max-w-xl">
              Enter any topic and let AI create a personalized quiz
              for your preparation.
            </p>
          </div>

          <div className="text-7xl hidden md:block">
            🧠
          </div>
        </div>
      </div>

      {/* Generator Card */}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">

        <div className="flex items-center gap-3 mb-7">

          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
            ✨
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Create Your Quiz
            </h2>

            <p className="text-sm text-slate-500">
              Choose a topic and difficulty level
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid md:grid-cols-3 gap-5">

          <div className="md:col-span-2">

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Topic
            </label>

            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  generateQuiz()
                }
              }}
              placeholder="e.g. Operating System, Java, History..."
              className="w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Difficulty
            </label>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* Generate */}
        <button
          onClick={generateQuiz}
          disabled={loading}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-4 rounded-xl font-bold transition shadow-lg shadow-blue-600/20"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">

              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />

              Generating Quiz...
            </span>
          ) : (
            "✨ Generate AI Quiz"
          )}
        </button>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-5 mt-6">

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="text-3xl mb-3">
            🎯
          </div>

          <h3 className="font-bold text-slate-900">
            Personalized
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            Generate questions based on your selected topic.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="text-3xl mb-3">
            ⚡
          </div>

          <h3 className="font-bold text-slate-900">
            Instant Generation
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            Get a complete quiz in seconds using AI.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="text-3xl mb-3">
            📊
          </div>

          <h3 className="font-bold text-slate-900">
            Detailed Tracking
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            Every question and answer is saved for performance analysis.
          </p>
        </div>

      </div>
    </div>
  )
}

export default AIQuiz