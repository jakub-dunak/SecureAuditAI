# 🔒 SecureAuditAI Agent

## Autonomous AI-Powered Cybersecurity Compliance Auditing Platform

SecureAuditAI Agent is a cutting-edge, serverless cybersecurity compliance auditing platform that leverages Amazon Bedrock's Claude 3.5 Sonnet model to provide autonomous, intelligent compliance monitoring and reporting across multiple frameworks including GDPR, SOC 2, and PCI-DSS.

[![AWS Serverless](https://img.shields.io/badge/AWS-Serverless-orange.svg)](https://aws.amazon.com/serverless/)
[![Amazon Bedrock](https://img.shields.io/badge/Amazon-Bedrock-blue.svg)](https://aws.amazon.com/bedrock/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.0-blue.svg)](https://www.typescriptlang.org/)

## 🚀 Features

### Core Capabilities
- **Autonomous Compliance Auditing**: AI-powered analysis of AWS resources against compliance frameworks
- **Multi-Framework Support**: GDPR, SOC 2, PCI-DSS compliance checking
- **Intelligent Findings**: Prioritized risk assessment with actionable remediation steps
- **Automated Report Generation**: Professional PDF reports with executive summaries and detailed findings
- **Real-time Dashboard**: Interactive React dashboard with compliance metrics and trends
- **Secure Authentication**: AWS Cognito integration for user management

### Technical Features
- **Serverless Architecture**: Zero idle cost with AWS Lambda, API Gateway, DynamoDB, and S3
- **Amazon Bedrock Integration**: Advanced AI reasoning using Claude 3.5 Sonnet
- **Bedrock AgentCore Runtime**: Enterprise-grade agent orchestration with memory and tools
- **RESTful API**: Comprehensive API for audit management and findings retrieval
- **CloudWatch Monitoring**: Built-in logging, metrics, and alerting
- **Event-Driven Scanning**: Automated scheduled compliance scans

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React UI      │◄──►│  API Gateway    │◄──►│   Lambda        │
│   (Amplify)     │    │   (Cognito)     │    │   Functions     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cognito       │    │   DynamoDB      │    │   S3 Buckets    │
│   Auth          │    │   (Tables)      │    │   (Reports)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Bedrock       │    │   AgentCore     │    │   CloudWatch    │
│   Foundation    │    │   Runtime       │    │   Monitoring    │
│   Models        │    │   (Docker)      │    │   & Logging     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

### Core Requirements
- AWS Account with appropriate permissions
- Node.js 18+ and npm for frontend development
- Python 3.11+ for Lambda functions and AgentCore runtime
- Docker (for AgentCore runtime containerization)

### GitHub OIDC Authentication Setup
GitHub Actions uses OIDC to authenticate with AWS (no access keys stored in GitHub):

1. **Create OIDC Identity Provider in AWS IAM**:
   ```bash
   aws iam create-open-id-connect-provider \
     --url https://token.actions.githubusercontent.com \
     --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 \
     --client-id-list sts.amazonaws.com
   ```

2. **Create IAM Role for GitHub Actions**:
   ```bash
   # Edit oidc-trust-policy.json with your GitHub org/repo details
   # Replace ${AWS_ACCOUNT_ID}, ${GITHUB_ORG}, and ${REPO_NAME}

   aws iam create-role \
     --role-name personal-github-oidc-role \
     --assume-role-policy-document file://oidc-trust-policy.json
   ```

3. **Attach deployment permissions policy** to the role:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "cloudformation:*",
           "lambda:*",
           "apigateway:*",
           "cognito-idp:*",
           "cognito-identity:*",
           "dynamodb:*",
           "s3:*",
           "bedrock:*",
           "ecr:*",
           "logs:*",
           "events:*",
           "iam:GetRole",
           "iam:PassRole"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

4. **Add AWS Account ID to GitHub Secrets**:
   - Repository Settings → Secrets and variables → Actions
   - Add `AWS_ACCOUNT_ID` secret with your AWS account ID

**Note**: No AWS access keys are needed - GitHub Actions will use OIDC to assume the appropriate IAM roles automatically.

### Automated Lambda Packaging
Lambda functions are automatically packaged and deployed:

- **Separate Lambda folder** (`lambda/`) contains all function code
- **Automatic packaging** during GitHub Actions deployment
- **S3-based deployment** packages uploaded to dedicated S3 bucket
- **Full CRUD APIs** for audit runs and findings management

### Cognito Domain Auto-Generation
The GitHub Actions workflow automatically generates unique Cognito domain prefixes:

- **No manual domain selection required** - domains are generated and validated automatically during deployment
- **Reuses existing domains** for the same stack/environment to avoid conflicts
- **Globally unique validation** ensures no domain conflicts
- **Format**: `{cleaned-stack-name}-{random-suffix}` (e.g., `secureauditai-agent-dev-a1b2`)
- **Retry logic** attempts up to 5 times to find an available domain

## 🚀 Quick Start

### 1. Deploy Infrastructure

```bash
# Deploy using GitHub Actions workflow (recommended)
The deployment workflow will automatically generate a unique Cognito domain prefix.

For manual deployment (not recommended), you would need to provide a unique domain:

```bash
# Manual deployment (domain must be pre-validated as unique)
aws cloudformation create-stack \
  --stack-name secureauditai-agent \
  --template-body file://cloudformation/template.yaml \
  --parameters \
    ParameterKey=Environment,ParameterValue=dev \
    ParameterKey=BedrockModelId,ParameterValue=amazon.titan-text-premier-v1:0 \
    ParameterKey=CognitoDomainPrefix,ParameterValue="your-validated-unique-domain"

# Wait for stack creation to complete
aws cloudformation wait stack-create-complete --stack-name secureauditai-agent
```

**Note**: The recommended approach is to use the GitHub Actions workflow, which automatically generates and validates unique domain prefixes.

### 2. Test Production Deployment

After deployment, the application will be fully functional with:

- **Professional Modern UI**: Complete redesign with modern design system
- **Full Authentication**: Sign up and sign in functionality
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Production Builds**: Optimized builds for production deployment

**Testing Checklist**:
- [ ] Navigate to the deployed Amplify URL
- [ ] Click "Create Account" and sign up with email
- [ ] Check email for verification code and complete signup
- [ ] Sign in with your new account
- [ ] Test all navigation links (Dashboard, Audit Control, Findings, Reports)
- [ ] Verify responsive design on mobile devices
- [ ] Test user menu and sign out functionality

### 3. Set Up Frontend (Development)

```bash
cd frontend
npm install
npm run build

# Deploy to Amplify (or upload to S3 bucket created by CloudFormation)
aws s3 sync build/ s3://secureauditai-frontend-dev --delete
```

### 3. Configure AgentCore Runtime

```bash
cd agent
pip install -r requirements.txt

# Build and push Docker image to ECR (created by CloudFormation)
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin <ECR_REPO_URI>
docker build -t secureauditai-agent .
docker tag secureauditai-agent:latest <ECR_REPO_URI>:latest
docker push <ECR_REPO_URI>:latest
```

### 4. Create AgentCore Runtime

```python
import boto3

# Create AgentCore runtime using CloudFormation outputs
agentcore_client = boto3.client('bedrock-agentcore-control')

response = agentcore_client.create_agent_runtime(
    name='SecureAuditAI-Agent',
    description='AI-powered compliance auditing agent',
    imageUri='<ECR_REPO_URI>:latest',
    executionRoleArn='<AGENTCORE_EXECUTION_ROLE_ARN>',  # From CloudFormation
    environmentVariables={
        'ENVIRONMENT': 'dev',
        'BEDROCK_MODEL_ID': 'amazon.titan-text-premier-v1:0'
    }
)
```

### 4. Authentication Setup

After deployment, create a Cognito test user:

```bash
# Get User Pool ID from CloudFormation outputs
USER_POOL_ID=$(aws cloudformation describe-stacks --stack-name secureauditai-agent \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' --output text)

# Create a test user
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username test@example.com \
  --temporary-password TempPass123! \
  --message-action SUPPRESS \
  --user-attributes Name=email,Value=test@example.com Name=email_verified,Value=true

# Set permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id $USER_POOL_ID \
  --username test@example.com \
  --password SecurePass123! \
  --permanent
```

## 🔐 Authentication & Security

### User Authentication
- **AWS Cognito Integration**: Secure user authentication with email/password
- **Automatic Configuration**: Frontend automatically configured with CloudFormation outputs
- **Protected Routes**: All dashboard routes require authentication
- **Session Management**: Automatic token refresh and session handling

### Security Features
- **JWT Authorization**: API Gateway validates Cognito JWT tokens
- **Least Privilege IAM**: Lambda functions have minimal required permissions
- **Encryption**: Data encrypted at rest (DynamoDB, S3) and in transit
- **CloudTrail Logging**: All API calls and resource changes are logged

## 🛠️ Development

### Local Development Setup

1. **Frontend Development**:
```bash
cd frontend
npm install
npm start  # Runs on http://localhost:3000
```

2. **Lambda Functions**:
```bash
cd lambda
pip install -r ../requirements.txt
# Edit functions and test locally
```

3. **AgentCore Runtime**:
```bash
cd agent
pip install -r requirements.txt
python main.py  # For local testing
```

### Project Structure

```
├── cloudformation/template.yaml # Main CloudFormation template
├── agent/                     # Bedrock AgentCore runtime
│   ├── main.py               # Agent entry point with BedrockAgentCoreApp
│   ├── compliance_analyzer.py # AI compliance analysis
│   ├── mock_data_generator.py # Mock resource generator
│   ├── report_generator.py   # PDF report generation
│   ├── Dockerfile           # Container definition
│   └── requirements.txt     # Python dependencies
├── lambda/                   # API Lambda functions
│   ├── trigger_scan.py      # Scan orchestration
│   ├── api_audit_runs.py    # Audit runs API
│   └── api_findings.py      # Findings API
├── frontend/                # React application
│   ├── src/
│   │   ├── App.tsx         # Main application
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   └── aws-exports.js  # Amplify configuration
│   └── package.json
└── README.md               # This file
```

## 📊 API Reference

### Endpoints

- `GET /audit-runs` - List audit runs with filtering
- `POST /scan` - Trigger new compliance scan
- `GET /findings` - Retrieve compliance findings
- `PUT /findings/{id}` - Update finding status
- `GET /reports` - List generated reports

### Authentication

All API endpoints require Cognito JWT token in Authorization header:

```bash
curl -H "Authorization: Bearer <JWT_TOKEN>" \
     https://your-api.execute-api.region.amazonaws.com/dev/audit-runs
```

## 🔒 Security Features

- **Least Privilege IAM**: All resources use minimal required permissions
- **Encryption at Rest**: All data encrypted using AWS managed keys
- **Encryption in Transit**: HTTPS/TLS for all communications
- **Cognito Authentication**: Secure user authentication and authorization
- **CloudTrail Logging**: Complete audit trail of all actions
- **Private Resources**: No public S3 buckets or open security groups

## 📈 Monitoring & Observability

- **CloudWatch Dashboard**: Real-time compliance metrics and trends
- **Custom Alarms**: Automated alerts for critical findings
- **Log Aggregation**: Centralized logging across all components
- **Performance Metrics**: Lambda duration, error rates, and throughput

## 💰 Cost Optimization

SecureAuditAI is designed for minimal operational costs:

- **Serverless Architecture**: Pay only for actual usage
- **Free Tier Eligible**: Lambda, API Gateway, and DynamoDB free tiers
- **Efficient AI Usage**: Optimized Bedrock token usage
- **Auto-scaling**: Resources scale automatically with demand

Estimated monthly cost (dev environment): **$5-15**

## 🧪 Testing

### Running Tests

```bash
# Frontend tests
cd frontend
npm test

# Lambda function tests
cd lambda
python -m pytest

# AgentCore integration tests
cd agent
python -m pytest tests/
```

### Manual Testing

1. **Start a Compliance Scan**:
   - Navigate to Audit Control page
   - Configure scan parameters
   - Click "Start Compliance Scan"

2. **Review Findings**:
   - Go to Findings page
   - Filter by severity or resource type
   - Update finding status

3. **Generate Report**:
   - Visit Reports page
   - Click "Generate Report"
   - Download PDF when ready

## 🚨 Troubleshooting

### Common Issues

**AgentCore Runtime Not Starting**:
- Check ECR repository exists and image is pushed
- Verify IAM execution role has correct permissions
- Check CloudWatch logs for error details

**API Gateway 403 Errors**:
- Ensure Cognito user pool is correctly configured
- Verify JWT token format and expiration
- Check API Gateway authorizer settings

**Bedrock Access Denied**:
- Confirm Bedrock model access in AWS console
- Check IAM permissions for bedrock:InvokeModel
- Verify model ID is correct and available in region

## 📚 Additional Resources

- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Bedrock AgentCore SDK](https://github.com/aws/bedrock-agentcore-sdk-python)
- [AWS Serverless Best Practices](https://aws.amazon.com/serverless/)
- [React + TypeScript Guide](https://react-typescript-cheatsheet.netlify.app/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International License**.

### For Non-Commercial Use
- ✅ Educational use and research
- ✅ Personal projects and learning
- ✅ Sharing and adaptation for non-commercial purposes
- ✅ Attribution to original authors required

### For Commercial Use
- ❌ Commercial software development or services
- ❌ For-profit business applications
- ❌ Any use intended for commercial advantage

If you wish to use this software for commercial purposes, please contact the project maintainers for commercial licensing options.

See the [LICENSE](LICENSE) file for the full legal text and terms.

## 🙏 Acknowledgments

- Built with [Amazon Bedrock](https://aws.amazon.com/bedrock/)
- Powered by [Claude 3.5 Sonnet](https://anthropic.com/claude)
- Inspired by cybersecurity compliance challenges
- Thanks to the AWS serverless community

---

**Made with ❤️ for the hackathon community**
