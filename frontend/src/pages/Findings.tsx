import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

interface Finding {
  findingId: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  resourceType: string;
  resourceId: string;
  complianceFrameworks: string[];
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'FALSE_POSITIVE';
  createdAt: string;
  riskScore: number;
  remediationSteps: string[];
}

const Findings: React.FC = () => {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [filteredFindings, setFilteredFindings] = useState<Finding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    severity: '',
    resourceType: '',
    status: '',
    framework: ''
  });

  useEffect(() => {
    fetchFindings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [findings, filters]);

  const fetchFindings = async () => {
    try {
      setIsLoading(true);

      // In a real implementation, this would be an API call
      // For demo purposes, using mock data
      const mockFindings: Finding[] = [
        {
          findingId: 'finding-001',
          title: 'S3 Bucket Public Access Enabled',
          description: 'S3 bucket example-bucket-123 has public read access enabled, violating GDPR data protection requirements',
          severity: 'HIGH',
          resourceType: 'S3_BUCKET',
          resourceId: 'example-bucket-123',
          complianceFrameworks: ['GDPR', 'SOC2'],
          status: 'OPEN',
          createdAt: '2024-01-15T10:30:00Z',
          riskScore: 75,
          remediationSteps: [
            'Disable public access on S3 bucket',
            'Review and update bucket policy',
            'Enable S3 Block Public Access settings'
          ]
        },
        {
          findingId: 'finding-002',
          title: 'EC2 Instance Public IP Exposure',
          description: 'EC2 instance i-1234567890abcdef0 has a public IP address, potentially violating PCI-DSS network security requirements',
          severity: 'MEDIUM',
          resourceType: 'EC2_INSTANCE',
          resourceId: 'i-1234567890abcdef0',
          complianceFrameworks: ['PCI-DSS'],
          status: 'OPEN',
          createdAt: '2024-01-15T10:25:00Z',
          riskScore: 50,
          remediationSteps: [
            'Review security group configurations',
            'Consider using private subnets',
            'Implement proper network access controls'
          ]
        },
        {
          findingId: 'finding-003',
          title: 'Over-Privileged IAM Role',
          description: 'IAM role overprivileged-role has wildcard permissions, violating SOC2 least privilege principle',
          severity: 'CRITICAL',
          resourceType: 'IAM_ROLE',
          resourceId: 'overprivileged-role',
          complianceFrameworks: ['SOC2'],
          status: 'IN_PROGRESS',
          createdAt: '2024-01-14T15:45:00Z',
          riskScore: 90,
          remediationSteps: [
            'Remove wildcard permissions',
            'Apply principle of least privilege',
            'Use specific IAM actions only'
          ]
        },
        {
          findingId: 'finding-004',
          title: 'Sensitive Data in Lambda Environment Variables',
          description: 'Lambda function vulnerable-function contains sensitive data in environment variables',
          severity: 'HIGH',
          resourceType: 'LAMBDA_FUNCTION',
          resourceId: 'vulnerable-function',
          complianceFrameworks: ['GDPR', 'PCI-DSS'],
          status: 'OPEN',
          createdAt: '2024-01-14T12:20:00Z',
          riskScore: 70,
          remediationSteps: [
            'Remove sensitive data from environment variables',
            'Use AWS Secrets Manager or Parameter Store',
            'Update function configuration'
          ]
        },
        {
          findingId: 'finding-005',
          title: 'RDS Instance Public Access',
          description: 'RDS instance database-1 is publicly accessible, violating multiple compliance frameworks',
          severity: 'CRITICAL',
          resourceType: 'RDS_INSTANCE',
          resourceId: 'database-1',
          complianceFrameworks: ['GDPR', 'SOC2', 'PCI-DSS'],
          status: 'RESOLVED',
          createdAt: '2024-01-13T09:15:00Z',
          riskScore: 85,
          remediationSteps: [
            'Disable public accessibility',
            'Configure proper security groups',
            'Use private subnets only'
          ]
        }
      ];

      setFindings(mockFindings);
    } catch (error) {
      console.error('Error fetching findings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...findings];

    if (filters.severity) {
      filtered = filtered.filter(f => f.severity === filters.severity);
    }

    if (filters.resourceType) {
      filtered = filtered.filter(f => f.resourceType === filters.resourceType);
    }

    if (filters.status) {
      filtered = filtered.filter(f => f.status === filters.status);
    }

    if (filters.framework) {
      filtered = filtered.filter(f => f.complianceFrameworks.includes(filters.framework));
    }

    setFilteredFindings(filtered);
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

  const updateFindingStatus = (findingId: string, newStatus: string) => {
    setFindings(prev => prev.map(f =>
      f.findingId === findingId ? { ...f, status: newStatus as any } : f
    ));
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
              <div key={finding.findingId} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getSeverityColor(finding.severity)}>
                        {finding.severity}
                      </Badge>
                      <Badge className={getStatusColor(finding.status)}>
                        {finding.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Risk Score: {finding.riskScore}
                      </span>
                    </div>

                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {finding.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-2">
                      {finding.description}
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Resource: {finding.resourceType} ({finding.resourceId})</span>
                      <span>Frameworks: {finding.complianceFrameworks.join(', ')}</span>
                      <span>Created: {new Date(finding.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Remediation Steps */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Remediation Steps:</h4>
                  <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                    {finding.remediationSteps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    {finding.status === 'OPEN' && (
                      <Button
                        size="sm"
                        onClick={() => updateFindingStatus(finding.findingId, 'IN_PROGRESS')}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        Mark In Progress
                      </Button>
                    )}
                    {finding.status === 'IN_PROGRESS' && (
                      <Button
                        size="sm"
                        onClick={() => updateFindingStatus(finding.findingId, 'RESOLVED')}
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
