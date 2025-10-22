import { Amplify } from 'aws-amplify';
import awsmobile from '../aws-exports';

// Configure Amplify (this should be done once in the app)
Amplify.configure(awsmobile);

// API Configuration
// In production, this should be set via environment variable or CloudFormation output
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ||
  'https://your-api-gateway-url.execute-api.us-west-2.amazonaws.com/dev';

// API Response types
export interface AuditRun {
  AuditRunId: string;
  Status: string;
  CreatedAt: string;
  CompletedAt?: string;
  Environment: string;
  BedrockModelId: string;
  ComplianceFrameworks: string[];
  ScanConfig: any;
  FindingsCount?: number;
  ComplianceScore?: number;
  ErrorMessage?: string;
  Description?: string;
}

export interface Finding {
  FindingId: string;
  AuditRunId: string;
  Title: string;
  Description: string;
  Severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  ResourceType: string;
  ResourceId: string;
  ComplianceFrameworks: string[];
  Status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'FALSE_POSITIVE';
  CreatedAt: string;
  UpdatedAt: string;
  RemediationSteps: string[];
  RiskScore: number;
  Tags?: any;
  Metadata?: any;
}

export interface ComplianceReport {
  ReportId: string;
  AuditRunId: string;
  GeneratedAt: string;
  Status: 'COMPLETED' | 'GENERATING' | 'ERROR';
  S3Location: string;
  FindingsCount: number;
  OverallScore: number;
  Frameworks: string[];
  DownloadUrl?: string;
}

// API Service class
class ApiService {
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Get the current user's session token for authentication
    try {
      const user = await Amplify.Auth.currentAuthenticatedUser();
      const token = user.signInUserSession.idToken.jwtToken;
      defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': `Bearer ${token}`,
      };
    } catch (error) {
      console.warn('No authenticated user found');
    }

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Audit Runs API
  async getAuditRuns(params?: { status?: string; limit?: number; startDate?: string; endDate?: string }): Promise<{ auditRuns: AuditRun[]; count: number }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const queryString = queryParams.toString();
    const endpoint = `/audit-runs${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  async createAuditRun(data: {
    auditRunId?: string;
    status?: string;
    description?: string;
    complianceFrameworks?: string[];
    scanConfig?: any;
  }): Promise<{ auditRun: AuditRun; message: string }> {
    return this.request('/audit-runs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAuditRun(auditRunId: string, data: Partial<AuditRun>): Promise<{ auditRun: AuditRun; message: string }> {
    return this.request(`/audit-runs/${auditRunId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAuditRun(auditRunId: string): Promise<{ message: string; deletedAuditRun: AuditRun }> {
    return this.request(`/audit-runs/${auditRunId}`, {
      method: 'DELETE',
    });
  }

  // Findings API
  async getFindings(params?: {
    auditRunId?: string;
    severity?: string;
    resourceType?: string;
    status?: string;
    limit?: number;
    lastKey?: string;
  }): Promise<{ findings: Finding[]; count: number; lastKey?: string }> {
    const queryParams = new URLSearchParams();
    if (params?.auditRunId) queryParams.append('auditRunId', params.auditRunId);
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.resourceType) queryParams.append('resourceType', params.resourceType);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.lastKey) queryParams.append('lastKey', params.lastKey);

    const queryString = queryParams.toString();
    const endpoint = `/findings${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  async createFinding(data: Partial<Finding>): Promise<{ finding: Finding; message: string }> {
    return this.request('/findings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFinding(findingId: string, data: Partial<Finding>): Promise<{ finding: Finding; message: string }> {
    return this.request(`/findings/${findingId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFinding(findingId: string): Promise<{ message: string; deletedFinding: Finding }> {
    return this.request(`/findings/${findingId}`, {
      method: 'DELETE',
    });
  }

  // Scan API
  async triggerScan(data: {
    auditRunId?: string;
    complianceFrameworks?: string[];
    scanConfig?: any;
  }): Promise<{ auditRunId: string; status: string; findingsCount: number; message: string }> {
    return this.request('/scan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
