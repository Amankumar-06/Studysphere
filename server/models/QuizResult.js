const mongoose = require("mongoose")

const quizQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },

    options: {
      type: [String],
      required: true,
    },

    correctAnswer: {
      type: String,
      required: true,
    },

    selectedAnswer: {
      type: String,
      default: "",
    },

    isCorrect: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
)

const quizResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    topic: {
      type: String,
      required: true,
    },

    score: {
      type: Number,
      required: true,
    },

    totalQuestions: {
      type: Number,
      required: true,
    },

    questions: {
      type: [quizQuestionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

const QuizResult = mongoose.model("QuizResult", quizResultSchema)

module.exports = QuizResult