import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Badge, StatusBadge, SecurityBadge } from '../components/ui/badge';
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
      <div className="page-container">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="loading-spinner w-12 h-12"></div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Loading Dashboard...
            </h3>
            <p className="text-neutral-600">
              Fetching your compliance data
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Compliance Dashboard</h1>
        <p className="page-subtitle">
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
            <div className="flex flex-wrap gap-3">
              <Button
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              >
                Start New Audit
              </Button>
              <Button
                variant="secondary"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              >
                View Latest Report
              </Button>
              <Button
                variant="outline"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              >
                Configure Scan Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid-dashboard">
        {/* Compliance Scores */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Scores</CardTitle>
            <CardDescription>Current compliance status by framework</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceMetrics.map((metric) => (
                <div key={metric.framework} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-neutral-900">{metric.framework}</div>
                    <StatusBadge status={metric.status.toLowerCase() as any}>
                      {metric.status}
                    </StatusBadge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-neutral-900">{metric.score}%</div>
                    <div className="text-xs text-neutral-500">
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
                <div key={finding.severity} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <SecurityBadge severity={finding.severity.toLowerCase() as any}>
                      {finding.severity}
                    </SecurityBadge>
                    <span className="text-sm text-neutral-600 font-medium">
                      {finding.count} findings
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getTrendIcon(finding.trend)}</span>
                    <div className="text-xs text-neutral-500">vs last scan</div>
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
            <div className="space-y-3">
              {recentAudits.map((audit) => (
                <div key={audit.auditRunId} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-neutral-900">{audit.auditRunId}</div>
                    <div className="text-xs text-neutral-500">
                      {new Date(audit.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="mb-1">
                      <StatusBadge status={audit.status.toLowerCase() as any}>
                        {audit.status}
                      </StatusBadge>
                    </div>
                    {audit.status === 'COMPLETED' && (
                      <div className="text-xs text-neutral-500">
                        {audit.findingsCount} findings • {audit.complianceScore.toFixed(1)}% score
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
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Overall Compliance Score</CardTitle>
            <CardDescription className="text-base">
              Weighted average across all compliance frameworks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="relative">
                  <div className="text-7xl font-bold text-primary-600 mb-2">
                    {Math.round(complianceMetrics.reduce((sum, metric) => sum + metric.score, 0) / complianceMetrics.length)}%
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <div className="w-6 h-6 bg-success-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="text-lg text-neutral-700 font-medium mb-4">Overall Compliance</div>
                <div className="flex items-center justify-center space-x-6 text-sm text-neutral-600">
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{complianceMetrics.length} frameworks</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Last updated: {new Date().toLocaleDateString()}</span>
                  </div>
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
