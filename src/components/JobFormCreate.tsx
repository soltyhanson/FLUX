// src/components/JobFormCreate.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase }    from '../lib/supabaseClient'
import { useAuth }     from '../context/AuthContext'
import Button          from './ui/Button'
import Input           from './ui/Input'

export default function JobFormCreate() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [siteLocation, setSiteLocation] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [clientId, setClientId] = useState<string>('')
  const [techId, setTechId] = useState<string>('')
  const [clientOpts, setClientOpts] = useState<{id:string,email:string}[]>([])
  const [techOpts,   setTechOpts]   = useState<{id:string,email:string}[]>([])
  const [error, setError]     = useState<string|null>(null)
  const [loading, setLoading] = useState(false)

  // 1️⃣ Fetch clients (admins and techs need to pick a client)
  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'technician') {
      supabase
        .from('users')
        .select('id,email')
        .eq('role','client')
        .then(({data, error}) => {
          if (error) setError(error.message)
          else setClientOpts(data || [])
        })
    }
  }, [user])

  // 2️⃣ Fetch techs (only admins assign tech)
  useEffect(() => {
    if (user?.role === 'admin') {
      supabase
        .from('users')
        .select('id,email')
        .eq('role','technician')
        .then(({data, error}) => {
          if (error) setError(error.message)
          else setTechOpts(data || [])
        })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    // Build payload based on your role and selections:
    const payload: any = {
      client_id: user!.role === 'client' ? user!.id : clientId,
      title,
      description,
      site_location: siteLocation,
      status: 'Allocated',
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      technician_id: user!.role === 'admin' ? techId || null : user!.role === 'technician' ? user!.id : null,
    }

    const { error: insertErr } = await supabase
      .from('jobs')
      .insert([payload])

    setLoading(false)
    if (insertErr) setError(insertErr.message)
    else navigate('/jobs')
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Create Job</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pick the client (admin & tech only) */}
        {(user?.role === 'admin' || user?.role === 'technician') && (
          <div>
            <label className="block mb-1">Client</label>
            <select
              className="w-full border rounded p-2"
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              required
            >
              <option value="">Select a client</option>
              {clientOpts.map(c => (
                <option key={c.id} value={c.id}>{c.email}</option>
              ))}
            </select>
          </div>
        )}

        {/* Job details */}
        <div>
          <label className="block mb-1">Title</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1">Description</label>
          <Input value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1">Site Location</label>
          <Input value={siteLocation} onChange={e => setSiteLocation(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1">Scheduled At</label>
          <Input
            type="datetime-local"
            value={scheduledAt}
            onChange={e => setScheduledAt(e.target.value)}
          />
        </div>

        {/* Assign technician (admin only) */}
        {user?.role === 'admin' && (
          <div>
            <label className="block mb-1">Assign Technician</label>
            <select
              className="w-full border rounded p-2"
              value={techId}
              onChange={e => setTechId(e.target.value)}
            >
              <option value="">Unassigned</option>
              {techOpts.map(t => (
                <option key={t.id} value={t.id}>{t.email}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create Job'}
          </Button>
        </div>
      </form>
    </div>
  )
}
