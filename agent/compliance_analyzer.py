"""
Compliance analysis module for SecureAuditAI Agent
Uses Amazon Bedrock to analyze AWS resources against compliance frameworks
"""

import json
import boto3
import asyncio
from typing import Dict, List, Any
from datetime import datetime

class ComplianceAnalyzer:
    """Analyzes AWS resources against compliance frameworks using Bedrock"""

    def __init__(self):
        self.bedrock_runtime = boto3.client('bedrock-runtime')
        self.model_id = "amazon.titan-text-premier-v1:0"

    async def analyze_compliance(self, framework: str, resources: List[Dict], scan_config: Dict) -> List[Dict]:
        """
        Analyze resources against a specific compliance framework

        Args:
            framework: Compliance framework (GDPR, SOC2, PCI-DSS)
            resources: List of AWS resource configurations
            scan_config: Scan configuration parameters

        Returns:
            List of compliance findings
        """
        findings = []

        # Analyze each resource type
        for resource in resources:
            resource_findings = await self._analyze_resource(framework, resource, scan_config)
            findings.extend(resource_findings)

        return findings

    async def _analyze_resource(self, framework: str, resource: Dict, scan_config: Dict) -> List[Dict]:
        """Analyze a single resource against compliance requirements"""
        findings = []

        try:
            # Create compliance-specific prompts
            prompt = self._create_analysis_prompt(framework, resource, scan_config)

            # Invoke Bedrock model
            response = self.bedrock_runtime.invoke_model(
                modelId=self.model_id,
                contentType="application/json",
                accept="application/json",
                body=json.dumps({
                    "inputText": prompt,
                    "textGenerationConfig": {
                        "maxTokenCount": 2000,
                        "temperature": 0.1,
                        "topP": 0.9
                    }
                })
            )

            # Parse response
            response_body = json.loads(response['body'].read())
            # For Titan models, the response is directly in the results array
            analysis_result = json.loads(response_body['results'][0]['outputText'])

            # Convert analysis result to findings format
            findings = self._parse_analysis_result(framework, resource, analysis_result)

        except Exception as e:
            # Fallback to rule-based analysis if Bedrock fails
            findings = self._rule_based_analysis(framework, resource)

        return findings

    def _create_analysis_prompt(self, framework: str, resource: Dict, scan_config: Dict) -> str:
        """Create a detailed prompt for compliance analysis"""

        framework_requirements = {
            'GDPR': {
                'data_protection': 'Personal data must be protected with encryption at rest and in transit',
                'access_control': 'Access to personal data must be restricted to authorized personnel only',
                'data_minimization': 'Only necessary personal data should be collected and retained',
                'breach_notification': 'Data breaches must be reported within 72 hours'
            },
            'SOC2': {
                'security': 'Systems must protect against unauthorized access',
                'availability': 'Systems must be available for operation and use',
                'confidentiality': 'Information designated as confidential must be protected',
                'privacy': 'Personal information must be collected, used, retained, and disclosed appropriately'
            },
            'PCI-DSS': {
                'network_security': 'Firewalls must protect cardholder data environment',
                'data_protection': 'Cardholder data must be encrypted in transit and at rest',
                'access_control': 'Access to system components must be restricted',
                'vulnerability_management': 'Systems must be protected against malware and vulnerabilities'
            }
        }

        requirements = framework_requirements.get(framework, {})

        prompt = f"""
        You are a cybersecurity compliance expert analyzing AWS resources against {framework} requirements.

        COMPLIANCE FRAMEWORK: {framework}
        REQUIREMENTS TO CHECK:
        {json.dumps(requirements, indent=2)}

        RESOURCE TO ANALYZE:
        Type: {resource.get('type', 'Unknown')}
        ID: {resource.get('id', 'Unknown')}
        Configuration: {json.dumps(resource.get('config', {}), indent=2)}

        SCAN CONFIGURATION:
        {json.dumps(scan_config, indent=2)}

        Please analyze this resource and identify any compliance violations or risks. For each finding:

        1. Provide a clear title describing the issue
        2. Explain the specific requirement being violated
        3. Describe the current configuration that causes the issue
        4. Assess the severity (CRITICAL, HIGH, MEDIUM, LOW)
        5. Provide specific remediation steps
        6. Assign a risk score (0-100, where 100 is highest risk)

        Return your analysis as a JSON array of findings. If no issues are found, return an empty array.

        Example format:
        [
            {{
                "title": "S3 Bucket Public Access Violation",
                "description": "S3 bucket has public read access enabled, violating data protection requirements",
                "severity": "HIGH",
                "riskScore": 75,
                "remediationSteps": [
                    "Disable public access on S3 bucket",
                    "Review and update bucket policy",
                    "Enable S3 Block Public Access settings"
                ],
                "requirement": "Data Protection - Information must be protected against unauthorized access"
            }}
        ]
        """

        return prompt

    def _parse_analysis_result(self, framework: str, resource: Dict, analysis_result: Any) -> List[Dict]:
        """Parse Bedrock response into structured findings"""
        findings = []

        if isinstance(analysis_result, list):
            for finding in analysis_result:
                structured_finding = {
                    'title': finding.get('title', f'{framework} Compliance Issue'),
                    'description': finding.get('description', 'Compliance violation detected'),
                    'severity': finding.get('severity', 'MEDIUM'),
                    'resourceType': resource.get('type', 'Unknown'),
                    'resourceId': resource.get('id', 'Unknown'),
                    'complianceFrameworks': [framework],
                    'riskScore': finding.get('riskScore', 50),
                    'remediationSteps': finding.get('remediationSteps', []),
                    'requirement': finding.get('requirement', f'{framework} requirement'),
                    'createdAt': datetime.utcnow().isoformat()
                }
                findings.append(structured_finding)

        return findings

    def _rule_based_analysis(self, framework: str, resource: Dict) -> List[Dict]:
        """Fallback rule-based analysis for when Bedrock is unavailable"""
        findings = []
        resource_type = resource.get('type', '')
        config = resource.get('config', {})

        # S3 Bucket rules
        if resource_type == 'S3_BUCKET':
            if config.get('publicAccess', False):
                findings.append({
                    'title': f'S3 Bucket Public Access ({framework})',
                    'description': f'S3 bucket {resource.get("id")} has public access enabled',
                    'severity': 'HIGH',
                    'resourceType': resource_type,
                    'resourceId': resource.get('id'),
                    'complianceFrameworks': [framework],
                    'riskScore': 75,
                    'remediationSteps': [
                        'Disable public access on S3 bucket',
                        'Review bucket policy for public permissions',
                        'Enable S3 Block Public Access'
                    ],
                    'requirement': f'{framework}: Data protection requirements',
                    'createdAt': datetime.utcnow().isoformat()
                })

            if not config.get('encryption', False):
                findings.append({
                    'title': f'S3 Bucket Encryption ({framework})',
                    'description': f'S3 bucket {resource.get("id")} does not have encryption enabled',
                    'severity': 'MEDIUM',
                    'resourceType': resource_type,
                    'resourceId': resource.get('id'),
                    'complianceFrameworks': [framework],
                    'riskScore': 60,
                    'remediationSteps': [
                        'Enable S3 default encryption',
                        'Use AES-256 or AWS-KMS encryption'
                    ],
                    'requirement': f'{framework}: Encryption requirements',
                    'createdAt': datetime.utcnow().isoformat()
                })

        # EC2 Instance rules
        elif resource_type == 'EC2_INSTANCE':
            if config.get('publicIp', False):
                findings.append({
                    'title': f'EC2 Public IP Exposure ({framework})',
                    'description': f'EC2 instance {resource.get("id")} has a public IP address',
                    'severity': 'MEDIUM',
                    'resourceType': resource_type,
                    'resourceId': resource.get('id'),
                    'complianceFrameworks': [framework],
                    'riskScore': 50,
                    'remediationSteps': [
                        'Review security group configurations',
                        'Consider using private subnets',
                        'Implement proper network access controls'
                    ],
                    'requirement': f'{framework}: Network security requirements',
                    'createdAt': datetime.utcnow().isoformat()
                })

        # IAM Role rules
        elif resource_type == 'IAM_ROLE':
            permissions = config.get('permissions', [])
            if '*' in permissions:
                findings.append({
                    'title': f'Over-Privileged IAM Role ({framework})',
                    'description': f'IAM role {resource.get("id")} has wildcard permissions',
                    'severity': 'CRITICAL',
                    'resourceType': resource_type,
                    'resourceId': resource.get('id'),
                    'complianceFrameworks': [framework],
                    'riskScore': 90,
                    'remediationSteps': [
                        'Remove wildcard permissions',
                        'Apply principle of least privilege',
                        'Use specific IAM actions only'
                    ],
                    'requirement': f'{framework}: Least privilege requirements',
                    'createdAt': datetime.utcnow().isoformat()
                })

        # Lambda Function rules
        elif resource_type == 'LAMBDA_FUNCTION':
            env_vars = config.get('environmentVariables', {})
            sensitive_patterns = ['password', 'secret', 'key', 'token']
            has_sensitive = any(
                any(pattern in var_name.lower() for pattern in sensitive_patterns)
                for var_name in env_vars.keys()
            )

            if has_sensitive:
                findings.append({
                    'title': f'Sensitive Data in Lambda Environment ({framework})',
                    'description': f'Lambda function {resource.get("id")} contains sensitive data in environment variables',
                    'severity': 'HIGH',
                    'resourceType': resource_type,
                    'resourceId': resource.get('id'),
                    'complianceFrameworks': [framework],
                    'riskScore': 70,
                    'remediationSteps': [
                        'Remove sensitive data from environment variables',
                        'Use AWS Secrets Manager or Parameter Store',
                        'Update function configuration'
                    ],
                    'requirement': f'{framework}: Data protection requirements',
                    'createdAt': datetime.utcnow().isoformat()
                })

        return findings

# Global analyzer instance
analyzer = ComplianceAnalyzer()

async def analyze_compliance(framework: str, resources: List[Dict], scan_config: Dict) -> List[Dict]:
    """Convenience function to analyze compliance"""
    return await analyzer.analyze_compliance(framework, resources, scan_config)
