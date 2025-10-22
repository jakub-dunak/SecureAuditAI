# AgentCore Architecture

## Overview

This document describes the deployment and usage of AWS Bedrock AgentCore in the SecureAuditAI system.

## Component Responsibilities

### 1. **GitHub Actions Workflow** (`.github/workflows/deploy.yml`)
**Role**: Deploy and configure AgentCore infrastructure

**Responsibilities**:
- Create AgentCore Memory with 3 strategies (Session, Semantic, User Preferences)
- Create AgentCore Gateway for tool integration
- Configure AgentCore Runtime using the Starter Toolkit CLI
- Launch AgentCore Runtime with Memory and Gateway IDs
- Store resource ARNs/IDs in SSM Parameter Store

**Why here?**: Infrastructure setup should be done once during deployment, not repeatedly at runtime.

### 2. **Lambda Functions** (`lambda/trigger_scan.py`, etc.)
**Role**: Invoke the deployed AgentCore Runtime

**Responsibilities**:
- Read AgentCore Runtime ARN from SSM
- Invoke the runtime with compliance audit requests
- Process streaming responses from AgentCore
- Handle errors and fallback to simulation if needed

**Permissions**:
- `bedrock-agentcore-runtime:InvokeAgent` - to call the agent
- `bedrock-agentcore-runtime:RetrieveAndGenerate` - to use RAG capabilities
- `ssm:GetParameter` - to fetch runtime ARN

**Why here?**: Lambda functions are the API layer that triggers audit scans by calling the agent.

### 3. **AgentCore Runtime** (deployed via `agentcore launch`)
**Role**: Execute the agent logic with Memory and Gateway

**Responsibilities**:
- Run the agent code from `agent/main.py`
- Store/retrieve memories across sessions
- Invoke external tools via Gateway
- Process compliance audit logic
- Return findings and recommendations

**Permissions** (via `AgentCoreRuntimeRole`):
- `bedrock:InvokeModel` - to call foundation models
- `bedrock-agentcore-runtime:*MemoryRecord` - to use Memory
- `bedrock-agent:InvokeGateway` - to use Gateway
- `dynamodb:*` - to access audit tables
- `s3:*` - to access reports bucket

**Why here?**: The runtime is where the actual AI agent executes with long-term memory and tool access.

### 4. **Setup Script** (`agent/setup_agentcore_resources.py`)
**Role**: Programmatically create Memory and Gateway resources

