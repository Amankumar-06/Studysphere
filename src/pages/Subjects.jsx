import { useEffect, useState } from "react"

function Subjects() {
  const [subjects, setSubjects] = useState([])
  const [name, setName] = useState("")
  const [progress, setProgress] = useState(0)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem("token")

  const fetchSubjects = async () => {
    try {
      setLoading(true)

      const res = await fetch("http://localhost:5000/api/subjects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()
      setSubjects(data.subjects || [])
    } catch (error) {
      console.error("Error fetching subjects:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim()) {
      alert("Please enter subject name")
      return
    }

    try {
      const url = editingId
        ? `http://localhost:5000/api/subjects/${editingId}`
        : "http://localhost:5000/api/subjects"

      const method = editingId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          progress: Number(progress),
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to save subject")
      }

      setName("")
      setProgress(0)
      setEditingId(null)

      fetchSubjects()
    } catch (error) {
      console.error(error)
      alert("Something went wrong")
    }
  }

  const handleEdit = (subject) => {
    setName(subject.name)
    setProgress(subject.progress)
    setEditingId(subject._id)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this subject?"
    )

    if (!confirmDelete) return

    try {
      const res = await fetch(
        `http://localhost:5000/api/subjects/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) {
        throw new Error("Delete failed")
      }

      fetchSubjects()
    } catch (error) {
      console.error(error)
      alert("Unable to delete subject")
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setName("")
    setProgress(0)
  }

  const getProgressColor = (value) => {
    if (value >= 80) return "bg-emerald-500"
    if (value >= 50) return "bg-blue-500"
    if (value >= 30) return "bg-amber-500"
    return "bg-rose-500"
  }

  const getProgressText = (value) => {
    if (value >= 80) return "Excellent"
    if (value >= 50) return "Good Progress"
    if (value >= 30) return "Keep Going"
    return "Needs Attention"
  }

  const averageProgress =
    subjects.length > 0
      ? Math.round(
          subjects.reduce(
            (total, subject) => total + Number(subject.progress || 0),
            0
          ) / subjects.length
        )
      : 0

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-3">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
            STUDY MANAGEMENT
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            My Subjects
          </h1>

          <p className="text-slate-500 mt-2">
            Manage your subjects and track your learning progress.
          </p>
        </div>

        <div className="flex gap-3">

          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">
            <p className="text-xs text-slate-400 font-semibold uppercase">
              Subjects
            </p>

            <p className="text-2xl font-bold text-slate-800 mt-0.5">
              {subjects.length}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">
            <p className="text-xs text-slate-400 font-semibold uppercase">
              Average
            </p>

            <p className="text-2xl font-bold text-blue-600 mt-0.5">
              {averageProgress}%
            </p>
          </div>

        </div>
      </div>

      {/* ADD / EDIT FORM */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/10 flex items-center justify-center text-2xl">
              {editingId ? "✏️" : "➕"}
            </div>

            <div>
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Subject" : "Add New Subject"}
              </h2>

              <p className="text-blue-100 text-sm mt-1">
                {editingId
                  ? "Update your subject information"
                  : "Add a subject to your study list"}
              </p>
            </div>

          </div>

        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5"
        >

          {/* NAME */}
          <div className="md:col-span-2">

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Subject Name
            </label>

            <div className="relative">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                📚
              </span>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Data Structures"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder:text-slate-400"
              />

            </div>

          </div>

          {/* PROGRESS */}
          <div>

            <label className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
              <span>Progress</span>
              <span className="text-blue-600">{progress}%</span>
            </label>

            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              className="w-full mt-2 accent-blue-600 cursor-pointer"
            />

            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>

          </div>

          {/* BUTTONS */}
          <div className="md:col-span-3 flex flex-wrap gap-3 pt-1">

            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
              {editingId ? "Update Subject" : "Add Subject"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
              >
                Cancel
              </button>
            )}

          </div>

        </form>
      </div>

      {/* LOADING */}
      {loading ? (

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-14 text-center">

          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-slate-500 font-medium">
            Loading subjects...
          </p>

        </div>

      ) : subjects.length === 0 ? (

        /* EMPTY STATE */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center">

          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5">
            📚
          </div>

          <h2 className="text-xl font-bold text-slate-800">
            No subjects yet
          </h2>

          <p className="text-slate-500 mt-2 max-w-md mx-auto">
            Add your first subject above to start tracking your academic
            progress.
          </p>

        </div>

      ) : (

        /* SUBJECT CARDS */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {subjects.map((subject) => {

            const subjectProgress = Number(subject.progress || 0)

            return (
              <div
                key={subject._id}
                className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >

                {/* CARD HEADER */}
                <div className="flex items-start justify-between gap-3 mb-6">

                  <div className="flex items-center gap-3 min-w-0">

                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                      📘
                    </div>

                    <div className="min-w-0">

                      <h2 className="font-bold text-slate-800 text-lg truncate">
                        {subject.name}
                      </h2>

                      <p className="text-xs text-slate-400 mt-1">
                        Study Subject
                      </p>

                    </div>

                  </div>

                  <div className="flex gap-1 shrink-0">

                    <button
                      onClick={() => handleEdit(subject)}
                      className="w-9 h-9 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
                      title="Edit"
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() => handleDelete(subject._id)}
                      className="w-9 h-9 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 transition"
                      title="Delete"
                    >
                      🗑️
                    </button>

                  </div>

                </div>

                {/* PROGRESS */}
                <div>

                  <div className="flex justify-between items-center mb-2">

                    <span className="text-sm font-medium text-slate-500">
                      Learning Progress
                    </span>

                    <span className="text-lg font-extrabold text-blue-600">
                      {subjectProgress}%
                    </span>

                  </div>

                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">

                    <div
                      className={`h-full rounded-full transition-all duration-700 ${getProgressColor(
                        subjectProgress
                      )}`}
                      style={{
                        width: `${subjectProgress}%`,
                      }}
                    />

                  </div>

                </div>

                {/* STATUS */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">

                  <div className="flex items-center gap-2">

                    <span
                      className={`w-2 h-2 rounded-full ${
                        subjectProgress >= 80
                          ? "bg-emerald-500"
                          : subjectProgress >= 50
                          ? "bg-blue-500"
                          : subjectProgress >= 30
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                    />

                    <span className="text-sm text-slate-500">
                      Status
                    </span>

                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                      subjectProgress >= 80
                        ? "bg-emerald-100 text-emerald-700"
                        : subjectProgress >= 50
                        ? "bg-blue-100 text-blue-700"
                        : subjectProgress >= 30
                        ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {getProgressText(subjectProgress)}
                  </span>

                </div>

              </div>
            )
          })}

        </div>
      )}

    </div>
  )
}

export default Subjects