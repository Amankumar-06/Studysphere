const QuizResult = require("./models/QuizResult")
const Note = require("./models/Note")
const Task = require("./models/Task")
const User = require("./models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { GoogleGenAI } = require("@google/genai")
const express = require("express")
const cors = require("cors")
const Subject = require("./models/Subject")

require("dotenv").config({ path: __dirname + "/.env" })

const connectDB = require("./config/db")

console.log("MONGO_URI loaded:", !!process.env.MONGO_URI)

const app = express()

app.use(cors())
app.use(express.json())

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

// ===============================
// BASIC ROUTE
// ===============================

app.get("/", (req, res) => {
  res.json({
    message: "StudySphere Backend is running 🚀",
  })
})

// ===============================
// REGISTER
// ===============================

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "All fields are required",
      })
    }

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists",
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    })

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Register Error:", error)

    res.status(500).json({
      error: "Registration failed",
    })
  }
})

// ===============================
// LOGIN
// ===============================

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      })
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    )

    if (!isPasswordCorrect) {
      return res.status(401).json({
        error: "Invalid email or password",
      })
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    )

    res.json({
      message: "Log in successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login Error:", error)

    res.status(500).json({
      error: "Login failed",
    })
  }
})

// ===============================
// AUTH MIDDLEWARE
// ===============================

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "No token provided",
      })
    }

    const token = authHeader.split(" ")[1]

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    )

    const user = await User.findById(decoded.id).select("-password")

    if (!user) {
      return res.status(401).json({
        error: "User not found",
      })
    }

    req.user = user

    next()
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired token",
    })
  }
}

// ===============================
// ADMIN MIDDLEWARE
// ===============================

const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      error: "Admin access required",
    })
  }

  next()
}

// =====================================================
// SUBJECTS
// =====================================================

// GET ALL SUBJECTS

app.get(
  "/api/subjects",
  authMiddleware,
  async (req, res) => {
    try {
      const subjects = await Subject.find({
        user: req.user._id,
      }).sort({ createdAt: -1 })

      res.json({
        subjects,
      })
    } catch (error) {
      console.error("Get Subjects Error:", error)

      res.status(500).json({
        error: "Failed to fetch subjects",
      })
    }
  }
)

// CREATE SUBJECT

app.post(
  "/api/subjects",
  authMiddleware,
  async (req, res) => {
    try {
      const { name, progress } = req.body

      if (!name) {
        return res.status(400).json({
          error: "Subject name is required",
        })
      }

      const subject = await Subject.create({
        name,
        progress: progress || 0,
        user: req.user._id,
      })

      res.status(201).json({
        message: "Subject created successfully",
        subject,
      })
    } catch (error) {
      console.error("Subject Error:", error)

      res.status(500).json({
        error: "Failed to create subject",
      })
    }
  }
)

// DELETE SUBJECT

app.delete(
  "/api/subjects/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const subject = await Subject.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
      })

      if (!subject) {
        return res.status(404).json({
          error: "Subject not found",
        })
      }

      res.json({
        message: "Subject deleted successfully",
      })
    } catch (error) {
      console.error("Delete Subject Error:", error)

      res.status(500).json({
        error: "Failed to delete subject",
      })
    }
  }
)

// UPDATE SUBJECT PROGRESS

app.put(
  "/api/subjects/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const { progress } = req.body

      if (progress === undefined) {
        return res.status(400).json({
          error: "Progress is required",
        })
      }

      const subject = await Subject.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user._id,
        },
        {
          $set: {
            progress,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      )

      if (!subject) {
        return res.status(404).json({
          error: "Subject not found",
        })
      }

      res.json({
        message: "Progress updated successfully",
        subject,
      })
    } catch (error) {
      console.error("Update Progress Error:", error)

      res.status(500).json({
        error: "Failed to update progress",
      })
    }
  }
)

// =====================================================
// TASKS
// =====================================================

// GET ALL TASKS

app.get(
  "/api/tasks",
  authMiddleware,
  async (req, res) => {
    try {
      const tasks = await Task.find({
        user: req.user._id,
      }).sort({
        date: 1,
        createdAt: -1,
      })

      res.json({
        tasks,
      })
    } catch (error) {
      console.error("Get Tasks Error:", error)

      res.status(500).json({
        error: "Failed to fetch tasks",
      })
    }
  }
)

// CREATE TASK

app.post(
  "/api/tasks",
  authMiddleware,
  async (req, res) => {
    try {
      const { title, subject, date } = req.body

      if (!title || !subject || !date) {
        return res.status(400).json({
          error: "Title, subject and date are required",
        })
      }

      const task = await Task.create({
        title,
        subject,
        date,
        user: req.user._id,
      })

      res.status(201).json({
        message: "Task created successfully",
        task,
      })
    } catch (error) {
      console.error("Create Task Error:", error)

      res.status(500).json({
        error: "Failed to create task",
      })
    }
  }
)

