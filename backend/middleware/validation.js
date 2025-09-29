export const validateProductScan = (req, res, next) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    new URL(url);
    next();
  } catch (error) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }
};