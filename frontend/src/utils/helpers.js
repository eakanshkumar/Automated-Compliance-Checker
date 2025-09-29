export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'Compliant':
      return 'green';
    case 'Non-Compliant':
      return 'red';
    case 'Needs Review':
      return 'yellow';
    default:
      return 'gray';
  }
};

export const getStatusVariant = (status) => {
  switch (status) {
    case 'Compliant':
      return 'bg-green-100 text-green-800';
    case 'Non-Compliant':
      return 'bg-red-100 text-red-800';
    case 'Needs Review':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const calculateOverallScore = (products) => {
  if (!products.length) return 0;
  const total = products.reduce((sum, product) => sum + (product.complianceResults?.score || 0), 0);
  return Math.round(total / products.length);
};