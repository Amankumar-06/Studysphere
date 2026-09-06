import { useEffect, useState } from "react"

function Pomodoro() {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState("Focus")
  const [sessions, setSessions] = useState(0)

  useEffect(() => {
    if (!isRunning) return

    const timer = setInterval(() => {
      if (seconds > 0) {
        setSeconds((prev) => prev - 1)
      } else if (minutes > 0) {
        setMinutes((prev) => prev - 1)
        setSeconds(59)
      } else {
        if (mode === "Focus") {
          setMode("Break")
          setMinutes(5)
          setSeconds(0)
          setSessions((prev) => prev + 1)
        } else {
          setMode("Focus")
          setMinutes(25)
          setSeconds(0)
        }
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, minutes, seconds, mode])

  const switchMode = (newMode) => {
    setMode(newMode)
    setIsRunning(false)

    if (newMode === "Focus") {
      setMinutes(25)
      setSeconds(0)
    } else {
      setMinutes(5)
      setSeconds(0)
    }
  }

  const resetTimer = () => {
    setIsRunning(false)

    if (mode === "Focus") {
      setMinutes(25)
      setSeconds(0)
    } else {
      setMinutes(5)
      setSeconds(0)
    }
  }

  const totalSeconds = mode === "Focus" ? 25 * 60 : 5 * 60
  const remainingSeconds = minutes * 60 + seconds

  const progress =
    ((totalSeconds - remainingSeconds) / totalSeconds) * 100

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
          Focus & Productivity
        </p>

        <h1 className="text-3xl font-bold text-slate-900 mt-1">
          Pomodoro Timer
        </h1>

        <p className="text-slate-500 mt-2">
          Focus on your studies, take meaningful breaks, and stay productive.
        </p>
      </div>

      {/* Main Timer */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 md:p-12">
          {/* Mode Buttons */}
          <div className="flex justify-center mb-10">
            <div className="bg-white/10 backdrop-blur-sm p-1.5 rounded-2xl flex gap-1">
              <button
                onClick={() => switchMode("Focus")}
                className={`px-6 py-3 rounded-xl font-semibold transition ${
                  mode === "Focus"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-white/10"
                }`}
              >
                🎯 Focus
              </button>

              <button
                onClick={() => switchMode("Break")}
                className={`px-6 py-3 rounded-xl font-semibold transition ${
                  mode === "Break"
                    ? "bg-green-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-white/10"
                }`}
              >
                ☕ Break
              </button>
            </div>
          </div>

          {/* Timer Circle */}
          <div className="flex justify-center">
            <div className="relative w-72 h-72 md:w-80 md:h-80">
              {/* Background Circle */}
              <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-white/10"
                />

                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className={
                    mode === "Focus"
                      ? "text-blue-500"
                      : "text-green-500"
                  }
                  strokeDasharray="282.6"
                  strokeDashoffset={
                    282.6 - (282.6 * progress) / 100
                  }
                  style={{
                    transition: "stroke-dashoffset 0.5s ease",
                  }}
                />
              </svg>

              {/* Timer Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-slate-400 text-sm font-medium">
                  {mode === "Focus"
                    ? "FOCUS SESSION"
                    : "BREAK TIME"}
                </span>

                <div className="text-6xl md:text-7xl font-bold text-white tracking-tight mt-2">
                  {String(minutes).padStart(2, "0")}:
                  {String(seconds).padStart(2, "0")}
                </div>

                <span className="text-slate-400 text-sm mt-3">
                  {isRunning ? "Timer running..." : "Ready to start"}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center items-center gap-4 mt-10">
            <button
              onClick={resetTimer}
              className="w-12 h-12 rounded-full bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white transition"
              title="Reset"
            >
              ↻
            </button>

            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-10 py-4 rounded-2xl font-bold text-lg transition shadow-lg ${
                isRunning
                  ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
                  : mode === "Focus"
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                  : "bg-green-600 hover:bg-green-700 text-white shadow-green-500/20"
              }`}
            >
              {isRunning ? "⏸ Pause" : "▶ Start"}
            </button>

            <button
              onClick={resetTimer}
              className="w-12 h-12 rounded-full bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white transition"
              title="Reset"
            >
              ⟳
            </button>
          </div>

          {/* Session Count */}
          <div className="text-center mt-8">
            <p className="text-slate-400 text-sm">
              Completed Focus Sessions
            </p>

            <p className="text-white text-2xl font-bold mt-1">
              {sessions}
            </p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-5 mt-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-xl mb-4">
            🎯
          </div>

          <h3 className="font-bold text-slate-900">
            25 Min Focus
          </h3>

          <p className="text-sm text-slate-500 mt-2">
            Work with full concentration without distractions.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center text-xl mb-4">
            ☕
          </div>

          <h3 className="font-bold text-slate-900">
            5 Min Break
          </h3>

          <p className="text-sm text-slate-500 mt-2">
            Give your mind a short break before the next session.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center text-xl mb-4">
            📈
          </div>

          <h3 className="font-bold text-slate-900">
            Better Productivity
          </h3>

          <p className="text-sm text-slate-500 mt-2">
            Use focused sessions to build a consistent study routine.
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white border border-slate-200 rounded-2xl p-7 mt-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-5">
          How Pomodoro Works
        </h2>

        <div className="grid md:grid-cols-4 gap-4">
          {[
            ["01", "Choose Focus", "Start a 25-minute study session."],
            ["02", "Stay Focused", "Avoid distractions during the timer."],
            ["03", "Take a Break", "Relax for 5 minutes after focus."],
            ["04", "Repeat", "Continue the cycle to study effectively."],
          ].map(([number, title, description]) => (
            <div
              key={number}
              className="p-4 rounded-xl bg-slate-50"
            >
              <span className="text-xs font-bold text-blue-600">
                {number}
              </span>

              <h3 className="font-semibold text-slate-900 mt-2">
                {title}
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Pomodoro