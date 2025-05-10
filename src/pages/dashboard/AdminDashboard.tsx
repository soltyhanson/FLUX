import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase, User } from '../../lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Users, UserCheck, UserX, RefreshCcw } from 'lucide-react';
import Button from '../../components/ui/Button';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    clients: 0,
    technicians: 0
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setAllUsers(data as User[]);
        
        // Calculate stats
        setStats({
          total: data.length,
          admins: data.filter(u => u.role === 'admin').length,
          clients: data.filter(u => u.role === 'client').length,
          technicians: data.filter(u => u.role === 'technician').length
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>
        <p className="text-neutral-600">Welcome back, {user?.email}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white animate-slide-in">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-100 text-primary-800">
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-500">Total Users</p>
                <h3 className="text-xl font-bold text-neutral-900">{stats.total}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white animate-slide-in" style={{ animationDelay: '50ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-secondary-100 text-secondary-800">
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-500">Admins</p>
                <h3 className="text-xl font-bold text-neutral-900">{stats.admins}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white animate-slide-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-accent-100 text-accent-800">
                <UserCheck className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-500">Clients</p>
                <h3 className="text-xl font-bold text-neutral-900">{stats.clients}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white animate-slide-in" style={{ animationDelay: '150ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-success-100 text-success-800">
                <UserX className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-500">Technicians</p>
                <h3 className="text-xl font-bold text-neutral-900">{stats.technicians}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="mb-6 animate-slide-up">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Registered Users</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto rounded-md border border-neutral-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50 text-neutral-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-neutral-500">
                      Loading users...
                    </td>
                  </tr>
                ) : allUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-neutral-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  allUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      className="bg-white border-b hover:bg-neutral-50"
                    >
                      <td className="px-6 py-4 font-medium">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-secondary-100 text-secondary-800' 
                            : user.role === 'client'
                            ? 'bg-accent-100 text-accent-800'
                            : 'bg-success-100 text-success-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;