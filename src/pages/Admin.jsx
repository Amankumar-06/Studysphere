import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

function Admin() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const currentUser = JSON.parse(localStorage.getItem("user") || "null")

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSubjects: 0,
    totalTasks: 0,
    totalNotes: 0,
    totalQuizAttempts: 0,
    completedTasks: 0,
  })

  const [users, setUsers] = useState([])
  const [activity, setActivity] = useState([])

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [updatingRole, setUpdatingRole] = useState(null)

  // ===============================
  // FETCH ADMIN DATA
  // ===============================

  const fetchAdminData = async () => {
    try {
      setLoading(true)

      const headers = {
        Authorization: `Bearer ${token}`,
      }

      const [statsResponse, usersResponse, activityResponse] =
        await Promise.all([
          fetch("http://localhost:5000/api/admin/stats", { headers }),
          fetch("http://localhost:5000/api/admin/users", { headers }),
          fetch("http://localhost:5000/api/admin/student-activity", {
            headers,
          }),
        ])

      const statsData = await statsResponse.json()
      const usersData = await usersResponse.json()
      const activityData = await activityResponse.json()

      if (!statsResponse.ok) {
        throw new Error(
          statsData.error || "Failed to fetch statistics"
        )
      }

      if (!usersResponse.ok) {
        throw new Error(
          usersData.error || "Failed to fetch users"
        )
      }

      if (!activityResponse.ok) {
        throw new Error(
          activityData.error ||
            "Failed to fetch student activity"
        )
      }

      setStats(statsData)
      setUsers(usersData)
      setActivity(activityData)
    } catch (error) {
      console.error("Admin Data Error:", error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdminData()
  }, [])

  // ===============================
  // UPDATE ROLE
  // ===============================

  const updateRole = async (userId, newRole) => {
    if (userId === currentUser?._id) {
      alert("You cannot change your own admin role.")
      return
    }

    try {
      setUpdatingRole(userId)

      const response = await fetch(
        `http://localhost:5000/api/admin/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role: newRole,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update role"
        )
      }

      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, role: data.user.role }
            : user
        )
      )

      setActivity((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, role: data.user.role }
            : user
        )
      )
    } catch (error) {
      console.error(error)
      alert(error.message)
    } finally {
      setUpdatingRole(null)
    }
  }

  // ===============================
  // DELETE USER
  // ===============================

  const deleteUser = async (userId, userName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${userName}?`
    )

    if (!confirmDelete) return

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Failed to delete user"
        )
      }

      setUsers((prev) =>
        prev.filter((user) => user._id !== userId)
      )

      setActivity((prev) =>
        prev.filter((user) => user._id !== userId)
      )

      setStats((prev) => ({
        ...prev,
        totalUsers: Math.max(prev.totalUsers - 1, 0),
      }))

      alert("User deleted successfully")
    } catch (error) {
      console.error(error)
      alert(error.message)
    }
  }

  // ===============================
  // SEARCH + FILTER
  // ===============================

  const filteredUsers = users.filter((user) => {
    const searchValue = search.toLowerCase()

    const matchesSearch =
      user.name?.toLowerCase().includes(searchValue) ||
      user.email?.toLowerCase().includes(searchValue)

    const matchesRole =
      roleFilter === "all" ||
      user.role === roleFilter

    return matchesSearch && matchesRole
  })

  // ===============================
  // ANALYTICS
  // ===============================

  const taskCompletion =
    stats.totalTasks > 0
      ? Math.round(
          (stats.completedTasks / stats.totalTasks) * 100
        )
      : 0

  const studentCount = users.filter(
    (user) => user.role === "student"
  ).length

  const adminCount = users.filter(
    (user) => user.role === "admin"
  ).length

  const chartData = [
    {
      name: "Users",
      value: stats.totalUsers,
    },
    {
      name: "Subjects",
      value: stats.totalSubjects,
    },
    {
      name: "Tasks",
      value: stats.totalTasks,
    },
    {
      name: "Notes",
      value: stats.totalNotes,
    },
    {
      name: "Quizzes",
      value: stats.totalQuizAttempts,
    },
  ]

  const studentActivityChart = activity
    .filter((user) => user.role === "student")
    .slice(0, 8)
    .map((user) => ({
      name:
        user.name?.length > 12
          ? user.name.slice(0, 12) + "..."
          : user.name,
      tasks: user.completedTasks,
      quizzes: user.quizAttempts,
      notes: user.notes,
    }))

  // ===============================
  // LOADING
  // ===============================

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto" />

          <p className="mt-5 font-semibold text-slate-700">
            Loading Admin Panel
          </p>

          <p className="text-sm text-slate-400 mt-1">
            Fetching StudySphere analytics...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-7">

      {/* ================= HEADER ================= */}

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-7 md:p-9 text-white shadow-xl">

        <div className="absolute -right-16 -top-16 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl" />

        <div className="absolute -bottom-20 right-32 w-52 h-52 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative">

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-blue-200 mb-4">
            <span>⚙️</span>
            Administration
          </div>

          <h1 className="text-3xl md:text-4xl font-bold">
            Admin Dashboard
          </h1>

          <p className="text-slate-300 mt-2 max-w-2xl">
            Manage students, monitor platform activity,
            and track StudySphere performance.
          </p>

        </div>
      </div>

      {/* ================= STATS ================= */}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">

        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="👥"
          color="blue"
        />

        <StatCard
          title="Subjects"
          value={stats.totalSubjects}
          icon="📚"
          color="purple"
        />

        <StatCard
          title="Tasks"
          value={stats.totalTasks}
          icon="📋"
          color="orange"
        />

        <StatCard
          title="Completed"
          value={stats.completedTasks}
          icon="✅"
          color="green"
        />

        <StatCard
          title="Notes"
          value={stats.totalNotes}
          icon="📝"
          color="pink"
        />

        <StatCard
          title="Quiz Attempts"
          value={stats.totalQuizAttempts}
          icon="🧠"
          color="indigo"
        />

      </div>

      {/* ================= USER SUMMARY ================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <SummaryCard
          title="Students"
          value={studentCount}
          description="Registered student accounts"
          icon="🎓"
        />

        <SummaryCard
          title="Administrators"
          value={adminCount}
          description="Users with admin access"
          icon="🛡️"
        />

        <SummaryCard
          title="Task Completion"
          value={`${taskCompletion}%`}
          description={`${stats.completedTasks} of ${stats.totalTasks} tasks completed`}
          icon="📈"
        />

      </div>

      {/* ================= PLATFORM ANALYTICS ================= */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

          <div className="flex items-start justify-between gap-4">

            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  📊
                </div>

                <h2 className="text-lg font-bold text-slate-800">
                  Platform Analytics
                </h2>
              </div>

              <p className="text-sm text-slate-500 mt-2">
                Overall activity across StudySphere
              </p>
            </div>

            <span className="px-3 py-1.5 rounded-full bg-green-50 text-green-600 text-xs font-semibold">
              Live Data
            </span>

          </div>

          <div className="h-72 mt-6">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -10,
                  bottom: 5,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />

                <Tooltip
                  cursor={{ fill: "rgba(59,130,246,0.05)" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow:
                      "0 10px 25px rgba(15,23,42,0.08)",
                  }}
                />

                <Bar
                  dataKey="value"
                  radius={[8, 8, 0, 0]}
                  barSize={38}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>

        </div>

        {/* TASK COMPLETION */}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

          <div className="flex items-center gap-2">

            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
              ✅
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Task Completion
              </h2>

              <p className="text-xs text-slate-500">
                Overall completion rate
              </p>
            </div>

          </div>

          <div className="flex justify-center py-7">

            <div
              className="w-40 h-40 rounded-full flex items-center justify-center"
              style={{
                background: `conic-gradient(#2563eb ${taskCompletion}%, #dbeafe ${taskCompletion}% 100%)`,
              }}
            >

              <div className="w-32 h-32 rounded-full bg-white flex flex-col items-center justify-center shadow-inner">

                <p className="text-3xl font-bold text-blue-600">
                  {taskCompletion}%
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Completed
                </p>

              </div>

            </div>

          </div>

          <div className="space-y-3">

            <div className="flex justify-between items-center p-3 rounded-xl bg-green-50">
              <span className="text-sm text-slate-600">
                Completed Tasks
              </span>

              <span className="font-bold text-green-600">
                {stats.completedTasks}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
              <span className="text-sm text-slate-600">
                Total Tasks
              </span>

              <span className="font-bold text-slate-700">
                {stats.totalTasks}
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* ================= STUDENT ACTIVITY ================= */}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

          <div>

            <div className="flex items-center gap-2">

              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                👨‍🎓
              </div>

              <h2 className="text-lg font-bold text-slate-800">
                Student Activity
              </h2>

            </div>

            <p className="text-sm text-slate-500 mt-2">
              Activity overview of registered students
            </p>

          </div>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-500">
            Top 8 Students
          </span>

        </div>

        {studentActivityChart.length === 0 ? (

          <div className="py-14 text-center">

            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl mx-auto">
              📊
            </div>

            <p className="font-semibold text-slate-700 mt-4">
              No student activity available
            </p>

            <p className="text-sm text-slate-400 mt-1">
              Student activity will appear here.
            </p>

          </div>

        ) : (

          <div className="h-80">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={studentActivityChart}
                margin={{
                  top: 10,
                  right: 10,
                  left: -10,
                  bottom: 5,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow:
                      "0 10px 25px rgba(15,23,42,0.08)",
                  }}
                />

                <Bar
                  dataKey="tasks"
                  name="Completed Tasks"
                  radius={[6, 6, 0, 0]}
                />

                <Bar
                  dataKey="quizzes"
                  name="Quiz Attempts"
                  radius={[6, 6, 0, 0]}
                />

                <Bar
                  dataKey="notes"
                  name="Notes"
                  radius={[6, 6, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        )}

      </div>

      {/* ================= STUDENT OVERVIEW ================= */}

      <div>

        <div className="flex items-end justify-between gap-4 mb-5">

          <div>

            <h2 className="text-xl font-bold text-slate-800">
              Student Overview
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Individual student activity and performance
            </p>

          </div>

          <span className="hidden sm:block text-sm text-slate-400">
            {activity.filter(
              (user) => user.role === "student"
            ).length}{" "}
            students
          </span>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {activity
            .filter((user) => user.role === "student")
            .slice(0, 6)
            .map((student) => (

              <div
                key={student._id}
                className="group bg-white rounded-3xl border border-slate-200 shadow-sm p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >

                <div className="flex items-center gap-3">

                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/20">
                    {student.name
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">

                    <h3 className="font-bold text-slate-800 truncate">
                      {student.name}
                    </h3>

                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {student.email}
                    </p>

                  </div>

                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm" />

                </div>

                <div className="grid grid-cols-2 gap-3 mt-5">

                  <MiniStat
                    label="Subjects"
                    value={student.subjects}
                    icon="📚"
                  />

                  <MiniStat
                    label="Tasks"
                    value={student.totalTasks}
                    icon="📋"
                  />

                  <MiniStat
                    label="Completed"
                    value={student.completedTasks}
                    icon="✅"
                  />

                  <MiniStat
                    label="Quizzes"
                    value={student.quizAttempts}
                    icon="🧠"
                  />

                </div>

                <button
                  onClick={() =>
                    navigate(
                      `/admin/student/${student._id}`
                    )
                  }
                  className="w-full mt-5 py-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition font-semibold text-sm"
                >
                  View Student Profile →
                </button>

              </div>

            ))}

        </div>

      </div>

      {/* ================= USER MANAGEMENT ================= */}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="p-6 border-b border-slate-200">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div>

              <div className="flex items-center gap-2">

                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  👥
                </div>

                <h2 className="text-xl font-bold text-slate-800">
                  User Management
                </h2>

              </div>

              <p className="text-sm text-slate-500 mt-2">
                Manage registered StudySphere users and roles.
              </p>

            </div>

            <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-500">

              Showing{" "}

              <span className="font-bold text-slate-800">
                {filteredUsers.length}
              </span>

              {" "}of{" "}

              <span className="font-bold text-slate-800">
                {users.length}
              </span>

            </div>

          </div>

          {/* SEARCH + FILTER */}

          <div className="flex flex-col md:flex-row gap-3 mt-6">

            <div className="relative flex-1">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition"
              />

            </div>

            <select
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(e.target.value)
              }
              className="px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition cursor-pointer"
            >

              <option value="all">
                All Roles
              </option>

              <option value="student">
                Students
              </option>

              <option value="admin">
                Admins
              </option>

            </select>

          </div>

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px]">

            <thead>

              <tr className="bg-slate-50 border-b border-slate-200">

                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  User
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Email
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Role
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Joined
                </th>

                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredUsers.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="px-6 py-14 text-center"
                  >

                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl mx-auto">
                      🔍
                    </div>

                    <p className="font-bold text-slate-700 mt-4">
                      No users found
                    </p>

                    <p className="text-sm text-slate-400 mt-1">
                      Try changing your search or role filter.
                    </p>

                  </td>

                </tr>

              ) : (

                filteredUsers.map((user) => {

                  const isCurrentUser =
                    user._id === currentUser?._id

                  return (
                    <tr
                      key={user._id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition"
                    >

                      {/* USER */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-600"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            {user.name
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>

                          <div className="min-w-0">

                            <div className="flex items-center gap-2">

                              <p className="font-semibold text-slate-800">
                                {user.name}
                              </p>

                              {isCurrentUser && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold">
                                  YOU
                                </span>
                              )}

                            </div>

                            <p className="text-xs text-slate-400 mt-0.5">
                              ID: {user._id.slice(-6)}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* EMAIL */}

                      <td className="px-6 py-4">

                        <span className="text-sm text-slate-600">
                          {user.email}
                        </span>

                      </td>

                      {/* ROLE */}

                      <td className="px-6 py-4">

                        {isCurrentUser ? (

                          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-sm font-semibold">
                            🛡️ Admin
                          </span>

                        ) : (

                          <select
                            value={user.role}
                            disabled={
                              updatingRole === user._id
                            }
                            onChange={(e) =>
                              updateRole(
                                user._id,
                                e.target.value
                              )
                            }
                            className={`px-3 py-2 rounded-lg text-sm font-semibold border outline-none cursor-pointer transition ${
                              user.role === "admin"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            } ${
                              updatingRole === user._id
                                ? "opacity-50 cursor-wait"
                                : ""
                            }`}
                          >

                            <option value="student">
                              Student
                            </option>

                            <option value="admin">
                              Admin
                            </option>

                          </select>

                        )}

                      </td>

                      {/* JOINED */}

                      <td className="px-6 py-4">

                        <span className="text-sm text-slate-500">
                          {user.createdAt
                            ? new Date(
                                user.createdAt
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-4 text-right">

                        <div className="flex justify-end items-center gap-2">

                          <button
                            onClick={() =>
                              navigate(
                                `/admin/student/${user._id}`
                              )
                            }
                            className="px-4 py-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white transition text-sm font-semibold"
                          >
                            View
                          </button>

                          {user.role !== "admin" &&
                            !isCurrentUser && (
                              <button
                                onClick={() =>
                                  deleteUser(
                                    user._id,
                                    user.name
                                  )
                                }
                                className="px-4 py-2 rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-500 hover:text-white transition text-sm font-semibold"
                              >
                                Delete
                              </button>
                            )}

                          {user.role === "admin" &&
                            !isCurrentUser && (
                              <span className="px-3 py-2 rounded-lg bg-slate-50 text-slate-400 text-xs font-medium">
                                Protected
                              </span>
                            )}

                        </div>

                      </td>

                    </tr>
                  )
                })

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  )
}

// ===============================
// STAT CARD
// ===============================

function StatCard({
  title,
  value,
  icon,
  color,
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
    pink: "bg-pink-50 text-pink-600",
    indigo: "bg-indigo-50 text-indigo-600",
  }

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">

      <div className="flex items-center justify-between gap-3">

        <div className="min-w-0">

          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide truncate">
            {title}
          </p>

          <p className="text-2xl font-bold text-slate-800 mt-2">
            {value}
          </p>

        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
            colorClasses[color]
          }`}
        >
          {icon}
        </div>

      </div>

    </div>
  )
}

// ===============================
// SUMMARY CARD
// ===============================

function SummaryCard({
  title,
  value,
  description,
  icon,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition">

      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-sm text-slate-500">
          {title}
        </p>

        <p className="text-2xl font-bold text-slate-800">
          {value}
        </p>

        <p className="text-xs text-slate-400 mt-0.5 truncate">
          {description}
        </p>

      </div>

    </div>
  )
}

// ===============================
// MINI STAT
// ===============================

function MiniStat({
  label,
  value,
  icon,
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">

      <div className="flex items-center justify-between">

        <p className="text-xs text-slate-400">
          {label}
        </p>

        <span className="text-xs">
          {icon}
        </span>

      </div>

      <p className="text-lg font-bold text-slate-700 mt-1">
        {value}
      </p>

    </div>
  )
}

export default Admin