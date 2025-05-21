import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import Input from './ui/Input';
import { Search } from 'lucide-react';

export default function JobFormCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState<string>('');
  const [clients, setClients] = useState<{ id: string; email: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [technicianId, setTechnicianId] = useState<string>('');
  const [techOpts, setTechOpts] = useState<{ id: string; email: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('id, email')
          .eq('role', 'client');

        if (fetchError) {
          console.error('Error fetching clients:', fetchError);
          setError(fetchError.message);
          return;
        }

        if (data) {
          setClients(data);
        }
      } catch (err) {
        console.error('Error in fetchClients:', err);
        setError('Failed to fetch clients');
      }
    };

    const fetchTechnicians = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('id, email')
          .eq('role', 'technician');

        if (fetchError) {
          console.error('Error fetching technicians:', fetchError);
          setError(fetchError.message);
          return;
        }

        if (data) {
          setTechOpts(data);
        }
      } catch (err) {
        console.error('Error in fetchTechnicians:', err);
        setError('Failed to fetch technicians');
      }
    };

    if (user?.role === 'admin' || user?.role === 'technician') {
      fetchClients();
    }

    if (user?.role === 'admin') {
      fetchTechnicians();
    }
  }, [user]);

  const filteredClients = useMemo(() => {
    return clients.filter(client =>
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

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
      {error && (
        <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-md text-error-600">
          {error}
        </div>
      )}
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
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 focus:border-primary-500 mb-2"
              />
            </div>
            <select
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 focus:border-primary-500"
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              required
            >
              <option value="">— Select Client —</option>
              {filteredClients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.email}
                </option>
              ))}
            </select>
            {filteredClients.length === 0 && searchTerm && (
              <p className="mt-1 text-sm text-neutral-500">
                No clients found matching "{searchTerm}"
              </p>
            )}
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