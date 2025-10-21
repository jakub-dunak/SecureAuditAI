import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

interface ScanConfiguration {
  complianceFrameworks: string[];
  resourceTypes: string[];
  regions: string[];
  includeTags: boolean;
  scheduleEnabled: boolean;
  scheduleFrequency: string;
}

const AuditControl: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<string>('2024-01-15T10:30:00Z');
  const [scanHistory] = useState([
    {
      id: 'scan-001',
      status: 'COMPLETED',
      startedAt: '2024-01-15T10:30:00Z',
      completedAt: '2024-01-15T10:45:00Z',
      findingsCount: 88,
      complianceScore: 75.2
    },
    {
      id: 'scan-002',
      status: 'COMPLETED',
      startedAt: '2024-01-14T14:15:00Z',
      completedAt: '2024-01-14T14:30:00Z',
      findingsCount: 92,
      complianceScore: 73.1
    },
    {
      id: 'scan-003',
      status: 'FAILED',
      startedAt: '2024-01-13T09:00:00Z',
      completedAt: '2024-01-13T09:05:00Z',
      findingsCount: 0,
      error: 'Permission denied accessing S3 bucket'
    }
  ]);

  const [scanConfig, setScanConfig] = useState<ScanConfiguration>({
    complianceFrameworks: ['GDPR', 'SOC2', 'PCI-DSS'],
    resourceTypes: ['S3', 'EC2', 'IAM', 'Lambda', 'RDS'],
    regions: ['us-west-2', 'us-west-2'],
    includeTags: true,
    scheduleEnabled: true,
    scheduleFrequency: '24 hours'
  });

  const handleStartScan = async () => {
    setIsScanning(true);

    try {
      // In a real implementation, this would call the API
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate API call

      setLastScanTime(new Date().toISOString());
      alert('Scan started successfully!');
    } catch (error) {
      alert('Failed to start scan. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'RUNNING':
        return 'bg-blue-100 text-blue-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Audit Control</h1>
        <p className="mt-2 text-gray-600">
          Configure and initiate compliance audit scans
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scan Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Scan Configuration</CardTitle>
            <CardDescription>Configure what to scan and how</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Compliance Frameworks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compliance Frameworks
              </label>
              <div className="flex flex-wrap gap-2">
                {['GDPR', 'SOC2', 'PCI-DSS', 'HIPAA', 'NIST'].map((framework) => (
                  <button
                    key={framework}
                    className={`px-3 py-1 text-sm rounded-full border ${
                      scanConfig.complianceFrameworks.includes(framework)
                        ? 'bg-indigo-100 border-indigo-300 text-indigo-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setScanConfig(prev => ({
                        ...prev,
                        complianceFrameworks: prev.complianceFrameworks.includes(framework)
                          ? prev.complianceFrameworks.filter(f => f !== framework)
                          : [...prev.complianceFrameworks, framework]
                      }));
                    }}
                  >
                    {framework}
                  </button>
                ))}
              </div>
            </div>

            {/* Resource Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resource Types to Scan
              </label>
              <div className="flex flex-wrap gap-2">
                {['S3', 'EC2', 'IAM', 'Lambda', 'RDS', 'CloudTrail'].map((resourceType) => (
                  <button
                    key={resourceType}
                    className={`px-3 py-1 text-sm rounded-full border ${
                      scanConfig.resourceTypes.includes(resourceType)
                        ? 'bg-indigo-100 border-indigo-300 text-indigo-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setScanConfig(prev => ({
                        ...prev,
                        resourceTypes: prev.resourceTypes.includes(resourceType)
                          ? prev.resourceTypes.filter(r => r !== resourceType)
                          : [...prev.resourceTypes, resourceType]
                      }));
                    }}
                  >
                    {resourceType}
                  </button>
                ))}
              </div>
            </div>

            {/* Regions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AWS Regions
              </label>
              <div className="flex flex-wrap gap-2">
                {['us-west-2', 'us-west-2', 'eu-west-1', 'ap-southeast-1'].map((region) => (
                  <button
                    key={region}
                    className={`px-3 py-1 text-sm rounded-full border ${
                      scanConfig.regions.includes(region)
                        ? 'bg-indigo-100 border-indigo-300 text-indigo-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setScanConfig(prev => ({
                        ...prev,
                        regions: prev.regions.includes(region)
                          ? prev.regions.filter(r => r !== region)
                          : [...prev.regions, region]
                      }));
                    }}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule Settings
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="scheduleEnabled"
                    checked={scanConfig.scheduleEnabled}
                    onChange={(e) => setScanConfig(prev => ({ ...prev, scheduleEnabled: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="scheduleEnabled" className="ml-2 text-sm text-gray-700">
                    Enable scheduled scans
                  </label>
                </div>
                {scanConfig.scheduleEnabled && (
                  <select
                    value={scanConfig.scheduleFrequency}
                    onChange={(e) => setScanConfig(prev => ({ ...prev, scheduleFrequency: e.target.value }))}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="6 hours">Every 6 hours</option>
                    <option value="12 hours">Every 12 hours</option>
                    <option value="24 hours">Every 24 hours</option>
                    <option value="weekly">Weekly</option>
                  </select>
                )}
              </div>
            </div>

            <Button
              onClick={handleStartScan}
              disabled={isScanning}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {isScanning ? 'Starting Scan...' : 'Start Compliance Scan'}
            </Button>
          </CardContent>
        </Card>

        {/* Scan History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Scan History</CardTitle>
            <CardDescription>History of compliance audit scans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scanHistory.map((scan) => (
                <div key={scan.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{scan.id}</span>
                    <Badge className={getStatusColor(scan.status)}>
                      {scan.status}
                    </Badge>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Started: {new Date(scan.startedAt).toLocaleString()}</div>
                    {scan.completedAt && (
                      <div>Completed: {new Date(scan.completedAt).toLocaleString()}</div>
                    )}
                    {scan.status === 'COMPLETED' && (
                      <div className="flex justify-between">
                        <span>Findings: {scan.findingsCount}</span>
                        <span>Score: {scan.complianceScore}%</span>
                      </div>
                    )}
                    {scan.error && (
                      <div className="text-red-600">Error: {scan.error}</div>
                    )}
                  </div>

                  {scan.status === 'COMPLETED' && (
                    <div className="mt-3 flex space-x-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        Download Report
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Scan Information */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Last Scan Information</CardTitle>
            <CardDescription>Details about the most recent compliance scan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {new Date(lastScanTime).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600">Last Scan Date</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {scanHistory[0]?.findingsCount || 0}
                </div>
                <div className="text-sm text-gray-600">Total Findings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {scanHistory[0]?.complianceScore?.toFixed(1) || 'N/A'}%
                </div>
                <div className="text-sm text-gray-600">Compliance Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditControl;