**Responsibilities**:
- Create AgentCore Memory with 3 memory strategies
- Create AgentCore Gateway with IAM authentication
- Store resource IDs in SSM Parameter Store
- Handle idempotency (don't recreate if exists)

**Why separate?**: Memory and Gateway cannot be created via CloudFormation, so we use boto3.

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions Deploy                     │
│                                                              │
│  1. Run setup_agentcore_resources.py                        │
│     ├─ Create Memory (Session, Semantic, User Prefs)       │
│     └─ Create Gateway (IAM Auth)                            │
│                                                              │
│  2. Configure AgentCore Runtime                             │
│     └─ agentcore configure --entrypoint agent/main.py       │
│                                                              │
│  3. Launch AgentCore Runtime                                │
│     └─ agentcore launch --env AGENTCORE_MEMORY_ID=...       │
│                          --env AGENTCORE_GATEWAY_ID=...      │
│                                                              │
│  4. Store Runtime ARN in SSM                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Deployment Complete
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Runtime - API Requests                      │
│                                                              │
│  API Gateway → Lambda (trigger_scan.py)                     │
│       │                                                      │
│       ├─ Get Runtime ARN from SSM                           │
│       └─ Invoke AgentCore Runtime                           │
│                  │                                           │
│                  ▼                                           │
│         ┌────────────────────┐                              │
│         │ AgentCore Runtime  │                              │
│         │                    │                              │
│         │ • Uses Memory      │────► STM/LTM/Preferences     │
│         │ • Uses Gateway     │────► External Tools          │
│         │ • Calls Bedrock    │────► Foundation Models       │
│         │ • Accesses DDB     │────► Audit Data              │
│         └────────────────────┘                              │
│                  │                                           │
│                  ▼                                           │
│         Return compliance findings                          │
└─────────────────────────────────────────────────────────────┘
```

## Memory Strategies

### 1. **Session Summarizer** (Short-Term Memory)
- **Purpose**: Remember conversation context within an audit session
- **Namespace**: `/summaries/{actorId}/{sessionId}`
- **Use Case**: "What did we discuss in the last scan?"

### 2. **Semantic Memory** (Long-Term Memory)
- **Purpose**: Store compliance framework knowledge and patterns
- **Namespace**: `/knowledge/compliance/{framework}`
- **Use Case**: "What issues have we seen with PCI-DSS before?"

### 3. **User Preference** (Persistent Settings)
- **Purpose**: Remember user audit configurations
- **Namespace**: `/preferences/{userId}`
- **Use Case**: "What are my default scan settings?"

## Gateway Usage

The Gateway provides secure access to external tools and services:

- **AWS Service Integration**: Call other AWS APIs securely
- **Third-Party APIs**: Connect to vulnerability databases, ticketing systems
- **Tool Invocation**: Enable agent to use external tools

## SSM Parameters

The following parameters are created during deployment:

```
/${STACK_NAME}/${ENVIRONMENT}/agentcore-memory-id
/${STACK_NAME}/${ENVIRONMENT}/agentcore-gateway-id
/${STACK_NAME}/${ENVIRONMENT}/agentcore-gateway-endpoint
/${STACK_NAME}/${ENVIRONMENT}/agentcore-runtime-arn
```

## Key Design Decisions

### ✅ **DO**: Deploy AgentCore resources in GitHub Actions
- Memory and Gateway are created once during deployment
- Runtime is launched with persistent infrastructure
- Resource IDs are stored in SSM for Lambda to reference

### ❌ **DON'T**: Create AgentCore resources in Lambda
- Lambda should only invoke the existing runtime
- Lambda doesn't have permissions to create Memory/Gateway
- Creating resources at runtime is inefficient and error-prone

### ✅ **DO**: Pass Memory/Gateway IDs as environment variables to Runtime
- Runtime receives `AGENTCORE_MEMORY_ID` and `AGENTCORE_GATEWAY_ID`
- Agent code uses these to initialize with memory and gateway
- Enables persistent learning across invocations

### ❌ **DON'T**: Hardcode resource IDs in Lambda or agent code
- IDs are generated during deployment
- Stored in SSM for dynamic retrieval
- Allows for environment-specific configurations

## Deployment Checklist

When deploying, ensure:

- [ ] `boto3` is installed (for setup script)
- [ ] `bedrock-agentcore-starter-toolkit` is installed
- [ ] Setup script creates Memory and Gateway successfully
- [ ] Memory ID, Gateway ID, and Endpoint are stored in SSM
- [ ] AgentCore Runtime is launched with environment variables
- [ ] Runtime ARN is stored in SSM
- [ ] Lambda has permissions to read from SSM
- [ ] Lambda has permissions to invoke AgentCore Runtime

## Troubleshooting

### Memory not working?
- Check if Memory ID is in SSM: `/${STACK_NAME}/${ENVIRONMENT}/agentcore-memory-id`
- Verify Runtime has `bedrock-agentcore-runtime:*MemoryRecord` permissions
- Ensure Memory ID is passed to `agentcore launch` via `--env`

### Gateway not accessible?
- Check if Gateway ID is in SSM: `/${STACK_NAME}/${ENVIRONMENT}/agentcore-gateway-id`
- Verify Runtime has `bedrock-agent:InvokeGateway` permissions
- Ensure Gateway ID is passed to `agentcore launch` via `--env`

### Lambda can't invoke agent?
- Check if Runtime ARN is in SSM: `/${STACK_NAME}/${ENVIRONMENT}/agentcore-runtime-arn`
- Verify Lambda has `bedrock-agentcore-runtime:InvokeAgent` permission
- Check Lambda logs for specific error messages

