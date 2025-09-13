import React, { useState } from 'react'

export default function TaskForm({ onTaskCreated }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const token = localStorage.getItem('access_token')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title) return alert('Title is required')

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      })

      if (!res.ok) throw new Error('Failed to create task')

      setTitle('')
      setDescription('')
      if (onTaskCreated) onTaskCreated() // refresh tasks
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
      <input
        className="w-full p-2 border rounded mb-2"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full p-2 border rounded mb-2"
        placeholder="Task description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button className="px-4 py-2 bg-blue-600 text-white rounded">
        Add Task
      </button>
    </form>
  )
}
