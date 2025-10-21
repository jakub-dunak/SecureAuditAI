import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';

// Import pages
import Dashboard from './pages/Dashboard';
import AuditControl from './pages/AuditControl';
import Findings from './pages/Findings';
import Reports from './pages/Reports';

// Import components
import Navigation from './components/Navigation';
import AuthWrapper from './components/AuthWrapper';

// Import AWS configuration
import awsconfig from './aws-exports';

// Configure Amplify
Amplify.configure(awsconfig);

function App() {
  return (
    <Router>
      <AuthWrapper>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="py-8">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/audit-control" element={<AuditControl />} />
              <Route path="/findings" element={<Findings />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </main>
        </div>
      </AuthWrapper>
    </Router>
  );
}

export default App;
