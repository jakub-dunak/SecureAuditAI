<!-- 66a86901-d1d6-44e4-a7b6-15a7cffb363a 5d3b7302-378d-493a-8ee9-61ddccf756e8 -->
# SecureAuditAI Agent - Complete Serverless Solution

## Architecture Overview

- **AI Layer**: Amazon Bedrock (Claude 3.5 Sonnet) for compliance reasoning
- **Compute**: AWS Lambda functions (scan orchestrator, analyzers, API handlers)
- **Storage**: S3 (reports, logs), DynamoDB (audit history, findings)
- **API**: API Gateway REST API with Cognito authorizer
- **Frontend**: Amplify-hosted React dashboard with authentication
- **Monitoring**: CloudWatch dashboards, alarms, and logs

## Implementation Steps

### 1. CloudFormation Template Structure

Create `template.yaml` with:

- Parameters (environment, Bedrock model ID)
- S3 buckets (reports, frontend assets)
- DynamoDB tables (AuditRuns, Findings, ComplianceSnapshots)
- Lambda execution roles with least-privilege policies
- API Gateway with Cognito authorizer
- Cognito User Pool and Identity Pool
- CloudWatch log groups, dashboards, alarms

### 2. Bedrock AgentCore Implementation

**AgentCore Runtime** (agent/main.py - Dockerized):

- Triggered via API or EventBridge schedule
- Generates simulated resource data (EC2, S3, IAM, Lambda configs)
- Invokes Bedrock agent for compliance analysis
- Stores findings in DynamoDB

**Compliance Analyzer** (`lambda/compliance_analyzer.py`):

- Receives resource configs from orchestrator
- Calls Bedrock with prompts for GDPR, SOC 2, PCI-DSS checks
- Returns prioritized findings (Critical/High/Medium/Low)

**Report Generator** (`lambda/report_generator.py`):

- Fetches findings from DynamoDB
- Generates PDF report using reportlab
- Uploads to S3, returns presigned URL

**API Handlers** (`lambda/api_*.py`):

- CRUD operations for audit runs, findings
- Trigger new scans, fetch results
- Return metrics for dashboard

### 3. React Frontend (Amplify)

**Pages**:

- `Dashboard.tsx`: Overview with metrics charts, recent findings
- `AuditControl.tsx`: Initiate scans, configure thresholds
- `Findings.tsx`: Table of vulnerabilities with filtering/sorting
- `Reports.tsx`: Download PDF reports
- `Login.tsx`: Cognito authentication

**Components**:

- Navigation, charts (using recharts), tables, API client (Amplify/axios)

### 4. Simulated Data Generator

Create realistic mock data for demo:

- EC2 instances (some with public IPs, open security groups)
- S3 buckets (some with public access)
- IAM roles (some with wildcard permissions)
- Lambda functions (some with overprivileged roles)

### 5. Hackathon Submission Materials

- `README.md`: Architecture, deployment guide, features, demo instructions
- `ARCHITECTURE.md`: Detailed system design with ASCII/Mermaid diagram
- `DEMO_SCRIPT.md`: Step-by-step demo recording guide (~3 min)
- `.github/workflows/`: Optional CI/CD for deployment
- `assets/`: Screenshots, diagrams

### 6. Deployment & Testing

- Package Lambda code (with dependencies in layers)
- Deploy CloudFormation stack via AWS CLI
- Create Cognito test user
- Run end-to-end test: trigger scan → view findings → download report

## Key Files to Create

- `template.yaml` (main CloudFormation)
- `lambda/scan_orchestrator.py`
- `lambda/compliance_analyzer.py`
- `lambda/report_generator.py`
- `lambda/api_audit_runs.py`
- `lambda/api_findings.py`
- `lambda/utils/bedrock_client.py`
- `lambda/utils/mock_data.py`
- `frontend/src/App.tsx`
- `frontend/src/pages/Dashboard.tsx`
- `frontend/src/pages/AuditControl.tsx`
- `frontend/src/pages/Findings.tsx`
- `frontend/src/pages/Reports.tsx`
- `frontend/src/services/api.ts`
- `frontend/src/aws-exports.js` (Amplify config)
- `requirements.txt` (Lambda dependencies)
- `README.md`
- `ARCHITECTURE.md`
- `DEMO_SCRIPT.md`

## Security Best Practices

- IAM roles with least privilege (e.g., Lambda only accesses specific DynamoDB tables)
- S3 buckets with encryption at rest (AES-256)
- API Gateway with Cognito JWT validation
- CloudTrail logging enabled for audit trail
- Secrets stored in AWS Systems Manager Parameter Store

## Cost Optimization

All serverless, pay-per-use:

- Lambda: Free tier 1M requests/month
- API Gateway: Pay per request
- S3: Pay per GB stored + requests
- DynamoDB: On-demand pricing
- Bedrock: Pay per token (~$0.003/1K input tokens for Claude 3.5 Sonnet)
- Amplify: Free tier for hosting
- Near-zero cost when idle

### To-dos

- [ ] Create main CloudFormation template with all AWS resources (S3, DynamoDB, Lambda, API Gateway, Cognito, CloudWatch)
- [ ] Implement Lambda functions (orchestrator, analyzer, report generator, API handlers) with Bedrock integration
- [ ] Build React dashboard with authentication, audit controls, findings view, and reports page
- [ ] Create simulated AWS resource data generator for safe demo scanning
- [ ] Write README, architecture documentation, and demo script for submission
- [ ] Package Lambda dependencies, create deployment scripts, and test end-to-end