import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import Input from './ui/Input';

export default function JobFormCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState<string>('');
  const [clients, setClients] = useState<{ id: string; email: string }[]>([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [technicianId, setTechnicianId] = useState<string>('');
  const [techOpts, setTechOpts] = useState<{ id: string; email: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, email')
        .eq('role', 'client');

      if (error) {
        setError(error.message);
      } else {
        setClients(data as any);
      }
    };

    if (user?.role === 'admin' || user?.role === 'technician') {
      fetchClients();
    }

    if (user?.role === 'admin') {
      supabase
        .from('users')
        .select('id,email')
        .eq('role', 'technician')
        .then(({ data, error }) => {
          if (error) setError(error.message);
          else if (data) setTechOpts(data as any);
        });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: any = {
      client_id: user?.role === 'client' ? user.id : clientId,
      title,
      description,
      status: 'Allocated',
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      technician_id: user!.role === 'admin' ? technicianId || null : null,
    };

    const { error: insertErr } = await supabase.from('jobs').insert([payload]);
    setLoading(false);

    if (insertErr) {
      setError(insertErr.message);
    } else {
      navigate('/jobs');
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create Job</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1">Title</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 min-h-[150px] bg-white border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 focus:border-primary-500"
          />
        </div>
        {(user?.role === 'admin' || user?.role === 'technician') && (
          <div>
            <label className="block mb-1">Client</label>
            <select
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 focus:border-primary-500"
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              required
            >
              <option value="">— Select Client —</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.email}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block mb-1">Scheduled At</label>
          <Input
            type="datetime-local"
            value={scheduledAt}
            onChange={e => setScheduledAt(e.target.value)}
          />
        </div>
        {user?.role === 'admin' && (
          <div>
            <label className="block mb-1">Assign Technician</label>
            <select
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 focus:border-primary-500"
              value={technicianId}
              onChange={e => setTechnicianId(e.target.value)}
            >
              <option value="">— unassigned —</option>
              {techOpts.map(t => (
                <option key={t.id} value={t.id}>
                  {t.email}
                </option>
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
  );
}