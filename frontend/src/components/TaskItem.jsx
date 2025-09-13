import React, { useState } from 'react'

export default function TaskItem({ task, onTaskUpdated }) {
  const token = localStorage.getItem('access_token')
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(task.title || '')
  const [description, setDescription] = useState(task.description || '')
  const [saving, setSaving] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // fallback if status missing
  const status = task.status || 'todo'

  // generic update of status only (quick actions)
  const updateStatus = async (newStatus) => {
    if (!token) return alert('Not authenticated')
    try {
      setActionLoading(true)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || 'Failed to update status')
      }
      if (onTaskUpdated) onTaskUpdated()
    } catch (err) {
      alert(err.message || 'Status update failed')
    } finally {
      setActionLoading(false)
    }
  }

  // full update from edit form (title, description, status)
  const updateTask = async (updates) => {
    if (!token) return alert('Not authenticated')
    try {
      setSaving(true)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || 'Failed to update task')
      }
      setIsEditing(false)
      if (onTaskUpdated) onTaskUpdated()
    } catch (err) {
      alert(err.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return
    if (!token) return alert('Not authenticated')
    try {
      setActionLoading(true)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${task.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || 'Delete failed')
      }
      if (onTaskUpdated) onTaskUpdated()
    } catch (err) {
      alert(err.message || 'Delete failed')
    } finally {
      setActionLoading(false)
    }
  }

  const statusColors = {
    todo: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
  }

  return (
    <div className="bg-white p-3 rounded shadow flex justify-between items-start gap-4">
      {/* Left: content or edit form */}
      <div className="flex-1">
        {isEditing ? (
          <>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border p-2 rounded w-full mb-2"
              disabled={saving}
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border p-2 rounded w-full mb-2"
              disabled={saving}
            />
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm">Status:</label>
              <select
                value={task.status || 'todo'}
                onChange={(e) => {
                  // allow editing to pick any status (including todo)
                  const newStatus = e.target.value
                  // we update local task.status only for the select UI; actual save on clicking Save
                  // setTitle/description kept the same
                  // store selection in a temporary variable by reusing description or title? keep simple:
                  task.status = newStatus
                }}
                className="border px-2 py-1 rounded"
                disabled={saving}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => updateTask({ title: title.trim(), description: description.trim(), status: task.status || 'todo' })}
                disabled={saving}
                className={`px-3 py-1 rounded text-white ${saving ? 'bg-gray-400' : 'bg-green-600'}`}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  // reset fields to original in case user cancels
                  setTitle(task.title || '')
                  setDescription(task.description || '')
                }}
                className="px-3 py-1 border rounded"
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={`${status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'} font-medium`}>
              {task.title}
            </div>
            {task.description && <div className="text-sm text-gray-500">{task.description}</div>}
            <div className="mt-2">
              <span className={`inline-block px-2 py-1 text-xs rounded ${statusColors[status]}`}>
                {status.replace('_', ' ')}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Right: quick action buttons */}
      {!isEditing && (
        <div className="flex flex-col items-end gap-2">
          {/* TODO => quick In Progress + complete */}
          {status === 'todo' && (
            <>
              <button
                title="Mark In Progress"
                onClick={() => updateStatus('in_progress')}
                disabled={actionLoading}
                className="px-3 py-1 border rounded bg-yellow-50"
              >
                In Progress
              </button>

              <button
                title="Mark Completed"
                onClick={() => updateStatus('completed')}
                disabled={actionLoading}
                className="px-3 py-1 border rounded flex items-center gap-2"
              >
                {/* circle check SVG */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle>
                  <path d="M9 12.5l1.8 1.8L15 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                Done
              </button>
            </>
          )}

          {/* In progress => Complete + Edit */}
          {status === 'in_progress' && (
            <>
              <button
                title="Mark Completed"
                onClick={() => updateStatus('completed')}
                disabled={actionLoading}
                className="px-3 py-1 border rounded flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle>
                  <path d="M9 12.5l1.8 1.8L15 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                Done
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 border rounded"
                disabled={actionLoading}
              >
                Edit
              </button>
            </>
          )}

          {/* Completed => In Progress + Edit */}
          {status === 'completed' && (
            <>
              <button
                title="Move to In Progress"
                onClick={() => updateStatus('in_progress')}
                disabled={actionLoading}
                className="px-3 py-1 border rounded"
              >
                In Progress
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 border rounded"
                disabled={actionLoading}
              >
                Edit
              </button>
            </>
          )}

          {/* delete always available */}
          <button onClick={handleDelete} disabled={actionLoading} className="px-3 py-1 text-red-600 border border-red-600 rounded">
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
