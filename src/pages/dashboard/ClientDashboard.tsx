import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Clock, AlertCircle, CheckCircle, Calendar } from 'lucide-react';

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();

  // Sample data for client dashboard
  const tickets = [
    { id: 1, title: 'Internet connectivity issue', status: 'open', created: '2025-05-01', technician: 'John Smith' },
    { id: 2, title: 'Email setup for new employee', status: 'in-progress', created: '2025-04-28', technician: 'Jane Doe' },
    { id: 3, title: 'Printer not working', status: 'closed', created: '2025-04-20', technician: 'Mike Johnson' },
    { id: 4, title: 'Software installation request', status: 'open', created: '2025-04-15', technician: 'Unassigned' },
  ];

  const upcomingAppointments = [
    { id: 1, title: 'Network assessment', date: '2025-05-10', time: '10:00 AM', technician: 'John Smith' },
    { id: 2, title: 'Security audit', date: '2025-05-15', time: '2:00 PM', technician: 'Jane Doe' },
  ];

  const statusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-accent-100 text-accent-800';
      case 'in-progress':
        return 'bg-primary-100 text-primary-800';
      case 'closed':
        return 'bg-success-100 text-success-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Client Dashboard</h1>
        <p className="text-neutral-600">Welcome back, {user?.email}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white animate-slide-in">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-100 text-primary-800">
                <Clock className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-500">Open Tickets</p>
                <h3 className="text-xl font-bold text-neutral-900">2</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white animate-slide-in" style={{ animationDelay: '50ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-accent-100 text-accent-800">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-500">In Progress</p>
                <h3 className="text-xl font-bold text-neutral-900">1</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white animate-slide-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-success-100 text-success-800">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-500">Completed</p>
                <h3 className="text-xl font-bold text-neutral-900">1</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Support Tickets */}
        <div className="lg:col-span-2">
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle>Your Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto rounded-md border border-neutral-200">
                <table className="w-full text-sm text-left">
                  <thead className="bg-neutral-50 text-neutral-500 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3">Technician</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket.id} className="bg-white border-b hover:bg-neutral-50">
                        <td className="px-4 py-3 font-medium">{ticket.title}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">{ticket.created}</td>
                        <td className="px-4 py-3">{ticket.technician}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <div className="lg:col-span-1">
          <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-start p-4 border rounded-lg bg-neutral-50">
                    <div className="p-2 rounded-full bg-primary-100 text-primary-800">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium">{appointment.title}</h4>
                      <div className="text-xs text-neutral-500 mt-1">
                        <p>{appointment.date} at {appointment.time}</p>
                        <p>Technician: {appointment.technician}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;