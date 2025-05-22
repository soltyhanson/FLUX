// src/components/JobFormCreate.tsx
import React, { useState, useEffect, FormEvent } from 'react'
import { useNavigate }         from 'react-router-dom'
import { supabase }            from '../lib/supabaseClient'
import { useAuth }             from '../context/AuthContext'

interface SimpleUser { id: string; email: string }

export default function JobFormCreate() {
  const { user } = useAuth()
  const nav      = useNavigate()

  // dropdown data
  const [ clients,    setClients    ] = useState<SimpleUser[]>([])
  const [ technicians,setTechs      ] = useState<SimpleUser[]>([])
  // form fields
  const [ clientId,      setClientId      ] = useState<string>('')
  const [ technicianId,  setTechnicianId  ] = useState<string>('')
  const [ title,         setTitle         ] = useState<string>('')
  const [ description,   setDescription   ] = useState<string>('')
  const [ siteLocation,  setSiteLocation  ] = useState<string>('')
  const [ scheduledAt,   setScheduledAt   ] = useState<string>('')
  const [ loading,       setLoading       ] = useState<boolean>(false)

  // fetch both lists on mount
  useEffect(() => {
    ;(async () => {
      // fetch clients
      let { data: _c, error: ce } = await supabase
        .from<SimpleUser>('users')
        .select('id, email')
        .eq('role', 'client')
      if (ce) console.error('fetch clients:', ce)
      else setClients(_c!)

      // fetch techs
      let { data: _t, error: te } = await supabase
        .from<SimpleUser>('users')
        .select('id, email')
        .eq('role', 'technician')
      if (te) console.error('fetch techs:', te)
      else setTechs(_t!)
    })()
  }, [user])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!clientId) {
      alert('Please select a client')
      return
    }
    setLoading(true)
    const { error } = await supabase
      .from('jobs')
      .insert({
        client_id:     clientId,
        technician_id: technicianId || null,
        title,
        description,
        site_location: siteLocation,
        scheduled_at:  scheduledAt,
        status:        'Allocated'
      })
    setLoading(false)
    if (error) {
      console.error('create job error:', error)
      alert(error.message)
    } else {
      nav('/dashboard/' + (user!.role === 'technician' ? 'technician' : 'admin'))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Create Job</h1>

      <label className="block">
        Client
        <select
          className="mt-1 block w-full"
          value={clientId}
          onChange={e => setClientId(e.target.value)}
          required
        >
          <option value="">— Select a client —</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>
              {c.email}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        Title
        <input
          className="mt-1 block w-full"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </label>

      <label className="block">
        Description
        <textarea
          className="mt-1 block w-full"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </label>

      <label className="block">
        Site Location
        <input
          className="mt-1 block w-full"
          value={siteLocation}
          onChange={e => setSiteLocation(e.target.value)}
        />
      </label>

      <label className="block">
        Scheduled At
        <input
          type="datetime-local"
          className="mt-1 block w-full"
          value={scheduledAt}
          onChange={e => setScheduledAt(e.target.value)}
        />
      </label>

      <label className="block">
        Assign Technician
        <select
          className="mt-1 block w-full"
          value={technicianId}
          onChange={e => setTechnicianId(e.target.value)}
        >
          <option value="">— Unassigned —</option>
          {technicians.map(t => (
            <option key={t.id} value={t.id}>
              {t.email}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? 'Creating…' : 'Create Job'}
      </button>
    </form>
  )
}
