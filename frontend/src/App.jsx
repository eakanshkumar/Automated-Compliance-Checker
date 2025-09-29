import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ProductScan from './pages/ProductScan';
import ComplianceReport from './pages/ComplianceReport';
import { ComplianceProvider } from './contexts/ComplianceContext';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ComplianceProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/scan" element={<ProductScan />} />
              <Route path="/report" element={<ComplianceReport />} />
            </Routes>
          </div>
        </Router>
      </ComplianceProvider>
    </ErrorBoundary>
  );
}

export default App;