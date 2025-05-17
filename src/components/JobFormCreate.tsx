import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import Button from './ui/Button';

const JobFormCreate: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">Create New Job</h1>
        <Button 
          variant="outline"
          onClick={() => navigate('/jobs')}
        >
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            {/* Form fields will be added here */}
            <p className="text-neutral-600">Form implementation coming soon...</p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobFormCreate;