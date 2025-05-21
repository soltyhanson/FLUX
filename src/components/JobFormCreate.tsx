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
  const [isLoadingClients, setIsLoadingClients] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoadingClients(true);
      setError(null);
      
      console.log('=== Debug: fetchClients start ===');
      console.log('Current user:', user);
      console.log('User role:', user?.role);
      console.log('User ID:', user?.id);
      
      try {
        console.log('Building Supabase query...');
        const query = supabase
          .from('users')
          .select('id, email')
          .eq('role', 'client');

        console.log('Executing query...');
        const { data, error: fetchError } = await query;

        console.log('Query response:', {
          success: !fetchError,
          error: fetchError,
          dataLength: data?.length ?? 0,
          data
        });

        if (fetchError) {
          console.error('Error details:', {
            message: fetchError.message,
            code: fetchError.code,
            details: fetchError.details,
            hint: fetchError.hint
          });
          setError(fetchError.message);
          return;
        }

        if (!data) {
          console.warn('No data returned from query');
          setClients([]);
          return;
        }

        console.log('Successfully fetched clients:', {
          count: data.length,
          clients: data
        });
        setClients(data);
      } catch (err) {
        console.error('Unexpected error in fetchClients:', err);
        setError('Failed to fetch clients');
      } finally {
        console.log('=== Debug: fetchClients end ===');
        setIsLoadingClients(false);
      }
    };

    const fetchTechnicians = async () => {
      console.log('=== Debug: fetchTechnicians start ===');
      try {
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('id, email')
          .eq('role', 'technician');

        console.log('Technicians query response:', {
          success: !fetchError,
          error: fetchError,
          dataLength: data?.length ?? 0,
          data
        });

        if (fetchError) {
          console.error('Error fetching technicians:', fetchError);
          setError(fetchError.message);
          return;
        }

        if (data) {
          console.log('Setting technicians:', data);
          setTechOpts(data);
        }
      } catch (err) {
        console.error('Error in fetchTechnicians:', err);
        setError('Failed to fetch technicians');
      } finally {
        console.log('=== Debug: fetchTechnicians end ===');
      }
    };

    console.log('=== Debug: useEffect start ===');
    console.log('Component mounted/updated with user:', user);

    if (user && (user.role === 'admin' || user.role === 'technician')) {
      console.log('User has permission to fetch clients');
      fetchClients();
    } else {
      console.log('User does not have permission to fetch clients:', {
        userExists: !!user,
        userRole: user?.role
      });
    }

    if (user && user.role === 'admin') {
      console.log('User is admin, fetching technicians');
      fetchTechnicians();
    }
    console.log('=== Debug: useEffect end ===');
  }, [user]);

  const filteredClients = useMemo(() => {
    console.log('Filtering clients:', {
      totalClients: clients.length,
      searchTerm,
      currentClientId: clientId
    });
    // Temporarily return all clients without filtering
    return clients;
    // return clients.filter(client =>
    //   client.email.toLowerCase().includes(searchTerm.toLowerCase())
    // );
  }, [clients, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log('=== Debug: handleSubmit start ===');
    console.log('Form submission data:', {
      title,
      description,
      clientId,
      scheduledAt,
      technicianId,
      userRole: user?.role
    });

    const payload: any = {
      client_id: user?.role === 'client' ? user.id : clientId,
      title,
      description,
      status: 'Allocated',
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      technician_id: user?.role === 'admin' ? technicianId || null : null,
    };

    console.log('Submitting payload:', payload);

    const { error: insertErr } = await supabase.from('jobs').insert([payload]);
    setLoading(false);

    if (insertErr) {
      console.error('Job creation error:', insertErr);
      setError(insertErr.message);
    } else {
      console.log('Job created successfully');
      navigate('/jobs');
    }
    console.log('=== Debug: handleSubmit end ===');
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
              {isLoadingClients ? (
                <option disabled>Loading clients...</option>
              ) : (
                filteredClients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.email}
                  </option>
                ))
              )}
            </select>
            {!isLoadingClients && filteredClients.length === 0 && searchTerm && (
              <p className="mt-1 text-sm text-neutral-500">
                No clients found matching "{searchTerm}"
              </p>
            )}
            {!isLoadingClients && filteredClients.length === 0 && !searchTerm && (
              <p className="mt-1 text-sm text-neutral-500">
                No clients available
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
          <Button type="submit" disabled={loading} isLoading={loading}>
            {loading ? 'Creating…' : 'Create Job'}
          </Button>
        </div>
      </form>
    </div>
  );
}