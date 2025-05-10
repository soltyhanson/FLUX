import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Clock, AlertCircle, CheckCircle, Calendar, BarChart } from 'lucide-react';
import Button from '../../components/ui/Button';

const TechDashboard: React.FC = () => {
  const { user } = useAuth();

  // Sample data for technician dashboard
  const assignments = [
    { id: 1, client: 'Acme Corp', title: 'Internet connectivity issue', status: 'open', deadline: '2025-05-05' },
    { id: 2, client: 'Zenith Industries', title: 'Email setup for new employee', status: 'in-progress', deadline: '2025-04-30' },
    { id: 3, client: 'Global Logistics', title: 'Printer not working', status: 'closed', deadline: '2025-04-20' },
    { id: 4, client: 'Summit Tech', title: 'Network configuration', status: 'in-progress', deadline: '2025-05-07' },
  ];

  const upcomingSchedule = [
    { id: 1, client: 'Acme Corp', title: 'Network assessment', date: '2025-05-10', time: '10:00 AM - 12:00 PM' },
    { id: 2, client: 'Summit Tech', title: 'Security audit', date: '2025-05-15', time: '2:00 PM - 4:00 PM' },
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
        <h1 className="text-2xl font-bold text-neutral-900">Technician Dashboard</h1>
        <p className="text-neutral-600">Welcome back, {user?.email}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white animate-slide-in">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-100 text-primary-800">
                <Clock className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-500">Open Tasks</p>
                <h3 className="text-xl font-bold text-neutral-900">1</h3>
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
                <h3 className="text-xl font-bold text-neutral-900">2</h3>
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

        <Card className="bg-white animate-slide-in" style={{ animationDelay: '150ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-secondary-100 text-secondary-800">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-500">Scheduled</p>
                <h3 className="text-xl font-bold text-neutral-900">2</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Tasks */}
        <div className="lg:col-span-2">
          <Card className="animate-slide-up">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Assigned Tasks</CardTitle>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto rounded-md border border-neutral-200">
                <table className="w-full text-sm text-left">
                  <thead className="bg-neutral-50 text-neutral-500 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Issue</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((task) => (
                      <tr key={task.id} className="bg-white border-b hover:bg-neutral-50">
                        <td className="px-4 py-3 font-medium">{task.client}</td>
                        <td className="px-4 py-3">{task.title}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">{task.deadline}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Upcoming Schedule */}
          <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle>Your Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingSchedule.map((appointment) => (
                  <div key={appointment.id} className="flex items-start p-4 border rounded-lg bg-neutral-50">
                    <div className="p-2 rounded-full bg-primary-100 text-primary-800">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium">{appointment.title}</h4>
                      <div className="text-xs text-neutral-500 mt-1">
                        <p>Client: {appointment.client}</p>
                        <p>{appointment.date}</p>
                        <p>{appointment.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card className="animate-slide-up" style={{ animationDelay: '150ms' }}>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-neutral-700">Tasks Completed</span>
                    <span className="text-xs font-medium text-neutral-700">75%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-neutral-700">Response Time</span>
                    <span className="text-xs font-medium text-neutral-700">90%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div className="bg-success-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-neutral-700">Client Satisfaction</span>
                    <span className="text-xs font-medium text-neutral-700">85%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div className="bg-accent-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TechDashboard;