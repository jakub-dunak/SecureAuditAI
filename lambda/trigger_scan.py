"""
Lambda function to trigger compliance audit scans using Bedrock AgentCore
"""
import json
import os
import boto3
import uuid
from datetime import datetime
from decimal import Decimal

def lambda_handler(event, context):
    """
    Trigger a new compliance audit scan
    """
    try:
        # Initialize clients
        dynamodb = boto3.resource('dynamodb')
        bedrock_runtime = boto3.client('bedrock-runtime')
        bedrock_agent_runtime = boto3.client('bedrock-agent-runtime')

        # Get table references
        audit_runs_table = dynamodb.Table(os.environ['AUDIT_RUNS_TABLE'])
        findings_table = dynamodb.Table(os.environ['FINDINGS_TABLE'])
        snapshots_table = dynamodb.Table(os.environ['COMPLIANCE_SNAPSHOTS_TABLE'])

        # Parse event (could be from API Gateway, EventBridge, or direct invoke)
        body = {}
        if isinstance(event, dict) and 'body' in event:
            body = json.loads(event['body'])
        elif isinstance(event, dict):
            body = event

        # Extract parameters
        audit_run_id = body.get('auditRunId')
        compliance_frameworks = body.get('complianceFrameworks', ['GDPR', 'SOC2', 'PCI-DSS'])
        scan_config = body.get('scanConfig', {})

        # Create or use existing audit run
        if not audit_run_id:
            audit_run_id = str(uuid.uuid4())

            # Create audit run record
            audit_run = {
                'AuditRunId': audit_run_id,
                'Status': 'RUNNING',
                'CreatedAt': datetime.utcnow().isoformat(),
                'Environment': os.environ.get('ENVIRONMENT', 'dev'),
                'BedrockModelId': os.environ.get('BEDROCK_MODEL_ID', ''),
                'ComplianceFrameworks': compliance_frameworks,
                'ScanConfig': scan_config,
                'Progress': 0
            }

            audit_runs_table.put_item(Item=audit_run)
        else:
            # Update existing audit run status
            audit_runs_table.update_item(
                Key={'AuditRunId': audit_run_id},
                UpdateExpression='SET #status = :status, #updated = :updated',
                ExpressionAttributeNames={
                    '#status': 'Status',
                    '#updated': 'UpdatedAt'
                },
                ExpressionAttributeValues={
                    ':status': 'RUNNING',
                    ':updated': datetime.utcnow().isoformat()
                }
            )

        # TODO: Invoke Bedrock AgentCore Runtime here
        # This would typically involve:
        # 1. Invoking the AgentCore Runtime with the scan request
        # 2. Processing the response to extract findings
        # 3. Storing findings in DynamoDB

        # For now, simulate the scan process
        scan_results = simulate_compliance_scan(compliance_frameworks, scan_config)

        # Process scan results and store findings
        findings_count = 0
        for finding_data in scan_results.get('findings', []):
            finding = {
                'FindingId': f"finding-{audit_run_id}-{findings_count}",
                'AuditRunId': audit_run_id,
                'Title': finding_data['title'],
                'Description': finding_data['description'],
                'Severity': finding_data['severity'],
                'ResourceType': finding_data['resource_type'],
                'ResourceId': finding_data['resource_id'],
                'ComplianceFrameworks': finding_data['compliance_frameworks'],
                'Status': 'OPEN',
                'CreatedAt': datetime.utcnow().isoformat(),
                'UpdatedAt': datetime.utcnow().isoformat(),
                'RemediationSteps': finding_data.get('remediation_steps', []),
                'RiskScore': finding_data.get('risk_score', 50),
                'Tags': finding_data.get('tags', {}),
                'Metadata': finding_data.get('metadata', {})
            }

            findings_table.put_item(Item=finding)
            findings_count += 1

        # Create compliance snapshot
        snapshot = {
            'SnapshotId': f"snapshot-{audit_run_id}",
            'AuditRunId': audit_run_id,
            'ComplianceFramework': ', '.join(compliance_frameworks),
            'CreatedAt': datetime.utcnow().isoformat(),
            'TotalFindings': findings_count,
            'CriticalFindings': len([f for f in scan_results.get('findings', []) if f['severity'] == 'CRITICAL']),
            'HighFindings': len([f for f in scan_results.get('findings', []) if f['severity'] == 'HIGH']),
            'MediumFindings': len([f for f in scan_results.get('findings', []) if f['severity'] == 'MEDIUM']),
            'LowFindings': len([f for f in scan_results.get('findings', []) if f['severity'] == 'LOW']),
            'ComplianceScore': scan_results.get('compliance_score', 75),
            'Summary': scan_results.get('summary', 'Compliance scan completed')
        }

        snapshots_table.put_item(Item=snapshot)

        # Update audit run with completion status
        audit_runs_table.update_item(
            Key={'AuditRunId': audit_run_id},
            UpdateExpression='SET #status = :status, #completed = :completed, #findings = :findings',
            ExpressionAttributeNames={
                '#status': 'Status',
                '#completed': 'CompletedAt',
                '#findings': 'FindingsCount'
            },
            ExpressionAttributeValues={
                ':status': 'COMPLETED',
                ':completed': datetime.utcnow().isoformat(),
                ':findings': findings_count
            }
        )

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'auditRunId': audit_run_id,
                'status': 'COMPLETED',
                'findingsCount': findings_count,
                'message': f'Scan completed successfully with {findings_count} findings'
            })
        }

    except Exception as e:
        # Update audit run with error status if it exists
        if 'audit_run_id' in locals():
            try:
                audit_runs_table.update_item(
                    Key={'AuditRunId': audit_run_id},
                    UpdateExpression='SET #status = :status, #error = :error',
                    ExpressionAttributeNames={
                        '#status': 'Status',
                        '#error': 'ErrorMessage'
                    },
                    ExpressionAttributeValues={
                        ':status': 'ERROR',
                        ':error': str(e)
                    }
                )
            except:
                pass

        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Scan failed: {str(e)}'})
        }

