import Product from '../models/Product.js';
import ComplianceEngine from '../services/ComplianceEngine.js';

const complianceEngine = new ComplianceEngine();

export const scanProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const combinedText = product.extractedData.combinedText;
    const complianceResults = await complianceEngine.validateProduct(combinedText);

    product.complianceResults = complianceResults;
    await product.save();

    res.json({
      success: true,
      productId: product.productId,
      product: {
        title: product.title,
        id: product._id
      },
      complianceResults: complianceResults // Ensure this property exists
    });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getComplianceReport = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ scanDate: -1 })
      .select('productId title complianceResults scanDate');

    const summary = {
      totalProducts: products.length,
      compliant: products.filter(p => p.complianceResults.status === 'Compliant').length,
      nonCompliant: products.filter(p => p.complianceResults.status === 'Non-Compliant').length,
      needsReview: products.filter(p => p.complianceResults.status === 'Needs Review').length,
      averageScore: products.reduce((acc, p) => acc + (p.complianceResults.score || 0), 0) / products.length
    };

    res.json({
      summary,
      products
    });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};