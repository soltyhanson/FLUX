import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Plus } from 'lucide-react';

const JobsList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreate = user?.role === 'admin' || user?.role === 'technician';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">Jobs</h1>
        {canCreate && (
          <Button 
            onClick={() => navigate('/jobs/new')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Job
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto rounded-md border border-neutral-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50 text-neutral-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Technician</th>
                  <th className="px-6 py-3">Scheduled</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Job rows will be rendered here */}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobsList;