import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

interface ComplianceReport {
  reportId: string;
  auditRunId: string;
  generatedAt: string;
  status: 'COMPLETED' | 'GENERATING' | 'ERROR';
  s3Location: string;
  findingsCount: number;
  overallScore: number;
  frameworks: string[];
  downloadUrl?: string;
}

const Reports: React.FC = () => {
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);

      // In a real implementation, this would be an API call
      // For demo purposes, using mock data
      const mockReports: ComplianceReport[] = [
        {
          reportId: 'report-001',
          auditRunId: 'audit-001',
          generatedAt: '2024-01-15T10:45:00Z',
          status: 'COMPLETED',
          s3Location: 's3://secureauditai-reports-dev/reports/audit-001/compliance-report-20240115-104500.pdf',
          findingsCount: 88,
          overallScore: 75.2,
          frameworks: ['GDPR', 'SOC2', 'PCI-DSS'],
          downloadUrl: '#'
        },
        {
          reportId: 'report-002',
          auditRunId: 'audit-002',
          generatedAt: '2024-01-14T14:30:00Z',
          status: 'COMPLETED',
          s3Location: 's3://secureauditai-reports-dev/reports/audit-002/compliance-report-20240114-143000.pdf',
          findingsCount: 92,
          overallScore: 73.1,
          frameworks: ['GDPR', 'SOC2', 'PCI-DSS'],
          downloadUrl: '#'
        },
        {
          reportId: 'report-003',
          auditRunId: 'audit-003',
          generatedAt: '2024-01-15T11:00:00Z',
          status: 'GENERATING',
          s3Location: '',
          findingsCount: 0,
          overallScore: 0,
          frameworks: ['GDPR', 'SOC2']
        }
      ];

      setReports(mockReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewReport = async () => {
    setIsGenerating(true);

    try {
      // In a real implementation, this would call the API to trigger report generation
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      alert('Report generation started! You will receive a notification when it\'s ready.');
    } catch (error) {
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = (report: ComplianceReport) => {
    // In a real implementation, this would generate a presigned URL and trigger download
    if (report.downloadUrl) {
      window.open(report.downloadUrl, '_blank');
    } else {
      alert('Download URL not available for this report');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'GENERATING':
        return 'bg-blue-100 text-blue-800';
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <h1 className="text-3xl font-bold text-gray-900">Compliance Reports</h1>
        <p className="mt-2 text-gray-600">
          Generate and download detailed compliance audit reports
        </p>
      </div>

      {/* Generate New Report */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
          <CardDescription>
            Create a comprehensive compliance report from the latest audit results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Generate a detailed PDF report including executive summary, findings, and remediation recommendations.
              </p>
            </div>
            <Button
              onClick={generateNewReport}
              disabled={isGenerating}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>
            Previously generated compliance reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.reportId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Report {report.reportId}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Generated: {new Date(report.generatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {report.overallScore.toFixed(1)}% Score
                      </div>
                      <div className="text-xs text-gray-500">
                        {report.findingsCount} findings
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-sm text-gray-600">Frameworks:</span>
                    {report.frameworks.map((framework) => (
                      <Badge key={framework} variant="outline">
                        {framework}
                      </Badge>
                    ))}
                  </div>

                  {report.s3Location && (
                    <div className="text-xs text-gray-500">
                      Location: {report.s3Location}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Audit Run: {report.auditRunId}
                  </div>

                  {report.status === 'COMPLETED' && (
                    <Button
                      onClick={() => downloadReport(report)}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Download PDF
                    </Button>
                  )}

                  {report.status === 'GENERATING' && (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                      <span className="text-sm text-gray-600">Generating...</span>
                    </div>
                  )}

                  {report.status === 'ERROR' && (
                    <Button variant="outline" size="sm">
                      Retry Generation
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {reports.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No reports available. Generate your first compliance report to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Templates */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Report Templates</CardTitle>
            <CardDescription>
              Choose from different report formats and templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <h3 className="font-medium mb-2">Executive Summary</h3>
                <p className="text-sm text-gray-600 mb-4">
                  High-level overview with key metrics and executive insights
                </p>
                <Button variant="outline" size="sm">
                  Use Template
                </Button>
              </div>

              <div className="border rounded-lg p-4 text-center">
                <h3 className="font-medium mb-2">Detailed Technical Report</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Comprehensive technical details with full finding descriptions
                </p>
                <Button variant="outline" size="sm">
                  Use Template
                </Button>
              </div>

              <div className="border rounded-lg p-4 text-center">
                <h3 className="font-medium mb-2">Custom Report</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Build a custom report with specific sections and focus areas
                </p>
                <Button variant="outline" size="sm">
                  Customize
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
