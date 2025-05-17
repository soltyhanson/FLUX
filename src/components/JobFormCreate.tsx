// src/components/JobFormCreate.tsx
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
  const [siteLocation, setSiteLocation] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [technicianId, setTechnicianId] = useState<string>('');
  const [techOpts, setTechOpts] = useState<{ id: string; email: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role === 'admin') {
      supabase
        .from('users')
        .select('id,email')
        .eq('role', 'technician')
        .then(({ data, error }) => {
          if (error) setError(error.message);
          else if (data) setTechOpts(data);
        });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!user) {
      setError('You must be logged in to create a job');
      setLoading(false);
      return;
    }

    const payload = {
      client_id: user.role === 'admin' ? technicianId : user.id,
      title,
      description,
      site_location: siteLocation,
      status: 'Allocated',
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      technician_id: user.role === 'admin' ? technicianId : null,
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
        {user?.role === 'admin' && (
          <div>
            <label className="block mb-1">Assign Technician</label>
            <select
              className="mt-1 block w-full rounded border-gray-300"
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