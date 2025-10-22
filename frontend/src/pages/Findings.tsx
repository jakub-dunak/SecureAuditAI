import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { apiService, Finding } from '../services/api';

// Finding interface is imported from API service

const Findings: React.FC = () => {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [filteredFindings, setFilteredFindings] = useState<Finding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    severity: '',
    resourceType: '',
    status: '',
    framework: '',
    auditRunId: ''
  });

  useEffect(() => {
    fetchFindings();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...findings];

      if (filters.severity) {
        filtered = filtered.filter(f => f.Severity === filters.severity);
      }

      if (filters.resourceType) {
        filtered = filtered.filter(f => f.ResourceType === filters.resourceType);
      }

      if (filters.status) {
        filtered = filtered.filter(f => f.Status === filters.status);
      }

      if (filters.framework) {
        filtered = filtered.filter(f => f.ComplianceFrameworks.includes(filters.framework));
      }

      if (filters.auditRunId) {
        filtered = filtered.filter(f => f.AuditRunId === filters.auditRunId);
      }

      setFilteredFindings(filtered);
    };

    applyFilters();
  }, [findings, filters]);

  const fetchFindings = async () => {
    try {
      setIsLoading(true);

      // Check URL parameters for filtering
      const urlParams = new URLSearchParams(window.location.search);
      const auditRunId = urlParams.get('auditRunId');

      // Fetch findings from API
      const params: any = { limit: 100 };
      if (auditRunId) {
        params.auditRunId = auditRunId;
      }

      const response = await apiService.getFindings(params);
      setFindings(response.findings);

      // Set initial filters based on URL params
      if (auditRunId) {
        setFilters(prev => ({ ...prev, auditRunId }));
      }
    } catch (error) {
      console.error('Error fetching findings:', error);
      // Keep empty state if API fails
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'FALSE_POSITIVE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const updateFindingStatus = async (findingId: string, newStatus: string) => {
    try {
      // Call API to update finding status
      await apiService.updateFinding(findingId, { Status: newStatus });

      // Update local state
      setFindings(prev => prev.map(f =>
        f.FindingId === findingId ? { ...f, Status: newStatus as any } : f
      ));

      // Show success message
      alert('Finding status updated successfully!');
    } catch (error) {
      console.error('Error updating finding status:', error);
      alert('Failed to update finding status. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Compliance Findings</h1>
        <p className="mt-2 text-gray-600">
          Review and manage security compliance findings
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter findings by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resource Type
              </label>
              <select
                value={filters.resourceType}
                onChange={(e) => setFilters(prev => ({ ...prev, resourceType: e.target.value }))}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Types</option>
                <option value="S3_BUCKET">S3 Bucket</option>
                <option value="EC2_INSTANCE">EC2 Instance</option>
                <option value="IAM_ROLE">IAM Role</option>
                <option value="LAMBDA_FUNCTION">Lambda Function</option>
                <option value="RDS_INSTANCE">RDS Instance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="FALSE_POSITIVE">False Positive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Framework
              </label>
              <select
                value={filters.framework}
                onChange={(e) => setFilters(prev => ({ ...prev, framework: e.target.value }))}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Frameworks</option>
                <option value="GDPR">GDPR</option>
                <option value="SOC2">SOC 2</option>
                <option value="PCI-DSS">PCI-DSS</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Findings List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Findings ({filteredFindings.length})
          </CardTitle>
          <CardDescription>
            {filteredFindings.length} of {findings.length} total findings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredFindings.map((finding) => (
              <div key={finding.FindingId} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getSeverityColor(finding.Severity)}>
                        {finding.Severity}
                      </Badge>
                      <Badge className={getStatusColor(finding.Status)}>
                        {finding.Status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Risk Score: {finding.RiskScore}
                      </span>
                    </div>

                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {finding.Title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-2">
                      {finding.Description}
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Resource: {finding.ResourceType} ({finding.ResourceId})</span>
                      <span>Frameworks: {finding.ComplianceFrameworks.join(', ')}</span>
                      <span>Created: {new Date(finding.CreatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Remediation Steps */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Remediation Steps:</h4>
                  <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                    {finding.RemediationSteps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    {finding.Status === 'OPEN' && (
                      <Button
                        size="sm"
                        onClick={() => updateFindingStatus(finding.FindingId, 'IN_PROGRESS')}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        Mark In Progress
                      </Button>
                    )}
                    {finding.Status === 'IN_PROGRESS' && (
                      <Button
                        size="sm"
                        onClick={() => updateFindingStatus(finding.FindingId, 'RESOLVED')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Mark Resolved
                      </Button>
                    )}
                  </div>

                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredFindings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No findings match the current filters
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Findings;
