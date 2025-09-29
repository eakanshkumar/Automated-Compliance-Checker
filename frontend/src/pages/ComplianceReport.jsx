import React, { useState, useEffect } from 'react';
import { complianceAPI } from '../services/api';
import { formatDate, getStatusVariant, truncateText } from '../utils/helpers';

const ComplianceReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchComplianceReport();
  }, []);

  const fetchComplianceReport = async () => {
    try {
      const response = await complianceAPI.getReport();
      setReport(response.data);
    } catch (error) {
      console.error('Error fetching compliance report:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = report?.products?.filter(product => {
    const matchesFilter = filter === 'all' || product.complianceResults?.status === filter;
    const matchesSearch = product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.productId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Compliance Report</h1>
        <p className="text-gray-600">Detailed compliance analysis of all scanned products</p>
      </div>

      {/* Summary Cards */}
      {report?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{report.summary.totalProducts}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliant</p>
                <p className="text-2xl font-bold text-green-600">{report.summary.compliant}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Non-Compliant</p>
                <p className="text-2xl font-bold text-red-600">{report.summary.nonCompliant}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {Math.round(report.summary.averageScore)}%
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('Compliant')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'Compliant' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Compliant
            </button>
            <button
              onClick={() => setFilter('Non-Compliant')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'Non-Compliant' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Non-Compliant
            </button>
            <button
              onClick={() => setFilter('Needs Review')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'Needs Review' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Needs Review
            </button>
          </div>

          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Scanned Products ({filteredProducts.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compliance Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Violations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scan Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">📦</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {truncateText(product.title, 50)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.productId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-semibold">
                      {product.complianceResults?.score || 0}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          (product.complianceResults?.score || 0) >= 80
                            ? 'bg-green-500'
                            : (product.complianceResults?.score || 0) >= 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${product.complianceResults?.score || 0}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusVariant(product.complianceResults?.status)}`}>
                      {product.complianceResults?.status || 'Not Scanned'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.complianceResults?.violations?.length || 0} violations
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(product.scanDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      View Details
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      Rescan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No products have been scanned yet'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceReport;