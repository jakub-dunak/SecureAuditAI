import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

interface ComplianceMetric {
  framework: string;
  score: number;
  status: 'PASS' | 'FAIL' | 'WARNING';
  lastScan: string;
}

interface FindingSummary {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  count: number;
  trend: 'up' | 'down' | 'stable';
}

interface AuditRun {
  auditRunId: string;
  status: string;
  createdAt: string;
  findingsCount: number;
  complianceScore: number;
}

const Dashboard: React.FC = () => {
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetric[]>([]);
  const [findingSummary, setFindingSummary] = useState<FindingSummary[]>([]);
  const [recentAudits, setRecentAudits] = useState<AuditRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // In a real implementation, these would be API calls
      // For demo purposes, using mock data

      // Mock compliance metrics
      setComplianceMetrics([
        { framework: 'GDPR', score: 78, status: 'WARNING', lastScan: '2024-01-15T10:30:00Z' },
        { framework: 'SOC 2', score: 82, status: 'PASS', lastScan: '2024-01-15T10:30:00Z' },
        { framework: 'PCI-DSS', score: 65, status: 'FAIL', lastScan: '2024-01-15T10:30:00Z' },
      ]);

      // Mock finding summary
      setFindingSummary([
        { severity: 'CRITICAL', count: 3, trend: 'stable' },
        { severity: 'HIGH', count: 12, trend: 'up' },
        { severity: 'MEDIUM', count: 28, trend: 'down' },
        { severity: 'LOW', count: 45, trend: 'stable' },
      ]);

      // Mock recent audits
      setRecentAudits([
        {
          auditRunId: 'audit-001',
          status: 'COMPLETED',
          createdAt: '2024-01-15T10:30:00Z',
          findingsCount: 88,
          complianceScore: 75.2,
        },
        {
          auditRunId: 'audit-002',
          status: 'COMPLETED',
          createdAt: '2024-01-14T14:15:00Z',
          findingsCount: 92,
          complianceScore: 73.1,
        },
        {
          auditRunId: 'audit-003',
          status: 'RUNNING',
          createdAt: '2024-01-15T09:00:00Z',
          findingsCount: 0,
          complianceScore: 0,
        },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS':
        return 'bg-green-100 text-green-800';
      case 'FAIL':
        return 'bg-red-100 text-red-800';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '➡️';
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
        <h1 className="text-3xl font-bold text-gray-900">Compliance Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of your organization's compliance posture across all frameworks
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Start a new audit or view detailed reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Start New Audit
              </Button>
              <Button variant="outline">
                View Latest Report
              </Button>
              <Button variant="outline">
                Configure Scan Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Compliance Scores */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Scores</CardTitle>
            <CardDescription>Current compliance status by framework</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceMetrics.map((metric) => (
                <div key={metric.framework} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium">{metric.framework}</div>
                    <Badge className={getStatusColor(metric.status)}>
                      {metric.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{metric.score}%</div>
                    <div className="text-xs text-gray-500">
                      Last: {new Date(metric.lastScan).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Findings Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Findings Summary</CardTitle>
            <CardDescription>Security findings by severity level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {findingSummary.map((finding) => (
                <div key={finding.severity} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge className={getSeverityColor(finding.severity)}>
                      {finding.severity}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {finding.count} findings
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg">{getTrendIcon(finding.trend)}</span>
                    <div className="text-xs text-gray-500">vs last scan</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Audits */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Audits</CardTitle>
            <CardDescription>Latest compliance audit results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAudits.map((audit) => (
                <div key={audit.auditRunId} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{audit.auditRunId}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(audit.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={
                        audit.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : audit.status === 'RUNNING'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {audit.status}
                    </Badge>
                    {audit.status === 'COMPLETED' && (
                      <div className="text-xs text-gray-500 mt-1">
                        {audit.findingsCount} findings
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Compliance Score */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Overall Compliance Score</CardTitle>
            <CardDescription>
              Weighted average across all compliance frameworks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-bold text-indigo-600 mb-2">
                  {Math.round(complianceMetrics.reduce((sum, metric) => sum + metric.score, 0) / complianceMetrics.length)}%
                </div>
                <div className="text-gray-600">Overall Compliance</div>
                <div className="mt-4 text-sm text-gray-500">
                  Based on {complianceMetrics.length} frameworks • Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