// UPDATE TASK

app.put(
  "/api/tasks/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const { completed } = req.body

      const task = await Task.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user._id,
        },
        {
          completed,
        },
        {
          new: true,
        }
      )

      if (!task) {
        return res.status(404).json({
          error: "Task not found",
        })
      }

      res.json({
        message: "Task updated successfully",
        task,
      })
    } catch (error) {
      console.error("Update Task Error:", error)

      res.status(500).json({
        error: "Failed to update task",
      })
    }
  }
)

// DELETE TASK

app.delete(
  "/api/tasks/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const task = await Task.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
      })

      if (!task) {
        return res.status(404).json({
          error: "Task not found",
        })
      }

      res.json({
        message: "Task deleted successfully",
      })
    } catch (error) {
      console.error("Delete Task Error:", error)

      res.status(500).json({
        error: "Failed to delete task",
      })
    }
  }
)

// =====================================================
// NOTES
// =====================================================

// GET ALL NOTES

app.get(
  "/api/notes",
  authMiddleware,
  async (req, res) => {
    try {
      const notes = await Note.find({
        user: req.user._id,
      }).sort({
        createdAt: -1,
      })

      res.json({
        notes,
      })
    } catch (error) {
      console.error("Get Notes Error:", error)

      res.status(500).json({
        error: "Failed to fetch notes",
      })
    }
  }
)

// CREATE NOTE

app.post(
  "/api/notes",
  authMiddleware,
  async (req, res) => {
    try {
      const { title, subject, content } = req.body

      if (!title || !subject || !content) {
        return res.status(400).json({
          error: "Title, subject and content are required",
        })
      }

      const note = await Note.create({
        title,
        subject,
        content,
        user: req.user._id,
      })

      res.status(201).json({
        message: "Note created successfully",
        note,
      })
    } catch (error) {
      console.error("Create Note Error:", error)

      res.status(500).json({
        error: "Failed to create note",
      })
    }
  }
)

// UPDATE NOTE

app.put(
  "/api/notes/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const { important } = req.body

      const note = await Note.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user._id,
        },
        {
          important,
        },
        {
          new: true,
        }
      )

      if (!note) {
        return res.status(404).json({
          error: "Note not found",
        })
      }

      res.json({
        message: "Note updated successfully",
        note,
      })
    } catch (error) {
      console.error("Update Note Error:", error)

      res.status(500).json({
        error: "Failed to update note",
      })
    }
  }
)

// DELETE NOTE

app.delete(
  "/api/notes/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const note = await Note.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
      })

      if (!note) {
        return res.status(404).json({
          error: "Note not found",
        })
      }

      res.json({
        message: "Note deleted successfully",
      })
    } catch (error) {
      console.error("Delete Note Error:", error)

      res.status(500).json({
        error: "Failed to delete note",
      })
    }
  }
)

// =====================================================
// QUIZ RESULTS
// =====================================================

// SAVE QUIZ RESULT

app.post(
  "/api/quiz-results",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        topic,
        score,
        totalQuestions,
        questions,
      } = req.body

      if (
        !topic ||
        score === undefined ||
        !totalQuestions
      ) {
        return res.status(400).json({
          error:
            "Topic, score and total questions are required",
        })
      }

      const quizResult = await QuizResult.create({
        topic,
        score,
        totalQuestions,
        questions: questions || [],
        user: req.user._id,
      })

      res.status(201).json({
        message: "Quiz result saved successfully",
        quizResult,
      })
    } catch (error) {
      console.error("Save Quiz Result Error:", error)

      res.status(500).json({
        error: "Failed to save quiz result",
      })
    }
  }
)

// GET USER QUIZ RESULTS

app.get(
  "/api/quiz-results",
  authMiddleware,
  async (req, res) => {
    try {
      const results = await QuizResult.find({
        user: req.user._id,
      }).sort({
        createdAt: -1,
      })

      res.json({
        results,
      })
    } catch (error) {
      console.error("Get Quiz Results Error:", error)

      res.status(500).json({
        error: "Failed to fetch quiz results",
      })
    }
  }
)

// =====================================================
// WEAK TOPICS
// =====================================================

