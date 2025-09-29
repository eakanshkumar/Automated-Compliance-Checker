export const generateProductId = () => {
  return `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const sanitizeText = (text) => {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 10000); // Limit text length
};

export const calculateScore = (rules) => {
  const total = rules.length;
  const passed = rules.filter(rule => rule.status === 'PASS').length;
  return total > 0 ? Math.round((passed / total) * 100) : 0;
};