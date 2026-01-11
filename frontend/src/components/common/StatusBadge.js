import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusClass = () => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      case 'en-route':
        return 'status-en-route';
      case 'maintenance':
        return 'status-maintenance';
      case 'stopped':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'status-inactive';
    }
  };

  return (
    <span className={`status-badge ${getStatusClass()}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