app.get(
  "/api/weak-topics",
  authMiddleware,
  async (req, res) => {
    try {
      const results = await QuizResult.find({
        user: req.user._id,
      }).sort({
        createdAt: -1,
      })

      if (!results.length) {
        return res.json({
          weakTopics: [],
          strongTopics: [],
          totalAttempts: 0,
        })
      }

      const topicStats = {}

      results.forEach((quiz) => {
        const topic = quiz.topic.replace(
          "AI Quiz - ",
          ""
        )

        if (!topicStats[topic]) {
          topicStats[topic] = {
            topic,
            score: 0,
            total: 0,
            attempts: 0,
          }
        }

        topicStats[topic].score += quiz.score
        topicStats[topic].total += quiz.totalQuestions
        topicStats[topic].attempts += 1
      })

      const analysis = Object.values(topicStats).map(
        (item) => ({
          ...item,
          accuracy:
            item.total > 0
              ? Math.round(
                  (item.score / item.total) * 100
                )
              : 0,
        })
      )

      const weakTopics = analysis
        .filter((item) => item.accuracy < 60)
        .sort(
          (a, b) => a.accuracy - b.accuracy
        )

      const strongTopics = analysis
        .filter((item) => item.accuracy >= 80)
        .sort(
          (a, b) => b.accuracy - a.accuracy
        )

      res.json({
        weakTopics,
        strongTopics,
        totalAttempts: results.length,
      })
    } catch (error) {
      console.error(
        "Weak Topic Analysis Error:",
        error
      )

      res.status(500).json({
        error: "Failed to analyze weak topics",
      })
    }
  }
)

// =====================================================
// SINGLE QUIZ RESULT
// =====================================================

app.get(
  "/api/quiz-results/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const result = await QuizResult.findOne({
        _id: req.params.id,
        user: req.user._id,
      })

      if (!result) {
        return res.status(404).json({
          error: "Quiz result not found",
        })
      }

      res.json(result)
    } catch (error) {
      console.error(
        "Quiz Result Details Error:",
        error
      )

      res.status(500).json({
        error: "Failed to fetch quiz result",
      })
    }
  }
)

// =====================================================
// AI QUIZ GENERATOR
// =====================================================

app.post(
  "/api/generate-quiz",
  authMiddleware,
  async (req, res) => {
    console.log(
      "Quiz request received:",
      req.body
    )

    console.log(
      "API key loaded:",
      !!process.env.GEMINI_API_KEY
    )

    try {
      const { topic, difficulty } = req.body

      if (!topic) {
        return res.status(400).json({
          error: "Topic is required",
        })
      }

      const prompt = `
Generate exactly 5 multiple-choice questions for a student.

Topic: ${topic}
Difficulty: ${difficulty || "Medium"}

Each question must have exactly 4 options.

Return ONLY valid JSON.
Do not use markdown.
Do not use code blocks.
Do not add any explanation.

Use this exact format:

{
  "questions": [
    {
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": "Correct option"
    }
  ]
}

IMPORTANT RULES:

1. "answer" MUST exactly match one of the four options.
2. There must be exactly 4 options.
3. There must be exactly 5 questions.
4. Every question must have only one correct answer.
5. Do not add any extra fields.
6. Return valid JSON only.
`

      let response

      // Retry Gemini request up to 3 times
      for (
        let attempt = 1;
        attempt <= 3;
        attempt++
      ) {
        try {
          response =
            await ai.models.generateContent({
              model: "gemini-3.6-flash",
              contents: prompt,
            })

          break
        } catch (error) {
          console.log(
            `Gemini attempt ${attempt} failed`
          )

          if (attempt === 3) {
            throw error
          }

          const delay = attempt * 5000

          console.log(
            `Retrying in ${delay / 1000} seconds...`
          )

          await new Promise((resolve) =>
            setTimeout(resolve, delay)
          )
        }
      }

      const text = response.text

      const cleanText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim()

      const quiz = JSON.parse(cleanText)

      if (
        !quiz.questions ||
        !Array.isArray(quiz.questions) ||
        quiz.questions.length !== 5
      ) {
        return res.status(500).json({
          error:
            "Invalid quiz format received from AI",
        })
      }

      for (const q of quiz.questions) {
        if (
          !q.question ||
          !Array.isArray(q.options) ||
          q.options.length !== 4 ||
          !q.answer ||
          !q.options.includes(q.answer)
        ) {
          return res.status(500).json({
            error:
              "AI returned an invalid question format",
          })
        }
      }

      console.log(
        "AI Quiz generated successfully ✅"
      )

      res.json(quiz)
    } catch (error) {
      console.error("AI Error:", error)

      res.status(500).json({
        error: "Failed to generate quiz",
        details: error.message,
      })
    }
  }
)

// =====================================================
// ADMIN APIs
// =====================================================

// GET ALL USERS

app.get(
  "/api/admin/users",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 })

      res.json(users)
    } catch (error) {
      console.error(
        "Get Admin Users Error:",
        error
      )

      res.status(500).json({
        error: "Failed to fetch users",
      })
    }
  }
)

