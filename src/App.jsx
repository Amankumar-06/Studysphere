import Notifications from "./pages/Notifications"
import QuizResult from "./pages/QuizResult"
import QuizHistory from "./pages/QuizHistory"
import StudentDetails from "./pages/StudentDetails"
import Admin from "./pages/Admin"
import ProtectedRoute from "./components/ProtectedRoute"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import Sidebar from "./components/Sidebar"
import Pomodoro from "./pages/Pomodoro"

import Dashboard from "./pages/Dashboard"
import Subjects from "./pages/Subjects"
import Planner from "./pages/Planner"
import Notes from "./pages/Notes"
import Quiz from "./pages/Quiz"
import Progress from "./pages/Progress"
import AIQuiz from "./pages/AIQuiz"

import Login from "./pages/Login"
import Register from "./pages/Register"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Authentication Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Application */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-slate-100 flex">
                <Sidebar />

                <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 min-w-0">
                  <Routes>
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute adminOnly={true}>
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/student/:id"
                      element={
                        <ProtectedRoute adminOnly={true}>
                          <StudentDetails />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/quiz-result/:id"
                      element={<QuizResult />}
                    />
                    <Route
                      path="/notifications"
                      element={<Notifications />}
                    />
                    <Route path="/quiz-history" element={<QuizHistory />} />
                    <Route path="/pomodoro" element={<Pomodoro />} />
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/subjects" element={<Subjects />} />
                    <Route path="/planner" element={<Planner />} />
                    <Route path="/notes" element={<Notes />} />
                    <Route path="/quiz" element={<Quiz />} />
                    <Route path="/progress" element={<Progress />} />
                    <Route path="/ai-quiz" element={<AIQuiz />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App