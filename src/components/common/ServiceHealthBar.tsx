import React from 'react';

type Status = 'operational' | 'degraded' | 'outage' | 'maintenance';

export interface ServiceHealthBarProps {
  serviceName?: string;
  status?: Status;
  message?: string;
  className?: string;
}

const statusColor: Record<Status, string> = {
  operational: 'bg-green-50 text-green-800 border-green-200',
  degraded: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  outage: 'bg-red-50 text-red-800 border-red-200',
  maintenance: 'bg-blue-50 text-blue-800 border-blue-200',
};

const ServiceHealthBar: React.FC<ServiceHealthBarProps> = ({
  serviceName = 'Service',
  status = 'operational',
  message,
  className = '',
}) => {
  return (
    <div >
      <div >{serviceName}</div>
      <div >
        {message ||
          (status === 'operational'
            ? 'All systems are operational.'
            : 'Service is experiencing issues.')}
      </div>
    </div>
  );
};

export default ServiceHealthBar;