def simulate_compliance_scan(compliance_frameworks, scan_config):
    """
    Simulate a compliance scan by generating mock findings
    In a real implementation, this would invoke Bedrock AgentCore
    """
    import random

    # Mock resource data
    mock_resources = [
        {
            'type': 'S3_BUCKET',
            'id': 'example-bucket-123',
            'config': {'public_access': True, 'encryption': False}
        },
        {
            'type': 'EC2_INSTANCE',
            'id': 'i-1234567890abcdef0',
            'config': {'security_groups': ['sg-12345'], 'public_ip': True}
        },
        {
            'type': 'IAM_ROLE',
            'id': 'overprivileged-role',
            'config': {'permissions': ['*'], 'attached_policies': ['AdministratorAccess']}
        },
        {
            'type': 'LAMBDA_FUNCTION',
            'id': 'vulnerable-function',
            'config': {'environment_variables': {'DB_PASSWORD': 'plaintext'}}
        }
    ]

    findings = []
    risk_scores = {'CRITICAL': 90, 'HIGH': 70, 'MEDIUM': 50, 'LOW': 30}

    for resource in mock_resources:
        # Generate random findings based on resource type
        if resource['type'] == 'S3_BUCKET' and resource['config']['public_access']:
            findings.append({
                'title': 'S3 Bucket Public Access Enabled',
                'description': f'S3 bucket {resource["id"]} has public access enabled, violating {", ".join(compliance_frameworks)} requirements',
                'severity': random.choice(['HIGH', 'CRITICAL']),
                'resource_type': resource['type'],
                'resource_id': resource['id'],
                'compliance_frameworks': compliance_frameworks,
                'remediation_steps': [
                    'Disable public access on S3 bucket',
                    'Review bucket policy',
                    'Enable S3 Block Public Access'
                ],
                'risk_score': risk_scores[random.choice(['HIGH', 'CRITICAL'])],
                'tags': {'resource': resource['type'], 'compliance': 'public-access'}
            })

        elif resource['type'] == 'EC2_INSTANCE' and resource['config']['public_ip']:
            findings.append({
                'title': 'EC2 Instance Public IP Exposure',
                'description': f'EC2 instance {resource["id"]} has a public IP address, potentially violating {", ".join(compliance_frameworks)}',
                'severity': random.choice(['MEDIUM', 'HIGH']),
                'resource_type': resource['type'],
                'resource_id': resource['id'],
                'compliance_frameworks': compliance_frameworks,
                'remediation_steps': [
                    'Review security group rules',
                    'Consider using private subnets',
                    'Implement proper access controls'
                ],
                'risk_score': risk_scores[random.choice(['MEDIUM', 'HIGH'])],
                'tags': {'resource': resource['type'], 'compliance': 'network-exposure'}
            })

        elif resource['type'] == 'IAM_ROLE' and '*' in resource['config']['permissions']:
            findings.append({
                'title': 'Over-Privileged IAM Role',
                'description': f'IAM role {resource["id"]} has wildcard permissions, violating least privilege principle in {", ".join(compliance_frameworks)}',
                'severity': 'CRITICAL',
                'resource_type': resource['type'],
                'resource_id': resource['id'],
                'compliance_frameworks': compliance_frameworks,
                'remediation_steps': [
                    'Review and remove wildcard permissions',
                    'Apply principle of least privilege',
                    'Use specific IAM actions only'
                ],
                'risk_score': 90,
                'tags': {'resource': resource['type'], 'compliance': 'least-privilege'}
            })

        elif resource['type'] == 'LAMBDA_FUNCTION' and 'DB_PASSWORD' in str(resource['config']):
            findings.append({
                'title': 'Sensitive Data in Lambda Environment Variables',
                'description': f'Lambda function {resource["id"]} contains sensitive data in environment variables, violating {", ".join(compliance_frameworks)}',
                'severity': 'HIGH',
                'resource_type': resource['type'],
                'resource_id': resource['id'],
                'compliance_frameworks': compliance_frameworks,
                'remediation_steps': [
                    'Remove sensitive data from environment variables',
                    'Use AWS Secrets Manager or Parameter Store',
                    'Update function configuration'
                ],
                'risk_score': 70,
                'tags': {'resource': resource['type'], 'compliance': 'data-protection'}
            })

    # Calculate compliance score (mock calculation)
    total_risk = sum(finding['risk_score'] for finding in findings)
    max_possible_risk = len(findings) * 100
    compliance_score = max(0, 100 - (total_risk / max(max_possible_risk, 1)) * 100)

    return {
        'findings': findings,
        'compliance_score': round(compliance_score, 1),
        'summary': f'Found {len(findings)} compliance issues across {len(mock_resources)} resources',
        'scanned_resources': len(mock_resources),
        'compliance_frameworks': compliance_frameworks
    }