// ADMIN STATISTICS

app.get(
  "/api/admin/stats",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const totalUsers =
        await User.countDocuments()

      const totalSubjects =
        await Subject.countDocuments()

      const totalTasks =
        await Task.countDocuments()

      const totalNotes =
        await Note.countDocuments()

      const totalQuizAttempts =
        await QuizResult.countDocuments()

      const completedTasks =
        await Task.countDocuments({
          completed: true,
        })

      res.json({
        totalUsers,
        totalSubjects,
        totalTasks,
        totalNotes,
        totalQuizAttempts,
        completedTasks,
      })
    } catch (error) {
      console.error(
        "Admin Stats Error:",
        error
      )

      res.status(500).json({
        error:
          "Failed to fetch admin statistics",
      })
    }
  }
)

// CHANGE USER ROLE

app.put(
  "/api/admin/users/:id/role",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      // Prevent admin from changing own role
      if (
        req.params.id ===
        req.user._id.toString()
      ) {
        return res.status(400).json({
          error:
            "You cannot change your own role",
        })
      }

      const { role } = req.body

      if (!["student", "admin"].includes(role)) {
        return res.status(400).json({
          error: "Invalid role",
        })
      }

      const user =
        await User.findByIdAndUpdate(
          req.params.id,
          { role },
          {
            new: true,
            runValidators: true,
          }
        ).select("-password")

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        })
      }

      res.json({
        message:
          "User role updated successfully",
        user,
      })
    } catch (error) {
      console.error(
        "Role Update Error:",
        error
      )

      res.status(500).json({
        error:
          "Failed to update user role",
      })
    }
  }
)

// DELETE USER

app.delete(
  "/api/admin/users/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const userId = req.params.id

      // Prevent admin from deleting own account
      if (
        userId === req.user._id.toString()
      ) {
        return res.status(400).json({
          error:
            "You cannot delete your own account",
        })
      }

      await Subject.deleteMany({
        user: userId,
      })

      await Task.deleteMany({
        user: userId,
      })

      await Note.deleteMany({
        user: userId,
      })

      await QuizResult.deleteMany({
        user: userId,
      })

      const deletedUser =
        await User.findByIdAndDelete(userId)

      if (!deletedUser) {
        return res.status(404).json({
          error: "User not found",
        })
      }

      res.json({
        message:
          "User deleted successfully",
      })
    } catch (error) {
      console.error(
        "Delete User Error:",
        error
      )

      res.status(500).json({
        error:
          "Failed to delete user",
      })
    }
  }
)

// =====================================================
// GET SINGLE USER DETAILS
// =====================================================

app.get(
  "/api/admin/users/:id/details",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const userId = req.params.id

      const user =
        await User.findById(userId).select(
          "-password"
        )

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        })
      }

      const subjects =
        await Subject.find({
          user: userId,
        }).sort({
          createdAt: -1,
        })

      const tasks =
        await Task.find({
          user: userId,
        }).sort({
          createdAt: -1,
        })

      const notes =
        await Note.find({
          user: userId,
        }).sort({
          createdAt: -1,
        })

      const quizResults =
        await QuizResult.find({
          user: userId,
        }).sort({
          createdAt: -1,
        })

      res.json({
        user,
        subjects,
        tasks,
        notes,
        quizResults,
      })
    } catch (error) {
      console.error(
        "User Details Error:",
        error
      )

      res.status(500).json({
        error:
          "Failed to fetch user details",
      })
    }
  }
)

// =====================================================
// ADMIN STUDENT ACTIVITY
// =====================================================

app.get(
  "/api/admin/student-activity",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const users =
        await User.find()
          .select("-password")
          .sort({ createdAt: -1 })

      const activity =
        await Promise.all(
          users.map(async (user) => {
            const subjects =
              await Subject.countDocuments({
                user: user._id,
              })

            const totalTasks =
              await Task.countDocuments({
                user: user._id,
              })

            const completedTasks =
              await Task.countDocuments({
                user: user._id,
                completed: true,
              })

            const notes =
              await Note.countDocuments({
                user: user._id,
              })

            const quizAttempts =
              await QuizResult.countDocuments({
                user: user._id,
              })

            return {
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              subjects,
              totalTasks,
              completedTasks,
              notes,
              quizAttempts,
            }
          })
        )

      res.json(activity)
    } catch (error) {
      console.error(
        "Student Activity Error:",
        error
      )

      res.status(500).json({
        error:
          "Failed to fetch student activity",
      })
    }
  }
)

// =====================================================
// START SERVER
// =====================================================

const PORT = 5000

connectDB()

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  )
})