import React from 'react';
import { getStatusVariant } from '../utils/helpers';

const StatusBadge = ({ status, size = 'medium' }) => {
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1 text-sm',
    large: 'px-4 py-2 text-base'
  };

  return (
    <span className={`inline-flex items-center font-semibold rounded-full ${getStatusVariant(status)} ${sizeClasses[size]}`}>
      {status}
    </span>
  );
};

export default StatusBadge;