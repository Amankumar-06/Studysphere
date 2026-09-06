import { useEffect, useState } from "react"

function Notes() {
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [important, setImportant] = useState(false)
  const [search, setSearch] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem("token")

  const fetchNotes = async () => {
    try {
      setLoading(true)

      const res = await fetch("http://localhost:5000/api/notes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()
      setNotes(data.notes || [])
    } catch (error) {
      console.error("Error fetching notes:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const resetForm = () => {
    setTitle("")
    setSubject("")
    setContent("")
    setImportant(false)
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim() || !subject.trim() || !content.trim()) {
      alert("Please fill all fields")
      return
    }

    try {
      const url = editingId
        ? `http://localhost:5000/api/notes/${editingId}`
        : "http://localhost:5000/api/notes"

      const method = editingId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          subject,
          content,
          important,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to save note")
      }

      resetForm()
      fetchNotes()
    } catch (error) {
      console.error(error)
      alert("Something went wrong")
    }
  }

  const handleEdit = (note) => {
    setTitle(note.title)
    setSubject(note.subject)
    setContent(note.content)
    setImportant(note.important)
    setEditingId(note._id)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this note?"
    )

    if (!confirmDelete) return

    try {
      const res = await fetch(
        `http://localhost:5000/api/notes/${id}`,
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

      fetchNotes()
    } catch (error) {
      console.error(error)
      alert("Unable to delete note")
    }
  }

  const toggleImportant = async (note) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/notes/${note._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: note.title,
            subject: note.subject,
            content: note.content,
            important: !note.important,
          }),
        }
      )

      if (!res.ok) {
        throw new Error("Update failed")
      }

      fetchNotes()
    } catch (error) {
      console.error(error)
      alert("Unable to update note")
    }
  }

  const filteredNotes = notes.filter((note) => {
    const searchText = search.toLowerCase()

    return (
      note.title.toLowerCase().includes(searchText) ||
      note.subject.toLowerCase().includes(searchText) ||
      note.content.toLowerCase().includes(searchText)
    )
  })

  const importantCount = notes.filter(
    (note) => note.important
  ).length

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-3">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
            KNOWLEDGE MANAGEMENT
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            My Notes
          </h1>

          <p className="text-slate-500 mt-2">
            Create, organize and manage your study notes.
          </p>
        </div>

        <div className="flex gap-3">

          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">
            <p className="text-xs text-slate-400 font-semibold uppercase">
              Notes
            </p>

            <p className="text-2xl font-bold text-slate-800 mt-0.5">
              {notes.length}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">
            <p className="text-xs text-slate-400 font-semibold uppercase">
              Important
            </p>

            <p className="text-2xl font-bold text-amber-500 mt-0.5">
              {importantCount}
            </p>
          </div>

        </div>

      </div>

      {/* ADD / EDIT NOTE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/10 flex items-center justify-center text-2xl">
              {editingId ? "✏️" : "📝"}
            </div>

            <div>
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Note" : "Create New Note"}
              </h2>

              <p className="text-blue-100 text-sm mt-1">
                {editingId
                  ? "Update your study note"
                  : "Save important information for later"}
              </p>
            </div>

          </div>

        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5"
        >

          {/* TITLE + SUBJECT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Note Title
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                  📝
                </span>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. DBMS Important Questions"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Subject
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                  📚
                </span>

                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. DBMS"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder:text-slate-400"
                />
              </div>
            </div>

          </div>

          {/* CONTENT */}
          <div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Note Content
            </label>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your study notes here..."
              rows="7"
              className="w-full border border-slate-200 rounded-xl px-4 py-3.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none placeholder:text-slate-400 leading-6"
            />

            <p className="text-xs text-slate-400 mt-2">
              Tip: Keep your notes clear and concise for better revision.
            </p>

          </div>

          {/* IMPORTANT */}
          <label
            className={`flex items-center gap-3 cursor-pointer w-fit px-4 py-3 rounded-xl border transition ${
              important
                ? "bg-amber-50 border-amber-200"
                : "bg-slate-50 border-slate-200 hover:bg-slate-100"
            }`}
          >

            <input
              type="checkbox"
              checked={important}
              onChange={(e) => setImportant(e.target.checked)}
              className="w-5 h-5 accent-amber-500"
            />

            <span
              className={`text-sm font-semibold ${
                important
                  ? "text-amber-700"
                  : "text-slate-600"
              }`}
            >
              ⭐ Mark as important
            </span>

          </label>

          {/* BUTTONS */}
          <div className="flex flex-wrap gap-3 pt-1">

            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
              {editingId ? "Update Note" : "Save Note"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
              >
                Cancel
              </button>
            )}

          </div>

        </form>

      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">

        <div className="flex items-center gap-3 mb-3">
          <span className="text-lg">🔎</span>

          <div>
            <p className="font-bold text-slate-700">
              Search Notes
            </p>

            <p className="text-xs text-slate-400">
              Search by title, subject or content
            </p>
          </div>
        </div>

        <div className="relative">

          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            🔍
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your notes..."
            className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder:text-slate-400"
          />

        </div>

      </div>

      {/* RESULTS INFO */}
      {!loading && notes.length > 0 && (
        <div className="flex items-center justify-between px-1">

          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-bold text-slate-700">
              {filteredNotes.length}
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-700">
              {notes.length}
            </span>{" "}
            notes
          </p>

          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
            >
              Clear Search
            </button>
          )}

        </div>
      )}

      {/* NOTES */}
      {loading ? (

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-14 text-center">

          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-slate-500 font-medium">
            Loading notes...
          </p>

        </div>

      ) : filteredNotes.length === 0 ? (

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center">

          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5">
            {search ? "🔍" : "📝"}
          </div>

          <h2 className="text-xl font-bold text-slate-800">
            {search ? "No notes found" : "No notes yet"}
          </h2>

          <p className="text-slate-500 mt-2 max-w-md mx-auto">
            {search
              ? "Try searching with a different keyword."
              : "Create your first study note above."}
          </p>

          {search && (
            <button
              onClick={() => setSearch("")}
              className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition"
            >
              Clear Search
            </button>
          )}

        </div>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {filteredNotes.map((note) => (

            <div
              key={note._id}
              className={`group bg-white rounded-3xl p-6 border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
                note.important
                  ? "border-amber-200"
                  : "border-slate-200"
              }`}
            >

              {/* CARD HEADER */}
              <div className="flex items-start justify-between gap-3 mb-5">

                <div className="flex items-center gap-3 min-w-0">

                  <div
                    className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center text-2xl ${
                      note.important
                        ? "bg-gradient-to-br from-amber-50 to-yellow-100"
                        : "bg-gradient-to-br from-blue-50 to-indigo-100"
                    }`}
                  >
                    📝
                  </div>

                  <div className="min-w-0">

                    <h2 className="font-bold text-slate-800 text-lg truncate">
                      {note.title}
                    </h2>

                    <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-semibold mt-1">
                      📚 {note.subject}
                    </span>

                  </div>

                </div>

                <button
                  onClick={() => toggleImportant(note)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                    note.important
                      ? "bg-amber-100 text-amber-500"
                      : "bg-slate-100 text-slate-300 hover:bg-amber-50 hover:text-amber-500"
                  }`}
                  title="Mark important"
                >
                  ⭐
                </button>

              </div>

              {/* CONTENT */}
              <div className="mb-5 min-h-[135px]">

                <p className="text-slate-600 text-sm leading-6 whitespace-pre-line line-clamp-6">
                  {note.content}
                </p>

              </div>

              {/* FOOTER */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between gap-3">

                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                    note.important
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {note.important
                    ? "⭐ Important"
                    : "Regular Note"}
                </span>

                <div className="flex gap-2">

                  <button
                    onClick={() => handleEdit(note)}
                    className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                    title="Edit"
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() => handleDelete(note._id)}
                    className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition"
                    title="Delete"
                  >
                    🗑️
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  )
}

export default Notes