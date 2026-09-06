import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Quiz() {
  const navigate = useNavigate()

  const questions = [
    {
      question: "What does DBMS stand for?",
      options: [
        "Database Management System",
        "Data Backup Management System",
        "Database Monitoring System",
        "Digital Base Management System",
      ],
      answer: "Database Management System",
    },
    {
      question: "Which data structure follows LIFO?",
      options: [
        "Queue",
        "Stack",
        "Linked List",
        "Tree",
      ],
      answer: "Stack",
    },
    {
      question: "Which language is primarily used for web page structure?",
      options: [
        "Python",
        "Java",
        "HTML",
        "C++",
      ],
      answer: "HTML",
    },
    {
      question: "Which sorting algorithm repeatedly selects the minimum element?",
      options: [
        "Merge Sort",
        "Selection Sort",
        "Bubble Sort",
        "Quick Sort",
      ],
      answer: "Selection Sort",
    },
    {
      question: "Which protocol is commonly used for secure web communication?",
      options: [
        "HTTP",
        "FTP",
        "HTTPS",
        "SMTP",
      ],
      answer: "HTTPS",
    },
  ]

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [answers, setAnswers] = useState([])
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [answered, setAnswered] = useState(false)
  const [saving, setSaving] = useState(false)

  const question = questions[currentQuestion]

  const handleAnswer = (option) => {
    if (answered) return

    setSelectedAnswer(option)
    setAnswered(true)

    setAnswers((prev) => {
      const updated = [...prev]
      updated[currentQuestion] = option
      return updated
    })

    if (option === question.answer) {
      setScore((prev) => prev + 1)
    }
  }

  const saveQuizResult = async (finalScore, finalAnswers) => {
    try {
      setSaving(true)

      const token = localStorage.getItem("token")

      const detailedQuestions = questions.map((q, index) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.answer,
        selectedAnswer: finalAnswers[index] || "",
        isCorrect: finalAnswers[index] === q.answer,
      }))

      const response = await fetch(
        "http://localhost:5000/api/quiz-results",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            topic: "General Quiz",
            score: finalScore,
            totalQuestions: questions.length,
            questions: detailedQuestions,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save quiz result"
        )
      }

      return data.quizResult
    } catch (error) {
      console.error("Quiz result save error:", error)
      return null
    } finally {
      setSaving(false)
    }
  }

  const nextQuestion = async () => {
    if (!answered) return

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setSelectedAnswer("")
      setAnswered(false)
    } else {
      const finalAnswers = [...answers]

      finalAnswers[currentQuestion] = selectedAnswer

      const finalScore = questions.reduce(
        (total, q, index) =>
          total + (finalAnswers[index] === q.answer ? 1 : 0),
        0
      )

      setScore(finalScore)
      setAnswers(finalAnswers)
      setShowResult(true)

      await saveQuizResult(finalScore, finalAnswers)
    }
  }

  const restartQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer("")
    setAnswers([])
    setScore(0)
    setShowResult(false)
    setAnswered(false)
  }

  const getResultMessage = () => {
    const percentage = (score / questions.length) * 100

    if (percentage === 100) {
      return "Outstanding! Perfect score."
    }

    if (percentage >= 80) {
      return "Excellent performance! Keep it up."
    }

    if (percentage >= 60) {
      return "Good job! A little more practice will help."
    }

    return "Keep practicing. You can improve!"
  }

  const progress =
    ((currentQuestion + 1) / questions.length) * 100

  if (showResult) {
    const percentage = Math.round(
      (score / questions.length) * 100
    )

    return (
      <div className="max-w-4xl mx-auto">

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 text-center">

          <div className="w-24 h-24 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-5xl mb-6">
            🏆
          </div>

          <p className="text-blue-600 font-medium text-sm mb-2">
            Quiz Completed
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Great Work!
          </h1>

          <p className="text-gray-500 mt-3">
            {getResultMessage()}
          </p>

          <div className="my-10">

            <div className="text-6xl font-bold text-blue-600">
              {score}/{questions.length}
            </div>

            <p className="text-gray-500 mt-2">
              Your Score
            </p>

          </div>

          <div className="max-w-md mx-auto mb-8">

            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">
                Accuracy
              </span>

              <span className="font-bold text-gray-800">
                {percentage}%
              </span>
            </div>

            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">

              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{
                  width: `${percentage}%`,
                }}
              />

            </div>

          </div>

          {saving && (
            <p className="text-sm text-gray-400 mb-4">
              Saving your result...
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">

            <button
              onClick={restartQuiz}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition shadow-sm"
            >
              🔄 Take Quiz Again
            </button>

            <button
              onClick={() => navigate("/quiz-history")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-medium transition"
            >
              📜 Quiz History
            </button>

          </div>

        </div>

      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">

      <div className="mb-8">

        <p className="text-blue-600 font-medium text-sm mb-1">
          Practice & Assessment
        </p>

        <h1 className="text-3xl font-bold text-gray-800">
          General Quiz
        </h1>

        <p className="text-gray-500 mt-2">
          Test your knowledge and improve your performance.
        </p>

      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

        <div className="p-6 md:p-8 border-b border-gray-100">

          <div className="flex items-center justify-between mb-4">

            <span className="text-sm font-medium text-gray-500">
              Question {currentQuestion + 1} of {questions.length}
            </span>

            <span className="text-sm font-bold text-blue-600">
              {Math.round(progress)}%
            </span>

          </div>

          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">

            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

        </div>

        <div className="p-6 md:p-10">

          <div className="flex items-start gap-4 mb-8">

            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-xl flex-shrink-0">
              ❓
            </div>

            <div>

              <p className="text-sm text-gray-400 mb-2">
                Question {currentQuestion + 1}
              </p>

              <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed">
                {question.question}
              </h2>

            </div>

          </div>

          <div className="space-y-3">

            {question.options.map((option, index) => {

              const isSelected = selectedAnswer === option

              const isCorrect =
                answered && option === question.answer

              const isWrong =
                answered &&
                isSelected &&
                option !== question.answer

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={answered}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    isCorrect
                      ? "border-green-500 bg-green-50"
                      : isWrong
                      ? "border-red-500 bg-red-50"
                      : isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-100 hover:border-blue-300 hover:bg-blue-50/50"
                  }`}
                >

                  <span
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${
                      isCorrect
                        ? "bg-green-500 text-white"
                        : isWrong
                        ? "bg-red-500 text-white"
                        : isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>

                  <span
                    className={`font-medium ${
                      isCorrect
                        ? "text-green-700"
                        : isWrong
                        ? "text-red-700"
                        : "text-gray-700"
                    }`}
                  >
                    {option}
                  </span>

                  <span className="ml-auto">
                    {isCorrect && "✓"}
                    {isWrong && "✕"}
                  </span>

                </button>
              )
            })}

          </div>

          {answered && (
            <div
              className={`mt-6 p-4 rounded-xl ${
                selectedAnswer === question.answer
                  ? "bg-green-50 border border-green-100"
                  : "bg-red-50 border border-red-100"
              }`}
            >

              <p
                className={`font-semibold ${
                  selectedAnswer === question.answer
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {selectedAnswer === question.answer
                  ? "🎉 Correct Answer!"
                  : "❌ Wrong Answer"}
              </p>

              {selectedAnswer !== question.answer && (
                <p className="text-sm text-gray-600 mt-1">
                  Correct answer:{" "}
                  <span className="font-semibold">
                    {question.answer}
                  </span>
                </p>
              )}

            </div>
          )}

          <div className="flex justify-end mt-8">

            <button
              onClick={nextQuestion}
              disabled={!answered}
              className={`px-7 py-3 rounded-xl font-medium transition ${
                answered
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {currentQuestion === questions.length - 1
                ? "Finish Quiz"
                : "Next Question →"}
            </button>

          </div>

        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

        <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
          <p className="text-2xl mb-1">🧠</p>
          <p className="text-sm text-gray-500">
            Test Knowledge
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
          <p className="text-2xl mb-1">📊</p>
          <p className="text-sm text-gray-500">
            Track Performance
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
          <p className="text-2xl mb-1">🚀</p>
          <p className="text-sm text-gray-500">
            Improve Daily
          </p>
        </div>

      </div>

    </div>
  )
}

export default Quiz