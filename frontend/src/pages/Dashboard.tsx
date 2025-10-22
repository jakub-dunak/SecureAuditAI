import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { StatusBadge, SecurityBadge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { apiService, AuditRun, Finding } from '../services/api';

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

      // Fetch recent audit runs
      const auditRunsResponse = await apiService.getAuditRuns({ limit: 10 });
      const recentAudits = auditRunsResponse.auditRuns.map((audit: AuditRun) => ({
        AuditRunId: audit.AuditRunId,
        Status: audit.Status,
        CreatedAt: audit.CreatedAt,
        FindingsCount: audit.FindingsCount || 0,
        ComplianceScore: audit.ComplianceScore || 0,
      }));
      setRecentAudits(recentAudits);

      // Fetch findings to calculate metrics
      const findingsResponse = await apiService.getFindings({ limit: 1000 });

      // Calculate compliance metrics based on frameworks and findings
      const complianceFrameworks = ['GDPR', 'SOC2', 'PCI-DSS'];
      const complianceMetrics: ComplianceMetric[] = [];

      for (const framework of complianceFrameworks) {
        const frameworkFindings = findingsResponse.findings.filter((f: Finding) =>
          f.ComplianceFrameworks.includes(framework)
        );

        // Calculate compliance score (simplified - in reality this would be more complex)
        const totalRisk = frameworkFindings.reduce((sum: number, f: Finding) => {
          const severityWeights = { CRITICAL: 100, HIGH: 70, MEDIUM: 50, LOW: 30 };
          return sum + (severityWeights[f.Severity] || 0);
        }, 0);

        const maxPossibleRisk = frameworkFindings.length * 100;
        const complianceScore = frameworkFindings.length > 0
          ? Math.max(0, 100 - (totalRisk / maxPossibleRisk) * 100)
          : 100;

        let status: 'PASS' | 'FAIL' | 'WARNING';
        if (complianceScore >= 80) status = 'PASS';
        else if (complianceScore >= 60) status = 'WARNING';
        else status = 'FAIL';

        const lastScan = recentAudits.length > 0 ? recentAudits[0].CreatedAt : new Date().toISOString();

        complianceMetrics.push({
          framework,
          score: Math.round(complianceScore),
          status,
          lastScan,
        });
      }

      setComplianceMetrics(complianceMetrics);

      // Calculate finding summary by severity
      const severityCounts = {
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0,
      };

      findingsResponse.findings.forEach((finding: Finding) => {
        severityCounts[finding.Severity] = (severityCounts[finding.Severity] || 0) + 1;
      });

      const findingSummary: FindingSummary[] = [
        { severity: 'CRITICAL', count: severityCounts.CRITICAL, trend: 'stable' },
        { severity: 'HIGH', count: severityCounts.HIGH, trend: 'stable' },
        { severity: 'MEDIUM', count: severityCounts.MEDIUM, trend: 'stable' },
        { severity: 'LOW', count: severityCounts.LOW, trend: 'stable' },
      ];

      setFindingSummary(findingSummary);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to empty data if API fails
      setComplianceMetrics([]);
      setFindingSummary([]);
      setRecentAudits([]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleStartNewAudit = () => {
    // Navigate to audit control page
    window.location.href = '/audit-control';
  };

  const handleViewLatestReport = () => {
    // Navigate to reports page
    window.location.href = '/reports';
  };

  const handleConfigureScanSettings = () => {
    // Navigate to audit control page with settings focus
    window.location.href = '/audit-control';
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
                onClick={handleStartNewAudit}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              >
                Start New Audit
              </Button>
              <Button
                onClick={handleViewLatestReport}
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
                onClick={handleConfigureScanSettings}
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
                <div key={audit.AuditRunId} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-neutral-900">{audit.AuditRunId}</div>
                    <div className="text-xs text-neutral-500">
                      {new Date(audit.CreatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-2">
                    <div className="mb-1">
                      <StatusBadge status={audit.Status.toLowerCase() as any}>
                        {audit.Status}
                      </StatusBadge>
                    </div>
                    {audit.Status === 'COMPLETED' && (
                      <div className="text-xs text-neutral-500">
                        {audit.FindingsCount || 0} findings • {(audit.ComplianceScore || 0).toFixed(1)}% score
                      </div>
                    )}
                  </div>
                  {audit.Status === 'COMPLETED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = `/findings?auditRunId=${audit.AuditRunId}`}
                    >
                      View Details
                    </Button>
                  )}
                </div>
              ))}
              {recentAudits.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No recent audits found. Start your first compliance scan.
                </div>
              )}
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
