import React, { useState } from 'react';
import { productAPI, complianceAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

const ProductScan = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [complianceResult, setComplianceResult] = useState(null);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(''); // Track current step

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError('');
    setScanResult(null);
    setComplianceResult(null);
    setCurrentStep('scraping');

    try {
      // Step 1: Scan product
      const scanResponse = await productAPI.scanProduct(url);
      setScanResult(scanResponse.data);
      setCurrentStep('compliance');

      // Step 2: Run compliance check
      if (scanResponse.data.product?.id) {
        const complianceResponse = await complianceAPI.scanCompliance(scanResponse.data.product.id);
        setComplianceResult(complianceResponse.data);
      }
      
    } catch (err) {
      console.error('Scan error:', err);
      setError(err.message || 'Failed to scan product. Please check the URL and try again.');
    } finally {
      setLoading(false);
      setCurrentStep('');
    }
  };

  const getStepStatus = (step) => {
    if (currentStep === step) return 'current';
    if (step === 'scraping' && scanResult) return 'completed';
    if (step === 'compliance' && complianceResult) return 'completed';
    return 'pending';
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Scan Product for Compliance</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Product URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.amazon.in/dp/PRODUCT_ID or https://www.flipkart.com/product/p/item"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <LoadingSpinner size="small" text="" />
                <span className="ml-2">Scanning...</span>
              </span>
            ) : (
              'Scan Product'
            )}
          </button>
        </form>

        {/* Progress Steps */}
        {loading && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center ${getStepStatus('scraping') === 'completed' ? 'text-green-600' : getStepStatus('scraping') === 'current' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  getStepStatus('scraping') === 'completed' ? 'bg-green-100 border-green-500' :
                  getStepStatus('scraping') === 'current' ? 'bg-blue-100 border-blue-500' :
                  'bg-gray-100 border-gray-300'
                }`}>
                  {getStepStatus('scraping') === 'completed' ? '✓' : '1'}
                </div>
                <span className="ml-2 font-medium">Scraping Product Data</span>
              </div>
              
              <div className={`flex items-center ${getStepStatus('compliance') === 'completed' ? 'text-green-600' : getStepStatus('compliance') === 'current' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  getStepStatus('compliance') === 'completed' ? 'bg-green-100 border-green-500' :
                  getStepStatus('compliance') === 'current' ? 'bg-blue-100 border-blue-500' :
                  'bg-gray-100 border-gray-300'
                }`}>
                  {getStepStatus('compliance') === 'completed' ? '✓' : '2'}
                </div>
                <span className="ml-2 font-medium">Checking Compliance</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <span className="text-red-400 mr-2">❌</span>
              <div>
                <span className="text-red-700 font-medium">Error:</span>
                <span className="text-red-600 ml-2">{error}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {scanResult && (
        <div className="space-y-6">
          {/* Product Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Product Information</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Product ID</p>
                  <p className="font-medium">{scanResult.product?.productId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Title</p>
                  <p className="font-medium">{scanResult.product?.title || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Images Found</p>
                  <p className="font-medium">{scanResult.product?.images || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium text-green-600">Scraped Successfully</p>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Results */}
          {complianceResult ? (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Compliance Results</h2>
                  <StatusBadge 
                    status={complianceResult.complianceResults?.status || 'Unknown'} 
                    size="large" 
                  />
                </div>
                <div className="mt-2">
                  <p className="text-lg">
                    Compliance Score: <span className="font-bold">{complianceResult.complianceResults?.score || 0}%</span>
                  </p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {complianceResult.complianceResults?.rules?.map((rule) => (
                    <div key={rule.ruleId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-lg">{rule.ruleName}</h4>
                          <p className="text-sm text-gray-600">{rule.description}</p>
                        </div>
                        <span className={`px-3 py-1 text-sm rounded-full font-semibold ${
                          rule.status === 'PASS'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {rule.status}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm">
                          <strong>Evidence Found:</strong> {rule.evidence || 'No evidence found'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {complianceResult.complianceResults?.violations?.length > 0 && (
                  <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 mb-2 text-lg">⚠️ Violations Found:</h4>
                    <ul className="list-disc list-inside text-red-700 space-y-1">
                      {complianceResult.complianceResults.violations.map((violation, index) => (
                        <li key={index} className="font-medium">{violation}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {complianceResult.complianceResults?.status === 'Compliant' && (
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <span className="text-green-500 text-2xl mr-2">✅</span>
                      <span className="text-green-800 font-medium">This product is compliant with Legal Metrology rules.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : loading ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <LoadingSpinner text="Analyzing compliance..." />
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-yellow-500 text-xl mr-2">⚠️</span>
                <span className="text-yellow-700">Compliance analysis not completed. Please try rescanning.</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sample URLs for Testing */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Sample URLs for Testing</h3>
        <div className="space-y-2">
          <p className="text-blue-700 text-sm">You can use these sample product pages for testing:</p>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Any Amazon product URL (e.g., https://www.amazon.in/dp/B0ABCD1234)</li>
            <li>Any Flipkart product URL (e.g., https://www.flipkart.com/product/p/item)</li>
            <li>Any e-commerce site product page</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductScan;