import React, { useEffect, useState } from 'react'
import TaskForm from './TaskForm'
import TaskItem from './TaskItem'

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('access_token')

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch tasks')
      const data = await res.json()
      setTasks(data)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTasks() }, [])

  const filteredTasks = tasks.filter(t => {
    if (filter === 'all') return true
    return t.status === filter
  })

  // ✅ Compute counts correctly
  const total = tasks.length
  const todoCount = tasks.filter(t => (t.status || 'todo') === 'todo').length
  const inProgressCount = tasks.filter(t => (t.status || 'todo') === 'in_progress').length
  const completedCount = tasks.filter(t => (t.status || 'todo') === 'completed').length

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4 font-bold">Task Manager</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-gray-600">Total</div>
          <div className="text-2xl font-bold">{total}</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-gray-600">To Do</div>
          <div className="text-2xl font-bold text-blue-600">{todoCount}</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-gray-600">In Progress</div>
          <div className="text-2xl font-bold text-orange-500">{inProgressCount}</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-gray-600">Completed</div>
          <div className="text-2xl font-bold text-green-600">{completedCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded ${filter==='all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>All</button>
        <button onClick={() => setFilter('todo')} className={`px-4 py-2 rounded ${filter==='todo' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>To Do</button>
        <button onClick={() => setFilter('in_progress')} className={`px-4 py-2 rounded ${filter==='in_progress' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>In Progress</button>
        <button onClick={() => setFilter('completed')} className={`px-4 py-2 rounded ${filter==='completed' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Completed</button>
      </div>

      <TaskForm onTaskCreated={fetchTasks} />

      <div className="mt-6 space-y-3">
        {loading && <div>Loading...</div>}
        {!loading && filteredTasks.length === 0 && <div className="text-gray-500">No tasks found</div>}
        {filteredTasks.map((t) => (
          <TaskItem key={t.id} task={t} onTaskUpdated={fetchTasks} />
        ))}
      </div>
    </div>
  )
}
